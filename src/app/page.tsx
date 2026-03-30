'use client';
import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FIZIBILITE_VARSAYILAN } from '@/lib/hesaplama/fizibiliteEngine';
import type { FizibiliteGirdisi, FizibiliteSonucu } from '@/types/fizibilite';

const FizibiliteFormu = dynamic(
  () => import('@/components/fizibilite/FizibiliteFormu'),
  { ssr: false, loading: () => <div className="py-24 text-center text-sm text-gray-400">Yükleniyor…</div> }
);

// ─── localStorage yardımcıları ────────────────────────────────────────────────

const LS_KEY = 'rm_girdi';

function lsKaydet(girdi: FizibiliteGirdisi) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(girdi));
  } catch { /* ignore */ }
}

function lsYukle(): FizibiliteGirdisi | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as FizibiliteGirdisi) : null;
  } catch { return null; }
}

function getInitialGirdi(): FizibiliteGirdisi {
  if (typeof window === 'undefined') return FIZIBILITE_VARSAYILAN;
  return lsYukle() ?? FIZIBILITE_VARSAYILAN;
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function Page() {
  const [initialGirdi] = useState<FizibiliteGirdisi>(getInitialGirdi);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = useCallback((girdi: FizibiliteGirdisi, _sonuc: FizibiliteSonucu) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => lsKaydet(girdi), 500);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header
        className="px-6 py-4"
        style={{ backgroundColor: '#5A2D6E' }}
      >
        <h1 className="text-lg font-bold text-white tracking-tight">
          Restoran Maliyet &amp; Açılış Öngörü
        </h1>
        <p className="text-xs text-purple-200">Yatırım fizibilite analizi hesaplama aracı</p>
      </header>

      {/* İçerik */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <FizibiliteFormu
          initialGirdi={initialGirdi}
          onChange={handleChange}
        />
      </main>

      <div className="max-w-7xl mx-auto px-4 mt-6 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <span className="font-bold">Uyarı:</span> Bu araç tahmini hesaplama yapar.
            Amortisman, kurumlar/gelir vergisi, stopajlar, bankacılık giderleri,
            lisans/ruhsat ve sigorta giderleri dahil değildir.
            Kesin finansal karar için mali müşavir desteği alınız.
          </p>
        </div>
      </div>

      <footer
        className="px-6 py-3 text-center text-xs text-purple-200"
        style={{ backgroundColor: '#5A2D6E' }}
      >
        Restoran Maliyet Hesaplama Aracı — Yalnızca bilgi amaçlıdır
      </footer>
    </div>
  );
}
