"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command-palette"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"
import { useVocabStore } from "@/store/vocab-store"

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Client-side shell that manages:
 * - Global word fetch (once per session, feeds sidebar + all pages)
 * - Command Palette (Cmd+K)
 * - Add Word Modal
 * - Header with wired search click handler
 */
export function AppShell({ children }: AppShellProps) {
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [addWordOpen, setAddWordOpen] = React.useState(false)
  const fetchWords = useVocabStore((s) => s.fetchWords)

  // Fetch words once on mount — populates the store for sidebar + all pages
  React.useEffect(() => {
    fetchWords()
  }, [fetchWords])

  // Global Cmd+K shortcut
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <>
      <Header onSearchClick={() => setCommandOpen(true)} />

      <div className="flex-1 overflow-y-auto bg-muted/20">
        <div className="container mx-auto p-8 md:p-12 h-full">
          {children}
        </div>
      </div>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onAddWord={() => setAddWordOpen(true)}
      />

      <AddWordModal
        open={addWordOpen}
        onClose={() => setAddWordOpen(false)}
      />
    </>
  )
}
