import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Clock, Calendar } from 'lucide-react'

import { Event } from '../models/events'
import { getEventStatus } from '../utils/eventDateUtils'

export interface EventStatusProps {
  event: Event
}

export function EventStatus({ event }: EventStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'past':
        return {
          label: 'Beendet',
          variant: 'secondary' as const,
          icon: CheckCircle2,
          className: 'bg-gray-100 text-gray-600'
        }
      case 'ongoing':
        return {
          label: 'Läuft',
          variant: 'default' as const,
          icon: AlertCircle,
          className: 'bg-green-100 text-green-700'
        }
      case 'upcoming':
        return {
          label: 'Geplant',
          variant: 'outline' as const,
          icon: Clock,
          className: 'bg-blue-100 text-blue-700'
        }
      default:
        return {
          label: 'Unbekannt',
          variant: 'secondary' as const,
          icon: Calendar,
          className: 'bg-gray-100 text-gray-600'
        }
    }
  }

  const eventStatus = getEventStatus(event)
  const statusConfig = getStatusConfig(eventStatus)
  const StatusIcon = statusConfig.icon

  return (
    <Badge variant={statusConfig.variant} className={statusConfig.className}>
      <StatusIcon className="w-3 h-3 mr-1" />
      {statusConfig.label}
    </Badge>
  )
} 