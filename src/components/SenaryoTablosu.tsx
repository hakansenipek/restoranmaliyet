import { Senaryo } from '@/types';

interface Props { senaryolar: Senaryo[]; }

function fmt(v: number) { return Math.round(v).toLocaleString('tr-TR') + ' ₺'; }
function fmtP(v: number) { return '%' + (v * 100).toFixed(1); }

export default function SenaryoTablosu({ senaryolar }: Props) {
  const renkler: Record<string, string> = {
    'Düşük': '#dc2626',
    'Baz': '#7B3F8E',
    'Yüksek': '#16a34a',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3" style={{ backgroundColor: '#5A2D6E' }}>
        <h3 className="text-sm font-semibold text-white tracking-wide">Senaryo Karşılaştırması</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#EFE6F4]">
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Kalem</th>
              {senaryolar.map(s => (
                <th key={s.etiket} className="text-right py-2 px-4 font-bold" style={{ color: renkler[s.etiket] }}>
                  {s.etiket}
                  <span className="block text-xs font-normal text-gray-500">{fmt(s.ciro)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Net Satış', fn: (s: Senaryo) => fmt(s.sonuc.netSatis) },
              { label: 'Toplam Değişken', fn: (s: Senaryo) => fmt(s.sonuc.toplamDegisken) },
              { label: 'Toplam Sabit', fn: (s: Senaryo) => fmt(s.sonuc.toplamSabit) },
              { label: 'Ödenecek KDV', fn: (s: Senaryo) => fmt(s.sonuc.odenmesiGerekenKdv) },
              { label: 'Faaliyet Kârı', fn: (s: Senaryo) => fmt(s.sonuc.faaliyetKari), special: true },
              { label: 'Kâr Marjı', fn: (s: Senaryo) => fmtP(s.sonuc.karMarji) },
              { label: 'Başa Baş Ciro', fn: (s: Senaryo) => fmt(s.sonuc.basaBasCiro) },
            ].map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className={`py-2 px-4 text-gray-600 ${row.special ? 'font-semibold' : ''}`}>{row.label}</td>
                {senaryolar.map(s => {
                  const val = row.special ? s.sonuc.faaliyetKari : null;
                  const color = row.special ? (val !== null && val >= 0 ? '#16a34a' : '#dc2626') : undefined;
                  return (
                    <td key={s.etiket} className="py-2 px-4 text-right font-mono" style={{ color }}>
                      {row.fn(s)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
