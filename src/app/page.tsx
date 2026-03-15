'use client';
import dynamic from 'next/dynamic';

const FizibiliteFormu = dynamic(
  () => import('@/components/fizibilite/FizibiliteFormu'),
  { ssr: false, loading: () => <div className="py-12 text-center text-sm text-gray-400">Yükleniyor…</div> }
);

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: '#5A2D6E' }}>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Restoran Maliyet & Açılış Öngörü</h1>
          <p className="text-xs text-purple-200">Yatırım fizibilite analizi hesaplama aracı</p>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <FizibiliteFormu />
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

      <footer className="px-6 py-3 text-center text-xs text-purple-200" style={{ backgroundColor: '#5A2D6E' }}>
        Restoran Maliyet Hesaplama Aracı — Yalnızca bilgi amaçlıdır
      </footer>
    </div>
  );
}
