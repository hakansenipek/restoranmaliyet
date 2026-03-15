'use client';
import { useState } from 'react';
import type { CapexGirdisi, CapexMimari, CapexMutfak, CapexDekorasyon, CapexTeknoloji, CapexResmi } from '@/types/fizibilite';
import { capexHesapla } from '@/lib/hesaplama/fizibiliteEngine';

interface Props {
  girdi: CapexGirdisi;
  onChange: (g: CapexGirdisi) => void;
}

function para(v: number) {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}

function NumInput({ label, value, onChange, readonly = false }: {
  label: string; value: number; onChange?: (v: number) => void; readonly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type="number" min={0} value={value} readOnly={readonly}
          onChange={e => onChange?.(parseFloat(e.target.value) || 0)}
          className={`w-full rounded-lg border px-3 py-2 pr-8 text-right text-sm font-mono shadow-sm focus:outline-none ${
            readonly
              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-default'
              : 'border-gray-200 bg-white text-gray-800 focus:border-[#7B3F8E] focus:ring-2 focus:ring-[#7B3F8E]/20'
          }`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">₺</span>
      </div>
    </div>
  );
}

type SectionKey = 'mimari' | 'mutfak' | 'dekorasyon' | 'teknoloji' | 'resmi';

const MIMARI_LABELS: Record<keyof CapexMimari, string> = {
  konseptTasarim: 'Konsept Tasarım',
  belediyeRuhsatProjesi: 'Belediye Ruhsat Projesi',
  dogalgazElektrikProjesi: 'Doğalgaz / Elektrik Projesi',
  diger: 'Diğer',
};

const MUTFAK_LABELS: Record<keyof CapexMutfak, string> = {
  tezgahEvyeRaf: 'Tezgah / Evye / Raf',
  davlumbaz: 'Davlumbaz',
  firin: 'Fırın',
  ocaklar: 'Ocaklar',
  fritoz: 'Fritöz',
  bulasikmakine: 'Bulaşık Makinesi',
  buzMakine: 'Buz Makinesi',
  dikBuzdolabi: 'Dik Buzdolabı',
  tezgahAltiDolap: 'Tezgah Altı Dolap',
  derinDondurucular: 'Derin Dondurucular',
  sogukHavaDeposu: 'Soğuk Hava Deposu',
  mikserBlender: 'Mikser / Blender',
  teraziVakum: 'Terazi / Vakum',
  dilimlemeMakine: 'Dilimleme Makinesi',
  porselen: 'Porselen',
  camEsyasi: 'Cam Eşyası',
  catalkasik: 'Çatal / Kaşık / Bıçak',
  diger: 'Diğer',
};

const DEKORASYON_LABELS: Record<keyof CapexDekorasyon, string> = {
  masaSandalye: 'Masa & Sandalye',
  elektrikAydinlatma: 'Elektrik & Aydınlatma',
  boyaIsleri: 'Boya İşleri',
  wc: 'WC',
  isiticilar: 'Isıtıcılar',
  pergoleSemsiye: 'Pergole & Şemsiye',
  acilisTemizligi: 'Açılış Temizliği',
  diger: 'Diğer',
};

const TEKNOLOJI_LABELS: Record<keyof CapexTeknoloji, string> = {
  posYazilim: 'POS Yazılımı',
  posTerminal: 'POS Terminali',
  adisyonYazici: 'Adisyon Yazıcı',
  kameraDvr: 'Kamera / DVR',
  alarmYangın: 'Alarm / Yangın',
  muzikSistemi: 'Müzik Sistemi',
  diger: 'Diğer',
};

const RESMI_LABELS: Partial<Record<keyof CapexResmi, string>> = {
  belediyeRuhsatHarci: 'Belediye Ruhsat Harcı',
  tapdkAlkolBedeli: 'TAPDK / Alkol Bedeli',
  emlakcıKomisyonu: 'Emlakçı Komisyonu',
  kiraDepozitosu: 'Kira Depozitosu',
  ilkStokMaliyeti: 'İlk Stok Maliyeti',
  diger: 'Diğer',
};

function AccordionSection({
  title, toplamLabel, ara, open, onToggle, children,
}: {
  title: string; toplamLabel: string; ara: number; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#EFE6F4]/60 hover:bg-[#EFE6F4] transition-colors"
      >
        <span className="text-sm font-semibold text-[#5A2D6E]">{title}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-semibold text-[#7B3F8E]">{toplamLabel}</span>
          <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>
      {open && <div className="p-4 grid grid-cols-2 gap-3 bg-white">{children}</div>}
    </div>
  );
}

export default function CapexFormu({ girdi, onChange }: Props) {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    mimari: true, mutfak: false, dekorasyon: false, teknoloji: false, resmi: false,
  });

  function toggle(k: SectionKey) {
    setOpen(p => ({ ...p, [k]: !p[k] }));
  }

  function setNested<K extends SectionKey>(section: K, field: string, val: number) {
    onChange({ ...girdi, [section]: { ...(girdi[section] as object), [field]: val } });
  }

  const det = capexHesapla(girdi);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Accordion alanı */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Mimari */}
        <AccordionSection title="Mimari & Proje" toplamLabel={para(det.mimari)} ara={det.mimari} open={open.mimari} onToggle={() => toggle('mimari')}>
          {(Object.keys(MIMARI_LABELS) as (keyof CapexMimari)[]).map(k => (
            <div key={k} className={k === 'diger' ? 'col-span-2' : ''}>
              <NumInput label={MIMARI_LABELS[k]} value={girdi.mimari[k]}
                onChange={v => setNested('mimari', k, v)} />
            </div>
          ))}
        </AccordionSection>

        {/* Mutfak */}
        <AccordionSection title="Mutfak Ekipmanları" toplamLabel={para(det.mutfak)} ara={det.mutfak} open={open.mutfak} onToggle={() => toggle('mutfak')}>
          {(Object.keys(MUTFAK_LABELS) as (keyof CapexMutfak)[]).map(k => (
            <div key={k} className={k === 'diger' ? 'col-span-2' : ''}>
              <NumInput label={MUTFAK_LABELS[k]} value={girdi.mutfak[k]}
                onChange={v => setNested('mutfak', k, v)} />
            </div>
          ))}
        </AccordionSection>

        {/* Dekorasyon */}
        <AccordionSection title="Dekorasyon & Mobilya" toplamLabel={para(det.dekorasyon)} ara={det.dekorasyon} open={open.dekorasyon} onToggle={() => toggle('dekorasyon')}>
          {(Object.keys(DEKORASYON_LABELS) as (keyof CapexDekorasyon)[]).map((k, i, arr) => (
            <div key={k} className={i === arr.length - 1 && arr.length % 2 !== 0 ? 'col-span-2' : ''}>
              <NumInput label={DEKORASYON_LABELS[k]} value={girdi.dekorasyon[k]}
                onChange={v => setNested('dekorasyon', k, v)} />
            </div>
          ))}
        </AccordionSection>

        {/* Teknoloji */}
        <AccordionSection title="Teknoloji & Güvenlik" toplamLabel={para(det.teknoloji)} ara={det.teknoloji} open={open.teknoloji} onToggle={() => toggle('teknoloji')}>
          {(Object.keys(TEKNOLOJI_LABELS) as (keyof CapexTeknoloji)[]).map(k => (
            <div key={k} className={k === 'diger' ? 'col-span-2' : ''}>
              <NumInput label={TEKNOLOJI_LABELS[k]} value={girdi.teknoloji[k]}
                onChange={v => setNested('teknoloji', k, v)} />
            </div>
          ))}
        </AccordionSection>

        {/* Resmi */}
        <AccordionSection title="Resmi & Diğer Giderler" toplamLabel={para(det.resmi)} ara={det.resmi} open={open.resmi} onToggle={() => toggle('resmi')}>
          {(Object.keys(RESMI_LABELS) as (keyof typeof RESMI_LABELS)[]).map(k => (
            <div key={k} className={k === 'diger' ? 'col-span-2' : ''}>
              <NumInput label={RESMI_LABELS[k]!} value={girdi.resmi[k]}
                onChange={v => setNested('resmi', k, v)} />
            </div>
          ))}
        </AccordionSection>
      </div>

      {/* Özet kart — sticky */}
      <div className="lg:w-56 lg:sticky lg:top-4">
        <div className="rounded-xl border-2 border-[#7B3F8E] bg-white overflow-hidden shadow-md">
          <div className="px-4 py-3 bg-[#5A2D6E]">
            <p className="text-xs font-semibold text-white uppercase tracking-wide">Toplam Yatırım</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {[
              { label: 'Mimari', val: det.mimari },
              { label: 'Mutfak', val: det.mutfak },
              { label: 'Dekorasyon', val: det.dekorasyon },
              { label: 'Teknoloji', val: det.teknoloji },
              { label: 'Resmi & Diğer', val: det.resmi },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-500">{label}</span>
                <span className="font-mono text-gray-700">{para(val)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between">
              <span className="text-sm font-bold text-[#5A2D6E]">TOPLAM</span>
              <span className="text-sm font-bold font-mono text-[#7B3F8E]">{para(det.toplam)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
