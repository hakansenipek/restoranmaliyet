'use client';
import { useState } from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: string;
  isPercent?: boolean;
  step?: number;
}

function format(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n) || n === 0) return '';
  return n.toLocaleString('tr-TR');
}

function parse(s: string): number {
  // TR locale: nokta = binlik ayraç, virgül = ondalık ayraç
  const clean = s.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

export default function InputField({ label, value, onChange, suffix = '₺', hint, isPercent = false }: Props) {
  const [inputStr, setInputStr] = useState<string | null>(null);

  const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
  const numVal = isPercent ? +(safeValue * 100).toFixed(4) : safeValue;
  const displayValue = inputStr !== null ? inputStr : format(numVal);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onFocus={() => setInputStr(safeValue === 0 ? '' : String(safeValue).replace('.', ','))}
          onBlur={() => setInputStr(null)}
          onChange={e => {
            const str = e.target.value;
            setInputStr(str);
            const r = parse(str);
            onChange(isPercent ? r / 100 : r);
          }}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-right text-sm font-mono text-gray-800 shadow-sm focus:border-[#7B3F8E] focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/20"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{suffix}</span>
      </div>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}
