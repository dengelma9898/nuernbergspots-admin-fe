import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Business } from '@/models/business';
import { inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface BusinessContactFieldsProps {
  business: Business;
  onBusinessChange: React.Dispatch<React.SetStateAction<Business | null>>;
}

export const BusinessContactFields: React.FC<BusinessContactFieldsProps> = ({
  business,
  onBusinessChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Kontaktinformationen</h3>
      <p className="text-sm text-muted-foreground">
        Diese Informationen sind optional und können später vom Geschäftsinhaber ergänzt werden.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            E-Mail (optional)
          </Label>
          <Input
            id="email"
            type="email"
            value={business.contact.email || ''}
            onChange={e =>
              onBusinessChange(prev =>
                prev
                  ? {
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value },
                    }
                  : null
              )
            }
            placeholder="kontakt@beispiel.de"
            className={cn(inputPreset)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">
            Telefon (optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            value={business.contact.phoneNumber || ''}
            onChange={e =>
              onBusinessChange(prev =>
                prev
                  ? {
                      ...prev,
                      contact: { ...prev.contact, phoneNumber: e.target.value },
                    }
                  : null
              )
            }
            placeholder="+49 123 456789"
            className={cn(inputPreset)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website" className="text-foreground">
            Website (optional)
          </Label>
          <Input
            id="website"
            type="url"
            value={business.contact.website || ''}
            onChange={e =>
              onBusinessChange(prev =>
                prev
                  ? {
                      ...prev,
                      contact: { ...prev.contact, website: e.target.value },
                    }
                  : null
              )
            }
            placeholder="https://www.beispiel.de"
            className={cn(inputPreset)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram" className="text-foreground">
            Instagram (optional)
          </Label>
          <Input
            id="instagram"
            value={business.contact.instagram || ''}
            onChange={e =>
              onBusinessChange(prev =>
                prev
                  ? {
                      ...prev,
                      contact: { ...prev.contact, instagram: e.target.value },
                    }
                  : null
              )
            }
            placeholder="@beispiel"
            className={cn(inputPreset)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebook" className="text-foreground">
            Facebook (optional)
          </Label>
          <Input
            id="facebook"
            value={business.contact.facebook || ''}
            onChange={e =>
              onBusinessChange(prev =>
                prev
                  ? {
                      ...prev,
                      contact: { ...prev.contact, facebook: e.target.value },
                    }
                  : null
              )
            }
            placeholder="beispiel"
            className={cn(inputPreset)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tiktok" className="text-foreground">
            TikTok (optional)
          </Label>
          <Input
            id="tiktok"
            value={business.contact.tiktok || ''}
            onChange={e =>
              onBusinessChange(prev =>
                prev
                  ? {
                      ...prev,
                      contact: { ...prev.contact, tiktok: e.target.value },
                    }
                  : null
              )
            }
            placeholder="@beispiel"
            className={cn(inputPreset)}
          />
        </div>
      </div>
    </div>
  );
};
