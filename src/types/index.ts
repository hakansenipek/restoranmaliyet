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
  itfaiyeBelgesi: number;          // İtfaiye uygunluk belgesi
  muzikTelifLisans: number;        // Müzik telif lisans bedeli
  tabelaReklamVergisi: number;     // Tabela / reklam vergisi
  bacaBelgesi: number;             // Baca uygunluk belgesi
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
  yemekBedeli: number;             // Kişi başı günlük yemek bedeli (₺)
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
  hammaddeKdv1Pay: number;         // Hammadde alımlarının %1 KDV'li payı (0–1); kalan %10 KDV'li
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
    kapaliAlan: 0,
    acikAlan: 0,
    zeminDuvarInsaat: 0,
    elektrikTesisat: 0,
    suTesisat: 0,
    dogalgazTesisat: 0,
    camBedeli: 0,
    aydinlatma: 0,
    sesSistemi: 0,
    pergoleSemiye: 0,
    acikAlanIsitici: 0,
    klima: 0,
    kapaliMasaAdet: 0,
    kapaliMasaBirimFiyat: 0,
    acikMasaAdet: 0,
    acikMasaBirimFiyat: 0,
    kapaliSandalyeAdet: 0,
    kapaliSandalyeBirimFiyat: 0,
    acikSandalyeAdet: 0,
    acikSandalyeBirimFiyat: 0,
    paslanmazGrup: 0,
    pisiriciGrup: 0,
    sogutma: 0,
    endustriyelMakineler: 0,
    catalKasik: 0,
    bardak: 0,
    tabaklar: 0,
    mutfakDiger: 0,
    devirUcreti: 0,
    mimariHizmetBedeli: 0,
    belediyeRuhsatBedeli: 0,
    turizmBelgesiBedeli: 0,
    dogalgazProjeBedeli: 0,
    mimariDiger: 0,
    yazarKasaPos: 0,
    tapdk: 0,
    itfaiyeBelgesi: 0,
    muzikTelifLisans: 0,
    tabelaReklamVergisi: 0,
    bacaBelgesi: 0,
    lisansDiger: 0,
    sosyalMedyaReklam: 0,
    influencerBedeli: 0,
    billboardReklam: 0,
    elIlaniReklam: 0,
    aylikKira: 0,
    kiraSozlesmeTipi: 'bireysel',
    depozitoBedeli: 0,
    emlakciKomisyonu: 0,
    ilkStok: 0,
  },
  ciro: {
    kapaliAlanSandalyeSayisi: 0,
    acikAlanSandalyeSayisi: 0,
    sezon1: { ...VARSAYILAN_SEZON },
    sezon2: { ...VARSAYILAN_SEZON },
    sezon3: { ...VARSAYILAN_SEZON },
    aylikCalismaGunu: 0,
  },
  opex: {
    gidaMaliyetOrani: 0,
    personeller: [
      // Mutfak Operasyonu
      { unvan: 'Mutfak Şefi (Executive Chef)', adet: 0, netMaas: 0, grup: 'Mutfak Operasyonu' },
      { unvan: 'Sous Chef (Şef Yardımcısı)',   adet: 0, netMaas: 0 },
      { unvan: 'Kısım Şefi',                    adet: 0, netMaas: 0 },
      { unvan: 'Aşçı Yardımcısı',              adet: 0, netMaas: 0 },
      { unvan: 'Bulaşıkçı / Steward',          adet: 0, netMaas: 0 },
      // Salon ve Servis
      { unvan: 'İşletme Müdürü / Salon Şefi', adet: 0, netMaas: 0, grup: 'Salon ve Servis' },
      { unvan: 'Garson',                       adet: 0, netMaas: 0 },
      { unvan: 'Komi',                         adet: 0, netMaas: 0 },
      { unvan: 'Hostes / Karşılama',           adet: 0, netMaas: 0 },
      { unvan: 'Barista / Barmen',             adet: 0, netMaas: 0 },
      // Lojistik ve Tedarik
      { unvan: 'Şoför / Sevkiyat',    adet: 0, netMaas: 0, grup: 'Lojistik ve Tedarik' },
      { unvan: 'Depo Sorumlusu',      adet: 0, netMaas: 0 },
      { unvan: 'Saha Servis Elemanı', adet: 0, netMaas: 0 },
      // Yönetim ve İdari
      { unvan: 'Muhasebe / Finans Sorumlusu',  adet: 0, netMaas: 0, grup: 'Yönetim ve İdari' },
      { unvan: 'Satış ve Pazarlama Sorumlusu', adet: 0, netMaas: 0 },
      { unvan: 'Temizlik / Güvenlik',          adet: 0, netMaas: 0 },
    ],
    yemekBedeli: 0,
    elektrik: 0,
    su: 0,
    dogalgaz: 0,
    maliMusavir: 0,
    yazilimPos: 0,
    digerSabit: 0,
    sarfMalzemeOrani: 0,
    nakitPay: 0,
    kkPay: 0,
    yemekKartiPay: 0,
    onlinePay: 0,
  },
  pl: {
    kdvDusukPay: 0,
    hammaddeKdv1Pay: 0,
    kiraStopajOrani: 0.20,
    vergiTuru: 'gelir',
  },
};
