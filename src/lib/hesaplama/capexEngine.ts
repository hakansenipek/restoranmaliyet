import type { CapexGirdisi, CapexSonucu } from '@/types';

function n(v: number | undefined): number { return v || 0; }

export function capexHesapla(g: CapexGirdisi): CapexSonucu {
  const insaatDekorasyon =
    n(g.zeminDuvarInsaat) + n(g.elektrikTesisat) + n(g.suTesisat) + n(g.dogalgazTesisat) +
    n(g.camBedeli) + n(g.aydinlatma) + n(g.sesSistemi) +
    n(g.pergoleSemiye) + n(g.acikAlanIsitici) + n(g.klima) +
    n(g.kapaliMasaAdet) * n(g.kapaliMasaBirimFiyat) +
    n(g.acikMasaAdet) * n(g.acikMasaBirimFiyat) +
    n(g.kapaliSandalyeAdet) * n(g.kapaliSandalyeBirimFiyat) +
    n(g.acikSandalyeAdet) * n(g.acikSandalyeBirimFiyat);

  const mutfakEkipmanlari =
    n(g.paslanmazGrup) + n(g.pisiriciGrup) + n(g.sogutma) + n(g.endustriyelMakineler) +
    n(g.catalKasik) + n(g.bardak) + n(g.tabaklar) + n(g.mutfakDiger);

  const mimariProje =
    n(g.devirUcreti) + n(g.mimariHizmetBedeli) + n(g.belediyeRuhsatBedeli) +
    n(g.turizmBelgesiBedeli) + n(g.dogalgazProjeBedeli) + n(g.mimariDiger);

  const lisansRuhsat = n(g.yazarKasaPos) + n(g.tapdk) + n(g.lisansDiger);

  const acilisPazarlama =
    n(g.sosyalMedyaReklam) + n(g.influencerBedeli) +
    n(g.billboardReklam) + n(g.elIlaniReklam);

  const kiraDepozito = n(g.depozitoBedeli) + n(g.emlakciKomisyonu);

  const ilkStok = n(g.ilkStok);

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
