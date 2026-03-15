'use client';
import type { FizibiliteSonucu, GelirGirdisi } from '@/types/fizibilite';

interface Props {
  sonuc: FizibiliteSonucu | null;
  gelir?: GelirGirdisi;
}

function pct(v: number, digits = 1) {
  return '%' + (v * 100).toFixed(digits);
}

function OranSatir({
  label,
  deger,
  renk,
  kalın = false,
}: {
  label: string;
  deger: string;
  renk?: string;
  kalın?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 ${kalın ? 'border-t border-gray-200 pt-2 mt-1' : ''}`}>
      <span className={`text-sm ${kalın ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{label}</span>
      <span className={`font-mono text-sm ${kalın ? 'font-bold text-base' : 'font-semibold'} ${renk ?? 'text-gray-800'}`}>
        {deger}
      </span>
    </div>
  );
}

function Kart({
  baslik,
  headerClass,
  children,
}: {
  baslik: string;
  headerClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className={`px-4 py-3 ${headerClass}`}>
        <h3 className="text-sm font-semibold text-white tracking-wide">{baslik}</h3>
      </div>
      <div className="p-4 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function oranRengi(oran: number, dikkat: number, kritik: number): string {
  if (oran >= kritik) return 'text-red-600';
  if (oran >= dikkat) return 'text-yellow-600';
  return 'text-green-600';
}

const UYARI_STIL = {
  bilgi: 'bg-blue-50 border-blue-200 text-blue-800',
  uyari: 'bg-amber-50 border-amber-200 text-amber-800',
  kritik: 'bg-red-50 border-red-200 text-red-700',
} as const;

const UYARI_IKON = {
  bilgi: 'ℹ',
  uyari: '⚠',
  kritik: '✕',
} as const;

export default function FizibiliteSonuc({ sonuc, gelir }: Props) {
  if (!sonuc) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-8 py-16 text-center">
        <p className="text-4xl mb-4">📊</p>
        <p className="text-base font-medium text-gray-500">
          Formu doldurmaya başladığınızda sonuçlar burada görünür.
        </p>
      </div>
    );
  }

  const {
    odemeKomisyonGideri,
    tahminiAylikBrutCiro,
    toplamPersonelMaliyet,
    personelCiroOrani,
    toplamSMMGider,
    smmOrani,
    toplamGenelGider,
    toplamAylikGider,
    faaliyetKari,
    netKarMarji,
    roiAy,
    uyarilar,
  } = sonuc;

  const komisyonOrani = tahminiAylikBrutCiro > 0 ? odemeKomisyonGideri / tahminiAylikBrutCiro : 0;
  const genelGiderOrani = tahminiAylikBrutCiro > 0 ? toplamGenelGider / tahminiAylikBrutCiro : 0;
  const toplamGiderOrani = tahminiAylikBrutCiro > 0 ? toplamAylikGider / tahminiAylikBrutCiro : 0;
  const karPositif = faaliyetKari >= 0;

  // Gelir özeti için
  const aktifOgunSayisi = gelir
    ? [gelir.sabah, gelir.ogle, gelir.aksam].filter(o => o.aktif).length
    : null;
  const gunlukMusteriTahmini = gelir
    ? [gelir.sabah, gelir.ogle, gelir.aksam]
        .filter(o => o.aktif)
        .reduce((t, o) => t + o.gunlukKisiSayisi, 0)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Gelir Projeksiyonu */}
        <Kart baslik="Gelir Projeksiyonu" headerClass="bg-[#7B3F8E]">
          <OranSatir
            label="Ödeme Komisyon Oranı"
            deger={pct(komisyonOrani)}
            renk={oranRengi(komisyonOrani, 0.05, 0.10)}
          />
          {aktifOgunSayisi !== null && (
            <OranSatir
              label="Aktif Öğün Sayısı"
              deger={`${aktifOgunSayisi} öğün`}
            />
          )}
          {gunlukMusteriTahmini !== null && (
            <OranSatir
              label="Tahmini Günlük Müşteri"
              deger={`${gunlukMusteriTahmini} kişi`}
            />
          )}
        </Kart>

        {/* Gider Dağılımı */}
        <Kart baslik="Gider Oranları (Ciro %)" headerClass="bg-[#7B3F8E]">
          <OranSatir
            label="Personel Gider Oranı"
            deger={pct(personelCiroOrani)}
            renk={oranRengi(personelCiroOrani, 0.25, 0.30)}
          />
          <OranSatir
            label="SMM Oranı"
            deger={pct(smmOrani)}
            renk={oranRengi(smmOrani, 0.32, 0.38)}
          />
          <OranSatir
            label="Genel Gider Oranı"
            deger={pct(genelGiderOrani)}
          />
          <OranSatir
            label="Toplam Gider Oranı"
            deger={pct(toplamGiderOrani)}
            renk={oranRengi(toplamGiderOrani, 0.80, 1.00)}
            kalın
          />
        </Kart>

        {/* Kârlılık */}
        <Kart
          baslik="Kârlılık"
          headerClass={karPositif ? 'bg-green-700' : 'bg-red-600'}
        >
          <div className="flex flex-col items-center py-3 gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Net Kâr Marjı
            </span>
            <span className={`text-4xl font-bold font-mono ${karPositif ? 'text-green-600' : 'text-red-600'}`}>
              {karPositif ? '' : '−'}{pct(Math.abs(netKarMarji))}
            </span>
            <span className={`text-xs font-medium ${karPositif ? 'text-green-600' : 'text-red-500'}`}>
              {karPositif ? 'Kâr' : 'Zarar'}
            </span>
          </div>
        </Kart>

        {/* ROI */}
        <Kart baslik="Yatırım Geri Dönüşü (ROI)" headerClass="bg-[#5A2D6E]">
          <div className="flex flex-col items-center py-3 gap-2">
            {isFinite(roiAy) ? (
              <>
                <span className="text-4xl font-bold font-mono text-[#7B3F8E]">
                  {Math.round(roiAy)}
                </span>
                <span className="text-sm font-semibold text-gray-500">ay</span>
                <span className="text-xs text-gray-400">
                  ({(roiAy / 12).toFixed(1)} yıl)
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-red-500">Hesaplanamıyor</span>
                <span className="text-xs text-gray-400">Faaliyet kârı sıfır veya negatif</span>
              </div>
            )}
          </div>
        </Kart>

      </div>

      {/* Uyarı Paneli */}
      {uyarilar.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Analiz & Uyarılar</h3>
          <div className="flex flex-col gap-2">
            {uyarilar.map((u, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${UYARI_STIL[u.seviye]}`}
              >
                <span className="mt-0.5 shrink-0 text-base font-bold leading-none">
                  {UYARI_IKON[u.seviye]}
                </span>
                <span className="leading-snug">{u.mesaj}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
