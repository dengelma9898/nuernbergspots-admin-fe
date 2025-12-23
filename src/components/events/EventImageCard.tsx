import React from 'react';
import { Event } from '@/models/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface EventImageCardProps {
  event: Event;
  isEditing: boolean;
  isUploading: boolean;
  isUploadingTitleImage: boolean;
  previewUrls: string[];
  imageLimitError: string | null;
  imagesChanged: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (imageUrl: string) => void;
  onRemovePreview: (index: number) => void;
  onConfirmImages: () => void;
}

export const EventImageCard: React.FC<EventImageCardProps> = ({
  event,
  isEditing,
  isUploading,
  isUploadingTitleImage,
  previewUrls,
  imageLimitError,
  imagesChanged,
  onFileChange,
  onTitleImageChange,
  onDeleteImage,
  onRemovePreview,
  onConfirmImages,
}) => {
  return (
    <Card className={cn(glassCard)}>
      <CardHeader>
        <CardTitle className="text-foreground">Bilder</CardTitle>
      </CardHeader>
      <CardContent>
        {event.titleImageUrl && (
          <div className="mb-6">
            <Label className="mb-2 block text-foreground">Titelbild</Label>
            {isEditing && (
              <div className="mb-2">
                <input
                  id="title-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={onTitleImageChange}
                  className="hidden"
                />
                <LoadingButton
                  asChild
                  isLoading={isUploadingTitleImage}
                  loadingText="Wird hochgeladen..."
                  className={cn(glassButton)}
                >
                  <label htmlFor="title-image-upload" className="cursor-pointer m-0">
                    Titelbild auswählen
                  </label>
                </LoadingButton>
              </div>
            )}
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-secondary mx-auto bg-card group">
              <img
                src={event.titleImageUrl}
                alt="Titelbild"
                className="object-cover w-full h-full"
              />
              {isEditing && (
                <AnimatedButton
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteImage(event.titleImageUrl!)}
                >
                  <Trash2 className="h-4 w-4" />
                </AnimatedButton>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="mb-8 space-y-4">
            <div className="space-y-4">
              <Label className="text-foreground">Weitere Bilder</Label>
              <div className="flex items-center gap-4">
                <input
                  id="event-images-upload"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                  multiple
                />
                <LoadingButton
                  asChild
                  isLoading={isUploading}
                  loadingText="Wird hochgeladen..."
                  disabled={isUploading || (event.imageUrls?.length || 0) >= 5}
                  className={cn(glassButton)}
                >
                  <label htmlFor="event-images-upload" className="cursor-pointer m-0">
                    Bilder auswählen
                  </label>
                </LoadingButton>
              </div>
              {imageLimitError && (
                <div className="text-destructive text-sm mt-2">{imageLimitError}</div>
              )}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-full aspect-square border border-secondary rounded-lg overflow-hidden bg-card"
                    >
                      <img
                        src={url}
                        alt={`Vorschau ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <AnimatedButton
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => onRemovePreview(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {event.imageUrls && event.imageUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {event.imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Event Bild ${index + 1}`}
                  className="object-cover w-full h-48 rounded-lg border border-secondary"
                />
                {isEditing && (
                  <AnimatedButton
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteImage(url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </AnimatedButton>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Keine weiteren Bilder vorhanden
          </div>
        )}
      </CardContent>
      {isEditing && imagesChanged && (
        <div className="flex justify-end gap-4 mt-8 mb-2 mr-4">
          <AnimatedButton
            onClick={onConfirmImages}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Bestätigen
          </AnimatedButton>
        </div>
      )}
    </Card>
  );
};

