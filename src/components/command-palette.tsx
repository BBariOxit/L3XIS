"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, BookOpen, Home, Layers, Gamepad2, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useVocabStore } from "@/store/vocab-store"

// ─── Types ────────────────────────────────────────────────

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  category: "page" | "word"
}

// ─── Component ────────────────────────────────────────────

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onAddWord?: () => void
}

export function CommandPalette({ open, onClose, onAddWord }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState(0)
  const router = useRouter()
  const words = useVocabStore((s) => s.words)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Reset on open
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("")
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  // Static page items
  const pageItems: CommandItem[] = [
    { id: "home", label: "Home", description: "Dashboard", icon: Home, action: () => { router.push("/"); onClose() }, category: "page" },
    { id: "vocab", label: "Vocabulary", description: "My word list", icon: BookOpen, action: () => { router.push("/vocabulary"); onClose() }, category: "page" },
    { id: "collections", label: "Collections", description: "Word groups", icon: Layers, action: () => { router.push("/collections"); onClose() }, category: "page" },
    { id: "games", label: "Games", description: "Practice modes", icon: Gamepad2, action: () => { router.push("/study/games"); onClose() }, category: "page" },
  ]

  // Dynamic word items from store
  const wordItems: CommandItem[] = words
    .filter((w) => w.word.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map((w) => ({
      id: w.id,
      label: w.word,
      description: w.definition,
      icon: BookOpen,
      action: () => { router.push("/vocabulary"); onClose() },
      category: "word" as const,
    }))

  const filteredPages = query
    ? pageItems.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
    : pageItems

  const allItems = [...filteredPages, ...wordItems]

  // Keyboard navigation
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, allItems.length - 1)) }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === "Enter" && allItems[selected]) { allItems[selected].action() }
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allItems, selected, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-border/40">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                placeholder="Search pages or words..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                aria-label="Search command palette"
              />
              <button
                onClick={onClose}
                className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {allItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                <>
                  {/* Pages section */}
                  {filteredPages.length > 0 && (
                    <div>
                      {query === "" && (
                        <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                          Pages
                        </p>
                      )}
                      {filteredPages.map((item, i) => (
                        <CommandRow
                          key={item.id}
                          item={item}
                          isSelected={selected === i}
                          onHover={() => setSelected(i)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Words section */}
                  {wordItems.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Vocabulary
                      </p>
                      {wordItems.map((item, i) => (
                        <CommandRow
                          key={item.id}
                          item={item}
                          isSelected={selected === filteredPages.length + i}
                          onHover={() => setSelected(filteredPages.length + i)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 text-[10px] text-muted-foreground/60">
              <div className="flex items-center gap-3">
                <span><kbd className="font-sans">↑↓</kbd> navigate</span>
                <span><kbd className="font-sans">↵</kbd> select</span>
                <span><kbd className="font-sans">Esc</kbd> close</span>
              </div>
              {onAddWord && (
                <button
                  onClick={() => { onClose(); onAddWord() }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span>Add word</span>
                  <ArrowRight className="size-3" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Row sub-component ────────────────────────────────────

function CommandRow({
  item,
  isSelected,
  onHover,
}: {
  item: CommandItem
  isSelected: boolean
  onHover: () => void
}) {
  const Icon = item.icon

  return (
    <button
      onClick={item.action}
      onMouseEnter={onHover}
      className={[
        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
        isSelected ? "bg-primary/8 text-foreground" : "text-foreground/80 hover:bg-muted/50",
      ].join(" ")}
    >
      <div className={["size-7 rounded-lg flex items-center justify-center shrink-0", isSelected ? "bg-primary/15" : "bg-muted"].join(" ")}>
        <Icon className={["size-3.5", isSelected ? "text-primary" : "text-muted-foreground"].join(" ")} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{item.label}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
      </div>
      {isSelected && <ArrowRight className="size-3.5 text-primary shrink-0" />}
    </button>
  )
}
