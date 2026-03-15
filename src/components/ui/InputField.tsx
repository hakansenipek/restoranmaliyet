'use client';
interface Props { label: string; value: number; onChange: (v: number) => void; suffix?: string; hint?: string; isPercent?: boolean; step?: number; }
export default function InputField({ label, value, onChange, suffix='₺', hint, isPercent=false, step }: Props) {
  const dv = isPercent ? +(value*100).toFixed(4) : value;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input type="number" step={step??(isPercent?0.1:10000)} min={0} value={dv}
          onChange={e => { const r=parseFloat(e.target.value)||0; onChange(isPercent?r/100:r); }}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-right text-sm font-mono text-gray-800 shadow-sm focus:border-[#7B3F8E] focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/20" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{suffix}</span>
      </div>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}
