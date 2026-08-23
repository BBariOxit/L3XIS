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
  { label: "Beginner", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  { label: "Learning", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
  { label: "Familiar", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  { label: "Mastered", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
]

// ─── Word Card ────────────────────────────────────────────

function WordCard({ word, onDelete }: { word: VocabWord; onDelete: (id: string) => void }) {
  const mastery = MASTERY[word.masteryLevel] ?? MASTERY[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group rounded-2xl border border-border/50 bg-card p-4 hover:border-border hover:shadow-md transition-all duration-300 space-y-3"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-foreground">{word.word}</h3>
            <span className="text-xs font-mono text-muted-foreground">{word.phonetic}</span>
          </div>
          <span className="text-xs text-muted-foreground/70">{word.partOfSpeech}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${mastery.bg} ${mastery.color}`}>
            {mastery.label}
          </span>
          <button
            onClick={() => onDelete(word.id)}
            className="opacity-0 group-hover:opacity-100 size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
            aria-label={`Delete ${word.word}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Definition */}
      <p className="text-sm text-foreground/80 leading-relaxed">{word.definition}</p>

      {/* Example */}
      {word.examples[0] && (
        <div className="pl-3 border-l-2 border-primary/25 space-y-0.5">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            &ldquo;{word.examples[0].sentence}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground/60">{word.examples[0].translation}</p>
        </div>
      )}

      {/* Synonyms + actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {word.synonyms.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label={`Pronounce ${word.word}`}
          >
            <Volume2 className="size-3.5" />
          </button>
          <button
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors"
            aria-label={`Star ${word.word}`}
          >
            <Star className="size-3.5" />
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">My Vocabulary</h1>
            <p className="text-sm text-muted-foreground">{words.length} words collected</p>
          </div>

          <button
            id="vocab-add-word-button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 self-start sm:self-auto whitespace-nowrap"
          >
            <Plus className="size-4" />
            Add Word
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words or definitions..."
            className="pl-10 h-10 rounded-xl border-border/60 bg-muted/30 focus:bg-background"
            aria-label="Search vocabulary"
          />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
        >
          {MASTERY.map((m) => {
            const count = words.filter((w) => MASTERY[w.masteryLevel]?.label === m.label).length
            return (
              <div
                key={m.label}
                className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-xl ${m.bg} border border-border/30`}
              >
                <span className={`text-xs font-semibold ${m.color}`}>{count}</span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            )
          })}
        </motion.div>

        {/* Word list */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <BookIcon />
            <p className="mt-4 text-sm font-medium">
              {query ? "No words match your search" : "No words yet"}
            </p>
            <p className="text-xs mt-1">
              {!query && "Click \"Add Word\" to start building your vocabulary"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((w) => (
              <WordCard key={w.id} word={w} onDelete={removeWord} />
            ))}
          </div>
        )}
      </div>

      {/* FAB — mobile */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden size-14 rounded-full gradient-primary text-white shadow-xl hover:opacity-90 active:scale-95 transition-all duration-150 flex items-center justify-center glow-primary z-40"
        aria-label="Add new word"
      >
        <Plus className="size-6" />
      </button>

      <AddWordModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}

function BookIcon() {
  return (
    <div className="mx-auto size-12 rounded-2xl bg-muted flex items-center justify-center">
      <svg className="size-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    </div>
  )
}
