"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, Trash2, Star, X } from "lucide-react"
import type { VocabWord } from "@/store/vocab-store"

// ─── Helpers ──────────────────────────────────────────────

const MASTERY = [
  { label: "New",      color: "text-muted-foreground",          bg: "bg-muted/60",              bar: "bg-muted-foreground/30" },
  { label: "Beginner", color: "text-red-400",                   bg: "bg-red-500/10",             bar: "bg-red-500" },
  { label: "Learning", color: "text-yellow-400",                bg: "bg-yellow-500/10",          bar: "bg-yellow-500" },
  { label: "Familiar", color: "text-blue-400",                  bg: "bg-blue-500/10",            bar: "bg-blue-500" },
  { label: "Mastered", color: "text-green-400",                 bg: "bg-green-500/10",           bar: "bg-green-500" },
]

const POS_COLOR: Record<string, string> = {
  noun:        "bg-blue-500/10   text-blue-400",
  verb:        "bg-green-500/10  text-green-400",
  adjective:   "bg-violet-500/10 text-violet-400",
  adverb:      "bg-amber-500/10  text-amber-400",
  preposition: "bg-rose-500/10   text-rose-400",
}
const posColor = (p: string) =>
  POS_COLOR[p?.toLowerCase()] ?? "bg-muted/60 text-muted-foreground"

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = "en-US"
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}

// ─── Component ────────────────────────────────────────────

interface WordDetailPanelProps {
  word: VocabWord | null
  onClose: () => void
  onDelete: (id: string) => void
  /** true = renders as overlay (mobile), false = renders inline (desktop) */
  mobile?: boolean
}

export function WordDetailPanel({
  word,
  onClose,
  onDelete,
  mobile = false,
}: WordDetailPanelProps) {
  const [speaking, setSpeaking] = React.useState(false)

  const mastery = MASTERY[word?.masteryLevel ?? 0] ?? MASTERY[0]
  const masteryPct = ((word?.masteryLevel ?? 0) / 4) * 100

  const meanings =
    word?.meanings && word.meanings.length > 0
      ? word.meanings
      : word
        ? [{ partOfSpeech: word.partOfSpeech, definitionVi: word.definitionVi ?? word.definition }]
        : []

  const isPolysemous = meanings.length > 1

  function handleSpeak() {
    if (!word) return
    setSpeaking(true)
    speak(word.word)
    setTimeout(() => setSpeaking(false), 1200)
  }

  // ── Mobile overlay ─────────────────────────────────────
  if (mobile) {
    return (
      <AnimatePresence>
        {word && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            {/* Bottom sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl border border-border/50 shadow-2xl max-h-[85dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="px-6 pb-5 pt-2">
                <PanelContent
                  word={word}
                  mastery={mastery}
                  masteryPct={masteryPct}
                  meanings={meanings}
                  isPolysemous={isPolysemous}
                  speaking={speaking}
                  onSpeak={handleSpeak}
                  onDelete={onDelete}
                  onClose={onClose}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  // ── Desktop inline panel ────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {word ? (
        <motion.div
          key={word.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <PanelContent
            word={word}
            mastery={mastery}
            masteryPct={masteryPct}
            meanings={meanings}
            isPolysemous={isPolysemous}
            speaking={speaking}
            onSpeak={handleSpeak}
            onDelete={onDelete}
            onClose={onClose}
          />
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full flex flex-col items-center justify-center gap-3 text-center px-8"
        >
          <div className="size-14 rounded-2xl bg-muted/40 flex items-center justify-center text-2xl">
            📖
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a word to see its details
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Inner content (shared by both layouts) ───────────────

interface PanelContentProps {
  word: VocabWord
  mastery: typeof MASTERY[number]
  masteryPct: number
  meanings: { partOfSpeech: string; definitionVi: string }[]
  isPolysemous: boolean
  speaking: boolean
  onSpeak: () => void
  onDelete: (id: string) => void
  onClose: () => void
}

function PanelContent({
  word,
  mastery,
  masteryPct,
  meanings,
  isPolysemous,
  speaking,
  onSpeak,
  onDelete,
  onClose,
}: PanelContentProps) {
  return (
    <div className="space-y-5 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground capitalize leading-tight">
            {word.word}
          </h2>
          {word.phonetic && (
            <p className="text-sm font-mono text-muted-foreground/60 mt-0.5">
              {word.phonetic}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Close panel"
        >
          <X className="size-4" />
        </button>
      </div>


      {/* POS + Speak */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {isPolysemous
            ? meanings.map((m, i) => (
                <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-full ${posColor(m.partOfSpeech)}`}>
                  {m.partOfSpeech}
                </span>
              ))
            : (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${posColor(word.partOfSpeech)}`}>
                {word.partOfSpeech}
              </span>
            )
          }
        </div>
        <button
          onClick={onSpeak}
          className={`size-9 rounded-xl flex items-center justify-center transition-all duration-150 ${
            speaking
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          aria-label={`Pronounce ${word.word}`}
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      {/* Meanings */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/50">
          {isPolysemous ? "Meanings" : "Meaning"}
        </p>
        <div className="space-y-2.5">
          {meanings.map((m, i) => (
            <div key={i} className="flex gap-3 items-start">
              {isPolysemous && (
                <span className={`shrink-0 mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${posColor(m.partOfSpeech)}`}>
                  {m.partOfSpeech}
                </span>
              )}
              <p className="text-sm text-foreground leading-relaxed">
                {m.definitionVi}
              </p>
            </div>
          ))}
        </div>
      </div>


      {/* Synonyms */}
      {word.synonyms.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/50">Synonyms</p>
          <div className="flex flex-wrap gap-1.5">
            {word.synonyms.map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Added date */}
      <p className="text-[10px] text-muted-foreground/30 pt-2">
        Added {new Date(word.addedAt).toLocaleDateString("vi-VN")}
      </p>

      {/* Footer actions */}
      <div className="flex gap-2 pt-2 border-t border-border/30 mt-auto">
        <button
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs text-muted-foreground hover:text-amber-400 hover:bg-amber-500/8 transition-all duration-150"
          aria-label="Favourite"
        >
          <Star className="size-3.5" />
          Favourite
        </button>
        <button
          onClick={() => onDelete(word.id)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-150 ml-auto"
          aria-label={`Delete ${word.word}`}
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
