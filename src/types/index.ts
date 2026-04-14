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

export interface SezonVerisi {
  aylar: string[];          // Seçili ay isimleri
  // Hafta içi (Pzt–Cum, ~22 gün/ay)
  haftaIciSabahKisi: number;
  haftaIciSabahHarcama: number;
  haftaIciOgleKisi: number;
  haftaIciOgleHarcama: number;
  haftaIciAksamKisi: number;
  haftaIciAksamHarcama: number;
  // Hafta sonu (Cmt–Paz, ~8 gün/ay)
  haftaSonuSabahKisi: number;
  haftaSonuSabahHarcama: number;
  haftaSonuOgleKisi: number;
  haftaSonuOgleHarcama: number;
  haftaSonuAksamKisi: number;
  haftaSonuAksamHarcama: number;
  paketAdet: number;        // Günlük paket servis adedi
  paketTutar: number;       // Kişi başı ortalama tutar (₺)
}

export const VARSAYILAN_SEZON: SezonVerisi = {
  aylar: [],
  haftaIciSabahKisi: 0,
  haftaIciSabahHarcama: 0,
  haftaIciOgleKisi: 0,
  haftaIciOgleHarcama: 0,
  haftaIciAksamKisi: 0,
  haftaIciAksamHarcama: 0,
  haftaSonuSabahKisi: 0,
  haftaSonuSabahHarcama: 0,
  haftaSonuOgleKisi: 0,
  haftaSonuOgleHarcama: 0,
  haftaSonuAksamKisi: 0,
  haftaSonuAksamHarcama: 0,
  paketAdet: 0,
  paketTutar: 0,
};

export interface CiroGirdisi {
  kapaliAlanSandalyeSayisi: number;
  acikAlanSandalyeSayisi: number;
  sezon1: SezonVerisi;
  sezon2: SezonVerisi;
  sezon3: SezonVerisi;
  aylikCalismaGunu: number;        // 20–31
}

// ─── OPEX ──────────────────────────────────────────────────────────────────

export interface Personel {
  unvan: string;
  adet: number;    // Kaç kişi
  netMaas: number; // Kişi başı net maaş
  grup?: string;   // Grup başlığı — sadece UI gösterimi için
}

export interface OpexGirdisi {
  gidaMaliyetOrani: number;        // 0.20–0.45 (ciro yüzdesi, kesirli)
  personeller: Personel[];
  yemekBedeli: number;             // Kişi başı aylık yemek bedeli (₺)
  elektrik: number;
  su: number;
  dogalgaz: number;
  maliMusavir: number;
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
  yemekBedeliToplam: number;
  sgkIsverenToplam: number;
  toplamPersonelSayisi: number;
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
    kapaliAlanSandalyeSayisi: 40,
    acikAlanSandalyeSayisi: 20,
    sezon1: {
      aylar: ['Haziran', 'Temmuz', 'Ağustos'],
      haftaIciSabahKisi: 0, haftaIciSabahHarcama: 0,
      haftaIciOgleKisi: 40, haftaIciOgleHarcama: 250,
      haftaIciAksamKisi: 60, haftaIciAksamHarcama: 400,
      haftaSonuSabahKisi: 0, haftaSonuSabahHarcama: 0,
      haftaSonuOgleKisi: 50, haftaSonuOgleHarcama: 270,
      haftaSonuAksamKisi: 80, haftaSonuAksamHarcama: 450,
      paketAdet: 20, paketTutar: 200,
    },
    sezon2: {
      aylar: ['Mart', 'Nisan', 'Mayıs', 'Eylül', 'Ekim'],
      haftaIciSabahKisi: 0, haftaIciSabahHarcama: 0,
      haftaIciOgleKisi: 35, haftaIciOgleHarcama: 220,
      haftaIciAksamKisi: 50, haftaIciAksamHarcama: 350,
      haftaSonuSabahKisi: 0, haftaSonuSabahHarcama: 0,
      haftaSonuOgleKisi: 45, haftaSonuOgleHarcama: 240,
      haftaSonuAksamKisi: 65, haftaSonuAksamHarcama: 400,
      paketAdet: 15, paketTutar: 180,
    },
    sezon3: {
      aylar: ['Ocak', 'Şubat', 'Kasım', 'Aralık'],
      haftaIciSabahKisi: 0, haftaIciSabahHarcama: 0,
      haftaIciOgleKisi: 25, haftaIciOgleHarcama: 200,
      haftaIciAksamKisi: 40, haftaIciAksamHarcama: 300,
      haftaSonuSabahKisi: 0, haftaSonuSabahHarcama: 0,
      haftaSonuOgleKisi: 35, haftaSonuOgleHarcama: 220,
      haftaSonuAksamKisi: 55, haftaSonuAksamHarcama: 350,
      paketAdet: 10, paketTutar: 160,
    },
    aylikCalismaGunu: 26,
  },
  opex: {
    gidaMaliyetOrani: 0.32,
    personeller: [
      // Mutfak Operasyonu
      { unvan: 'Mutfak Şefi (Executive Chef)', adet: 0, netMaas: 35000, grup: 'Mutfak Operasyonu' },
      { unvan: 'Sous Chef (Şef Yardımcısı)',   adet: 0, netMaas: 25000 },
      { unvan: 'Kısım Şefi (Demirbaş Aşçı)',   adet: 0, netMaas: 20000 },
      { unvan: 'Aşçı Yardımcısı',              adet: 0, netMaas: 15000 },
      { unvan: 'Bulaşıkçı / Steward',          adet: 0, netMaas: 13000 },
      // Salon ve Servis
      { unvan: 'İşletme Müdürü / Salon Şefi', adet: 0, netMaas: 30000, grup: 'Salon ve Servis' },
      { unvan: 'Garson',                       adet: 0, netMaas: 15000 },
      { unvan: 'Komi',                         adet: 0, netMaas: 13000 },
      { unvan: 'Hostes / Karşılama',           adet: 0, netMaas: 14000 },
      { unvan: 'Barista / Barmen',             adet: 0, netMaas: 16000 },
      // Lojistik ve Tedarik
      { unvan: 'Şoför / Sevkiyat',    adet: 0, netMaas: 14000, grup: 'Lojistik ve Tedarik' },
      { unvan: 'Depo Sorumlusu',      adet: 0, netMaas: 15000 },
      { unvan: 'Saha Servis Elemanı', adet: 0, netMaas: 13000 },
      // Yönetim ve İdari
      { unvan: 'Muhasebe / Finans Sorumlusu',  adet: 0, netMaas: 20000, grup: 'Yönetim ve İdari' },
      { unvan: 'Satış ve Pazarlama Sorumlusu', adet: 0, netMaas: 18000 },
      { unvan: 'Temizlik / Güvenlik',          adet: 0, netMaas: 13000 },
    ],
    yemekBedeli: 0,
    elektrik: 8000,
    su: 2000,
    dogalgaz: 5000,
    maliMusavir: 3000,
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
