'use client';

import { useCallback, useState } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import SliderInput from '@/components/ui/SliderInput';
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Alan (m²)"
                value={girdi.m2}
                onChange={v => set('m2', v)}
                suffix="m²"
                step={10}
              />
            </div>
            <SliderInput
              label="m² Birim Maliyet"
              min={2000}
              max={15000}
              step={500}
              value={girdi.m2BirimMaliyet}
              onChange={v => set('m2BirimMaliyet', v)}
              suffix=" ₺/m²"
            />
            <SonucSatiri label="İnşaat & Dekorasyon" value={sonuc.insaatDekorasyon} bold />
          </Card>

          {/* Mutfak Ekipmanları */}
          <Card title="Mutfak Ekipmanları">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Paslanmaz Grup" value={girdi.paslanmazGrup} onChange={v => set('paslanmazGrup', v)} />
              <InputField label="Pişirici Grup" value={girdi.pisiriciGrup} onChange={v => set('pisiriciGrup', v)} />
              <InputField label="Soğutma" value={girdi.sogutma} onChange={v => set('sogutma', v)} />
              <InputField label="Kahve Makinesi" value={girdi.kahveMakinesi} onChange={v => set('kahveMakinesi', v)} />
              <InputField label="Ufak Aletler" value={girdi.ufakAletler} onChange={v => set('ufakAletler', v)} />
              <InputField label="Çatal/Bıçak/Kaşık" value={girdi.catalKasik} onChange={v => set('catalKasik', v)} />
              <InputField label="Bardak" value={girdi.bardak} onChange={v => set('bardak', v)} />
              <InputField label="Tabaklar" value={girdi.tabaklar} onChange={v => set('tabaklar', v)} />
              <InputField label="Diğer" value={girdi.mutfakDiger} onChange={v => set('mutfakDiger', v)} />
            </div>
            <SonucSatiri label="Mutfak Ekipmanları Toplamı" value={sonuc.mutfakEkipmanlari} bold />
          </Card>

          {/* Lisans & Ruhsat */}
          <Card title="Lisans & Ruhsat">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Belediye Ruhsat Harcı" value={girdi.belediyeRuhsatHarci} onChange={v => set('belediyeRuhsatHarci', v)} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Aylık Kira (brüt)"
                value={girdi.aylikKira}
                onChange={v => set('aylikKira', v)}
              />
              <InputField
                label="Depozito (kaç ay)"
                value={girdi.kiraDepozitoAy}
                onChange={v => set('kiraDepozitoAy', v)}
                suffix="ay"
                step={1}
              />
              <InputField
                label="Emlakçı Komisyonu"
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
