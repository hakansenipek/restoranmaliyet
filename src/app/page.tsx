'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { hesaplamayiKaydet, hesaplamayiYukle } from '@/lib/supabase/kaydet';
import { FIZIBILITE_VARSAYILAN } from '@/lib/hesaplama/fizibiliteEngine';
import type { FizibiliteGirdisi, FizibiliteSonucu } from '@/types/fizibilite';

const FizibiliteFormu = dynamic(
  () => import('@/components/fizibilite/FizibiliteFormu'),
  { ssr: false, loading: () => <div className="py-24 text-center text-sm text-gray-400">Yükleniyor…</div> }
);

// ─── Magic Link Modal ────────────────────────────────────────────────────────

function GirisModal({ onKapat }: { onKapat: () => void }) {
  const [email, setEmail] = useState('');
  const [durum, setDurum] = useState<'bekliyor' | 'gonderildi' | 'hata'>('bekliyor');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleGonder(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setYukleniyor(false);
    if (error) {
      setHata(error.message);
      setDurum('hata');
    } else {
      setDurum('gonderildi');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onKapat(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Başlık */}
        <div className="px-6 py-5 flex items-start justify-between" style={{ backgroundColor: '#5A2D6E' }}>
          <div>
            <h2 className="text-white text-base font-semibold">Hesaplamalarını Kaydet</h2>
            <p className="text-purple-200 text-xs mt-1">
              E-posta adresinize tek kullanımlık giriş linki göndereceğiz.
            </p>
          </div>
          <button
            type="button"
            onClick={onKapat}
            className="text-purple-300 hover:text-white text-lg leading-none mt-0.5 ml-4"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* İçerik */}
        <div className="px-6 py-6">
          {durum === 'gonderildi' ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="text-4xl">📬</span>
              <p className="text-sm font-semibold text-gray-700">E-postanı kontrol et!</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>{email}</strong> adresine giriş linkinizi gönderdik.
                Linke tıklayarak giriş yapabilirsin.
              </p>
              <div className="mt-1 w-full rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                <p className="text-xs text-green-700 font-medium text-center">
                  Giriş linkiniz gönderildi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setDurum('bekliyor'); setEmail(''); }}
                className="mt-1 text-xs text-[#7B3F8E] underline underline-offset-2 hover:text-[#5A2D6E]"
              >
                Farklı e-posta ile dene
              </button>
            </div>
          ) : (
            <form onSubmit={handleGonder} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="ornek@sirket.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 shadow-sm focus:border-[#7B3F8E] focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/20"
                />
              </div>

              {durum === 'hata' && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {hata || 'Bir hata oluştu. Tekrar deneyin.'}
                </p>
              )}

              <button
                type="submit"
                disabled={yukleniyor || !email}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#7B3F8E' }}
              >
                {yukleniyor ? 'Gönderiliyor…' : 'Giriş Linki Gönder'}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function Page() {
  const [kullaniciEmail, setKullaniciEmail] = useState<string | null>(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [formuKey, setFormuKey] = useState('varsayilan');
  const [initialGirdi, setInitialGirdi] = useState<FizibiliteGirdisi>(FIZIBILITE_VARSAYILAN);
  const [kaydetDurum, setKaydetDurum] = useState<'bekliyor' | 'yukleniyor' | 'basarili' | 'hata'>('bekliyor');

  const guncelGirdiRef = useRef<FizibiliteGirdisi>(FIZIBILITE_VARSAYILAN);
  const guncelSonucRef = useRef<FizibiliteSonucu | null>(null);
  const basariliTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Auth state listener + ilk yükleme
  useEffect(() => {
    const supabase = createClient();

    async function yukleKayit(userId: string, email: string) {
      setKullaniciEmail(email);
      const girdi = await hesaplamayiYukle();
      if (girdi) {
        setInitialGirdi(girdi);
        setFormuKey('kayitli-' + userId);
      }
      setModalAcik(false);
    }

    // İlk kontrol
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) yukleKayit(user.id, user.email!);
    });

    // Auth değişikliklerini dinle (giriş linki dönüşü)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        yukleKayit(session.user.id, session.user.email!);
      } else if (event === 'SIGNED_OUT') {
        setKullaniciEmail(null);
        setInitialGirdi(FIZIBILITE_VARSAYILAN);
        setFormuKey('cikis');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleChange = useCallback(
    (girdi: FizibiliteGirdisi, sonuc: FizibiliteSonucu) => {
      guncelGirdiRef.current = girdi;
      guncelSonucRef.current = sonuc;
    },
    []
  );

  async function handleKaydet() {
    if (!guncelSonucRef.current) return;
    setKaydetDurum('yukleniyor');
    try {
      await hesaplamayiKaydet(guncelGirdiRef.current, guncelSonucRef.current);
      setKaydetDurum('basarili');
      basariliTimerRef.current = setTimeout(() => setKaydetDurum('bekliyor'), 2000);
    } catch {
      setKaydetDurum('hata');
    }
  }

  async function handleCikis() {
    clearTimeout(basariliTimerRef.current);
    const supabase = createClient();
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT event state'i güncelleyecek
  }

  const kaydetLabel =
    kaydetDurum === 'yukleniyor' ? 'Kaydediliyor...' :
    kaydetDurum === 'basarili'  ? 'Kaydedildi ✓' :
    kaydetDurum === 'hata'      ? 'Hata!' :
    'Kaydet';

  const kaydetRenk =
    kaydetDurum === 'basarili' ? '#16a34a' :
    kaydetDurum === 'hata'     ? '#dc2626' :
    '#16a34a';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between gap-3"
        style={{ backgroundColor: '#5A2D6E' }}
      >
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Restoran Maliyet & Açılış Öngörü
          </h1>
          <p className="text-xs text-purple-200">Yatırım fizibilite analizi hesaplama aracı</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {kullaniciEmail ? (
            <>
              <span className="text-xs text-purple-200 hidden sm:block">{kullaniciEmail}</span>
              <button
                type="button"
                onClick={handleKaydet}
                disabled={kaydetDurum === 'yukleniyor'}
                className="text-xs font-semibold text-white rounded px-2.5 py-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: kaydetRenk }}
              >
                {kaydetLabel}
              </button>
              <button
                type="button"
                onClick={handleCikis}
                className="text-xs text-white/80 hover:text-white border border-white/30 rounded px-2.5 py-1 transition-colors hover:border-white/60"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-purple-300 hidden sm:block">
                Hesaplamalarını kaydet
              </span>
              <button
                type="button"
                onClick={() => setModalAcik(true)}
                className="text-xs text-white border border-white/40 rounded px-2.5 py-1 hover:bg-white/10 transition-colors"
              >
                Giriş Yap
              </button>
            </>
          )}
        </div>
      </header>

      {/* İçerik */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <FizibiliteFormu
          key={formuKey}
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

      {/* Modal */}
      {modalAcik && <GirisModal onKapat={() => setModalAcik(false)} />}
    </div>
  );
}
