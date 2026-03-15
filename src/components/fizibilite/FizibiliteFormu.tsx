'use client';
import { useState, useCallback } from 'react';
import type { FizibiliteGirdisi, FizibiliteSonucu } from '@/types/fizibilite';
import { FIZIBILITE_VARSAYILAN, fizibiliteHesapla } from '@/lib/hesaplama/fizibiliteEngine';
import MekanFormu from './MekanFormu';
import CapexFormu from './CapexFormu';
import PersonelFormu from './PersonelFormu';
import GelirFormu from './GelirFormu';
import GenelGiderFormu from './GenelGiderFormu';
import DegiskenGiderFormu from './DegiskenGiderFormu';
import FizibiliteSonuc from './FizibiliteSonuc';

type SekmeKey = 'mekan' | 'capex' | 'personel' | 'gelir' | 'giderler' | 'smm';

const SEKMELER: { key: SekmeKey; label: string }[] = [
  { key: 'mekan', label: '📍 Mekan' },
  { key: 'capex', label: '💰 Yatırım' },
  { key: 'personel', label: '👥 Personel' },
  { key: 'gelir', label: '📈 Gelir' },
  { key: 'giderler', label: '🏢 Giderler' },
  { key: 'smm', label: '🛒 SMM' },
];

function hesaplaGirdi(girdi: FizibiliteGirdisi): FizibiliteSonucu {
  return fizibiliteHesapla(girdi);
}

export default function FizibiliteFormu() {
  const [girdi, setGirdi] = useState<FizibiliteGirdisi>(FIZIBILITE_VARSAYILAN);
  const [sonuc, setSonuc] = useState<FizibiliteSonucu>(() => hesaplaGirdi(FIZIBILITE_VARSAYILAN));
  const [aktifSekme, setAktifSekme] = useState<SekmeKey>('mekan');
  const [indiriliyor, setIndiriliyor] = useState<'excel' | 'pdf' | null>(null);

  const guncelle = useCallback((yeniGirdi: FizibiliteGirdisi) => {
    setGirdi(yeniGirdi);
    setSonuc(hesaplaGirdi(yeniGirdi));
  }, []);

  async function excelIndir() {
    setIndiriliyor('excel');
    try {
      const { fizibiliteExcelIndir } = await import('@/lib/export');
      await fizibiliteExcelIndir(girdi, sonuc);
    } finally {
      setIndiriliyor(null);
    }
  }

  async function pdfIndir() {
    setIndiriliyor('pdf');
    try {
      const { fizibilitePdfIndir } = await import('@/lib/export');
      await fizibilitePdfIndir(girdi, sonuc);
    } finally {
      setIndiriliyor(null);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Sol kolon — form */}
      <div className="w-full md:w-7/12 flex flex-col gap-4">
        {/* Sekme nav */}
        <div className="flex gap-0.5 border-b border-gray-200 overflow-x-auto pb-px">
          {SEKMELER.map(({ key, label }) => {
            const aktif = aktifSekme === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setAktifSekme(key)}
                className={`shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap -mb-px ${
                  aktif
                    ? 'border-[#7B3F8E] text-[#7B3F8E] bg-[#EFE6F4]/40'
                    : 'border-transparent text-gray-500 hover:text-[#7B3F8E] hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Aktif sekme içeriği */}
        <div className="min-h-[400px]">
          {aktifSekme === 'mekan' && (
            <MekanFormu
              isletmeAdi={girdi.isletmeAdi}
              onIsletmeAdiChange={v => guncelle({ ...girdi, isletmeAdi: v })}
              girdi={girdi.mekan}
              onChange={mekan => guncelle({ ...girdi, mekan })}
            />
          )}
          {aktifSekme === 'capex' && (
            <CapexFormu
              girdi={girdi.capex}
              onChange={capex => guncelle({ ...girdi, capex })}
            />
          )}
          {aktifSekme === 'personel' && (
            <PersonelFormu
              girdi={girdi.personel}
              onChange={personel => guncelle({ ...girdi, personel })}
            />
          )}
          {aktifSekme === 'gelir' && (
            <GelirFormu
              girdi={girdi.gelir}
              onChange={gelir => guncelle({ ...girdi, gelir })}
            />
          )}
          {aktifSekme === 'giderler' && (
            <GenelGiderFormu
              girdi={girdi.genelGider}
              onChange={genelGider => guncelle({ ...girdi, genelGider })}
            />
          )}
          {aktifSekme === 'smm' && (
            <DegiskenGiderFormu
              girdi={girdi.degiskenGider}
              onChange={degiskenGider => guncelle({ ...girdi, degiskenGider })}
            />
          )}
        </div>

        {/* Export butonları */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={excelIndir}
            disabled={indiriliyor !== null}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {indiriliyor === 'excel' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>📊</span>
            )}
            Fizibilite Excel İndir
          </button>
          <button
            type="button"
            onClick={pdfIndir}
            disabled={indiriliyor !== null}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: '#C4215A' }}
          >
            {indiriliyor === 'pdf' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>📄</span>
            )}
            Fizibilite PDF İndir
          </button>
        </div>
      </div>

      {/* Sağ kolon — sonuç paneli */}
      <div className="w-full md:w-5/12 md:sticky md:top-4">
        <FizibiliteSonuc sonuc={sonuc} gelir={girdi.gelir} />
      </div>
    </div>
  );
}
