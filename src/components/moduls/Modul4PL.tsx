'use client';

import { useCallback, useState } from 'react';
import Card from '@/components/ui/Card';
import SliderInput from '@/components/ui/SliderInput';
import SonucSatiri from '@/components/ui/SonucSatiri';
import { netSatisHesapla, plHesapla } from '@/lib/hesaplama/plEngine';
import type { CiroSonucu, OpexSonucu, PlGirdisi } from '@/types';

interface Props {
  girdi: PlGirdisi;
  ciro: CiroSonucu;
  opex: OpexSonucu;
  netKira: number;
  onChange: (v: PlGirdisi) => void;
}

export default function Modul4PL({ girdi, ciro, opex, netKira, onChange }: Props) {
  const [acik, setAcik] = useState(true);

  const { netSatis, tahsilEdilenKdv } = netSatisHesapla(
    ciro.aylikBrutCiro,
    girdi.kdvDusukPay,
  );
  const pl = plHesapla(girdi, ciro, opex, netSatis, tahsilEdilenKdv, netKira);

  const set = useCallback(
    <K extends keyof PlGirdisi>(k: K, v: PlGirdisi[K]) => {
      onChange({ ...girdi, [k]: v });
    },
    [girdi, onChange],
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
        style={{ backgroundColor: '#5A2D6E' }}
      >
        <div>
          <span className="text-sm font-bold text-white">
            Modül 4 — Vergilendirme ve Net Kâr (P&amp;L)
          </span>
          <span className={`ml-3 text-xs ${pl.netAylikKar >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            Net Kâr: {Math.round(pl.netAylikKar).toLocaleString('tr-TR')} ₺
          </span>
        </div>
        <span className="text-white text-sm">{acik ? '▲' : '▼'}</span>
      </button>

      {acik && (
        <div className="p-5 flex flex-col gap-5">
          {/* KDV Ayarları */}
          <Card title="KDV Dağılımı">
            <SliderInput
              label="%10 KDV'li Ürünlerin Ciro Payı"
              min={0}
              max={100}
              step={5}
              value={Math.round(girdi.kdvDusukPay * 100)}
              onChange={v => set('kdvDusukPay', v / 100)}
              suffix="%"
            />
            <p className="text-xs text-gray-400">
              %20 KDV'li ürün payı: %{Math.round((1 - girdi.kdvDusukPay) * 100)}
            </p>

            <div className="mt-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Hammadde KDV Oranı
              </label>
              <div className="flex gap-3 mt-1.5">
                {([0.01, 0.10] as const).map(oran => (
                  <button
                    key={oran}
                    onClick={() => set('hammaddeKdvOrani', oran)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                      girdi.hammaddeKdvOrani === oran
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                    }`}
                    style={girdi.hammaddeKdvOrani === oran ? { backgroundColor: '#7B3F8E' } : {}}
                  >
                    %{oran * 100}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Kira Stopajı */}
          <Card title="Kira Stopajı">
            <SliderInput
              label="Stopaj Oranı"
              min={0}
              max={30}
              step={5}
              value={Math.round(girdi.kiraStopajOrani * 100)}
              onChange={v => set('kiraStopajOrani', v / 100)}
              suffix="%"
            />
            <p className="text-xs text-gray-400">
              Kira stopajı: {Math.round(pl.kiraStopaj).toLocaleString('tr-TR')} ₺ / ay
            </p>
          </Card>

          {/* Vergi Türü */}
          <Card title="Vergi Türü">
            <div className="flex gap-3">
              {(['gelir', 'kurumlar'] as const).map(tur => (
                <button
                  key={tur}
                  onClick={() => set('vergiTuru', tur)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    girdi.vergiTuru === tur
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                  }`}
                  style={girdi.vergiTuru === tur ? { backgroundColor: '#7B3F8E' } : {}}
                >
                  {tur === 'gelir' ? 'Gelir Vergisi (Şahıs)' : 'Kurumlar Vergisi (%25)'}
                </button>
              ))}
            </div>
          </Card>

          {/* KDV Özeti */}
          <Card title="KDV Özeti">
            <SonucSatiri label="Net Satış (KDV Hariç)" value={pl.netSatis} />
            <SonucSatiri label="Tahsil Edilen KDV" value={pl.tahsilEdilenKdv} />
            <SonucSatiri label="Ödenen KDV (Hammadde)" value={pl.odenenKdv} />
            <SonucSatiri label="Ödenecek KDV" value={pl.odenmesiGerekenKdv} bold highlight="purple" />
          </Card>

          {/* P&L Özeti */}
          <div className="rounded-xl border border-purple-200 p-4 flex flex-col gap-1" style={{ backgroundColor: '#EFE6F4' }}>
            <SonucSatiri label="Net Satış" value={pl.netSatis} />
            <SonucSatiri label="Toplam OPEX" value={opex.toplamOpex} />
            <SonucSatiri label="Kira Stopajı" value={pl.kiraStopaj} />
            <SonucSatiri label="Brüt Kâr" value={pl.brutKar} bold />
            <SonucSatiri label="Tahmini Vergi" value={pl.tahminiVergi} />
            <div className="border-t border-purple-200 mt-1 pt-1">
              <SonucSatiri
                label="NET AYLIK KÂR"
                value={pl.netAylikKar}
                bold
                highlight={pl.netAylikKar >= 0 ? 'green' : 'red'}
              />
              <SonucSatiri label="Net Kâr Marjı" value={pl.netKarMarji} isPercent bold />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
