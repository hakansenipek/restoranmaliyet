import type { CiroSonucu, OpexGirdisi, OpexSonucu } from '@/types';

// netSatis: P&L'den gelen KDV-hariç satış (gıda maliyeti bunun üzerinden hesaplanır)
export function opexHesapla(
  g: OpexGirdisi,
  ciro: CiroSonucu,
  netSatis: number,
): OpexSonucu {
  const gidaMaliyeti = netSatis * g.gidaMaliyetOrani;

  // Toplam personel sayısı ve net maaş toplamı
  const toplamPersonelSayisi = g.personeller.reduce((acc, p) => acc + p.adet, 0);
  const toplamNetMaas = g.personeller.reduce((acc, p) => acc + p.netMaas * p.adet, 0);

  // İşveren toplam maliyeti: net maaş × 1.575 × adet
  // SGK işveren payı ≈ net maaş × 0.575 (1.575 - 1)
  const sgkIsverenToplam = Math.round(toplamNetMaas * 0.575);
  const yemekBedeliToplam = (g.yemekBedeli || 0) * toplamPersonelSayisi;
  const personelToplamMaliyet = toplamNetMaas + sgkIsverenToplam + yemekBedeliToplam;

  const toplamSabitGider =
    g.kira + g.elektrik + g.su + g.dogalgaz +
    g.muhasebe + g.yazilimPos + g.digerSabit;

  const sarfMalzeme = ciro.aylikBrutCiro * g.sarfMalzemeOrani;

  // Ödeme komisyonları: KK %2, Yemek kartı %10, Online %20, Nakit %0
  const odemeKomisyonu =
    ciro.aylikBrutCiro * (
      (g.kkPay / 100) * 0.02 +
      (g.yemekKartiPay / 100) * 0.10 +
      (g.onlinePay / 100) * 0.20
    );

  const toplamOpex =
    gidaMaliyeti + personelToplamMaliyet + toplamSabitGider +
    sarfMalzeme + odemeKomisyonu;

  return {
    gidaMaliyeti,
    personelToplamMaliyet,
    yemekBedeliToplam,
    sgkIsverenToplam,
    toplamPersonelSayisi,
    toplamSabitGider,
    sarfMalzeme,
    odemeKomisyonu,
    toplamOpex,
  };
}
