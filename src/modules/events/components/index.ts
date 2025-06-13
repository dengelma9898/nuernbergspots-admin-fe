// Event Components
export { EventStatus } from './EventStatus'
export { EventBasicInfo } from './EventBasicInfo'
export { EventImageGallery } from './EventImageGallery'
export { EventEditForm } from './EventEditForm'

// Component groups for better organization (import components first)
import { EventStatus } from './EventStatus'
import { EventBasicInfo } from './EventBasicInfo'
import { EventImageGallery } from './EventImageGallery'
import { EventEditForm } from './EventEditForm'

export const EventComponents = {
  EventStatus,
  EventBasicInfo,
  EventImageGallery,
  EventEditForm
} as const

// Type exports for component props
export type { EventStatusProps } from './EventStatus'
export type { EventBasicInfoProps } from './EventBasicInfo'
export type { EventImageGalleryProps } from './EventImageGallery'
export type { EventEditFormProps } from './EventEditForm' 