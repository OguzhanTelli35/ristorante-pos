import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentColor?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search table / order #…',
  accentColor = 'blue',
}: SearchInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-800/70 border border-slate-600/30 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-${accentColor}-500/40 transition-colors`}
    />
  );
}
