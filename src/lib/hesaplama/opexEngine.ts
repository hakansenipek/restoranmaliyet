import type { CiroSonucu, OpexGirdisi, OpexSonucu } from '@/types';

// netSatis: P&L'den gelen KDV-hariç satış (gıda maliyeti bunun üzerinden hesaplanır)
export function opexHesapla(
  g: OpexGirdisi,
  ciro: CiroSonucu,
  netSatis: number,
  aylikKira: number,
  aylikCalismaGunu: number,
): OpexSonucu {
  const gidaMaliyeti = netSatis * g.gidaMaliyetOrani;

  // Toplam personel sayısı ve net maaş toplamı
  const toplamPersonelSayisi = g.personeller.reduce((acc, p) => acc + p.adet, 0);
  const toplamNetMaas = g.personeller.reduce((acc, p) => acc + p.netMaas * p.adet, 0);

  // İşveren toplam maliyeti: brüt = net / 0.85 → işveren = brüt × 1.225
  const toplamIsverenMaliyet = g.personeller.reduce(
    (acc, p) => acc + (p.netMaas / 0.85) * 1.225 * p.adet,
    0,
  );
  // SGK işveren payı = brüt × %22.5 (işveren SSK + işsizlik)
  const sgkIsverenToplam = Math.round(toplamIsverenMaliyet - toplamNetMaas);
  const yemekBedeliToplam = (g.yemekBedeli || 0) * toplamPersonelSayisi * (aylikCalismaGunu || 30);
  const personelToplamMaliyet = Math.round(toplamIsverenMaliyet) + yemekBedeliToplam;

  const toplamSabitGider =
    aylikKira + g.elektrik + g.su + g.dogalgaz +
    g.maliMusavir + g.yazilimPos + g.digerSabit;

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
