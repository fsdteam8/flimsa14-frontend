"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function NavbarSkeleton() {
  return (
    <nav className="w-full bg-black border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo skeleton */}
        <Skeleton className="w-24 h-8 rounded-md" />

        {/* Menu items skeleton */}
        <div className="hidden md:flex gap-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-20 h-5 rounded-md" />
          ))}
        </div>

        {/* Icons skeleton */}
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-6 h-6 rounded-full" />
          ))}
        </div>
      </div>
    </nav>
  )
}
