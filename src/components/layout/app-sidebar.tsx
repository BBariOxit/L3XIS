"use client"

import * as React from "react"
import {
  Home,
  BookOpen,
  Layers,
  Gamepad2,
  Settings,
  User,
  CreditCard,
  Zap,
  Trophy,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useVocabStore } from "@/store/vocab-store"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"

// --- Navigation config ---

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Vocabulary", url: "/vocabulary", icon: BookOpen },
  { title: "Collections", url: "/collections", icon: Layers },
]

const studyItems = [
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
  { title: "Flip Cards", url: "/study/flip", icon: Zap },
  { title: "Word Match", url: "/study/match", icon: Trophy },
  { title: "Games", url: "/study/games", icon: Gamepad2 },
]

const footerItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
]

// --- Sub-components ---

interface NavItemProps {
  title: string
  url: string
  icon: React.ElementType
  isActive: boolean
  isCollapsed: boolean
}

function NavItem({ title, url, icon: Icon, isActive, isCollapsed }: NavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={url} />}
        isActive={isActive}
        title={isCollapsed ? title : undefined}
        className={[
          "h-9 px-2.5 rounded-lg transition-colors duration-150 group",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        ].join(" ")}
      >
        <Icon
          className={[
            "size-4 shrink-0",
            isActive ? "text-primary" : "",
          ].join(" ")}
        />
        <span className="text-sm">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

interface NavGroupProps {
  label: string
  items: typeof mainItems
  pathname: string
  isCollapsed: boolean
}

function NavGroup({ label, items, pathname, isCollapsed }: NavGroupProps) {
  return (
    <SidebarGroup className="py-0">
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 px-2.5 transition-all duration-200">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-px">
          {items.map((item) => (
            <NavItem
              key={item.title}
              {...item}
              isActive={pathname === item.url}
              isCollapsed={isCollapsed}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// --- POS colour dot map ---

const POS_DOT: Record<string, string> = {
  noun:        "bg-blue-500",
  verb:        "bg-green-500",
  adjective:   "bg-violet-500",
  adverb:      "bg-amber-500",
  preposition: "bg-rose-500",
}

// --- Recent Words section ---

function RecentWords({ isCollapsed }: { isCollapsed: boolean }) {
  const words = useVocabStore((s) => s.words)
  const isLoading = useVocabStore((s) => s.isLoading)
  const recent = words.slice(0, 5)

  if (isCollapsed) {
    return (
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <SidebarMenu className="gap-px">
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/vocabulary" />}
                title={`${words.length} words`}
                className="h-9 px-2.5 rounded-lg transition-colors duration-150 text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <div className="relative">
                  <Clock className="size-4 shrink-0" />
                  {words.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
                      {words.length > 99 ? "99+" : words.length}
                    </span>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 px-2.5 flex items-center">
        Recent Words
        {words.length > 0 && (
          <span className="ml-auto text-[9px] font-bold text-primary/70 tabular-nums">
            {words.length}
          </span>
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {isLoading && recent.length === 0 ? (
          <div className="px-2.5 space-y-1.5 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-sidebar-accent/30 animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="px-2.5 py-2 text-[11px] text-sidebar-foreground/35">
            No words yet
          </p>
        ) : (
          <div className="px-1 space-y-px">
            {recent.map((w) => (
              <Link
                key={w.id}
                href="/vocabulary"
                className="flex flex-col gap-0.5 px-2.5 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors duration-150 group/word"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "size-1.5 rounded-full shrink-0 mt-px",
                      POS_DOT[w.partOfSpeech?.toLowerCase()] ?? "bg-muted-foreground/40",
                    ].join(" ")}
                  />
                  <span className="text-xs font-semibold text-sidebar-foreground truncate group-hover/word:text-foreground transition-colors">
                    {w.word}
                  </span>
                  <span className="text-[10px] font-mono text-sidebar-foreground/35 shrink-0 ml-auto">
                    {w.phonetic?.slice(0, 12)}
                  </span>
                </div>
                {w.definitionVi && (
                  <p className="text-[10px] text-sidebar-foreground/45 truncate pl-3.5 leading-relaxed">
                    {w.definitionVi}
                  </p>
                )}
              </Link>
            ))}
            {words.length > 5 && (
              <Link
                href="/vocabulary"
                className="flex items-center justify-center py-1.5 text-[10px] text-primary/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
              >
                +{words.length - 5} more
              </Link>
            )}
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// --- Main Component ---

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r-0">
      {/* Logo */}
      <SidebarHeader className="h-14 px-4 border-b border-sidebar-border/50 flex flex-row items-center">
        <Link href="/" className="flex items-center w-full group">
          <span className="font-bold text-sm tracking-tight text-sidebar-foreground">
            L3XIS
          </span>
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 py-3 flex flex-col gap-3 overflow-y-auto">
        <NavGroup label="General" items={mainItems} pathname={pathname} isCollapsed={isCollapsed} />
        <NavGroup label="Study" items={studyItems} pathname={pathname} isCollapsed={isCollapsed} />

        {/* Divider */}
        <div className="mx-2 border-t border-sidebar-border/30" />

        {/* Recent Words */}
        <RecentWords isCollapsed={isCollapsed} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 pb-3 pt-2 border-t border-sidebar-border/50">
        <SidebarMenu className="gap-px">
          {footerItems.map((item) => (
            <NavItem
              key={item.title}
              {...item}
              isActive={pathname === item.url}
              isCollapsed={isCollapsed}
            />
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
