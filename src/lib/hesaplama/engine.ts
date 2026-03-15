import { HesaplamaGirdisi, HesaplamaSonucu, Senaryo } from '@/types';

export function hesapla(g: HesaplamaGirdisi): HesaplamaSonucu {
  const kdvYuksekPay  = 1 - g.kdvDusukPay;
  const kdvDusukBrut  = g.aylikCiro * g.kdvDusukPay;
  const kdvDusukNet   = kdvDusukBrut / (1 + g.kdvOranDusuk);
  const kdvYuksekBrut = g.aylikCiro * kdvYuksekPay;
  const kdvYuksekNet  = kdvYuksekBrut / (1 + g.kdvOranYuksek);
  const netSatis      = kdvDusukNet + kdvYuksekNet;
  const satisKdv      = g.aylikCiro - netSatis;

  const hammadde       = netSatis * g.hammaddeOrani;
  const hammaddeKdv    = hammadde * g.hammaddeKdvOrani;
  const kkKomisyon     = g.aylikCiro * g.kkKomisyonOrani;
  const digerDegisken  = g.aylikCiro * g.digerDegiskenOrani;
  const toplamDegisken = hammadde + kkKomisyon + digerDegisken;

  const toplamSabit        = g.personelGider + g.elektrikGider + g.kiraGider;
  const odenmesiGerekenKdv = satisKdv - hammaddeKdv;
  const faaliyetKari       = netSatis - toplamDegisken - toplamSabit;
  const karMarji           = netSatis > 0 ? faaliyetKari / netSatis : 0;

  const degiskenOran      = netSatis > 0 ? toplamDegisken / netSatis : 0;
  const netSatisCiroOrani = g.aylikCiro > 0 ? netSatis / g.aylikCiro : 0;
  const basaBasCiro =
    degiskenOran < 1 && netSatisCiroOrani > 0
      ? toplamSabit / ((1 - degiskenOran) * netSatisCiroOrani)
      : 0;

  return {
    kdvDusukBrut, kdvDusukNet, kdvYuksekBrut, kdvYuksekNet,
    netSatis, satisKdv,
    hammadde, hammaddeKdv, kkKomisyon, digerDegisken, toplamDegisken,
    personelGider: g.personelGider,
    elektrikGider: g.elektrikGider,
    kiraGider: g.kiraGider,
    toplamSabit,
    odenmesiGerekenKdv,
    faaliyetKari, karMarji,
    degiskenOran, netSatisCiroOrani,
    basaBasCiro, basaBasGunluk: basaBasCiro / 30,
  };
}

export function senaryolar(g: HesaplamaGirdisi): Senaryo[] {
  const liste: { etiket: Senaryo['etiket']; carpan: number }[] = [
    { etiket: 'Düşük',  carpan: 0.727 },
    { etiket: 'Baz',    carpan: 1.000 },
    { etiket: 'Yüksek', carpan: 1.248 },
  ];
  return liste.map(({ etiket, carpan }) => {
    const ciro = Math.round(g.aylikCiro * carpan);
    return { etiket, carpan, ciro, sonuc: hesapla({ ...g, aylikCiro: ciro }) };
  });
}

export const VARSAYILAN: HesaplamaGirdisi = {
  isletmeAdi: '',
  aylikCiro: 0,
  kdvOranDusuk: 0.10,
  kdvOranYuksek: 0.20,
  kdvDusukPay: 0.50,
  hammaddeOrani: 0.35,
  hammaddeKdvOrani: 0.01,
  kkKomisyonOrani: 0.02,
  digerDegiskenOrani: 0.015,
  personelGider: 0,
  elektrikGider: 0,
  kiraGider: 0,
  notlar: '',
};
