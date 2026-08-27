"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

const THEMES = ["light", "dark", "system"] as const
type Theme = (typeof THEMES)[number]

const ICONS: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    const current = (theme ?? "system") as Theme
    const idx = THEMES.indexOf(current)
    const next = THEMES[(idx + 1) % THEMES.length]
    setTheme(next)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full size-9" disabled aria-label="Toggle theme">
        <span className="size-4 rounded-full bg-muted animate-pulse" />
      </Button>
    )
  }

  const current = (theme ?? "system") as Theme
  const Icon = ICONS[current]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="rounded-full size-9 relative overflow-hidden hover:bg-accent transition-colors duration-200"
      aria-label={`Current theme: ${current}. Click to switch.`}
      title={`Theme: ${current}`}
    >
      <Icon className="size-4 transition-all duration-300" />
    </Button>
  )
}
