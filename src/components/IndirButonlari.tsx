'use client';

import type { FormDurumu, HesaplamaSonucu } from '@/types';

interface Props {
  form: FormDurumu;
  sonuc: HesaplamaSonucu;
}

export default function IndirButonlari({ form, sonuc }: Props) {
  async function handlePdf() {
    const { pdfIndir } = await import('@/lib/export');
    pdfIndir(form, sonuc);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handlePdf}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#C4215A' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        PDF Rapor İndir
      </button>
    </div>
  );
}
