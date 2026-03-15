'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function GirisPage() {
  const [email, setEmail] = useState('');
  const [durum, setDurum] = useState<'bekliyor' | 'gonderildi' | 'hata'>('bekliyor');
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleGiris(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setDurum('bekliyor');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setYukleniyor(false);
    setDurum(error ? 'hata' : 'gonderildi');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-[#5A2D6E] px-6 py-4 shadow-md">
        <h1 className="text-white text-lg font-bold tracking-tight">
          Restoran Maliyet &amp; Açılış Öngörü
        </h1>
      </header>

      {/* Kart */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Kart başlık */}
          <div className="bg-[#5A2D6E] px-6 py-5">
            <h2 className="text-white text-base font-semibold">Giriş Yap</h2>
            <p className="text-white/70 text-xs mt-1">
              Hesaplamalarınıza devam etmek için e-posta adresinizi girin.
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-6 flex flex-col gap-4">
            {durum === 'gonderildi' ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="text-4xl">📬</span>
                <p className="text-sm font-semibold text-gray-700">Bağlantı gönderildi!</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>{email}</strong> adresine giriş bağlantısı gönderdik.
                  E-postanızı kontrol edin ve bağlantıya tıklayın.
                </p>
                <button
                  type="button"
                  onClick={() => { setDurum('bekliyor'); setEmail(''); }}
                  className="mt-2 text-xs text-[#7B3F8E] underline underline-offset-2 hover:text-[#5A2D6E]"
                >
                  Farklı e-posta ile dene
                </button>
              </div>
            ) : (
              <form onSubmit={handleGiris} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ornek@sirket.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 shadow-sm focus:border-[#7B3F8E] focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/20"
                  />
                </div>

                {durum === 'hata' && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    Bir hata oluştu. E-posta adresinizi kontrol edip tekrar deneyin.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={yukleniyor || !email}
                  className="w-full rounded-lg bg-[#7B3F8E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#5A2D6E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {yukleniyor ? 'Gönderiliyor…' : 'Giriş Bağlantısı Gönder'}
                </button>

                <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                  Şifre gerekmez — e-postanıza tek kullanımlık giriş bağlantısı gönderilir.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#5A2D6E] py-3 text-center text-xs text-white/50">
        © 2026 Restoran Maliyet Hesaplama Aracı
      </footer>
    </div>
  );
}
