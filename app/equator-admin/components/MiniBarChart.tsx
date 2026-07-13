interface MiniBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export function MiniBarChart({ data, color = '#d4a574' }: MiniBarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-sm"
            style={{ height: `${(d.value / max) * 64}px`, backgroundColor: color, opacity: 0.8 + (i / data.length) * 0.2 }}
          />
          <span className="font-sans text-[9px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}