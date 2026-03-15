'use client';
import type { DegiskenGiderGirdisi } from '@/types/fizibilite';

interface Props {
  girdi: DegiskenGiderGirdisi;
  onChange: (g: DegiskenGiderGirdisi) => void;
}

interface OranTanim {
  key: keyof DegiskenGiderGirdisi;
  label: string;
  idealMin: number;
  idealMax: number;
  dikkatEsik: number;
  kritikEsik: number;
  aciklama: string;
}

const ORANLAR: OranTanim[] = [
  {
    key: 'yiyecekMaliyetOrani',
    label: 'Yiyecek Maliyet Oranı (SMM)',
    idealMin: 28, idealMax: 35,
    dikkatEsik: 38, kritikEsik: 45,
    aciklama: 'Yiyecek gelirinin hammadde maliyete oranı.',
  },
  {
    key: 'icecekMaliyetOrani',
    label: 'İçecek Maliyet Oranı (SMM)',
    idealMin: 20, idealMax: 30,
    dikkatEsik: 33, kritikEsik: 40,
    aciklama: 'İçecek gelirinin hammadde maliyete oranı.',
  },
  {
    key: 'fireZayiatOrani',
    label: 'Fire ve Zayiat Oranı',
    idealMin: 2, idealMax: 5,
    dikkatEsik: 6, kritikEsik: 8,
    aciklama: 'Bozulma, hatalı hazırlık ve servis firesi.',
  },
  {
    key: 'sarfMalzemeOrani',
    label: 'Sarf Malzeme Oranı',
    idealMin: 1, idealMax: 3,
    dikkatEsik: 4, kritikEsik: 5,
    aciklama: 'Ambalaj, peçete, tek kullanımlık ürünler.',
  },
];

function renk(pct: number, tanim: OranTanim): { bg: string; text: string; badge: string; etiket: string } {
  if (pct <= tanim.idealMax) {
    return { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700 border-green-200', etiket: 'İdeal' };
  }
  if (pct <= tanim.dikkatEsik) {
    return { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', etiket: 'Dikkat' };
  }
  return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700 border-red-200', etiket: 'Yüksek' };
}

export default function DegiskenGiderFormu({ girdi, onChange }: Props) {
  function set(key: keyof DegiskenGiderGirdisi, pct: number) {
    onChange({ ...girdi, [key]: pct / 100 });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">
        Oranlar net ciro üzerinden hesaplanır. Renk kodlaması: yeşil = ideal aralıkta, sarı = dikkat, kırmızı = yüksek risk.
      </p>

      {ORANLAR.map(tanim => {
        const pct = +(girdi[tanim.key] * 100).toFixed(1);
        const r = renk(pct, tanim);
        const barPct = Math.min((pct / tanim.kritikEsik) * 100, 100);

        return (
          <div key={tanim.key} className={`rounded-xl border overflow-hidden ${r.bg} border-gray-200`}>
            <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
              {/* Başlık + badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{tanim.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{tanim.aciklama}</p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded border ${r.badge}`}>
                  {r.etiket}
                </span>
              </div>

              {/* Input */}
              <div className="flex items-center gap-3">
                <div className="relative w-28">
                  <input
                    type="number" min={0} max={100} step={0.5} value={pct}
                    onChange={e => set(tanim.key, parseFloat(e.target.value) || 0)}
                    className={`w-full rounded-lg border px-3 py-2 pr-7 text-right text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/20 ${r.text} border-gray-200 bg-white`}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct <= tanim.idealMax ? 'bg-green-500' :
                        pct <= tanim.dikkatEsik ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  {/* Etiketler */}
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>%{tanim.idealMin}</span>
                    <span className="text-green-600 font-medium">İdeal: %{tanim.idealMin}–%{tanim.idealMax}</span>
                    <span>%{tanim.kritikEsik}+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Birleşik SMM özeti */}
      <div className="rounded-xl border border-[#7B3F8E]/20 bg-[#EFE6F4]/40 px-4 py-3">
        <p className="text-xs font-semibold text-[#5A2D6E] uppercase tracking-wide mb-2">Tahmini Birleşik SMM Oranı</p>
        <div className="flex items-center gap-2">
          {(() => {
            const birlesik =
              girdi.yiyecekMaliyetOrani * 0.7 +
              girdi.icecekMaliyetOrani * 0.3 +
              girdi.fireZayiatOrani +
              girdi.sarfMalzemeOrani;
            const pct = (birlesik * 100).toFixed(1);
            const rengi = birlesik <= 0.38 ? 'text-green-600' : birlesik <= 0.45 ? 'text-yellow-600' : 'text-red-600';
            return (
              <>
                <span className={`text-2xl font-bold font-mono ${rengi}`}>%{pct}</span>
                <span className="text-xs text-gray-500">(Yiyecek %70 / İçecek %30 karışımı varsayımıyla)</span>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
