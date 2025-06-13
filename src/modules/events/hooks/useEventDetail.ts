import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Event, EventCategory } from '@/modules/events/models'
import { useEventService, useEventCategoryService, useEventImageService } from '@/modules/events/services'

export interface UseEventDetailReturn {
  event: Event | null
  categories: EventCategory[]
  loading: boolean
  isEditing: boolean
  editedEvent: Partial<Event>
  setIsEditing: (editing: boolean) => void
  setEditedEvent: (event: Partial<Event>) => void
  handleEdit: () => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleDelete: () => Promise<void>
  handleInputChange: (field: keyof Event, value: any) => void
  handleSocialMediaChange: (platform: 'instagram' | 'facebook' | 'tiktok', value: string) => void
  isEventChanged: () => boolean
  refetchEvent: () => Promise<void>
}

export function useEventDetail(eventId: string | undefined): UseEventDetailReturn {
  const navigate = useNavigate()
  const eventService = useEventService()
  const eventCategoryService = useEventCategoryService()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({})

  const loadData = useCallback(async () => {
    if (!eventId) return
    
    try {
      setLoading(true)
      const [fetchedEvent, fetchedCategories] = await Promise.all([
        eventService.getEvent(eventId),
        eventCategoryService.getCategories()
      ])
      setEvent(fetchedEvent)
      setCategories(fetchedCategories)
    } catch (error) {
      toast.error("Fehler beim Laden des Events", {
        description: "Das Event konnte nicht geladen werden. Bitte versuchen Sie es später erneut.",
      })
      navigate('/events')
    } finally {
      setLoading(false)
    }
  }, [eventId, eventService, eventCategoryService, navigate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEdit = useCallback(() => {
    setEditedEvent(event || {})
    setIsEditing(true)
  }, [event])

  const handleSave = useCallback(async () => {
    if (!eventId || !editedEvent) return
    
    try {
      await eventService.updateEvent(eventId, editedEvent)
      toast.success("Event aktualisiert", {
        description: "Das Event wurde erfolgreich aktualisiert.",
      })
      setIsEditing(false)
      await loadData()
    } catch (error) {
      toast.error("Fehler beim Aktualisieren", {
        description: "Das Event konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.",
      })
    }
  }, [eventId, editedEvent, eventService, loadData])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditedEvent({})
  }, [])

  const handleDelete = useCallback(async () => {
    if (!eventId) return
    
    try {
      await eventService.deleteEvent(eventId)
      toast.success("Event gelöscht", {
        description: "Das Event wurde erfolgreich gelöscht.",
      })
      navigate('/events')
    } catch (error) {
      toast.error("Fehler beim Löschen", {
        description: "Das Event konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
      })
    }
  }, [eventId, eventService, navigate])

  const handleInputChange = useCallback((field: keyof Event, value: any) => {
    if (field === 'socialMedia') {
      setEditedEvent(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          ...value
        }
      }))
    } else {
      setEditedEvent(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }, [])

  const handleSocialMediaChange = useCallback((platform: 'instagram' | 'facebook' | 'tiktok', value: string) => {
    setEditedEvent(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }, [])

  const isEventChanged = useCallback(() => {
    if (!event || !editedEvent) return false
    
    // Compare relevant fields (using new dailyTimeSlots structure)
    const fieldsToCompare: (keyof Event)[] = [
      'title', 'description', 'dailyTimeSlots', 'price', 'maxParticipants', 'categoryId'
    ]
    
    return fieldsToCompare.some(field => {
      const originalValue = event[field]
      const editedValue = editedEvent[field]
      
      // Special handling for dailyTimeSlots array comparison
      if (field === 'dailyTimeSlots') {
        return JSON.stringify(originalValue) !== JSON.stringify(editedValue)
      }
      
      // Handle different types of comparison
      if (originalValue !== editedValue) {
        return true
      }
      
      return false
    })
  }, [event, editedEvent])

  return {
    event,
    categories,
    loading,
    isEditing,
    editedEvent,
    setIsEditing,
    setEditedEvent,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleInputChange,
    handleSocialMediaChange,
    isEventChanged,
    refetchEvent: loadData,
  }
} 