"use client"

import * as React from "react"
import { motion, type Variants } from "framer-motion"
import {
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
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" as const },
  }),
}

// ─── Stat Card ────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  index: number
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, index }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 hover:border-border hover:shadow-sm transition-all duration-200"
    >
      <div className={`size-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`size-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

// ─── Study Mode Card ──────────────────────────────────────

interface StudyCardProps {
  title: string
  icon: React.ElementType
  href: string
  iconBg: string
  iconColor: string
  index: number
}

function StudyCard({ title, icon: Icon, href, iconBg, iconColor, index }: StudyCardProps) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}>
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:border-border hover:shadow-sm transition-all duration-200"
      >
        <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-foreground flex-1">{title}</span>
        <ArrowRight className="size-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </Link>
    </motion.div>
  )
}

// ─── Word Chip ────────────────────────────────────────────

const MASTERY_BADGE = [
  "bg-muted text-muted-foreground",
  "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
]

const MASTERY_LABELS = ["New", "Beginner", "Learning", "Familiar", "Mastered"]

function WordChip({ word, phonetic, definition, masteryLevel }: {
  word: string
  phonetic: string
  definition: string
  masteryLevel: number
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-card p-3.5 hover:border-border hover:shadow-sm transition-all duration-150 cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{word}</span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${MASTERY_BADGE[masteryLevel]}`}>
          {MASTERY_LABELS[masteryLevel]}
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

  const stats: StatCardProps[] = [
    {
      label: "Total Words", value: totalWords, icon: BookOpen, index: 0,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Learned Today", value: 3, icon: TrendingUp, index: 1,
      iconBg: "bg-green-50 dark:bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Day Streak", value: "7 🔥", icon: Flame, index: 2,
      iconBg: "bg-yellow-50 dark:bg-yellow-500/10",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Mastered", value: masteredCount, icon: Trophy, index: 3,
      iconBg: "bg-red-50 dark:bg-red-500/10",
      iconColor: "text-red-500 dark:text-red-400",
    },
  ]

  const studyModes: StudyCardProps[] = [
    {
      title: "Flashcards", icon: CreditCard, href: "/study/flashcards", index: 4,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Flip Cards", icon: Zap, href: "/study/flip", index: 5,
      iconBg: "bg-yellow-50 dark:bg-yellow-500/10",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Word Match", icon: Trophy, href: "/study/match", index: 6,
      iconBg: "bg-green-50 dark:bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Games", icon: Gamepad2, href: "/study/games", index: 7,
      iconBg: "bg-red-50 dark:bg-red-500/10",
      iconColor: "text-red-500 dark:text-red-400",
    },
  ]

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-7">
        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold text-foreground"
        >
          Good evening 👋
        </motion.h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Quick Add */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Add a word</p>
            <p className="text-xs text-muted-foreground mt-0.5">AI generates meaning instantly</p>
          </div>
          <button
            id="add-word-button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 shrink-0 whitespace-nowrap"
          >
            <Plus className="size-3.5" />
            Add
          </button>
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
                Recent
              </h2>
              <Link href="/vocabulary" className="flex items-center gap-1 text-xs text-primary hover:underline">
                See all <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {recentWords.map((w, i) => (
                <motion.div key={w.id} custom={5 + i} initial="hidden" animate="visible" variants={fadeUp}>
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
            Study
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {studyModes.map((m) => (
              <StudyCard key={m.title} {...m} />
            ))}
          </div>
        </motion.section>
      </div>

      {/* FAB — mobile */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden size-13 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-150 flex items-center justify-center z-40"
        aria-label="Add new word"
        id="fab-add-word"
      >
        <Plus className="size-5" />
      </button>

      <AddWordModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}
