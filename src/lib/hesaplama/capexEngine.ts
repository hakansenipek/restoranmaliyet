import type { CapexGirdisi, CapexSonucu } from '@/types';

export function capexHesapla(g: CapexGirdisi): CapexSonucu {
  const insaatDekorasyon = g.m2 * g.m2BirimMaliyet;

  const mutfakEkipmanlari =
    g.paslanmazGrup + g.pisiriciGrup + g.sogutma + g.kahveMakinesi +
    g.ufakAletler + g.catalKasik + g.bardak + g.tabaklar + g.mutfakDiger;

  const mimariProje =
    g.devirUcreti + g.mimariHizmetBedeli + g.belediyeRuhsatBedeli +
    g.turizmBelgesiBedeli + g.dogalgazProjeBedeli + g.mimariDiger;

  const lisansRuhsat = g.belediyeRuhsatHarci + g.tapdk + g.lisansDiger;

  const acilisPazarlama = g.ilkReklamButcesi;

  const kiraDepozito = g.aylikKira * g.kiraDepozitoAy + g.emlakciKomisyonu;

  const ilkStok = g.ilkStok;

  const araToplamCapex =
    insaatDekorasyon + mutfakEkipmanlari + mimariProje +
    lisansRuhsat + acilisPazarlama + kiraDepozito + ilkStok;

  const gorulenmeyen = araToplamCapex * 0.10;
  const toplamCapex = araToplamCapex + gorulenmeyen;

  return {
    insaatDekorasyon,
    mutfakEkipmanlari,
    mimariProje,
    lisansRuhsat,
    acilisPazarlama,
    kiraDepozito,
    ilkStok,
    araToplamCapex,
    gorulenmeyen,
    toplamCapex,
  };
}
