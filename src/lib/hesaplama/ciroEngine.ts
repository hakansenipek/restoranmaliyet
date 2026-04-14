import type { CiroGirdisi, CiroSonucu, SezonVerisi } from '@/types';
import { VARSAYILAN_SEZON } from '@/types';

export const SENARYO = { dusuk: 0.70, baz: 1.00, yuksek: 1.30 } as const;

const HAFTA_ICI_GUN = 22;   // Ayda ortalama hafta içi günü
const HAFTA_SONU_GUN = 8;   // Ayda ortalama hafta sonu günü

function sezonHaftaIciGunluk(s: SezonVerisi): number {
  return (s.haftaIciSabahKisi || 0) * (s.haftaIciSabahHarcama || 0)
    + (s.haftaIciOgleKisi || 0) * (s.haftaIciOgleHarcama || 0)
    + (s.haftaIciAksamKisi || 0) * (s.haftaIciAksamHarcama || 0);
}

function sezonHaftaSonuGunluk(s: SezonVerisi): number {
  return (s.haftaSonuSabahKisi || 0) * (s.haftaSonuSabahHarcama || 0)
    + (s.haftaSonuOgleKisi || 0) * (s.haftaSonuOgleHarcama || 0)
    + (s.haftaSonuAksamKisi || 0) * (s.haftaSonuAksamHarcama || 0);
}

function sezonAylikOgun(s: SezonVerisi): number {
  return sezonHaftaIciGunluk(s) * HAFTA_ICI_GUN
    + sezonHaftaSonuGunluk(s) * HAFTA_SONU_GUN;
}

function sezonAylikPaket(s: SezonVerisi): number {
  return (s.paketAdet || 0) * (s.paketTutar || 0) * 30;
}

export function ciroHesapla(g: CiroGirdisi): CiroSonucu {
  const s1 = g.sezon1 ?? VARSAYILAN_SEZON;
  const s2 = g.sezon2 ?? VARSAYILAN_SEZON;
  const s3 = g.sezon3 ?? VARSAYILAN_SEZON;

  // Her sezonun yıllık katkısı: (aylık öğün + aylık paket) × ay sayısı
  const s1Yillik = (sezonAylikOgun(s1) + sezonAylikPaket(s1)) * (s1.aylar?.length || 0);
  const s2Yillik = (sezonAylikOgun(s2) + sezonAylikPaket(s2)) * (s2.aylar?.length || 0);
  const s3Yillik = (sezonAylikOgun(s3) + sezonAylikPaket(s3)) * (s3.aylar?.length || 0);

  const yillikBrutCiro = s1Yillik + s2Yillik + s3Yillik;
  const aylikBrutCiro = yillikBrutCiro / 12;
  const gunlukBrutCiro = aylikBrutCiro / 30;

  // Günlük paket: ağırlıklı ortalama
  const toplamAy = (s1.aylar?.length || 0) + (s2.aylar?.length || 0) + (s3.aylar?.length || 0);
  const yillikPaket = sezonAylikPaket(s1) * (s1.aylar?.length || 0)
    + sezonAylikPaket(s2) * (s2.aylar?.length || 0)
    + sezonAylikPaket(s3) * (s3.aylar?.length || 0);
  const gunlukPaketCiro = toplamAy > 0 ? (yillikPaket / toplamAy) / 30 : 0;
  const gunlukKapasiteCiro = gunlukBrutCiro - gunlukPaketCiro;

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
