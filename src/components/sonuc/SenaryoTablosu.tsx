'use client';

import { SENARYO } from '@/lib/hesaplama/ciroEngine';
import type { HesaplamaSonucu } from '@/types';

interface Props {
  sonuc: HesaplamaSonucu;
}

function para(v: number) {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}

function pct(v: number) {
  return (v * 100).toFixed(1) + '%';
}

export default function SenaryoTablosu({ sonuc }: Props) {
  const { ciro, pl, capex } = sonuc;

  // Senaryo karşılaştırması: brüt ciro çarpanı değiştiğinde net kâr nasıl değişir?
  const senaryolar = [
    {
      etiket: 'Düşük (Kötümser)',
      carpan: SENARYO.dusuk,
      brutCiro: ciro.dusukCiro,
      bgColor: '#FEF2F2',
      textColor: '#dc2626',
      borderColor: '#fecaca',
    },
    {
      etiket: 'Baz (Gerçekçi)',
      carpan: SENARYO.baz,
      brutCiro: ciro.bazCiro,
      bgColor: '#F5F3FF',
      textColor: '#7B3F8E',
      borderColor: '#c4b5fd',
    },
    {
      etiket: 'Yüksek (İyimser)',
      carpan: SENARYO.yuksek,
      brutCiro: ciro.yuksekCiro,
      bgColor: '#F0FDF4',
      textColor: '#16a34a',
      borderColor: '#bbf7d0',
    },
  ] as const;

  // Net kâr = brüt kâr × carpan (yaklaşık — değişken giderler orantılı değişir)
  // Daha doğru: netKar ≈ netAylikKar × carpan değil, marj sabit kaldığında geçerli
  // Doğru yaklaşım: (netSatis × carpan) - (degisken × carpan + sabit) - vergi
  // Bunun için sabit giderleri ve değişken giderleri ayrı tutuyoruz
  const sabitGider = sonuc.opex.personelToplamMaliyet + sonuc.opex.toplamSabitGider + pl.kiraStopaj;
  const netSatisOrani = ciro.aylikBrutCiro > 0 ? pl.netSatis / ciro.aylikBrutCiro : 0;
  const degiskenGiderOrani = sonuc.roi.degiskenGiderOrani;

  function senaryoNetKar(brutCiro: number): number {
    const netSatis = brutCiro * netSatisOrani;
    const degiskenGider = netSatis * degiskenGiderOrani;
    const brutKar = netSatis - degiskenGider - sabitGider;
    if (brutKar <= 0) return brutKar;
    const vergi =
      pl.tahminiVergi > 0
        ? brutKar * (pl.tahminiVergi / pl.brutKar)
        : 0;
    return brutKar - vergi;
  }

  function roiAy(netKar: number): string {
    if (netKar <= 0) return '—';
    const ay = capex.toplamCapex / netKar;
    return Math.ceil(ay) + ' ay';
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3" style={{ backgroundColor: '#7B3F8E' }}>
        <h2 className="text-sm font-bold text-white">Senaryo Karşılaştırması</h2>
        <p className="text-xs text-purple-200 mt-0.5">Düşük / Baz / Yüksek doluluk oranı</p>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs text-gray-500 font-medium pb-2">Senaryo</th>
              <th className="text-right text-xs text-gray-500 font-medium pb-2">Brüt Ciro</th>
              <th className="text-right text-xs text-gray-500 font-medium pb-2">Net Kâr</th>
              <th className="text-right text-xs text-gray-500 font-medium pb-2">Kâr Marjı</th>
              <th className="text-right text-xs text-gray-500 font-medium pb-2">ROI</th>
            </tr>
          </thead>
          <tbody>
            {senaryolar.map(s => {
              const nk = senaryoNetKar(s.brutCiro);
              const ns = s.brutCiro * netSatisOrani;
              const marj = ns > 0 ? nk / ns : 0;
              return (
                <tr
                  key={s.etiket}
                  className="border-b border-gray-50"
                  style={{ backgroundColor: s.bgColor }}
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: s.borderColor, color: s.textColor }}
                      >
                        {Math.round(s.carpan * 100)}%
                      </span>
                      <span className="text-xs text-gray-600">{s.etiket}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-mono text-xs">{para(s.brutCiro)}</td>
                  <td
                    className="py-2.5 text-right font-mono text-xs font-semibold"
                    style={{ color: s.textColor }}
                  >
                    {para(nk)}
                  </td>
                  <td
                    className="py-2.5 text-right font-mono text-xs"
                    style={{ color: nk >= 0 ? s.textColor : '#dc2626' }}
                  >
                    {pct(marj)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-xs">{roiAy(nk)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
