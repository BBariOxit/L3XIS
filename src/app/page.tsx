"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useVocabStore } from "@/store/vocab-store"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"

export default function HomePage() {
  const [open, setOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const fetchWords = useVocabStore((s) => s.fetchWords)

  React.useEffect(() => {
    fetchWords()
  }, [fetchWords])

  return (
    <>
      <div className="flex items-center justify-center h-full min-h-[40vh]">
        <motion.button
          id="add-word-button"
          onClick={() => setOpen(true)}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          aria-label="Add new word"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex items-center gap-3 px-10 py-5 rounded-2xl border-[2.5px] border-primary text-primary font-bold text-xl tracking-tight select-none overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          {/* Fill sweep */}
          <motion.span
            className="pointer-events-none absolute inset-0 bg-primary origin-left"
            animate={{ scaleX: hovered ? 1 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />

          {/* Icon */}
          <motion.span
            className="relative z-10 flex items-center justify-center size-7 rounded-lg border-[2.5px] transition-colors duration-200"
            style={{ borderColor: hovered ? "var(--primary-foreground)" : "var(--primary)" }}
            animate={{ rotate: hovered ? 90 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <Plus
              className="size-4 transition-colors duration-200"
              style={{ color: hovered ? "var(--primary-foreground)" : "var(--primary)" }}
              strokeWidth={2.5}
            />
          </motion.span>

          {/* Label */}
          <span
            className="relative z-10 transition-colors duration-200"
            style={{ color: hovered ? "var(--primary-foreground)" : "var(--primary)" }}
          >
            Add word
          </span>
        </motion.button>
      </div>

      <AddWordModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
