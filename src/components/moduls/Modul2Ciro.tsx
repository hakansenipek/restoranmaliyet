'use client';

import { useCallback, useState } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import SonucSatiri from '@/components/ui/SonucSatiri';
import { ciroHesapla } from '@/lib/hesaplama/ciroEngine';
import type { CiroGirdisi, SezonVerisi } from '@/types';
import { VARSAYILAN_SEZON } from '@/types';

const AYLAR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const SEZON_RENK = [
  { bg: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50' },
  { bg: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50' },
  { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
];

interface OgunTablosuProps {
  baslik: string;
  altBaslik: string;
  renk: typeof SEZON_RENK[0];
  sabahKisiKey: keyof SezonVerisi;
  sabahHarcamaKey: keyof SezonVerisi;
  ogleKisiKey: keyof SezonVerisi;
  ogleHarcamaKey: keyof SezonVerisi;
  aksamKisiKey: keyof SezonVerisi;
  aksamHarcamaKey: keyof SezonVerisi;
  girdi: SezonVerisi;
  setField: (k: keyof SezonVerisi, v: number) => void;
}

function OgunTablosu({
  baslik, altBaslik, renk,
  sabahKisiKey, sabahHarcamaKey,
  ogleKisiKey, ogleHarcamaKey,
  aksamKisiKey, aksamHarcamaKey,
  girdi, setField,
}: OgunTablosuProps) {
  const sabahT = (girdi[sabahKisiKey] as number || 0) * (girdi[sabahHarcamaKey] as number || 0);
  const ogleT  = (girdi[ogleKisiKey]  as number || 0) * (girdi[ogleHarcamaKey]  as number || 0);
  const aksamT = (girdi[aksamKisiKey] as number || 0) * (girdi[aksamHarcamaKey] as number || 0);
  const gunluk = sabahT + ogleT + aksamT;

  const satirlar = [
    { label: 'Sabah', kisiKey: sabahKisiKey, harcamaKey: sabahHarcamaKey, toplam: sabahT },
    { label: 'Öğle',  kisiKey: ogleKisiKey,  harcamaKey: ogleHarcamaKey,  toplam: ogleT  },
    { label: 'Akşam', kisiKey: aksamKisiKey, harcamaKey: aksamHarcamaKey, toplam: aksamT },
  ];

  return (
    <div className={`w-full rounded-lg border ${renk.border} p-3`}>
      <div className="mb-2">
        <p className={`text-[11px] font-bold ${renk.text}`}>{baslik}</p>
        <p className="text-[10px] text-gray-400">{altBaslik}</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 text-[10px]">
            <th className="text-left pb-1 font-medium w-10"></th>
            <th className="text-right pb-1 font-medium">Kişi</th>
            <th className="text-right pb-1 font-medium pr-1">₺/Kişi</th>
            <th className="text-right pb-1 font-medium">Toplam</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map(({ label, kisiKey, harcamaKey, toplam }) => (
            <tr key={label} className="border-t border-gray-100">
              <td className="py-1 font-medium text-gray-700 text-[11px]">{label}</td>
              <td className="py-1 text-right">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={girdi[kisiKey] as number || 0}
                  onChange={e => setField(kisiKey, parseFloat(e.target.value) || 0)}
                  className="w-12 text-right text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
                />
              </td>
              <td className="py-1 text-right pr-1">
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={girdi[harcamaKey] as number || 0}
                  onChange={e => setField(harcamaKey, parseFloat(e.target.value) || 0)}
                  className="w-14 text-right text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
                />
              </td>
              <td className="py-1 text-right font-mono text-gray-700 text-[11px]">
                {toplam.toLocaleString('tr-TR')}₺
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td colSpan={3} className={`py-1 text-[11px] font-semibold ${renk.text}`}>
              Günlük
            </td>
            <td className={`py-1 text-right font-mono font-bold text-[11px] ${renk.text}`}>
              {gunluk.toLocaleString('tr-TR')}₺
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

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

  const haftaIciGunluk =
    (girdi.haftaIciSabahKisi || 0) * (girdi.haftaIciSabahHarcama || 0) +
    (girdi.haftaIciOgleKisi  || 0) * (girdi.haftaIciOgleHarcama  || 0) +
    (girdi.haftaIciAksamKisi || 0) * (girdi.haftaIciAksamHarcama || 0);
  const haftaSonuGunluk =
    (girdi.haftaSonuSabahKisi || 0) * (girdi.haftaSonuSabahHarcama || 0) +
    (girdi.haftaSonuOgleKisi  || 0) * (girdi.haftaSonuOgleHarcama  || 0) +
    (girdi.haftaSonuAksamKisi || 0) * (girdi.haftaSonuAksamHarcama || 0);
  const aylikOgunCiro = haftaIciGunluk * 22 + haftaSonuGunluk * 8;

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

        {/* Hafta içi / Hafta sonu öğün tabloları */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Günlük Öğün Cirosu</p>
          <div className="flex flex-col gap-2">
            <OgunTablosu
              baslik="Hafta İçi"
              altBaslik="Pzt–Cum (22 gün/ay)"
              renk={renk}
              sabahKisiKey="haftaIciSabahKisi"
              sabahHarcamaKey="haftaIciSabahHarcama"
              ogleKisiKey="haftaIciOgleKisi"
              ogleHarcamaKey="haftaIciOgleHarcama"
              aksamKisiKey="haftaIciAksamKisi"
              aksamHarcamaKey="haftaIciAksamHarcama"
              girdi={girdi}
              setField={setField}
            />
            <OgunTablosu
              baslik="Hafta Sonu"
              altBaslik="Cmt–Paz (8 gün/ay)"
              renk={renk}
              sabahKisiKey="haftaSonuSabahKisi"
              sabahHarcamaKey="haftaSonuSabahHarcama"
              ogleKisiKey="haftaSonuOgleKisi"
              ogleHarcamaKey="haftaSonuOgleHarcama"
              aksamKisiKey="haftaSonuAksamKisi"
              aksamHarcamaKey="haftaSonuAksamHarcama"
              girdi={girdi}
              setField={setField}
            />
          </div>
          <div className={`flex items-center justify-between mt-2 pt-2 border-t ${renk.border}`}>
            <span className={`text-[11px] font-bold ${renk.text}`}>Aylık Öğün Cirosu</span>
            <span className={`text-xs font-mono font-bold ${renk.text}`}>
              {aylikOgunCiro.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>

        {/* Paket Servis */}
        <div className={`rounded-lg border ${renk.border} p-3`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Paket Servis</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-600 shrink-0">Günlük Adet</span>
              <input
                type="number"
                min={0}
                step={1}
                value={girdi.paketAdet || 0}
                onChange={e => setField('paketAdet', parseFloat(e.target.value) || 0)}
                className="w-16 text-right text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
              />
              <span className="text-[11px] text-gray-400">adet</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-600 shrink-0">Kişi Başı Tutar</span>
              <input
                type="number"
                min={0}
                step={10}
                value={girdi.paketTutar || 0}
                onChange={e => setField('paketTutar', parseFloat(e.target.value) || 0)}
                className="w-16 text-right text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
              />
              <span className="text-[11px] text-gray-400">₺</span>
            </div>
            <div className={`flex items-center justify-between border-t ${renk.border} pt-2 mt-1`}>
              <span className={`text-[11px] font-semibold ${renk.text}`}>Aylık Toplam</span>
              <span className={`text-xs font-mono font-bold ${renk.text}`}>
                {((girdi.paketAdet || 0) * (girdi.paketTutar || 0) * 30).toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>
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
  const [acik, setAcik] = useState(false);
  const sonuc = ciroHesapla(girdi);

  const set = useCallback(
    <K extends keyof CiroGirdisi>(k: K, v: CiroGirdisi[K]) => {
      onChange({ ...girdi, [k]: v });
    },
    [girdi, onChange],
  );

  const s1 = girdi.sezon1 ?? VARSAYILAN_SEZON;
  const s2 = girdi.sezon2 ?? VARSAYILAN_SEZON;
  const s3 = girdi.sezon3 ?? VARSAYILAN_SEZON;
  const s1Aylar = s1.aylar ?? [];
  const s2Aylar = s2.aylar ?? [];
  const s3Aylar = s3.aylar ?? [];

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
            <p className="text-xs text-gray-500 mb-3">
              Sandalye sayısı, o öğünde ağırlayabileceğiniz maksimum kişiyi temsil eder. Tahminlerinizi yaparken sandalye sayınızı ve &ldquo;masa devir hızınızı&rdquo; (turnover) göz önünde bulundurun.
            </p>
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Servis Öğünleri — Sezonlara Göre
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Restoranınızın doluluk oranları mevsimsel faktörlere göre değişkenlik gösterir. 12 ayı kendi içinde 3 ana sezona ayırarak; hafta içi ve hafta sonu misafir alışkanlıklarını her dönem için ayrı ayrı simüle edin. İşletmenizin cirosunu tahmin ederken, misafirlerinizi hangi öğünlerde ve hangi yoğunlukta ağırlayacağınızı belirleyin.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SezonKarti
                baslik="Sezon 1"
                renk={SEZON_RENK[0]}
                girdi={s1}
                digerAylar={[...s2Aylar, ...s3Aylar]}
                onChange={v => set('sezon1', v)}
              />
              <SezonKarti
                baslik="Sezon 2"
                renk={SEZON_RENK[1]}
                girdi={s2}
                digerAylar={[...s1Aylar, ...s3Aylar]}
                onChange={v => set('sezon2', v)}
              />
              <SezonKarti
                baslik="Sezon 3"
                renk={SEZON_RENK[2]}
                girdi={s3}
                digerAylar={[...s1Aylar, ...s2Aylar]}
                onChange={v => set('sezon3', v)}
              />
            </div>
          </div>

          {/* Çalışma Takvimi */}
          <Card title="Çalışma Takvimi">
            <p className="text-xs text-gray-500 mb-3">
              İşletmenizin aylık çalışma takvimini girin. Haftalık izin günlerini düşerek net çalışma gününüzü belirlemek, gider kalemlerinizin (personel yemeği vb.) gerçekçi hesaplanmasını sağlar.
            </p>
            <InputField
              label="Aylık Çalışma Günü"
              value={girdi.aylikCalismaGunu}
              onChange={v => set('aylikCalismaGunu', v)}
              suffix="gün"
              step={1}
            />
            <p className="text-[11px] text-gray-400 mt-2">
              Eğer haftanın her günü açıksanız 30, haftada 1 gün kapalıysanız ortalama 26 gün olarak tanımlayabilirsiniz.
            </p>
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
