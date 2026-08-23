"use client"

import * as React from "react"
import { Home, BookOpen, Gamepad2, Settings, User, Library, Sparkles } from "lucide-react"
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
} from "@/components/ui/sidebar"

// Danh sách các mục menu chính
const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "My Vocabulary",
    url: "/vocabulary",
    icon: BookOpen,
  },
  {
    title: "Collections",
    url: "/collections",
    icon: Library,
  },
  {
    title: "Practice & Games",
    url: "/practice",
    icon: Gamepad2,
  },
]

// Các mục cài đặt
const settingsItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" className="border-r-0">
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border/50">
        <Link href="/" className="flex items-center gap-2 w-full">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-base tracking-tight">L3XIS</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Vocab Mastery</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 flex flex-col gap-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2 px-2">
            Learning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      className={`h-10 px-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-sidebar-foreground/80"
                      }`}
                    >
                      <item.icon className={`size-5 ${isActive ? "text-primary" : "opacity-70"}`} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <SidebarMenu className="gap-1.5">
          {settingsItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  render={<Link href={item.url} />}
                  isActive={isActive}
                  className={`h-10 px-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-sidebar-foreground/80"
                  }`}
                >
                  <item.icon className={`size-5 ${isActive ? "text-primary" : "opacity-70"}`} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
