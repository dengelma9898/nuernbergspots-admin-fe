import React from 'react'
import { MapPin, Calendar, Clock, Euro, Heart, Ticket } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Event } from '../models/events'
import { EventStatus } from './EventStatus'
import { getEventTimeInfo } from '../utils/eventDateUtils'

export interface EventBasicInfoProps {
  event: Event
  isEditing?: boolean
}

export function EventBasicInfo({ event, isEditing = false }: EventBasicInfoProps) {
  const getEventDateTime = (event: Event) => {
    const timeInfo = getEventTimeInfo(event)
    if (!timeInfo) return 'Keine Zeitangaben verfügbar'
    
    return timeInfo.formattedTimeRange
  }

  if (isEditing) {
    return null // Editing form will be handled in parent component
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
            <EventStatus event={event} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="font-medium">Datum & Uhrzeit</p>
              <p className="text-sm text-muted-foreground">
                {getEventDateTime(event)}
              </p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium">Veranstaltungsort</p>
                <p className="text-sm text-muted-foreground">
                  {event.location.address}
                </p>
              </div>
            </div>
          )}

          {event.price !== undefined && (
            <div className="flex items-start gap-3">
              <Euro className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium">Preis</p>
                <p className="text-sm text-muted-foreground">
                  {event.price === 0 ? 'Kostenlos' : `${event.price.toFixed(2)} €`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">Likes</span>
            </div>
            <Badge variant="secondary">
              {event.likeCount || 0}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Interessiert</span>
            </div>
            <Badge variant="secondary">
              {event.interestedCount || 0}
            </Badge>
          </div>

          {event.maxParticipants && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-green-500" />
                <span className="text-sm">Teilnehmerplätze</span>
              </div>
              <Badge variant="secondary">
                {event.maxParticipants}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 