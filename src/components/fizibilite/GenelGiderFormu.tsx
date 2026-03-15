'use client';
import type { GenelGiderGirdisi } from '@/types/fizibilite';

interface Props {
  girdi: GenelGiderGirdisi;
  onChange: (g: GenelGiderGirdisi) => void;
}

function para(v: number) {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}

function NumInput({ label, value, onChange, hint, readonly = false }: {
  label: string; value: number; onChange?: (v: number) => void; hint?: string; readonly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type="number" min={0} value={value} readOnly={readonly}
          onChange={e => onChange?.(parseFloat(e.target.value) || 0)}
          className={`w-full rounded-lg border px-3 py-2 pr-7 text-right text-sm font-mono shadow-sm focus:outline-none ${
            readonly
              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-default'
              : 'border-gray-200 bg-white text-gray-800 focus:border-[#7B3F8E] focus:ring-2 focus:ring-[#7B3F8E]/20'
          }`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₺</span>
      </div>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}

function Grup({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-2 bg-[#EFE6F4]/60">
        <p className="text-xs font-bold text-[#5A2D6E] uppercase tracking-wide">{baslik}</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 bg-white">{children}</div>
    </div>
  );
}

export default function GenelGiderFormu({ girdi, onChange }: Props) {
  function set<K extends keyof GenelGiderGirdisi>(key: K, val: GenelGiderGirdisi[K]) {
    onChange({ ...girdi, [key]: val });
  }

  const kiraBrut = girdi.kiraVergiTipi === 'yok'
    ? girdi.netKira
    : girdi.netKira * (1 + girdi.kiraVergiOrani);
  const enerjiler = girdi.elektrik + girdi.su + girdi.dogalgazLpg;
  const iletisim = girdi.internet + girdi.telefon + girdi.posMalzeme;
  const bakim = girdi.bakimOnarim + girdi.klimaBakim + girdi.hasereIlaclama + girdi.aidat;
  const toplam = kiraBrut + enerjiler + iletisim + bakim;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex-1 flex flex-col gap-4">
        {/* Kira */}
        <Grup baslik="Kira">
          <NumInput label="Net Kira" value={girdi.netKira} onChange={v => set('netKira', v)} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Vergi Tipi</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              {([
                { val: 'kdv', label: 'KDV %20' },
                { val: 'stopaj', label: 'Stopaj %20' },
                { val: 'yok', label: 'Vergi Yok' },
              ] as const).map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('kiraVergiTipi', val)}
                  className={`flex-1 py-2 px-1 text-center transition-colors ${
                    girdi.kiraVergiTipi === val
                      ? 'bg-[#7B3F8E] text-white'
                      : 'bg-white text-gray-600 hover:bg-[#EFE6F4]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <NumInput
              label="Brüt Kira (Otomatik)"
              value={kiraBrut}
              readonly
              hint={
                girdi.kiraVergiTipi === 'kdv'
                  ? "KDV'li kiralarda %20 KDV eklenir."
                  : girdi.kiraVergiTipi === 'stopaj'
                  ? 'Stopajlı kiralarda %20 stopaj eklenir.'
                  : 'Vergi eklenmez.'
              }
            />
          </div>
        </Grup>

        {/* Enerji */}
        <Grup baslik="Enerji">
          <NumInput label="Elektrik" value={girdi.elektrik} onChange={v => set('elektrik', v)} />
          <NumInput label="Su" value={girdi.su} onChange={v => set('su', v)} />
          <NumInput label="Doğalgaz / LPG" value={girdi.dogalgazLpg} onChange={v => set('dogalgazLpg', v)} />
        </Grup>

        {/* İletişim */}
        <Grup baslik="İletişim & Ofis">
          <NumInput label="İnternet" value={girdi.internet} onChange={v => set('internet', v)} />
          <NumInput label="Telefon" value={girdi.telefon} onChange={v => set('telefon', v)} />
          <NumInput label="POS Malzeme (Rulo vb.)" value={girdi.posMalzeme} onChange={v => set('posMalzeme', v)} />
        </Grup>

        {/* Bakım */}
        <Grup baslik="Bakım & Diğer">
          <NumInput label="Bakım / Onarım" value={girdi.bakimOnarim} onChange={v => set('bakimOnarim', v)} />
          <NumInput label="Klima Bakım" value={girdi.klimaBakim} onChange={v => set('klimaBakim', v)} />
          <NumInput label="Haşere İlaçlama" value={girdi.hasereIlaclama} onChange={v => set('hasereIlaclama', v)} />
          <NumInput label="Aidat (AVM / Site)" value={girdi.aidat} onChange={v => set('aidat', v)} />
        </Grup>
      </div>

      {/* Canlı toplam kartı */}
      <div className="lg:w-52 lg:sticky lg:top-4">
        <div className="rounded-xl border-2 border-[#7B3F8E] bg-white overflow-hidden shadow-md">
          <div className="px-4 py-3 bg-[#5A2D6E]">
            <p className="text-xs font-semibold text-white uppercase tracking-wide">Aylık Genel Gider</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {[
              { label: 'Kira (Brüt)', val: kiraBrut },
              { label: 'Enerji', val: enerjiler },
              { label: 'İletişim & Ofis', val: iletisim },
              { label: 'Bakım & Diğer', val: bakim },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-500">{label}</span>
                <span className="font-mono text-gray-700">{para(val)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between">
              <span className="text-sm font-bold text-[#5A2D6E]">TOPLAM</span>
              <span className="text-sm font-bold font-mono text-[#7B3F8E]">{para(toplam)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
