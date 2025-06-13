import React, { useState } from 'react'
import { Plus, X, Calendar, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'

import { Event, DailyTimeSlot } from '../models/events'
import { EventCategory } from '../models/event-category'
import { validateRequired, validateUrl, combineValidations } from '@/shared/utils/validation'

export interface EventEditFormProps {
  event: Partial<Event>
  categories: EventCategory[]
  onChange: (field: keyof Event, value: any) => void
  onSocialMediaChange: (platform: 'instagram' | 'facebook' | 'tiktok', value: string) => void
}

export function EventEditForm({ 
  event, 
  categories, 
  onChange, 
  onSocialMediaChange 
}: EventEditFormProps) {
  const [newTimeSlot, setNewTimeSlot] = useState<DailyTimeSlot>({
    date: '',
    from: '',
    to: ''
  })

  const handleAddTimeSlot = () => {
    if (!newTimeSlot.date) return

    const currentSlots = event.dailyTimeSlots || []
    const updatedSlots = [...currentSlots, { ...newTimeSlot }]
    
    onChange('dailyTimeSlots', updatedSlots)
    setNewTimeSlot({ date: '', from: '', to: '' })
  }

  const handleRemoveTimeSlot = (index: number) => {
    const currentSlots = event.dailyTimeSlots || []
    const updatedSlots = currentSlots.filter((_, i) => i !== index)
    onChange('dailyTimeSlots', updatedSlots)
  }

  const handleTimeSlotChange = (index: number, field: keyof DailyTimeSlot, value: string) => {
    const currentSlots = event.dailyTimeSlots || []
    const updatedSlots = [...currentSlots]
    updatedSlots[index] = { ...updatedSlots[index], [field]: value }
    onChange('dailyTimeSlots', updatedSlots)
  }

  const handleLocationChange = (field: string, value: string | number) => {
    const currentLocation = event.location || { address: '', latitude: 0, longitude: 0 }
    onChange('location', {
      ...currentLocation,
      [field]: value
    })
  }

  const validateWebsite = (url: string) => {
    if (!url) return { isValid: true, errors: [] }
    return validateUrl(url)
  }

  const sortedSlots = (event.dailyTimeSlots || []).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Grundinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={event.title || ''}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder="Event-Titel"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Select 
                value={event.categoryId || ''} 
                onValueChange={(value) => onChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preis (€)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={event.price || ''}
                onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                value={event.maxParticipants || ''}
                onChange={(e) => onChange('maxParticipants', parseInt(e.target.value) || undefined)}
                placeholder="Unbegrenzt"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Termine
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Time Slots */}
          {sortedSlots.length > 0 && (
            <div className="space-y-3">
              {sortedSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Input
                      type="date"
                      value={slot.date}
                      onChange={(e) => handleTimeSlotChange(index, 'date', e.target.value)}
                    />
                    <Input
                      type="time"
                      value={slot.from || ''}
                      onChange={(e) => handleTimeSlotChange(index, 'from', e.target.value)}
                      placeholder="Start"
                    />
                    <Input
                      type="time"
                      value={slot.to || ''}
                      onChange={(e) => handleTimeSlotChange(index, 'to', e.target.value)}
                      placeholder="Ende"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveTimeSlot(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Time Slot */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <Input
                  type="date"
                  value={newTimeSlot.date}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, date: e.target.value })}
                  placeholder="Datum"
                />
                <Input
                  type="time"
                  value={newTimeSlot.from || ''}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, from: e.target.value })}
                  placeholder="Start"
                />
                <Input
                  type="time"
                  value={newTimeSlot.to || ''}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, to: e.target.value })}
                  placeholder="Ende"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTimeSlot}
                disabled={!newTimeSlot.date}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Fügen Sie Termine hinzu. Zeit ist optional für ganztägige Events.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Veranstaltungsort</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={event.location?.address || ''}
              onChange={(e) => handleLocationChange('address', e.target.value)}
              placeholder="Straße, PLZ Ort"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Breitengrad</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={event.location?.latitude || ''}
                onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value) || 0)}
                placeholder="49.4521"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Längengrad</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={event.location?.longitude || ''}
                onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
                placeholder="11.0767"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Links */}
      <Card>
        <CardHeader>
          <CardTitle>Kontakt & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">E-Mail</Label>
              <Input
                id="contactEmail"
                type="email"
                value={event.contactEmail || ''}
                onChange={(e) => onChange('contactEmail', e.target.value)}
                placeholder="kontakt@event.de"
              />
            </div>
            
            <div>
              <Label htmlFor="contactPhone">Telefon</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={event.contactPhone || ''}
                onChange={(e) => onChange('contactPhone', e.target.value)}
                placeholder="+49 123 456789"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={event.website || ''}
              onChange={(e) => onChange('website', e.target.value)}
              placeholder="https://www.event.de"
            />
          </div>

          {/* Social Media */}
          <div className="space-y-3">
            <Label>Social Media</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                <Input
                  id="instagram"
                  value={event.socialMedia?.instagram || ''}
                  onChange={(e) => onSocialMediaChange('instagram', e.target.value)}
                  placeholder="@username"
                />
              </div>
              
              <div>
                <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                <Input
                  id="facebook"
                  value={event.socialMedia?.facebook || ''}
                  onChange={(e) => onSocialMediaChange('facebook', e.target.value)}
                  placeholder="Facebook URL"
                />
              </div>
              
              <div>
                <Label htmlFor="tiktok" className="text-sm">TikTok</Label>
                <Input
                  id="tiktok"
                  value={event.socialMedia?.tiktok || ''}
                  onChange={(e) => onSocialMediaChange('tiktok', e.target.value)}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ticketsNeeded">Tickets erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Sind Tickets für dieses Event erforderlich?
              </p>
            </div>
            <Switch
              id="ticketsNeeded"
              checked={event.ticketsNeeded || false}
              onCheckedChange={(checked) => onChange('ticketsNeeded', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPromoted">Event hervorheben</Label>
              <p className="text-sm text-muted-foreground">
                Soll dieses Event besonders hervorgehoben werden?
              </p>
            </div>
            <Switch
              id="isPromoted"
              checked={event.isPromoted || false}
              onCheckedChange={(checked) => onChange('isPromoted', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 