"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Search, Plus, Trash2, Volume2, Star } from "lucide-react"
import { useVocabStore } from "@/store/vocab-store"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"
import { Input } from "@/components/ui/input"
import type { VocabWord } from "@/store/vocab-store"

// ─── Mastery config ───────────────────────────────────────

const MASTERY = [
  { label: "New", color: "text-muted-foreground", bg: "bg-muted" },
  { label: "Beginner", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
  { label: "Learning", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
  { label: "Familiar", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { label: "Mastered", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
]

// ─── Word Card ────────────────────────────────────────────

function WordCard({ word, onDelete }: { word: VocabWord; onDelete: (id: string) => void }) {
  const mastery = MASTERY[word.masteryLevel] ?? MASTERY[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="group rounded-xl border border-border/60 bg-card p-4 hover:border-border hover:shadow-sm transition-all duration-200 space-y-2.5"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">{word.word}</h3>
            <span className="text-xs font-mono text-muted-foreground/70">{word.phonetic}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
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

      {/* Definition */}
      <p className="text-xs text-foreground/75 leading-relaxed">{word.definition}</p>

      {/* Example */}
      {word.examples[0] && (
        <p className="text-xs text-muted-foreground italic pl-2.5 border-l-2 border-border leading-relaxed">
          &ldquo;{word.examples[0].sentence}&rdquo;
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex flex-wrap gap-1">
          {word.synonyms.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            className="size-6 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:bg-primary/8 transition-colors"
            aria-label={`Pronounce ${word.word}`}
          >
            <Volume2 className="size-3" />
          </button>
          <button
            className="size-6 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-yellow-500 hover:bg-yellow-500/8 transition-colors"
            aria-label={`Star ${word.word}`}
          >
            <Star className="size-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────

export default function VocabularyPage() {
  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const words = useVocabStore((s) => s.words)
  const removeWord = useVocabStore((s) => s.removeWord)

  const filtered = words.filter(
    (w) =>
      w.word.toLowerCase().includes(query.toLowerCase()) ||
      w.definition.toLowerCase().includes(query.toLowerCase())
  )

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
          <h1 className="text-xl font-bold text-foreground">Vocabulary</h1>
          <button
            id="vocab-add-word-button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 whitespace-nowrap"
          >
            <Plus className="size-3.5" />
            Add
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
            placeholder="Search..."
            className="pl-9 h-9 rounded-xl border-border/60 bg-muted/30 focus:bg-background text-sm"
            aria-label="Search vocabulary"
          />
        </motion.div>

        {/* Mastery filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {MASTERY.map((m) => {
            const count = words.filter((w) => MASTERY[w.masteryLevel]?.label === m.label).length
            return (
              <div
                key={m.label}
                className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg ${m.bg} border border-border/20`}
              >
                <span className={`text-xs font-semibold ${m.color}`}>{count}</span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            )
          })}
        </motion.div>

        {/* Word list */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {query ? "No words found" : "No words yet — add one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filtered.map((w) => (
              <WordCard key={w.id} word={w} onDelete={removeWord} />
            ))}
          </div>
        )}
      </div>

      {/* FAB — mobile */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden size-13 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-150 flex items-center justify-center z-40"
        aria-label="Add new word"
      >
        <Plus className="size-5" />
      </button>

      <AddWordModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}
