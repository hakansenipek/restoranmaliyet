export interface HesaplamaGirdisi {
  isletmeAdi?: string;
  aylikCiro: number;
  kdvOranDusuk: number;
  kdvOranYuksek: number;
  kdvDusukPay: number;
  hammaddeOrani: number;
  hammaddeKdvOrani: number;
  kkKomisyonOrani: number;
  digerDegiskenOrani: number;
  personelGider: number;
  elektrikGider: number;
  kiraGider: number;
  notlar?: string;
}

export interface HesaplamaSonucu {
  kdvDusukBrut: number;
  kdvDusukNet: number;
  kdvYuksekBrut: number;
  kdvYuksekNet: number;
  netSatis: number;
  satisKdv: number;
  hammadde: number;
  hammaddeKdv: number;
  kkKomisyon: number;
  digerDegisken: number;
  toplamDegisken: number;
  personelGider: number;
  elektrikGider: number;
  kiraGider: number;
  toplamSabit: number;
  odenmesiGerekenKdv: number;
  faaliyetKari: number;
  karMarji: number;
  degiskenOran: number;
  netSatisCiroOrani: number;
  basaBasCiro: number;
  basaBasGunluk: number;
}

export interface Senaryo {
  etiket: 'Düşük' | 'Baz' | 'Yüksek';
  carpan: number;
  ciro: number;
  sonuc: HesaplamaSonucu;
}
