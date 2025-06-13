import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Save, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { LoadingOverlay } from '@/shared/components'
import { useEventDetail } from '@/modules/events/hooks/useEventDetail'
import { EventStatus, EventBasicInfo, EventImageGallery, EventEditForm } from '@/modules/events/components'
import { useEventImageService, type ImageUploadProgress } from '@/modules/events/services'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const imageService = useEventImageService()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress[]>([])

  const {
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
    refetchEvent,
  } = useEventDetail(id)

  const handleImageUpload = async (files: File[]) => {
    if (!event || !id) return
    
    try {
      setIsUploading(true)
      setUploadProgress([])
      
      await imageService.uploadEventImages(id, files, (progress) => {
        setUploadProgress(prev => {
          const existing = prev.find(p => p.filename === progress.filename)
          if (existing) {
            return prev.map(p => p.filename === progress.filename ? progress : p)
          }
          return [...prev, progress]
        })
      })
      
      toast.success('Bilder hochgeladen', {
        description: `${files.length} Bild(er) erfolgreich hochgeladen.`
      })
      await refetchEvent()
    } catch (error) {
      toast.error('Fehler beim Hochladen', {
        description: error instanceof Error ? error.message : 'Die Bilder konnten nicht hochgeladen werden.'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress([])
    }
  }

  const handleImageDelete = async (imageUrl: string) => {
    if (!event || !id) return
    
    try {
      await imageService.removeEventImage(id, imageUrl)
      toast.success('Bild gelöscht', {
        description: 'Das Bild wurde erfolgreich gelöscht.'
      })
      await refetchEvent()
    } catch (error) {
      toast.error('Fehler beim Löschen', {
        description: error instanceof Error ? error.message : 'Das Bild konnte nicht gelöscht werden.'
      })
    }
  }

  const confirmDelete = async () => {
    await handleDelete()
    setShowDeleteDialog(false)
  }

  if (loading) {
    return <LoadingOverlay isLoading={true} text="Event wird geladen..." />
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Event nicht gefunden</h2>
            <p className="text-muted-foreground mb-4">
              Das angeforderte Event konnte nicht gefunden werden.
            </p>
            <Button onClick={() => navigate('/events')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <EventStatus event={event} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button onClick={handleEdit} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
              <Button 
                onClick={() => setShowDeleteDialog(true)} 
                variant="destructive"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Abbrechen
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!isEventChanged()}
              >
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          {isEditing ? (
            <EventEditForm
              event={editedEvent}
              categories={categories}
              onChange={handleInputChange}
              onSocialMediaChange={handleSocialMediaChange}
            />
          ) : (
            <EventBasicInfo event={event} />
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <textarea
                    value={editedEvent.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full min-h-[150px] p-3 border rounded-md resize-none"
                    placeholder="Event-Beschreibung..."
                  />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">
                    {event.description || 'Keine Beschreibung verfügbar.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Gallery */}
          <EventImageGallery
            images={event.imageUrls || []}
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
            isEditing={isEditing}
            isUploading={isUploading}
            maxImages={10}
          />

          {/* Contact Information */}
          {(event.contactEmail || event.contactPhone || event.website) && (
            <Card>
              <CardHeader>
                <CardTitle>Kontakt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.contactEmail && (
                  <div>
                    <p className="text-sm font-medium">E-Mail</p>
                    <a
                      href={`mailto:${event.contactEmail}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {event.contactEmail}
                    </a>
                  </div>
                )}
                {event.contactPhone && (
                  <div>
                    <p className="text-sm font-medium">Telefon</p>
                    <a
                      href={`tel:${event.contactPhone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {event.contactPhone}
                    </a>
                  </div>
                )}
                {event.website && (
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {event.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Media */}
          {(event.socialMedia?.instagram || event.socialMedia?.facebook || event.socialMedia?.tiktok) && (
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.socialMedia?.instagram && (
                  <div>
                    <p className="text-sm font-medium">Instagram</p>
                    <a
                      href={`https://instagram.com/${event.socialMedia.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      @{event.socialMedia.instagram}
                    </a>
                  </div>
                )}
                {event.socialMedia?.facebook && (
                  <div>
                    <p className="text-sm font-medium">Facebook</p>
                    <a
                      href={event.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {event.socialMedia.facebook}
                    </a>
                  </div>
                )}
                {event.socialMedia?.tiktok && (
                  <div>
                    <p className="text-sm font-medium">TikTok</p>
                    <a
                      href={`https://tiktok.com/@${event.socialMedia.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      @{event.socialMedia.tiktok}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie das Event "{event.title}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 