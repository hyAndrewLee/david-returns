"use client"

import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { useProfile } from "@/app/(customer)/profile/ProfileContext"

export const ProfileHeader = () => {
  const { handleSignOut } = useProfile()

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image
              src="/images/david-returns-logo.png"
              alt="David Returns"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
