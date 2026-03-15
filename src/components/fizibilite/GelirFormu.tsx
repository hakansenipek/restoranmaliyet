'use client';
import type { GelirGirdisi, OgunProjeksiyon } from '@/types/fizibilite';

interface Props {
  girdi: GelirGirdisi;
  onChange: (g: GelirGirdisi) => void;
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

type GunKey = keyof GelirGirdisi['dolulukCarpanlari'];

function para(v: number) {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}

function OgunKarti({
  baslik, renk, ogun, onChange,
}: {
  baslik: string; renk: string; ogun: OgunProjeksiyon; onChange: (o: OgunProjeksiyon) => void;
}) {
  const gunlukCiro = ogun.aktif ? ogun.kisiBasiHarcama * ogun.gunlukKisiSayisi : 0;
  return (
    <div className={`rounded-xl border-2 overflow-hidden ${ogun.aktif ? 'border-[#7B3F8E]/30' : 'border-gray-200 opacity-60'}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${renk}`}>
        <span className="text-sm font-bold text-white">{baslik}</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-white/80">{ogun.aktif ? 'Aktif' : 'Kapalı'}</span>
          <div
            onClick={() => onChange({ ...ogun, aktif: !ogun.aktif })}
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${ogun.aktif ? 'bg-white/30' : 'bg-black/20'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${ogun.aktif ? 'left-5' : 'left-0.5'}`} />
          </div>
        </label>
      </div>
      <div className="p-3 bg-white flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Kişi Başı Harcama</label>
          <div className="relative">
            <input type="number" min={0} disabled={!ogun.aktif} value={ogun.kisiBasiHarcama}
              onChange={e => onChange({ ...ogun, kisiBasiHarcama: parseFloat(e.target.value) || 0 })}
              className="w-full rounded border border-gray-200 px-2 py-1.5 pr-7 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₺</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Günlük Kişi Sayısı</label>
          <div className="relative">
            <input type="number" min={0} disabled={!ogun.aktif} value={ogun.gunlukKisiSayisi}
              onChange={e => onChange({ ...ogun, gunlukKisiSayisi: parseFloat(e.target.value) || 0 })}
              className="w-full rounded border border-gray-200 px-2 py-1.5 pr-8 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">kişi</span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between text-xs">
          <span className="text-gray-500">Günlük tahmini ciro</span>
          <span className="font-mono font-semibold text-[#5A2D6E]">{para(gunlukCiro)}</span>
        </div>
      </div>
    </div>
  );
}

export default function GelirFormu({ girdi, onChange }: Props) {
  const { odemeTipleri: op } = girdi;
  const toplamPay = op.nakitPay + op.krediKartiPay + op.yemekKartiPay + op.onlinePlatformPay;
  const payUyari = Math.abs(toplamPay - 1) > 0.001;

  function setOgun(key: 'sabah' | 'ogle' | 'aksam', ogun: OgunProjeksiyon) {
    onChange({ ...girdi, [key]: ogun });
  }

  function setOdeme(field: keyof typeof op, pct: number) {
    onChange({ ...girdi, odemeTipleri: { ...op, [field]: pct / 100 } });
  }

  function setDoluluk(gun: GunKey, pct: number) {
    onChange({ ...girdi, dolulukCarpanlari: { ...girdi.dolulukCarpanlari, [gun]: pct / 100 } });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Öğün kartları */}
      <div>
        <h3 className="text-sm font-semibold text-[#5A2D6E] mb-3">Öğün Bazlı Projeksiyon</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <OgunKarti baslik="☀️ Sabah" renk="bg-amber-500" ogun={girdi.sabah} onChange={o => setOgun('sabah', o)} />
          <OgunKarti baslik="🌤 Öğle" renk="bg-[#7B3F8E]" ogun={girdi.ogle} onChange={o => setOgun('ogle', o)} />
          <OgunKarti baslik="🌙 Akşam" renk="bg-[#5A2D6E]" ogun={girdi.aksam} onChange={o => setOgun('aksam', o)} />
        </div>
      </div>

      {/* Ödeme tipleri */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#5A2D6E]">Ödeme Tipi Dağılımı</h3>
          <div className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${payUyari ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
            Toplam: %{(toplamPay * 100).toFixed(0)}{payUyari ? ' ⚠ %100 olmalı' : ' ✓'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'nakitPay', label: 'Nakit', komisyon: '0%', color: 'text-green-600' },
            { key: 'krediKartiPay', label: 'Kredi Kartı', komisyon: '%2 komisyon', color: 'text-blue-600' },
            { key: 'yemekKartiPay', label: 'Yemek Kartı', komisyon: '%10 komisyon', color: 'text-orange-600' },
            { key: 'onlinePlatformPay', label: 'Online Platform', komisyon: '%20 komisyon', color: 'text-red-600' },
          ] as const).map(({ key, label, komisyon, color }) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">{label}</label>
                <span className={`text-[10px] font-semibold ${color}`}>{komisyon}</span>
              </div>
              <div className="relative">
                <input type="number" min={0} max={100} step={1}
                  value={+(op[key] * 100).toFixed(1)}
                  onChange={e => setOdeme(key, parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-gray-200 px-2 py-1.5 pr-7 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doluluk çarpanları */}
      <div>
        <h3 className="text-sm font-semibold text-[#5A2D6E] mb-3">Günlük Doluluk Oranları</h3>
        <div className="flex flex-col gap-2">
          {GUNLER.map(({ key, label }) => {
            const pct = Math.round(girdi.dolulukCarpanlari[key] * 100);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-8 text-xs font-semibold text-gray-500">{label}</span>
                <input
                  type="range" min={0} max={100} step={5} value={pct}
                  onChange={e => setDoluluk(key, parseInt(e.target.value))}
                  className="flex-1 h-2 accent-[#7B3F8E] cursor-pointer"
                />
                <div className="relative w-16">
                  <input type="number" min={0} max={100} value={pct}
                    onChange={e => setDoluluk(key, parseInt(e.target.value) || 0)}
                    className="w-full rounded border border-gray-200 px-2 py-1 pr-5 text-right text-xs font-mono focus:border-[#7B3F8E] focus:outline-none"
                  />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
