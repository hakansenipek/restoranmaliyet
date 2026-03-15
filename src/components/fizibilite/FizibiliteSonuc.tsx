'use client';
import type { FizibiliteSonucu, GelirGirdisi } from '@/types/fizibilite';

interface Props {
  sonuc: FizibiliteSonucu | null;
  gelir?: GelirGirdisi;
}

function para(v: number) {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}

function pct(v: number, digits = 1) {
  return '%' + (v * 100).toFixed(digits);
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

function GelirSatir({
  label,
  tutar,
  tutarRenk,
  kalın = false,
}: {
  label: string;
  tutar: number;
  tutarRenk?: string;
  kalın?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 ${kalın ? 'border-t border-gray-200 pt-2 mt-1' : ''}`}>
      <span className={`text-sm ${kalın ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{label}</span>
      <span className={`font-mono text-sm font-semibold ${tutarRenk ?? 'text-gray-800'}`}>
        {para(tutar)}
      </span>
    </div>
  );
}

function GiderSatir({
  label,
  tutar,
  oran,
  tutarRenk,
  kalın = false,
}: {
  label: string;
  tutar: number;
  oran: number;
  tutarRenk?: string;
  kalın?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${kalın ? 'border-t border-gray-200 pt-2 mt-1' : ''}`}>
      <span className={`flex-1 text-sm ${kalın ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{label}</span>
      <span className={`font-mono text-sm font-semibold ${tutarRenk ?? 'text-gray-800'}`}>
        {para(tutar)}
      </span>
      <span className={`w-12 text-right text-xs font-mono ${tutarRenk ?? 'text-gray-400'}`}>
        {pct(oran)}
      </span>
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
    tahminiAylikBrutCiro,
    odemeKomisyonGideri,
    netCiro,
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

  const genelGiderOrani = tahminiAylikBrutCiro > 0 ? toplamGenelGider / tahminiAylikBrutCiro : 0;
  const toplamGiderOrani = tahminiAylikBrutCiro > 0 ? toplamAylikGider / tahminiAylikBrutCiro : 0;
  const komisyonOrani = tahminiAylikBrutCiro > 0 ? odemeKomisyonGideri / tahminiAylikBrutCiro : 0;
  const karPositif = faaliyetKari >= 0;

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
          <GelirSatir label="Tahmini Brüt Ciro" tutar={tahminiAylikBrutCiro} />
          <GelirSatir
            label="Ödeme Komisyon Gideri"
            tutar={odemeKomisyonGideri}
            tutarRenk="text-red-600"
          />
          <GelirSatir
            label="Net Ciro"
            tutar={netCiro}
            tutarRenk="text-[#7B3F8E] font-bold"
            kalın
          />
          {aktifOgunSayisi !== null && (
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2 mt-1">
              <span className="text-xs text-gray-400">Aktif öğün</span>
              <span className="text-xs font-mono text-gray-500">{aktifOgunSayisi} öğün</span>
            </div>
          )}
          {gunlukMusteriTahmini !== null && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400">Tahmini günlük müşteri</span>
              <span className="text-xs font-mono text-gray-500">{gunlukMusteriTahmini} kişi</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400">Ödeme komisyon oranı</span>
            <span className={`text-xs font-mono font-semibold ${oranRengi(komisyonOrani, 0.05, 0.10)}`}>
              {pct(komisyonOrani)}
            </span>
          </div>
        </Kart>

        {/* Aylık Gider Dağılımı */}
        <Kart baslik="Aylık Gider Dağılımı" headerClass="bg-[#7B3F8E]">
          <GiderSatir
            label="Personel Gideri"
            tutar={toplamPersonelMaliyet}
            oran={personelCiroOrani}
            tutarRenk={oranRengi(personelCiroOrani, 0.25, 0.30)}
          />
          <GiderSatir
            label="SMM Gideri"
            tutar={toplamSMMGider}
            oran={smmOrani}
            tutarRenk={oranRengi(smmOrani, 0.32, 0.38)}
          />
          <GiderSatir
            label="Genel Giderler"
            tutar={toplamGenelGider}
            oran={genelGiderOrani}
          />
          <GiderSatir
            label="Toplam Gider"
            tutar={toplamAylikGider}
            oran={toplamGiderOrani}
            tutarRenk={oranRengi(toplamGiderOrani, 0.80, 1.00)}
            kalın
          />
        </Kart>

        {/* Kârlılık */}
        <Kart
          baslik="Kârlılık"
          headerClass={karPositif ? 'bg-green-700' : 'bg-red-600'}
        >
          <div className="flex flex-col items-center py-2 gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Aylık Faaliyet Kârı
            </span>
            <span className={`text-2xl font-bold font-mono ${karPositif ? 'text-green-600' : 'text-red-600'}`}>
              {karPositif ? '' : '−'}{para(Math.abs(faaliyetKari))}
            </span>
            <span className={`text-xs font-medium ${karPositif ? 'text-green-600' : 'text-red-500'}`}>
              {karPositif ? 'Kâr' : 'Zarar'}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Net Kâr Marjı</span>
            <span className={`font-mono text-sm font-bold ${karPositif ? 'text-green-600' : 'text-red-600'}`}>
              {karPositif ? '' : '−'}{pct(Math.abs(netKarMarji))}
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
