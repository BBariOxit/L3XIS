"use client"

import * as React from "react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-4">
        {/* Nút mở/đóng Sidebar trên mobile */}
        <SidebarTrigger className="md:hidden" />
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            L
          </div>
          <span className="text-xl font-bold tracking-tight">L3XIS</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark/Light mode toggle */}
        <ModeToggle />

        {/* Avatar người dùng */}
        <Avatar className="h-9 w-9 cursor-pointer border hover:opacity-80 transition-opacity">
          <AvatarImage src="" alt="User Avatar" />
          <AvatarFallback className="font-medium">US</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
