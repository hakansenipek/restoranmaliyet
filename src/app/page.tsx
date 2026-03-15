'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { hesaplamayiKaydet, hesaplamayiYukle } from '@/lib/hesaplama/kaydet';
import { FIZIBILITE_VARSAYILAN } from '@/lib/hesaplama/fizibiliteEngine';
import type { FizibiliteGirdisi, FizibiliteSonucu } from '@/types/fizibilite';

const FizibiliteFormu = dynamic(
  () => import('@/components/fizibilite/FizibiliteFormu'),
  { ssr: false, loading: () => <div className="py-24 text-center text-sm text-gray-400">Yükleniyor…</div> }
);

export default function Page() {
  const [email, setEmail] = useState<string | null>(null);
  const [initialGirdi, setInitialGirdi] = useState<FizibiliteGirdisi | null>(null);
  const [yuklendi, setYuklendi] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email ?? null);

      const kayit = await hesaplamayiYukle();
      setInitialGirdi(kayit?.girdi ?? FIZIBILITE_VARSAYILAN);
      setYuklendi(true);
    }
    init();
  }, []);

  function handleChange(girdi: FizibiliteGirdisi, sonuc: FizibiliteSonucu) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      hesaplamayiKaydet(girdi, sonuc);
    }, 1500);
  }

  async function handleCikis() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/giris';
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between gap-3" style={{ backgroundColor: '#5A2D6E' }}>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Restoran Maliyet & Açılış Öngörü</h1>
          <p className="text-xs text-purple-200">Yatırım fizibilite analizi hesaplama aracı</p>
        </div>
        {email && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-purple-200 hidden sm:block">{email}</span>
            <button
              type="button"
              onClick={handleCikis}
              className="text-xs text-white/80 hover:text-white border border-white/30 rounded px-2.5 py-1 transition-colors hover:border-white/60"
            >
              Çıkış
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {yuklendi && initialGirdi ? (
          <FizibiliteFormu initialGirdi={initialGirdi} onChange={handleChange} />
        ) : (
          <div className="py-24 text-center text-sm text-gray-400">Yükleniyor…</div>
        )}
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
