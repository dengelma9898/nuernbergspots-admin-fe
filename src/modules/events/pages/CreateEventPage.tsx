import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { LoadingOverlay } from '@/shared/components'
import { Event, DailyTimeSlot, EventCategory } from '@/modules/events/models'
import { EventEditForm } from '@/modules/events/components'
import { useEventService, useEventCategoryService } from '@/modules/events/services'
import { validateRequired, validateEmail, validateUrl, combineValidations } from '@/shared/utils/validation'

interface CreateEventFormData extends Partial<Event> {
  dailyTimeSlots: DailyTimeSlot[]
}

export function CreateEventPage() {
  const navigate = useNavigate()
  const eventService = useEventService()
  const eventCategoryService = useEventCategoryService()
  
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<CreateEventFormData>({
    title: '',
    description: '',
    dailyTimeSlots: [],
    location: {
      address: '',
      latitude: 0,
      longitude: 0
    },
    price: 0,
    categoryId: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      tiktok: ''
    },
    ticketsNeeded: false,
    isPromoted: false,
    maxParticipants: undefined,
    imageUrls: [],
    titleImageUrl: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const fetchedCategories = await eventCategoryService.getCategories()
      setCategories(fetchedCategories)
    } catch (error) {
      toast.error('Fehler beim Laden', {
        description: 'Die Kategorien konnten nicht geladen werden.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Event, value: any) => {
    if (field === 'socialMedia') {
      setEvent(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          ...value
        }
      }))
    } else {
      setEvent(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: []
      }))
    }
  }

  const handleSocialMediaChange = (platform: 'instagram' | 'facebook' | 'tiktok', value: string) => {
    setEvent(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {}

    // Title validation
    const titleValidation = validateRequired(event.title || '', 'Titel')
    if (!titleValidation.isValid) {
      errors.title = titleValidation.errors
    }

    // Location validation
    if (!event.location?.address) {
      errors.location = ['Adresse ist erforderlich']
    }

    // Time slots validation
    if (!event.dailyTimeSlots || event.dailyTimeSlots.length === 0) {
      errors.dailyTimeSlots = ['Mindestens ein Termin ist erforderlich']
    } else {
      // Validate each time slot
      const invalidSlots = event.dailyTimeSlots.filter(slot => !slot.date)
      if (invalidSlots.length > 0) {
        errors.dailyTimeSlots = ['Alle Termine müssen ein Datum haben']
      }
    }

    // Email validation
    if (event.contactEmail) {
      const emailValidation = validateEmail(event.contactEmail)
      if (!emailValidation.isValid) {
        errors.contactEmail = emailValidation.errors
      }
    }

    // Website validation
    if (event.website) {
      const urlValidation = validateUrl(event.website)
      if (!urlValidation.isValid) {
        errors.website = urlValidation.errors
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Validierungsfehler', {
        description: 'Bitte korrigieren Sie die markierten Felder.'
      })
      return
    }

    try {
      setSaving(true)
      
      // Clean up the event data before sending
      const eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        title: event.title!,
        description: event.description || undefined,
        dailyTimeSlots: event.dailyTimeSlots,
        location: event.location!,
        price: event.price || 0,
        categoryId: event.categoryId || undefined,
        contactEmail: event.contactEmail || undefined,
        contactPhone: event.contactPhone || undefined,
        website: event.website || undefined,
        socialMedia: event.socialMedia,
        ticketsNeeded: event.ticketsNeeded || false,
        isPromoted: event.isPromoted || false,
        maxParticipants: event.maxParticipants || undefined,
        imageUrls: event.imageUrls || [],
        titleImageUrl: event.titleImageUrl || undefined,
        likeCount: 0,
        interestedCount: 0
      }

      const createdEvent = await eventService.createEvent(eventData)
      
      toast.success('Event erstellt', {
        description: 'Das Event wurde erfolgreich erstellt.'
      })
      
      navigate(`/events/${createdEvent.id}`)
    } catch (error) {
      toast.error('Fehler beim Speichern', {
        description: 'Das Event konnte nicht erstellt werden.'
      })
    } finally {
      setSaving(false)
    }
  }

  const canSave = () => {
    return !!(
      event.title &&
      event.location?.address &&
      event.dailyTimeSlots &&
      event.dailyTimeSlots.length > 0 &&
      event.dailyTimeSlots.every(slot => slot.date)
    )
  }

  if (loading) {
    return <LoadingOverlay isLoading={true} text="Kategorien werden geladen..." />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Neues Event erstellen</h1>
            <p className="text-muted-foreground">
              Erstellen Sie ein neues Event mit allen notwendigen Details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!canSave() || saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <LoadingOverlay isLoading={true} size="sm" />
                Wird gespeichert...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Event erstellen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Errors Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Validierungsfehler</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(validationErrors).map(([field, errors]) => 
                errors.map((error, index) => (
                  <li key={`${field}-${index}`} className="text-destructive">
                    {error}
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <EventEditForm
            event={event}
            categories={categories}
            onChange={handleInputChange}
            onSocialMediaChange={handleSocialMediaChange}
          />

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">Event-Beschreibung</Label>
                <Textarea
                  id="description"
                  value={event.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Beschreiben Sie Ihr Event detailliert..."
                  className="min-h-[150px] mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Eine ausführliche Beschreibung hilft Teilnehmern, Ihr Event besser zu verstehen.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event-Übersicht
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Titel</p>
                  <p className="text-sm text-muted-foreground">
                    {event.title || 'Noch nicht angegeben'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Termine</p>
                  <p className="text-sm text-muted-foreground">
                    {event.dailyTimeSlots?.length || 0} Termin(e)
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Ort</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location?.address || 'Noch nicht angegeben'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Preis</p>
                  <p className="text-sm text-muted-foreground">
                    {event.price === 0 ? 'Kostenlos' : 
                     event.price ? `${event.price.toFixed(2)} €` : 'Noch nicht angegeben'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tipps für erfolgreiche Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Wählen Sie einen aussagekräftigen Titel</li>
                <li>• Fügen Sie eine detaillierte Beschreibung hinzu</li>
                <li>• Geben Sie genaue Uhrzeiten an</li>
                <li>• Fügen Sie Kontaktinformationen hinzu</li>
                <li>• Verwenden Sie ansprechende Bilder</li>
                <li>• Verlinken Sie Social Media Profile</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 