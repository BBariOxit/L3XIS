"use client"

import * as React from "react"
import { Search, Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ─── Breadcrumb config ────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/vocabulary": "Vocabulary",
  "/collections": "Collections",
  "/study/flashcards": "Flashcards",
  "/study/flip": "Flip Cards",
  "/study/match": "Word Match",
  "/study/games": "Games",
  "/profile": "Profile",
  "/settings": "Settings",
}

// ─── Component ────────────────────────────────────────────

interface HeaderProps {
  onSearchClick?: () => void
}

export function Header({ onSearchClick }: HeaderProps) {
  const pathname = usePathname()
  const pageTitle = ROUTE_LABELS[pathname] ?? "L3XIS"

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 glass">
      {/* Left — trigger + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="size-8 shrink-0 rounded-lg hover:bg-accent transition-colors" />
        <Separator orientation="vertical" className="h-4 hidden sm:block" />
        <span className="text-sm font-medium text-foreground/80 truncate hidden sm:block">
          {pageTitle}
        </span>
      </div>

      {/* Center — search */}
      <button
        onClick={onSearchClick}
        className="hidden md:flex items-center gap-2.5 h-9 w-64 max-w-sm rounded-xl border border-border/70 bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted hover:border-border transition-all duration-200 cursor-text group"
        aria-label="Search vocabulary (⌘K)"
      >
        <Search className="size-3.5 shrink-0 group-hover:text-foreground transition-colors" />
        <span className="flex-1 text-left text-xs">Search words...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full size-9"
          onClick={onSearchClick}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-9 relative"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span
            className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
        </Button>

        <ModeToggle />

        {/* Avatar */}
        <Avatar className="size-8 cursor-pointer border border-border/50 hover:border-primary/50 hover:scale-105 transition-all duration-200">
          <AvatarImage src="" alt="User avatar" />
          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
