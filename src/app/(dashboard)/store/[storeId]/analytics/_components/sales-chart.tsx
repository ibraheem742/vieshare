"use client"

import { cn } from "@/lib/utils"

interface SalesChartProps {
  data: {
    name: string
    Total: number
  }[]
  className?: string
}

export function SalesChart({ data, className }: SalesChartProps) {
  return (
    <div className={cn("p-4 text-center text-muted-foreground", className)}>
      <div>Sales chart temporarily disabled</div>
      <div className="text-sm mt-2">
        {data.length} data points available
      </div>
    </div>
  )
}
