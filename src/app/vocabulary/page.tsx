"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Trash2, Volume2 } from "lucide-react"
import { useVocabStore } from "@/store/vocab-store"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"
import { Input } from "@/components/ui/input"
import type { VocabWord } from "@/store/vocab-store"

// --- Mastery config ---

const MASTERY = [
  { label: "New",      color: "text-muted-foreground",                       bg: "bg-muted" },
  { label: "Beginner", color: "text-red-600 dark:text-red-400",              bg: "bg-red-50 dark:bg-red-500/10" },
  { label: "Learning", color: "text-yellow-600 dark:text-yellow-400",        bg: "bg-yellow-50 dark:bg-yellow-500/10" },
  { label: "Familiar", color: "text-blue-600 dark:text-blue-400",            bg: "bg-blue-50 dark:bg-blue-500/10" },
  { label: "Mastered", color: "text-green-600 dark:text-green-400",          bg: "bg-green-50 dark:bg-green-500/10" },
]

const POS_COLOR: Record<string, string> = {
  noun:        "bg-blue-500/10   text-blue-500",
  verb:        "bg-green-500/10  text-green-600 dark:text-green-400",
  adjective:   "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  adverb:      "bg-amber-500/10  text-amber-600 dark:text-amber-400",
  preposition: "bg-rose-500/10   text-rose-600 dark:text-rose-400",
}
const posColor = (p: string) =>
  POS_COLOR[p?.toLowerCase()] ?? "bg-muted text-muted-foreground"

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = "en-US"
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}

// --- Word Card ---

function WordCard({
  word,
  onDelete,
}: {
  word: VocabWord
  onDelete: (id: string) => void
}) {
  const mastery = MASTERY[word.masteryLevel] ?? MASTERY[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all duration-200"
    >
      <div className="p-4 space-y-2.5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground capitalize">{word.word}</h3>
              <span className="text-xs font-mono text-muted-foreground/60">{word.phonetic}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${posColor(word.partOfSpeech)}`}>
              {word.partOfSpeech}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${mastery.bg} ${mastery.color}`}>
              {mastery.label}
            </span>
            <button
              onClick={() => onDelete(word.id)}
              className="opacity-0 group-hover:opacity-100 size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-150"
              aria-label={`Delete ${word.word}`}
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        </div>

        {/* Definition EN */}
        <p className="text-xs text-foreground/80 leading-relaxed">{word.definition}</p>

        {/* Definition VI */}
        {word.definitionVi && (
          <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-2.5">
            {word.definitionVi}
          </p>
        )}

        {/* Synonyms */}
        {word.synonyms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {word.synonyms.slice(0, 4).map((s) => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3">
        <button
          onClick={() => speak(word.word)}
          className="size-7 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:bg-primary/8 transition-colors"
          aria-label={`Pronounce ${word.word}`}
        >
          <Volume2 className="size-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// --- Page ---

const FILTER_ALL = "all"

export default function VocabularyPage() {
  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [posFilter, setPosFilter] = React.useState(FILTER_ALL)
  const words = useVocabStore((s) => s.words)
  const isLoading = useVocabStore((s) => s.isLoading)
  const removeWord = useVocabStore((s) => s.removeWord)

  const posOptions = React.useMemo(() => {
    const set = new Set(words.map((w) => w.partOfSpeech?.toLowerCase()).filter(Boolean))
    return Array.from(set).sort()
  }, [words])

  const filtered = words.filter((w) => {
    const matchQuery =
      w.word.toLowerCase().includes(query.toLowerCase()) ||
      w.definition.toLowerCase().includes(query.toLowerCase()) ||
      (w.definitionVi?.toLowerCase().includes(query.toLowerCase()) ?? false)
    const matchPos = posFilter === FILTER_ALL || w.partOfSpeech?.toLowerCase() === posFilter
    return matchQuery && matchPos
  })

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">Vocabulary</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {words.length} word{words.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <button
            id="vocab-add-word-button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 whitespace-nowrap"
          >
            <Plus className="size-3.5" />
            Add word
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search word, definition, or Vietnamese meaning..."
            className="pl-9 h-9 rounded-xl border-border/60 bg-muted/30 focus:bg-background text-sm"
            aria-label="Search vocabulary"
          />
        </motion.div>

        {/* Mastery stats + POS filter */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="flex gap-2 flex-wrap"
        >
          {MASTERY.map((m) => {
            const count = words.filter((w) => MASTERY[w.masteryLevel]?.label === m.label).length
            if (count === 0) return null
            return (
              <div
                key={m.label}
                className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg ${m.bg} border border-border/20`}
              >
                <span className={`text-xs font-bold tabular-nums ${m.color}`}>{count}</span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            )
          })}

          {posOptions.length > 0 && (
            <div className="flex gap-1.5 ml-auto flex-wrap">
              <button
                onClick={() => setPosFilter(FILTER_ALL)}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                  posFilter === FILTER_ALL
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
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
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Word list */}
        {isLoading && words.length === 0 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">
              {query || posFilter !== FILTER_ALL ? "No words match your filter" : "No words yet — add one!"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {filtered.map((w) => (
                <WordCard key={w.id} word={w} onDelete={removeWord} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

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
