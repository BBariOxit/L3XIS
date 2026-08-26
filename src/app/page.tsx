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
      {/* Full-height centered layout */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.button
          id="add-word-button"
          onClick={() => setOpen(true)}
          aria-label="Add new word"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 260, delay: 0.05 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="
            group relative flex items-center justify-center
            size-28 rounded-full
            bg-primary text-primary-foreground
            shadow-[0_8px_32px_oklch(0.50_0.16_228_/_35%)]
            hover:shadow-[0_12px_40px_oklch(0.50_0.16_228_/_50%)]
            transition-shadow duration-300
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40
          "
        >
          {/* Ripple ring on hover */}
          <span
            className="
              absolute inset-0 rounded-full
              ring-0 group-hover:ring-4 ring-primary/25
              transition-all duration-300
            "
          />

          <Plus
            className="size-12 transition-transform duration-200 group-hover:rotate-90"
            strokeWidth={2}
          />
        </motion.button>
      </div>

      <AddWordModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
