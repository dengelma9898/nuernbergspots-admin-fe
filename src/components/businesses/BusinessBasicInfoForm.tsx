import React from 'react';

import { BusinessContactFields } from '@/components/businesses/BusinessContactFields';
import { BusinessValidationAlert } from '@/components/businesses/BusinessValidationAlert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocationResult, LocationSearch } from '@/components/ui/LocationSearch';
import { Business } from '@/models/business';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface BusinessBasicInfoFormProps {
  business: Business;
  onBusinessChange: React.Dispatch<React.SetStateAction<Business | null>>;
  searchValue: LocationResult | null;
  onLocationSelect: (location: LocationResult | null) => void;
  validationErrors: string[];
  validationErrorsRef: React.RefObject<HTMLDivElement | null>;
}

export const BusinessBasicInfoForm: React.FC<BusinessBasicInfoFormProps> = ({
  business,
  onBusinessChange,
  searchValue,
  onLocationSelect,
  validationErrors,
  validationErrorsRef,
}) => {
  return (
    <Card className={cn(cardPreset)}>
      <CardHeader>
        <CardTitle className="text-foreground">Basisinformationen</CardTitle>
        <CardDescription className="text-muted-foreground">
          Grundlegende Informationen zum Partner
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <BusinessValidationAlert
          validationErrors={validationErrors}
          validationErrorsRef={validationErrorsRef}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Name des Geschäfts
            </Label>
            <Input
              id="name"
              value={business.name}
              onChange={e =>
                onBusinessChange(prev => (prev ? { ...prev, name: e.target.value } : null))
              }
              placeholder="z.B. Café Sonnenschein"
              className={cn(inputPreset)}
            />
            <p className="text-sm text-muted-foreground">
              Der offizielle Name des Geschäfts, wie er angezeigt werden soll.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              value={business.description}
              onChange={e =>
                onBusinessChange(prev => (prev ? { ...prev, description: e.target.value } : null))
              }
              placeholder="Beschreiben Sie das Geschäft im Detail..."
              className={cn(inputPreset, 'min-h-[100px]')}
            />
            <p className="text-sm text-muted-foreground">
              Eine ausführliche Beschreibung des Geschäfts. Nennen Sie wichtige Details wie Angebot,
              Besonderheiten oder Geschichte.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefit" className="text-foreground">
              Benefit für Nutzer
            </Label>
            <Input
              id="benefit"
              value={business.benefit || ''}
              onChange={e => {
                const value = e.target.value.slice(0, 100);
                onBusinessChange(prev => (prev ? { ...prev, benefit: value } : null));
              }}
              placeholder="z.B. 10% Rabatt auf alle Getränke"
              maxLength={100}
              className={cn(inputPreset)}
            />
            <p className="text-sm text-muted-foreground">
              Beschreiben Sie kurz (max. 100 Zeichen), welchen Vorteil Nutzer in diesem Geschäft
              erhalten.
              <span className="ml-2 text-xs">{(business.benefit || '').length}/100 Zeichen</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Adresse</Label>
            <LocationSearch
              value={searchValue}
              onChange={onLocationSelect}
              placeholder="Adresse suchen..."
              debounce={1000}
            />
            {business.address && (
              <div className="text-sm text-muted-foreground mt-2">
                Aktuelle Adresse: {business.address.street} {business.address.houseNumber},{' '}
                {business.address.postalCode} {business.address.city}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Suchen Sie die Adresse. Die Koordinaten werden automatisch ermittelt.
            </p>
          </div>

          <BusinessContactFields business={business} onBusinessChange={onBusinessChange} />
        </div>
      </CardContent>
    </Card>
  );
};
