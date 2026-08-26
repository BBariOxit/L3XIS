"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, Volume2, RefreshCw, AlertCircle, ArrowRight } from "lucide-react"
import { useVocabStore, type VocabWord } from "@/store/vocab-store"
import type { GeneratedWordData } from "@/app/api/generate/route"

export type { GeneratedWordData }

// ─── Types ────────────────────────────────────────────────

type Step = "input" | "loading" | "preview" | "saving" | "saved" | "error"

// ─── Speak ────────────────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = "en-US"
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}

// ─── POS colour ───────────────────────────────────────────

const POS_COLOR: Record<string, string> = {
  noun:        "bg-blue-500/10   text-blue-500",
  verb:        "bg-green-500/10  text-green-600 dark:text-green-400",
  adjective:   "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  adverb:      "bg-amber-500/10  text-amber-600 dark:text-amber-400",
  preposition: "bg-rose-500/10   text-rose-600 dark:text-rose-400",
}
const posColor = (p: string) =>
  POS_COLOR[p.toLowerCase()] ?? "bg-muted text-muted-foreground"

// ─── Preview ──────────────────────────────────────────────

function WordPreview({ data }: { data: GeneratedWordData }) {
  const [active, setActive] = React.useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Word + phonetic + speak */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold tracking-tight text-foreground capitalize">
            {data.word}
          </h3>
          <p className="text-sm font-mono text-muted-foreground mt-0.5">
            {data.phonetic}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${posColor(data.partOfSpeech)}`}>
            {data.partOfSpeech}
          </span>
          <button
            id="speak-word-btn"
            onClick={() => { setActive(true); speak(data.word); setTimeout(() => setActive(false), 1000) }}
            className={`size-8 rounded-full flex items-center justify-center transition-all duration-150
              ${active ? "bg-primary text-primary-foreground scale-110" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <Volume2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Definition EN → VI */}
      <div className="space-y-2">
        <p className="text-sm leading-relaxed text-foreground">{data.definition}</p>
        {data.definitionVi && (
          <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-3">
            {data.definitionVi}
          </p>
        )}
      </div>

      {/* Examples by context */}
      {data.examples.length > 0 && (
        <div className="space-y-3">
          {data.examples.map((ex, i) => (
            <div key={i} className="rounded-lg bg-muted/40 px-4 py-3 space-y-1">
              <p className="text-sm text-foreground/85 italic">&ldquo;{ex.sentence}&rdquo;</p>
              <p className="text-xs text-muted-foreground">{ex.translation}</p>
              {ex.context && (
                <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground mt-1">
                  {ex.context}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Synonyms */}
      {data.synonyms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.synonyms.map((s) => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── API helpers ──────────────────────────────────────────

async function generateWord(word: string): Promise<GeneratedWordData> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? "Failed")
  return json as GeneratedWordData
}

async function saveWord(data: GeneratedWordData): Promise<VocabWord> {
  const res = await fetch("/api/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? "Failed")
  return json.word as VocabWord
}

// ─── Modal ────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
}

export function AddWordModal({ open, onClose }: Props) {
  const [step, setStep] = React.useState<Step>("input")
  const [input, setInput] = React.useState("")
  const [data, setData] = React.useState<GeneratedWordData | null>(null)
  const [error, setError] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const addWord = useVocabStore((s) => s.addWord)

  React.useEffect(() => {
    if (open) {
      setStep("input"); setInput(""); setData(null); setError("")
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const generate = async () => {
    const w = input.trim()
    if (!w) return
    setStep("loading")
    try { setData(await generateWord(w)); setStep("preview") }
    catch (e) { setError(e instanceof Error ? e.message : "Error"); setStep("error") }
  }

  const save = async () => {
    if (!data) return
    setStep("saving")
    try {
      const saved = await saveWord(data)
      addWord({ ...data, collection: saved.collection ?? "default" })
      setStep("saved")
      setTimeout(onClose, 1100)
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); setStep("error") }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / dialog */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 32, stiffness: 380 }}
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-card border border-border/50 shadow-2xl overflow-hidden"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pb-8 pt-4 sm:pt-6">
          <AnimatePresence mode="wait">

            {/* ── Input ── */}
            {step === "input" && (
              <motion.div key="input"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                className="space-y-3">
                <input
                  id="word-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") generate(); if (e.key === "Escape") onClose() }}
                  placeholder="Enter a word..."
                  className="w-full h-14 px-5 rounded-xl text-lg bg-background border-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
                />
                <button
                  id="generate-word-btn"
                  onClick={generate}
                  disabled={!input.trim()}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  Generate
                  <ArrowRight className="size-4" />
                </button>
              </motion.div>
            )}

            {/* ── Loading ── */}
            {step === "loading" && (
              <motion.div key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="size-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">&ldquo;{input}&rdquo;</p>
              </motion.div>
            )}

            {/* ── Preview ── */}
            {step === "preview" && data && (
              <motion.div key="preview"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                className="space-y-5">
                <WordPreview data={data} />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setStep("input")}
                    className="flex-1 h-11 rounded-xl border border-border/60 text-sm font-medium hover:bg-muted transition-colors">
                    Back
                  </button>
                  <button id="save-word-btn" onClick={save}
                    className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all">
                    <Check className="size-4" /> Save
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Saving ── */}
            {step === "saving" && (
              <motion.div key="saving"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center py-16">
                <Loader2 className="size-7 text-primary animate-spin" />
              </motion.div>
            )}

            {/* ── Saved ── */}
            {step === "saved" && (
              <motion.div key="saved"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="size-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="size-6 text-green-500" />
                </div>
                <p className="text-base font-semibold text-foreground capitalize">{data?.word}</p>
              </motion.div>
            )}

            {/* ── Error ── */}
            {step === "error" && (
              <motion.div key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-4">
                <AlertCircle className="size-8 text-destructive" />
                <p className="text-sm text-muted-foreground text-center max-w-[260px]">{error}</p>
                <button onClick={() => { setStep("input"); setError("") }}
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <RefreshCw className="size-3.5" /> Try again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
