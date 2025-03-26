import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const HERE_APP_ID = 'pARpnYfYVGKeHzHHJUSZ';
const HERE_API_KEY = 'Fu9TdGyntD2yW4fLr6FIjYw_yZByiUALQQrierDwcfM';

export interface LocationResult {
  title: string;
  id: string;
  resultType: string;
  position: {
    lat: number;
    lng: number;
  };
  address: {
    label: string;
    countryCode: string;
    countryName: string;
    stateCode: string;
    state: string;
    county: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
    houseNumber: string;
  };
}

interface LocationSearchProps {
  value: LocationResult | null;
  onChange: (location: LocationResult | null) => void;
  placeholder?: string;
  debounce?: number;
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "Adresse suchen...",
  debounce = 1000
}: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(searchQuery)}&apiKey=${HERE_API_KEY}&lang=de`,
          {
            headers: {
              'Accept-Language': 'de'
            }
          }
        );
        const data = await response.json();
        setSuggestions(data.items || []);
      } catch (error) {
        console.error('Fehler bei der Adresssuche:', error);
      } finally {
        setLoading(false);
      }
    }, debounce);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery, debounce]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value?.address.label || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            onFocus={() => setOpen(true)}
          />
          <CommandEmpty>Keine Adressen gefunden.</CommandEmpty>
          <CommandGroup>
            {loading ? (
              <div className="py-2 text-center text-sm text-muted-foreground">
                Suche läuft...
              </div>
            ) : (
              suggestions.map((location) => (
                <CommandItem
                  key={location.id}
                  value={location.address.label}
                  onSelect={() => {
                    onChange(location);
                    setOpen(false);
                    setSearchQuery(location.address.label);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === location.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {location.address.label}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 