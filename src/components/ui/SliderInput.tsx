'use client';

interface Props {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  uyariEsigi?: number;  // Bu değeri aşarsa amber uyarı gösterilir
}

export default function SliderInput({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  suffix = '%',
  uyariEsigi,
}: Props) {
  const oran = ((value - min) / (max - min)) * 100;
  const uyari = uyariEsigi !== undefined && value > uyariEsigi;
  const renk = uyari ? '#f59e0b' : '#7B3F8E';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {label}
        </label>
        <span
          className="text-sm font-mono font-semibold"
          style={{ color: renk }}
        >
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
        style={{
          background: `linear-gradient(to right, ${renk} ${oran}%, #e5e7eb ${oran}%)`,
        }}
      />
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
      {uyari && (
        <p className="text-[11px] text-amber-600">⚠ Bu değer yüksek, dikkatli olun.</p>
      )}
    </div>
  );
}
