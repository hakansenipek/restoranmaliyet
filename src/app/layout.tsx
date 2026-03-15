import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Restoran Maliyet Hesaplama',
  description: 'Restoran ve kafeterya açılış öngörü hesaplama aracı',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
