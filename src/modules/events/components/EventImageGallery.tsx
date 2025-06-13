import React, { useState } from 'react'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'

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

export interface EventImageGalleryProps {
  images: string[]
  onImageUpload?: (files: File[]) => void
  onImageDelete?: (imageUrl: string) => void
  isEditing?: boolean
  isUploading?: boolean
  maxImages?: number
}

export function EventImageGallery({ 
  images,
  onImageUpload,
  onImageDelete,
  isEditing = false,
  isUploading = false,
  maxImages = 10
}: EventImageGalleryProps) {
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = images.length + selectedFiles.length + files.length
    
    if (totalImages > maxImages) {
      // You could emit an error here
      return
    }

    setSelectedFiles(prev => [...prev, ...files])
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviews])
  }

  const removePreview = (index: number) => {
    const newFiles = [...selectedFiles]
    const newPreviews = [...previewUrls]
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index])
    
    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    
    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)
  }

  const handleUpload = () => {
    if (onImageUpload && selectedFiles.length > 0) {
      onImageUpload(selectedFiles)
      setSelectedFiles([])
      setPreviewUrls([])
    }
  }

  const confirmDeleteImage = () => {
    if (imageToDelete && onImageDelete) {
      onImageDelete(imageToDelete)
      setImageToDelete(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Event Bilder {images.length > 0 && `(${images.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Existing Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Event Bild ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {isEditing && (
                  <button
                    onClick={() => setImageToDelete(imageUrl)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Preview new images */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Vorschau ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-dashed border-blue-300"
                />
                <button
                  onClick={() => removePreview(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload controls */}
        {isEditing && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="event-images"
                disabled={images.length >= maxImages}
              />
              <label
                htmlFor="event-images"
                className={`cursor-pointer ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={images.length >= maxImages}
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Bilder auswählen
                  </span>
                </Button>
              </label>
              
              {selectedFiles.length > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : `${selectedFiles.length} Bild(er) hochladen`}
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {images.length}/{maxImages} Bilder hochgeladen
            </p>
          </div>
        )}

        {/* No images state */}
        {images.length === 0 && !isEditing && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Keine Bilder vorhanden</p>
          </div>
        )}

        {/* Delete confirmation dialog */}
        <Dialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bild löschen</DialogTitle>
              <DialogDescription>
                Möchten Sie dieses Bild wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImageToDelete(null)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={confirmDeleteImage}>
                Löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 