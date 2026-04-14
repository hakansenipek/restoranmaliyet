// ─── CAPEX ─────────────────────────────────────────────────────────────────

export interface CapexGirdisi {
  // İnşaat & Dekorasyon
  kapaliAlan: number;              // m²
  acikAlan: number;                // m²
  zeminDuvarInsaat: number;
  elektrikTesisat: number;
  suTesisat: number;
  dogalgazTesisat: number;
  camBedeli: number;
  aydinlatma: number;
  sesSistemi: number;
  pergoleSemiye: number;
  acikAlanIsitici: number;
  klima: number;
  kapaliMasaAdet: number;
  kapaliMasaBirimFiyat: number;
  acikMasaAdet: number;
  acikMasaBirimFiyat: number;
  kapaliSandalyeAdet: number;
  kapaliSandalyeBirimFiyat: number;
  acikSandalyeAdet: number;
  acikSandalyeBirimFiyat: number;
  // Mutfak ve Servis Ekipmanları
  paslanmazGrup: number;           // Tezgahlar, davlumbaz vb.
  pisiriciGrup: number;            // Fırın, ocak, fritöz vb.
  sogutma: number;                 // Buzdolabı, soğuk hava odası vb.
  endustriyelMakineler: number;    // Bulaşık, buz, kahve makinesi vb.
  catalKasik: number;              // Çatal/bıçak/kaşık
  bardak: number;
  tabaklar: number;
  mutfakDiger: number;
  // Mimari & Proje
  devirUcreti: number;
  mimariHizmetBedeli: number;
  belediyeRuhsatBedeli: number;
  turizmBelgesiBedeli: number;
  dogalgazProjeBedeli: number;
  mimariDiger: number;
  // Lisans & Ruhsat
  yazarKasaPos: number;            // Yazar kasa / POS programı
  tapdk: number;                   // TAPDK / alkol belgesi
  lisansDiger: number;
  // Açılış Pazarlaması
  sosyalMedyaReklam: number;
  influencerBedeli: number;
  billboardReklam: number;
  elIlaniReklam: number;
  // Kira & Depozito
  aylikKira: number;               // Aylık net kira
  kiraSozlesmeTipi: 'bireysel' | 'kurumsal';
  depozitoBedeli: number;
  emlakciKomisyonu: number;
  // İlk Stok
  ilkStok: number;
}

// ─── CİRO ──────────────────────────────────────────────────────────────────

export interface OgunGirdisi {
  aktif: boolean;
  dolulukOrani: number;            // 0–100
  kisiBasiHarcama: number;         // ₺
}

export interface CiroGirdisi {
  toplamSandalye: number;
  kahvalti: OgunGirdisi;
  ogle: OgunGirdisi;
  aksam: OgunGirdisi;
  paketSiparisSayisi: number;
  paketSiparisOrtalaması: number;  // ₺
  aylikCalismaGunu: number;        // 20–31
}

// ─── OPEX ──────────────────────────────────────────────────────────────────

export interface Personel {
  ad: string;
  netMaas: number;
  yolYemek: number;
}

export interface OpexGirdisi {
  gidaMaliyetOrani: number;        // 0.20–0.45 (ciro yüzdesi, kesirli)
  personeller: Personel[];
  kira: number;                    // Net kira ₺/ay
  elektrik: number;
  su: number;
  dogalgaz: number;
  muhasebe: number;
  yazilimPos: number;
  digerSabit: number;
  sarfMalzemeOrani: number;        // Ciro %'si (kesirli, örn 0.03)
  nakitPay: number;                // % (0–100)
  kkPay: number;                   // % (0–100)
  yemekKartiPay: number;           // % (0–100)
  onlinePay: number;               // % (0–100)
}

// ─── P&L ───────────────────────────────────────────────────────────────────

export interface PlGirdisi {
  kdvDusukPay: number;             // %10 KDV'li ürünlerin ciro payı (0–1)
  hammaddeKdvOrani: number;        // 0.01 veya 0.10
  kiraStopajOrani: number;         // Varsayılan 0.20
  vergiTuru: 'gelir' | 'kurumlar';
}

// ─── FORM DURUMU ───────────────────────────────────────────────────────────

export interface FormDurumu {
  isletmeAdi: string;
  capex: CapexGirdisi;
  ciro: CiroGirdisi;
  opex: OpexGirdisi;
  pl: PlGirdisi;
}

// ─── SONUÇLAR ──────────────────────────────────────────────────────────────

export interface CapexSonucu {
  insaatDekorasyon: number;
  mutfakEkipmanlari: number;
  mimariProje: number;
  lisansRuhsat: number;
  acilisPazarlama: number;
  kiraDepozito: number;
  ilkStok: number;
  araToplamCapex: number;
  gorulenmeyen: number;
  toplamCapex: number;
}

export interface CiroSonucu {
  gunlukKapasiteCiro: number;
  gunlukPaketCiro: number;
  gunlukBrutCiro: number;
  aylikBrutCiro: number;
  yillikBrutCiro: number;
  dusukCiro: number;
  bazCiro: number;
  yuksekCiro: number;
}

export interface OpexSonucu {
  gidaMaliyeti: number;
  personelToplamMaliyet: number;
  toplamSabitGider: number;
  sarfMalzeme: number;
  odemeKomisyonu: number;
  toplamOpex: number;
}

export interface PlSonucu {
  netSatis: number;
  tahsilEdilenKdv: number;
  odenenKdv: number;
  odenmesiGerekenKdv: number;
  kiraStopaj: number;
  brutKar: number;
  tahminiVergi: number;
  netAylikKar: number;
  netKarMarji: number;
}

export interface RoiSonucu {
  degiskenGiderOrani: number;
  katkilaMarji: number;
  basaBasAylikCiro: number;
  basaBasGunlukCiro: number;
  roiAy: number | null;
  aylikKumulatifData: { ay: number; kar: number }[];
}

export interface HesaplamaSonucu {
  capex: CapexSonucu;
  ciro: CiroSonucu;
  opex: OpexSonucu;
  pl: PlSonucu;
  roi: RoiSonucu;
}

// ─── VARSAYILANLAR ─────────────────────────────────────────────────────────

export const FORM_VARSAYILAN: FormDurumu = {
  isletmeAdi: '',
  capex: {
    kapaliAlan: 100,
    acikAlan: 50,
    zeminDuvarInsaat: 300000,
    elektrikTesisat: 80000,
    suTesisat: 30000,
    dogalgazTesisat: 40000,
    camBedeli: 50000,
    aydinlatma: 40000,
    sesSistemi: 20000,
    pergoleSemiye: 0,
    acikAlanIsitici: 0,
    klima: 0,
    kapaliMasaAdet: 15,
    kapaliMasaBirimFiyat: 5000,
    acikMasaAdet: 8,
    acikMasaBirimFiyat: 3000,
    kapaliSandalyeAdet: 60,
    kapaliSandalyeBirimFiyat: 1500,
    acikSandalyeAdet: 32,
    acikSandalyeBirimFiyat: 1000,
    paslanmazGrup: 80000,
    pisiriciGrup: 60000,
    sogutma: 40000,
    endustriyelMakineler: 40000,
    catalKasik: 10000,
    bardak: 8000,
    tabaklar: 12000,
    mutfakDiger: 0,
    devirUcreti: 0,
    mimariHizmetBedeli: 30000,
    belediyeRuhsatBedeli: 20000,
    turizmBelgesiBedeli: 0,
    dogalgazProjeBedeli: 15000,
    mimariDiger: 0,
    yazarKasaPos: 15000,
    tapdk: 10000,
    lisansDiger: 0,
    sosyalMedyaReklam: 15000,
    influencerBedeli: 0,
    billboardReklam: 0,
    elIlaniReklam: 0,
    aylikKira: 50000,
    kiraSozlesmeTipi: 'bireysel',
    depozitoBedeli: 150000,
    emlakciKomisyonu: 50000,
    ilkStok: 30000,
  },
  ciro: {
    toplamSandalye: 60,
    kahvalti: { aktif: false, dolulukOrani: 50, kisiBasiHarcama: 150 },
    ogle: { aktif: true, dolulukOrani: 70, kisiBasiHarcama: 200 },
    aksam: { aktif: true, dolulukOrani: 60, kisiBasiHarcama: 350 },
    paketSiparisSayisi: 20,
    paketSiparisOrtalaması: 200,
    aylikCalismaGunu: 26,
  },
  opex: {
    gidaMaliyetOrani: 0.32,
    personeller: [
      { ad: 'Aşçıbaşı', netMaas: 25000, yolYemek: 1500 },
      { ad: 'Garson', netMaas: 18000, yolYemek: 1500 },
      { ad: 'Kasiyer', netMaas: 18000, yolYemek: 1500 },
    ],
    kira: 50000,
    elektrik: 8000,
    su: 2000,
    dogalgaz: 5000,
    muhasebe: 3000,
    yazilimPos: 1500,
    digerSabit: 2000,
    sarfMalzemeOrani: 0.03,
    nakitPay: 30,
    kkPay: 50,
    yemekKartiPay: 10,
    onlinePay: 10,
  },
  pl: {
    kdvDusukPay: 0.80,
    hammaddeKdvOrani: 0.10,
    kiraStopajOrani: 0.20,
    vergiTuru: 'gelir',
  },
};
