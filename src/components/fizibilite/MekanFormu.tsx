'use client';
import type { MekanGirdisi } from '@/types/fizibilite';

interface Props {
  isletmeAdi: string;
  onIsletmeAdiChange: (v: string) => void;
  girdi: MekanGirdisi;
  onChange: (g: MekanGirdisi) => void;
}

const GUNLER = [
  { key: 'pazartesi', label: 'Pzt' },
  { key: 'sali', label: 'Sal' },
  { key: 'carsamba', label: 'Çar' },
  { key: 'persembe', label: 'Per' },
  { key: 'cuma', label: 'Cum' },
  { key: 'cumartesi', label: 'Cmt' },
  { key: 'pazar', label: 'Paz' },
] as const;

function NumInput({ label, value, onChange, suffix = 'm²' }: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type="number" min={0} value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-right text-sm font-mono text-gray-800 shadow-sm focus:border-[#7B3F8E] focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/20"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{suffix}</span>
      </div>
    </div>
  );
}

export default function MekanFormu({ isletmeAdi, onIsletmeAdiChange, girdi, onChange }: Props) {
  function set<K extends keyof MekanGirdisi>(key: K, val: MekanGirdisi[K]) {
    onChange({ ...girdi, [key]: val });
  }

  function toggleGun(gun: keyof MekanGirdisi['calismaGunleri']) {
    onChange({
      ...girdi,
      calismaGunleri: { ...girdi.calismaGunleri, [gun]: !girdi.calismaGunleri[gun] },
    });
  }

  const acikGunSayisi = GUNLER.filter(g => girdi.calismaGunleri[g.key]).length;

  return (
    <div className="flex flex-col gap-6">
      {/* İşletme adı */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">İşletme Adı</label>
        <input
          type="text" value={isletmeAdi}
          onChange={e => onIsletmeAdiChange(e.target.value)}
          placeholder="Örnek Kafe"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-[#7B3F8E] focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/20"
        />
      </div>

      {/* m² bilgileri */}
      <div>
        <h3 className="text-sm font-semibold text-[#5A2D6E] mb-3">Alan Bilgileri</h3>
        <div className="grid grid-cols-3 gap-3">
          <NumInput label="Toplam Alan" value={girdi.toplamMetrekare} onChange={v => set('toplamMetrekare', v)} />
          <NumInput label="Mutfak Alanı" value={girdi.mutfakMetrekare} onChange={v => set('mutfakMetrekare', v)} />
          <NumInput label="Depo Alanı" value={girdi.depoMetrekare} onChange={v => set('depoMetrekare', v)} />
        </div>
      </div>

      {/* Masa / Sandalye */}
      <div>
        <h3 className="text-sm font-semibold text-[#5A2D6E] mb-3">Kapasite</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-100 bg-[#EFE6F4]/40 p-3 flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#7B3F8E] uppercase tracking-wide">Kapalı Alan</p>
            <NumInput label="Masa" value={girdi.kapaliMasa} onChange={v => set('kapaliMasa', v)} suffix="adet" />
            <NumInput label="Sandalye" value={girdi.kapaliSandalye} onChange={v => set('kapaliSandalye', v)} suffix="adet" />
          </div>
          <div className="rounded-lg border border-gray-100 bg-[#EFE6F4]/40 p-3 flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#7B3F8E] uppercase tracking-wide">Açık Alan</p>
            <NumInput label="Masa" value={girdi.acikMasa} onChange={v => set('acikMasa', v)} suffix="adet" />
            <NumInput label="Sandalye" value={girdi.acikSandalye} onChange={v => set('acikSandalye', v)} suffix="adet" />
          </div>
        </div>
      </div>

      {/* Çalışma günleri */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#5A2D6E]">Çalışma Günleri</h3>
          <span className="text-xs text-gray-500">Haftada {acikGunSayisi} gün açık</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {GUNLER.map(({ key, label }) => {
            const aktif = girdi.calismaGunleri[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleGun(key)}
                className={`w-12 h-12 rounded-lg text-sm font-semibold border-2 transition-all ${
                  aktif
                    ? 'bg-[#7B3F8E] border-[#7B3F8E] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-[#7B3F8E]/40'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
