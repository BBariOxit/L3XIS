"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, SlidersHorizontal, X } from "lucide-react"
import { useVocabStore } from "@/store/vocab-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"
import { WordRow } from "@/components/vocabulary/word-row"
import { WordDetailPanel } from "@/components/vocabulary/word-detail-panel"
import { Input } from "@/components/ui/input"
import type { VocabWord } from "@/store/vocab-store"

// ─── Mastery config (for stats bar) ─────────────────────

const MASTERY = [
  { label: "New",      color: "text-muted-foreground",     bg: "bg-muted/60",        dot: "bg-muted-foreground/40" },
  { label: "Beginner", color: "text-red-400",              bg: "bg-red-500/10",       dot: "bg-red-500" },
  { label: "Learning", color: "text-yellow-400",           bg: "bg-yellow-500/10",    dot: "bg-yellow-500" },
  { label: "Familiar", color: "text-blue-400",             bg: "bg-blue-500/10",      dot: "bg-blue-500" },
  { label: "Mastered", color: "text-green-400",            bg: "bg-green-500/10",     dot: "bg-green-500" },
]

const POS_COLORS: Record<string, string> = {
  noun:        "bg-blue-500/10   text-blue-400",
  verb:        "bg-green-500/10  text-green-400",
  adjective:   "bg-violet-500/10 text-violet-400",
  adverb:      "bg-amber-500/10  text-amber-400",
  preposition: "bg-rose-500/10   text-rose-400",
}
const posColor = (p: string) =>
  POS_COLORS[p?.toLowerCase()] ?? "bg-muted/60 text-muted-foreground"

// ─── Sort options ─────────────────────────────────────────

type SortKey = "addedAt" | "word" | "mastery"

function sortWords(words: VocabWord[], key: SortKey): VocabWord[] {
  return [...words].sort((a, b) => {
    if (key === "word")    return a.word.localeCompare(b.word)
    if (key === "mastery") return b.masteryLevel - a.masteryLevel
    // addedAt desc (newest first)
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  })
}

// ─── Skeleton row ─────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="px-4 py-3 flex items-center gap-3 rounded-xl bg-card border border-border/30 animate-pulse">
      <div className="size-2 rounded-full bg-muted/60 shrink-0" />
      <div className="w-24 h-3.5 rounded-md bg-muted/60" />
      <div className="w-12 h-4 rounded-full bg-muted/40 hidden sm:block" />
      <div className="flex-1 h-3 rounded-md bg-muted/30" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────

const FILTER_ALL = "all"

export default function VocabularyPage() {
  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const [query, setQuery]               = React.useState("")
  const [posFilter, setPosFilter]       = React.useState(FILTER_ALL)
  const [masteryFilter, setMasteryFilter] = React.useState<number | null>(null)
  const [sortKey, setSortKey]           = React.useState<SortKey>("addedAt")
  const [showFilters, setShowFilters]   = React.useState(false)
  const [selectedWord, setSelectedWord] = React.useState<VocabWord | null>(null)

  const isMobile    = useIsMobile()
  const words       = useVocabStore((s) => s.words)
  const isLoading   = useVocabStore((s) => s.isLoading)
  const removeWord  = useVocabStore((s) => s.removeWord)

  // ── Derived POS options ──────────────────────────────────
  const posOptions = React.useMemo(() => {
    const set = new Set(words.map((w) => w.partOfSpeech?.toLowerCase()).filter(Boolean))
    return Array.from(set).sort()
  }, [words])

  // ── Filter + sort ────────────────────────────────────────
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase()
    const raw = words.filter((w) => {
      const matchQuery =
        !q ||
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        (w.definitionVi?.toLowerCase().includes(q) ?? false) ||
        (w.meanings?.some((m) => m.definitionVi.toLowerCase().includes(q)) ?? false)
      const matchPos     = posFilter === FILTER_ALL || w.partOfSpeech?.toLowerCase() === posFilter
      const matchMastery = masteryFilter === null  || w.masteryLevel === masteryFilter
      return matchQuery && matchPos && matchMastery
    })
    return sortWords(raw, sortKey)
  }, [words, query, posFilter, masteryFilter, sortKey])

  // ── Sync selectedWord with filtered (deselect if filtered out) ──
  React.useEffect(() => {
    if (selectedWord && !filtered.find((w) => w.id === selectedWord.id)) {
      setSelectedWord(null)
    }
  }, [filtered, selectedWord])

  // ── Handle delete ────────────────────────────────────────
  function handleDelete(id: string) {
    if (selectedWord?.id === id) setSelectedWord(null)
    removeWord(id)
  }

  const hasFilters = posFilter !== FILTER_ALL || masteryFilter !== null || sortKey !== "addedAt"

  return (
    <>
      {/*
        ──────────────────────────────────────────────────────
        Layout: full-height flex column
        ──────────────────────────────────────────────────────
      */}
      <div className="h-full flex flex-col gap-4 max-w-6xl mx-auto">

        {/* ── Top bar ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-3 flex-wrap"
        >
          {/* Title + count */}
          <div className="mr-auto">
            <h1 className="text-lg font-bold text-foreground leading-none">Vocabulary</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {words.length} word{words.length !== 1 ? "s" : ""}
              {filtered.length !== words.length && ` · ${filtered.length} shown`}
            </p>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              id="vocab-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-9 rounded-xl border-border/50 bg-muted/30 focus:bg-background text-sm"
              aria-label="Search vocabulary"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            id="vocab-filter-btn"
            onClick={() => setShowFilters((v) => !v)}
            className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium border transition-all duration-150 ${
              hasFilters || showFilters
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {hasFilters && <span className="size-1.5 rounded-full bg-primary" />}
          </button>

          {/* Add word */}
          <button
            id="vocab-add-word-button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-150 whitespace-nowrap"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Add word</span>
            <span className="sm:hidden">Add</span>
          </button>
        </motion.div>

        {/* ── Filter panel ─────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
                {/* Mastery filter */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">Mastery</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setMasteryFilter(null)}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                        masteryFilter === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    {MASTERY.map((m, i) => {
                      const count = words.filter((w) => w.masteryLevel === i).length
                      if (count === 0) return null
                      return (
                        <button
                          key={m.label}
                          onClick={() => setMasteryFilter(masteryFilter === i ? null : i)}
                          className={`h-7 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                            masteryFilter === i ? `${m.bg} ${m.color}` : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${m.dot}`} />
                          {m.label} <span className="opacity-60">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Divider */}
                {posOptions.length > 0 && <div className="w-px bg-border/30 self-stretch hidden sm:block" />}

                {/* POS filter */}
                {posOptions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">Part of speech</p>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => setPosFilter(FILTER_ALL)}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                          posFilter === FILTER_ALL ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All
                      </button>
                      {posOptions.map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setPosFilter(posFilter === pos ? FILTER_ALL : pos)}
                          className={`h-7 px-2.5 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                            posFilter === pos
                              ? posColor(pos)
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="w-px bg-border/30 self-stretch hidden sm:block" />

                {/* Sort */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">Sort by</p>
                  <div className="flex gap-1.5">
                    {(["addedAt", "word", "mastery"] as SortKey[]).map((k) => (
                      <button
                        key={k}
                        onClick={() => setSortKey(k)}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                          sortKey === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {k === "addedAt" ? "Recent" : k === "word" ? "A–Z" : "Mastery"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                {hasFilters && (
                  <button
                    onClick={() => { setPosFilter(FILTER_ALL); setMasteryFilter(null); setSortKey("addedAt") }}
                    className="ml-auto self-end h-7 px-2.5 rounded-lg text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main area: list + panel ───────────────────── */}
        <div className="flex-1 min-h-0 flex gap-4">

          {/* ── Word list ────────────────────────────── */}
          <div className={`flex flex-col min-h-0 ${selectedWord && !isMobile ? "flex-1" : "w-full"}`}>

            {isLoading && words.length === 0 ? (
              /* Loading skeleton */
              <div className="space-y-1.5">
                {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
              </div>

            ) : filtered.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center"
              >
                <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center text-3xl">
                  {words.length === 0 ? "📚" : "🔍"}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {words.length === 0 ? "No words yet" : "No matches found"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {words.length === 0
                      ? "Add your first word to get started"
                      : "Try adjusting your search or filters"}
                  </p>
                </div>
                {words.length === 0 && (
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all"
                  >
                    <Plus className="size-3.5" />
                    Add your first word
                  </button>
                )}
              </motion.div>

            ) : (
              /* Word rows */
              <div className="overflow-y-auto space-y-1 pr-0.5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((word, i) => (
                    <WordRow
                      key={word.id}
                      word={word}
                      index={i}
                      isSelected={selectedWord?.id === word.id}
                      onSelect={(w) => {
                        // Toggle off on mobile if same word
                        if (isMobile && selectedWord?.id === w.id) {
                          setSelectedWord(null)
                        } else {
                          setSelectedWord(w)
                        }
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Bottom padding for mobile FAB */}
                <div className="h-20 sm:hidden" />
              </div>
            )}
          </div>

          {/* ── Desktop side panel ───────────────────── */}
          {!isMobile && (
            <AnimatePresence>
              {selectedWord && (
                <motion.aside
                  key="side-panel"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="w-[340px] h-full rounded-xl border border-border/50 bg-card p-5 overflow-y-auto">
                    <WordDetailPanel
                      word={selectedWord}
                      onClose={() => setSelectedWord(null)}
                      onDelete={handleDelete}
                      mobile={false}
                    />
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Mobile bottom sheet (tap a word row) ─────── */}
      {isMobile && (
        <WordDetailPanel
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onDelete={handleDelete}
          mobile={true}
        />
      )}

      {/* ── Mobile FAB ─────────────────────────────── */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-150 flex items-center justify-center z-40"
        aria-label="Add new word"
      >
        <Plus className="size-5" />
      </button>

      <AddWordModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}
