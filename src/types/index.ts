// ─── CAPEX ─────────────────────────────────────────────────────────────────

export interface CapexGirdisi {
  // İnşaat & Dekorasyon
  m2: number;
  m2BirimMaliyet: number;          // 2.000–15.000 ₺/m²
  // Mutfak Ekipmanları
  paslanmazGrup: number;
  pisiriciGrup: number;
  sogutma: number;
  kahveMakinesi: number;
  ufakAletler: number;
  catalKasik: number;              // Çatal/bıçak/kaşık
  bardak: number;
  tabaklar: number;
  mutfakDiger: number;
  // Mimari & Proje
  konseptTasarim: number;
  belediyeRuhsatProjesi: number;
  dogalgazElektrikProjesi: number;
  itfaiyeProjesi: number;
  mimariDiger: number;
  // Lisans & Ruhsat
  belediyeRuhsatHarci: number;
  tapdk: number;                   // TAPDK / alkol belgesi
  lisansDiger: number;
  // Açılış Pazarlaması
  ilkReklamButcesi: number;
  // Kira & Depozito
  kiraDepozitoAy: number;          // Kaç ay depozito
  aylikKira: number;               // Aylık kira (depozito hesabı için)
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
    m2: 150,
    m2BirimMaliyet: 5000,
    paslanmazGrup: 80000,
    pisiriciGrup: 60000,
    sogutma: 40000,
    kahveMakinesi: 25000,
    ufakAletler: 15000,
    catalKasik: 10000,
    bardak: 8000,
    tabaklar: 12000,
    mutfakDiger: 0,
    konseptTasarim: 30000,
    belediyeRuhsatProjesi: 20000,
    dogalgazElektrikProjesi: 15000,
    itfaiyeProjesi: 10000,
    mimariDiger: 0,
    belediyeRuhsatHarci: 15000,
    tapdk: 10000,
    lisansDiger: 0,
    ilkReklamButcesi: 30000,
    kiraDepozitoAy: 3,
    aylikKira: 50000,
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
