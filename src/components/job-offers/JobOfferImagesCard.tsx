import React from 'react';
import { AlertCircle, ImagePlus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';

interface JobOfferImagesCardProps {
  existingImageUrls: string[];
  imageUpload: ReturnType<typeof useValidatedImageUpload>;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number, isExisting: boolean) => void;
}

export function JobOfferImagesCard({
  existingImageUrls,
  imageUpload,
  onImageSelect,
  onRemoveImage,
}: JobOfferImagesCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn(cardPreset, 'overflow-hidden')}>
        <div className="p-4 sm:p-6 border-b border-secondary">
          <h2 className="text-xl font-bold text-foreground">Bilder</h2>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {imageUpload.error && (
            <Alert variant="destructive" className={cn(cardPreset, 'border-destructive/50')}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{imageUpload.error.title}</AlertTitle>
              <AlertDescription className="mt-2">
                <p>{imageUpload.error.message}</p>
                {imageUpload.error.actionHint && (
                  <p className="mt-2 text-sm opacity-90">{imageUpload.error.actionHint}</p>
                )}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                <img
                  src={url}
                  alt={`Bild ${index + 1}`}
                  className={cn(cardPreset, 'w-full h-32 object-cover')}
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index, true)}
                  className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  aria-label="Bild entfernen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {imageUpload.previewUrls.map((url, index) => (
              <div key={`new-${index}`} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className={cn(cardPreset, 'w-full h-32 object-cover')}
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index, false)}
                  className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  aria-label="Bild entfernen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {existingImageUrls.length + imageUpload.previewUrls.length < 10 && (
              <label
                className={cn(
                  cardPreset,
                  'flex items-center justify-center h-32 border-2 border-dashed cursor-pointer hover:border-secondary/50 transition-all duration-300'
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImageSelect}
                  className="hidden"
                />
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              </label>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
