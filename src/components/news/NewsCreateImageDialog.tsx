import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingButton } from '@/components/LoadingButton';
import { AlertCircle } from 'lucide-react';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';

interface NewsCreateImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageContent: string;
  onImageContentChange: (value: string) => void;
  imageSending: boolean;
  maxImages: number;
  imageUpload: ReturnType<typeof useValidatedImageUpload>;
  onSend: () => void;
}

export function NewsCreateImageDialog({
  open,
  onOpenChange,
  imageContent,
  onImageContentChange,
  imageSending,
  maxImages,
  imageUpload,
  onSend,
}: NewsCreateImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(cardPreset)}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Bild-News erstellen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={imageContent}
            onChange={e => onImageContentChange(e.target.value)}
            placeholder="Text zur Bild-News..."
            disabled={imageSending}
            className={cn(inputPreset)}
          />
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
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={imageUpload.files.length >= maxImages || imageSending}
              onChange={imageUpload.handleFileChange}
              className="hidden"
              id="image-upload-input"
            />
            <LoadingButton
              asChild
              variant="outline"
              size="sm"
              className={cn(buttonPreset, 'mb-3')}
              disabled={imageUpload.files.length >= maxImages || imageSending}
            >
              <label htmlFor="image-upload-input" className="cursor-pointer">
                {imageUpload.files.length >= maxImages ? 'Maximal 5 Bilder' : 'Bilder auswählen'}
              </label>
            </LoadingButton>
            <div className="flex gap-3 flex-wrap">
              {imageUpload.previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 overflow-visible">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="object-cover w-full h-full rounded-xl border border-secondary"
                  />
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      imageUpload.removeImage(idx);
                    }}
                    disabled={imageSending}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full shadow-md z-10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ position: 'absolute' }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <LoadingButton
              type="button"
              variant="ghost"
              disabled={imageSending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0 rounded-xl"
            >
              Abbrechen
            </LoadingButton>
          </DialogClose>
          <LoadingButton
            variant="outline"
            onClick={onSend}
            disabled={imageSending || !imageContent.trim() || imageUpload.files.length === 0}
            isLoading={imageSending}
            loadingText="Wird gesendet..."
            className={cn(buttonPreset, 'rounded-xl')}
          >
            Senden
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
