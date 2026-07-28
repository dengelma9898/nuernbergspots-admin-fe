import React, { useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { ALLOWED_MATERIAL_ICONS } from '@/lib/allowed-material-icons';
import { cn } from '@/lib/utils';
import { resolveIconName } from '@/utils/iconUtils';

import { Input } from './input';
import { MaterialIcon } from './material-icon';
import { ScrollArea } from './scroll-area';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return ALLOWED_MATERIAL_ICONS.filter(iconName => iconName.toLowerCase().includes(searchLower));
  }, [searchTerm]);

  const renderIcon = useCallback((iconName: string) => {
    return <MaterialIcon icon={resolveIconName(iconName)} size="small" />;
  }, []);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredIcons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  const resolvedValue = value ? resolveIconName(value) : '';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center space-x-2">
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Icon suchen..."
          className="flex-1"
        />
        {resolvedValue && (
          <div className="flex items-center justify-center w-10 h-10 border rounded-md">
            {renderIcon(resolvedValue)}
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
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const iconName = filteredIcons[virtualRow.index];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => onChange(iconName)}
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent',
                      resolvedValue === iconName && 'bg-accent'
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
