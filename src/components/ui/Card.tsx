interface Props { title: string; children: React.ReactNode; accent?: boolean; }
export default function Card({ title, children, accent = false }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3" style={{ backgroundColor: accent ? '#7B3F8E' : '#5A2D6E' }}>
        <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}
