import React, { useState, useEffect } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';

import { cn } from '@/lib/utils';
import { glassCard, glassInput } from '@/lib/glassmorphism';

import { useBusinessService } from '@/services/businessService';
import { BusinessResponse } from '@/models/business';

import { MapPin, Store, Search, Check, Loader2 } from 'lucide-react';

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationSelectorProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [tab, setTab] = useState<string>('partner');
  const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const businessService = useBusinessService();

  useEffect(() => {
    loadBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBusinesses = async () => {
    if (loadingBusinesses) return;
    try {
      setLoadingBusinesses(true);
      const fetched = await businessService.getBusinesses();
      setBusinesses(fetched);
    } catch (error) {
      console.error('Fehler beim Laden der Partner:', error);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleBusinessSelect = (business: BusinessResponse) => {
    const addr = business.address;
    const address = `${addr.street} ${addr.houseNumber}, ${addr.postalCode} ${addr.city}`;
    setSelectedBusinessId(business.id);
    setSearchValue(null);
    onChange({
      address,
      latitude: addr.latitude,
      longitude: addr.longitude,
    });
  };

  const handleLocationSearchSelect = (location: LocationResult | null) => {
    if (!location) {
      onChange(null);
      setSearchValue(null);
      return;
    }
    setSelectedBusinessId(null);
    setSearchValue(location);
    onChange({
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng,
    });
  };

  const filteredBusinesses = businesses.filter(b => {
    if (!businessSearchQuery) return true;
    const query = businessSearchQuery.toLowerCase();
    const addr = b.address;
    const fullAddress = `${addr.street} ${addr.houseNumber}, ${addr.postalCode} ${addr.city}`;
    return (
      b.name.toLowerCase().includes(query) ||
      fullAddress.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-3">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="partner" className="flex-1">
            <Store className="mr-1.5 h-4 w-4" />
            Partner-Standort
          </TabsTrigger>
          <TabsTrigger value="search" className="flex-1">
            <Search className="mr-1.5 h-4 w-4" />
            Adresse suchen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partner" className="mt-3">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={businessSearchQuery}
                onChange={e => setBusinessSearchQuery(e.target.value)}
                placeholder="Partner suchen..."
                className={cn(glassInput, 'w-full pl-9 pr-3 py-2 text-sm')}
              />
            </div>

            {loadingBusinesses ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {filteredBusinesses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Partner gefunden
                  </p>
                ) : (
                  filteredBusinesses.map(business => {
                    const addr = business.address;
                    const fullAddress = `${addr.street} ${addr.houseNumber}, ${addr.postalCode} ${addr.city}`;
                    const isSelected = selectedBusinessId === business.id;

                    return (
                      <div
                        key={business.id}
                        onClick={() => handleBusinessSelect(business)}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-all duration-200 border',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-secondary hover:border-secondary/80 hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="font-medium text-sm truncate">
                                {business.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 ml-6">
                              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">
                                {fullAddress}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-3">
          <LocationSearch
            value={searchValue}
            onChange={handleLocationSearchSelect}
            placeholder="Adresse suchen..."
            debounce={1000}
          />
        </TabsContent>
      </Tabs>

      {/* Ausgewählte Location anzeigen */}
      {value && (
        <Card className={cn(glassCard, 'mt-3')}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium">{value.address}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2 ml-6">
              <div>
                <span className="block">Latitude:</span>
                <span className="font-medium">{value.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="block">Longitude:</span>
                <span className="font-medium">{value.longitude.toFixed(6)}</span>
              </div>
            </div>
            <Badge variant="default" className="mt-2 ml-6">
              <Check className="mr-1 h-3 w-3" />
              Standort ausgewählt
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
