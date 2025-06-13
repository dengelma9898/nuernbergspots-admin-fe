import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface AnalyticsCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string | number
  trend?: number
  description?: string
  trendDescription?: string
}

export function AnalyticsCard({ 
  icon: Icon,
  title,
  value,
  trend,
  description,
  trendDescription
}: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="ml-1 text-sm">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trendDescription && (
            <p className="text-xs text-muted-foreground">{trendDescription}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 