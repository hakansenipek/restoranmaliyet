import type { FormDurumu, HesaplamaSonucu } from '@/types';
import { SENARYO } from '@/lib/hesaplama/ciroEngine';

function para(v: number): string {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}

function pct(v: number): string {
  return (v * 100).toFixed(1) + '%';
}

function tarih(): string {
  return new Date().toLocaleDateString('tr-TR');
}

// ─── EXCEL ─────────────────────────────────────────────────────────────────

export async function excelIndir(form: FormDurumu, sonuc: HesaplamaSonucu) {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  // ── Sayfa 1: CAPEX ──────────────────────────────────────────────────────
  const capex = sonuc.capex;
  const capexData = [
    ['YATIRIM MALİYETİ (CAPEX)', ''],
    ['İşletme Adı', form.isletmeAdi || '—'],
    ['Tarih', tarih()],
    ['', ''],
    ['KATEGORİ', 'TUTAR (₺)'],
    ['İnşaat & Dekorasyon', capex.insaatDekorasyon],
    [`  Kapalı Alan: ${form.capex.kapaliAlan} m² / Açık Alan: ${form.capex.acikAlan} m²`, ''],
    ['  Zemin ve Duvar İnşaat', form.capex.zeminDuvarInsaat],
    ['  Elektrik Tesisat', form.capex.elektrikTesisat],
    ['  Su Tesisat', form.capex.suTesisat],
    ['  Doğalgaz Tesisat', form.capex.dogalgazTesisat],
    ['  Cam Bedeli', form.capex.camBedeli],
    ['  Aydınlatma', form.capex.aydinlatma],
    ['  Ses Sistemi', form.capex.sesSistemi],
    ['  Kapalı Alan Masa', form.capex.kapaliMasaAdet + ' ad × ' + form.capex.kapaliMasaBirimFiyat.toLocaleString('tr-TR') + ' ₺'],
    ['  Açık Alan Masa', form.capex.acikMasaAdet + ' ad × ' + form.capex.acikMasaBirimFiyat.toLocaleString('tr-TR') + ' ₺'],
    ['  Kapalı Alan Sandalye', form.capex.kapaliSandalyeAdet + ' ad × ' + form.capex.kapaliSandalyeBirimFiyat.toLocaleString('tr-TR') + ' ₺'],
    ['  Açık Alan Sandalye', form.capex.acikSandalyeAdet + ' ad × ' + form.capex.acikSandalyeBirimFiyat.toLocaleString('tr-TR') + ' ₺'],
    ['Mutfak ve Servis Ekipmanları', capex.mutfakEkipmanlari],
    ['  Paslanmaz Grubu (tezgahlar, davlumbaz)', form.capex.paslanmazGrup],
    ['  Pişirici Grubu (fırın, ocak, plate, fritöz)', form.capex.pisiriciGrup],
    ['  Soğutma Grubu (buzdolabı, soğuk hava)', form.capex.sogutma],
    ['  Endüstriyel Makineler (bulaşık, buz, kahve)', form.capex.endustriyelMakineler],
    ['  Çatal/Bıçak/Kaşık', form.capex.catalKasik],
    ['  Bardak', form.capex.bardak],
    ['  Tabaklar', form.capex.tabaklar],
    ['  Diğer', form.capex.mutfakDiger],
    ['Mimari & Proje', capex.mimariProje],
    ['  Devir Ücreti', form.capex.devirUcreti],
    ['  Mimari Hizmet Bedeli', form.capex.mimariHizmetBedeli],
    ['  Belediye Ruhsat Bedeli', form.capex.belediyeRuhsatBedeli],
    ['  Turizm Belgesi Bedeli', form.capex.turizmBelgesiBedeli],
    ['  Doğalgaz Proje Bedeli', form.capex.dogalgazProjeBedeli],
    ['  Diğer', form.capex.mimariDiger],
    ['Lisans & Ruhsat', capex.lisansRuhsat],
    ['  Yazar Kasa / POS Programı', form.capex.yazarKasaPos],
    ['  TAPDK / Alkol Belgesi', form.capex.tapdk],
    ['  Diğer', form.capex.lisansDiger],
    ['Açılış Pazarlaması', capex.acilisPazarlama],
    ['  Sosyal Medya Reklamları', form.capex.sosyalMedyaReklam],
    ['  İnfluencer Bedeli', form.capex.influencerBedeli],
    ['  Billboard Reklam Bedeli', form.capex.billboardReklam],
    ['  El İlanı Bedeli', form.capex.elIlaniReklam],
    ['Kira & Depozito', capex.kiraDepozito],
    [`  Sözleşme: ${form.capex.kiraSozlesmeTipi === 'bireysel' ? 'Bireysel (Stopaj)' : 'Kurumsal (KDV)'}`, ''],
    ['  Depozito Bedeli', form.capex.depozitoBedeli],
    ['  Emlakçı Komisyon Bedeli', form.capex.emlakciKomisyonu],
    ['İlk Stok', capex.ilkStok],
    ['', ''],
    ['ARA TOPLAM', capex.araToplamCapex],
    ['Görülmeyen Giderler (%10)', capex.gorulenmeyen],
    ['TOPLAM YATIRIM', capex.toplamCapex],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(capexData);
  XLSX.utils.book_append_sheet(wb, ws1, 'CAPEX');

  // ── Sayfa 2: Ciro Projeksiyonu ──────────────────────────────────────────
  const ciro = sonuc.ciro;
  const ciroData = [
    ['CİRO PROJEKSİYONU', ''],
    ['Toplam Sandalye', form.ciro.toplamSandalye],
    ['Aylık Çalışma Günü', form.ciro.aylikCalismaGunu],
    ['', ''],
    ['ÖĞÜN', 'AKTİF', 'DOLULUK %', 'KİŞİ BAŞI ₺', 'GÜNLÜK GELİR'],
    [
      'Kahvaltı',
      form.ciro.kahvalti.aktif ? 'Evet' : 'Hayır',
      form.ciro.kahvalti.dolulukOrani,
      form.ciro.kahvalti.kisiBasiHarcama,
      form.ciro.kahvalti.aktif
        ? form.ciro.toplamSandalye * (form.ciro.kahvalti.dolulukOrani / 100) * form.ciro.kahvalti.kisiBasiHarcama
        : 0,
    ],
    [
      'Öğle',
      form.ciro.ogle.aktif ? 'Evet' : 'Hayır',
      form.ciro.ogle.dolulukOrani,
      form.ciro.ogle.kisiBasiHarcama,
      form.ciro.ogle.aktif
        ? form.ciro.toplamSandalye * (form.ciro.ogle.dolulukOrani / 100) * form.ciro.ogle.kisiBasiHarcama
        : 0,
    ],
    [
      'Akşam',
      form.ciro.aksam.aktif ? 'Evet' : 'Hayır',
      form.ciro.aksam.dolulukOrani,
      form.ciro.aksam.kisiBasiHarcama,
      form.ciro.aksam.aktif
        ? form.ciro.toplamSandalye * (form.ciro.aksam.dolulukOrani / 100) * form.ciro.aksam.kisiBasiHarcama
        : 0,
    ],
    ['Paket Servis', 'Evet', `${form.ciro.paketSiparisSayisi} sipariş`, form.ciro.paketSiparisOrtalaması, ciro.gunlukPaketCiro],
    ['', '', '', '', ''],
    ['Günlük Kapasite Cirosu', '', '', '', ciro.gunlukKapasiteCiro],
    ['Günlük Brüt Ciro', '', '', '', ciro.gunlukBrutCiro],
    ['AYLIK BRÜT CİRO', '', '', '', ciro.aylikBrutCiro],
    ['Yıllık Projeksiyon', '', '', '', ciro.yillikBrutCiro],
    ['', '', '', '', ''],
    ['SENARYO', '', '', '', 'AYLIK CİRO'],
    ['Düşük (%70)', '', '', '', ciro.dusukCiro],
    ['Baz (%100)', '', '', '', ciro.bazCiro],
    ['Yüksek (%130)', '', '', '', ciro.yuksekCiro],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(ciroData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Ciro Projeksiyonu');

  // ── Sayfa 3: OPEX + P&L ─────────────────────────────────────────────────
  const opex = sonuc.opex;
  const pl = sonuc.pl;
  const opexData = [
    ['OPEX & P&L ÖZETİ', ''],
    ['', ''],
    ['OPEX KALEMİ', 'TUTAR (₺)'],
    ['Gıda Maliyeti', opex.gidaMaliyeti],
    [`  Oran: %${(form.opex.gidaMaliyetOrani * 100).toFixed(0)} (net ciro)`, ''],
    ['Personel Toplam Maliyeti', opex.personelToplamMaliyet],
    ...form.opex.personeller.map(p => [
      `  ${p.ad}`,
      p.netMaas * 1.575 + p.yolYemek,
    ]),
    ['Toplam Sabit Gider', opex.toplamSabitGider],
    ['  Kira (Net)', form.opex.kira],
    ['  Elektrik', form.opex.elektrik],
    ['  Su', form.opex.su],
    ['  Doğalgaz/LPG', form.opex.dogalgaz],
    ['  Muhasebe', form.opex.muhasebe],
    ['  Yazılım & POS', form.opex.yazilimPos],
    ['  Diğer Sabit', form.opex.digerSabit],
    ['Sarf Malzeme', opex.sarfMalzeme],
    ['Ödeme Komisyonu', opex.odemeKomisyonu],
    ['TOPLAM OPEX', opex.toplamOpex],
    ['', ''],
    ['P&L', ''],
    ['Net Satış (KDV Hariç)', pl.netSatis],
    ['Tahsil Edilen KDV', pl.tahsilEdilenKdv],
    ['Ödenen KDV (Hammadde)', pl.odenenKdv],
    ['Ödenecek KDV', pl.odenmesiGerekenKdv],
    ['Kira Stopajı', pl.kiraStopaj],
    ['Brüt Kâr', pl.brutKar],
    ['Tahmini Vergi', pl.tahminiVergi],
    ['NET AYLIK KÂR', pl.netAylikKar],
    ['Net Kâr Marjı', pct(pl.netKarMarji)],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(opexData);
  XLSX.utils.book_append_sheet(wb, ws3, 'OPEX-PL');

  // ── Sayfa 4: ROI & Başabaş ──────────────────────────────────────────────
  const roi = sonuc.roi;
  const roiData = [
    ['ROI & BAŞABAŞ ANALİZİ', ''],
    ['', ''],
    ['Katkı Marjı', pct(roi.katkilaMarji)],
    ['Değişken Gider Oranı', pct(roi.degiskenGiderOrani)],
    ['Başabaş Aylık Ciro', roi.basaBasAylikCiro],
    ['Başabaş Günlük Ciro', roi.basaBasGunlukCiro],
    ['Toplam Yatırım (CAPEX)', capex.toplamCapex],
    ['Aylık Net Kâr', pl.netAylikKar],
    ['Amortisman Süresi', roi.roiAy !== null ? `${Math.ceil(roi.roiAy)} ay` : 'Hesaplanamıyor'],
    ['', ''],
    ['AY', 'KÜMÜLATİF KÂR (₺)'],
    ...roi.aylikKumulatifData.map(d => [d.ay, d.kar]),
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(roiData);
  XLSX.utils.book_append_sheet(wb, ws4, 'ROI');

  // ── Sayfa 5: Senaryo Karşılaştırması ────────────────────────────────────
  const netSatisOrani = ciro.aylikBrutCiro > 0 ? pl.netSatis / ciro.aylikBrutCiro : 0;
  const sabitGider = opex.personelToplamMaliyet + opex.toplamSabitGider + pl.kiraStopaj;

  function senaryoNetKar(brutCiro: number): number {
    const ns = brutCiro * netSatisOrani;
    const deg = ns * roi.degiskenGiderOrani;
    const bk = ns - deg - sabitGider;
    if (bk <= 0) return bk;
    const vergi = pl.tahminiVergi > 0 && pl.brutKar > 0 ? bk * (pl.tahminiVergi / pl.brutKar) : 0;
    return bk - vergi;
  }

  const senaryolar = [
    { etiket: 'Düşük (%70)', brutCiro: ciro.dusukCiro },
    { etiket: 'Baz (%100)', brutCiro: ciro.bazCiro },
    { etiket: 'Yüksek (%130)', brutCiro: ciro.yuksekCiro },
  ];

  const senaryoData = [
    ['SENARYO KARŞILAŞTIRMASI', '', '', '', ''],
    ['SENARYO', 'BRÜT CİRO', 'NET KÂR', 'KÂR MARJI', 'ROI'],
    ...senaryolar.map(s => {
      const nk = senaryoNetKar(s.brutCiro);
      const ns = s.brutCiro * netSatisOrani;
      const marj = ns > 0 ? nk / ns : 0;
      const roiAy = nk > 0 ? Math.ceil(capex.toplamCapex / nk) + ' ay' : '—';
      return [s.etiket, s.brutCiro, nk, pct(marj), roiAy];
    }),
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(senaryoData);
  XLSX.utils.book_append_sheet(wb, ws5, 'Senaryo');

  XLSX.writeFile(wb, `fizibilite_${form.isletmeAdi || 'rapor'}_${tarih().replace(/\./g, '-')}.xlsx`);
}

// ─── PDF ──────────────────────────────────────────────────────────────────

export async function pdfIndir(form: FormDurumu, sonuc: HesaplamaSonucu) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const renk = { koyu: '#5A2D6E', mor: '#7B3F8E', magenta: '#C4215A', yesil: '#16a34a', kirmizi: '#dc2626' };

  const pageW = doc.internal.pageSize.getWidth();
  let y = 0;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(90, 45, 110);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Restoran Fizibilite Raporu', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(form.isletmeAdi || '—', 14, 19);
  doc.text(`Tarih: ${tarih()}`, pageW - 14, 19, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y = 34;

  // ── CAPEX ───────────────────────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 45, 110);
  doc.text('1. Yatırım Maliyeti (CAPEX)', 14, y);
  y += 5;
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: y,
    head: [['Kalem', 'Tutar']],
    body: [
      ['İnşaat & Dekorasyon', para(sonuc.capex.insaatDekorasyon)],
      ['Mutfak Ekipmanları', para(sonuc.capex.mutfakEkipmanlari)],
      ['Mimari & Proje', para(sonuc.capex.mimariProje)],
      ['Lisans & Ruhsat', para(sonuc.capex.lisansRuhsat)],
      ['Açılış Pazarlaması', para(sonuc.capex.acilisPazarlama)],
      ['Kira & Depozito', para(sonuc.capex.kiraDepozito)],
      ['İlk Stok', para(sonuc.capex.ilkStok)],
      ['Görülmeyen Giderler (%10)', para(sonuc.capex.gorulenmeyen)],
      ['TOPLAM YATIRIM', para(sonuc.capex.toplamCapex)],
    ],
    headStyles: { fillColor: [123, 63, 142], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    foot: [],
    didParseCell: (data) => {
      if (data.row.index === 7) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [239, 230, 244];
        data.cell.styles.textColor = [90, 45, 110];
      }
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── Ciro ────────────────────────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 45, 110);
  doc.text('2. Ciro Projeksiyonu', 14, y);
  y += 5;
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: y,
    head: [['Gösterge', 'Değer']],
    body: [
      ['Toplam Sandalye', `${form.ciro.toplamSandalye} kişi`],
      ['Aylık Çalışma Günü', `${form.ciro.aylikCalismaGunu} gün`],
      ['Günlük Kapasite Cirosu', para(sonuc.ciro.gunlukKapasiteCiro)],
      ['Günlük Paket Servisi', para(sonuc.ciro.gunlukPaketCiro)],
      ['Günlük Brüt Ciro', para(sonuc.ciro.gunlukBrutCiro)],
      ['AYLIK BRÜT CİRO', para(sonuc.ciro.aylikBrutCiro)],
      ['Yıllık Projeksiyon', para(sonuc.ciro.yillikBrutCiro)],
    ],
    headStyles: { fillColor: [123, 63, 142], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 5) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [239, 230, 244];
        data.cell.styles.textColor = [90, 45, 110];
      }
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── OPEX ────────────────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 14; }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 45, 110);
  doc.text('3. Operasyonel Giderler (OPEX)', 14, y);
  y += 5;
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: y,
    head: [['Gider Kalemi', 'Tutar']],
    body: [
      ['Gıda Maliyeti', para(sonuc.opex.gidaMaliyeti)],
      ['Personel Toplam', para(sonuc.opex.personelToplamMaliyet)],
      ['Toplam Sabit Gider', para(sonuc.opex.toplamSabitGider)],
      ['Sarf Malzeme', para(sonuc.opex.sarfMalzeme)],
      ['Ödeme Komisyonu', para(sonuc.opex.odemeKomisyonu)],
      ['TOPLAM OPEX', para(sonuc.opex.toplamOpex)],
    ],
    headStyles: { fillColor: [123, 63, 142], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 5) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [239, 230, 244];
        data.cell.styles.textColor = [90, 45, 110];
      }
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── P&L ─────────────────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 14; }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 45, 110);
  doc.text('4. Vergilendirme ve Net Kar (P&L)', 14, y);
  y += 5;
  doc.setTextColor(0, 0, 0);

  const pl = sonuc.pl;
  autoTable(doc, {
    startY: y,
    head: [['Kalem', 'Tutar']],
    body: [
      ['Net Satış (KDV Hariç)', para(pl.netSatis)],
      ['Tahsil Edilen KDV', para(pl.tahsilEdilenKdv)],
      ['Ödenecek KDV', para(pl.odenmesiGerekenKdv)],
      ['Kira Stopajı', para(pl.kiraStopaj)],
      ['Brüt Kâr', para(pl.brutKar)],
      ['Tahmini Vergi', para(pl.tahminiVergi)],
      ['NET AYLIK KÂR', para(pl.netAylikKar)],
      ['Net Kâr Marjı', pct(pl.netKarMarji)],
    ],
    headStyles: { fillColor: [123, 63, 142], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 6) {
        data.cell.styles.fontStyle = 'bold';
        const isPositive = pl.netAylikKar >= 0;
        data.cell.styles.fillColor = isPositive ? [240, 253, 244] : [254, 242, 242];
        data.cell.styles.textColor = isPositive ? [22, 163, 74] : [220, 38, 38];
      }
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── ROI & Başabaş ──────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 14; }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 45, 110);
  doc.text('5. ROI & Basabas Noktasi', 14, y);
  y += 5;
  doc.setTextColor(0, 0, 0);

  const roi = sonuc.roi;
  autoTable(doc, {
    startY: y,
    head: [['Gösterge', 'Değer']],
    body: [
      ['Katkı Marjı', pct(roi.katkilaMarji)],
      ['Başabaş Aylık Ciro', para(roi.basaBasAylikCiro)],
      ['Başabaş Günlük Ciro', para(roi.basaBasGunlukCiro)],
      ['Toplam Yatırım', para(sonuc.capex.toplamCapex)],
      ['Amortisman Süresi', roi.roiAy !== null ? `${Math.ceil(roi.roiAy)} ay` : 'Hesaplanamıyor'],
    ],
    headStyles: { fillColor: [123, 63, 142], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: (data) => {
      if (data.row.index === 4) {
        data.cell.styles.fillColor = [239, 230, 244];
        data.cell.styles.textColor = [90, 45, 110];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── Senaryo Tablosu ─────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 14; }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 45, 110);
  doc.text('6. Senaryo Karsilastirmasi', 14, y);
  y += 5;
  doc.setTextColor(0, 0, 0);

  const netSatisOrani = sonuc.ciro.aylikBrutCiro > 0 ? pl.netSatis / sonuc.ciro.aylikBrutCiro : 0;
  const sabitGider = sonuc.opex.personelToplamMaliyet + sonuc.opex.toplamSabitGider + pl.kiraStopaj;

  function senaryoNetKar(brutCiro: number): number {
    const ns = brutCiro * netSatisOrani;
    const deg = ns * roi.degiskenGiderOrani;
    const bk = ns - deg - sabitGider;
    if (bk <= 0) return bk;
    const vergi = pl.tahminiVergi > 0 && pl.brutKar > 0 ? bk * (pl.tahminiVergi / pl.brutKar) : 0;
    return bk - vergi;
  }

  const senaryolar = [
    { etiket: 'Dusuk (%70)', brutCiro: sonuc.ciro.dusukCiro },
    { etiket: 'Baz (%100)', brutCiro: sonuc.ciro.bazCiro },
    { etiket: 'Yuksek (%130)', brutCiro: sonuc.ciro.yuksekCiro },
  ];

  autoTable(doc, {
    startY: y,
    head: [['Senaryo', 'Brüt Ciro', 'Net Kâr', 'Kâr Marjı', 'ROI']],
    body: senaryolar.map(s => {
      const nk = senaryoNetKar(s.brutCiro);
      const ns = s.brutCiro * netSatisOrani;
      const marj = ns > 0 ? nk / ns : 0;
      const roiStr = nk > 0 ? `${Math.ceil(sonuc.capex.toplamCapex / nk)} ay` : '—';
      return [s.etiket, para(s.brutCiro), para(nk), pct(marj), roiStr];
    }),
    headStyles: { fillColor: [123, 63, 142], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── Uyarı Notu ─────────────────────────────────────────────────────────
  if (y > 250) { doc.addPage(); y = 14; }
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(14, y, pageW - 28, 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 80, 0);
  doc.text(
    'Bu rapor yalnizca tahmini hesaplama icerir. Amortismam muhasebesi, tam vergi dilimi, bankacilik giderleri ve sigorta dahil degildir.',
    18, y + 7,
    { maxWidth: pageW - 36 },
  );
  doc.text('Kesin finansal karar icin mali musavir destegi aliniz.', 18, y + 13);

  // ── Footer ──────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(90, 45, 110);
    doc.rect(0, ph - 10, pageW, 10, 'F');
    doc.setFontSize(7);
    doc.setTextColor(200, 180, 220);
    doc.text('Restoran Maliyet Hesaplama Araci — Yalnizca bilgi amaclidir', 14, ph - 3.5);
    doc.text(`Sayfa ${i} / ${pageCount}`, pageW - 14, ph - 3.5, { align: 'right' });
  }

  void renk; // kullanılmayan referans suppress
  doc.save(`fizibilite_${form.isletmeAdi || 'rapor'}_${tarih().replace(/\./g, '-')}.pdf`);
}
