'use client';

import { useCallback, useState } from 'react';

// Inline sayı girişi: odakta 0 kaybolur, blur'da binlik noktalı format
function NumInput({ value, onChange, className }: { value: number; onChange: (v: number) => void; className: string }) {
  const [str, setStr] = useState<string | null>(null);
  const fmt = (n: number) => n === 0 ? '' : n.toLocaleString('tr-TR');
  const parse = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  return (
    <input
      type="text"
      inputMode="decimal"
      value={str !== null ? str : fmt(value)}
      onFocus={() => setStr(value === 0 ? '' : String(value).replace('.', ','))}
      onBlur={() => setStr(null)}
      onChange={e => { setStr(e.target.value); onChange(parse(e.target.value)); }}
      className={className}
    />
  );
}
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import SliderInput from '@/components/ui/SliderInput';
import SonucSatiri from '@/components/ui/SonucSatiri';
import UyariKutusu from '@/components/ui/UyariKutusu';
import type { CiroSonucu, OpexGirdisi, Personel } from '@/types';

interface Props {
  girdi: OpexGirdisi;
  ciro: CiroSonucu;
  aylikKira: number;
  aylikCalismaGunu: number;
  onChange: (v: OpexGirdisi) => void;
}

export default function Modul3Opex({ girdi, ciro, aylikKira, aylikCalismaGunu, onChange }: Props) {
  const [acik, setAcik] = useState(false);

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

  const toplamPersonelSayisi = girdi.personeller.reduce((acc, p) => acc + p.adet, 0);
  const toplamNetMaas = girdi.personeller.reduce((acc, p) => acc + p.netMaas * p.adet, 0);
  const toplamIsverenMaliyet = girdi.personeller.reduce(
    (acc, p) => acc + (p.netMaas / 0.85) * 1.225 * p.adet,
    0,
  );
  const sgkIsverenToplam = Math.round(toplamIsverenMaliyet - toplamNetMaas);
  const toplamYemekBedeli = (girdi.yemekBedeli || 0) * toplamPersonelSayisi * (aylikCalismaGunu || 30);
  const personelKiyafetToplam = (girdi.personelKiyafet || 0) * toplamPersonelSayisi;
  const personelServisiToplam = girdi.personelServisi || 0;
  const personelMaliyeti =
    Math.round(toplamIsverenMaliyet) + toplamYemekBedeli + personelKiyafetToplam + personelServisiToplam;

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
            <p className="text-xs text-gray-500 mb-3">
              İşletmenizde görev alacak personellerin pozisyon bazlı sayılarını ve net maaş beklentilerini belirleyin. Netten brüte tüm yasal kesintiler ve işveren maliyetleri, toplam işletme giderlerinize anlık olarak yansıtılır.
            </p>
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
                        <NumInput
                          value={p.adet}
                          onChange={v => personelGuncelle(i, 'adet', v)}
                          className="w-14 rounded border border-gray-200 bg-white px-2 py-1 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none"
                        />
                        <span className="text-xs text-gray-400">kişi</span>
                      </div>
                      {/* Net Maaş */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">Net:</span>
                        <NumInput
                          value={p.netMaas}
                          onChange={v => personelGuncelle(i, 'netMaas', v)}
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
                    {p.adet > 0 && (
                      <p className="text-[11px] text-gray-400">
                        İşveren maliyeti:{' '}
                        <span className="font-mono text-gray-600">
                          {Math.round((p.netMaas / 0.85) * 1.225 * p.adet).toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="ml-1 text-gray-300">
                          ({p.adet} × net ÷ 0.85 = brüt, brüt × 1.225 işveren yükü)
                        </span>
                      </p>
                    )}
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

            {/* Özet */}
            <div className="mt-3 rounded-lg border border-purple-100 bg-purple-50/40 px-4 py-3 flex flex-col gap-2">

              {/* 1. Toplam personel sayısı */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Toplam Personel Sayısı</span>
                <span className="font-mono font-bold text-gray-800">{toplamPersonelSayisi} kişi</span>
              </div>

              {/* 2. Yemek bedeli girişi */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">Yemek Bedeli (kişi/gün):</span>
                <div className="flex items-center gap-1 ml-auto">
                  <NumInput
                    value={girdi.yemekBedeli || 0}
                    onChange={v => set('yemekBedeli', v)}
                    className="w-28 rounded border border-gray-200 bg-white px-2 py-1 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">₺</span>
                </div>
              </div>

              {/* 3. Toplam yemek bedeli */}
              {toplamYemekBedeli > 0 && (
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    Toplam Yemek Bedeli
                    <span className="ml-1 text-gray-400">
                      ({toplamPersonelSayisi} kişi × {aylikCalismaGunu || 30} gün)
                    </span>
                  </span>
                  <span className="font-mono">{toplamYemekBedeli.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}

              {/* 4. Personel kıyafeti */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">
                  Personel Kıyafeti
                  {toplamPersonelSayisi > 0 && (
                    <span className="ml-1 text-gray-400">({toplamPersonelSayisi} kişi ×)</span>
                  )}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <NumInput
                    value={girdi.personelKiyafet || 0}
                    onChange={v => set('personelKiyafet', v)}
                    className="w-28 rounded border border-gray-200 bg-white px-2 py-1 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">₺</span>
                </div>
              </div>
              {personelKiyafetToplam > 0 && (
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Toplam Kıyafet Bedeli</span>
                  <span className="font-mono">{personelKiyafetToplam.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}

              {/* 5. Personel servisi */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">Personel Servisi (Ulaşım):</span>
                <div className="flex items-center gap-1 ml-auto">
                  <NumInput
                    value={girdi.personelServisi || 0}
                    onChange={v => set('personelServisi', v)}
                    className="w-28 rounded border border-gray-200 bg-white px-2 py-1 text-right text-sm font-mono text-gray-800 focus:border-[#7B3F8E] focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">₺</span>
                </div>
              </div>

              {/* 6. Toplam net maaş */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Toplam Net Maaş</span>
                <span className="font-mono">{toplamNetMaas.toLocaleString('tr-TR')} ₺</span>
              </div>

              {/* 7. SGK */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>SGK İşveren Payı (brüt × %22.5)</span>
                <span className="font-mono">{sgkIsverenToplam.toLocaleString('tr-TR')} ₺</span>
              </div>

              {/* 8. Toplam */}
              <div className="border-t border-purple-200 pt-2">
                <SonucSatiri label="Toplam Personel Maliyeti" value={personelMaliyeti} bold />
              </div>
            </div>
          </Card>

          {/* Gıda Maliyeti */}
          <Card title="Gıda Maliyeti">
            <InputField
              label="Gıda Maliyet Oranı (Net Ciro %'si)"
              value={Math.round(girdi.gidaMaliyetOrani * 100)}
              onChange={v => set('gidaMaliyetOrani', v / 100)}
              suffix="%"
              step={1}
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
            {/* Kira: Modül 1'den otomatik */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kira (Net)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-800">{aylikKira.toLocaleString('tr-TR')} ₺</span>
                <span className="text-[11px] text-gray-400">(Modül 1'den)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Elektrik" value={girdi.elektrik} onChange={v => set('elektrik', v)} />
              <InputField label="Su" value={girdi.su} onChange={v => set('su', v)} />
              <InputField label="Doğalgaz / LPG" value={girdi.dogalgaz} onChange={v => set('dogalgaz', v)} />
              <InputField label="Mali Müşavir" value={girdi.maliMusavir} onChange={v => set('maliMusavir', v)} />
              <InputField label="Yazılım & POS" value={girdi.yazilimPos} onChange={v => set('yazilimPos', v)} />
              <InputField label="Diğer Sabit" value={girdi.digerSabit} onChange={v => set('digerSabit', v)} />
            </div>
            <SonucSatiri
              label="Toplam Sabit Gider"
              value={aylikKira + girdi.elektrik + girdi.su + girdi.dogalgaz + girdi.maliMusavir + girdi.yazilimPos + girdi.digerSabit}
              bold
            />
          </Card>

          {/* Sarf Malzeme */}
          <Card title="Sarf Malzeme">
            <p className="text-xs text-gray-500 mb-3">
              Temizlik ürünleri, peçete ve paket servis ambalajı gibi yardımcı giderleri kapsar. Sektör ortalaması cironun %2–4&apos;ü arasındadır. Paket servis ağırlıklı işletmelerde bu oran daha yüksek seçilmelidir.
            </p>
            <InputField
              label="Sarf Malzeme Oranı (Brüt Ciro %'si)"
              value={Math.round(girdi.sarfMalzemeOrani * 100)}
              onChange={v => set('sarfMalzemeOrani', v / 100)}
              suffix="%"
              step={1}
            />
            <p className="text-xs text-gray-400">
              Tahmini: {Math.round(ciro.aylikBrutCiro * girdi.sarfMalzemeOrani).toLocaleString('tr-TR')} ₺ / ay
            </p>
          </Card>

          {/* Ödeme Komisyonları */}
          <Card title="Ödeme Dağılımı">
            <p className="text-xs text-gray-500 mb-3">
              Toplam cironuzun hangi kanallardan tahsil edileceğini belirleyin. Yemek kartları ve online sipariş platformları yüksek komisyon oranları (ortalama %10–%20) içerdiği için net kârınızı doğrudan etkiler. Dağılımın toplamı %100 olmalıdır.
            </p>
            <div className="flex flex-col gap-3">
              <SliderInput
                label="Nakit"
                min={0}
                max={100}
                step={5}
                value={girdi.nakitPay}
                onChange={v => set('nakitPay', v)}
                suffix="%"
              />
              <SliderInput
                label="Kredi Kartı — %2 komisyon"
                min={0}
                max={100}
                step={5}
                value={girdi.kkPay}
                onChange={v => set('kkPay', v)}
                suffix="%"
              />
              <SliderInput
                label="Yemek Kartı — %10 komisyon"
                min={0}
                max={100}
                step={5}
                value={girdi.yemekKartiPay}
                onChange={v => set('yemekKartiPay', v)}
                suffix="%"
              />
              <SliderInput
                label="Online Platform — %20 komisyon"
                min={0}
                max={100}
                step={5}
                value={girdi.onlinePay}
                onChange={v => set('onlinePay', v)}
                suffix="%"
              />
            </div>
            <div className={`text-xs text-right font-mono mt-2 ${toplamPayHatali ? 'text-red-500' : 'text-green-600'}`}>
              Toplam: %{toplamOdemePayi} {toplamPayHatali ? '(100 olmalı!)' : '✓'}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
