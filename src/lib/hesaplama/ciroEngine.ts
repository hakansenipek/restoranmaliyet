import type { CiroGirdisi, CiroSonucu, SezonVerisi } from '@/types';
import { VARSAYILAN_SEZON } from '@/types';

export const SENARYO = { dusuk: 0.70, baz: 1.00, yuksek: 1.30 } as const;

function sezonGunlukKapasite(s: SezonVerisi): number {
  return (s.sabahKisi || 0) * (s.sabahHarcama || 0)
    + (s.ogleKisi || 0) * (s.ogleHarcama || 0)
    + (s.aksamKisi || 0) * (s.aksamHarcama || 0);
}

export function ciroHesapla(g: CiroGirdisi): CiroSonucu {
  const gun = g.aylikCalismaGunu || 26;

  const s1 = g.sezon1 ?? VARSAYILAN_SEZON;
  const s2 = g.sezon2 ?? VARSAYILAN_SEZON;
  const s3 = g.sezon3 ?? VARSAYILAN_SEZON;

  const s1Yillik = sezonGunlukKapasite(s1) * gun * (s1.aylar?.length || 0);
  const s2Yillik = sezonGunlukKapasite(s2) * gun * (s2.aylar?.length || 0);
  const s3Yillik = sezonGunlukKapasite(s3) * gun * (s3.aylar?.length || 0);

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
