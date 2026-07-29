import React from 'react';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoadingButton } from '@/components/LoadingButton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface CopyEventImageSectionProps {
  copyImages: boolean;
  onCopyImagesChange: (value: boolean) => void;
  titleImagePreview: string | null;
  imagePreviews: string[];
  titleImageUrlToCopy: string | null;
  imageUrlsToCopy: string[];
  onRemoveTitleImage: () => void;
  onRemoveImage: (index: number) => void;
}

export function CopyEventImageSection({
  copyImages,
  onCopyImagesChange,
  titleImagePreview,
  imagePreviews,
  titleImageUrlToCopy,
  imageUrlsToCopy,
  onRemoveTitleImage,
  onRemoveImage,
}: CopyEventImageSectionProps) {
  return (
    <>
      <div className={cn(cardPreset, 'p-4')}>
        <div className="flex items-center space-x-3">
          <Switch id="copyImages" checked={copyImages} onCheckedChange={onCopyImagesChange} />
          <div className="space-y-1">
            <Label htmlFor="copyImages" className="text-foreground">
              Bilder mitkopieren
            </Label>
            <p className="text-xs text-muted-foreground">
              Wenn aktiviert, werden alle Bilder des ursprünglichen Events mitkopiert.
              {imageUrlsToCopy.length > 0 || titleImageUrlToCopy ? (
                <span className="block mt-1 text-destructive">
                  Hinweis: Die Bilder werden mit dem kopierten Event verknüpft. Wenn du das
                  ursprüngliche Event oder dessen Bilder später löschst, sind die Bilder auch im
                  kopierten Event nicht mehr verfügbar.
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      {copyImages && titleImagePreview && (
        <div className="space-y-2">
          <Label className="text-foreground">Titelbild (kopiert)</Label>
          <div className="relative inline-block">
            <img
              src={titleImagePreview}
              alt="Titelbild Vorschau"
              className="h-48 w-full object-cover rounded-lg border border-secondary bg-card"
            />
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={onRemoveTitleImage}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </LoadingButton>
          </div>
        </div>
      )}

      {copyImages && imagePreviews.length > 0 && (
        <div className="space-y-2">
          <Label className="text-foreground">Bilder (kopiert)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Bild ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg border border-secondary bg-card"
                />
                <LoadingButton
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </LoadingButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
