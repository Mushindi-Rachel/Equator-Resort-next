'use client';

import { useMemo, useState } from 'react';
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Calendar,
  Hotel,
  DollarSign,
  Users,
  BedDouble,
  Clock,
  ChevronDown,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Activity,
  Star,
} from 'lucide-react';

import type { EnrichedBooking, Review, Room } from '../types';

/* ────────────────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────────────── */

interface Metric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  goodDirection?: 'up' | 'down'; // which direction counts as "good" for color
  color?: 'amber' | 'green' | 'red' | 'blue' | 'slate';
}

type ReportId =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'occupancy'
  | 'revenue'
  | 'guests';

interface ReportRow {
  [key: string]: string | number;
}

interface ReportMeta {
  id: ReportId;
  label: string;
  desc: string;
  icon: React.ElementType;
  category: 'operations' | 'insights';
  isLive?: boolean;
  exportFormats: ('pdf' | 'excel' | 'csv')[];
}

interface Props {
  darkMode: boolean;
  bookings: EnrichedBooking[];
  rooms: Room[];
  reviews: Review[];
  totalRevenue: number;
  onView: (reportId: string) => void;
  onExport?: (reportId: string, format: string) => void;
}

/* ────────────────────────────────────────────────────────────────────────
   Date / number helpers
──────────────────────────────────────────────────────────────────────── */

const todayStr = () => new Date().toISOString().split('T')[0];

const daysAgoStr = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const isBetween = (date: string | null | undefined, start: string, end: string) =>
  !!date && date >= start && date <= end;

const isThisMonth = (iso: string | null | undefined) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

const isLastMonth = (iso: string | null | undefined) => {
  if (!iso) return false;
  const d = new Date(iso);
  const ref = new Date();
  ref.setMonth(ref.getMonth() - 1);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

const fmtKES = (n: number) =>
  `KES ${Math.round(n).toLocaleString()}`;

const pctChange = (curr: number, prev: number) => {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return Math.round(((curr - prev) / prev) * 100);
};

const trendOf = (curr: number, prev: number): 'up' | 'down' | 'stable' => {
  if (curr === prev) return 'stable';
  return curr > prev ? 'up' : 'down';
};

const paidAmount = (list: EnrichedBooking[]) =>
  list
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

const downloadBlob = (filename: string, content: BlobPart, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const csvEscape = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCSV = (rows: ReportRow[]) => {
  if (!rows.length) return 'No data available';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(',')),
  ];
  return lines.join('\n');
};

const exportCSV = (filename: string, rows: ReportRow[]) => {
  downloadBlob(`${filename}.csv`, toCSV(rows), 'text/csv;charset=utf-8;');
};

const exportExcel = (filename: string, rows: ReportRow[]) => {
  const headers = rows.length ? Object.keys(rows[0]) : ['Info'];
  const body = rows.length
    ? rows
        .map(
          (r) =>
            `<tr>${headers.map((h) => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`
        )
        .join('')
    : `<tr><td>No data available</td></tr>`;
  const html = `<html><head><meta charset="utf-8" /></head><body>
    <table border="1">
      <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </body></html>`;
  downloadBlob(`${filename}.xls`, html, 'application/vnd.ms-excel');
};

const exportPDF = (title: string, subtitle: string, rows: ReportRow[]) => {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const body = rows.length
    ? rows
        .map(
          (r) =>
            `<tr>${headers.map((h) => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`
        )
        .join('')
    : `<tr><td>No data available for this period</td></tr>`;
  w.document.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, Arial, sans-serif; padding: 32px; color: #1e293b; }
      h1 { font-size: 20px; margin: 0 0 4px; color: #92400e; }
      p.sub { color: #64748b; margin: 0 0 24px; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
      th { background: #fef3c7; color: #92400e; }
      tr:nth-child(even) { background: #f8fafc; }
      @media print { body { padding: 12px; } }
    </style></head>
    <body>
      <h1>${title}</h1>
      <p class="sub">${subtitle} &middot; Generated ${new Date().toLocaleString()}</p>
      <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${body}</tbody></table>
    </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
};

/* ────────────────────────────────────────────────────────────────────────
   Small presentational pieces
──────────────────────────────────────────────────────────────────────── */

function TrendBadge({
  trend,
  value,
  goodDirection = 'up',
  darkMode,
}: {
  trend?: 'up' | 'down' | 'stable';
  value?: number;
  goodDirection?: 'up' | 'down';
  darkMode: boolean;
}) {
  if (!trend || value === undefined) return null;

  const isGood =
    trend === 'stable' ? true : trend === goodDirection;

  const icons = {
    up: <ArrowUpRight size={14} />,
    down: <ArrowDownRight size={14} />,
    stable: <Minus size={14} />,
  };

  const colors = isGood
    ? darkMode
      ? 'text-green-400 bg-green-900/30'
      : 'text-green-600 bg-green-100'
    : darkMode
      ? 'text-red-400 bg-red-900/30'
      : 'text-red-600 bg-red-100';

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
        trend === 'stable'
          ? darkMode
            ? 'text-slate-400 bg-slate-800'
            : 'text-slate-600 bg-slate-100'
          : colors
      }`}
    >
      {icons[trend]}
      {Math.abs(value)}%
    </span>
  );
}

function MetricCard({ metric, darkMode }: { metric: Metric; darkMode: boolean }) {
  const colorMap = {
    amber: darkMode
      ? { bg: 'bg-amber-900/20', text: 'text-amber-400' }
      : { bg: 'bg-amber-50', text: 'text-amber-600' },
    green: darkMode
      ? { bg: 'bg-green-900/20', text: 'text-green-400' }
      : { bg: 'bg-green-50', text: 'text-green-600' },
    red: darkMode
      ? { bg: 'bg-red-900/20', text: 'text-red-400' }
      : { bg: 'bg-red-50', text: 'text-red-600' },
    blue: darkMode
      ? { bg: 'bg-blue-900/20', text: 'text-blue-400' }
      : { bg: 'bg-blue-50', text: 'text-blue-600' },
    slate: darkMode
      ? { bg: 'bg-slate-800', text: 'text-slate-400' }
      : { bg: 'bg-slate-100', text: 'text-slate-600' },
  };
  const colors = colorMap[metric.color || 'slate'];

  return (
    <div className={`${colors.bg} px-3 py-2 rounded-lg flex items-center justify-between gap-3`}>
      <div className="min-w-0">
        <p className={`text-xs font-medium truncate ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {metric.label}
        </p>
        <p className={`text-sm font-semibold ${colors.text} mt-1 truncate`}>{metric.value}</p>
      </div>
      {metric.trend && metric.trendValue !== undefined && metric.trendValue !== 0 && (
        <div className="flex-shrink-0">
          <TrendBadge
            trend={metric.trend}
            value={metric.trendValue}
            goodDirection={metric.goodDirection}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}

function ExportMenu({
  formats,
  darkMode,
  onExport,
}: {
  formats: ('pdf' | 'excel' | 'csv')[];
  darkMode: boolean;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatIcons = {
    pdf: { icon: FileText, color: 'text-red-500', label: 'PDF' },
    excel: { icon: FileSpreadsheet, color: 'text-green-500', label: 'Excel' },
    csv: { icon: FileSpreadsheet, color: 'text-blue-500', label: 'CSV' },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          darkMode
            ? 'bg-amber-900/30 hover:bg-amber-900/50 text-amber-300'
            : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
        }`}
      >
        <Download size={15} />
        Export
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute right-0 mt-2 w-40 rounded-lg border shadow-lg z-20 overflow-hidden ${
              darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            {formats.map((format) => {
              const F = formatIcons[format];
              return (
                <button
                  key={format}
                  onClick={() => {
                    onExport(format);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-sm font-medium text-left transition-colors flex items-center gap-2 ${
                    darkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <F.icon size={16} className={F.color} />
                  {F.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ReportCard({
  meta,
  metrics,
  rows,
  updated,
  darkMode,
  onView,
  onExport,
}: {
  meta: ReportMeta;
  metrics: Metric[];
  rows: ReportRow[];
  updated: string;
  darkMode: boolean;
  onView: (id: string) => void;
  onExport: (id: string, format: 'pdf' | 'excel' | 'csv') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = meta.icon;
  const previewRows = rows.slice(0, 5);
  const columns = previewRows.length ? Object.keys(previewRows[0]) : [];

  return (
    <div
      className={`rounded-xl border p-5 transition-all hover:shadow-md ${
        darkMode
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
          : 'bg-white border-slate-100 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              darkMode ? 'bg-slate-800' : 'bg-amber-100'
            }`}
          >
            <Icon size={22} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {meta.label}
              </h3>
              {meta.isLive && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                  }`}
                >
                  <Activity size={12} />
                  Live
                </span>
              )}
            </div>

            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {meta.desc}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <Clock size={12} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
              <span className="text-xs text-slate-500">{updated}</span>
              <span className={`text-xs ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>•</span>
              <span className="text-xs text-slate-500">{rows.length} record{rows.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {metrics.map((metric, idx) => (
            <MetricCard key={idx} metric={metric} darkMode={darkMode} />
          ))}
        </div>
      )}

      {expanded && (
        <div
          className={`mb-4 rounded-lg overflow-hidden border ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          {rows.length === 0 ? (
            <div
              className={`p-4 text-sm text-center ${
                darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'
              }`}
            >
              No records for this period yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-800/70' : 'bg-slate-50'}>
                    {columns.map((c) => (
                      <th
                        key={c}
                        className={`text-left py-2 px-3 font-medium whitespace-nowrap ${
                          darkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c}
                          className={`py-2 px-3 whitespace-nowrap ${
                            darkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {row[c]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > previewRows.length && (
                <div
                  className={`text-xs px-3 py-2 ${
                    darkMode ? 'text-slate-500 bg-slate-800/30' : 'text-slate-500 bg-slate-50'
                  }`}
                >
                  Showing {previewRows.length} of {rows.length} — export for the full list.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Eye size={15} />
          {expanded ? 'Hide details' : 'Preview'}
        </button>

        <button
          onClick={() => onView(meta.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Hotel size={15} />
          Open
        </button>

        <ExportMenu
          formats={meta.exportFormats}
          darkMode={darkMode}
          onExport={(format) => onExport(meta.id, format)}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Main component
──────────────────────────────────────────────────────────────────────── */

const REPORT_META: ReportMeta[] = [
  {
    id: 'daily',
    label: 'Daily Report',
    desc: "Today's arrivals, departures and revenue.",
    icon: Calendar,
    category: 'operations',
    exportFormats: ['pdf', 'excel', 'csv'],
  },
  {
    id: 'weekly',
    label: 'Weekly Report',
    desc: 'Booking trends over the last 7 days.',
    icon: Calendar,
    category: 'insights',
    exportFormats: ['pdf', 'excel'],
  },
  {
    id: 'monthly',
    label: 'Monthly Report',
    desc: 'Reservations, revenue and repeat guests this month.',
    icon: Hotel,
    category: 'insights',
    exportFormats: ['pdf', 'excel', 'csv'],
  },
  {
    id: 'occupancy',
    label: 'Occupancy Report',
    desc: 'Real-time room utilization and occupancy breakdown.',
    icon: BedDouble,
    category: 'operations',
    isLive: true,
    exportFormats: ['pdf', 'excel'],
  },
  {
    id: 'revenue',
    label: 'Revenue Report',
    desc: 'Payment breakdown and outstanding balances.',
    icon: DollarSign,
    category: 'insights',
    isLive: true,
    exportFormats: ['pdf', 'excel', 'csv'],
  },
  {
    id: 'guests',
    label: 'Guest Report',
    desc: 'Guest statistics and repeat-visitor analytics.',
    icon: Users,
    category: 'insights',
    exportFormats: ['pdf', 'excel'],
  },
];

export function ReportsTab({
  darkMode,
  bookings,
  rooms,
  reviews,
  totalRevenue,
  onView,
  onExport,
}: Props) {
  const [filterCategory, setFilterCategory] = useState<'all' | 'operations' | 'insights'>('all');

  /* ── All live computation happens here ─────────────────────────────── */
  const computed = useMemo(() => {
    const today = todayStr();
    const weekStart = daysAgoStr(6); // last 7 days incl. today
    const prevWeekStart = daysAgoStr(13);
    const prevWeekEnd = daysAgoStr(7);

    /* Daily */
    const arrivals = bookings.filter((b) => b.check_in === today);
    const departures = bookings.filter((b) => b.check_out === today);
    const yesterdayArrivals = bookings.filter((b) => b.check_in === daysAgoStr(1));
    const dailyRevenue = paidAmount(arrivals);
    const yesterdayRevenue = paidAmount(yesterdayArrivals);

    const dailyRows: ReportRow[] = [
      ...arrivals.map((b) => ({
        Guest: b.guest_name || 'Guest',
        Room: b.rooms?.room_name || '—',
        Type: 'Arrival',
        'Check In': b.check_in,
        'Check Out': b.check_out,
        Amount: fmtKES(b.total_amount || 0),
        Status: b.payment_status || 'unknown',
      })),
      ...departures
        .filter((b) => b.check_in !== today)
        .map((b) => ({
          Guest: b.guest_name || 'Guest',
          Room: b.rooms?.room_name || '—',
          Type: 'Departure',
          'Check In': b.check_in,
          'Check Out': b.check_out,
          Amount: fmtKES(b.total_amount || 0),
          Status: b.payment_status || 'unknown',
        })),
    ];

    /* Weekly */
    const weekBookings = bookings.filter((b) => isBetween(b.created_at?.split('T')[0], weekStart, today));
    const prevWeekBookings = bookings.filter((b) =>
      isBetween(b.created_at?.split('T')[0], prevWeekStart, prevWeekEnd)
    );
    const weekRevenue = paidAmount(weekBookings);
    const prevWeekRevenue = paidAmount(prevWeekBookings);

    const weeklyRows: ReportRow[] = weekBookings.map((b) => ({
      Guest: b.guest_name || 'Guest',
      Room: b.rooms?.room_name || '—',
      'Booked On': b.created_at?.split('T')[0] || '—',
      'Check In': b.check_in,
      Nights:
        b.check_in && b.check_out
          ? Math.max(
              1,
              Math.round(
                (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000
              )
            )
          : '—',
      Amount: fmtKES(b.total_amount || 0),
      Status: b.payment_status || 'unknown',
    }));

    /* Monthly */
    const monthBookings = bookings.filter((b) => isThisMonth(b.created_at));
    const lastMonthBookings = bookings.filter((b) => isLastMonth(b.created_at));
    const monthRevenue = paidAmount(monthBookings);
    const lastMonthRevenue = paidAmount(lastMonthBookings);

    const guestKey = (b: EnrichedBooking) => b.guest_email || b.guest_name || 'unknown';
    const allGuestCounts = new Map<string, number>();
    bookings.forEach((b) => {
      const k = guestKey(b);
      allGuestCounts.set(k, (allGuestCounts.get(k) || 0) + 1);
    });
    const monthGuestKeys = new Set(monthBookings.map(guestKey));
    const repeatGuestsThisMonth = Array.from(monthGuestKeys).filter(
      (k) => (allGuestCounts.get(k) || 0) > 1
    ).length;
    const repeatRate = monthGuestKeys.size
      ? Math.round((repeatGuestsThisMonth / monthGuestKeys.size) * 100)
      : 0;

    const monthlyRows: ReportRow[] = monthBookings.map((b) => ({
      Guest: b.guest_name || 'Guest',
      Room: b.rooms?.room_name || '—',
      'Booked On': b.created_at?.split('T')[0] || '—',
      'Check In': b.check_in,
      'Check Out': b.check_out,
      Amount: fmtKES(b.total_amount || 0),
      Status: b.payment_status || 'unknown',
    }));

    /* Occupancy — room.status comes back from Supabase as 'Available' | 'Occupied' |
       'Reserved' | 'Cleaning' | 'Maintenance' (see HousekeepingTab / useAdminData),
       cast defensively since the local Room type declares a lowercase union. */
    const roomStatus = (r: Room) => String(r.status);
    const statusCounts = {
      Available: rooms.filter((r) => roomStatus(r) === 'Available').length,
      Occupied: rooms.filter((r) => roomStatus(r) === 'Occupied').length,
      Reserved: rooms.filter((r) => roomStatus(r) === 'Reserved').length,
      Cleaning: rooms.filter((r) => roomStatus(r) === 'Cleaning').length,
      Maintenance: rooms.filter((r) => roomStatus(r) === 'Maintenance').length,
    };
    const occupancyRate = rooms.length
      ? Math.round((statusCounts.Occupied / rooms.length) * 100)
      : 0;

    const occupancyRows: ReportRow[] = rooms.map((r) => ({
      Room: r.name,
      'Room #': r.room_number,
      Category: r.category,
      Status: r.status ?? '',
      'Max Guests': r.max_guests,
    }));

    /* Revenue */
    const pendingRevenue = bookings
      .filter((b) => b.payment_status === 'pending')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const overdueRevenue = bookings
      .filter((b) => b.payment_status === 'pending' && b.check_out && b.check_out < today)
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const refundedRevenue = bookings
      .filter((b) => b.payment_status === 'refunded')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const revenueRows: ReportRow[] = bookings
      .filter((b) => b.total_amount)
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .map((b) => ({
        Guest: b.guest_name || 'Guest',
        Reference: b.booking_reference || '—',
        Method: b.payment_method || '—',
        Amount: fmtKES(b.total_amount || 0),
        Status: b.payment_status || 'unknown',
        'Check Out': b.check_out || '—',
      }));

    /* Guests */
    const guestMap = new Map<
      string,
      { name: string; email: string; bookings: number; spend: number; lastStay: string }
    >();
    bookings.forEach((b) => {
      const k = guestKey(b);
      const existing = guestMap.get(k);
      const spend = b.payment_status === 'paid' ? b.total_amount || 0 : 0;
      if (existing) {
        existing.bookings += 1;
        existing.spend += spend;
        if ((b.check_in || '') > existing.lastStay) existing.lastStay = b.check_in || existing.lastStay;
      } else {
        guestMap.set(k, {
          name: b.guest_name || 'Guest',
          email: b.guest_email || '—',
          bookings: 1,
          spend,
          lastStay: b.check_in || '—',
        });
      }
    });
    const guestList = Array.from(guestMap.values()).sort((a, b) => b.spend - a.spend);
    const newGuestsThisMonth = monthGuestKeys.size;
    const repeatGuestsTotal = guestList.filter((g) => g.bookings > 1).length;
    const overallRepeatRate = guestList.length
      ? Math.round((repeatGuestsTotal / guestList.length) * 100)
      : 0;
    const avgRating = reviews.length
      ? Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10
      : 0;

    const guestRows: ReportRow[] = guestList.map((g) => ({
      Guest: g.name,
      Email: g.email,
      Bookings: g.bookings,
      'Total Spend': fmtKES(g.spend),
      'Last Stay': g.lastStay,
    }));

    return {
      today,
      daily: {
        rows: dailyRows,
        metrics: [
          {
            label: 'Arrivals',
            value: arrivals.length,
            trend: trendOf(arrivals.length, yesterdayArrivals.length),
            trendValue: pctChange(arrivals.length, yesterdayArrivals.length),
            goodDirection: 'up' as const,
            color: 'green' as const,
          },
          {
            label: 'Revenue',
            value: fmtKES(dailyRevenue),
            trend: trendOf(dailyRevenue, yesterdayRevenue),
            trendValue: pctChange(dailyRevenue, yesterdayRevenue),
            goodDirection: 'up' as const,
            color: 'amber' as const,
          },
          {
            label: 'Departures',
            value: departures.length,
            color: 'blue' as const,
          },
        ],
      },
      weekly: {
        rows: weeklyRows,
        metrics: [
          {
            label: 'Bookings',
            value: weekBookings.length,
            trend: trendOf(weekBookings.length, prevWeekBookings.length),
            trendValue: pctChange(weekBookings.length, prevWeekBookings.length),
            goodDirection: 'up' as const,
            color: 'green' as const,
          },
          {
            label: 'Revenue',
            value: fmtKES(weekRevenue),
            trend: trendOf(weekRevenue, prevWeekRevenue),
            trendValue: pctChange(weekRevenue, prevWeekRevenue),
            goodDirection: 'up' as const,
            color: 'amber' as const,
          },
          {
            label: 'Occupancy',
            value: `${occupancyRate}%`,
            color: 'blue' as const,
          },
        ],
      },
      monthly: {
        rows: monthlyRows,
        metrics: [
          {
            label: 'Reservations',
            value: monthBookings.length,
            trend: trendOf(monthBookings.length, lastMonthBookings.length),
            trendValue: pctChange(monthBookings.length, lastMonthBookings.length),
            goodDirection: 'up' as const,
            color: 'green' as const,
          },
          {
            label: 'Revenue',
            value: fmtKES(monthRevenue),
            trend: trendOf(monthRevenue, lastMonthRevenue),
            trendValue: pctChange(monthRevenue, lastMonthRevenue),
            goodDirection: 'up' as const,
            color: 'amber' as const,
          },
          {
            label: 'Repeat Guests',
            value: `${repeatRate}%`,
            color: 'blue' as const,
          },
        ],
      },
      occupancy: {
        rows: occupancyRows,
        metrics: [
          {
            label: 'Occupied',
            value: `${statusCounts.Occupied} / ${rooms.length}`,
            color: 'green' as const,
          },
          {
            label: 'Available',
            value: statusCounts.Available,
            color: 'slate' as const,
          },
          {
            label: 'Occupancy Rate',
            value: `${occupancyRate}%`,
            color: 'blue' as const,
          },
        ],
      },
      revenue: {
        rows: revenueRows,
        metrics: [
          {
            label: 'Collected',
            value: fmtKES(totalRevenue),
            color: 'green' as const,
          },
          {
            label: 'Pending',
            value: fmtKES(pendingRevenue),
            color: 'amber' as const,
          },
          {
            label: 'Overdue',
            value: fmtKES(overdueRevenue),
            color: overdueRevenue > 0 ? ('red' as const) : ('slate' as const),
          },
        ],
      },
      guests: {
        rows: guestRows,
        metrics: [
          {
            label: 'Total Guests',
            value: guestList.length,
            color: 'green' as const,
          },
          {
            label: 'New This Month',
            value: newGuestsThisMonth,
            color: 'blue' as const,
          },
          {
            label: 'Repeat Rate',
            value: `${overallRepeatRate}%`,
            color: 'amber' as const,
          },
        ],
      },
      summary: {
        totalBookings: bookings.length,
        totalRevenue,
        occupancyRate,
        avgRating,
        refundedRevenue,
      },
    };
  }, [bookings, rooms, reviews, totalRevenue]);

  const reportsById: Record<ReportId, { rows: ReportRow[]; metrics: Metric[] }> = {
    daily: computed.daily,
    weekly: computed.weekly,
    monthly: computed.monthly,
    occupancy: computed.occupancy,
    revenue: computed.revenue,
    guests: computed.guests,
  };

  const updatedLabel: Record<ReportId, string> = {
    daily: `As of ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    weekly: 'Rolling 7-day window',
    monthly: 'Current calendar month',
    occupancy: 'Live',
    revenue: 'Live',
    guests: 'All-time',
  };

  const filteredMeta =
    filterCategory === 'all'
      ? REPORT_META
      : REPORT_META.filter((r) => r.category === filterCategory);

  const operationsCount = REPORT_META.filter((r) => r.category === 'operations').length;
  const insightsCount = REPORT_META.filter((r) => r.category === 'insights').length;

  const handleExport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    const meta = REPORT_META.find((r) => r.id === reportId);
    const data = reportsById[reportId as ReportId];
    if (!meta || !data) return;

    const filename = `equator-${meta.id}-report-${computed.today}`;
    if (format === 'csv') exportCSV(filename, data.rows);
    else if (format === 'excel') exportExcel(filename, data.rows);
    else exportPDF(meta.label, meta.desc, data.rows);

    onExport?.(reportId, format);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          Reports Center
        </h2>
        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Live metrics from your bookings, rooms and reviews — export any report as PDF, Excel or CSV.
        </p>
      </div>

      {/* Summary ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat
          darkMode={darkMode}
          label="Total Bookings"
          value={computed.summary.totalBookings.toLocaleString()}
        />
        <SummaryStat
          darkMode={darkMode}
          label="Revenue Collected"
          value={fmtKES(computed.summary.totalRevenue)}
        />
        <SummaryStat
          darkMode={darkMode}
          label="Occupancy Rate"
          value={`${computed.summary.occupancyRate}%`}
        />
        <SummaryStat
          darkMode={darkMode}
          label="Avg. Rating"
          value={
            computed.summary.avgRating > 0 ? (
              <span className="inline-flex items-center gap-1">
                {computed.summary.avgRating}
                <Star size={14} className="fill-amber-400 text-amber-400" />
              </span>
            ) : (
              '—'
            )
          }
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <FilterButton
          active={filterCategory === 'all'}
          darkMode={darkMode}
          onClick={() => setFilterCategory('all')}
          icon={<CheckCircle2 size={16} />}
          label="All Reports"
        />
        <FilterButton
          active={filterCategory === 'operations'}
          darkMode={darkMode}
          onClick={() => setFilterCategory('operations')}
          icon={<Filter size={16} />}
          label={`Operations (${operationsCount})`}
        />
        <FilterButton
          active={filterCategory === 'insights'}
          darkMode={darkMode}
          onClick={() => setFilterCategory('insights')}
          icon={<Filter size={16} />}
          label={`Insights (${insightsCount})`}
        />
      </div>

      <div className="grid gap-4">
        {filteredMeta.map((meta) => (
          <ReportCard
            key={meta.id}
            meta={meta}
            metrics={reportsById[meta.id].metrics}
            rows={reportsById[meta.id].rows}
            updated={updatedLabel[meta.id]}
            darkMode={darkMode}
            onView={onView}
            onExport={handleExport}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryStat({
  darkMode,
  label,
  value,
}: {
  darkMode: boolean;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}
    >
      <p className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className={`text-lg font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  darkMode,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  darkMode: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        active
          ? darkMode
            ? 'bg-amber-900/40 text-amber-300 border border-amber-800'
            : 'bg-amber-100 text-amber-700 border border-amber-200'
          : darkMode
            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}