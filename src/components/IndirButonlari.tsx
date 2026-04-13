'use client';

import type { FormDurumu, HesaplamaSonucu } from '@/types';

interface Props {
  form: FormDurumu;
  sonuc: HesaplamaSonucu;
}

export default function IndirButonlari({ form, sonuc }: Props) {
  async function handleExcel() {
    const { excelIndir } = await import('@/lib/export');
    excelIndir(form, sonuc);
  }

  async function handlePdf() {
    const { pdfIndir } = await import('@/lib/export');
    pdfIndir(form, sonuc);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExcel}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#16a34a' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel İndir
      </button>

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
