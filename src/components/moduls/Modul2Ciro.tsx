'use client';

import { useCallback, useState } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import SliderInput from '@/components/ui/SliderInput';
import SonucSatiri from '@/components/ui/SonucSatiri';
import { ciroHesapla } from '@/lib/hesaplama/ciroEngine';
import type { CiroGirdisi, OgunGirdisi } from '@/types';

interface Props {
  girdi: CiroGirdisi;
  onChange: (v: CiroGirdisi) => void;
}

function OgunKarti({
  baslik,
  girdi,
  onChange,
}: {
  baslik: string;
  girdi: OgunGirdisi;
  onChange: (v: OgunGirdisi) => void;
}) {
  return (
    <div className={`rounded-lg border p-4 flex flex-col gap-3 transition-colors ${girdi.aktif ? 'border-purple-200 bg-white' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange({ ...girdi, aktif: !girdi.aktif })}
          className={`w-10 h-5 rounded-full transition-colors relative ${girdi.aktif ? 'bg-[#7B3F8E]' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${girdi.aktif ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
        <span className="text-sm font-semibold text-gray-700">{baslik}</span>
      </div>
      {girdi.aktif && (
        <>
          <SliderInput
            label="Doluluk Oranı"
            min={0}
            max={100}
            step={5}
            value={girdi.dolulukOrani}
            onChange={v => onChange({ ...girdi, dolulukOrani: v })}
            suffix="%"
            uyariEsigi={90}
          />
          <InputField
            label="Kişi Başı Ortalama Harcama"
            value={girdi.kisiBasiHarcama}
            onChange={v => onChange({ ...girdi, kisiBasiHarcama: v })}
            step={10}
          />
        </>
      )}
    </div>
  );
}

export default function Modul2Ciro({ girdi, onChange }: Props) {
  const [acik, setAcik] = useState(true);
  const sonuc = ciroHesapla(girdi);

  const set = useCallback(
    <K extends keyof CiroGirdisi>(k: K, v: CiroGirdisi[K]) => {
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
            Modül 2 — Ciro Projeksiyonu
          </span>
          <span className="ml-3 text-xs text-purple-200">
            Aylık: {Math.round(sonuc.aylikBrutCiro).toLocaleString('tr-TR')} ₺
          </span>
        </div>
        <span className="text-white text-sm">{acik ? '▲' : '▼'}</span>
      </button>

      {acik && (
        <div className="p-5 flex flex-col gap-5">
          <Card title="Mekan">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Kapalı Alan Sandalye Sayısı"
                value={girdi.kapaliAlanSandalyeSayisi}
                onChange={v => set('kapaliAlanSandalyeSayisi', v)}
                suffix="kişi"
                step={5}
              />
              <InputField
                label="Açık Alan Sandalye Sayısı"
                value={girdi.acikAlanSandalyeSayisi}
                onChange={v => set('acikAlanSandalyeSayisi', v)}
                suffix="kişi"
                step={5}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Toplam: {(girdi.kapaliAlanSandalyeSayisi || 0) + (girdi.acikAlanSandalyeSayisi || 0)} kişi
            </p>
          </Card>

          <Card title="Servis Öğünleri">
            <div className="flex flex-col gap-3">
              <OgunKarti
                baslik="Kahvaltı Servisi"
                girdi={girdi.kahvalti}
                onChange={v => set('kahvalti', v)}
              />
              <OgunKarti
                baslik="Öğle Servisi"
                girdi={girdi.ogle}
                onChange={v => set('ogle', v)}
              />
              <OgunKarti
                baslik="Akşam Servisi"
                girdi={girdi.aksam}
                onChange={v => set('aksam', v)}
              />
            </div>
          </Card>

          <Card title="Paket Servis">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Günlük Sipariş Adedi"
                value={girdi.paketSiparisSayisi}
                onChange={v => set('paketSiparisSayisi', v)}
                suffix="adet"
                step={1}
              />
              <InputField
                label="Ortalama Sipariş Tutarı"
                value={girdi.paketSiparisOrtalaması}
                onChange={v => set('paketSiparisOrtalaması', v)}
                step={10}
              />
            </div>
          </Card>

          <Card title="Çalışma Takvimi">
            <SliderInput
              label="Aylık Çalışma Günü"
              min={20}
              max={31}
              step={1}
              value={girdi.aylikCalismaGunu}
              onChange={v => set('aylikCalismaGunu', v)}
              suffix=" gün"
            />
          </Card>

          <div className="rounded-xl border border-purple-200 p-4 flex flex-col gap-1" style={{ backgroundColor: '#EFE6F4' }}>
            <SonucSatiri label="Günlük Kapasite Cirosu" value={sonuc.gunlukKapasiteCiro} />
            <SonucSatiri label="Günlük Paket Servisi" value={sonuc.gunlukPaketCiro} />
            <SonucSatiri label="Günlük Brüt Ciro" value={sonuc.gunlukBrutCiro} bold />
            <div className="border-t border-purple-200 mt-1 pt-1">
              <SonucSatiri label="AYLIK BRÜT CİRO" value={sonuc.aylikBrutCiro} bold highlight="purple" />
              <SonucSatiri label="Yıllık Projeksiyon" value={sonuc.yillikBrutCiro} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
