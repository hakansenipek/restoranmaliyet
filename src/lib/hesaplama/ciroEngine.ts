import type { CiroGirdisi, CiroSonucu, SezonVerisi } from '@/types';

export const SENARYO = { dusuk: 0.70, baz: 1.00, yuksek: 1.30 } as const;

function sezonGunlukKapasite(s: SezonVerisi): number {
  return (s.sabahKisi || 0) * (s.sabahHarcama || 0)
    + (s.ogleKisi || 0) * (s.ogleHarcama || 0)
    + (s.aksamKisi || 0) * (s.aksamHarcama || 0);
}

export function ciroHesapla(g: CiroGirdisi): CiroSonucu {
  const gun = g.aylikCalismaGunu || 26;

  // Her sezonun yıllık katkısı: günlük kapasite × çalışma günü × ay sayısı
  const s1Yillik = sezonGunlukKapasite(g.sezon1) * gun * (g.sezon1.aylar?.length || 0);
  const s2Yillik = sezonGunlukKapasite(g.sezon2) * gun * (g.sezon2.aylar?.length || 0);
  const s3Yillik = sezonGunlukKapasite(g.sezon3) * gun * (g.sezon3.aylar?.length || 0);

  const yillikKapasiteCiro = s1Yillik + s2Yillik + s3Yillik;

  const gunlukPaketCiro = (g.paketSiparisSayisi || 0) * (g.paketSiparisOrtalaması || 0);
  const yillikPaketCiro = gunlukPaketCiro * gun * 12;

  const yillikBrutCiro = yillikKapasiteCiro + yillikPaketCiro;
  const aylikBrutCiro = yillikBrutCiro / 12;
  const gunlukBrutCiro = aylikBrutCiro / gun;
  const gunlukKapasiteCiro = yillikKapasiteCiro / 12 / gun;

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
