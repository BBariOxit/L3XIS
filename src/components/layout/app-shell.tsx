"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command-palette"
import { AddWordModal } from "@/components/vocabulary/add-word-modal"

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Client-side shell that manages:
 * - Command Palette (Cmd+K)
 * - Add Word Modal
 * - Header with wired search click handler
 */
export function AppShell({ children }: AppShellProps) {
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [addWordOpen, setAddWordOpen] = React.useState(false)

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

      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="container mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>

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
