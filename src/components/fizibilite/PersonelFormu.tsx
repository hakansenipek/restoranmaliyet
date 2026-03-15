'use client';
import { useState } from 'react';
import type { PersonelGirdisi, PersonelKalem, PersonelGruplar } from '@/types/fizibilite';

interface Props {
  girdi: PersonelGirdisi;
  onChange: (g: PersonelGirdisi) => void;
}

type GrupKey = keyof PersonelGruplar;

const POZISYONLAR: Record<GrupKey, string[]> = {
  yonetim: [
    'İşletme Sahibi',
    'Genel Müdür',
    'İşletme Müdürü',
    'Müdür Yardımcısı',
    'Muhasebeci',
    'Mali Müşavir',
    'Pazarlama Uzmanı',
    'Satın Alma',
  ],
  mutfak: [
    'Aşçıbaşı (Head Chef)',
    'Sous Chef',
    'Kısım Şefi',
    'Aşçı',
    'Aşçı Yardımcısı',
    'Hazırlık Elemanı',
    'Pastacı',
    'Bulaşıkçı (Steward)',
  ],
  salon: [
    'Restoran Müdürü',
    'Kıdemli Garson (Chef de Rang)',
    'Garson',
    'Komi',
    'Hostes / Karşılama',
    'Barista',
    'Barmen',
    'Kasiyer',
  ],
  destek: [
    'Temizlik Görevlisi',
    'Güvenlik Görevlisi',
    'Vale',
    'Kurye',
    'Teknik Servis',
    'Depo / Stok Görevlisi',
  ],
};

const SEKMELER: { key: GrupKey; label: string }[] = [
  { key: 'yonetim', label: 'Yönetim' },
  { key: 'mutfak', label: 'Mutfak' },
  { key: 'salon', label: 'Salon' },
  { key: 'destek', label: 'Destek' },
];

function para(v: number) {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}

function kalemToplam(k: PersonelKalem) {
  return (k.netMaas * 1.575 + k.yolYemek + k.prim) * k.adet;
}

function grupToplam(kalemler: PersonelKalem[]) {
  return kalemler.reduce((t, k) => t + kalemToplam(k), 0);
}

function SmallNumInput({ value, onChange }: {
  value: number; onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none focus:ring-1 focus:ring-[#7B3F8E]/20 text-right"
    />
  );
}

export default function PersonelFormu({ girdi, onChange }: Props) {
  const [aktifSekme, setAktifSekme] = useState<GrupKey>('yonetim');

  function updateGrup(key: GrupKey, kalemler: PersonelKalem[]) {
    onChange({ ...girdi, gruplar: { ...girdi.gruplar, [key]: kalemler } });
  }

  function updateKalem(idx: number, patch: Partial<PersonelKalem>) {
    const kalemler = [...girdi.gruplar[aktifSekme]];
    const updated = { ...kalemler[idx], ...patch };
    // Net maaş değişince işveren maliyetini otomatik güncelle
    if ('netMaas' in patch) {
      updated.isverenMaliyet = updated.netMaas * 1.575;
    }
    kalemler[idx] = updated;
    updateGrup(aktifSekme, kalemler);
  }

  function ekleKalem(key: GrupKey) {
    const yeni: PersonelKalem = {
      pozisyon: POZISYONLAR[key][0],
      adet: 1,
      netMaas: 12_000,
      isverenMaliyet: 12_000 * 1.575,
      yolYemek: 1_500,
      prim: 0,
    };
    updateGrup(key, [...girdi.gruplar[key], yeni]);
  }

  function silKalem(idx: number) {
    updateGrup(aktifSekme, girdi.gruplar[aktifSekme].filter((_, i) => i !== idx));
  }

  const genelToplam =
    Object.values(girdi.gruplar).flat().reduce((t, k) => t + kalemToplam(k), 0) +
    girdi.personelKiyafetMaliyeti;

  const kalemler = girdi.gruplar[aktifSekme];
  const sekmeToplamı = grupToplam(kalemler);

  return (
    <div className="flex flex-col gap-4">
      {/* Sekme nav */}
      <div className="flex gap-1 border-b border-gray-200">
        {SEKMELER.map(({ key, label }) => {
          const aktif = aktifSekme === key;
          const gt = grupToplam(girdi.gruplar[key]);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setAktifSekme(key)}
              className={`flex flex-col items-center px-4 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                aktif
                  ? 'border-[#7B3F8E] text-[#7B3F8E]'
                  : 'border-transparent text-gray-500 hover:text-[#7B3F8E]'
              }`}
            >
              <span>{label}</span>
              <span className={`font-mono text-[10px] ${aktif ? 'text-[#7B3F8E]' : 'text-gray-400'}`}>
                {para(gt)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#EFE6F4]/60">
              <th className="px-2 py-2 text-left text-gray-600 font-semibold">Pozisyon</th>
              <th className="px-2 py-2 text-center text-gray-600 font-semibold w-12">Adet</th>
              <th className="px-2 py-2 text-right text-gray-600 font-semibold w-28">Net Maaş</th>
              <th className="px-2 py-2 text-right text-gray-500 font-medium w-32">İşveren Maliyeti</th>
              <th className="px-2 py-2 text-right text-gray-600 font-semibold w-28">Yol + Yemek</th>
              <th className="px-2 py-2 text-right text-gray-600 font-semibold w-24">Prim</th>
              <th className="px-2 py-2 text-right text-gray-600 font-semibold w-28">Kişi Toplam</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {kalemler.map((k, idx) => (
              <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                {/* Pozisyon — dropdown */}
                <td className="px-2 py-1.5">
                  <select
                    value={k.pozisyon}
                    onChange={e => updateKalem(idx, { pozisyon: e.target.value })}
                    className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 focus:border-[#7B3F8E] focus:outline-none focus:ring-1 focus:ring-[#7B3F8E]/20"
                  >
                    {POZISYONLAR[aktifSekme].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    {!POZISYONLAR[aktifSekme].includes(k.pozisyon) && (
                      <option value={k.pozisyon}>{k.pozisyon}</option>
                    )}
                  </select>
                </td>
                {/* Adet */}
                <td className="px-2 py-1.5">
                  <SmallNumInput
                    value={k.adet}
                    onChange={v => updateKalem(idx, { adet: Math.max(1, Math.round(v)) })}
                  />
                </td>
                {/* Net Maaş */}
                <td className="px-2 py-1.5">
                  <SmallNumInput
                    value={k.netMaas}
                    onChange={v => updateKalem(idx, { netMaas: v })}
                  />
                </td>
                {/* İşveren Maliyeti — otomatik, readonly */}
                <td className="px-2 py-1.5">
                  <div className="rounded border border-gray-100 bg-gray-50 px-2 py-1 text-right font-mono text-gray-400">
                    {para(k.netMaas * 1.575)}
                  </div>
                </td>
                {/* Yol + Yemek */}
                <td className="px-2 py-1.5">
                  <SmallNumInput
                    value={k.yolYemek}
                    onChange={v => updateKalem(idx, { yolYemek: v })}
                  />
                </td>
                {/* Prim */}
                <td className="px-2 py-1.5">
                  <SmallNumInput
                    value={k.prim}
                    onChange={v => updateKalem(idx, { prim: v })}
                  />
                </td>
                {/* Kişi Toplam */}
                <td className="px-2 py-1.5 text-right font-mono font-semibold text-[#5A2D6E]">
                  {para(kalemToplam(k))}
                </td>
                {/* Sil */}
                <td className="px-1 py-1.5">
                  <button
                    type="button"
                    onClick={() => silKalem(idx)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
                    title="Sil"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#7B3F8E]/20 bg-[#EFE6F4]/40">
              <td colSpan={6} className="px-2 py-2 text-xs font-semibold text-[#5A2D6E]">
                {SEKMELER.find(s => s.key === aktifSekme)?.label} Toplamı
              </td>
              <td className="px-2 py-2 text-right font-mono font-bold text-[#7B3F8E]">
                {para(sekmeToplamı)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Ekle butonu */}
      <button
        type="button"
        onClick={() => ekleKalem(aktifSekme)}
        className="self-start flex items-center gap-2 rounded-lg border-2 border-dashed border-[#7B3F8E]/30 px-4 py-2 text-sm text-[#7B3F8E] font-medium hover:border-[#7B3F8E] hover:bg-[#EFE6F4]/40 transition-colors"
      >
        <span className="text-lg leading-none">+</span>
        Personel Ekle
      </button>

      {/* Kıyafet maliyeti */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
        <label className="text-sm text-gray-600">Personel Kıyafet Maliyeti (aylık)</label>
        <div className="relative w-40">
          <input
            type="number"
            min={0}
            value={girdi.personelKiyafetMaliyeti}
            onChange={e => onChange({ ...girdi, personelKiyafetMaliyeti: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-7 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₺</span>
        </div>
      </div>

      {/* Genel toplam */}
      <div className="rounded-xl border-2 border-[#7B3F8E] bg-[#EFE6F4]/40 px-4 py-3 flex justify-between items-center">
        <span className="text-sm font-bold text-[#5A2D6E]">Toplam Personel Maliyeti</span>
        <span className="text-lg font-bold font-mono text-[#7B3F8E]">{para(genelToplam)}</span>
      </div>
    </div>
  );
}
