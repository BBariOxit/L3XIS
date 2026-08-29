"use client"

import * as React from "react"
import { motion } from "framer-motion"
import type { VocabWord } from "@/store/vocab-store"

// ─── Mastery config ───────────────────────────────────────

const MASTERY_DOT: Record<number, string> = {
  0: "bg-muted-foreground/30",
  1: "bg-red-500",
  2: "bg-yellow-500",
  3: "bg-blue-500",
  4: "bg-green-500",
}

const MASTERY_LABEL: Record<number, string> = {
  0: "New",
  1: "Beginner",
  2: "Learning",
  3: "Familiar",
  4: "Mastered",
}

const POS_COLOR: Record<string, string> = {
  noun:        "bg-blue-500/10   text-blue-400",
  verb:        "bg-green-500/10  text-green-400",
  adjective:   "bg-violet-500/10 text-violet-400",
  adverb:      "bg-amber-500/10  text-amber-400",
  preposition: "bg-rose-500/10   text-rose-400",
}
const posColor = (p: string) =>
  POS_COLOR[p?.toLowerCase()] ?? "bg-muted/60 text-muted-foreground"

// ─── Component ────────────────────────────────────────────

interface WordRowProps {
  word: VocabWord
  isSelected: boolean
  onSelect: (word: VocabWord) => void
  index: number
}

export function WordRow({ word, isSelected, onSelect, index }: WordRowProps) {
  const dotColor = MASTERY_DOT[word.masteryLevel] ?? MASTERY_DOT[0]
  const masteryLabel = MASTERY_LABEL[word.masteryLevel] ?? "New"

  // First meaning Vi for preview
  const previewVi =
    word.meanings && word.meanings.length > 0
      ? word.meanings[0].definitionVi
      : word.definitionVi ?? word.definition

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
      onClick={() => onSelect(word)}
      aria-label={`View details for ${word.word}`}
      aria-pressed={isSelected}
      className={`
        w-full text-left px-4 py-3 flex items-center gap-3 rounded-xl
        border transition-all duration-150 group
        ${isSelected
          ? "bg-primary/8 border-primary/20 shadow-sm"
          : "bg-card border-border/40 hover:border-border/80 hover:bg-card/80"
        }
      `}
    >
      {/* Mastery dot */}
      <span
        className={`shrink-0 size-2 rounded-full ${dotColor} transition-colors`}
        title={masteryLabel}
      />

      {/* Word + phonetic */}
      <div className="min-w-0 w-[120px] shrink-0">
        <span className={`text-sm font-semibold capitalize truncate block ${isSelected ? "text-primary" : "text-foreground"}`}>
          {word.word}
        </span>
        {word.phonetic && (
          <span className="text-[10px] font-mono text-muted-foreground/50 block truncate leading-tight">
            {word.phonetic}
          </span>
        )}
      </div>

      {/* POS badge */}
      <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full hidden sm:inline-block ${posColor(word.partOfSpeech)}`}>
        {word.partOfSpeech}
      </span>

      {/* Definition preview */}
      <p className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
        {previewVi}
      </p>

      {/* Synonyms count hint */}
      {word.synonyms.length > 0 && (
        <span className="shrink-0 text-[10px] text-muted-foreground/40 hidden lg:block">
          {word.synonyms.length} syn
        </span>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <span className="shrink-0 size-1.5 rounded-full bg-primary" />
      )}
    </motion.button>
  )
}
