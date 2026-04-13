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
      { ad: 'Yeni Personel', netMaas: 18000, yolYemek: 1500 },
    ]);
  }

  function personelSil(i: number) {
    set('personeller', girdi.personeller.filter((_, idx) => idx !== i));
  }

  const personelMaliyeti = girdi.personeller.reduce(
    (acc, p) => acc + p.netMaas * 1.575 + p.yolYemek,
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

          {/* Personel */}
          <Card title="Personel Giderleri">
            <div className="flex flex-col gap-3">
              {girdi.personeller.map((p, i) => (
                <div key={i} className="rounded-lg border border-gray-100 p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.ad}
                      onChange={e => personelGuncelle(i, 'ad', e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#7B3F8E]"
                      placeholder="Personel adı / görevi"
                    />
                    <button
                      onClick={() => personelSil(i)}
                      className="text-red-400 hover:text-red-600 text-sm px-2"
                      title="Personeli sil"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      label="Net Maaş"
                      value={p.netMaas}
                      onChange={v => personelGuncelle(i, 'netMaas', v)}
                      step={1000}
                    />
                    <InputField
                      label="Yol/Yemek"
                      value={p.yolYemek}
                      onChange={v => personelGuncelle(i, 'yolYemek', v)}
                      step={500}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    İşveren maliyeti: {Math.round(p.netMaas * 1.575 + p.yolYemek).toLocaleString('tr-TR')} ₺
                    <span className="ml-1 text-gray-300">(×1.575 SSK + yol/yemek)</span>
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={personelEkle}
              className="mt-1 text-sm text-[#7B3F8E] hover:text-[#5A2D6E] font-medium"
            >
              + Personel Ekle
            </button>
            <SonucSatiri label="Toplam Personel Maliyeti" value={personelMaliyeti} bold />
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
