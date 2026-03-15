# CLAUDE.md — Restoran Maliyet Hesaplama Aracı

Bu dosya Claude Code session'larında projenin tam bağlamını sağlar.
**Her session başında bu dosyayı oku, sonra göreve geç.**

---

## 1. Proje Özeti

- **Repo:** `hakansenipek/restoranmaliyet`
- **Deploy:** Vercel
- **Amaç:** Restoran/kafeterya açmayı planlayan kullanıcıların ciro, KDV, gider, başa baş noktası ve faaliyet kârı öngörülerini anlık hesaplamasını sağlayan tek sayfalık web uygulaması. Ek olarak: yatırım fizibilitesi, personel maliyeti ve gelir projeksiyonu modülleri.
- **Auth:** YOK — herkese açık
- **Veritabanı:** YOK — Supabase kaldırıldı

---

## 2. Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Dil | TypeScript (strict) |
| Stil | Tailwind CSS |
| Export | `xlsx` + `jspdf` + `jspdf-autotable` |
| Paket Yöneticisi | npm |

---

## 3. Klasör Yapısı

```
restoranmaliyet/
├── CLAUDE.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx              ← Ana sayfa (tek sayfa, 'use client')
    │   └── globals.css
    │
    ├── components/
    │   ├── GirdiFormu.tsx        ← 3 bölümlü input formu (aylık operasyon)
    │   ├── SonucPaneli.tsx       ← Canlı hesaplama sonuçları
    │   ├── SenaryoTablosu.tsx    ← Düşük / Baz / Yüksek karşılaştırma
    │   ├── IndirButonlari.tsx    ← Excel + PDF indirme butonları
    │   │
    │   ├── fizibilite/           ← YENİ MODÜL
    │   │   ├── FizibiliteFormu.tsx       ← Tüm sekmeleri barındıran ana form
    │   │   ├── CapexFormu.tsx            ← Yatırım maliyeti girişleri
    │   │   ├── MekanFormu.tsx            ← Alan, kapasite, operasyon günleri
    │   │   ├── PersonelFormu.tsx         ← Kadro yapısı ve maliyet hesabı
    │   │   ├── GelirFormu.tsx            ← Öğün bazlı gelir projeksiyonu
    │   │   ├── GenelGiderFormu.tsx       ← Aylık sabit giderler
    │   │   ├── DegiskenGiderFormu.tsx    ← SMM oranları ve sarf malzeme
    │   │   └── FizibiliteSonuc.tsx       ← Başabaş, ROI, kâr marjı, uyarılar
    │   │
    │   └── ui/
    │       ├── Card.tsx
    │       ├── InputField.tsx
    │       └── SonucSatiri.tsx
    │
    ├── lib/
    │   ├── hesaplama/
    │   │   ├── engine.ts             ← Aylık operasyon hesaplama motoru
    │   │   └── fizibiliteEngine.ts   ← YENİ: Fizibilite hesaplama motoru
    │   └── export/
    │       └── index.ts              ← excelIndir() + pdfIndir() + fizibiliteExport()
    │
    └── types/
        ├── index.ts                  ← Mevcut tipler
        └── fizibilite.ts             ← YENİ: Fizibilite tipleri
```

---

## 4. TypeScript Tipleri

### Mevcut (`src/types/index.ts`)

```typescript
export interface HesaplamaGirdisi {
  isletmeAdi?: string;
  aylikCiro: number;
  kdvOranDusuk: number;        // 0.10
  kdvOranYuksek: number;       // 0.20
  kdvDusukPay: number;         // 0.50
  hammaddeOrani: number;       // 0.35 — net satış üzeri
  hammaddeKdvOrani: number;    // 0.01
  kkKomisyonOrani: number;     // 0.02 — brüt ciro üzeri
  digerDegiskenOrani: number;  // 0.015 — brüt ciro üzeri
  personelGider: number;
  elektrikGider: number;
  kiraGider: number;
  notlar?: string;
}

export interface HesaplamaSonucu {
  kdvDusukBrut: number;   kdvDusukNet: number;
  kdvYuksekBrut: number;  kdvYuksekNet: number;
  netSatis: number;       satisKdv: number;
  hammadde: number;       hammaddeKdv: number;
  kkKomisyon: number;     digerDegisken: number;
  toplamDegisken: number;
  personelGider: number;  elektrikGider: number;
  kiraGider: number;      toplamSabit: number;
  odenmesiGerekenKdv: number;
  faaliyetKari: number;   karMarji: number;
  degiskenOran: number;   netSatisCiroOrani: number;
  basaBasCiro: number;    basaBasGunluk: number;
}

export interface Senaryo {
  etiket: 'Düşük' | 'Baz' | 'Yüksek';
  carpan: number;
  ciro: number;
  sonuc: HesaplamaSonucu;
}
```

### Yeni Fizibilite Tipleri (`src/types/fizibilite.ts`)

```typescript
// ─── 1. YATIRIM MALİYETİ (CAPEX) ───────────────────────────────────────────

export interface CapexMimari {
  konseptTasarim: number;
  belediyeRuhsatProjesi: number;
  dogalgazElektrikProjesi: number;
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
}

export interface CapexDekorasyon {
  zeminDuvar: number;
  mobilya: number;
  aydinlatma: number;
  disAlan: number;
  wcHijyen: number;
}

export interface CapexTeknoloji {
  posYazilim: number;
  posTerminal: number;
  adisyonYazici: number;
  kameraDvr: number;
  alarmYangın: number;
  muzikSistemi: number;
}

export interface CapexResmi {
  belediyeRuhsatHarci: number;
  tapdkAlkolBedeli: number;
  emlakcıKomisyonu: number;
  kiraDepozitosu: number;
  ilkStokMaliyeti: number;
  gorulenGiderler: number;  // Otomatik: toplam * 0.10
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
  isverenMaliyet: number;  // Otomatik: netMaas * 1.575 (ortalama)
  yolYemek: number;
  prim: number;
}

export interface PersonelGruplar {
  yonetim: PersonelKalem[];    // Müdür, Muhasebe, Pazarlama
  mutfak: PersonelKalem[];     // Şef, Yardımcı, Kısım, Hazırlık, Bulaşıkçı
  salon: PersonelKalem[];      // Salon Şef, Garson, Komi, Hostes, Barista, Barmen
  destek: PersonelKalem[];     // Temizlik, Güvenlik, Vale, Kurye
}

export interface PersonelGirdisi {
  gruplar: PersonelGruplar;
  personelKiyafetMaliyeti: number;
}

// ─── 4. GELİR PROJEKSİYONU ──────────────────────────────────────────────────

export interface OgunProjeksiyon {
  aktif: boolean;
  kisiBasiHarcama: number;   // Check average (₺)
  gunlukKisiSayisi: number;
}

export interface OdemeTipi {
  nakitPay: number;           // 0-1 arası (örn. 0.20)
  krediKartiPay: number;      // Komisyon: %2
  yemekKartiPay: number;      // Komisyon: %10
  onlinePlatformPay: number;  // Komisyon: %20
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
  kiraStopajOrani: number;   // Varsayılan: 0.20
  elektrik: number;
  su: number;
  dogalgazLpg: number;
  internet: number;
  telefon: number;
  posMalzeme: number;        // Rulo vb.
  bakimOnarim: number;
  klimaBakim: number;
  hasereIlaclama: number;
  aidat: number;             // AVM/site aidatı
}

// ─── 6. DEĞİŞKEN GİDERLER (SMM) ─────────────────────────────────────────────

export interface DegiskenGiderGirdisi {
  yiyecekMaliyetOrani: number;    // Hedef: 0.28-0.35
  icecekMaliyetOrani: number;     // Hedef: 0.20-0.30
  fireZayiatOrani: number;        // Hedef: 0.03-0.05
  sarfMalzemeOrani: number;       // Ambalaj, peçete vb. — ciro %'si
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
  personelCiroOrani: number;       // Uyarı: > 0.30
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
  roiAy: number;                   // Capex / Aylık net kâr

  // Uyarılar
  uyarilar: FizibiliteUyari[];
}

export interface FizibiliteUyari {
  seviye: 'bilgi' | 'uyari' | 'kritik';
  mesaj: string;
}
```

---

## 5. Hesaplama Motorları

### Mevcut (`src/lib/hesaplama/engine.ts`)

Tüm aylık operasyon finansal mantığı bu dosyada — değişmedi.

#### Varsayılan Değerler

```typescript
export const VARSAYILAN: HesaplamaGirdisi = {
  aylikCiro: 9_620_000,
  kdvOranDusuk: 0.10,   kdvOranYuksek: 0.20,  kdvDusukPay: 0.50,
  hammaddeOrani: 0.35,  hammaddeKdvOrani: 0.01,
  kkKomisyonOrani: 0.02, digerDegiskenOrani: 0.015,
  personelGider: 1_500_000, elektrikGider: 135_000, kiraGider: 600_000,
};
```

#### Senaryo Çarpanları

| Senaryo | Çarpan |
|---------|--------|
| Düşük   | 0.727  |
| Baz     | 1.000  |
| Yüksek  | 1.248  |

### Yeni Fizibilite Motoru (`src/lib/hesaplama/fizibiliteEngine.ts`)

Tüm fizibilite hesapları bu dosyada — UI'a gömülmez.

#### Temel Hesaplama Kuralları

```
// İşveren maliyeti
isverenMaliyet = netMaas * 1.575

// Kira brüt
kirayaBrut = netKira * (1 + kiraStopajOrani)

// Görülmeyen gider (otomatik)
gorulenGiderler = (toplamCapex - gorulenGiderler) * 0.10

// Aylık brüt ciro (öğün bazlı)
gunlukCiro = Σ (ogun.kisiBasiHarcama * ogun.gunlukKisiSayisi * dolulukCarpani)
aylikCiro = gunlukCiro * aylikCalismaSayi

// Ödeme komisyonu
komisyonGider = ciro * (nakitPay*0 + kkPay*0.02 + yemekKartiPay*0.10 + onlinePay*0.20)

// Personel uyarı eşiği
if (personelCiroOrani > 0.30) → 'kritik' uyarı

// SMM uyarısı
if (smmOrani > 0.38) → 'uyari'

// ROI
roiAy = toplamCapex / faaliyetKari
```

---

## 6. UI Kuralları

### Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|---------|
| Mor | `#7B3F8E` | Card header, vurgu |
| Koyu Mor | `#5A2D6E` | Ana header, footer arka planı |
| Magenta | `#C4215A` | PDF butonu, başa baş kutusu |
| Açık Mor | `#EFE6F4` | Section arka planı |
| Yeşil | `#16a34a` | Kâr, pozitif değer, Excel butonu |
| Kırmızı | `#dc2626` | Zarar, negatif değer |
| Amber | `#f59e0b` | Uyarı kutusu |

### Format Kuralları

```typescript
// Para
Math.round(val).toLocaleString('tr-TR') + ' ₺'

// Yüzde
(val * 100).toFixed(1) + '%'
```

- Negatif değer → kırmızı metin
- Pozitif değer → yeşil metin

### Mevcut Sayfa Yapısı (`page.tsx`)

```
Header (koyu mor)
  ↓
Grid: GirdiFormu (sol) | SonucPaneli (sağ)   ← mobilde alt alta
  ↓
SenaryoTablosu (tam genişlik)
  ↓
IndirButonlari kartı (Excel + PDF yan yana)
  ↓
Uyarı notu (amber)
  ↓
[YENİ] Fizibilite Modülü Bölümü (ayraç ile)
  ↓
Footer (koyu mor)
```

### Fizibilite Modülü Yapısı

```
<FizibiliteFormu> — Tab/Sekme navigasyonu
  ├── Sekme 1: İşletme Adı + Mekan Bilgileri    (MekanFormu)
  ├── Sekme 2: Yatırım Maliyeti (Capex)          (CapexFormu) — accordion gruplar
  ├── Sekme 3: Personel ve İK                    (PersonelFormu) — dinamik satır ekle/sil
  ├── Sekme 4: Gelir Projeksiyonu                (GelirFormu)
  ├── Sekme 5: Genel Giderler                    (GenelGiderFormu)
  └── Sekme 6: Değişken Giderler (SMM)           (DegiskenGiderFormu)

<FizibiliteSonuc> — Fizibilite formu doldukça canlı güncellenir
  ├── Kart: Toplam Yatırım (Capex breakdown)
  ├── Kart: Tahmini Aylık Ciro ve Net Ciro
  ├── Kart: Gider Dağılımı (pasta/bar gösterimi)
  ├── Kart: Faaliyet Kârı ve Net Kâr Marjı      ← yeşil/kırmızı
  ├── Kart: Başabaş Noktası (aylık + günlük)     ← magenta
  ├── Kart: Yatırım Geri Dönüş Süresi (ROI)
  └── Uyarı Paneli (bilgi/uyarı/kritik renk kodlu)
```

---

## 7. Export Fonksiyonları (`src/lib/export/index.ts`)

### Mevcut
- `excelIndir(girdi, sonuc, senaryolar)` → 2 sayfalı `.xlsx`
- `pdfIndir(girdi, sonuc, senaryolar)` → A4 `.pdf`

### Yeni (Fizibilite)
- `fizibiliteExcelIndir(girdi, sonuc)` → `.xlsx`
  - Sayfa 1: Capex detay tablosu
  - Sayfa 2: Personel maliyet tablosu
  - Sayfa 3: Gelir projeksiyonu
  - Sayfa 4: Gider özeti ve kârlılık
- `fizibilitePdfIndir(girdi, sonuc)` → A4 `.pdf`
  - Header: koyu mor, işletme adı, tarih, "Fizibilite Raporu"
  - Capex özeti → Personel özeti → Gelir tablosu → Gider tablosu → Başabaş & ROI → Uyarılar

Her fonksiyon `await import(...)` ile dinamik yüklenir — SSR sorunu olmaz.

---

## 8. Kurulum (Codespaces)

```bash
# 1. Next.js kur
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-turbopack --yes

# 2. Paketleri ekle
npm install xlsx jspdf jspdf-autotable

# 3. Klasör yapısını oluştur
mkdir -p src/lib/hesaplama src/lib/export src/types src/components/ui src/components/fizibilite

# 4. Dosyaları yaz (Claude Code halleder)
# 5. Çalıştır
npm run dev
```

### Vercel Deploy

1. Vercel → New Project → GitHub `restoranmaliyet`
2. Environment variable **YOK**
3. Deploy → bitti ✅

> ⚠️ Vercel'de **tek proje** oluştur. GitHub'ı yanlışlıkla ikinci projeye bağlarsan:
> Vercel Dashboard → Project → Settings → Git → Disconnect

---

## 9. Geliştirme Kuralları

- Hesaplama mantığı **yalnızca** ilgili `engine.ts` dosyasında
- Export mantığı **yalnızca** `lib/export/index.ts` içinde
- `any` kullanma — her zaman tip tanımlarını kullan
- `jsPDF.lastAutoTable.finalY` için `(doc as any)` kabul edilebilir
- Yeni alan ekleme sırası: `types/` → `engine.ts` → form → UI → export
- Migration / DB işlemi yok

---

## 10. Bilinen Kısıtlar

- Amortisman, kurumlar/gelir vergisi, stopajlar, bankacılık giderleri, lisans/ruhsat ve sigorta **dahil değil** — footer'da belirtilmeli
- KDV indiriminde yalnızca hammadde giriş KDV'si dikkate alınır
- Kaydetme özelliği yok (Supabase kaldırıldı)
- Fizibilite hesaplamaları tahmini/öngörü niteliğindedir — yasal bağlayıcılığı yoktur

---

## 11. Backlog

- [ ] Geçmiş hesaplamalar (localStorage)
- [ ] Haftalık / günlük kârlılık planı (öğle-akşam servis ayrımı)
- [ ] Supabase Auth + hesaplama kaydetme
- [ ] Çoklu işletme karşılaştırma
- [ ] Fizibilite: 3 yıllık projeksiyon (yıllık büyüme oranı ile)
- [ ] Fizibilite: Monte Carlo simülasyonu (olasılıksal senaryo)

---

*Son güncelleme: Mart 2026 — Hakan Şenipek*