'use client';
import { HesaplamaGirdisi } from '@/types';
import InputField from './ui/InputField';
import Card from './ui/Card';
interface Props { girdi: HesaplamaGirdisi; onChange: (g: HesaplamaGirdisi) => void; }
export default function GirdiFormu({ girdi, onChange }: Props) {
  const set = (key: keyof HesaplamaGirdisi) => (val: number | string) => onChange({ ...girdi, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">İşletme Adı (isteğe bağlı)</label>
        <input type="text" value={girdi.isletmeAdi??''} onChange={e=>onChange({...girdi,isletmeAdi:e.target.value})}
          placeholder="örn. Bursa Mutfak"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-[#7B3F8E] focus:outline-none focus:ring-2 focus:ring-[#7B3F8E]/20" />
      </div>
      <Card title="1 — Ciro & KDV">
        <InputField label="Aylık Brüt Ciro (KDV Dahil)" value={girdi.aylikCiro} onChange={set('aylikCiro')} step={100000} hint="Müşteriden tahsil edilen toplam tutar" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="%10 KDV'li Satış Payı" value={girdi.kdvDusukPay} onChange={set('kdvDusukPay')} suffix="%" isPercent step={5} />
          <InputField label="%20 KDV'li Satış Payı" value={1-girdi.kdvDusukPay} onChange={v=>set('kdvDusukPay')(1-v)} suffix="%" isPercent step={5} hint="Otomatik" />
        </div>
      </Card>
      <Card title="2 — Değişken Giderler">
        <InputField label="Hammadde Oranı (Net Satış Üzeri)" value={girdi.hammaddeOrani} onChange={set('hammaddeOrani')} suffix="%" isPercent step={1} />
        <InputField label="Hammadde Giriş KDV" value={girdi.hammaddeKdvOrani} onChange={set('hammaddeKdvOrani')} suffix="%" isPercent step={1} />
        <InputField label="Kredi Kartı Komisyonu" value={girdi.kkKomisyonOrani} onChange={set('kkKomisyonOrani')} suffix="%" isPercent step={0.1} />
        <InputField label="Bakım / İkram / Ambalaj vb." value={girdi.digerDegiskenOrani} onChange={set('digerDegiskenOrani')} suffix="%" isPercent step={0.1} />
      </Card>
      <Card title="3 — Sabit Giderler (Aylık)">
        <InputField label="Personel (SGK + Yemek + Servis)" value={girdi.personelGider} onChange={set('personelGider')} step={50000} />
        <InputField label="Elektrik + Doğalgaz + Su" value={girdi.elektrikGider} onChange={set('elektrikGider')} step={10000} />
        <InputField label="Kira" value={girdi.kiraGider} onChange={set('kiraGider')} step={50000} />
      </Card>
    </div>
  );
}
