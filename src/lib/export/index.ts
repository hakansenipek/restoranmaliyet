'use client';
import { HesaplamaGirdisi, HesaplamaSonucu, Senaryo } from '@/types';

export async function excelIndir(
  girdi: HesaplamaGirdisi,
  sonuc: HesaplamaSonucu,
  senaryolar: Senaryo[]
) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const fmt = (v: number) => Math.round(v);
  const pct = (v: number) => `%${(v * 100).toFixed(1)}`;
  const isletme = girdi.isletmeAdi || 'İşletme';

  const data1: (string | number)[][] = [
    [`${isletme} — Aylik Mali Analiz`, '', ''],
    ['', '', ''],
    ['KDV AYRIŞTIRILMASI', 'Tutar (₺)', ''],
    ['Brüt Ciro (KDV Dahil)', fmt(girdi.aylikCiro), ''],
    ['Net Satiş (KDV Hariç)', fmt(sonuc.netSatis), ''],
    ['Satiş KDV\'si', fmt(sonuc.satisKdv), ''],
    ['İndirilecek KDV', fmt(sonuc.hammaddeKdv), ''],
    ['ÖDENECEK KDV', fmt(sonuc.odenmesiGerekenKdv), ''],
    ['', '', ''],
    ['DEĞİŞKEN GİDERLER', 'Tutar (₺)', 'Oran'],
    ['Hammadde', fmt(sonuc.hammadde), pct(sonuc.hammadde / sonuc.netSatis)],
    ['Kredi Karti Komisyonu', fmt(sonuc.kkKomisyon), pct(sonuc.kkKomisyon / girdi.aylikCiro)],
    ['Diğer Değişken', fmt(sonuc.digerDegisken), pct(sonuc.digerDegisken / girdi.aylikCiro)],
    ['TOPLAM DEĞİŞKEN', fmt(sonuc.toplamDegisken), ''],
    ['', '', ''],
    ['SABİT GİDERLER', 'Tutar (₺)', ''],
    ['Personel', fmt(sonuc.personelGider), ''],
    ['Elektrik + Doğalgaz + Su', fmt(sonuc.elektrikGider), ''],
    ['Kira', fmt(sonuc.kiraGider), ''],
    ['TOPLAM SABİT', fmt(sonuc.toplamSabit), ''],
    ['', '', ''],
    ['FAALİYET KÂRI', fmt(sonuc.faaliyetKari), pct(sonuc.karMarji)],
    ['BAŞA BAŞ CİRO (aylik)', fmt(sonuc.basaBasCiro), ''],
    ['Başa Baş Günlük', fmt(sonuc.basaBasGunluk), ''],
    ['', '', ''],
    ['NOT: Amortisman, vergi, stopaj, sigorta dahil değildir.', '', ''],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(data1);
  ws1['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Aylik Analiz');

  const data2: (string | number)[][] = [
    ['SENARYO KARŞILAŞTIRMASI', '', '', ''],
    ['', 'Düşük', 'Baz', 'Yüksek'],
    ['Brüt Ciro', ...senaryolar.map(s => fmt(s.ciro))],
    ['Net Satiş', ...senaryolar.map(s => fmt(s.sonuc.netSatis))],
    ['Toplam Gider', ...senaryolar.map(s => fmt(s.sonuc.toplamDegisken + s.sonuc.toplamSabit))],
    ['Ödenecek KDV', ...senaryolar.map(s => fmt(s.sonuc.odenmesiGerekenKdv))],
    ['Faaliyet Kâri', ...senaryolar.map(s => fmt(s.sonuc.faaliyetKari))],
    ['Kâr Marji', ...senaryolar.map(s => pct(s.sonuc.karMarji))],
    ['Başa Baş Ciro', ...senaryolar.map(s => fmt(s.sonuc.basaBasCiro))],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(data2);
  ws2['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Senaryo');

  XLSX.writeFile(wb, `${isletme.replace(/\s+/g, '_')}_maliyet.xlsx`);
}

function turkceTemizle(str: string): string {
  return str
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/i/g, 'i').replace(/İ/g, 'I');
}

export async function pdfIndir(
  girdi: HesaplamaGirdisi,
  sonuc: HesaplamaSonucu,
  senaryolar: Senaryo[]
) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const isletme = girdi.isletmeAdi || 'Isletme';
  const fmt = (v: number) => Math.round(v).toLocaleString('tr-TR') + ' TL';
  const pct = (v: number) => `%${(v * 100).toFixed(1)}`;
  const tarih = new Date().toLocaleDateString('tr-TR');
  const PRIMARY: [number,number,number] = [91, 45, 110];
  const LIGHT:   [number,number,number] = [239, 230, 244];
  const GREEN:   [number,number,number] = [22, 163, 74];
  const RED:     [number,number,number] = [220, 38, 38];

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text('Restoran Maliyet Analizi', 14, 13);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`${turkceTemizle(isletme)}  |  ${tarih}`, 14, 22);
  doc.setTextColor(0, 0, 0);

  let y = 35;

  const sectionTitle = (title: string) => {
    doc.setFillColor(...LIGHT);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...PRIMARY);
    doc.text(turkceTemizle(title), 16, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 9;
  };

  sectionTitle('KDV AYRIŞTIRILMASI');
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    head: [['Kalem', 'Tutar']],
    body: [
      ['Brut Ciro (KDV Dahil)', fmt(girdi.aylikCiro)],
      ['Net Satis (KDV Haric)', fmt(sonuc.netSatis)],
      ['Satis KDV\'si', fmt(sonuc.satisKdv)],
      ['Indirilecek KDV', fmt(sonuc.hammaddeKdv)],
      ['! Odenecek KDV', fmt(sonuc.odenmesiGerekenKdv)],
    ],
    headStyles: { fillColor: PRIMARY, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 1: { halign: 'right' } },
    alternateRowStyles: { fillColor: [250, 247, 253] },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  sectionTitle('GİDER ANALİZİ');
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    head: [['Gider', 'Tutar', 'Oran']],
    body: [
      ['Hammadde', fmt(sonuc.hammadde), pct(sonuc.hammadde / sonuc.netSatis)],
      ['Kredi Karti Komisyonu', fmt(sonuc.kkKomisyon), pct(sonuc.kkKomisyon / girdi.aylikCiro)],
      ['Diger Degisken', fmt(sonuc.digerDegisken), pct(sonuc.digerDegisken / girdi.aylikCiro)],
      ['TOPLAM DEGISKEN', fmt(sonuc.toplamDegisken), ''],
      ['Personel', fmt(sonuc.personelGider), ''],
      ['Elektrik + Dogalgaz + Su', fmt(sonuc.elektrikGider), ''],
      ['Kira', fmt(sonuc.kiraGider), ''],
      ['TOPLAM SABIT', fmt(sonuc.toplamSabit), ''],
    ],
    headStyles: { fillColor: PRIMARY, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    alternateRowStyles: { fillColor: [250, 247, 253] },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  const karPositif = sonuc.faaliyetKari >= 0;
  doc.setFillColor(...(karPositif ? GREEN : RED));
  doc.rect(14, y, 182, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text(karPositif ? 'FAALIYET KARI' : 'FAALIYET ZARARI', 16, y + 8);
  doc.setFontSize(14);
  doc.text(fmt(sonuc.faaliyetKari), 16, y + 17);
  doc.setFontSize(9);
  doc.text(`Kar Marji: ${pct(sonuc.karMarji)}`, 130, y + 12);
  doc.setTextColor(0, 0, 0);
  y += 26;

  doc.setFillColor(254, 242, 242);
  doc.rect(14, y, 182, 16, 'F');
  doc.setTextColor(...RED);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('BASA BAS CIRO (KDV Dahil)', 16, y + 6);
  doc.setFontSize(12);
  doc.text(fmt(sonuc.basaBasCiro) + ' / ay', 16, y + 14);
  doc.setFontSize(9);
  doc.text(`Gunluk: ${fmt(sonuc.basaBasGunluk)}`, 130, y + 10);
  doc.setTextColor(0, 0, 0);
  y += 22;

  if (y > 220) { doc.addPage(); y = 15; }

  sectionTitle('SENARYO KARŞILAŞTIRMASI');
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    head: [['Kalem', 'Dusuk', 'Baz', 'Yuksek']],
    body: [
      ['Brut Ciro', ...senaryolar.map(s => fmt(s.ciro))],
      ['Net Satis', ...senaryolar.map(s => fmt(s.sonuc.netSatis))],
      ['Toplam Gider', ...senaryolar.map(s => fmt(s.sonuc.toplamDegisken + s.sonuc.toplamSabit))],
      ['Odenecek KDV', ...senaryolar.map(s => fmt(s.sonuc.odenmesiGerekenKdv))],
      ['Faaliyet Kari', ...senaryolar.map(s => fmt(s.sonuc.faaliyetKari))],
      ['Kar Marji', ...senaryolar.map(s => pct(s.sonuc.karMarji))],
      ['Basa Bas Ciro', ...senaryolar.map(s => fmt(s.sonuc.basaBasCiro))],
    ],
    headStyles: { fillColor: PRIMARY, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    alternateRowStyles: { fillColor: [250, 247, 253] },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(7); doc.setTextColor(150, 150, 150);
  doc.text('Uyari: Amortisman, vergi, stopaj, sigorta, ruhsat dahil degildir.', 14, finalY);

  doc.save(`${isletme.replace(/\s+/g, '_')}_maliyet.pdf`);
}

// ─── FİZİBİLİTE EXPORT ───────────────────────────────────────────────────────

import type { FizibiliteGirdisi, FizibiliteSonucu } from '@/types/fizibilite';

// Capex kalem etiketleri (kategori → alan → etiket)
const CAPEX_ETIKETLER: Record<string, Record<string, string>> = {
  mimari: {
    konseptTasarim: 'Konsept Tasarım',
    belediyeRuhsatProjesi: 'Belediye Ruhsat Projesi',
    dogalgazElektrikProjesi: 'Doğalgaz / Elektrik Projesi',
    diger: 'Diğer',
  },
  mutfak: {
    tezgahEvyeRaf: 'Tezgah / Evye / Raf',
    davlumbaz: 'Davlumbaz',
    firin: 'Fırın',
    ocaklar: 'Ocaklar',
    fritoz: 'Fritöz',
    bulasikmakine: 'Bulaşık Makinesi',
    buzMakine: 'Buz Makinesi',
    dikBuzdolabi: 'Dik Buzdolabı',
    tezgahAltiDolap: 'Tezgah Altı Dolap',
    derinDondurucular: 'Derin Dondurucular',
    sogukHavaDeposu: 'Soğuk Hava Deposu',
    mikserBlender: 'Mikser / Blender',
    teraziVakum: 'Terazi / Vakum',
    dilimlemeMakine: 'Dilimleme Makinesi',
    porselen: 'Porselen',
    camEsyasi: 'Cam Eşyası',
    catalkasik: 'Çatal / Kaşık / Bıçak',
    diger: 'Diğer',
  },
  dekorasyon: {
    masaSandalye: 'Masa & Sandalye',
    elektrikAydinlatma: 'Elektrik & Aydınlatma',
    boyaIsleri: 'Boya İşleri',
    wc: 'WC',
    isiticilar: 'Isıtıcılar',
    pergoleSemsiye: 'Pergole & Şemsiye',
    acilisTemizligi: 'Açılış Temizliği',
    diger: 'Diğer',
  },
  teknoloji: {
    posYazilim: 'POS Yazılımı',
    posTerminal: 'POS Terminali',
    adisyonYazici: 'Adisyon Yazıcı',
    kameraDvr: 'Kamera / DVR',
    alarmYangın: 'Alarm / Yangın',
    muzikSistemi: 'Müzik Sistemi',
    diger: 'Diğer',
  },
  resmi: {
    belediyeRuhsatHarci: 'Belediye Ruhsat Harcı',
    tapdkAlkolBedeli: 'TAPDK / Alkol Bedeli',
    emlakcıKomisyonu: 'Emlakçı Komisyonu',
    kiraDepozitosu: 'Kira Depozitosu',
    ilkStokMaliyeti: 'İlk Stok Maliyeti',
    diger: 'Diğer',
  },
};

const KATEGORI_ETIKETLER: Record<string, string> = {
  mimari: 'Mimari & Proje',
  mutfak: 'Mutfak Ekipmanları',
  dekorasyon: 'Dekorasyon & Mobilya',
  teknoloji: 'Teknoloji & Güvenlik',
  resmi: 'Resmi & Diğer',
};

const GRUP_ETIKETLER: Record<string, string> = {
  yonetim: 'Yönetim',
  mutfak: 'Mutfak',
  salon: 'Salon',
  destek: 'Destek',
};

export async function fizibiliteExcelIndir(
  girdi: FizibiliteGirdisi,
  sonuc: FizibiliteSonucu
): Promise<void> {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const isletme = girdi.isletmeAdi || 'Fizibilite';
  const tarih = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
  const fmtN = (v: number) => Math.round(v);
  const fmtP = (v: number) => `%${(v * 100).toFixed(1)}`;

  // ── Sayfa 1: Yatirim (CAPEX) ─────────────────────────────────────────────
  const capexRows: (string | number)[][] = [
    [`${isletme} — Yatırım Maliyeti (CAPEX)`, '', ''],
    ['', '', ''],
    ['KATEGORİ', 'KALEM', 'TUTAR (₺)'],
  ];

  for (const [katKey, kalemler] of Object.entries(CAPEX_ETIKETLER)) {
    const katLabel = KATEGORI_ETIKETLER[katKey] ?? katKey;
    const capexKat = girdi.capex[katKey as keyof typeof girdi.capex] as unknown as Record<string, number>;
    let katToplam = 0;
    for (const [field, label] of Object.entries(kalemler)) {
      const val = capexKat[field] ?? 0;
      if (val === 0) continue;
      capexRows.push([katLabel, label, fmtN(val)]);
      katToplam += val;
    }
    // Görülmeyen gider yalnizca resmi kategorisinde eklenir
    if (katKey === 'resmi') {
      const gorulen = Math.round((
        Object.values(girdi.capex.mimari).reduce((a, b) => a + b, 0) +
        Object.values(girdi.capex.mutfak).reduce((a, b) => a + b, 0) +
        Object.values(girdi.capex.dekorasyon).reduce((a, b) => a + b, 0) +
        Object.values(girdi.capex.teknoloji).reduce((a, b) => a + b, 0)
      ) * 0.10);
      capexRows.push([katLabel, 'Görülmeyen Giderler (Oto. %10)', gorulen]);
      katToplam += gorulen;
    }
    capexRows.push(['', `${katLabel} Ara Toplam`, fmtN(katToplam)]);
    capexRows.push(['', '', '']);
  }

  capexRows.push(['', 'TOPLAM YATIRIM (₺)', fmtN(sonuc.toplamCapex)]);

  const ws1 = XLSX.utils.aoa_to_sheet(capexRows);
  ws1['!cols'] = [{ wch: 26 }, { wch: 32 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Yatirim (CAPEX)');

  // ── Sayfa 2: Personel ────────────────────────────────────────────────────
  const personelRows: (string | number)[][] = [
    [`${isletme} — Personel Maliyet Tablosu`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['GRUP', 'POZİSYON', 'ADET', 'NET MAAŞ', 'İŞVEREN MALİYETİ', 'YOL + YEMEK', 'PRİM', 'KALEM TOPLAM'],
  ];

  for (const [grupKey, kalemler] of Object.entries(girdi.personel.gruplar)) {
    const grupLabel = GRUP_ETIKETLER[grupKey] ?? grupKey;
    let grupToplam = 0;
    for (const k of kalemler) {
      const isverenMaliyet = k.netMaas * 1.575;
      const kalemToplam = (isverenMaliyet + k.yolYemek + k.prim) * k.adet;
      personelRows.push([
        grupLabel,
        k.pozisyon,
        k.adet,
        fmtN(k.netMaas),
        fmtN(isverenMaliyet),
        fmtN(k.yolYemek),
        fmtN(k.prim),
        fmtN(kalemToplam),
      ]);
      grupToplam += kalemToplam;
    }
    personelRows.push(['', `${grupLabel} Toplamı`, '', '', '', '', '', fmtN(grupToplam)]);
    personelRows.push(['', '', '', '', '', '', '', '']);
  }
  personelRows.push(['', '', '', '', '', '', '', '']);
  personelRows.push(['Personel Kıyafet', '', '', '', '', '', '', fmtN(girdi.personel.personelKiyafetMaliyeti)]);
  personelRows.push(['GENEL TOPLAM', '', '', '', '', '', '', fmtN(sonuc.toplamPersonelMaliyet)]);

  const ws2 = XLSX.utils.aoa_to_sheet(personelRows);
  ws2['!cols'] = [{ wch: 14 }, { wch: 24 }, { wch: 6 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Personel');

  // ── Sayfa 3: Gelir Projeksiyonu ───────────────────────────────────────────
  const { sabah, ogle, aksam, odemeTipleri, dolulukCarpanlari } = girdi.gelir;
  const gunler = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'] as const;
  const gunLabels: Record<string, string> = {
    pazartesi: 'Pzt', sali: 'Sal', carsamba: 'Çar',
    persembe: 'Per', cuma: 'Cum', cumartesi: 'Cmt', pazar: 'Paz',
  };
  const acikGunSayisi = gunler.filter(g => girdi.mekan.calismaGunleri[g]).length;
  const aylikGunSayisi = (acikGunSayisi / 7) * (365 / 12);
  const ortDoluluk = acikGunSayisi > 0
    ? gunler.filter(g => girdi.mekan.calismaGunleri[g]).reduce((t, g) => t + dolulukCarpanlari[g], 0) / acikGunSayisi
    : 0;

  const gelirRows: (string | number)[][] = [
    [`${isletme} — Gelir Projeksiyonu`, '', '', ''],
    ['', '', '', ''],
    ['ÖĞÜN', 'KİŞİ BAŞI HARCAMA (₺)', 'GÜNLÜK KİŞİ SAYISI', 'AYLIK CİRO TAHMİNİ (₺)'],
  ];

  for (const [label, ogun] of [['Sabah', sabah], ['Öğle', ogle], ['Akşam', aksam]] as const) {
    if (!ogun.aktif) {
      gelirRows.push([label, '(Kapalı)', '', '']);
      continue;
    }
    const aylikCiro = ogun.kisiBasiHarcama * ogun.gunlukKisiSayisi * ortDoluluk * aylikGunSayisi;
    gelirRows.push([label, fmtN(ogun.kisiBasiHarcama), ogun.gunlukKisiSayisi, fmtN(aylikCiro)]);
  }

  gelirRows.push(['', '', '', '']);
  gelirRows.push(['TAHMİNİ BRÜT CİRO', '', '', fmtN(sonuc.tahminiAylikBrutCiro)]);
  gelirRows.push(['Ödeme Komisyon Gideri', '', '', fmtN(sonuc.odemeKomisyonGideri)]);
  gelirRows.push(['NET CİRO', '', '', fmtN(sonuc.netCiro)]);
  gelirRows.push(['', '', '', '']);
  gelirRows.push(['ÖDEME TİPİ DAĞILIMI', 'PAY (%)', 'KOMİSYON', '']);
  gelirRows.push(['Nakit', fmtP(odemeTipleri.nakitPay), '%0', '']);
  gelirRows.push(['Kredi Kartı', fmtP(odemeTipleri.krediKartiPay), '%2', '']);
  gelirRows.push(['Yemek Kartı', fmtP(odemeTipleri.yemekKartiPay), '%10', '']);
  gelirRows.push(['Online Platform', fmtP(odemeTipleri.onlinePlatformPay), '%20', '']);
  gelirRows.push(['', '', '', '']);
  gelirRows.push(['GÜNLÜK DOLULUK ORANLARI', '', '', '']);
  for (const g of gunler) {
    const acik = girdi.mekan.calismaGunleri[g];
    gelirRows.push([gunLabels[g], acik ? fmtP(dolulukCarpanlari[g]) : '(Kapalı)', '', '']);
  }

  const ws3 = XLSX.utils.aoa_to_sheet(gelirRows);
  ws3['!cols'] = [{ wch: 24 }, { wch: 24 }, { wch: 22 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Gelir Projeksiyonu');

  // ── Sayfa 4: Özet (FizibiliteSonucu tüm alanlar) ─────────────────────────
  const roiStr = isFinite(sonuc.roiAy) ? `${Math.round(sonuc.roiAy)} ay` : 'Hesaplanamıyor';
  const bbaStr = isFinite(sonuc.basaBasAylikCiro) ? fmtN(sonuc.basaBasAylikCiro) : 'N/A';
  const bbgStr = isFinite(sonuc.basaBasGunlukCiro) ? fmtN(sonuc.basaBasGunlukCiro) : 'N/A';

  const ozetRows: (string | number | boolean)[][] = [
    [`${isletme} — Fizibilite Özet Raporu`, '', ''],
    ['', '', ''],
    ['BÖLÜM', 'GÖSTERGE', 'DEĞER'],
    // Yatırım
    ['Yatırım', 'Toplam CAPEX (₺)', fmtN(sonuc.toplamCapex)],
    ...Object.entries(sonuc.capexKategoriDetay).map(([k, v]) => ['  Yatırım Detay', k, fmtN(v)] as (string | number)[]),
    ['', '', ''],
    // Gelir
    ['Gelir', 'Tahmini Brüt Ciro (₺)', fmtN(sonuc.tahminiAylikBrutCiro)],
    ['Gelir', 'Ödeme Komisyon Gideri (₺)', fmtN(sonuc.odemeKomisyonGideri)],
    ['Gelir', 'Net Ciro (₺)', fmtN(sonuc.netCiro)],
    ['', '', ''],
    // Giderler
    ['Giderler', 'Toplam Personel Maliyeti (₺)', fmtN(sonuc.toplamPersonelMaliyet)],
    ['Giderler', 'Personel / Ciro Oranı', fmtP(sonuc.personelCiroOrani)],
    ['Giderler', 'Toplam SMM Gideri (₺)', fmtN(sonuc.toplamSMMGider)],
    ['Giderler', 'SMM Oranı', fmtP(sonuc.smmOrani)],
    ['Giderler', 'Toplam Genel Gider (₺)', fmtN(sonuc.toplamGenelGider)],
    ['Giderler', 'TOPLAM AYLIK GİDER (₺)', fmtN(sonuc.toplamAylikGider)],
    ['', '', ''],
    // Kârlılık
    ['Kârlılık', 'Faaliyet Kârı (₺)', fmtN(sonuc.faaliyetKari)],
    ['Kârlılık', 'Net Kâr Marjı', fmtP(sonuc.netKarMarji)],
    ['', '', ''],
    // Başabaş & ROI
    ['Başabaş', 'Aylık Başabaş Ciro (₺)', bbaStr],
    ['Başabaş', 'Günlük Başabaş Ciro (₺)', bbgStr],
    ['ROI', 'Yatırım Geri Dönüş Süresi', roiStr],
    ['', '', ''],
    // Uyarılar
    ...sonuc.uyarilar.map(u => [`Uyarı [${u.seviye.toUpperCase()}]`, u.mesaj, ''] as (string | number)[]),
    ['', '', ''],
    ['NOT', 'Amortisman, vergi, stopaj, sigorta, ruhsat dahil degildir.', ''],
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(ozetRows);
  ws4['!cols'] = [{ wch: 22 }, { wch: 36 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Ozet');

  XLSX.writeFile(wb, `fizibilite_${isletme.replace(/\s+/g, '_')}_${tarih}.xlsx`);
}

export async function fizibilitePdfIndir(
  girdi: FizibiliteGirdisi,
  sonuc: FizibiliteSonucu
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const isletme = girdi.isletmeAdi || 'Fizibilite';
  const tarih = new Date().toLocaleDateString('tr-TR');
  const tarihDosya = tarih.replace(/\./g, '-');
  const fmt = (v: number) => Math.round(v).toLocaleString('tr-TR') + ' TL';
  const pct = (v: number) => `%${(v * 100).toFixed(1)}`;

  const PRIMARY:  [number, number, number] = [90, 45, 110];   // #5A2D6E
  const ACCENT:   [number, number, number] = [123, 63, 142];  // #7B3F8E
  const LIGHT:    [number, number, number] = [239, 230, 244];  // #EFE6F4
  const MAGENTA:  [number, number, number] = [196, 33, 90];   // #C4215A
  const GREEN:    [number, number, number] = [22, 163, 74];
  const RED:      [number, number, number] = [220, 38, 38];
  const PAGE_W = 210;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PAGE_W, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Fizibilite Raporu', MARGIN, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(turkceTemizle(isletme), MARGIN, 22);
  doc.text(tarih, PAGE_W - MARGIN, 22, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  let y = 40;

  // ── Yardimci fonksiyonlar ─────────────────────────────────────────────────
  function newPageIfNeeded(needed = 40) {
    if (y + needed > 270) {
      doc.addPage();
      y = 15;
    }
  }

  function sectionTitle(title: string) {
    newPageIfNeeded(20);
    doc.setFillColor(...LIGHT);
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
    doc.setDrawColor(...ACCENT);
    doc.rect(MARGIN, y, 3, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PRIMARY);
    doc.text(turkceTemizle(title), MARGIN + 6, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }

  function nextY() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 7;
  }

  // ── Bölüm 1: Capex Özet Tablosu ──────────────────────────────────────────
  sectionTitle('1. YATIRIM MALİYETİ (CAPEX)');
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Kategori', 'Tutar']],
    body: [
      ...Object.entries(sonuc.capexKategoriDetay).map(([k, v]) => [turkceTemizle(k), fmt(v)]),
      ['TOPLAM YATIRIM', fmt(sonuc.toplamCapex)],
    ],
    headStyles: { fillColor: PRIMARY, fontSize: 8, fontStyle: 'bold', textColor: 255 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 1: { halign: 'right', cellWidth: 45 } },
    alternateRowStyles: { fillColor: [250, 247, 253] },
    didParseCell: (data) => {
      if (data.row.index === data.table.body.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = LIGHT;
        data.cell.styles.textColor = PRIMARY;
      }
    },
  });
  nextY();

  // ── Bölüm 2: Personel Özet Tablosu (Grup Toplamlari) ─────────────────────
  sectionTitle('2. PERSONEL MALİYETİ');
  const personelBody: (string | number)[][] = [];
  for (const [grupKey, kalemler] of Object.entries(girdi.personel.gruplar)) {
    const grupLabel = GRUP_ETIKETLER[grupKey] ?? grupKey;
    let grupIsverenToplam = 0, grupYolYemek = 0, grupPrim = 0;
    for (const k of kalemler) {
      grupIsverenToplam += k.netMaas * 1.575 * k.adet;
      grupYolYemek += k.yolYemek * k.adet;
      grupPrim += k.prim * k.adet;
    }
    const grupToplam = grupIsverenToplam + grupYolYemek + grupPrim;
    personelBody.push([turkceTemizle(grupLabel), fmt(grupIsverenToplam), fmt(grupYolYemek + grupPrim), fmt(grupToplam)]);
  }
  personelBody.push(['GENEL TOPLAM', '', '', fmt(sonuc.toplamPersonelMaliyet)]);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Grup', 'Isveren Maliyeti', 'Yan Odemeler', 'Grup Toplami']],
    body: personelBody,
    headStyles: { fillColor: PRIMARY, fontSize: 8, fontStyle: 'bold', textColor: 255 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', cellWidth: 38 },
    },
    alternateRowStyles: { fillColor: [250, 247, 253] },
    didParseCell: (data) => {
      if (data.row.index === data.table.body.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = LIGHT;
        data.cell.styles.textColor = PRIMARY;
      }
    },
  });
  nextY();

  // ── Bölüm 3: Gelir ve Gider Özeti ────────────────────────────────────────
  newPageIfNeeded(60);
  sectionTitle('3. GELİR VE GİDER ÖZETİ');

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Kalem', 'Tutar', 'Ciro %']],
    body: [
      ['Tahmini Brut Ciro', fmt(sonuc.tahminiAylikBrutCiro), ''],
      ['  Odeme Komisyon Gideri (-)', fmt(sonuc.odemeKomisyonGideri), pct(sonuc.odemeKomisyonGideri / (sonuc.tahminiAylikBrutCiro || 1))],
      ['Net Ciro', fmt(sonuc.netCiro), ''],
      ['', '', ''],
      ['  Personel Maliyeti', fmt(sonuc.toplamPersonelMaliyet), pct(sonuc.personelCiroOrani)],
      ['  SMM (Hammadde + Fire + Sarf)', fmt(sonuc.toplamSMMGider), pct(sonuc.smmOrani)],
      ['  Genel Giderler', fmt(sonuc.toplamGenelGider), pct(sonuc.toplamGenelGider / (sonuc.tahminiAylikBrutCiro || 1))],
      ['TOPLAM GIDER', fmt(sonuc.toplamAylikGider), pct(sonuc.toplamAylikGider / (sonuc.tahminiAylikBrutCiro || 1))],
    ],
    headStyles: { fillColor: PRIMARY, fontSize: 8, fontStyle: 'bold', textColor: 255 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      1: { halign: 'right', cellWidth: 45 },
      2: { halign: 'right', cellWidth: 22 },
    },
    alternateRowStyles: { fillColor: [250, 247, 253] },
  });
  nextY();

  // ── Bölüm 4: Başabaş & ROI Kutusu (#C4215A kenarlik) ─────────────────────
  newPageIfNeeded(55);
  sectionTitle('4. BAŞABAŞ NOKTASI & YATIRIM GERİ DÖNÜŞÜ');

  // Faaliyet kâri şeridi
  const karPositif = sonuc.faaliyetKari >= 0;
  doc.setFillColor(...(karPositif ? GREEN : RED));
  doc.rect(MARGIN, y, CONTENT_W, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(karPositif ? 'AYLIK FAALIYET KARI' : 'AYLIK FAALIYET ZARARI', MARGIN + 4, y + 7);
  doc.setFontSize(14);
  doc.text(fmt(sonuc.faaliyetKari), MARGIN + 4, y + 16);
  doc.setFontSize(9);
  doc.text(`Net Kar Marji: ${pct(sonuc.netKarMarji)}`, PAGE_W - MARGIN - 4, y + 12, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 25;

  // Başabaş & ROI kutusu — #C4215A kenarlik
  doc.setDrawColor(...MAGENTA);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, y, CONTENT_W, 30, 2, 2, 'S');
  doc.setLineWidth(0.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MAGENTA);

  // Sol: Başabaş
  doc.text('AYLIK BASABAS CIRO', MARGIN + 4, y + 8);
  doc.setFontSize(13);
  doc.text(
    isFinite(sonuc.basaBasAylikCiro) ? fmt(sonuc.basaBasAylikCiro) : 'Hesaplanamiyor',
    MARGIN + 4, y + 17
  );
  doc.setFontSize(8);
  doc.text(`Gunluk: ${isFinite(sonuc.basaBasGunlukCiro) ? fmt(sonuc.basaBasGunlukCiro) : 'N/A'}`, MARGIN + 4, y + 25);

  // Sağ: ROI
  doc.text('YATIRIM GERI DONUSU (ROI)', MARGIN + CONTENT_W / 2 + 4, y + 8);
  doc.setFontSize(13);
  doc.text(
    isFinite(sonuc.roiAy) ? `${Math.round(sonuc.roiAy)} Ay` : 'Hesaplanamiyor',
    MARGIN + CONTENT_W / 2 + 4, y + 17
  );
  doc.setFontSize(8);
  doc.text(
    isFinite(sonuc.roiAy) ? `(${(sonuc.roiAy / 12).toFixed(1)} yil)` : '',
    MARGIN + CONTENT_W / 2 + 4, y + 25
  );

  doc.setTextColor(0, 0, 0);
  y += 36;

  // ── Bölüm 5: Uyarilar ────────────────────────────────────────────────────
  if (sonuc.uyarilar.length > 0) {
    newPageIfNeeded(20 + sonuc.uyarilar.length * 10);
    sectionTitle('5. UYARILAR VE ANALİZ NOTLARI');

    const uyariRenkleri: Record<string, [number, number, number]> = {
      bilgi: [59, 130, 246],
      uyari: [245, 158, 11],
      kritik: [220, 38, 38],
    };

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Seviye', 'Mesaj']],
      body: sonuc.uyarilar.map(u => [u.seviye.toUpperCase(), turkceTemizle(u.mesaj)]),
      headStyles: { fillColor: PRIMARY, fontSize: 8, fontStyle: 'bold', textColor: 255 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 22, halign: 'center', fontStyle: 'bold' } },
      alternateRowStyles: { fillColor: [250, 247, 253] },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === 'body') {
          const seviye = sonuc.uyarilar[data.row.index]?.seviye ?? 'bilgi';
          data.cell.styles.textColor = uyariRenkleri[seviye];
        }
      },
    });
    nextY();
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount: number = (doc as unknown as { internal: { getNumberOfPages: () => number } })
    .internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = 287;
    doc.setFillColor(...PRIMARY);
    doc.rect(0, footerY - 4, PAGE_W, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text(
      'Bu rapor tahmini ongoru niteligi tasimaktadir. Amortisman, vergi, stopaj, sigorta ve ruhsat giderleri dahil degildir.',
      MARGIN, footerY + 2
    );
    doc.setFont('helvetica', 'normal');
    doc.text(`${i} / ${pageCount}`, PAGE_W - MARGIN, footerY + 2, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`fizibilite_${isletme.replace(/\s+/g, '_')}_${tarihDosya}.pdf`);
}
