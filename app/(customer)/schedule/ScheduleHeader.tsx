"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export const ScheduleHeader = () => (
  <header className="bg-[rgba(249,249,246,0.88)] backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_0_rgba(26,26,46,0.06)]">
    <div className="mx-auto max-w-3xl px-4 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <Link href="/">
          <Image
            src="/images/david-returns-logo.png"
            alt="David Returns"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
        <div className="w-16" />
      </div>
    </div>
  </header>
)
