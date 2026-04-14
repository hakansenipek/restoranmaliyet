'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Modul1Capex from '@/components/moduls/Modul1Capex';
import Modul2Ciro from '@/components/moduls/Modul2Ciro';
import Modul3Opex from '@/components/moduls/Modul3Opex';
import Modul4PL from '@/components/moduls/Modul4PL';
import Modul5Roi from '@/components/moduls/Modul5Roi';
import SonucPaneli from '@/components/sonuc/SonucPaneli';
import SenaryoTablosu from '@/components/sonuc/SenaryoTablosu';
import RoiGrafik from '@/components/sonuc/RoiGrafik';
import IndirButonlari from '@/components/IndirButonlari';
import { capexHesapla } from '@/lib/hesaplama/capexEngine';
import { ciroHesapla } from '@/lib/hesaplama/ciroEngine';
import { opexHesapla } from '@/lib/hesaplama/opexEngine';
import { netSatisHesapla, plHesapla } from '@/lib/hesaplama/plEngine';
import { roiHesapla } from '@/lib/hesaplama/roiEngine';
import { FORM_VARSAYILAN } from '@/types';
import type { FormDurumu, HesaplamaSonucu } from '@/types';
import type { User } from '@supabase/supabase-js';

// ─── localStorage yardımcıları ─────────────────────────────────────────────

const LS_KEY = 'rm_form_v1';
const LS_TTL = 30 * 24 * 60 * 60 * 1000; // 30 gün

function lsKaydet(form: FormDurumu) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ form, ts: Date.now() }));
  } catch { /* ignore */ }
}

function lsYukle(): FormDurumu | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const { form, ts } = JSON.parse(raw);
    if (Date.now() - ts > LS_TTL) { localStorage.removeItem(LS_KEY); return null; }
    const f = form as FormDurumu;
    // Personel migrasyonu: eski `ad` alanı → yeni `unvan`; yolYemek'i düşür
    // Herhangi bir personelde unvan yoksa (eski format) varsayılan listeyi kullan
    const personellerGecerli = f.opex?.personeller?.every(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => typeof p.unvan === 'string' && p.unvan.length > 0,
    );
    if (!personellerGecerli) {
      f.opex = { ...f.opex, personeller: FORM_VARSAYILAN.opex.personeller };
    }
    // Yeni alan: yemekBedeli yoksa 0 ile başlat
    if (f.opex && typeof f.opex.yemekBedeli !== 'number') {
      f.opex = { ...f.opex, yemekBedeli: 0 };
    }
    return f;
  } catch { return null; }
}

// ─── Hesaplama yardımcısı ──────────────────────────────────────────────────

function hesapla(form: FormDurumu): HesaplamaSonucu {
  const capex = capexHesapla(form.capex);
  const ciro = ciroHesapla(form.ciro);
  const { netSatis, tahsilEdilenKdv } = netSatisHesapla(
    ciro.aylikBrutCiro,
    form.pl.kdvDusukPay,
  );
  const opex = opexHesapla(form.opex, ciro, netSatis);
  const pl = plHesapla(form.pl, ciro, opex, netSatis, tahsilEdilenKdv, form.opex.kira, form.capex.kiraSozlesmeTipi);
  const roi = roiHesapla(capex, opex, pl, form.ciro);
  return { capex, ciro, opex, pl, roi };
}

// ─── Ana Sayfa ─────────────────────────────────────────────────────────────

type KaydetDurum = 'bos' | 'yukleniyor' | 'basarili' | 'hata';

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormDurumu>(FORM_VARSAYILAN);
  const [hazir, setHazir] = useState(false);
  const [kaydetDurum, setKaydetDurum] = useState<KaydetDurum>('bos');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Hesaplama (memoized)
  const sonuc = useMemo<HesaplamaSonucu>(() => hesapla(form), [form]);

  // Auth + veri yükleme
  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();

      if (!u) {
        // Middleware yönlendirmeli ama fallback
        router.push('/giris');
        return;
      }

      setUser(u);

      // URL ?saved=true varsa localStorage → DB'ye aktar
      const urlParams = new URLSearchParams(window.location.search);
      const savedFromCallback = urlParams.get('saved') === 'true';

      // DB'deki en son hesaplamayı yükle
      const { data: dbRow } = await supabase
        .from('hesaplamalar')
        .select('girdi')
        .eq('user_id', u.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const lsVerisi = lsYukle();

      if (savedFromCallback && lsVerisi) {
        // Magic link sonrası: localStorage verisini kaydet
        setForm(lsVerisi);
        localStorage.removeItem(LS_KEY);
        router.replace('/');
      } else if (dbRow?.girdi) {
        setForm(dbRow.girdi as FormDurumu);
      } else if (lsVerisi) {
        setForm(lsVerisi);
      }

      setHazir(true);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) router.push('/giris');
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Form değişikliği
  const handleChange = useCallback((updates: Partial<FormDurumu>) => {
    setForm(prev => {
      const next = { ...prev, ...updates };
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => lsKaydet(next), 500);
      return next;
    });
  }, []);

  // Kaydet → Supabase
  async function handleKaydet() {
    if (!user) return;
    setKaydetDurum('yukleniyor');
    try {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from('hesaplamalar')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const payload = {
        isletme_adi: form.isletmeAdi || null,
        girdi: form as unknown as Record<string, unknown>,
        sonuc: sonuc as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      };

      if (existing?.id) {
        await supabase.from('hesaplamalar').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('hesaplamalar').insert({ user_id: user.id, ...payload });
      }

      setKaydetDurum('basarili');
    } catch {
      setKaydetDurum('hata');
    } finally {
      setTimeout(() => setKaydetDurum('bos'), 2500);
    }
  }

  async function handleCikis() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/giris');
  }

  if (!hazir) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userEmail={user?.email}
        kaydetDurum={kaydetDurum}
        onKaydet={handleKaydet}
        onCikis={handleCikis}
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* İşletme Adı */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="İşletme Adı (isteğe bağlı)"
            value={form.isletmeAdi}
            onChange={e => handleChange({ isletmeAdi: e.target.value })}
            className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/30 focus:border-[#7B3F8E]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Sol: 5 Modül */}
          <div className="flex flex-col gap-4">
            <Modul1Capex
              girdi={form.capex}
              onChange={capex => handleChange({ capex })}
            />
            <Modul2Ciro
              girdi={form.ciro}
              onChange={ciro => handleChange({ ciro })}
            />
            <Modul3Opex
              girdi={form.opex}
              ciro={sonuc.ciro}
              onChange={opex => handleChange({ opex })}
            />
            <Modul4PL
              girdi={form.pl}
              ciro={sonuc.ciro}
              opex={sonuc.opex}
              netKira={form.opex.kira}
              kiraSozlesmeTipi={form.capex.kiraSozlesmeTipi}
              onChange={pl => handleChange({ pl })}
            />
            <Modul5Roi sonuc={sonuc} />
          </div>

          {/* Sağ: Sticky Sonuç Paneli */}
          <div className="lg:sticky lg:top-4">
            <SonucPaneli sonuc={sonuc} />
          </div>
        </div>

        {/* Alt bölüm */}
        <div className="mt-8 flex flex-col gap-6">
          <SenaryoTablosu sonuc={sonuc} />
          <RoiGrafik sonuc={sonuc} />
          <IndirButonlari form={form} sonuc={sonuc} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
