'use client';

import { useCallback, useState } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import SonucSatiri from '@/components/ui/SonucSatiri';
import { capexHesapla } from '@/lib/hesaplama/capexEngine';
import type { CapexGirdisi } from '@/types';

interface Props {
  girdi: CapexGirdisi;
  onChange: (v: CapexGirdisi) => void;
}

export default function Modul1Capex({ girdi, onChange }: Props) {
  const [acik, setAcik] = useState(true);
  const sonuc = capexHesapla(girdi);

  const set = useCallback(
    <K extends keyof CapexGirdisi>(k: K, v: CapexGirdisi[K]) => {
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
            Modül 1 — Yatırım Maliyeti (CAPEX)
          </span>
          <span className="ml-3 text-xs text-purple-200">
            Toplam: {Math.round(sonuc.toplamCapex).toLocaleString('tr-TR')} ₺
          </span>
        </div>
        <span className="text-white text-sm">{acik ? '▲' : '▼'}</span>
      </button>

      {acik && (
        <div className="p-5 flex flex-col gap-5">
          {/* Mimari & Proje */}
          <Card title="Mimari & Proje">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Devir Ücreti" value={girdi.devirUcreti} onChange={v => set('devirUcreti', v)} />
              <InputField label="Mimari Hizmet Bedeli" value={girdi.mimariHizmetBedeli} onChange={v => set('mimariHizmetBedeli', v)} />
              <InputField label="Belediye Ruhsat Bedeli" value={girdi.belediyeRuhsatBedeli} onChange={v => set('belediyeRuhsatBedeli', v)} />
              <InputField label="Turizm Belgesi Bedeli" value={girdi.turizmBelgesiBedeli} onChange={v => set('turizmBelgesiBedeli', v)} />
              <InputField label="Doğalgaz Proje Bedeli" value={girdi.dogalgazProjeBedeli} onChange={v => set('dogalgazProjeBedeli', v)} />
              <InputField label="Diğer" value={girdi.mimariDiger} onChange={v => set('mimariDiger', v)} />
            </div>
            <SonucSatiri label="Mimari & Proje Toplamı" value={sonuc.mimariProje} bold />
          </Card>

          {/* İnşaat & Dekorasyon */}
          <Card title="İnşaat & Dekorasyon">
            {/* Alan bilgisi */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <InputField label="Kapalı Alan (m²)" value={girdi.kapaliAlan} onChange={v => set('kapaliAlan', v)} suffix="m²" step={5} />
              <InputField label="Açık Alan (m²)" value={girdi.acikAlan} onChange={v => set('acikAlan', v)} suffix="m²" step={5} />
            </div>

            {/* Maliyet kalemleri */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Maliyet Kalemleri</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <InputField label="Zemin ve Duvar İnşaat Bedeli" value={girdi.zeminDuvarInsaat} onChange={v => set('zeminDuvarInsaat', v)} />
              <InputField label="Elektrik Tesisat Bedeli" value={girdi.elektrikTesisat} onChange={v => set('elektrikTesisat', v)} />
              <InputField label="Su Tesisat Bedeli" value={girdi.suTesisat} onChange={v => set('suTesisat', v)} />
              <InputField label="Doğalgaz Tesisat Bedeli" value={girdi.dogalgazTesisat} onChange={v => set('dogalgazTesisat', v)} />
              <InputField label="Cam (Açılır, Katlanır) Bedeli" value={girdi.camBedeli} onChange={v => set('camBedeli', v)} />
              <InputField label="Aydınlatma Bedeli" value={girdi.aydinlatma} onChange={v => set('aydinlatma', v)} />
              <InputField label="Ses Sistemi Bedeli" value={girdi.sesSistemi} onChange={v => set('sesSistemi', v)} />
              <InputField label="Açık Alan Pergole / Şemsiye Bedeli" value={girdi.pergoleSemiye} onChange={v => set('pergoleSemiye', v)} />
              <InputField label="Açık Alan Isıtıcı Bedeli" value={girdi.acikAlanIsitici} onChange={v => set('acikAlanIsitici', v)} />
              <InputField label="Klima Bedeli" value={girdi.klima} onChange={v => set('klima', v)} />
            </div>

            {/* Masa & Sandalye */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Masa & Sandalye</p>
            <div className="flex flex-col gap-3 mb-4">
              {[
                { label: 'Kapalı Alan Masa', adetKey: 'kapaliMasaAdet', fiyatKey: 'kapaliMasaBirimFiyat' },
                { label: 'Açık Alan Masa', adetKey: 'acikMasaAdet', fiyatKey: 'acikMasaBirimFiyat' },
                { label: 'Kapalı Alan Sandalye', adetKey: 'kapaliSandalyeAdet', fiyatKey: 'kapaliSandalyeBirimFiyat' },
                { label: 'Açık Alan Sandalye', adetKey: 'acikSandalyeAdet', fiyatKey: 'acikSandalyeBirimFiyat' },
              ].map(({ label, adetKey, fiyatKey }) => {
                const adet = girdi[adetKey as keyof CapexGirdisi] as number;
                const fiyat = girdi[fiyatKey as keyof CapexGirdisi] as number;
                const toplam = adet * fiyat;
                return (
                  <div key={adetKey} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</span>
                    </div>
                    <div className="w-24">
                      <InputField label="Adet" value={adet} onChange={v => set(adetKey as keyof CapexGirdisi, v as never)} suffix="ad." step={1} />
                    </div>
                    <div className="w-36">
                      <InputField label="Birim Fiyat" value={fiyat} onChange={v => set(fiyatKey as keyof CapexGirdisi, v as never)} />
                    </div>
                    <div className="flex flex-col gap-1 w-36">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Toplam</span>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-right text-sm font-mono text-gray-700">
                        {toplam.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <SonucSatiri label="İnşaat & Dekorasyon Toplamı" value={sonuc.insaatDekorasyon} bold />
          </Card>

          {/* Mutfak ve Servis Ekipmanları */}
          <Card title="Mutfak ve Servis Ekipmanları">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mutfak Ekipmanları</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <InputField label="Paslanmaz Grubu" value={girdi.paslanmazGrup} onChange={v => set('paslanmazGrup', v)} hint="Tezgahlar, davlumbaz vb." />
              <InputField label="Pişirici Grubu" value={girdi.pisiriciGrup} onChange={v => set('pisiriciGrup', v)} hint="Fırın, Ocak, Plate, Fritöz vb." />
              <InputField label="Soğutma Grubu" value={girdi.sogutma} onChange={v => set('sogutma', v)} hint="Buzdolabı, soğuk hava odası vb." />
              <InputField label="Endüstriyel Makineler" value={girdi.endustriyelMakineler} onChange={v => set('endustriyelMakineler', v)} hint="Bulaşık, buz, kahve makinesi vb." />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Servis Ekipmanları</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <InputField label="Çatal / Bıçak / Kaşık" value={girdi.catalKasik} onChange={v => set('catalKasik', v)} />
              <InputField label="Bardak" value={girdi.bardak} onChange={v => set('bardak', v)} />
              <InputField label="Tabaklar" value={girdi.tabaklar} onChange={v => set('tabaklar', v)} />
              <InputField label="Diğer" value={girdi.mutfakDiger} onChange={v => set('mutfakDiger', v)} />
            </div>
            <SonucSatiri label="Mutfak ve Servis Ekipmanları Toplamı" value={sonuc.mutfakEkipmanlari} bold />
          </Card>

          {/* Lisans & Ruhsat */}
          <Card title="Lisans & Ruhsat">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Yazar Kasa / POS Programı" value={girdi.yazarKasaPos} onChange={v => set('yazarKasaPos', v)} />
              <InputField label="TAPDK / Alkol Belgesi" value={girdi.tapdk} onChange={v => set('tapdk', v)} />
              <InputField label="Diğer" value={girdi.lisansDiger} onChange={v => set('lisansDiger', v)} />
            </div>
            <SonucSatiri label="Lisans & Ruhsat Toplamı" value={sonuc.lisansRuhsat} bold />
          </Card>

          {/* Açılış Pazarlaması */}
          <Card title="Açılış Pazarlaması">
            <InputField
              label="İlk Reklam Bütçesi"
              value={girdi.ilkReklamButcesi}
              onChange={v => set('ilkReklamButcesi', v)}
            />
          </Card>

          {/* Kira & Depozito */}
          <Card title="Kira & Depozito">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <InputField
                label="Aylık Kira (Net)"
                value={girdi.aylikKira}
                onChange={v => set('aylikKira', v)}
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1.5">
                Sözleşme Tipi
              </label>
              <div className="flex gap-3">
                {([
                  { val: 'bireysel', label: 'Bireysel Sözleşme (Stopaj)' },
                  { val: 'kurumsal', label: 'Kurumsal Sözleşme (KDV)' },
                ] as const).map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set('kiraSozlesmeTipi', val)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                      girdi.kiraSozlesmeTipi === val
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                    }`}
                    style={girdi.kiraSozlesmeTipi === val ? { backgroundColor: '#7B3F8E' } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {girdi.kiraSozlesmeTipi === 'bireysel' && (
                <p className="text-[11px] text-amber-600 mt-1.5">
                  Bireysel sözleşmede aylık %20 stopaj kesip muhtasar beyanname ile yatırmanız gerekir.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Depozito Bedeli"
                value={girdi.depozitoBedeli}
                onChange={v => set('depozitoBedeli', v)}
              />
              <InputField
                label="Emlakçı Komisyon Bedeli"
                value={girdi.emlakciKomisyonu}
                onChange={v => set('emlakciKomisyonu', v)}
              />
            </div>
            <SonucSatiri label="Kira & Depozito Toplamı" value={sonuc.kiraDepozito} bold />
          </Card>

          {/* İlk Stok */}
          <Card title="İlk Stok">
            <InputField
              label="Açılış İlk Hammadde Alımı"
              value={girdi.ilkStok}
              onChange={v => set('ilkStok', v)}
            />
          </Card>

          {/* CAPEX Özet */}
          <div className="rounded-xl border border-purple-200 p-4 flex flex-col gap-1" style={{ backgroundColor: '#EFE6F4' }}>
            <SonucSatiri label="Ara Toplam" value={sonuc.araToplamCapex} />
            <SonucSatiri label="Görülmeyen Giderler (%10)" value={sonuc.gorulenmeyen} />
            <div className="border-t border-purple-200 mt-1 pt-1">
              <SonucSatiri label="TOPLAM YATIRIM (CAPEX)" value={sonuc.toplamCapex} bold highlight="purple" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
