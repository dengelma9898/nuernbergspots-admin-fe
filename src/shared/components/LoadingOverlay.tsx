import React from 'react'
import { Loader2 } from 'lucide-react'

export interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  text = 'Laden...', 
  size = 'md',
  className = ''
}: LoadingOverlayProps) {
  if (!isLoading) return null

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const containerClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        <span className={`${containerClasses[size]} text-gray-700 font-medium`}>
          {text}
        </span>
      </div>
    </div>
  )
} 