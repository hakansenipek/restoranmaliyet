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
    // muhasebe → maliMusavir migrasyonu
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opexAny = f.opex as any;
    if (f.opex && typeof opexAny.maliMusavir !== 'number') {
      f.opex = { ...f.opex, maliMusavir: opexAny.muhasebe ?? 3000 };
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
  const opex = opexHesapla(form.opex, ciro, netSatis, form.capex.aylikKira, form.ciro.aylikCalismaGunu);
  const pl = plHesapla(form.pl, ciro, opex, netSatis, tahsilEdilenKdv, form.capex.aylikKira, form.capex.kiraSozlesmeTipi);
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
      const lsVerisi = lsYukle();

      if (u) {
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
      } else {
        // Giriş yapılmamış — localStorage'dan yükle
        if (lsVerisi) setForm(lsVerisi);
      }

      setHazir(true);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
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
      <Header />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="border-b border-purple-200 pb-8 mb-8">

          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-800 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            Türkiye 2026 vergi ve asgari ücret verileriyle güncellendi
          </div>

          <h1 className="text-xl font-medium text-gray-900 leading-snug mb-4 max-w-2xl">
            Hayalinizdeki restoran projesini somut verilere dayanan bir iş planına dönüştürün
          </h1>

          <p className="text-sm text-gray-500 leading-relaxed max-w-xl mb-5">
            Bu platform; Türkiye&apos;deki güncel vergi mevzuatı, yasal asgari ücret verileri ve sektörel
            standartları temel alarak geliştirilmiş kapsamlı bir finansal analiz aracıdır. Karmaşık
            Excel tablolarıyla uğraşmak yerine — yatırım maliyetinizi, aylık net kârınızı ve yatırımın
            geri dönüş süresini (ROI) dakikalar içinde, en güncel parametrelerle hesaplayın.
          </p>

          <div className="w-8 h-0.5 bg-purple-700 rounded mb-5" />

          <div className="grid grid-cols-3 gap-2.5 mb-5 max-w-xl">
            {[
              { label: 'Yatırım analizi', value: 'CAPEX + amortisman' },
              { label: 'Kârlılık hesabı', value: 'Aylık net kâr & marj' },
              { label: 'Geri dönüş süresi', value: 'Nakit & muhasebe ROI' },
            ].map((f) => (
              <div key={f.label} className="bg-gray-50 rounded-lg px-3 py-3">
                <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                <p className="text-xs font-medium text-gray-800">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="border border-gray-200 border-l-[3px] border-l-purple-700 rounded-r-lg px-4 py-3 max-w-xl">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-800">Verileriniz güvende.</span>{' '}
              E-posta adresinizle kayıt oluşturarak çalışmanızı istediğiniz zaman, istediğiniz cihazdan
              kaldığınız yerden devam ettirebilirsiniz. Farklı senaryolar için birden fazla fizibilite
              dosyası saklayabilirsiniz.
            </p>
          </div>

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
              aylikKira={form.capex.aylikKira}
              aylikCalismaGunu={form.ciro.aylikCalismaGunu}
              onChange={opex => handleChange({ opex })}
            />
            <Modul4PL
              girdi={form.pl}
              ciro={sonuc.ciro}
              opex={sonuc.opex}
              netKira={form.capex.aylikKira}
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
