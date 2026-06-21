'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl overflow-hidden border border-border/60 bg-card', className)}>
      <Skeleton className="aspect-video w-full" />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
