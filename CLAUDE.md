# CLAUDE.md — Restoran Açılış Maliyeti Hesaplama Sitesi
> **Dosya Versiyonu: 3.3 | Son güncelleme: Nisan 2026**  
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
Export:     jsPDF + autoTable (PDF) — Excel kaldırıldı
Auth:       Supabase Auth (magic link / OTP)
DB:         Supabase (hesaplamalar tablosu)
E-posta:    Supabase Auth → magic link gönderir
            Resend → "Görüş ve Talepler" admin bildirimi (RESEND_API_KEY gerekir)
Deploy:     Vercel
```

---

## 📁 Gerçek Dizin Yapısı

```
src/
├── app/
│   ├── page.tsx                    # Ana sayfa — tüm modüller burada birleşir
│   └── api/
│       └── gorus/
│           └── route.ts            # POST /api/gorus — Resend ile admin mail
├── components/
│   ├── moduls/
│   │   ├── Modul1Capex.tsx
│   │   ├── Modul2Ciro.tsx
│   │   ├── Modul3Opex.tsx
│   │   └── Modul4PL.tsx
│   ├── layout/
│   │   └── Header.tsx              # Auth durumu, modal login, giriş butonu
│   ├── IndirButonlari.tsx          # PDF indir + Görüş formu (login guard)
│   └── ui/
│       ├── Card.tsx
│       ├── InputField.tsx          # type="text", TR locale format, undefined/NaN korumalı
│       ├── SliderInput.tsx
│       ├── SonucSatiri.tsx
│       └── ...
├── lib/
│   ├── hesaplama/
│   │   ├── capexEngine.ts
│   │   ├── ciroEngine.ts
│   │   ├── opexEngine.ts
│   │   └── plEngine.ts
│   ├── export/
│   │   └── index.ts                # PDF dışa aktarım (NotoSans font, Türkçe karakter)
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts
├── types/
│   └── index.ts                    # Tüm tipler ve FORM_VARSAYILAN
public/
└── fonts/
    └── NotoSans-Regular.ttf        # PDF için Türkçe karakter desteği (597KB)
```

---

## 🗂️ Tip Yapısı (`src/types/index.ts`)

### SezonVerisi

Ciro girişi hafta içi / hafta sonu olarak ikiye ayrılmıştır:

```typescript
export interface SezonVerisi {
  aylar: string[];

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

  paketAdet: number;
  paketTutar: number;
}
```

> ⚠️ **Eski alanlar tamamen kaldırıldı:** `sabahKisi`, `sabahHarcama`, `ogleKisi`, `ogleHarcama`, `aksamKisi`, `aksamHarcama` artık yoktur.

### CapexGirdisi (özet — önemli alanlar)

```typescript
kiraSozlesmeTipi: 'bireysel' | 'kurumsal';
aylikKira: number;

// Lisans & Ruhsat:
itfaiyeBelgesi: number;
muzikTelifLisans: number;
tabelaReklamVergisi: number;
bacaBelgesi: number;

// İnşaat & Dekorasyon:
sesSistemi: number;   // UI'da "Ses ve Kamera Sistemi Bedeli" olarak gösterilir
```

> ⚠️ `opex.kira` **kaldırıldı**. Kira tüm hesaplamalarda `capex.aylikKira` üzerinden gelir.

### OpexGirdisi (özet)

```typescript
yemekBedeli: number;        // Kişi başı GÜNLÜK yemek bedeli
maliMusavir: number;        // Eski adı: muhasebe
personelKiyafet: number;    // Kişi başı aylık kıyafet bedeli
personelServisi: number;    // Aylık toplam servis/ulaşım
internetTelefon: number;
aidatOrtakAlan: number;
bakimOnarimIlaclama: number;
```

### OpexSonucu

```typescript
yemekBedeliToplam: number;
personelKiyafetToplam: number;
personelServisiToplam: number;
sgkIsverenToplam: number;
toplamPersonelSayisi: number;
```

---

## 🧮 CAPEX Motoru (`src/lib/hesaplama/capexEngine.ts`)

- Tüm alanlar `n()` yardımcı fonksiyonuyla (`v || 0`) NaN'dan korunur
- `insaatDekorasyon`: tesisat kalemleri + açık alan + masa/sandalye + sesSistemi
- `lisansRuhsat`: yazarKasaPos + tapdk + itfaiyeBelgesi + muzikTelifLisans + tabelaReklamVergisi + bacaBelgesi + lisansDiger
- `gorulenmeyen`: araToplamCapex × 0.10

---

## 🧮 OPEX Motoru (`src/lib/hesaplama/opexEngine.ts`)

```typescript
// İşveren maliyeti: (netMaas / 0.85) × 1.225 × adet
// Personel toplam maliyeti = işveren + yemek + kıyafet + servis
toplamSabitGider = aylikKira(capex) + elektrik + su + dogalgaz
                 + maliMusavir + yazilimPos
                 + internetTelefon + aidatOrtakAlan + bakimOnarimIlaclama
                 + digerSabit
```

> `opexHesapla(g, ciro, netSatis, aylikKira, aylikCalismaGunu)` — 5 parametre, hepsi zorunlu.

---

## 🧮 P&L Motoru (`src/lib/hesaplama/plEngine.ts`)

- `kiraSozlesmeTipi`: `bireysel` → stopaj %20, `kurumsal` → stopaj yok
- `hammaddeEfektifKdv = hammaddeKdv1Pay × 0.01 + (1 - hammaddeKdv1Pay) × 0.10`

---

## 📤 Dışa Aktarım (`src/lib/export/index.ts`)

- **PDF:** `jsPDF` + `jspdf-autotable` + NotoSans font (Türkçe karakter desteği)
- Font `/public/fonts/NotoSans-Regular.ttf`'den fetch edilir, base64 encode ile embed edilir
- `btoa` için Uint8Array spread yerine for döngüsü kullanılır (TS downlevelIteration hatası)
- Header'da sağ üstte `restoranmaliyet.com` yazar
- **Excel kaldırıldı** — `excelIndir` fonksiyonu hâlâ dosyada duruyor ama buton yok

---

## 🔐 Auth & Kullanıcı Akışı

- **Magic link** ile giriş — Supabase Auth, şifre yok
- Giriş yapılmamış kullanıcı: localStorage'da 30 gün saklanır
- Giriş yapılmış kullanıcı: Supabase `hesaplamalar` tablosuna kaydedilir
- Magic link sonrası `?saved=true` parametresiyle localStorage → DB'ye aktarım
- **Görüş ve Talepler formu:** sadece giriş yapmış kullanıcılar gönderebilir; giriş yapılmamışsa "Giriş Gerekli" uyarı modalı açılır

---

## 📬 Görüş ve Talepler (`src/app/api/gorus/route.ts`)

- `POST /api/gorus` — Resend ile admin'e HTML mail gönderir
- `Resend` örneği modül seviyesinde değil, **handler içinde** oluşturulur (build hatası önlenir)
- Gerekli env değişkenleri: `RESEND_API_KEY`, `ADMIN_EMAIL` (varsayılan: hakansenipek@gmail.com)
- Magic link gönderimi Resend değil **Supabase** tarafından yapılır

---

## 🖥️ Header (`src/components/layout/Header.tsx`)

- Giriş yapılmamışsa: "Kayıt Ol / Giriş Yap" butonu + altında açıklama metni (sm: görünür)
- Giriş yapılmışsa: e-posta (kısaltılmış) + "Çıkış Yap" butonu
- Modal: magic link gönderme formu, başarı/hata durumları

---

## 🖥️ Modül 3 UI (`src/components/moduls/Modul3Opex.tsx`)

### Personel Özet Kutusu sırası:
1. Toplam Personel Sayısı
2. Yemek Bedeli (kişi/gün) girişi → Toplam Yemek Bedeli
3. Personel Kıyafeti (kişi) girişi → Toplam Kıyafet Bedeli
4. Personel Servisi (ulaşım) girişi
5. Toplam Net Maaş
6. SGK İşveren Payı
7. **Toplam Personel Maliyeti**

### Sabit Giderler
- Kira: `aylikKira` prop'undan salt okunur — `(Modül 1'den)` etiketi ile
- Yeni alanlar: İnternet & Telefon, Aidat/Ortak Alan, Bakım/Onarım/İlaçlama

---

## 🛡️ Geriye Dönük Uyumluluk (localStorage Migration)

`page.tsx` → `lsYukle()` içinde:

1. Personel `unvan` yoksa → varsayılan liste
2. "Kısım Şefi (Demirbaş Aşçı)" → "Kısım Şefi"
3. `yemekBedeli` yoksa → 0
4. `muhasebe` → `maliMusavir`
5. `hammaddeKdvOrani` → `hammaddeKdv1Pay`
6. Yeni capex alanları (`itfaiyeBelgesi`, `muzikTelifLisans`, `tabelaReklamVergisi`, `bacaBelgesi`, `pergoleSemiye`, `acikAlanIsitici`) yoksa → 0
7. Yeni opex alanları (`personelKiyafet`, `personelServisi`, `internetTelefon`, `aidatOrtakAlan`, `bakimOnarimIlaclama`) yoksa → 0

---

## 🧩 InputField Davranışı (`src/components/ui/InputField.tsx`)

- `type="text"`, `inputMode="decimal"`
- Odakta: 0 ise boş, değer varsa ham sayı (virgüllü ondalık)
- Blur'da: TR locale binlik noktalı format (`1.000`, `10.000`)
- `value` prop `undefined` veya `NaN` gelirse 0 olarak işlenir (crash önlenir)
- `NumInput`: Modul3Opex içindeki inline sayı girişleri için aynı davranışı sağlayan yerel bileşen

---

## 📋 Kritik Geliştirme Notları (Her Oturumda Okunacak)

1. **Kira tek kaynaktan gelir:** `opex.kira` YOKTUR. Her yerde `form.capex.aylikKira` kullanılır.

2. **Personel işveren maliyeti:** `(netMaas / 0.85) × 1.225 × adet`. Eski `× 1.575` kullanılmaz.

3. **`muhasebe` kaldırıldı:** Yeni adı `maliMusavir`.

4. **`hammaddeKdvOrani` kaldırıldı:** Yerine `hammaddeKdv1Pay` (0–1).

5. **Excel kaldırıldı:** `IndirButonlari`'nda sadece PDF butonu var.

6. **PDF font:** NotoSans fetch → for loop ile base64 → addFileToVFS → setFont. Uint8Array spread kullanılmaz.

7. **Görüş formu login guard:** `IndirButonlari`'nda `userEmail` state'i Supabase session'dan alınır; `undefined` ise uyarı modalı gösterilir, form gösterilmez.

8. **Resend handler içinde:** `new Resend(process.env.RESEND_API_KEY)` modül seviyesinde değil, POST handler içinde oluşturulmalı.

9. **Yeni alan eklenince migration:** `page.tsx` → `lsYukle()` içine yeni alan için `typeof x !== 'number'` kontrolü eklenir.

10. **TypeScript kontrolü:** Her değişiklik sonrası `npx tsc --noEmit` çalıştırılmalı.

11. **SezonVerisi:** Eski `sabahKisi/ogleKisi/aksamKisi` yok. Yeni kod `haftaIciOgleKisi` vb. kullanır.

12. **`aylikCalismaGunu`:** opexEngine'e 5. parametre olarak geçirilir. Yemek bedeli günlük × kişi × gün.

13. **KDV sliderları:** `kdvDusukPay` tek kaynak; %20 slider = `(1 - kdvDusukPay) × 100`, onChange = `kdvDusukPay = (100 - v) / 100`.

---

## 📌 Sabit Değerler

```typescript
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
  tadilat_tampon: 1.20,
};
```

---

## 🗃️ Supabase Schema

```sql
-- Aktif olarak kullanılan tablo:
CREATE TABLE hesaplamalar (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id),
  isletme_adi TEXT,
  girdi       JSONB NOT NULL,
  sonuc       JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hesaplamalar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kullanici_kendi_verisi" ON hesaplamalar
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🔧 Vercel Ortam Değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL      = https://tsoztrgjqakwnldxsdfr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = (Supabase dashboard'dan)
RESEND_API_KEY                = re_xxxx (Görüş formu admin maili için)
ADMIN_EMAIL                   = hakansenipek@gmail.com (varsayılan, opsiyonel)
```
