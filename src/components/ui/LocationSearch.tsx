import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/api";
import { ApiResponse, unwrapData } from "@/lib/apiUtils";
import { Button } from './button';

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
  debounce = 1500
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const prevQueryRef = useRef<string>("");
  const api = useApi();

  // Initialisierung des Suchtexts, wenn ein Wert existiert
  useEffect(() => {
    if (value && value.address.label) {
      setSearchQuery(value.address.label);
      prevQueryRef.current = value.address.label;
    }
  }, [value]);

  // Suche nur ausführen, wenn der Text sich geändert hat und lange genug ist
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 3 || query === prevQueryRef.current) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<ApiResponse<LocationResult[]>>(`/location/search?query=${encodeURIComponent(query)}`);
      const results = unwrapData(response);
      setSuggestions(results || []);
      
      if (results && results.length > 0) {
        setShowSuggestions(true);
      }
      
      prevQueryRef.current = query;
    } catch (error) {
      console.error('Fehler bei der Adresssuche:', error);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  }, [api]);

  // Debounce-Handler für Texteingaben
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsTyping(true);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.length < 3) {
      setSuggestions([]);
      setIsTyping(false);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      performSearch(query);
    }, debounce);
  }, [debounce, performSearch]);

  // Klicks außerhalb der Komponente erkennen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        
        // Wenn der Nutzer die Suche verlässt, aber nichts ausgewählt hat, setzen wir zurück auf den vorherigen Wert
        if (value && searchQuery !== value.address.label) {
          setSearchQuery(value.address.label);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value, searchQuery]);

  // Aufräumen beim Unmounten der Komponente
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Prüfen, ob alle notwendigen Adressdaten vorhanden sind
  const isAddressComplete = value && 
    value.address && 
    value.address.label && 
    value.position && 
    typeof value.position.lat === 'number' && 
    typeof value.position.lng === 'number';

  // Ausgewählte Adresse entfernen
  const handleClearAddress = () => {
    onChange(null);
    setSearchQuery("");
    prevQueryRef.current = "";
  };

  return (
    <div className="space-y-2" ref={searchRef}>
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="w-full pr-10"
          onFocus={() => {
            if (suggestions.length > 0 && !isTyping) {
              setShowSuggestions(true);
            }
          }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Vorschläge */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 max-h-64 overflow-auto">
          <CardContent className="p-1">
            <ul className="space-y-1">
              {suggestions.map((location) => (
                <li 
                  key={location.id}
                  className={cn(
                    "px-2 py-1.5 text-sm rounded-md cursor-pointer flex items-center",
                    "hover:bg-muted"
                  )}
                  onClick={() => {
                    onChange(location);
                    setShowSuggestions(false);
                    prevQueryRef.current = location.address.label;
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{location.address.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Ausgewählte Adresse */}
      {value && (
        <div className="mt-2 p-3 bg-muted/50 rounded-md relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleClearAddress}
          >
            <X className="h-3 w-3" />
          </Button>

          <div className="space-y-1">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              <span className="font-medium">{value.address.label}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
              <div>
                <span className="block">Straße:</span>
                <span className="font-medium">{value.address.street} {value.address.houseNumber}</span>
              </div>
              <div>
                <span className="block">PLZ/Ort:</span>
                <span className="font-medium">{value.address.postalCode} {value.address.city}</span>
              </div>
              <div>
                <span className="block">Latitude:</span>
                <span className="font-medium">{value.position.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="block">Longitude:</span>
                <span className="font-medium">{value.position.lng.toFixed(6)}</span>
              </div>
            </div>

            <Badge 
              variant={isAddressComplete ? "default" : "outline"}
              className="mt-2"
            >
              {isAddressComplete ? (
                <>
                  <Check className="mr-1 h-3 w-3" /> 
                  Adressdaten vollständig
                </>
              ) : (
                <>
                  <X className="mr-1 h-3 w-3" /> 
                  Unvollständige Adressdaten
                </>
              )}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
} 