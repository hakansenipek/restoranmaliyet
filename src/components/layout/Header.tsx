'use client';

type KaydetDurum = 'bos' | 'yukleniyor' | 'basarili' | 'hata';

interface Props {
  userEmail?: string;
  kaydetDurum?: KaydetDurum;
  onKaydet?: () => void;
  onCikis?: () => void;
  onGiris?: () => void;
}

export default function Header({
  userEmail,
  kaydetDurum = 'bos',
  onKaydet,
  onCikis,
  onGiris,
}: Props) {
  const kaydetRenk =
    kaydetDurum === 'basarili' ? '#16a34a' :
    kaydetDurum === 'hata' ? '#dc2626' :
    '#16a34a';

  const kaydetLabel =
    kaydetDurum === 'yukleniyor' ? 'Kaydediliyor…' :
    kaydetDurum === 'basarili' ? 'Kaydedildi ✓' :
    kaydetDurum === 'hata' ? 'Hata!' :
    'Kaydet';

  return (
    <header className="px-6 py-4" style={{ backgroundColor: '#5A2D6E' }}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Restoran Maliyet &amp; Açılış Öngörü
          </h1>
          <p className="text-xs text-purple-200">Yatırım fizibilite analizi hesaplama aracı</p>
        </div>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <>
              <span className="text-xs text-purple-200 hidden sm:inline">{userEmail}</span>
              <button
                onClick={onKaydet}
                disabled={kaydetDurum === 'yukleniyor'}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-60 transition-colors"
                style={{ backgroundColor: kaydetRenk }}
              >
                {kaydetLabel}
              </button>
              <button
                onClick={onCikis}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-purple-200 hidden sm:inline">
                Hesaplamalarını kaydet
              </span>
              <button
                onClick={onGiris}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors"
              >
                Giriş Yap
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
