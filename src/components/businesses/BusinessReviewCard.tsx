import React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UseValidatedImageUploadReturn } from '@/hooks/useValidatedImageUpload';
import { NuernbergspotsReview } from '@/models/business';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';

interface BusinessReviewCardProps {
  editReview: NuernbergspotsReview;
  existingReviewImages: string[];
  reviewImageUpload: UseValidatedImageUploadReturn;
  onEditReviewChange: React.Dispatch<React.SetStateAction<NuernbergspotsReview>>;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number, isExisting: boolean) => void;
}

export const BusinessReviewCard: React.FC<BusinessReviewCardProps> = ({
  editReview,
  existingReviewImages,
  reviewImageUpload,
  onEditReviewChange,
  onImageUpload,
  onRemoveImage,
}) => {
  return (
    <Card className={cn(cardPreset)}>
      <CardHeader>
        <CardTitle className="text-foreground">Nuernbergspots Review</CardTitle>
        <CardDescription className="text-muted-foreground">
          Bewertung und Bilder des Partners
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Review Text</Label>
            <Textarea
              value={editReview.reviewText || ''}
              onChange={e =>
                onEditReviewChange(prev => ({
                  ...prev,
                  reviewText: e.target.value,
                }))
              }
              placeholder="Geben Sie hier die Review ein..."
              className={cn(inputPreset, 'min-h-[100px]')}
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-foreground">Review Bilder</h4>
            {reviewImageUpload.error && (
              <Alert variant="destructive" className={cn(cardPreset, 'border-destructive/50 mb-4')}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{reviewImageUpload.error.title}</AlertTitle>
                <AlertDescription className="mt-2">
                  <p>{reviewImageUpload.error.message}</p>
                  {reviewImageUpload.error.actionHint && (
                    <p className="mt-2 text-sm opacity-90">{reviewImageUpload.error.actionHint}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingReviewImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-secondary bg-muted">
                    <img
                      src={url}
                      alt={`Review Bild ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => onRemoveImage(index, true)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/80 hover:scale-110"
                    aria-label="Bild entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {reviewImageUpload.previewUrls.map((url, index) => (
                <div key={`new-${index}`} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-secondary bg-muted">
                    <img
                      src={url}
                      alt={`Review Bild ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => onRemoveImage(index, false)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/80 hover:scale-110"
                    aria-label="Bild entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-video rounded-lg border-2 border-dashed border-secondary bg-muted flex items-center justify-center cursor-pointer hover:border-primary transition-all duration-300">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Bilder hinzufügen</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={onImageUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
