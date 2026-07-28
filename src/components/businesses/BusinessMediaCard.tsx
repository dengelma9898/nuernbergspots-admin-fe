import React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseValidatedImageUploadReturn } from '@/hooks/useValidatedImageUpload';
import { Business } from '@/models/business';
import { buttonPreset, cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { AlertCircle, Image as ImageIcon, Trash2, Upload } from 'lucide-react';

interface BusinessMediaCardProps {
  business: Business;
  logoPreview: string | null;
  existingBusinessImages: string[];
  businessImageUpload: UseValidatedImageUploadReturn;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBusinessImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBusinessImage: (index: number, isExisting: boolean) => void;
}

export const BusinessMediaCard: React.FC<BusinessMediaCardProps> = ({
  business,
  logoPreview,
  existingBusinessImages,
  businessImageUpload,
  onLogoUpload,
  onBusinessImageUpload,
  onRemoveBusinessImage,
}) => {
  return (
    <Card className={cn(cardPreset)}>
      <CardHeader>
        <CardTitle className="text-foreground">Medien</CardTitle>
        <CardDescription className="text-muted-foreground">
          Logo und Geschäftsbilder
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 text-foreground">Logo</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-secondary">
                <img
                  src={logoPreview || business.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <label
                  className={cn(buttonPreset, 'inline-flex items-center px-4 py-2 cursor-pointer')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Logo hochladen
                  <input type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  Empfohlene Größe: 512x512 Pixel
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-foreground">Geschäftsbilder</h3>
            {businessImageUpload.error && (
              <Alert variant="destructive" className={cn(cardPreset, 'border-destructive/50 mb-4')}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{businessImageUpload.error.title}</AlertTitle>
                <AlertDescription className="mt-2">
                  <p>{businessImageUpload.error.message}</p>
                  {businessImageUpload.error.actionHint && (
                    <p className="mt-2 text-sm opacity-90">
                      {businessImageUpload.error.actionHint}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingBusinessImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-secondary bg-muted">
                    <img
                      src={url}
                      alt={`Geschäftsbild ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => onRemoveBusinessImage(index, true)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/80 hover:scale-110"
                    aria-label="Bild entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {businessImageUpload.previewUrls.map((url, index) => (
                <div key={`new-${index}`} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-secondary bg-muted">
                    <img
                      src={url}
                      alt={`Geschäftsbild ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => onRemoveBusinessImage(index, false)}
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
                  onChange={onBusinessImageUpload}
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Empfohlene Größe: 1200x800 Pixel</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
