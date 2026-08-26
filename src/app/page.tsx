"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useVocabStore } from "@/store/vocab-store"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"

export default function HomePage() {
  const [open, setOpen] = React.useState(false)
  const fetchWords = useVocabStore((s) => s.fetchWords)

  React.useEffect(() => {
    fetchWords()
  }, [fetchWords])

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.button
          id="add-word-button"
          onClick={() => setOpen(true)}
          aria-label="Add new word"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl border-2 border-foreground bg-transparent text-foreground font-bold text-xl tracking-tight select-none overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/20"
        >
          {/* Animated fill on hover */}
          <motion.span
            className="pointer-events-none absolute inset-0 bg-foreground origin-left"
            initial={{ scaleX: 0 }}
            variants={{ hover: { scaleX: 1 } }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />

          {/* Icon */}
          <motion.span
            className="relative z-10 flex items-center justify-center size-7 rounded-lg border-2 border-foreground group-hover:border-background transition-colors duration-250"
            variants={{ hover: { rotate: 90 } }}
            transition={{ duration: 0.25 }}
          >
            <Plus className="size-4 transition-colors duration-250 group-hover:text-background" strokeWidth={2.5} />
          </motion.span>

          {/* Label */}
          <span className="relative z-10 transition-colors duration-250 group-hover:text-background">
            Add word
          </span>
        </motion.button>
      </div>

      <AddWordModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
