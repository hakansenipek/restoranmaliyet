'use client';

import SonucSatiri from '@/components/ui/SonucSatiri';
import type { HesaplamaSonucu } from '@/types';

interface Props {
  sonuc: HesaplamaSonucu;
}

function para(v: number) {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}

export default function SonucPaneli({ sonuc }: Props) {
  const { capex, ciro, pl, roi } = sonuc;
  const karRenk = pl.netAylikKar >= 0 ? 'green' : 'red';

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3" style={{ backgroundColor: '#7B3F8E' }}>
        <h2 className="text-sm font-bold text-white">Canlı Sonuç Özeti</h2>
      </div>

      <div className="p-4 flex flex-col gap-1">
        <SonucSatiri label="Toplam Yatırım (CAPEX)" value={capex.toplamCapex} bold highlight="purple" />
        <SonucSatiri label="Aylık Brüt Ciro" value={ciro.aylikBrutCiro} />
        <SonucSatiri label="Net Satış (KDV Hariç)" value={pl.netSatis} />
        <div className="border-t border-gray-100 my-1" />
        <SonucSatiri
          label="Net Aylık Kâr"
          value={pl.netAylikKar}
          bold
          highlight={karRenk}
        />
        <SonucSatiri label="Net Kâr Marjı" value={pl.netKarMarji} isPercent />
        <div className="border-t border-gray-100 my-1" />

        {/* Başabaş */}
        <div className="rounded-lg p-3 mt-1" style={{ backgroundColor: '#FFF5F8', border: '1px solid #C4215A' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#C4215A' }}>
            Başabaş Noktası
          </p>
          <p className="text-sm font-bold font-mono" style={{ color: '#C4215A' }}>
            {para(roi.basaBasAylikCiro)} / ay
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {para(roi.basaBasGunlukCiro)} / gün
          </p>
        </div>

        {/* ROI */}
        <div className="rounded-lg p-3 mt-2" style={{ backgroundColor: '#EFE6F4' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-1 text-[#7B3F8E]">
            Amortisman Süresi
          </p>
          {roi.roiAy !== null ? (
            <>
              <p className="text-2xl font-bold text-[#7B3F8E]">
                {Math.ceil(roi.roiAy)} ay
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                ({(roi.roiAy / 12).toFixed(1)} yıl)
              </p>
            </>
          ) : (
            <p className="text-sm text-red-500 font-semibold">Hesaplanamıyor</p>
          )}
        </div>

        {/* Ödenecek KDV */}
        <div className="border-t border-gray-100 my-1 pt-2">
          <SonucSatiri label="Ödenecek KDV (aylık)" value={pl.odenmesiGerekenKdv} />
        </div>
      </div>
    </div>
  );
}
