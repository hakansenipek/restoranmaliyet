import { HesaplamaSonucu } from '@/types';
import Card from './ui/Card';
import SonucSatiri from './ui/SonucSatiri';
interface Props { sonuc: HesaplamaSonucu; aylikCiro: number; }
export default function SonucPaneli({ sonuc, aylikCiro }: Props) {
  const kp = sonuc.faaliyetKari >= 0;
  return (
    <div className="flex flex-col gap-4">
      <Card title="KDV Ayrıştırması">
        <SonucSatiri label="Brüt Ciro (KDV Dahil)" value={aylikCiro} highlight="purple" bold />
        <SonucSatiri label="%10 KDV'li Net" value={sonuc.kdvDusukNet} />
        <SonucSatiri label="%20 KDV'li Net" value={sonuc.kdvYuksekNet} />
        <div className="border-t border-gray-100 mt-1 pt-1">
          <SonucSatiri label="Net Satış (KDV Hariç)" value={sonuc.netSatis} bold highlight="purple" />
          <SonucSatiri label="Satış KDV'si" value={sonuc.satisKdv} />
          <SonucSatiri label="İndirilecek KDV" value={-sonuc.hammaddeKdv} />
          <SonucSatiri label="⚠ Ödenecek KDV" value={sonuc.odenmesiGerekenKdv} bold highlight="red" />
        </div>
      </Card>
      <Card title="Gider Analizi">
        <SonucSatiri label="Hammadde" value={sonuc.hammadde} />
        <SonucSatiri label="KK Komisyonu" value={sonuc.kkKomisyon} />
        <SonucSatiri label="Diğer Değişken" value={sonuc.digerDegisken} />
        <SonucSatiri label="Toplam Değişken" value={sonuc.toplamDegisken} bold />
        <div className="border-t border-gray-100 mt-1 pt-1">
          <SonucSatiri label="Personel" value={sonuc.personelGider} />
          <SonucSatiri label="Elektrik + Doğalgaz + Su" value={sonuc.elektrikGider} />
          <SonucSatiri label="Kira" value={sonuc.kiraGider} />
          <SonucSatiri label="Toplam Sabit" value={sonuc.toplamSabit} bold />
        </div>
      </Card>
      <div className="rounded-xl border-2 p-4 flex flex-col gap-2" style={{borderColor:kp?'#16a34a':'#dc2626',backgroundColor:kp?'#f0fdf4':'#fef2f2'}}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{color:kp?'#15803d':'#b91c1c'}}>{kp?'✅ Faaliyet Kârı':'❌ Faaliyet Zararı'}</p>
        <p className="text-3xl font-bold font-mono" style={{color:kp?'#16a34a':'#dc2626'}}>{Math.round(sonuc.faaliyetKari).toLocaleString('tr-TR')} ₺</p>
        <p className="text-sm" style={{color:kp?'#15803d':'#b91c1c'}}>Net satış kâr marjı: %{(sonuc.karMarji*100).toFixed(1)}</p>
      </div>
      <div className="rounded-xl border border-[#C4215A] bg-red-50 p-4 flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-widest text-[#C4215A]">Başa Baş Ciro</p>
        <p className="text-2xl font-bold font-mono text-[#C4215A]">{Math.round(sonuc.basaBasCiro).toLocaleString('tr-TR')} ₺ / ay</p>
        <p className="text-sm text-[#C4215A]">Günlük (30 gün): {Math.round(sonuc.basaBasGunluk).toLocaleString('tr-TR')} ₺</p>
      </div>
    </div>
  );
}
