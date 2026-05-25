import React from 'react';
import { Event } from '@/models/events';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { glassInput } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

interface EventContactInfoProps {
  event: Event;
  isEditing: boolean;
  editedEvent: Partial<Event>;
  onInputChange: (field: keyof Event, value: any) => void;
  onSocialMediaChange: (platform: 'instagram' | 'facebook' | 'tiktok', value: string) => void;
}

export const EventContactInfo: React.FC<EventContactInfoProps> = ({
  event,
  isEditing,
  editedEvent,
  onInputChange,
  onSocialMediaChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-foreground">Kontakt Informationen</Label>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">E-Mail</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="z.B. info@event.de"
                value={editedEvent.contactEmail || ''}
                onChange={e => onInputChange('contactEmail', e.target.value)}
                className={cn(glassInput)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Telefon</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="z.B. +49 911 123456"
                value={editedEvent.contactPhone || ''}
                onChange={e => onInputChange('contactPhone', e.target.value)}
                className={cn(glassInput)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="z.B. https://www.event.de"
                value={editedEvent.website || ''}
                onChange={e => onInputChange('website', e.target.value)}
                className={cn(glassInput)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {event.contactEmail && (
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">E-Mail:</span>
                <a
                  href={`mailto:${event.contactEmail}`}
                  className="text-foreground hover:underline"
                >
                  {event.contactEmail}
                </a>
              </div>
            )}
            {event.contactPhone && (
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">Telefon:</span>
                <a href={`tel:${event.contactPhone}`} className="text-foreground hover:underline">
                  {event.contactPhone}
                </a>
              </div>
            )}
            {event.website && (
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">Website:</span>
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  {event.website}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Social Media</Label>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Instagram</Label>
              <Input
                id="instagram"
                placeholder="z.B. @eventname oder eventname"
                value={editedEvent.socialMedia?.instagram || ''}
                onChange={e => onSocialMediaChange('instagram', e.target.value)}
                className={cn(glassInput)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Facebook</Label>
              <Input
                id="facebook"
                placeholder="z.B. eventname oder https://facebook.com/eventname"
                value={editedEvent.socialMedia?.facebook || ''}
                onChange={e => onSocialMediaChange('facebook', e.target.value)}
                className={cn(glassInput)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">TikTok</Label>
              <Input
                id="tiktok"
                placeholder="z.B. @eventname oder eventname"
                value={editedEvent.socialMedia?.tiktok || ''}
                onChange={e => onSocialMediaChange('tiktok', e.target.value)}
                className={cn(glassInput)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {event.socialMedia?.instagram && (
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">Instagram:</span>
                <a
                  href={`https://instagram.com/${event.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  {event.socialMedia.instagram}
                </a>
              </div>
            )}
            {event.socialMedia?.facebook && (
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">Facebook:</span>
                <a
                  href={
                    event.socialMedia.facebook.startsWith('http')
                      ? event.socialMedia.facebook
                      : `https://facebook.com/${event.socialMedia.facebook}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  {event.socialMedia.facebook}
                </a>
              </div>
            )}
            {event.socialMedia?.tiktok && (
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">TikTok:</span>
                <a
                  href={`https://tiktok.com/@${event.socialMedia.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  {event.socialMedia.tiktok}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
