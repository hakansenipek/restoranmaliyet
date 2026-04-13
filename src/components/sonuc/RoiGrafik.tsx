'use client';

import type { HesaplamaSonucu } from '@/types';

interface Props {
  sonuc: HesaplamaSonucu;
}

export default function RoiGrafik({ sonuc }: Props) {
  const { roi, capex } = sonuc;
  const { aylikKumulatifData, roiAy } = roi;
  const toplamCapex = capex.toplamCapex;

  // SVG boyutları
  const W = 700;
  const H = 320;
  const PAD = { top: 20, right: 20, bottom: 40, left: 80 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Y aralığı
  const karlar = aylikKumulatifData.map(d => d.kar);
  const maxKar = Math.max(toplamCapex * 1.1, ...karlar, 0);
  const minKar = Math.min(0, ...karlar);
  const rangeY = maxKar - minKar || 1;

  function xPos(ay: number) {
    return PAD.left + ((ay - 1) / 35) * chartW;
  }

  function yPos(v: number) {
    return PAD.top + (1 - (v - minKar) / rangeY) * chartH;
  }

  // Kümülatif kâr çizgisi (SVG polyline)
  const points = aylikKumulatifData
    .map(d => `${xPos(d.ay)},${yPos(d.kar)}`)
    .join(' ');

  // Alan doldurma (fill)
  const areaPoints =
    `${xPos(1)},${yPos(Math.max(minKar, 0))} ` +
    points +
    ` ${xPos(36)},${yPos(Math.max(minKar, 0))}`;

  // Y ekseni tick sayıları
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    minKar + (rangeY * i) / yTicks,
  );

  // X ekseni ticks (her 6 ayda bir)
  const xTicks = [1, 6, 12, 18, 24, 30, 36];

  // ROI kesişim noktası
  let roiX: number | null = null;
  let roiY: number | null = null;
  if (roiAy !== null && roiAy <= 36) {
    roiX = xPos(roiAy);
    roiY = yPos(toplamCapex);
  }

  function formatPara(v: number): string {
    if (Math.abs(v) >= 1_000_000) {
      return (v / 1_000_000).toFixed(1) + 'M ₺';
    }
    if (Math.abs(v) >= 1_000) {
      return (v / 1_000).toFixed(0) + 'K ₺';
    }
    return Math.round(v) + ' ₺';
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3" style={{ backgroundColor: '#7B3F8E' }}>
        <h2 className="text-sm font-bold text-white">ROI Grafiği — Kümülatif Kâr (36 Ay)</h2>
        {roiAy !== null ? (
          <p className="text-xs text-purple-200 mt-0.5">
            Yatırım {Math.ceil(roiAy)}. ayda amorti olur
          </p>
        ) : (
          <p className="text-xs text-red-300 mt-0.5">
            Aylık net kâr negatif — amortisman hesaplanamıyor
          </p>
        )}
      </div>

      <div className="p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 'auto', maxHeight: 360 }}
        >
          {/* Arka plan */}
          <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} fill="#fafafa" rx="4" />

          {/* Y ekseni grid + label */}
          {yTickValues.map((v, i) => {
            const y = yPos(v);
            return (
              <g key={i}>
                <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text
                  x={PAD.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#9ca3af"
                >
                  {formatPara(v)}
                </text>
              </g>
            );
          })}

          {/* X ekseni */}
          {xTicks.map(ay => {
            const x = xPos(ay);
            return (
              <g key={ay}>
                <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
                <text
                  x={x}
                  y={PAD.top + chartH + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#9ca3af"
                >
                  {ay}. ay
                </text>
              </g>
            );
          })}

          {/* Sıfır çizgisi */}
          {minKar < 0 && (
            <line
              x1={PAD.left}
              y1={yPos(0)}
              x2={PAD.left + chartW}
              y2={yPos(0)}
              stroke="#6b7280"
              strokeWidth="1"
            />
          )}

          {/* CAPEX kırmızı çizgi */}
          <line
            x1={PAD.left}
            y1={yPos(toplamCapex)}
            x2={PAD.left + chartW}
            y2={yPos(toplamCapex)}
            stroke="#dc2626"
            strokeWidth="1.5"
            strokeDasharray="6,3"
          />
          <text
            x={PAD.left + chartW - 4}
            y={yPos(toplamCapex) - 5}
            textAnchor="end"
            fontSize="10"
            fill="#dc2626"
          >
            Yatırım: {formatPara(toplamCapex)}
          </text>

          {/* Kümülatif kâr alanı */}
          <polygon points={areaPoints} fill="#7B3F8E" fillOpacity="0.08" />

          {/* Kümülatif kâr çizgisi */}
          <polyline
            points={points}
            fill="none"
            stroke="#7B3F8E"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* ROI kesişim noktası */}
          {roiX !== null && roiY !== null && (
            <g>
              <circle cx={roiX} cy={roiY} r="6" fill="#7B3F8E" />
              <circle cx={roiX} cy={roiY} r="10" fill="#7B3F8E" fillOpacity="0.2" />
              <text
                x={roiX + 12}
                y={roiY - 8}
                fontSize="11"
                fontWeight="600"
                fill="#7B3F8E"
              >
                {Math.ceil(roiAy!)}. ay
              </text>
            </g>
          )}

          {/* Legend */}
          <g transform={`translate(${PAD.left + 8}, ${PAD.top + 10})`}>
            <line x1="0" y1="6" x2="20" y2="6" stroke="#7B3F8E" strokeWidth="2.5" />
            <text x="24" y="10" fontSize="10" fill="#6b7280">Kümülatif Kâr</text>
            <line x1="120" y1="6" x2="140" y2="6" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6,3" />
            <text x="144" y="10" fontSize="10" fill="#6b7280">Toplam Yatırım</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
