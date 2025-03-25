import React, { useState, useMemo, useCallback } from 'react';
import * as Icons from '@mui/icons-material';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { VirtualItem } from '@tanstack/react-virtual';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ICON_VARIANTS = ['Outlined', 'Rounded', 'Sharp', 'TwoTone'];

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Memoize all available icons and filter variants
  const allIcons = useMemo(() => {
    const icons = Object.keys(Icons);
    // Nur Icons ohne Suffix oder mit einem der definierten Suffixe
    return icons.filter(iconName => {
      // Prüfe, ob das Icon eines der Suffixe hat
      const hasVariantSuffix = ICON_VARIANTS.some(variant => iconName.endsWith(variant));
      // Wenn es kein Suffix hat (Basis-Icon) oder ein gültiges Suffix, behalte es
      return !hasVariantSuffix;
    });
  }, []);
  
  // Memoize filtered icons
  const filteredIcons = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return allIcons.filter(iconName => 
      iconName.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, allIcons]);

  // Memoize icon rendering function
  const renderIcon = useCallback((iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent /> : null;
  }, []);

  // Virtual list setup
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: filteredIcons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // height of each row
    overscan: 10,
  });

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Icon suchen..."
          className="flex-1"
        />
        {value && (
          <div className="flex items-center justify-center w-10 h-10 border rounded-md">
            {renderIcon(value)}
          </div>
        )}
      </div>
      <ScrollArea className="h-[200px] border rounded-md" ref={parentRef}>
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
            }}
          >
            <div className="grid grid-cols-6 gap-2 p-2">
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const iconName = filteredIcons[virtualRow.index];
                return (
                  <button
                    key={iconName}
                    onClick={() => onChange(iconName)}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent",
                      value === iconName && "bg-accent"
                    )}
                    title={iconName}
                  >
                    {renderIcon(iconName)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 