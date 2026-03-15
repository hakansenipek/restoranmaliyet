'use client';
import { HesaplamaGirdisi, HesaplamaSonucu, Senaryo } from '@/types';
import { excelIndir, pdfIndir } from '@/lib/export';
import { useState } from 'react';

interface Props {
  girdi: HesaplamaGirdisi;
  sonuc: HesaplamaSonucu;
  senaryolar: Senaryo[];
}

export default function IndirButonlari({ girdi, sonuc, senaryolar }: Props) {
  const [excelYukleniyor, setExcelYukleniyor] = useState(false);
  const [pdfYukleniyor, setPdfYukleniyor] = useState(false);

  const handleExcel = async () => {
    setExcelYukleniyor(true);
    try { await excelIndir(girdi, sonuc, senaryolar); } finally { setExcelYukleniyor(false); }
  };

  const handlePdf = async () => {
    setPdfYukleniyor(true);
    try { await pdfIndir(girdi, sonuc, senaryolar); } finally { setPdfYukleniyor(false); }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3" style={{ backgroundColor: '#5A2D6E' }}>
        <h3 className="text-sm font-semibold text-white tracking-wide">Rapor İndir</h3>
      </div>
      <div className="p-4 flex gap-3 flex-wrap">
        <button
          onClick={handleExcel}
          disabled={excelYukleniyor}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
          style={{ backgroundColor: '#16a34a' }}
        >
          {excelYukleniyor ? '⏳ Hazırlanıyor...' : '📥 Excel İndir'}
        </button>
        <button
          onClick={handlePdf}
          disabled={pdfYukleniyor}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
          style={{ backgroundColor: '#C4215A' }}
        >
          {pdfYukleniyor ? '⏳ Hazırlanıyor...' : '📄 PDF İndir'}
        </button>
      </div>
    </div>
  );
}
