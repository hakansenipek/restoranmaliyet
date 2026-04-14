'use client';

import { useCallback, useState } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import SliderInput from '@/components/ui/SliderInput';
import SonucSatiri from '@/components/ui/SonucSatiri';
import UyariKutusu from '@/components/ui/UyariKutusu';
import type { CiroSonucu, OpexGirdisi, Personel } from '@/types';

interface Props {
  girdi: OpexGirdisi;
  ciro: CiroSonucu;
  onChange: (v: OpexGirdisi) => void;
}

export default function Modul3Opex({ girdi, ciro, onChange }: Props) {
  const [acik, setAcik] = useState(true);

  const set = useCallback(
    <K extends keyof OpexGirdisi>(k: K, v: OpexGirdisi[K]) => {
      onChange({ ...girdi, [k]: v });
    },
    [girdi, onChange],
  );

  function personelGuncelle(i: number, k: keyof Personel, v: string | number) {
    const yeni = girdi.personeller.map((p, idx) =>
      idx === i ? { ...p, [k]: v } : p,
    );
    set('personeller', yeni);
  }

  function personelEkle() {
    set('personeller', [
      ...girdi.personeller,
      { unvan: 'Yeni Personel', adet: 1, netMaas: 18000 },
    ]);
  }

  function personelSil(i: number) {
    set('personeller', girdi.personeller.filter((_, idx) => idx !== i));
  }

  const personelMaliyeti = girdi.personeller.reduce(
    (acc, p) => acc + p.netMaas * 1.575 * (p.adet || 1),
    0,
  );

  const toplamOdemePayi =
    girdi.nakitPay + girdi.kkPay + girdi.yemekKartiPay + girdi.onlinePay;

  const gidaOranYuksek = girdi.gidaMaliyetOrani > 0.35;
  const toplamPayHatali = Math.abs(toplamOdemePayi - 100) > 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
        style={{ backgroundColor: '#5A2D6E' }}
      >
        <div>
          <span className="text-sm font-bold text-white">
            Modül 3 — Operasyonel Giderler (OPEX)
          </span>
          <span className="ml-3 text-xs text-purple-200">
            Personel: {Math.round(personelMaliyeti).toLocaleString('tr-TR')} ₺
          </span>
        </div>
        <span className="text-white text-sm">{acik ? '▲' : '▼'}</span>
      </button>

      {acik && (
        <div className="p-5 flex flex-col gap-5">

          {/* Personel Giderleri — Gıda Maliyeti'nin ÜSTÜNDE */}
          <Card title="Personel Giderleri">
            <div className="flex flex-col gap-1">
              {girdi.personeller.map((p, i) => (
                <div key={i}>
                  {/* Grup başlığı */}
                  {p.grup && (
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1 first:mt-0">
                      {p.grup}
                    </p>
                  )}
                  {/* Personel satırı */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {/* Sabit unvan */}
                      <span className="flex-1 text-sm font-medium text-gray-700 min-w-0 truncate">{p.unvan}</span>
                      {/* Adet */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">Adet:</span>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={p.adet}
                          onChange={e => personelGuncelle(i, 'adet', parseFloat(e.target.value) || 0)}
                          className="w-14 rounded border border-gray-200 bg-white px-2 py-1 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none"
                        />
                        <span className="text-xs text-gray-400">kişi</span>
                      </div>
                      {/* Net Maaş */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">Net:</span>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={p.netMaas}
                          onChange={e => personelGuncelle(i, 'netMaas', parseFloat(e.target.value) || 0)}
                          className="w-28 rounded border border-gray-200 bg-white px-2 py-1 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none"
                        />
                        <span className="text-xs text-gray-400">₺</span>
                      </div>
                      <button
                        onClick={() => personelSil(i)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none px-1 shrink-0"
                        title="Personeli sil"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      İşveren maliyeti:{' '}
                      <span className="font-mono text-gray-600">
                        {Math.round(p.netMaas * 1.575 * (p.adet || 1)).toLocaleString('tr-TR')} ₺
                      </span>
                      <span className="ml-1 text-gray-300">
                        ({p.adet || 1} × net maaş × 1.575 SSK)
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={personelEkle}
              className="mt-3 text-sm text-[#7B3F8E] hover:text-[#5A2D6E] font-medium"
            >
              + Personel Ekle
            </button>
            <div className="mt-2">
              <SonucSatiri label="Toplam Personel Maliyeti" value={personelMaliyeti} bold />
            </div>
          </Card>

          {/* Gıda Maliyeti */}
          <Card title="Gıda Maliyeti">
            <SliderInput
              label="Gıda Maliyet Oranı (Net Ciro %'si)"
              min={20}
              max={45}
              step={1}
              value={Math.round(girdi.gidaMaliyetOrani * 100)}
              onChange={v => set('gidaMaliyetOrani', v / 100)}
              suffix="%"
              uyariEsigi={35}
            />
            {gidaOranYuksek && (
              <UyariKutusu
                mesaj="Gıda maliyeti %35'i aştı. Hedef aralık: %20–%35."
                tip="uyari"
              />
            )}
          </Card>

          {/* Sabit Giderler */}
          <Card title="Sabit Giderler">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Kira (Net)" value={girdi.kira} onChange={v => set('kira', v)} />
              <InputField label="Elektrik" value={girdi.elektrik} onChange={v => set('elektrik', v)} />
              <InputField label="Su" value={girdi.su} onChange={v => set('su', v)} />
              <InputField label="Doğalgaz / LPG" value={girdi.dogalgaz} onChange={v => set('dogalgaz', v)} />
              <InputField label="Muhasebe" value={girdi.muhasebe} onChange={v => set('muhasebe', v)} />
              <InputField label="Yazılım & POS" value={girdi.yazilimPos} onChange={v => set('yazilimPos', v)} />
              <InputField label="Diğer Sabit" value={girdi.digerSabit} onChange={v => set('digerSabit', v)} />
            </div>
            <SonucSatiri
              label="Toplam Sabit Gider"
              value={girdi.kira + girdi.elektrik + girdi.su + girdi.dogalgaz + girdi.muhasebe + girdi.yazilimPos + girdi.digerSabit}
              bold
            />
          </Card>

          {/* Sarf Malzeme */}
          <Card title="Sarf Malzeme">
            <SliderInput
              label="Sarf Malzeme Oranı (Brüt Ciro %'si)"
              min={1}
              max={10}
              step={1}
              value={Math.round(girdi.sarfMalzemeOrani * 100)}
              onChange={v => set('sarfMalzemeOrani', v / 100)}
              suffix="%"
            />
            <p className="text-xs text-gray-400">
              Tahmini: {Math.round(ciro.aylikBrutCiro * girdi.sarfMalzemeOrani).toLocaleString('tr-TR')} ₺ / ay
            </p>
          </Card>

          {/* Ödeme Komisyonları */}
          <Card title="Ödeme Dağılımı">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Nakit (%)"
                value={girdi.nakitPay}
                onChange={v => set('nakitPay', v)}
                suffix="%"
                step={5}
              />
              <InputField
                label="Kredi Kartı (%)"
                value={girdi.kkPay}
                onChange={v => set('kkPay', v)}
                suffix="%"
                step={5}
              />
              <InputField
                label="Yemek Kartı (%)"
                value={girdi.yemekKartiPay}
                onChange={v => set('yemekKartiPay', v)}
                suffix="%"
                step={5}
              />
              <InputField
                label="Online (%)"
                value={girdi.onlinePay}
                onChange={v => set('onlinePay', v)}
                suffix="%"
                step={5}
              />
            </div>
            <div className={`text-xs text-right font-mono mt-1 ${toplamPayHatali ? 'text-red-500' : 'text-green-600'}`}>
              Toplam: %{toplamOdemePayi} {toplamPayHatali ? '(100 olmalı!)' : '✓'}
            </div>
            <p className="text-[11px] text-gray-400">
              KK: %2 kom. · Yemek kartı: %10 kom. · Online: %20 kom. · Nakit: komisyonsuz
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
