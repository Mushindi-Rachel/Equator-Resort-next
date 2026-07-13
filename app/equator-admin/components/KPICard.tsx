import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}

export function KPICard({ label, value, sub, icon: Icon, trend, color }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[10px] text-slate-400 tracking-[0.15em] uppercase font-semibold">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <div>
        <p className="font-display text-slate-900 text-3xl font-bold">{value}</p>
        {sub && <p className="font-sans text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-sans font-semibold ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
          {trend === 'up'   ? <ArrowUpRight size={13} />   : null}
          {trend === 'down' ? <ArrowDownRight size={13} /> : null}
          {trend === 'up'      ? '+12% vs last week'  : ''}
          {trend === 'down'    ? '-3% vs last week'   : ''}
          {trend === 'neutral' ? 'No change'          : ''}
        </div>
      )}
    </div>
  );
}