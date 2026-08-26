"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, Plus } from "lucide-react"
import { useVocabStore } from "@/store/vocab-store"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"

// ─── Animation helpers ────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
}

// ─── Greeting ─────────────────────────────────────────────

function useGreeting() {
  const [text, setText] = React.useState("Welcome back")
  React.useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setText("Good morning")
    else if (h < 18) setText("Good afternoon")
    else setText("Good evening")
  }, [])
  return text
}

// ─── Word count badge ─────────────────────────────────────

function WordCountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      {count} word{count !== 1 ? "s" : ""} saved
    </span>
  )
}

// ─── Suggestion chips ─────────────────────────────────────

const SUGGESTIONS = [
  "ephemeral", "resilience", "serendipity",
  "ubiquitous", "eloquent", "meticulous",
]

// ─── Page ─────────────────────────────────────────────────

export default function HomePage() {
  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const greeting = useGreeting()
  const { words, fetchWords, isLoading } = useVocabStore()

  // Load words from MongoDB on first mount
  React.useEffect(() => {
    fetchWords()
  }, [fetchWords])

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-10 py-4">

        {/* ── Greeting ── */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-base text-muted-foreground">
            Expand your vocabulary, one word at a time.
          </p>
        </motion.div>

        {/* ── Add Word Hero ── */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="px-6 pt-6 pb-5 space-y-1 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Add a new word
                </h2>
                <WordCountBadge count={words.length} />
              </div>
              <p className="text-sm text-muted-foreground pl-10">
                Type any English word — AI generates phonetic, definition (EN + VI),
                examples, and synonyms instantly.
              </p>
            </div>

            {/* Card body */}
            <div className="px-6 py-5 space-y-4">
              {/* Big CTA button */}
              <button
                id="add-word-button"
                onClick={() => setAddModalOpen(true)}
                className="w-full flex items-center gap-3 h-14 px-5 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground transition-all duration-200 group text-sm"
              >
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-150">
                  <Plus className="size-4 text-primary-foreground" />
                </div>
                <span className="flex-1 text-left font-medium">
                  Click to add a word…
                </span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/60 bg-background text-xs text-muted-foreground">
                  ⌘K
                </kbd>
              </button>

              {/* Suggestion chips */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Try one of these:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      id={`suggestion-${s}`}
                      onClick={() => setAddModalOpen(true)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-all duration-150 font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="px-6 pb-4">
                <p className="text-xs text-muted-foreground animate-pulse">
                  Loading your vocabulary from database…
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── How it works ── */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              step: "1",
              title: "Type a word",
              desc: "Enter any English word you want to learn",
            },
            {
              step: "2",
              title: "AI generates data",
              desc: "Gemini provides phonetic, definition EN + VI, examples & synonyms",
            },
            {
              step: "3",
              title: "Save & Study",
              desc: "Word is saved to your database and ready to review",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-border/50 bg-card p-4 space-y-2"
            >
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{item.step}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>

      </div>

      {/* FAB — mobile */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-150 flex items-center justify-center z-40"
        aria-label="Add new word"
        id="fab-add-word"
      >
        <Plus className="size-6" />
      </button>

      <AddWordModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}
