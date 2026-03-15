// ─── 1. YATIRIM MALİYETİ (CAPEX) ───────────────────────────────────────────

export interface CapexMimari {
  konseptTasarim: number;
  belediyeRuhsatProjesi: number;
  dogalgazElektrikProjesi: number;
  diger: number;
}

export interface CapexMutfak {
  // Paslanmaz grup
  tezgahEvyeRaf: number;
  davlumbaz: number;
  // Ana ekipmanlar
  firin: number;
  ocaklar: number;
  fritoz: number;
  bulasikmakine: number;
  buzMakine: number;
  // Soğutma
  dikBuzdolabi: number;
  tezgahAltiDolap: number;
  derinDondurucular: number;
  sogukHavaDeposu: number;
  // Hazırlık ve küçük cihazlar
  mikserBlender: number;
  teraziVakum: number;
  dilimlemeMakine: number;
  // Servis takımları
  porselen: number;
  camEsyasi: number;
  catalkasik: number;
  diger: number;
}

export interface CapexDekorasyon {
  masaSandalye: number;
  elektrikAydinlatma: number;
  boyaIsleri: number;
  wc: number;
  isiticilar: number;
  pergoleSemsiye: number;
  acilisTemizligi: number;
  diger: number;
}

export interface CapexTeknoloji {
  posYazilim: number;
  posTerminal: number;
  adisyonYazici: number;
  kameraDvr: number;
  alarmYangın: number;
  muzikSistemi: number;
  diger: number;
}

export interface CapexResmi {
  belediyeRuhsatHarci: number;
  tapdkAlkolBedeli: number;
  emlakcıKomisyonu: number;
  kiraDepozitosu: number;
  ilkStokMaliyeti: number;
  diger: number;
}

export interface CapexGirdisi {
  mimari: CapexMimari;
  mutfak: CapexMutfak;
  dekorasyon: CapexDekorasyon;
  teknoloji: CapexTeknoloji;
  resmi: CapexResmi;
}

// ─── 2. MEKAN VE OPERASYONEL DETAYLAR ──────────────────────────────────────

export interface MekanGirdisi {
  toplamMetrekare: number;
  mutfakMetrekare: number;
  depoMetrekare: number;
  kapaliMasa: number;
  kapaliSandalye: number;
  acikMasa: number;
  acikSandalye: number;
  // Haftalık çalışma günleri (true = açık)
  calismaGunleri: {
    pazartesi: boolean;
    sali: boolean;
    carsamba: boolean;
    persembe: boolean;
    cuma: boolean;
    cumartesi: boolean;
    pazar: boolean;
  };
}

// ─── 3. PERSONEL VE İK ──────────────────────────────────────────────────────

export interface PersonelKalem {
  pozisyon: string;
  adet: number;
  netMaas: number;
  isverenMaliyet: number; // Otomatik: netMaas * 1.575 (ortalama)
  yolYemek: number;
  prim: number;
}

export interface PersonelGruplar {
  yonetim: PersonelKalem[]; // Müdür, Muhasebe, Pazarlama
  mutfak: PersonelKalem[]; // Şef, Yardımcı, Kısım, Hazırlık, Bulaşıkçı
  salon: PersonelKalem[]; // Salon Şef, Garson, Komi, Hostes, Barista, Barmen
  destek: PersonelKalem[]; // Temizlik, Güvenlik, Vale, Kurye
}

export interface PersonelGirdisi {
  gruplar: PersonelGruplar;
  personelKiyafetMaliyeti: number;
}

// ─── 4. GELİR PROJEKSİYONU ──────────────────────────────────────────────────

export interface OgunProjeksiyon {
  aktif: boolean;
  kisiBasiHarcama: number; // Check average (₺)
  gunlukKisiSayisi: number;
}

export interface OdemeTipi {
  nakitPay: number; // 0-1 arası (örn. 0.20)
  krediKartiPay: number; // Komisyon: %2
  yemekKartiPay: number; // Komisyon: %10
  onlinePlatformPay: number; // Komisyon: %20
}

export interface GelirGirdisi {
  sabah: OgunProjeksiyon;
  ogle: OgunProjeksiyon;
  aksam: OgunProjeksiyon;
  odemeTipleri: OdemeTipi;
  // Haftalık doluluk çarpanı (gün bazında, 0-1 arası)
  dolulukCarpanlari: {
    pazartesi: number;
    sali: number;
    carsamba: number;
    persembe: number;
    cuma: number;
    cumartesi: number;
    pazar: number;
  };
}

// ─── 5. GENEL GİDERLER (AYLIK SABİT) ────────────────────────────────────────

export interface GenelGiderGirdisi {
  netKira: number;
  kiraStopajOrani: number; // Varsayılan: 0.20
  elektrik: number;
  su: number;
  dogalgazLpg: number;
  internet: number;
  telefon: number;
  posMalzeme: number; // Rulo vb.
  bakimOnarim: number;
  klimaBakim: number;
  hasereIlaclama: number;
  aidat: number; // AVM/site aidatı
}

// ─── 6. DEĞİŞKEN GİDERLER (SMM) ─────────────────────────────────────────────

export interface DegiskenGiderGirdisi {
  yiyecekMaliyetOrani: number; // Hedef: 0.28-0.35
  icecekMaliyetOrani: number; // Hedef: 0.20-0.30
  fireZayiatOrani: number; // Hedef: 0.03-0.05
  sarfMalzemeOrani: number; // Ambalaj, peçete vb. — ciro %'si
}

// ─── ANA FİZİBİLİTE GİRDİSİ ─────────────────────────────────────────────────

export interface FizibiliteGirdisi {
  isletmeAdi: string;
  capex: CapexGirdisi;
  mekan: MekanGirdisi;
  personel: PersonelGirdisi;
  gelir: GelirGirdisi;
  genelGider: GenelGiderGirdisi;
  degiskenGider: DegiskenGiderGirdisi;
}

// ─── FİZİBİLİTE SONUCU ──────────────────────────────────────────────────────

export interface FizibiliteSonucu {
  // Yatırım
  toplamCapex: number;
  capexKategoriDetay: Record<string, number>;

  // Gelir
  tahminiAylikBrutCiro: number;
  odemeKomisyonGideri: number;
  netCiro: number;

  // Giderler
  toplamPersonelMaliyet: number;
  personelCiroOrani: number; // Uyarı: > 0.30
  toplamSMMGider: number;
  smmOrani: number;
  toplamGenelGider: number;
  toplamAylikGider: number;

  // Kârlılık
  faaliyetKari: number;
  netKarMarji: number;

  // Başabaş & ROI
  basaBasAylikCiro: number;
  basaBasGunlukCiro: number;
  roiAy: number; // Capex / Aylık net kâr

  // Uyarılar
  uyarilar: FizibiliteUyari[];
}

export interface FizibiliteUyari {
  seviye: 'bilgi' | 'uyari' | 'kritik';
  mesaj: string;
}
