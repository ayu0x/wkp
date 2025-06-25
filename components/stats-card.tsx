import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string | number
  isPositive?: boolean
  isLoading?: boolean
  icon?: React.ReactNode
}

export default function StatsCard({
  title,
  value,
  change,
  isPositive = true,
  isLoading = false,
  icon,
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden card-hover">
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-6 sm:h-7 w-20 sm:w-24" />
            ) : (
              <h3 className="text-lg sm:text-xl font-bold truncate">{value}</h3>
            )}
            {change && (
              <p className={`text-xs mt-0.5 flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                <span className="text-[10px]">{isPositive ? "↑" : "↓"}</span>
                <span>{change}</span>
              </p>
            )}
          </div>
          {icon && (
            <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}