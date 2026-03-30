
# CLAUDE.md — Restoran Maliyet Hesaplama Aracı

Bu dosya Claude Code session'larında projenin tam bağlamını sağlar.
**Her session başında bu dosyayı oku, sonra göreve geç.**

---

## 1. Proje Özeti

- **Repo:** `hakansenipek/restoranmaliyet`
- **Deploy:** Vercel → `https://restoranmaliyet.vercel.app`
- **Amaç:** Restoran/kafeterya açmayı planlayan kullanıcıların yatırım maliyeti, ciro projeksiyonu, operasyonel giderler, vergi/net kâr ve ROI hesaplarını adım adım ve anlık (real-time) yapabildiği web uygulaması.
- **Auth:** Supabase Magic Link (e-posta bağlantısı, şifresiz)
- **Veritabanı:** Supabase (hesaplamalar tablosu)
- **SMTP:** Resend (`smtp.resend.com`)

---

## 2. Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Dil | TypeScript (strict) |
| Stil | Tailwind CSS |
| Auth | Supabase Auth + Magic Link |
| DB | Supabase (PostgreSQL) |
| SMTP | Resend (onboarding@resend.dev) |
| Export | `xlsx` + `jspdf` + `jspdf-autotable` |
| Paket Yöneticisi | npm |

---

## 3. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<proje-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Vercel Dashboard → Project → Settings → Environment Variables içinde tanımlı olmalı.

---

## 4. Klasör Yapısı

```
restoranmaliyet/
├── CLAUDE.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── middleware.ts                         ← Supabase session middleware
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                      ← Ana sayfa (5 modül + sonuç)
    │   ├── globals.css
    │   ├── giris/
    │   │   └── page.tsx                  ← Magic Link giriş sayfası
    │   └── auth/
    │       └── callback/
    │           └── route.ts              ← Supabase code exchange
    │
    ├── components/
    │   │
    │   ├── layout/
    │   │   ├── Header.tsx                ← Koyu mor header + kullanıcı durumu
    │   │   └── Footer.tsx                ← Uyarı notları
    │   │
    │   ├── moduls/
    │   │   ├── Modul1Capex.tsx           ← Yatırım Maliyeti (CAPEX)
    │   │   ├── Modul2Ciro.tsx            ← Ciro Projeksiyonu (Revenue)
    │   │   ├── Modul3Opex.tsx            ← Operasyonel Giderler (OPEX)
    │   │   ├── Modul4PL.tsx              ← Vergilendirme ve Net Kâr (P&L)
    │   │   └── Modul5Roi.tsx             ← ROI & Başabaş Noktası
    │   │
    │   ├── sonuc/
    │   │   ├── SonucPaneli.tsx           ← Canlı özet (sağ/alt panel)
    │   │   ├── SenaryoTablosu.tsx        ← Düşük/Baz/Yüksek karşılaştırma
    │   │   └── RoiGrafik.tsx             ← "X ayda amorti eder" grafiği
    │   │
    │   ├── ui/
    │   │   ├── Card.tsx
    │   │   ├── InputField.tsx
    │   │   ├── SliderInput.tsx           ← Kaydırmalı input (doluluk oranları)
    │   │   ├── SonucSatiri.tsx
    │   │   └── UyariKutusu.tsx
    │   │
    │   └── IndirButonlari.tsx            ← Excel + PDF export butonları
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts                 ← createBrowserClient
    │   │   └── server.ts                 ← createServerClient (route handler)
    │   │
    │   ├── hesaplama/
    │   │   ├── capexEngine.ts            ← Modül 1 hesapları
    │   │   ├── ciroEngine.ts             ← Modül 2 hesapları
    │   │   ├── opexEngine.ts             ← Modül 3 hesapları
    │   │   ├── plEngine.ts               ← Modül 4 hesapları (KDV, stopaj, vergiler)
    │   │   └── roiEngine.ts              ← Modül 5 hesapları (ROI, başabaş)
    │   │
    │   └── export/
    │       └── index.ts                  ← excelIndir() + pdfIndir()
    │
    └── types/
        ├── index.ts                      ← Tüm tip tanımları
        └── supabase.ts                   ← DB tipleri
```

---

## 5. Auth Akışı

### Giriş Sayfası (`/giris`)

```
Kullanıcı → E-posta girer → "Magic Link Gönder" butonuna basar
  → supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/auth/callback' } })
  → "E-postanı kontrol et" mesajı gösterilir
  → Kullanıcı linke tıklar → /auth/callback → / sayfasına yönlendirilir
```

### Middleware (`middleware.ts`)

```typescript
// Korunan rotalar: "/"
// Auth yoksa → "/giris"e yönlendir
// Auth varsa /giris'e gelirse → "/"e yönlendir
```

### Callback Route (`/auth/callback/route.ts`)

```typescript
// Supabase code exchange yapılır
// Başarılıysa "/" a, hata varsa "/giris?error=..." e yönlendirilir
```

### Supabase Dashboard Ayarları

- **Site URL:** `https://restoranmaliyet.vercel.app`
- **Redirect URLs:** `https://restoranmaliyet.vercel.app/auth/callback`
- **SMTP:** Resend — host: `smtp.resend.com`, port: `465`, user: `resend`, pass: Resend API key

---

## 6. Supabase Veritabanı

### `hesaplamalar` Tablosu

```sql
create table hesaplamalar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  isletme_adi text,
  notlar text,
  girdi jsonb not null,      -- Tüm form girdileri (5 modül)
  sonuc jsonb not null,      -- Hesaplama sonuçları
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table hesaplamalar enable row level security;

create policy "Kendi hesaplamalarını gör"
  on hesaplamalar for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## 7. Modül Mimarisi ve Hesaplama Kuralları

### Modül 1 — Yatırım Maliyeti / CAPEX (`capexEngine.ts`)

**Girdiler:**

| Kategori | Alt Kalemler |
|----------|-------------|
| İnşaat & Dekorasyon | m² × m² birim maliyet (slider: 2.000–15.000 ₺/m²) |
| Mutfak Ekipmanları | Liste usulü: Paslanmaz grup, Pişirici grup, Soğutma, Kahve makinesi, Ufak aletler, Çatal/bıçak/kaşık, Bardak, Tabaklar, Diğer |
| Mimari & Proje | Konsept tasarım, Belediye ruhsat projesi, Doğalgaz/elektrik projesi, İtfaiye projesi, Diğer |
| Lisans & Ruhsat | Belediye ruhsat harcı, TAPDK/alkol belgesi, Diğer |
| Açılış Pazarlaması | İlk reklam bütçesi |
| Kira & Depozito | Kira depozitosu (genelde 3 ay), Emlakçı komisyonu |
| İlk Stok | Açılış için ilk hammadde alımı |
| Görülmeyen Giderler | **Otomatik:** (alt toplam) × 0.10 |

**Çıktı:**
```
toplamCapex = Σ tüm kalemler + görülmeyen giderler
```

---

### Modül 2 — Ciro Projeksiyonu / Revenue (`ciroEngine.ts`)

**Girdiler:**

| Alan | Açıklama |
|------|----------|
| Toplam Sandalye | Kapalı + Açık alan toplamı |
| Kahvaltı Servisi | Aktif mi? Doluluk % (slider 0–100), Kişi başı ortalama ₺ |
| Öğle Servisi | Aktif mi? Doluluk % (slider), Kişi başı ortalama ₺ |
| Akşam Servisi | Aktif mi? Doluluk % (slider), Kişi başı ortalama ₺ |
| Paket Servis | Günlük sipariş adedi, Ortalama sipariş tutarı ₺ |
| Aylık Çalışma Günü | Slider: 20–31 gün |

**Hesaplama:**
```
gunlukKapasiteCiro = Σ öğünler:
  ogunGelir = sandalye × (dolulukOrani/100) × kisiBasiHarcama

gunlukPaketCiro = siparisSayisi × siparisOrtalaması
gunlukBrutCiro = gunlukKapasiteCiro + gunlukPaketCiro

aylikBrutCiro = gunlukBrutCiro × aylıkCalismaGunu
yillikBrutCiro = aylikBrutCiro × 12
```

**Senaryo Çarpanları:**

| Senaryo | Çarpan |
|---------|--------|
| Düşük (kötümser) | 0.70 |
| Baz (gerçekçi) | 1.00 |
| Yüksek (iyimser) | 1.30 |

---

### Modül 3 — Operasyonel Giderler / OPEX (`opexEngine.ts`)

**Girdiler:**

| Kategori | Alan |
|----------|------|
| Gıda Maliyeti | Ciro yüzdesi slider: %20–%45 (uyarı eşiği: >%35) |
| Personel | Kişi sayısı + toplam net maaş → işveren maliyeti otomatik (×1.575) + yol/yemek |
| Kira | Net kira ₺ |
| Elektrik | ₺/ay |
| Su | ₺/ay |
| Doğalgaz/LPG | ₺/ay |
| Muhasebe | ₺/ay |
| Yazılım & POS | ₺/ay |
| Diğer Sabit | ₺/ay |
| Sarf Malzeme | Ciro % si (ambalaj, peçete vb.) |
| Ödeme Komisyonu | Nakit %, Kredi Kartı % (kom: %2), Yemek Kartı % (kom: %10), Online % (kom: %20) |

**Hesaplama:**
```
gidaMaliyeti = netCiro × gidaMaliyetOrani
personelToplamMaliyet = Σ (netMaas × 1.575 + yolYemek)
odemeKomisyonu = brutCiro × (kkPay×0.02 + yemekKartiPay×0.10 + onlinePay×0.20)
toplamOpex = gidaMaliyeti + personelToplamMaliyet + toplamSabit + sarfMalzeme + odemeKomisyonu
```

---

### Modül 4 — Vergilendirme ve Net Kâr / P&L (`plEngine.ts`)

**Girdiler:**

| Alan | Açıklama |
|------|----------|
| KDV Oranı Dağılımı | Düşük KDV (%10) payı slider, Yüksek KDV (%20) payı otomatik |
| Hammadde KDV'si | Alış KDV oranı (%1 veya %10) |
| Kira Stopaj Oranı | Varsayılan %20 |
| Vergi Türü | Gelir Vergisi (şahıs) veya Kurumlar Vergisi (%25) seçimi |

**Hesaplama:**
```
// KDV
kdvDusukBrut = brutCiro × kdvDusukPay
kdvYuksekBrut = brutCiro × (1 - kdvDusukPay)
netSatis = (kdvDusukBrut/1.10) + (kdvYuksekBrut/1.20)
tahsilEdilen KDV = brutCiro - netSatis
odenenKDV = gidaMaliyeti × hammaddeKdvOrani
odenmesiGerekenKDV = tahsilEdilenKDV - odenenKDV

// Stopaj
kiraStopaj = netKira × stopajOrani   (beyan edilir, gider olarak düşülür)

// Brüt kâr
brutKar = netSatis - toplamOpex - kiraStopaj

// Vergi (yıllık gelir vergisi dilimlerine göre aylık tahmini)
// Kurumlar vergisi: brutKar × 0.25
// Gelir vergisi: 2024 dilimlerine göre kademeli hesap

netAylikKar = brutKar - tahminiVergi
netKarMarji = netAylikKar / netSatis
```

---

### Modül 5 — ROI & Başabaş Noktası (`roiEngine.ts`)

**Hesaplama:**
```
// Başabaş
degiskenGiderOrani = (gidaMaliyeti + sarfMalzeme + odemeKomisyonu) / netSatis
katkilaMarji = 1 - degiskenGiderOrani
basaBasAylikCiro = toplamSabitGider / katkilaMarji
basaBasGunlukCiro = basaBasAylikCiro / aylıkCalismaGunu

// ROI (amortisman)
roiAy = toplamCapex / netAylikKar   // Pozitif kâr varsa

// Grafik verisi (12 ay kümülatif)
aylikKumulatifKar[n] = netAylikKar × n
amortiAyi = roiAy (grafik üzerinde kesişim noktası)
```

**Çıktı (RoiGrafik.tsx):**
- Bar/line chart: X ekseni = Ay (1–36), Y ekseni = Kümülatif kâr
- Capex çizgisi (yatay kırmızı) ile kesişim → "Bu yatırım kendini X ayda amorti eder"

---

## 8. UI Kuralları

### Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|---------|
| Mor | `#7B3F8E` | Card header, vurgu, aktif sekme |
| Koyu Mor | `#5A2D6E` | Ana header, footer arka planı |
| Magenta | `#C4215A` | PDF butonu, başabaş kutusu, CTA |
| Açık Mor | `#EFE6F4` | Section arka planı |
| Yeşil | `#16a34a` | Kâr, pozitif değer, Excel butonu |
| Kırmızı | `#dc2626` | Zarar, negatif değer, uyarı |
| Amber | `#f59e0b` | Dikkat kutusu |
| Gri | `#f8fafc` | Sayfa arka planı |

### Sayfa Yapısı (`page.tsx`)

```
Header (koyu mor) — kullanıcı adı + çıkış butonu (giriş yapıldıysa)
  ↓
5 Modül — Adım adım, accordion veya sekme yapısında
  Modül 1: Yatırım Maliyeti (CAPEX)
  Modül 2: Ciro Projeksiyonu
  Modül 3: Operasyonel Giderler
  Modül 4: Vergilendirme & Net Kâr
  Modül 5: ROI & Başabaş
  ↓
Canlı Sonuç Paneli (sticky sağ panel — desktop, alt panel — mobil)
  ├── Toplam Yatırım
  ├── Tahmini Aylık Ciro
  ├── Net Aylık Kâr (yeşil/kırmızı)
  ├── Kâr Marjı
  ├── Başabaş Noktası (magenta)
  └── ROI Süresi
  ↓
Senaryo Tablosu (Düşük / Baz / Yüksek)
  ↓
ROI Grafiği (amortisman çizgisi)
  ↓
İndir Butonları (Excel + PDF)
  ↓
[Giriş yapıldıysa] Kaydet Butonu → Supabase hesaplamalar tablosuna
  ↓
Footer (koyu mor — yasal uyarı notu)
```

### Giriş Sayfası (`/giris`)

```
Header (koyu mor)
  ↓
Merkezi kart:
  - Logo/başlık: "Restoran Maliyet & Açılış Öngörü"
  - Alt başlık: "Hesaplamalarınızı kaydetmek için giriş yapın"
  - E-posta input
  - "Magic Link Gönder" butonu (mor #7B3F8E)
  - Gönderim sonrası: amber uyarı kutusu "E-postanı kontrol et"
  - "Hesap oluşturmana gerek yok — sadece e-posta yeterli"
  ↓
Footer
```

### SliderInput Bileşeni

```tsx
// Kaydırma sırasında sonuç paneli anlık güncellenir
<SliderInput
  label="Doluluk Oranı"
  min={0} max={100} step={5}
  value={doluluk}
  onChange={(val) => setDoluluk(val)}
  suffix="%"
  uyariEsigi={80}        // >80 → amber uyarı
/>
```

### Format Kuralları

```typescript
// Para
Math.round(val).toLocaleString('tr-TR') + ' ₺'

// Yüzde
(val * 100).toFixed(1) + '%'

// Ay
Math.ceil(val) + ' ay'
```

- Negatif değer → `text-red-600`
- Pozitif değer → `text-green-600`
- Uyarı eşiği aşıldı → amber kutu

---

## 9. Export Fonksiyonları (`src/lib/export/index.ts`)

### Excel (`excelIndir`)
- Sayfa 1: CAPEX detay tablosu
- Sayfa 2: Ciro projeksiyonu (öğün bazlı)
- Sayfa 3: OPEX + P&L özeti
- Sayfa 4: ROI ve başabaş tablosu
- Sayfa 5: Senaryo karşılaştırması

### PDF (`pdfIndir`)
- Header: koyu mor, işletme adı, tarih, "Fizibilite Raporu"
- CAPEX özeti → Ciro projeksiyonu → OPEX → P&L → ROI & Başabaş → Senaryo tablosu → Uyarılar
- Footer: yasal uyarı notu

Her fonksiyon `await import(...)` ile dinamik yüklenir — SSR sorunu olmaz.

---

## 10. Kurulum (Codespaces)

```bash
# 1. Next.js kur
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-turbopack --yes

# 2. Paketleri ekle
npm install xlsx jspdf jspdf-autotable @supabase/supabase-js @supabase/ssr

# 3. .env.local oluştur
echo "NEXT_PUBLIC_SUPABASE_URL=<url>" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>" >> .env.local

# 4. Klasör yapısını oluştur
mkdir -p src/lib/hesaplama src/lib/export src/lib/supabase src/types
mkdir -p src/components/layout src/components/moduls src/components/sonuc src/components/ui
mkdir -p src/app/giris src/app/auth/callback

# 5. Çalıştır
npm run dev
```

---

## 11. Geliştirme Kuralları

- Her modülün hesaplama mantığı **yalnızca** kendi `Engine.ts` dosyasında
- Export mantığı **yalnızca** `lib/export/index.ts` içinde
- `any` kullanma — her zaman tip tanımlarını kullan
- `jsPDF.lastAutoTable.finalY` için `(doc as any)` kabul edilebilir
- Yeni alan ekleme sırası: `types/` → `engine.ts` → form → UI → export
- Slider değişikliği → `useCallback` ile optimize et (불필요한 re-render önle)
- Tüm hesaplamalar `useMemo` ile sarmalansın

---

## 12. Bilinen Kısıtlar

- Amortisman muhasebesi (vergisel), bankacılık giderleri, sigorta ve tam vergi dilimi hesabı tahminidir — footer'da belirtilmeli
- Kaydetme özelliği yalnızca giriş yapan kullanıcılara açık
- Fizibilite hesaplamaları tahmini/öngörü niteliğindedir — yasal bağlayıcılığı yoktur

---

## 13. Backlog

- [ ] Geçmiş hesaplamalar listesi (kullanıcı dashboard'u)
- [ ] 3 yıllık projeksiyon (yıllık büyüme oranı ile)
- [ ] Monte Carlo simülasyonu (olasılıksal senaryo)
- [ ] Çoklu işletme karşılaştırma
- [ ] Haftalık doluluk çarpanı (gün bazında farklılaştırma)
- [ ] Mobil uygulama (React Native)

---

*Son güncelleme: Mart 2026 — Hakan Şenipek*