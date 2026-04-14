'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

function emailKisa(e: string): string {
  const [local, domain] = e.split('@');
  if (e.length <= 24) return e;
  return local.slice(0, 10) + '…@' + domain;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [email, setEmail] = useState('');
  const [durum, setDurum] = useState<'bos' | 'gonderildi' | 'hata'>('bos');
  const [hataMsg, setHataMsg] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setModalAcik(false);
        setDurum('bos');
        setEmail('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setDurum('bos');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setDurum('gonderildi');
    } catch (err: unknown) {
      setHataMsg(err instanceof Error ? err.message : 'Bir hata oluştu');
      setDurum('hata');
    } finally {
      setYukleniyor(false);
    }
  }

  async function cikisYap() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  function modalKapat() {
    setModalAcik(false);
    setDurum('bos');
    setEmail('');
    setHataMsg('');
  }

  return (
    <>
      <header className="px-6 py-4" style={{ backgroundColor: '#5A2D6E' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Restoran Maliyet &amp; Açılış Öngörü
            </h1>
            <p className="text-xs text-purple-200">Yatırım fizibilite analizi hesaplama aracı</p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs text-purple-200 hidden sm:inline">
                  {emailKisa(user.email ?? '')}
                </span>
                <button
                  onClick={cikisYap}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <button
                onClick={() => setModalAcik(true)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors"
              >
                Kayıt Ol / Giriş Yap
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Giriş Modalı */}
      {modalAcik && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) modalKapat(); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-lg p-8">
            {/* Başlık + Kapat */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#EFE6F4' }}
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#7B3F8E" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Giriş Yap / Kayıt Ol</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Hesaplamalarınızı kaydetmek için giriş yapın
                </p>
              </div>
              <button
                onClick={modalKapat}
                className="ml-2 -mt-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Kapat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {durum === 'gonderildi' ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  E-postanı kontrol et!
                </p>
                <p className="text-xs text-amber-700">
                  <strong>{email}</strong> adresine giriş linki gönderildi.
                  Linke tıkladığında otomatik giriş yapılacak.
                </p>
              </div>
            ) : (
              <form onSubmit={gonder} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1.5">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#7B3F8E' } as React.CSSProperties}
                  />
                </div>

                {durum === 'hata' && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                    <p className="text-xs text-red-700">{hataMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={yukleniyor || !email}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#7B3F8E' }}
                >
                  {yukleniyor ? 'Gönderiliyor…' : 'Giriş Linki Gönder'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Hesap oluşturmana gerek yok — sadece e-posta yeterli
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
