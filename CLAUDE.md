# CLAUDE.md — Restoran Açılış Maliyeti Hesaplama Sitesi
> **Dosya Versiyonu: 3.0 | Son güncelleme: Nisan 2026**  
> Bu dosya her yeni Claude Code oturumunda proje bağlamı olarak verilmelidir.

---

## 🎯 Proje Özeti

**Proje Adı:** Restoran Fizibilite Asistanı  
**Konsept:** Türkiye'de restoran açmak isteyen girişimcilere yönelik maliyet hesaplama ve fizibilite analizi web uygulaması. Tek sayfa form tabanlı yapı; 4 modül aşamalı olarak doldurulur.  
**Hedef Kullanıcı:** Restoran/kafe açmayı planlayan girişimciler, mevcut işletmeciler, yatırımcılar.  
**Dil:** Türkçe | **Para Birimi:** Türk Lirası (₺)

---

## 🛠️ Tech Stack

```
Frontend:   Next.js 14 (App Router) + TypeScript
Styling:    Tailwind CSS
Grafik:     Recharts (Cash Flow grafiği)
Export:     xlsx (Excel) + jsPDF + autoTable (PDF)
Deploy:     Vercel
```

---

## 📁 Gerçek Dizin Yapısı

```
src/
├── app/
│   └── page.tsx                    # Ana sayfa — tüm modüller burada birleşir
├── components/
│   ├── moduls/                     # 4 ana modül
│   │   ├── Modul1Capex.tsx         # Yatırım maliyeti
│   │   ├── Modul2Ciro.tsx          # Ciro projeksiyonu (sezonlara göre)
│   │   ├── Modul3Opex.tsx          # Aylık işletme giderleri
│   │   └── Modul4PL.tsx            # Kar/Zarar & ROI
│   └── ui/
│       ├── Card.tsx
│       ├── InputField.tsx
│       ├── SliderInput.tsx         # Modul2Ciro artık KULLANMIYOR
│       ├── SonucSatiri.tsx
│       └── ...
├── lib/
│   ├── hesaplama/
│   │   ├── capexEngine.ts
│   │   ├── ciroEngine.ts
│   │   ├── opexEngine.ts
│   │   └── plEngine.ts
│   └── export/
│       └── index.ts                # Excel + PDF dışa aktarım
└── types/
    └── index.ts                    # Tüm tipler ve FORM_VARSAYILAN
```

---

## 🗂️ Tip Yapısı (`src/types/index.ts`)

### SezonVerisi

Ciro girişi hafta içi / hafta sonu olarak ikiye ayrılmıştır:

```typescript
export interface SezonVerisi {
  aylar: string[];              // Seçili ay isimleri

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

  paketAdet: number;            // Günlük paket servis adedi
  paketTutar: number;           // Kişi başı ortalama tutar (₺)
}

export const VARSAYILAN_SEZON: SezonVerisi = {
  aylar: [],
  haftaIciSabahKisi: 0, haftaIciSabahHarcama: 0,
  haftaIciOgleKisi: 0,  haftaIciOgleHarcama: 0,
  haftaIciAksamKisi: 0, haftaIciAksamHarcama: 0,
  haftaSonuSabahKisi: 0, haftaSonuSabahHarcama: 0,
  haftaSonuOgleKisi: 0,  haftaSonuOgleHarcama: 0,
  haftaSonuAksamKisi: 0, haftaSonuAksamHarcama: 0,
  paketAdet: 0,
  paketTutar: 0,
};
```

> ⚠️ **Eski alanlar tamamen kaldırıldı:** `sabahKisi`, `sabahHarcama`, `ogleKisi`, `ogleHarcama`, `aksamKisi`, `aksamHarcama` artık yoktur. Bunları kullanan kod TypeScript hatası verir.

### CiroGirdisi

```typescript
export interface CiroGirdisi {
  kapaliAlanSandalyeSayisi: number;
  acikAlanSandalyeSayisi: number;
  sezon1: SezonVerisi;
  sezon2: SezonVerisi;
  sezon3: SezonVerisi;
  aylikCalismaGunu: number;     // UI'da InputField (SliderInput DEĞİL)
}
```

> ⚠️ **Kaldırılan alanlar:** `paketSiparisSayisi`, `paketSiparisOrtalaması`. Paket servis artık her sezonda `paketAdet` ve `paketTutar` ile tanımlanır.

### CapexGirdisi (özet — önemli alanlar)

```typescript
kiraSozlesmeTipi: 'bireysel' | 'kurumsal';  // plEngine'e geçirilir
// bireysel → aylık %20 stopaj hesaplanır
// kurumsal → stopaj uygulanmaz, KDV eklenir
```

---

## 🧮 Ciro Hesaplama Motoru (`src/lib/hesaplama/ciroEngine.ts`)

### Temel Formül

```typescript
const HAFTA_ICI_GUN = 22;   // Ayda ortalama hafta içi günü
const HAFTA_SONU_GUN = 8;   // Ayda ortalama hafta sonu günü

// Sezon günlük hesaplar
function sezonHaftaIciGunluk(s: SezonVerisi): number {
  return (s.haftaIciSabahKisi || 0) * (s.haftaIciSabahHarcama || 0)
    + (s.haftaIciOgleKisi || 0) * (s.haftaIciOgleHarcama || 0)
    + (s.haftaIciAksamKisi || 0) * (s.haftaIciAksamHarcama || 0);
}

function sezonHaftaSonuGunluk(s: SezonVerisi): number {
  return (s.haftaSonuSabahKisi || 0) * (s.haftaSonuSabahHarcama || 0)
    + (s.haftaSonuOgleKisi || 0) * (s.haftaSonuOgleHarcama || 0)
    + (s.haftaSonuAksamKisi || 0) * (s.haftaSonuAksamHarcama || 0);
}

// Aylık öğün cirosu
function sezonAylikOgun(s: SezonVerisi): number {
  return sezonHaftaIciGunluk(s) * HAFTA_ICI_GUN
    + sezonHaftaSonuGunluk(s) * HAFTA_SONU_GUN;
}

// Aylık paket cirosu
function sezonAylikPaket(s: SezonVerisi): number {
  return (s.paketAdet || 0) * (s.paketTutar || 0) * 30;
}

// Yıllık katkı: her sezon için
const s1Yillik = (sezonAylikOgun(s1) + sezonAylikPaket(s1)) * (s1.aylar?.length || 0);
// ... s2, s3 aynı şekilde

const yillikBrutCiro = s1Yillik + s2Yillik + s3Yillik;
const aylikBrutCiro  = yillikBrutCiro / 12;
const gunlukBrutCiro = aylikBrutCiro / 30;
```

---

## 🧮 CAPEX Motoru (`src/lib/hesaplama/capexEngine.ts`)

- Tüm alanlar `n()` yardımcı fonksiyonuyla (`v || 0`) NaN'dan korunur
- `insaatDekorasyon`: 7 tesisat kalemi + 3 açık alan kalemi + 4 masa/sandalye adet×fiyat
- `mimariProje`: devirUcreti + mimariHizmetBedeli + belediyeRuhsatBedeli + turizmBelgesiBedeli + dogalgazProjeBedeli + mimariDiger
- `lisansRuhsat`: yazarKasaPos + tapdk + lisansDiger
- `kiraDepozito`: depozitoBedeli + emlakciKomisyonu
- `acilisPazarlama`: sosyalMedyaReklam + influencerBedeli + billboardReklam + elIlaniReklam
- `gorulenmeyen`: araToplamCapex × 0.10 (%10 beklenmeyen gider tamponu)

---

## 🧮 P&L Motoru (`src/lib/hesaplama/plEngine.ts`)

- `kiraSozlesmeTipi` parametresi `CapexGirdisi`'nden gelir
- `bireysel` → `kiraStopaj = netKira × kiraStopajOrani` (varsayılan %20)
- `kurumsal` → `kiraStopaj = 0`

```typescript
// page.tsx'te çağrım:
plHesapla(ciro, opex, pl, form.capex.kiraSozlesmeTipi)

// Modul4PL'e prop olarak:
<Modul4PL kiraSozlesmeTipi={form.capex.kiraSozlesmeTipi} ... />
```

---

## 🖥️ Modül 2 UI (`src/components/moduls/Modul2Ciro.tsx`)

### SezonKarti yapısı

Her sezon kartında sırasıyla:
1. **Ay seçimi** — 12 aylık grid, diğer sezonlarda seçili aylar disabled
2. **Günlük Öğün Cirosu** — alt alta iki kart:
   - **Hafta İçi** (Pzt–Cum, 22 gün/ay): Sabah / Öğle / Akşam satırları
   - **Hafta Sonu** (Cmt–Paz, 8 gün/ay): Sabah / Öğle / Akşam satırları
   - Her iki kartın altında **Aylık Öğün Cirosu** özet satırı
3. **Paket Servis** — Günlük Adet + Kişi Başı Tutar + Aylık Toplam

> Hafta içi ve hafta sonu kartları **yan yana değil alt alta** (`flex-col`) dizilir.  
> `aylikCalismaGunu` alanı **`InputField`** ile girilir — `SliderInput` kullanılmaz.

### OgunTablosu bileşeni

```typescript
function OgunTablosu({ baslik, altBaslik, renk,
  sabahKisiKey, sabahHarcamaKey,
  ogleKisiKey, ogleHarcamaKey,
  aksamKisiKey, aksamHarcamaKey,
  girdi, setField }: OgunTablosuProps)
```
`SezonVerisi` key adları prop olarak geçirilir — böylece hafta içi ve hafta sonu için aynı bileşen yeniden kullanılır.

---

## 🏗️ Modül 1 UI (`src/components/moduls/Modul1Capex.tsx`)

Alt modül sırası:
1. Mimari & Proje
2. İnşaat & Dekorasyon (alan bilgisi + maliyet kalemleri + masa/sandalye)
3. Mutfak ve Servis Ekipmanları
4. Lisans & Ruhsat
5. Kira & Depozito (sözleşme tipi toggle: bireysel/kurumsal)
6. Açılış Pazarlaması
7. İlk Stok

---

## 📤 Dışa Aktarım (`src/lib/export/index.ts`)

- **Excel:** `xlsx` paketi ile `.xlsx` dosyası
- **PDF:** `jsPDF` + `jspdf-autotable` ile `.pdf`
- Ciro tablosunda hafta içi/hafta sonu günlük tutarlar ve aylık öğün/paket cirosu ayrı sütunlarda gösterilir

---

## 🛡️ Geriye Dönük Uyumluluk

Eski `localStorage` verisi yeni alanları içermeyebilir. Savunma katmanları:

1. `VARSAYILAN_SEZON` sabiti — tüm alanlar `0`
2. `g.sezon1 ?? VARSAYILAN_SEZON` — engine'de null koruması
3. `girdi.sezon1 ?? VARSAYILAN_SEZON` — UI'da null koruması
4. `s.aylar ?? []` — undefined array koruması
5. `n(v || 0)` — capexEngine'de NaN koruması

---

## 📋 Kritik Geliştirme Notları (Her Oturumda Okunacak)

1. **SezonVerisi alanları değişti:** Eski `sabahKisi/ogleKisi/aksamKisi` yok. Yeni kod `haftaIciOgleKisi` vb. kullanır. Yeni alan ekleneceğinde `SezonVerisi`, `VARSAYILAN_SEZON`, `FORM_VARSAYILAN` ve `ciroEngine` birlikte güncellenir.

2. **Paket servis sezon bazlı:** Global `paketSiparisSayisi/paketSiparisOrtalaması` kaldırıldı. Her sezonda `paketAdet` ve `paketTutar` var.

3. **Ciro formülü:** `aylikOgunCiro = haftaIciGunluk × 22 + haftaSonuGunluk × 8`. `aylikCalismaGunu` günlük→aylık çevrimde artık kullanılmıyor; alanı kaldırmak gerekirse `CiroGirdisi` + `FORM_VARSAYILAN` + `Modul2Ciro` güncellenir.

4. **ROI İki Türlü Gösterilmeli:** "Muhasebe ROI" ve "Nakit ROI" mutlaka ayrı gösterilmeli. Tek sayı yanıltıcıdır.

5. **Net Ciro Zorunlu:** Karlılık hesapları `hesaplaNetAylikCiro()` üzerinden yapılmalı — `brutCiro` platform/POS komisyonlarını atlar.

6. **Stopaj Sadeliği:** Kullanıcıya "nakit çıkışınız değişmez, ama beyan yükümlülüğünüz var" cümlesiyle özetle.

7. **Tadilat Tamponu:** Kullanıcının girdiği tadilat bütçesine daima %20 eklenir, ayrı satır olarak gösterilir.

8. **TypeScript kontrolü:** Her değişiklik sonrası `npx tsc --noEmit` çalıştırılmalı. Çıktı `EXIT: 0` olmalı.

---

## 📌 Sabit Değerler

```typescript
// ⚠️ Türkiye mevzuatı değişkendir. Asgari ücret Ocak ve Temmuz'da,
// vergi dilimleri her yıl Ocak'ta güncellenir.

export const VERGI_ORANLARI = {
  kdv_gida_temel: 0.01,
  kdv_gida_islenmis: 0.10,
  kdv_icecek: 0.20,
  kurumlar_vergisi: 0.25,
  sgk_isveren: 0.225,
  kira_stopaj: 0.20,
  damga_vergisi: 0.00759,
};

export const GELIR_VERGISI_DILIMLERI_2026 = [
  { limite: 110_000,   oran: 0.15 },
  { limite: 230_000,   oran: 0.20 },
  { limite: 870_000,   oran: 0.27 },
  { limite: 3_000_000, oran: 0.35 },
  { limite: Infinity,  oran: 0.40 },
];

export const ASGARI_UCRET_2026 = {
  net: 22_104,
  brut: 29_000,
  isveren_toplam: 35_525,
  kaynak: 'Çalışma Bakanlığı — Ocak 2026',
};

export const SEKTOREL_BENCHMARKLAR = {
  hammadde_ideal_max: 35,
  kira_ciro_max: 0.12,
  personel_ciro_max: 0.35,
  roi_nakit_iyi: 24,
  roi_nakit_kabul: 36,
  roi_nakit_riskli: 48,
  tadilat_tampon: 1.20,    // %20 üst bütçe payı
};
```

---

## 🗃️ Supabase Schema (opsiyonel)

```sql
CREATE TABLE fizibilite_raporlari (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id),
  restoran_adi     TEXT,
  veri             JSONB NOT NULL,
  toplam_yatirim   NUMERIC,
  aylik_net_kar    NUMERIC,
  nakit_roi_ay     NUMERIC,
  muhasebe_roi_ay  NUMERIC,
  fizibilite_skoru INTEGER,
  constants_version TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fizibilite_raporlari ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kullanici_kendi_raporu" ON fizibilite_raporlari
  FOR ALL USING (auth.uid() = user_id);
```
