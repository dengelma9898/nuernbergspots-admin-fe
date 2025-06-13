import { format, isPast, isFuture, isWithinInterval, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

import { Event, DailyTimeSlot } from '@/modules/events/models'

export interface EventTimeInfo {
  startDate: Date
  endDate: Date
  isMultiDay: boolean
  duration: string
  formattedTimeRange: string
}

/**
 * Konvertiert dailyTimeSlots zu einem einheitlichen Event-Zeit-Objekt
 */
export function getEventTimeInfo(event: Event): EventTimeInfo | null {
  if (!event.dailyTimeSlots || event.dailyTimeSlots.length === 0) {
    // Fallback zu legacy properties falls vorhanden
    if (event.startDate) {
      const startDate = parseISO(event.startDate)
      const endDate = event.endDate ? parseISO(event.endDate) : startDate
      
      return {
        startDate,
        endDate,
        isMultiDay: event.startDate !== event.endDate,
        duration: formatEventDuration(startDate, endDate, event.timeStart, event.timeEnd),
        formattedTimeRange: formatLegacyTimeRange(event)
      }
    }
    return null
  }

  const sortedSlots = [...event.dailyTimeSlots].sort((a, b) => a.date.localeCompare(b.date))
  const firstSlot = sortedSlots[0]
  const lastSlot = sortedSlots[sortedSlots.length - 1]

  const startDate = parseISO(firstSlot.date)
  const endDate = parseISO(lastSlot.date)
  const isMultiDay = firstSlot.date !== lastSlot.date || sortedSlots.length > 1

  return {
    startDate,
    endDate,
    isMultiDay,
    duration: formatDailySlotsDuration(sortedSlots),
    formattedTimeRange: formatDailySlotsTimeRange(sortedSlots)
  }
}

/**
 * Prüft den aktuellen Status eines Events basierend auf dailyTimeSlots
 */
export function getEventStatus(event: Event): 'past' | 'ongoing' | 'upcoming' | 'unknown' {
  const timeInfo = getEventTimeInfo(event)
  if (!timeInfo) return 'unknown'

  const now = new Date()
  
  // Für Events mit dailyTimeSlots prüfen wir jeden Slot
  if (event.dailyTimeSlots && event.dailyTimeSlots.length > 0) {
    const sortedSlots = [...event.dailyTimeSlots].sort((a, b) => a.date.localeCompare(b.date))
    
    // Prüfe ob mindestens ein Slot in der Zukunft liegt
    const hasUpcomingSlots = sortedSlots.some(slot => {
      const slotDate = parseISO(slot.date)
      if (slot.to) {
        const [hours, minutes] = slot.to.split(':').map(Number)
        slotDate.setHours(hours, minutes)
      } else {
        slotDate.setHours(23, 59) // Ende des Tages falls keine Endzeit
      }
      return isFuture(slotDate)
    })

    // Prüfe ob mindestens ein Slot aktuell läuft
    const hasOngoingSlots = sortedSlots.some(slot => {
      const slotStartDate = parseISO(slot.date)
      const slotEndDate = parseISO(slot.date)
      
      if (slot.from) {
        const [startHours, startMinutes] = slot.from.split(':').map(Number)
        slotStartDate.setHours(startHours, startMinutes)
      } else {
        slotStartDate.setHours(0, 0) // Beginn des Tages
      }
      
      if (slot.to) {
        const [endHours, endMinutes] = slot.to.split(':').map(Number)
        slotEndDate.setHours(endHours, endMinutes)
      } else {
        slotEndDate.setHours(23, 59) // Ende des Tages
      }
      
      return isWithinInterval(now, { start: slotStartDate, end: slotEndDate })
    })

    if (hasOngoingSlots) return 'ongoing'
    if (hasUpcomingSlots) return 'upcoming'
    return 'past'
  }

  // Fallback für legacy properties
  if (isPast(timeInfo.endDate)) return 'past'
  if (isWithinInterval(now, { start: timeInfo.startDate, end: timeInfo.endDate })) return 'ongoing'
  if (isFuture(timeInfo.startDate)) return 'upcoming'
  
  return 'unknown'
}

/**
 * Formatiert die Zeitangaben für dailyTimeSlots
 */
function formatDailySlotsTimeRange(slots: DailyTimeSlot[]): string {
  if (slots.length === 0) return ''

  const sortedSlots = [...slots].sort((a, b) => a.date.localeCompare(b.date))
  
  if (sortedSlots.length === 1) {
    const slot = sortedSlots[0]
    const date = format(parseISO(slot.date), 'dd.MM.yyyy', { locale: de })
    
    if (slot.from && slot.to) {
      return `${date} von ${slot.from} bis ${slot.to} Uhr`
    } else if (slot.from) {
      return `${date} ab ${slot.from} Uhr`
    } else {
      return `${date} (ganztägig)`
    }
  }

  // Mehrere Slots
  const firstSlot = sortedSlots[0]
  const lastSlot = sortedSlots[sortedSlots.length - 1]
  const startDate = format(parseISO(firstSlot.date), 'dd.MM.yyyy', { locale: de })
  const endDate = format(parseISO(lastSlot.date), 'dd.MM.yyyy', { locale: de })

  if (startDate === endDate) {
    // Mehrere Slots am selben Tag
    const times = sortedSlots
      .filter(slot => slot.from && slot.to)
      .map(slot => `${slot.from}-${slot.to}`)
      .join(', ')
    return times ? `${startDate}: ${times} Uhr` : `${startDate} (ganztägig)`
  } else {
    // Mehrere Tage
    return `${startDate} bis ${endDate}`
  }
}

/**
 * Formatiert die Dauer für dailyTimeSlots
 */
function formatDailySlotsDuration(slots: DailyTimeSlot[]): string {
  if (slots.length === 0) return ''
  
  const sortedSlots = [...slots].sort((a, b) => a.date.localeCompare(b.date))
  
  if (sortedSlots.length === 1) {
    const slot = sortedSlots[0]
    if (slot.from && slot.to) {
      return `${slot.from} - ${slot.to} Uhr`
    }
    return 'Ganztägig'
  }

  const uniqueDates = new Set(sortedSlots.map(slot => slot.date))
  return `${uniqueDates.size} Termin(e)`
}

/**
 * Legacy-Funktion für alte Event-Properties
 */
function formatLegacyTimeRange(event: Event): string {
  if (!event.startDate) return ''
  
  const startDate = format(parseISO(event.startDate), 'dd.MM.yyyy', { locale: de })
  const endDate = event.endDate ? format(parseISO(event.endDate), 'dd.MM.yyyy', { locale: de }) : startDate
  
  if (startDate === endDate) {
    if (event.timeStart && event.timeEnd) {
      return `${startDate} von ${event.timeStart} bis ${event.timeEnd} Uhr`
    }
    return startDate
  } else {
    const timeRange = event.timeStart && event.timeEnd 
      ? ` ${event.timeStart} - ${event.timeEnd} Uhr`
      : ''
    return `${startDate} bis ${endDate}${timeRange}`
  }
}

/**
 * Legacy-Funktion für Event-Dauer
 */
function formatEventDuration(startDate: Date, endDate: Date, timeStart?: string, timeEnd?: string): string {
  if (timeStart && timeEnd) {
    return `${timeStart} - ${timeEnd} Uhr`
  }
  
  if (startDate.getTime() === endDate.getTime()) {
    return 'Ganztägig'
  }
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays} Tag(e)`
}

/**
 * Hilfsfunktion um zu prüfen ob ein Event aktuelle dailyTimeSlots hat
 */
export function hasValidTimeSlots(event: Event): boolean {
  return Boolean(event.dailyTimeSlots && event.dailyTimeSlots.length > 0)
}

/**
 * Konvertiert legacy Event-Properties zu dailyTimeSlots
 */
export function convertLegacyToTimeSlots(event: Event): DailyTimeSlot[] {
  if (hasValidTimeSlots(event)) {
    return event.dailyTimeSlots
  }

  // Konvertiere legacy properties
  if (event.startDate) {
    const slots: DailyTimeSlot[] = []
    
    if (event.endDate && event.startDate !== event.endDate) {
      // Multi-day event - erstelle Slots für jeden Tag
      const start = parseISO(event.startDate)
      const end = parseISO(event.endDate)
      const current = new Date(start)
      
      while (current <= end) {
        slots.push({
          date: format(current, 'yyyy-MM-dd'),
          from: current.getTime() === start.getTime() ? event.timeStart : undefined,
          to: current.getTime() === end.getTime() ? event.timeEnd : undefined
        })
        current.setDate(current.getDate() + 1)
      }
    } else {
      // Single day event
      slots.push({
        date: event.startDate,
        from: event.timeStart,
        to: event.timeEnd
      })
    }
    
    return slots
  }

  return []
} 