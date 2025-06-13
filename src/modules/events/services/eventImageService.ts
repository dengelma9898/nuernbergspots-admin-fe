import { useApi, endpoints } from '@/lib/api'
import { ApiResponse, unwrapData } from '@/lib/apiUtils'
import { Event } from '@/modules/events/models'
import { mapLegacyEventToModern, type LegacyEventAPI } from './eventApiMapper'

export interface ImageUploadResult {
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  size: number
  filename: string
}

export interface ImageUploadProgress {
  eventId: string
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export const useEventImageService = () => {
  const api = useApi()

  /**
   * Validates image files before upload
   */
  const validateImageFiles = (files: File[]): string[] => {
    const errors: string[] = []
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxFiles = 10

    if (files.length === 0) {
      errors.push('Mindestens ein Bild ist erforderlich')
      return errors
    }

    if (files.length > maxFiles) {
      errors.push(`Maximal ${maxFiles} Bilder erlaubt`)
    }

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Datei ${index + 1} (${file.name}): Ungültiger Dateityp. Erlaubt: JPG, PNG, WebP`)
      }

      if (file.size > maxFileSize) {
        errors.push(`Datei ${index + 1} (${file.name}): Zu groß (max. 10MB)`)
      }

      if (file.size === 0) {
        errors.push(`Datei ${index + 1} (${file.name}): Datei ist leer`)
      }
    })

    return errors
  }

  /**
   * Uploads multiple images for an event
   */
  const uploadEventImages = async (
    eventId: string, 
    files: File[],
    onProgress?: (progress: ImageUploadProgress) => void
  ): Promise<ImageUploadResult[]> => {
    const validationErrors = validateImageFiles(files)
    if (validationErrors.length > 0) {
      throw new Error(`Validierungsfehler: ${validationErrors.join(', ')}`)
    }

    const results: ImageUploadResult[] = []

    for (const file of files) {
      try {
        onProgress?.({
          eventId,
          filename: file.name,
          progress: 0,
          status: 'uploading'
        })

        const formData = new FormData()
        formData.append('image', file)

        const response = await api.post<ApiResponse<ImageUploadResult>>(
          `${endpoints.events}/${eventId}/images`,
          formData,
          { isFormData: true }
        )

        onProgress?.({
          eventId,
          filename: file.name,
          progress: 100,
          status: 'processing'
        })

        const result = unwrapData(response)
        results.push(result)

        onProgress?.({
          eventId,
          filename: file.name,
          progress: 100,
          status: 'completed'
        })

      } catch (error) {
        onProgress?.({
          eventId,
          filename: file.name,
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unbekannter Fehler'
        })
        throw error
      }
    }

    return results
  }

  /**
   * Uploads a single title image for an event
   */
  const uploadEventTitleImage = async (
    eventId: string, 
    file: File,
    onProgress?: (progress: ImageUploadProgress) => void
  ): Promise<ImageUploadResult> => {
    const validationErrors = validateImageFiles([file])
    if (validationErrors.length > 0) {
      throw new Error(`Validierungsfehler: ${validationErrors.join(', ')}`)
    }

    try {
      onProgress?.({
        eventId,
        filename: file.name,
        progress: 0,
        status: 'uploading'
      })

      const formData = new FormData()
      formData.append('titleImage', file)

      const response = await api.post<ApiResponse<ImageUploadResult>>(
        `${endpoints.events}/${eventId}/title-image`,
        formData,
        { isFormData: true }
      )

      onProgress?.({
        eventId,
        filename: file.name,
        progress: 100,
        status: 'processing'
      })

      const result = unwrapData(response)

      onProgress?.({
        eventId,
        filename: file.name,
        progress: 100,
        status: 'completed'
      })

      return result

    } catch (error) {
      onProgress?.({
        eventId,
        filename: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      })
      throw error
    }
  }

  /**
   * Removes an image from an event
   */
  const removeEventImage = async (eventId: string, imageUrl: string): Promise<Event> => {
    if (!imageUrl.trim()) {
      throw new Error('Bild-URL ist erforderlich')
    }

    const response = await api.delete<ApiResponse<LegacyEventAPI>>(
      `${endpoints.events}/${eventId}/images`,
      {
        data: { imageUrl }
      }
    )

    const updatedEvent = unwrapData(response)
    return mapLegacyEventToModern(updatedEvent)
  }

  /**
   * Reorders images for an event
   */
  const reorderEventImages = async (eventId: string, imageUrls: string[]): Promise<Event> => {
    if (imageUrls.length === 0) {
      throw new Error('Mindestens eine Bild-URL ist erforderlich')
    }

    const response = await api.put<ApiResponse<LegacyEventAPI>>(
      `${endpoints.events}/${eventId}/images/reorder`,
      { imageUrls }
    )

    const updatedEvent = unwrapData(response)
    return mapLegacyEventToModern(updatedEvent)
  }

  /**
   * Gets image metadata for an event
   */
  const getEventImageMetadata = async (eventId: string): Promise<ImageUploadResult[]> => {
    const response = await api.get<ApiResponse<ImageUploadResult[]>>(
      `${endpoints.events}/${eventId}/images/metadata`
    )

    return unwrapData(response)
  }

  /**
   * Generates optimized thumbnails for existing images
   */
  const generateThumbnails = async (eventId: string, imageUrls: string[]): Promise<{ [key: string]: string }> => {
    const response = await api.post<ApiResponse<{ [key: string]: string }>>(
      `${endpoints.events}/${eventId}/images/thumbnails`,
      { imageUrls }
    )

    return unwrapData(response)
  }

  /**
   * Bulk upload with batch processing
   */
  const bulkUploadEventImages = async (
    eventId: string,
    files: File[],
    batchSize: number = 3,
    onProgress?: (progress: { completed: number; total: number; currentBatch: ImageUploadProgress[] }) => void
  ): Promise<ImageUploadResult[]> => {
    const validationErrors = validateImageFiles(files)
    if (validationErrors.length > 0) {
      throw new Error(`Validierungsfehler: ${validationErrors.join(', ')}`)
    }

    const results: ImageUploadResult[] = []
    const batches: File[][] = []

    // Split files into batches
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize))
    }

    let completed = 0

    for (const batch of batches) {
      const batchPromises = batch.map(async (file) => {
        const result = await uploadEventImages(eventId, [file], (progress) => {
          onProgress?.({
            completed,
            total: files.length,
            currentBatch: [progress]
          })
        })
        completed++
        return result[0]
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  return {
    validateImageFiles,
    uploadEventImages,
    uploadEventTitleImage,
    removeEventImage,
    reorderEventImages,
    getEventImageMetadata,
    generateThumbnails,
    bulkUploadEventImages
  }
} 