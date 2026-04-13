interface Props {
  mesaj: string;
  tip?: 'uyari' | 'hata' | 'bilgi';
}

const stilMap = {
  uyari: 'bg-amber-50 border-amber-200 text-amber-800',
  hata: 'bg-red-50 border-red-200 text-red-800',
  bilgi: 'bg-blue-50 border-blue-200 text-blue-800',
} as const;

export default function UyariKutusu({ mesaj, tip = 'uyari' }: Props) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${stilMap[tip]}`}>
      {mesaj}
    </div>
  );
}
