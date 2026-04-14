import type { CiroGirdisi, CiroSonucu } from '@/types';

export const SENARYO = { dusuk: 0.70, baz: 1.00, yuksek: 1.30 } as const;

export function ciroHesapla(g: CiroGirdisi): CiroSonucu {
  const toplamSandalye = (g.kapaliAlanSandalyeSayisi || 0) + (g.acikAlanSandalyeSayisi || 0);

  const kahvaltiGelir = g.kahvalti.aktif
    ? toplamSandalye * (g.kahvalti.dolulukOrani / 100) * g.kahvalti.kisiBasiHarcama
    : 0;
  const ogleGelir = g.ogle.aktif
    ? toplamSandalye * (g.ogle.dolulukOrani / 100) * g.ogle.kisiBasiHarcama
    : 0;
  const aksamGelir = g.aksam.aktif
    ? toplamSandalye * (g.aksam.dolulukOrani / 100) * g.aksam.kisiBasiHarcama
    : 0;

  const gunlukKapasiteCiro = kahvaltiGelir + ogleGelir + aksamGelir;
  const gunlukPaketCiro = g.paketSiparisSayisi * g.paketSiparisOrtalaması;
  const gunlukBrutCiro = gunlukKapasiteCiro + gunlukPaketCiro;
  const aylikBrutCiro = gunlukBrutCiro * g.aylikCalismaGunu;
  const yillikBrutCiro = aylikBrutCiro * 12;

  return {
    gunlukKapasiteCiro,
    gunlukPaketCiro,
    gunlukBrutCiro,
    aylikBrutCiro,
    yillikBrutCiro,
    dusukCiro: aylikBrutCiro * SENARYO.dusuk,
    bazCiro: aylikBrutCiro * SENARYO.baz,
    yuksekCiro: aylikBrutCiro * SENARYO.yuksek,
  };
}
