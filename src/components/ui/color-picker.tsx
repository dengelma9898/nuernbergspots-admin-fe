import React from 'react';
import { Input } from './input';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 p-1"
      />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24"
      />
    </div>
  );
}; 