'use client';

import { useCallback, useState } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import SliderInput from '@/components/ui/SliderInput';
import SonucSatiri from '@/components/ui/SonucSatiri';
import { ciroHesapla } from '@/lib/hesaplama/ciroEngine';
import type { CiroGirdisi, SezonVerisi } from '@/types';

const AYLAR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const SEZON_RENK = [
  { bg: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50' },
  { bg: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50' },
  { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
];

interface SezonKartiProps {
  baslik: string;
  renk: typeof SEZON_RENK[0];
  girdi: SezonVerisi;
  digerAylar: string[];
  onChange: (v: SezonVerisi) => void;
}

function SezonKarti({ baslik, renk, girdi, digerAylar, onChange }: SezonKartiProps) {
  function toggleAy(ay: string) {
    const yeni = girdi.aylar.includes(ay)
      ? girdi.aylar.filter(a => a !== ay)
      : [...girdi.aylar, ay];
    onChange({ ...girdi, aylar: yeni });
  }

  function setField(k: keyof SezonVerisi, v: number) {
    onChange({ ...girdi, [k]: v });
  }

  const sabahToplam = (girdi.sabahKisi || 0) * (girdi.sabahHarcama || 0);
  const ogleToplam  = (girdi.ogleKisi  || 0) * (girdi.ogleHarcama  || 0);
  const aksamToplam = (girdi.aksamKisi || 0) * (girdi.aksamHarcama || 0);
  const gunlukToplam = sabahToplam + ogleToplam + aksamToplam;

  const ogünler = [
    { label: 'Sabah', kisiKey: 'sabahKisi' as const, harcamaKey: 'sabahHarcama' as const, toplam: sabahToplam },
    { label: 'Öğle',  kisiKey: 'ogleKisi'  as const, harcamaKey: 'ogleHarcama'  as const, toplam: ogleToplam  },
    { label: 'Akşam', kisiKey: 'aksamKisi' as const, harcamaKey: 'aksamHarcama' as const, toplam: aksamToplam },
  ];

  return (
    <div className={`rounded-xl border ${renk.border} flex flex-col gap-3 overflow-hidden`}>
      {/* Başlık */}
      <div className={`px-4 py-3 ${renk.light} border-b ${renk.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold ${renk.text}`}>{baslik}</span>
          <span className={`text-xs font-semibold ${renk.text}`}>{girdi.aylar.length} ay</span>
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-4">
        {/* Ay seçimi */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Aylar</p>
          <div className="grid grid-cols-3 gap-1">
            {AYLAR.map(ay => {
              const secili   = girdi.aylar.includes(ay);
              const disabled = digerAylar.includes(ay);
              return (
                <button
                  key={ay}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleAy(ay)}
                  className={`text-[11px] py-1 px-1 rounded border transition-colors text-center ${
                    secili
                      ? `${renk.bg} text-white border-transparent`
                      : disabled
                        ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {ay}
                </button>
              );
            })}
          </div>
        </div>

        {/* Öğün tablosu */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Günlük Öğün Cirosu</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 text-[11px]">
                <th className="text-left pb-1.5 font-medium"></th>
                <th className="text-right pb-1.5 font-medium">Kişi</th>
                <th className="text-right pb-1.5 font-medium pr-1">Harcama</th>
                <th className="text-right pb-1.5 font-medium">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {ogünler.map(({ label, kisiKey, harcamaKey, toplam }) => (
                <tr key={label} className="border-t border-gray-100">
                  <td className="py-1.5 font-medium text-gray-700 text-[11px] w-10">{label}</td>
                  <td className="py-1.5 text-right">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={girdi[kisiKey]}
                      onChange={e => setField(kisiKey, parseFloat(e.target.value) || 0)}
                      className="w-12 text-right text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
                    />
                  </td>
                  <td className="py-1.5 text-right pr-1">
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={girdi[harcamaKey]}
                      onChange={e => setField(harcamaKey, parseFloat(e.target.value) || 0)}
                      className="w-16 text-right text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
                    />
                  </td>
                  <td className="py-1.5 text-right font-mono text-gray-700 text-[11px]">
                    {toplam.toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={3} className={`py-1.5 text-[11px] font-semibold ${renk.text}`}>
                  Günlük Toplam
                </td>
                <td className={`py-1.5 text-right font-mono font-bold text-xs ${renk.text}`}>
                  {gunlukToplam.toLocaleString('tr-TR')} ₺
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

interface Props {
  girdi: CiroGirdisi;
  onChange: (v: CiroGirdisi) => void;
}

export default function Modul2Ciro({ girdi, onChange }: Props) {
  const [acik, setAcik] = useState(true);
  const sonuc = ciroHesapla(girdi);

  const set = useCallback(
    <K extends keyof CiroGirdisi>(k: K, v: CiroGirdisi[K]) => {
      onChange({ ...girdi, [k]: v });
    },
    [girdi, onChange],
  );

  const s1Aylar = girdi.sezon1.aylar;
  const s2Aylar = girdi.sezon2.aylar;
  const s3Aylar = girdi.sezon3.aylar;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
        style={{ backgroundColor: '#5A2D6E' }}
      >
        <div>
          <span className="text-sm font-bold text-white">
            Modül 2 — Ciro Projeksiyonu
          </span>
          <span className="ml-3 text-xs text-purple-200">
            Aylık Ort: {Math.round(sonuc.aylikBrutCiro).toLocaleString('tr-TR')} ₺
          </span>
        </div>
        <span className="text-white text-sm">{acik ? '▲' : '▼'}</span>
      </button>

      {acik && (
        <div className="p-5 flex flex-col gap-5">
          {/* Mekan */}
          <Card title="Mekan">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Kapalı Alan Sandalye Sayısı"
                value={girdi.kapaliAlanSandalyeSayisi}
                onChange={v => set('kapaliAlanSandalyeSayisi', v)}
                suffix="kişi"
                step={5}
              />
              <InputField
                label="Açık Alan Sandalye Sayısı"
                value={girdi.acikAlanSandalyeSayisi}
                onChange={v => set('acikAlanSandalyeSayisi', v)}
                suffix="kişi"
                step={5}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Toplam: {(girdi.kapaliAlanSandalyeSayisi || 0) + (girdi.acikAlanSandalyeSayisi || 0)} kişi
            </p>
          </Card>

          {/* Sezonlar */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Servis Öğünleri — Sezonlara Göre
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SezonKarti
                baslik="Sezon 1"
                renk={SEZON_RENK[0]}
                girdi={girdi.sezon1}
                digerAylar={[...s2Aylar, ...s3Aylar]}
                onChange={v => set('sezon1', v)}
              />
              <SezonKarti
                baslik="Sezon 2"
                renk={SEZON_RENK[1]}
                girdi={girdi.sezon2}
                digerAylar={[...s1Aylar, ...s3Aylar]}
                onChange={v => set('sezon2', v)}
              />
              <SezonKarti
                baslik="Sezon 3"
                renk={SEZON_RENK[2]}
                girdi={girdi.sezon3}
                digerAylar={[...s1Aylar, ...s2Aylar]}
                onChange={v => set('sezon3', v)}
              />
            </div>
          </div>

          {/* Paket Servis */}
          <Card title="Paket Servis">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Günlük Sipariş Adedi"
                value={girdi.paketSiparisSayisi}
                onChange={v => set('paketSiparisSayisi', v)}
                suffix="adet"
                step={1}
              />
              <InputField
                label="Ortalama Sipariş Tutarı"
                value={girdi.paketSiparisOrtalaması}
                onChange={v => set('paketSiparisOrtalaması', v)}
                step={10}
              />
            </div>
          </Card>

          {/* Çalışma Takvimi */}
          <Card title="Çalışma Takvimi">
            <SliderInput
              label="Aylık Çalışma Günü"
              min={20}
              max={31}
              step={1}
              value={girdi.aylikCalismaGunu}
              onChange={v => set('aylikCalismaGunu', v)}
              suffix=" gün"
            />
          </Card>

          {/* Özet */}
          <div className="rounded-xl border border-purple-200 p-4 flex flex-col gap-1" style={{ backgroundColor: '#EFE6F4' }}>
            <SonucSatiri label="Günlük Ort. Kapasite Cirosu" value={sonuc.gunlukKapasiteCiro} />
            <SonucSatiri label="Günlük Paket Servisi" value={sonuc.gunlukPaketCiro} />
            <SonucSatiri label="Günlük Ort. Brüt Ciro" value={sonuc.gunlukBrutCiro} bold />
            <div className="border-t border-purple-200 mt-1 pt-1">
              <SonucSatiri label="AYLIK ORT. BRÜT CİRO" value={sonuc.aylikBrutCiro} bold highlight="purple" />
              <SonucSatiri label="Yıllık Projeksiyon" value={sonuc.yillikBrutCiro} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
