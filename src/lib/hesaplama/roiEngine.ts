import type { CapexSonucu, CiroGirdisi, OpexSonucu, PlSonucu, RoiSonucu } from '@/types';

export function roiHesapla(
  capex: CapexSonucu,
  opex: OpexSonucu,
  pl: PlSonucu,
  ciroGirdisi: CiroGirdisi,
): RoiSonucu {
  // Değişken giderler: gıda + sarf + ödeme komisyonu
  const degiskenGiderler = opex.gidaMaliyeti + opex.sarfMalzeme + opex.odemeKomisyonu;
  const degiskenGiderOrani = pl.netSatis > 0 ? degiskenGiderler / pl.netSatis : 0;
  const katkilaMarji = 1 - degiskenGiderOrani;

  // Sabit giderler: personel + sabit gider + kira stopajı
  const toplamSabitGider = opex.personelToplamMaliyet + opex.toplamSabitGider + pl.kiraStopaj;

  // Başabaş aylık ciro (net satış bazında)
  const basaBasAylikCiro = katkilaMarji > 0 ? toplamSabitGider / katkilaMarji : 0;
  const basaBasGunlukCiro =
    ciroGirdisi.aylikCalismaGunu > 0 ? basaBasAylikCiro / ciroGirdisi.aylikCalismaGunu : 0;

  // ROI (amortisman süresi, ay)
  const roiAy = pl.netAylikKar > 0 ? capex.toplamCapex / pl.netAylikKar : null;

  // 36 aylık kümülatif kâr verisi (grafik için)
  const aylikKumulatifData: { ay: number; kar: number }[] = [];
  for (let ay = 1; ay <= 36; ay++) {
    aylikKumulatifData.push({ ay, kar: pl.netAylikKar * ay });
  }

  return {
    degiskenGiderOrani,
    katkilaMarji,
    basaBasAylikCiro,
    basaBasGunlukCiro,
    roiAy,
    aylikKumulatifData,
  };
}
