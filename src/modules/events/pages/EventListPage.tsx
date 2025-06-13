import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Calendar, MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { LoadingOverlay } from '@/shared/components'
import { Event, EventCategory } from '@/modules/events/models'
import { EventStatus } from '@/modules/events/components'
import { getEventTimeInfo } from '@/modules/events/utils'
import { useEventService, useEventCategoryService } from '@/modules/events/services'

interface EventFilters {
  search: string
  categoryId: string
  status: 'all' | 'upcoming' | 'ongoing' | 'past'
}

export function EventListPage() {
  const navigate = useNavigate()
  const eventService = useEventService()
  const eventCategoryService = useEventCategoryService()
  
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    categoryId: '',
    status: 'all'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fetchedEvents, fetchedCategories] = await Promise.all([
        eventService.getEvents(),
        eventCategoryService.getCategories()
      ])
      setEvents(fetchedEvents)
      setCategories(fetchedCategories)
    } catch (error) {
      toast.error('Fehler beim Laden', {
        description: 'Die Events konnten nicht geladen werden.'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = event.title.toLowerCase().includes(searchLower)
      const matchesDescription = event.description?.toLowerCase().includes(searchLower) || false
      const matchesLocation = event.location?.address.toLowerCase().includes(searchLower) || false
      
      if (!matchesTitle && !matchesDescription && !matchesLocation) {
        return false
      }
    }

    // Category filter
    if (filters.categoryId && event.categoryId !== filters.categoryId) {
      return false
    }

    // Status filter
    if (filters.status !== 'all') {
      // TODO: Implement status filtering with getEventStatus
      // const eventStatus = getEventStatus(event)
      // if (eventStatus !== filters.status) return false
    }

    return true
  })

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Keine Kategorie'
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'Unbekannte Kategorie'
  }

  const formatEventTime = (event: Event) => {
    const timeInfo = getEventTimeInfo(event)
    if (!timeInfo) return 'Keine Zeitangaben'
    return timeInfo.formattedTimeRange
  }

  if (loading) {
    return <LoadingOverlay isLoading={true} text="Events werden geladen..." />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Events und Veranstaltungen
          </p>
        </div>
        <Button onClick={() => navigate('/events/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Event
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Events suchen..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.categoryId} 
              onValueChange={(value) => handleFilterChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Kategorien</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value as EventFilters['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="upcoming">Geplant</SelectItem>
                <SelectItem value="ongoing">Läuft</SelectItem>
                <SelectItem value="past">Beendet</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setFilters({ search: '', categoryId: '', status: 'all' })}
            >
              Filter zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Events gefunden</h3>
                <p className="text-muted-foreground mb-4">
                  {filters.search || filters.categoryId || filters.status !== 'all'
                    ? 'Keine Events entsprechen den aktuellen Filtern.'
                    : 'Es wurden noch keine Events erstellt.'
                  }
                </p>
                {!filters.search && !filters.categoryId && filters.status === 'all' && (
                  <Button onClick={() => navigate('/events/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Erstes Event erstellen
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleEventClick(event.id)}
            >
              {/* Event Image */}
              {event.titleImageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={event.titleImageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <EventStatus event={event} />
                      <Badge variant="outline" className="text-xs">
                        {getCategoryName(event.categoryId)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Time & Date */}
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {formatEventTime(event)}
                    </span>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground line-clamp-1">
                        {event.location.address}
                      </span>
                    </div>
                  )}

                  {/* Description Preview */}
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Price */}
                  {event.price !== undefined && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium">
                        {event.price === 0 ? 'Kostenlos' : `${event.price.toFixed(2)} €`}
                      </span>
                      {event.maxParticipants && (
                        <span className="text-xs text-muted-foreground">
                          Max. {event.maxParticipants} Teilnehmer
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredEvents.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {filteredEvents.length} von {events.length} Events angezeigt
        </div>
      )}
    </div>
  )
} 