import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export interface NavigationCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  onClick?: () => void
}

export function NavigationCard({ 
  icon: Icon, 
  title, 
  description, 
  href,
  onClick
}: NavigationCardProps) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(href)
    }
  }
  
  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors group"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
        </div>
      </CardHeader>
    </Card>
  )
} 