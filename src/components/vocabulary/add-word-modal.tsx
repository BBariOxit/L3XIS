"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Loader2,
  ChevronRight,
  X,
  Check,
  Volume2,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVocabStore, type VocabWord } from "@/store/vocab-store"
import type { GeneratedWordData } from "@/app/api/generate/route"

// ─── Re-export type for consumers ─────────────────────────
export type { GeneratedWordData }

// ─── Step machine ─────────────────────────────────────────

type Step = "input" | "loading" | "preview" | "saving" | "saved" | "error"

// ─── Web Speech API ───────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = "en-US"
  utt.rate = 0.9
  window.speechSynthesis.speak(utt)
}

// ─── Mastery badge helpers ────────────────────────────────

const POS_COLORS: Record<string, string> = {
  noun: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  verb: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  adjective: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  adverb: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  preposition: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
}

function posColor(pos: string) {
  return (
    POS_COLORS[pos.toLowerCase()] ??
    "bg-muted text-muted-foreground"
  )
}

// ─── Word Preview ─────────────────────────────────────────

interface WordPreviewProps {
  data: GeneratedWordData
}

function WordPreview({ data }: WordPreviewProps) {
  const [speaking, setSpeaking] = React.useState(false)

  const handleSpeak = () => {
    setSpeaking(true)
    speak(data.word)
    setTimeout(() => setSpeaking(false), 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-2xl font-bold text-foreground tracking-tight">
              {data.word}
            </h3>
            {/* 🔊 Speak button */}
            <button
              id="speak-word-btn"
              onClick={handleSpeak}
              title="Listen to pronunciation"
              className={`size-7 rounded-full flex items-center justify-center transition-all duration-150 shrink-0
                ${speaking
                  ? "bg-primary text-primary-foreground scale-110"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              <Volume2 className="size-3.5" />
            </button>
          </div>
          <p className="text-sm font-mono text-muted-foreground mt-0.5">
            {data.phonetic}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-1 ${posColor(data.partOfSpeech)}`}
        >
          {data.partOfSpeech}
        </span>
      </div>

      {/* Definitions */}
      <div className="space-y-2 rounded-xl bg-muted/40 p-4 border border-border/50">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            English
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {data.definition}
          </p>
        </div>
        {data.definitionVi && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Tiếng Việt
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {data.definitionVi}
            </p>
          </div>
        )}
      </div>

      {/* Examples */}
      {data.examples.length > 0 && (
        <div className="space-y-3">
          {data.examples.map((ex, i) => (
            <div key={i} className="pl-3.5 border-l-2 border-primary/30 space-y-1">
              <p className="text-sm text-foreground/85 italic leading-relaxed">
                &ldquo;{ex.sentence}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {ex.translation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Synonyms */}
      {data.synonyms.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Synonyms
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.synonyms.map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/50 hover:border-border transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Generate function (calls /api/generate) ──────────────

async function generateWordData(word: string): Promise<GeneratedWordData> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? "Generation failed")
  return json as GeneratedWordData
}

// ─── Save function (calls /api/words) ────────────────────

async function saveWord(data: GeneratedWordData): Promise<VocabWord> {
  const res = await fetch("/api/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? "Save failed")
  return json.word as VocabWord
}

// ─── Main Component ───────────────────────────────────────

interface AddWordModalProps {
  open: boolean
  onClose: () => void
}

export function AddWordModal({ open, onClose }: AddWordModalProps) {
  const [step, setStep] = React.useState<Step>("input")
  const [inputWord, setInputWord] = React.useState("")
  const [wordData, setWordData] = React.useState<GeneratedWordData | null>(null)
  const [error, setError] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const addWord = useVocabStore((s) => s.addWord)

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setStep("input")
      setInputWord("")
      setWordData(null)
      setError("")
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const handleGenerate = async () => {
    const trimmed = inputWord.trim()
    if (!trimmed) {
      setError("Please enter an English word first")
      return
    }
    setError("")
    setStep("loading")
    try {
      const data = await generateWordData(trimmed)
      setWordData(data)
      setStep("preview")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg)
      setStep("error")
    }
  }

  const handleSave = async () => {
    if (!wordData) return
    setStep("saving")
    try {
      const saved = await saveWord(wordData)
      // Optimistic update to store with server id
      addWord({ ...wordData, collection: saved.collection ?? "default" })
      setStep("saved")
      setTimeout(onClose, 1200)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save"
      setError(msg)
      setStep("error")
    }
  }

  const handleRetry = () => {
    setStep("input")
    setError("")
    setWordData(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step === "input") handleGenerate()
    if (e.key === "Escape") onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add new word"
    >
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
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/40">
          <div>
            <h2 className="text-base font-semibold text-foreground">Add Word</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Type an English word — AI will do the rest
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── Step: Input ── */}
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <Input
                  id="word-input"
                  ref={inputRef}
                  value={inputWord}
                  onChange={(e) => {
                    setInputWord(e.target.value)
                    if (error) setError("")
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. ephemeral, serendipity..."
                  className="h-12 rounded-xl text-base border-border/60 bg-muted/30 focus:bg-background transition-colors"
                />
                {error && (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {error}
                  </p>
                )}
                <Button
                  id="generate-word-btn"
                  onClick={handleGenerate}
                  disabled={!inputWord.trim()}
                  className="w-full h-11 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="size-4" />
                  Generate with AI
                  <ChevronRight className="size-4" />
                </Button>
              </motion.div>
            )}

            {/* ── Step: Loading ── */}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-14 gap-4"
              >
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="size-7 text-primary animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Analyzing &ldquo;{inputWord}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gemini is generating definitions &amp; examples…
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Step: Preview ── */}
            {step === "preview" && wordData && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <WordPreview data={wordData} />
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setStep("input")}
                    className="flex-1 h-10 rounded-xl text-sm"
                  >
                    Back
                  </Button>
                  <Button
                    id="save-word-btn"
                    onClick={handleSave}
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold"
                  >
                    <Check className="size-4" />
                    Save Word
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step: Saving ── */}
            {step === "saving" && (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-14 gap-3"
              >
                <Loader2 className="size-7 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Saving to your vocabulary…</p>
              </motion.div>
            )}

            {/* ── Step: Saved ── */}
            {step === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-14 gap-3"
              >
                <div className="size-14 rounded-2xl bg-green-50 dark:bg-green-500/15 flex items-center justify-center">
                  <Check className="size-7 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    &ldquo;{wordData?.word}&rdquo; saved!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Added to your vocabulary
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Step: Error ── */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-4"
              >
                <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="size-7 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Something went wrong</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">{error}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="rounded-xl h-9 text-sm gap-2"
                >
                  <RefreshCw className="size-3.5" />
                  Try again
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
