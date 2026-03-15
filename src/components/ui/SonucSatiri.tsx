interface Props { label: string; value: number; isPercent?: boolean; bold?: boolean; highlight?: 'green'|'red'|'purple'|'none'; }
function fmt(v: number) { return Math.round(v).toLocaleString('tr-TR') + ' ₺'; }
function fmtP(v: number) { return (v*100).toFixed(1)+'%'; }
export default function SonucSatiri({ label, value, isPercent=false, bold=false, highlight='none' }: Props) {
  const tc = highlight==='green'?'text-green-600':highlight==='red'?'text-red-600':highlight==='purple'?'text-[#7B3F8E]':value<0?'text-red-600':'text-gray-800';
  const bg = highlight==='green'?'bg-green-50':highlight==='red'?'bg-red-50':highlight==='purple'?'bg-[#EFE6F4]':'';
  return (
    <div className={`flex justify-between items-center py-1.5 px-2 rounded ${bg}`}>
      <span className={`text-sm ${bold?'font-semibold':'font-normal'} text-gray-600`}>{label}</span>
      <span className={`text-sm font-mono ${bold?'font-bold':''} ${tc}`}>{isPercent?fmtP(value):fmt(value)}</span>
    </div>
  );
}
