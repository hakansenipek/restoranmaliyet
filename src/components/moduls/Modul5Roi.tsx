'use client';

import { useState } from 'react';
import SonucSatiri from '@/components/ui/SonucSatiri';
import UyariKutusu from '@/components/ui/UyariKutusu';
import type { HesaplamaSonucu } from '@/types';

interface Props {
  sonuc: HesaplamaSonucu;
}

export default function Modul5Roi({ sonuc }: Props) {
  const [acik, setAcik] = useState(false);
  const { roi, capex, pl } = sonuc;

  const roiUyari = roi.roiAy !== null && roi.roiAy > 36;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
        style={{ backgroundColor: '#5A2D6E' }}
      >
        <div>
          <span className="text-sm font-bold text-white">
            Modül 5 — ROI &amp; Başabaş Noktası
          </span>
          <span className="ml-3 text-xs text-purple-200">
            {roi.roiAy !== null
              ? `${Math.ceil(roi.roiAy)} ayda amorti`
              : 'Kârsız — ROI hesaplanamıyor'}
          </span>
        </div>
        <span className="text-white text-sm">{acik ? '▲' : '▼'}</span>
      </button>

      {acik && (
        <div className="p-5 flex flex-col gap-4">
          {/* Başabaş */}
          <div
            className="rounded-xl border p-4 flex flex-col gap-1"
            style={{ borderColor: '#C4215A', backgroundColor: '#FFF5F8' }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#C4215A' }}>
              Başabaş Noktası
            </h3>
            <div className="mt-1 flex flex-col gap-1">
              <SonucSatiri
                label="Başabaş Aylık Ciro"
                value={roi.basaBasAylikCiro}
                bold
              />
              <SonucSatiri
                label="Başabaş Günlük Ciro"
                value={roi.basaBasGunlukCiro}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Katkı Marjı: %{(roi.katkilaMarji * 100).toFixed(1)} ·
              Değişken Gider Oranı: %{(roi.degiskenGiderOrani * 100).toFixed(1)}
            </div>
          </div>

          {/* ROI */}
          <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Yatırım Geri Dönüşü (ROI)
            </h3>
            <SonucSatiri label="Toplam Yatırım" value={capex.toplamCapex} />
            <SonucSatiri label="Aylık Net Kâr" value={pl.netAylikKar} />
            {roi.roiAy !== null ? (
              <div className="mt-2 text-center py-3 rounded-lg" style={{ backgroundColor: '#EFE6F4' }}>
                <p className="text-2xl font-bold" style={{ color: '#7B3F8E' }}>
                  {Math.ceil(roi.roiAy)} ay
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  ({(roi.roiAy / 12).toFixed(1)} yıl) &mdash; Bu yatırım kendini bu sürede amorti eder
                </p>
              </div>
            ) : (
              <UyariKutusu
                mesaj="Aylık net kâr sıfır veya negatif. ROI hesaplanamıyor. Gider/ciro dengesini gözden geçirin."
                tip="hata"
              />
            )}
            {roiUyari && (
              <UyariKutusu
                mesaj="ROI süresi 36 ayı aşıyor. Maliyet yapısını veya ciro hedefini gözden geçirin."
                tip="uyari"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
