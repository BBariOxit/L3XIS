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
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

// ─── Navigation config ────────────────────────────────────

const learnItems = [
  { title: "Home", url: "/", icon: Home },
]

const libraryItems = [
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

// ─── Sub-components ───────────────────────────────────────

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
          "h-9 px-3 rounded-xl transition-all duration-200 group",
          isActive
            ? "bg-primary/10 text-primary font-medium shadow-sm"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
        ].join(" ")}
      >
        <Icon
          className={[
            "size-4 shrink-0 transition-colors duration-200",
            isActive ? "text-primary" : "opacity-60 group-hover:opacity-100",
          ].join(" ")}
        />
        <span className="text-sm">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

interface NavGroupProps {
  label: string
  items: typeof learnItems
  pathname: string
  isCollapsed: boolean
}

function NavGroup({ label, items, pathname, isCollapsed }: NavGroupProps) {
  return (
    <SidebarGroup>
      {!isCollapsed && (
        <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
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

// ─── Main Component ───────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r-0">
      {/* Logo */}
      <SidebarHeader className="h-14 flex items-center justify-start px-3 border-b border-sidebar-border/40">
        <Link href="/" className="flex items-center gap-3 w-full group">
          <div
            className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-xl gradient-primary text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200"
            aria-hidden="true"
          >
            <Sparkles className="size-4" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-sidebar-foreground">
                L3XIS
              </span>
              <span className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-wider">
                Vocab Mastery
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 py-3 flex flex-col gap-4 overflow-y-auto">
        <NavGroup label="Learn" items={learnItems} pathname={pathname} isCollapsed={isCollapsed} />
        <NavGroup label="My Words" items={libraryItems} pathname={pathname} isCollapsed={isCollapsed} />
        <NavGroup label="Study" items={studyItems} pathname={pathname} isCollapsed={isCollapsed} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 pb-3 pt-2 border-t border-sidebar-border/40">
        <SidebarMenu className="gap-0.5">
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
