'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { FormDurumu, HesaplamaSonucu } from '@/types';

interface Props {
  form: FormDurumu;
  sonuc: HesaplamaSonucu;
}

export default function IndirButonlari({ form, sonuc }: Props) {
  const [modalAcik, setModalAcik] = useState(false);
  const [mesaj, setMesaj] = useState('');
  const [durum, setDurum] = useState<'bos' | 'yukleniyor' | 'gonderildi' | 'hata'>('bos');
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? undefined);
    });
  }, []);

  async function handlePdf() {
    const { pdfIndir } = await import('@/lib/export');
    pdfIndir(form, sonuc);
  }

  async function handleGonder(e: React.FormEvent) {
    e.preventDefault();
    setDurum('yukleniyor');
    try {
      const res = await fetch('/api/gorus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesaj, email: userEmail }),
      });
      if (!res.ok) throw new Error();
      setDurum('gonderildi');
    } catch {
      setDurum('hata');
    }
  }

  function modalKapat() {
    setModalAcik(false);
    setMesaj('');
    setDurum('bos');
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePdf}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#C4215A' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF Rapor İndir
        </button>

        <button
          onClick={() => setModalAcik(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#5A2D6E' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
          </svg>
          Görüş ve Talepleriniz
        </button>
      </div>

      {/* Giriş yapılmamışsa uyarı modalı */}
      {modalAcik && !userEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) modalKapat(); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-lg p-8 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#EFE6F4' }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#7B3F8E" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Giriş Gerekli</h2>
            <p className="text-sm text-gray-500 mb-6">
              Görüş ve taleplerinizi iletmek için lütfen önce giriş yapın.
            </p>
            <button
              onClick={modalKapat}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#5A2D6E' }}
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {modalAcik && userEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) modalKapat(); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-lg p-8">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Görüş ve Talepleriniz</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Öneri, hata bildirimi veya talepleri iletmek için yazın.
                </p>
              </div>
              <button
                onClick={modalKapat}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Kapat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {durum === 'gonderildi' ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
                <p className="text-sm font-semibold text-green-800 mb-1">Mesajınız iletildi!</p>
                <p className="text-xs text-green-700">Teşekkür ederiz, en kısa sürede değerlendireceğiz.</p>
                <button
                  onClick={modalKapat}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: '#5A2D6E' }}
                >
                  Kapat
                </button>
              </div>
            ) : (
              <form onSubmit={handleGonder} className="flex flex-col gap-4">
                {userEmail && (
                  <p className="text-xs text-gray-400">
                    Gönderen: <span className="text-gray-600 font-medium">{userEmail}</span>
                  </p>
                )}
                <textarea
                  required
                  autoFocus
                  rows={5}
                  placeholder="Görüş, öneri veya talebinizi buraya yazın…"
                  value={mesaj}
                  onChange={e => setMesaj(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#7B3F8E' } as React.CSSProperties}
                />

                {durum === 'hata' && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                    <p className="text-xs text-red-700">Gönderilemedi, lütfen tekrar deneyin.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={durum === 'yukleniyor' || mesaj.trim().length < 5}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#5A2D6E' }}
                >
                  {durum === 'yukleniyor' ? 'Gönderiliyor…' : 'Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
