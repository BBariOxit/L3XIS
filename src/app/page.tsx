"use client"

import * as React from "react"
import { motion, type Variants } from "framer-motion"
import {
  Sparkles,
  BookOpen,
  Flame,
  Trophy,
  TrendingUp,
  CreditCard,
  Zap,
  Gamepad2,
  Plus,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useVocabStore } from "@/store/vocab-store"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"

// ─── Animation variants ───────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
}

// ─── Stat Card ────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  accent: string
  index: number
}

function StatCard({ label, value, icon: Icon, accent, index }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-5 overflow-hidden group hover:border-border hover:shadow-md transition-all duration-300"
    >
      <div className={`size-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
      <div className={`absolute -right-4 -bottom-4 size-20 rounded-full opacity-5 ${accent}`} />
    </motion.div>
  )
}

// ─── Study Mode Card ──────────────────────────────────────

interface StudyCardProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
  gradient: string
  index: number
}

function StudyCard({ title, description, icon: Icon, href, gradient, index }: StudyCardProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 hover:border-border hover:shadow-md transition-all duration-300"
      >
        <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${gradient}`}>
          <Icon className="size-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
      </Link>
    </motion.div>
  )
}

// ─── Word Chip ────────────────────────────────────────────

function WordChip({ word, phonetic, definition, masteryLevel }: {
  word: string
  phonetic: string
  definition: string
  masteryLevel: number
}) {
  const MASTERY_COLORS = [
    "bg-muted text-muted-foreground",
    "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    "bg-green-500/10 text-green-600 dark:text-green-400",
  ]

  return (
    <div className="group flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card p-3.5 hover:border-border hover:shadow-sm transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{word}</span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${MASTERY_COLORS[masteryLevel]}`}>
          {["New", "Beginner", "Learning", "Familiar", "Mastered"][masteryLevel]}
        </span>
      </div>
      <span className="text-xs font-mono text-muted-foreground">{phonetic}</span>
      <p className="text-xs text-muted-foreground line-clamp-2">{definition}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────

export default function HomePage() {
  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const words = useVocabStore((s) => s.words)

  const recentWords = words.slice(0, 6)
  const totalWords = words.length
  const masteredCount = words.filter((w) => w.masteryLevel >= 3).length

  const stats = [
    { label: "Total Words", value: totalWords, icon: BookOpen, accent: "bg-primary/10 text-primary" },
    { label: "Learned Today", value: 3, icon: TrendingUp, accent: "bg-green-500/10 text-green-600 dark:text-green-400" },
    { label: "Day Streak", value: "7 🔥", icon: Flame, accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    { label: "Mastered", value: masteredCount, icon: Trophy, accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  ]

  const studyModes = [
    { title: "Flashcards", description: "Review with spaced repetition", icon: CreditCard, href: "/study/flashcards", gradient: "gradient-primary" },
    { title: "Flip Cards", description: "Flip to reveal meaning", icon: Zap, href: "/study/flip", gradient: "bg-gradient-to-br from-violet-500 to-purple-600" },
    { title: "Word Match", description: "Match words to definitions", icon: Trophy, href: "/study/match", gradient: "bg-gradient-to-br from-emerald-500 to-teal-600" },
    { title: "Games", description: "Fun vocabulary challenges", icon: Gamepad2, href: "/study/games", gradient: "bg-gradient-to-br from-orange-500 to-rose-500" },
  ]

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Good evening 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Ready to expand your vocabulary today?
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>

        {/* Quick Add */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Sparkles className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Add a new word</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI generates definition, examples & synonyms instantly
                </p>
              </div>
            </div>
            <button
              id="add-word-button"
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 shrink-0 whitespace-nowrap"
            >
              <Plus className="size-4" />
              Add Word
            </button>
          </div>
        </motion.div>

        {/* Recent Words */}
        {recentWords.length > 0 && (
          <motion.section
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            aria-labelledby="recent-words-heading"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 id="recent-words-heading" className="text-sm font-semibold text-foreground">
                Recent Words
              </h2>
              <Link
                href="/vocabulary"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                See all <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {recentWords.map((w, i) => (
                <motion.div
                  key={w.id}
                  custom={5 + i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  <WordChip
                    word={w.word}
                    phonetic={w.phonetic}
                    definition={w.definition}
                    masteryLevel={w.masteryLevel}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Study Modes */}
        <motion.section
          custom={11}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          aria-labelledby="study-modes-heading"
        >
          <h2 id="study-modes-heading" className="text-sm font-semibold text-foreground mb-3">
            Study Modes
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {studyModes.map((m, i) => (
              <StudyCard key={m.title} {...m} index={11 + i} />
            ))}
          </div>
        </motion.section>
      </div>

      {/* FAB — mobile */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden size-14 rounded-full gradient-primary text-white shadow-xl hover:opacity-90 active:scale-95 transition-all duration-150 flex items-center justify-center glow-primary z-40"
        aria-label="Add new word"
        id="fab-add-word"
      >
        <Plus className="size-6" />
      </button>

      <AddWordModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}
