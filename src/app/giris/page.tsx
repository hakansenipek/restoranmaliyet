'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function GirisPage() {
  const [email, setEmail] = useState('');
  const [durum, setDurum] = useState<'bos' | 'gonderildi' | 'hata'>('bos');
  const [hataMsg, setHataMsg] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setDurum('bos');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="px-6 py-4" style={{ backgroundColor: '#5A2D6E' }}>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Restoran Maliyet &amp; Açılış Öngörü
        </h1>
        <p className="text-xs text-purple-200">Yatırım fizibilite analizi hesaplama aracı</p>
      </header>

      {/* Merkezi Kart */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8">
            {/* Logo/Başlık */}
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#EFE6F4' }}
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#7B3F8E"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Giriş Yap</h2>
              <p className="text-sm text-gray-500 mt-1">
                Hesaplamalarınızı kaydetmek için giriş yapın
              </p>
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
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 text-center" style={{ backgroundColor: '#5A2D6E' }}>
        <p className="text-xs text-purple-300">
          Restoran Maliyet Hesaplama Aracı — Yalnızca bilgi amaçlıdır
        </p>
      </footer>
    </div>
  );
}
