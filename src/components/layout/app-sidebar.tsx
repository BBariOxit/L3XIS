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
          "h-9 px-2.5 rounded-lg transition-colors duration-150 group",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        ].join(" ")}
      >
        <Icon
          className={[
            "size-4 shrink-0",
            isActive ? "text-primary" : "opacity-55 group-hover:opacity-90",
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

// ─── Main Component ───────────────────────────────────────

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
