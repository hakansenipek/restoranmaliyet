import type {
  FizibiliteGirdisi,
  FizibiliteSonucu,
  CapexGirdisi,
  GelirGirdisi,
  MekanGirdisi,
  PersonelGirdisi,
  GenelGiderGirdisi,
  DegiskenGiderGirdisi,
} from '@/types/fizibilite';

// ─── VARSAYILAN DEĞERLER ─────────────────────────────────────────────────────

export const FIZIBILITE_VARSAYILAN: FizibiliteGirdisi = {
  isletmeAdi: 'Örnek Kafe',

  capex: {
    mimari: {
      konseptTasarim: 50_000,
      belediyeRuhsatProjesi: 30_000,
      dogalgazElektrikProjesi: 20_000,
    },
    mutfak: {
      tezgahEvyeRaf: 80_000,
      davlumbaz: 40_000,
      firin: 60_000,
      ocaklar: 50_000,
      fritoz: 20_000,
      bulasikmakine: 70_000,
      buzMakine: 25_000,
      dikBuzdolabi: 35_000,
      tezgahAltiDolap: 30_000,
      derinDondurucular: 25_000,
      sogukHavaDeposu: 80_000,
      mikserBlender: 15_000,
      teraziVakum: 10_000,
      dilimlemeMakine: 12_000,
      porselen: 20_000,
      camEsyasi: 10_000,
      catalkasik: 8_000,
    },
    dekorasyon: {
      zeminDuvar: 200_000,
      mobilya: 150_000,
      aydinlatma: 50_000,
      disAlan: 40_000,
      wcHijyen: 30_000,
    },
    teknoloji: {
      posYazilim: 15_000,
      posTerminal: 20_000,
      adisyonYazici: 8_000,
      kameraDvr: 25_000,
      alarmYangın: 20_000,
      muzikSistemi: 15_000,
    },
    resmi: {
      belediyeRuhsatHarci: 20_000,
      tapdkAlkolBedeli: 0,
      emlakcıKomisyonu: 30_000,
      kiraDepozitosu: 60_000,
      ilkStokMaliyeti: 50_000,
      gorulenGiderler: 0, // Otomatik hesaplanır
    },
  },

  mekan: {
    toplamMetrekare: 150,
    mutfakMetrekare: 40,
    depoMetrekare: 15,
    kapaliMasa: 15,
    kapaliSandalye: 60,
    acikMasa: 5,
    acikSandalye: 20,
    calismaGunleri: {
      pazartesi: true,
      sali: true,
      carsamba: true,
      persembe: true,
      cuma: true,
      cumartesi: true,
      pazar: false,
    },
  },

  personel: {
    gruplar: {
      yonetim: [
        { pozisyon: 'İşletme Müdürü', adet: 1, netMaas: 25_000, isverenMaliyet: 39_375, yolYemek: 2_000, prim: 2_000 },
      ],
      mutfak: [
        { pozisyon: 'Aşçıbaşı', adet: 1, netMaas: 20_000, isverenMaliyet: 31_500, yolYemek: 1_500, prim: 1_000 },
        { pozisyon: 'Yardımcı Aşçı', adet: 2, netMaas: 14_000, isverenMaliyet: 22_050, yolYemek: 1_500, prim: 0 },
      ],
      salon: [
        { pozisyon: 'Garson', adet: 3, netMaas: 12_000, isverenMaliyet: 18_900, yolYemek: 1_500, prim: 500 },
        { pozisyon: 'Barista', adet: 1, netMaas: 14_000, isverenMaliyet: 22_050, yolYemek: 1_500, prim: 500 },
      ],
      destek: [
        { pozisyon: 'Temizlik Görevlisi', adet: 1, netMaas: 11_000, isverenMaliyet: 17_325, yolYemek: 1_500, prim: 0 },
      ],
    },
    personelKiyafetMaliyeti: 5_000,
  },

  gelir: {
    sabah: { aktif: true, kisiBasiHarcama: 150, gunlukKisiSayisi: 20 },
    ogle: { aktif: true, kisiBasiHarcama: 250, gunlukKisiSayisi: 50 },
    aksam: { aktif: true, kisiBasiHarcama: 350, gunlukKisiSayisi: 40 },
    odemeTipleri: {
      nakitPay: 0.20,
      krediKartiPay: 0.50,
      yemekKartiPay: 0.20,
      onlinePlatformPay: 0.10,
    },
    dolulukCarpanlari: {
      pazartesi: 0.60,
      sali: 0.65,
      carsamba: 0.70,
      persembe: 0.75,
      cuma: 0.90,
      cumartesi: 1.00,
      pazar: 0.80,
    },
  },

  genelGider: {
    netKira: 60_000,
    kiraStopajOrani: 0.20,
    elektrik: 25_000,
    su: 5_000,
    dogalgazLpg: 15_000,
    internet: 1_500,
    telefon: 1_000,
    posMalzeme: 500,
    bakimOnarim: 5_000,
    klimaBakim: 2_000,
    hasereIlaclama: 1_500,
    aidat: 0,
  },

  degiskenGider: {
    yiyecekMaliyetOrani: 0.32,
    icecekMaliyetOrani: 0.25,
    fireZayiatOrani: 0.04,
    sarfMalzemeOrani: 0.02,
  },
};

// ─── CAPEX HESAPLAMA ─────────────────────────────────────────────────────────

export function capexHesapla(
  capex: CapexGirdisi
): Record<string, number> & { toplam: number } {
  const mimari = Object.values(capex.mimari).reduce((t, v) => t + v, 0);
  const mutfak = Object.values(capex.mutfak).reduce((t, v) => t + v, 0);
  const dekorasyon = Object.values(capex.dekorasyon).reduce((t, v) => t + v, 0);
  const teknoloji = Object.values(capex.teknoloji).reduce((t, v) => t + v, 0);

  // Görülmeyen giderler: diğer 4 kategori toplamının %10'u
  const araToplam = mimari + mutfak + dekorasyon + teknoloji;
  const resmiBase =
    capex.resmi.belediyeRuhsatHarci +
    capex.resmi.tapdkAlkolBedeli +
    capex.resmi.emlakcıKomisyonu +
    capex.resmi.kiraDepozitosu +
    capex.resmi.ilkStokMaliyeti;
  const gorulenGiderler = araToplam * 0.10;
  const resmi = resmiBase + gorulenGiderler;

  const toplam = araToplam + resmi;

  return { mimari, mutfak, dekorasyon, teknoloji, resmi, gorulenGiderler, toplam };
}

// ─── GELİR HESAPLAMA ─────────────────────────────────────────────────────────

export function gelirHesapla(
  gelir: GelirGirdisi,
  mekan: MekanGirdisi
): { brutCiro: number; komisyonGider: number; netCiro: number } {
  const gunler = [
    'pazartesi',
    'sali',
    'carsamba',
    'persembe',
    'cuma',
    'cumartesi',
    'pazar',
  ] as const;

  const ogeler = [gelir.sabah, gelir.ogle, gelir.aksam] as const;

  // Haftada kaç gün çalışıyor
  const calismaGunSayisi = gunler.filter((g) => mekan.calismaGunleri[g]).length;

  // Ayda ortalama çalışma günü (4.333 hafta)
  const aylikCalismaSayi = (calismaGunSayisi / 7) * (365 / 12);

  // Günlük ağırlıklı ortalama doluluk çarpanı (sadece çalışılan günler)
  const calisilanGunler = gunler.filter((g) => mekan.calismaGunleri[g]);
  const ortalamaDoluluk =
    calisilanGunler.length > 0
      ? calisilanGunler.reduce((t, g) => t + gelir.dolulukCarpanlari[g], 0) /
        calisilanGunler.length
      : 0;

  // Günlük brüt ciro
  let gunlukCiro = 0;
  for (const ogun of ogeler) {
    if (!ogun.aktif) continue;
    gunlukCiro += ogun.kisiBasiHarcama * ogun.gunlukKisiSayisi * ortalamaDoluluk;
  }

  const brutCiro = gunlukCiro * aylikCalismaSayi;

  const { krediKartiPay, yemekKartiPay, onlinePlatformPay } = gelir.odemeTipleri;
  const komisyonGider =
    brutCiro *
    (krediKartiPay * 0.02 + yemekKartiPay * 0.10 + onlinePlatformPay * 0.20);

  const netCiro = brutCiro - komisyonGider;

  return { brutCiro, komisyonGider, netCiro };
}

// ─── PERSONEL HESAPLAMA ──────────────────────────────────────────────────────

export function personelHesapla(personel: PersonelGirdisi): {
  toplamNetMaas: number;
  toplamIsverenMaliyet: number;
  toplamYolYemek: number;
  toplamPrim: number;
  genelToplam: number;
} {
  const tumKalemler = [
    ...personel.gruplar.yonetim,
    ...personel.gruplar.mutfak,
    ...personel.gruplar.salon,
    ...personel.gruplar.destek,
  ];

  let toplamNetMaas = 0;
  let toplamIsverenMaliyet = 0;
  let toplamYolYemek = 0;
  let toplamPrim = 0;

  for (const kalem of tumKalemler) {
    const isverenMaliyet = kalem.netMaas * 1.575;
    toplamNetMaas += kalem.netMaas * kalem.adet;
    toplamIsverenMaliyet += isverenMaliyet * kalem.adet;
    toplamYolYemek += kalem.yolYemek * kalem.adet;
    toplamPrim += kalem.prim * kalem.adet;
  }

  const genelToplam =
    toplamIsverenMaliyet +
    toplamYolYemek +
    toplamPrim +
    personel.personelKiyafetMaliyeti;

  return {
    toplamNetMaas,
    toplamIsverenMaliyet,
    toplamYolYemek,
    toplamPrim,
    genelToplam,
  };
}

// ─── GENEL GİDER HESAPLAMA ───────────────────────────────────────────────────

export function genelGiderHesapla(gider: GenelGiderGirdisi): {
  kiraBrut: number;
  enerjiler: number;
  iletisim: number;
  bakim: number;
  toplam: number;
} {
  const kiraBrut = gider.netKira * (1 + gider.kiraStopajOrani);
  const enerjiler = gider.elektrik + gider.su + gider.dogalgazLpg;
  const iletisim = gider.internet + gider.telefon + gider.posMalzeme;
  const bakim = gider.bakimOnarim + gider.klimaBakim + gider.hasereIlaclama + gider.aidat;
  const toplam = kiraBrut + enerjiler + iletisim + bakim;

  return { kiraBrut, enerjiler, iletisim, bakim, toplam };
}

// ─── ANA FİZİBİLİTE HESAPLAMA ────────────────────────────────────────────────

export function fizibiliteHesapla(girdi: FizibiliteGirdisi): FizibiliteSonucu {
  // Capex
  const capexDetay = capexHesapla(girdi.capex);
  const toplamCapex = capexDetay.toplam;
  const capexKategoriDetay: Record<string, number> = {
    Mimari: capexDetay.mimari,
    Mutfak: capexDetay.mutfak,
    Dekorasyon: capexDetay.dekorasyon,
    Teknoloji: capexDetay.teknoloji,
    'Resmi & Diğer': capexDetay.resmi,
  };

  // Gelir
  const { brutCiro, komisyonGider, netCiro } = gelirHesapla(
    girdi.gelir,
    girdi.mekan
  );

  // Personel
  const personelSonuc = personelHesapla(girdi.personel);
  const toplamPersonelMaliyet = personelSonuc.genelToplam;

  // SMM (Değişken giderler)
  const { yiyecekMaliyetOrani, icecekMaliyetOrani, fireZayiatOrani, sarfMalzemeOrani } =
    girdi.degiskenGider;
  const kombineSmmOrani =
    yiyecekMaliyetOrani * 0.7 + // Yiyecek gelirin %70'i varsayım
    icecekMaliyetOrani * 0.3 + // İçecek gelirin %30'u varsayım
    fireZayiatOrani +
    sarfMalzemeOrani;
  const toplamSMMGider = netCiro * kombineSmmOrani;
  const smmOrani = brutCiro > 0 ? toplamSMMGider / brutCiro : 0;

  // Genel giderler
  const genelGiderSonuc = genelGiderHesapla(girdi.genelGider);
  const toplamGenelGider = genelGiderSonuc.toplam;

  // Toplam aylık gider
  const toplamAylikGider = toplamPersonelMaliyet + toplamSMMGider + toplamGenelGider + komisyonGider;

  // Kârlılık
  const faaliyetKari = netCiro - toplamPersonelMaliyet - toplamSMMGider - toplamGenelGider;
  const netKarMarji = brutCiro > 0 ? faaliyetKari / brutCiro : 0;

  // Personel/ciro oranı
  const personelCiroOrani = brutCiro > 0 ? toplamPersonelMaliyet / brutCiro : 0;

  // Başabaş noktası
  const toplamSabitGider = toplamPersonelMaliyet + toplamGenelGider;
  const komisyonOrani = brutCiro > 0 ? komisyonGider / brutCiro : 0;
  const degiskenOranToplam = smmOrani + komisyonOrani;
  const basaBasPayda = 1 - degiskenOranToplam;
  const basaBasAylikCiro = basaBasPayda > 0 ? toplamSabitGider / basaBasPayda : Infinity;

  const gunler = [
    'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar',
  ] as const;
  const calismaGunSayisi = gunler.filter((g) => girdi.mekan.calismaGunleri[g]).length;
  const aylikCalismaSayi = (calismaGunSayisi / 7) * (365 / 12);
  const basaBasGunlukCiro = aylikCalismaSayi > 0 ? basaBasAylikCiro / aylikCalismaSayi : Infinity;

  // ROI
  const roiAy = faaliyetKari > 0 ? toplamCapex / faaliyetKari : Infinity;

  // Uyarılar
  const uyarilar: FizibiliteSonucu['uyarilar'] = [];

  if (faaliyetKari < 0) {
    uyarilar.push({
      seviye: 'kritik',
      mesaj: 'Mevcut projeksiyonda zarar öngörülüyor. Gelir artışı veya gider azaltımı gereklidir.',
    });
  }

  if (personelCiroOrani > 0.35) {
    uyarilar.push({
      seviye: 'kritik',
      mesaj: `Personel maliyeti cironun %${(personelCiroOrani * 100).toFixed(1)}'ini oluşturuyor. Sektör üst sınırı %35'tir.`,
    });
  } else if (personelCiroOrani > 0.30) {
    uyarilar.push({
      seviye: 'uyari',
      mesaj: `Personel maliyeti cironun %${(personelCiroOrani * 100).toFixed(1)}'ini oluşturuyor. %30 hedefinin üzerinde.`,
    });
  }

  if (smmOrani > 0.45) {
    uyarilar.push({
      seviye: 'kritik',
      mesaj: `SMM oranı %${(smmOrani * 100).toFixed(1)} ile kritik seviyede. Hedef aralık: %28-%38.`,
    });
  } else if (smmOrani > 0.38) {
    uyarilar.push({
      seviye: 'uyari',
      mesaj: `SMM oranı %${(smmOrani * 100).toFixed(1)} ile hedef aralığın (%38) üzerinde.`,
    });
  }

  if (roiAy > 36) {
    uyarilar.push({
      seviye: 'uyari',
      mesaj: `Yatırım geri dönüşü ${isFinite(roiAy) ? Math.round(roiAy) + ' ay' : 'hesaplanamıyor'} — 3 yılı aşıyor.`,
    });
  }

  return {
    toplamCapex,
    capexKategoriDetay,
    tahminiAylikBrutCiro: brutCiro,
    odemeKomisyonGideri: komisyonGider,
    netCiro,
    toplamPersonelMaliyet,
    personelCiroOrani,
    toplamSMMGider,
    smmOrani,
    toplamGenelGider,
    toplamAylikGider,
    faaliyetKari,
    netKarMarji,
    basaBasAylikCiro,
    basaBasGunlukCiro,
    roiAy,
    uyarilar,
  };
}
