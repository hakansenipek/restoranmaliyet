import type { CiroSonucu, OpexSonucu, PlGirdisi, PlSonucu } from '@/types';

// 2024 gelir vergisi dilimleri (yıllık)
const DILIMLER: { limit: number; oran: number }[] = [
  { limit: 110_000, oran: 0.15 },
  { limit: 230_000, oran: 0.20 },
  { limit: 870_000, oran: 0.27 },
  { limit: 3_000_000, oran: 0.35 },
  { limit: Infinity, oran: 0.40 },
];

function gelirVergisiHesapla(yillikBrutKar: number): number {
  if (yillikBrutKar <= 0) return 0;
  let vergi = 0;
  let kalan = yillikBrutKar;
  let oncekiLimit = 0;
  for (const d of DILIMLER) {
    const dilimTutari = Math.min(kalan, d.limit - oncekiLimit);
    if (dilimTutari <= 0) break;
    vergi += dilimTutari * d.oran;
    kalan -= dilimTutari;
    oncekiLimit = d.limit;
    if (kalan <= 0) break;
  }
  return vergi;
}

// KDV hesabını ayrı export ediyoruz; opexEngine bu değere ihtiyaç duyar
export function netSatisHesapla(
  brutCiro: number,
  kdvDusukPay: number,
): { netSatis: number; tahsilEdilenKdv: number } {
  const kdvDusukBrut = brutCiro * kdvDusukPay;
  const kdvYuksekBrut = brutCiro * (1 - kdvDusukPay);
  const netSatis = kdvDusukBrut / 1.10 + kdvYuksekBrut / 1.20;
  const tahsilEdilenKdv = brutCiro - netSatis;
  return { netSatis, tahsilEdilenKdv };
}

export function plHesapla(
  g: PlGirdisi,
  ciro: CiroSonucu,
  opex: OpexSonucu,
  netSatis: number,
  tahsilEdilenKdv: number,
  netKira: number,     // opexGirdisi.kira — stopaj hesabı için
  kiraSozlesmeTipi: 'bireysel' | 'kurumsal' = 'bireysel',
): PlSonucu {
  void ciro; // ciro değeri ileride kullanılabilir
  const odenenKdv = opex.gidaMaliyeti * g.hammaddeKdvOrani;
  const odenmesiGerekenKdv = tahsilEdilenKdv - odenenKdv;

  // Kira stopajı: yalnızca bireysel sözleşmede uygulanır
  const kiraStopaj = kiraSozlesmeTipi === 'bireysel'
    ? netKira * g.kiraStopajOrani
    : 0;

  const brutKar = netSatis - opex.toplamOpex - kiraStopaj;

  let tahminiVergi = 0;
  if (brutKar > 0) {
    if (g.vergiTuru === 'kurumlar') {
      tahminiVergi = brutKar * 0.25;
    } else {
      // Gelir vergisi: yıllık projeksiyon → aylık tahmin
      tahminiVergi = gelirVergisiHesapla(brutKar * 12) / 12;
    }
  }

  const netAylikKar = brutKar - tahminiVergi;
  const netKarMarji = netSatis > 0 ? netAylikKar / netSatis : 0;

  return {
    netSatis,
    tahsilEdilenKdv,
    odenenKdv,
    odenmesiGerekenKdv,
    kiraStopaj,
    brutKar,
    tahminiVergi,
    netAylikKar,
    netKarMarji,
  };
}
