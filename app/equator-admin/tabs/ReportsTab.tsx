'use client';

import { useState } from 'react';
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
  TrendingUp,
  TrendingDown,
  Clock,
  Mail,
  ChevronDown,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Activity,
  MoreVertical,
} from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: React.ElementType;
  color?: 'amber' | 'green' | 'red' | 'blue' | 'slate';
}

interface Report {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  updated: string;
  isLive?: boolean;
  category: 'operations' | 'insights';
  metrics?: Metric[];
  exportFormats: ('pdf' | 'excel' | 'csv')[];
}

interface Props {
  darkMode: boolean;
  onView: (reportId: string) => void;
  onExport?: (reportId: string, format: string) => void;
}

const REPORTS: Report[] = [
  {
    id: 'daily',
    label: 'Daily Report',
    desc: "Today's arrivals, departures, occupancy and revenue.",
    icon: Calendar,
    updated: '2 hours ago',
    category: 'operations',
    exportFormats: ['pdf', 'excel', 'csv'],
    metrics: [
      {
        label: 'Arrivals',
        value: 8,
        trend: 'up',
        trendValue: 25,
        color: 'green',
      },
      {
        label: 'Revenue',
        value: '$12,450',
        trend: 'up',
        trendValue: 15,
        color: 'amber',
      },
      {
        label: 'Occupancy',
        value: '87%',
        trend: 'stable',
        color: 'blue',
      },
    ],
  },
  {
    id: 'weekly',
    label: 'Weekly Report',
    desc: 'Weekly booking trends and occupancy statistics.',
    icon: Calendar,
    updated: '1 day ago',
    category: 'insights',
    exportFormats: ['pdf', 'excel'],
    metrics: [
      {
        label: 'Total Bookings',
        value: 42,
        trend: 'up',
        trendValue: 8,
        color: 'green',
      },
      {
        label: 'Avg Occupancy',
        value: '82%',
        trend: 'down',
        trendValue: 3,
        color: 'red',
      },
      {
        label: 'Revenue',
        value: '$98,200',
        trend: 'up',
        trendValue: 12,
        color: 'amber',
      },
    ],
  },
  {
    id: 'monthly',
    label: 'Monthly Report',
    desc: 'Monthly reservations, revenue and occupancy.',
    icon: Hotel,
    updated: 'Updated today',
    category: 'insights',
    exportFormats: ['pdf', 'excel', 'csv'],
    metrics: [
      {
        label: 'Total Reservations',
        value: 156,
        trend: 'up',
        trendValue: 22,
        color: 'green',
      },
      {
        label: 'Total Revenue',
        value: '$385,600',
        trend: 'up',
        trendValue: 18,
        color: 'amber',
      },
      {
        label: 'Repeat Guests',
        value: '34%',
        trend: 'up',
        trendValue: 5,
        color: 'blue',
      },
    ],
  },
  {
    id: 'occupancy',
    label: 'Occupancy Report',
    desc: 'Real-time room utilization and occupancy breakdown.',
    icon: BedDouble,
    updated: 'Live',
    isLive: true,
    category: 'operations',
    exportFormats: ['pdf', 'excel'],
    metrics: [
      {
        label: 'Occupied',
        value: '52 / 60',
        trend: 'stable',
        color: 'green',
      },
      {
        label: 'Available',
        value: 8,
        trend: 'stable',
        color: 'slate',
      },
      {
        label: 'Occupancy Rate',
        value: '87%',
        trend: 'stable',
        color: 'blue',
      },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue Report',
    desc: 'Payment breakdown and outstanding balances.',
    icon: DollarSign,
    updated: 'Live',
    isLive: true,
    category: 'insights',
    exportFormats: ['pdf', 'excel', 'csv'],
    metrics: [
      {
        label: 'Today',
        value: '$12,450',
        trend: 'up',
        trendValue: 15,
        color: 'green',
      },
      {
        label: 'Pending',
        value: '$8,300',
        trend: 'down',
        trendValue: 20,
        color: 'red',
      },
      {
        label: 'Overdue',
        value: '$2,150',
        trend: 'down',
        trendValue: 8,
        color: 'amber',
      },
    ],
  },
  {
    id: 'guests',
    label: 'Guest Report',
    desc: 'Guest statistics and repeat visitor analytics.',
    icon: Users,
    updated: 'Live',
    isLive: true,
    category: 'insights',
    exportFormats: ['pdf', 'excel'],
    metrics: [
      {
        label: 'Total Guests',
        value: 1254,
        trend: 'up',
        trendValue: 42,
        color: 'green',
      },
      {
        label: 'New Guests',
        value: 187,
        trend: 'up',
        trendValue: 10,
        color: 'blue',
      },
      {
        label: 'Repeat Rate',
        value: '38%',
        trend: 'up',
        trendValue: 6,
        color: 'amber',
      },
    ],
  },
];

function TrendBadge({
  trend,
  value,
  darkMode,
}: {
  trend?: 'up' | 'down' | 'stable';
  value?: number;
  darkMode: boolean;
}) {
  if (!trend || !value) return null;

  const icons = {
    up: <ArrowUpRight size={14} />,
    down: <ArrowDownRight size={14} />,
    stable: <Minus size={14} />,
  };

  const colors = {
    up: darkMode ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100',
    down: darkMode ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-100',
    stable: darkMode ? 'text-slate-400 bg-slate-800' : 'text-slate-600 bg-slate-100',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${colors[trend]}`}>
      {icons[trend]}
      {value}%
    </span>
  );
}

function MetricCard({
  metric,
  darkMode,
}: {
  metric: Metric;
  darkMode: boolean;
}) {
  const colorMap = {
    amber: darkMode
      ? { bg: 'bg-amber-900/20', text: 'text-amber-400', icon: 'text-amber-400' }
      : { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-600' },
    green: darkMode
      ? { bg: 'bg-green-900/20', text: 'text-green-400', icon: 'text-green-400' }
      : { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
    red: darkMode
      ? { bg: 'bg-red-900/20', text: 'text-red-400', icon: 'text-red-400' }
      : { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600' },
    blue: darkMode
      ? { bg: 'bg-blue-900/20', text: 'text-blue-400', icon: 'text-blue-400' }
      : { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' },
    slate: darkMode
      ? { bg: 'bg-slate-800', text: 'text-slate-400', icon: 'text-slate-400' }
      : { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'text-slate-600' },
  };

  const colors = colorMap[metric.color || 'slate'];

  return (
    <div className={`${colors.bg} px-3 py-2 rounded-lg flex items-center justify-between gap-3`}>
      <div>
        <p
          className={`text-xs font-medium ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {metric.label}
        </p>
        <p className={`text-sm font-semibold ${colors.text} mt-1`}>
          {metric.value}
          {metric.unit && <span className="text-xs ml-1">{metric.unit}</span>}
        </p>
      </div>
      {metric.trend && metric.trendValue && (
        <div className="flex-shrink-0">
          <TrendBadge
            trend={metric.trend}
            value={metric.trendValue}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}

function ExportMenu({
  report,
  darkMode,
  onExport,
}: {
  report: Report;
  darkMode: boolean;
  onExport?: (format: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatIcons = {
    pdf: { icon: FileText, color: 'text-red-500' },
    excel: { icon: FileSpreadsheet, color: 'text-green-500' },
    csv: { icon: FileSpreadsheet, color: 'text-blue-500' },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        <div
          className={`absolute right-0 mt-2 w-40 rounded-lg border shadow-lg z-10 overflow-hidden ${
            darkMode
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-slate-200'
          }`}
        >
          {report.exportFormats.map((format) => {
            const FormatIcon =
              formatIcons[format as keyof typeof formatIcons]?.icon ||
              FileText;
            const color =
              formatIcons[format as keyof typeof formatIcons]?.color ||
              'text-slate-500';

            return (
              <button
                key={format}
                onClick={() => {
                  onExport?.(format);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm font-medium text-left hover:bg-slate-800 transition-colors flex items-center gap-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <FormatIcon size={16} className={color} />
                {format.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReportCard({
  report,
  darkMode,
  onView,
  onExport,
}: {
  report: Report;
  darkMode: boolean;
  onView: (id: string) => void;
  onExport?: (id: string, format: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = report.icon;

  return (
    <div
      className={`rounded-xl border p-5 transition-all hover:shadow-md ${
        darkMode
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
          : 'bg-white border-slate-100 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex gap-4 flex-1">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              darkMode ? 'bg-slate-800' : 'bg-amber-100'
            }`}
          >
            <Icon
              size={22}
              className={darkMode ? 'text-amber-400' : 'text-amber-600'}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={`font-semibold text-base ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}
              >
                {report.label}
              </h3>
              {report.isLive && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    darkMode
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  <Activity size={12} />
                  Live
                </span>
              )}
            </div>

            <p
              className={`text-sm mt-1 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {report.desc}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <Clock size={12} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
              <span
                className={`text-xs ${
                  darkMode ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                {report.updated}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            darkMode
              ? 'hover:bg-slate-800 text-slate-400'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {report.metrics && report.metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {report.metrics.map((metric, idx) => (
            <MetricCard key={idx} metric={metric} darkMode={darkMode} />
          ))}
        </div>
      )}

      {expanded && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            darkMode
              ? 'bg-slate-800/50 text-slate-300'
              : 'bg-slate-50 text-slate-700'
          }`}
        >
          <p className="font-medium mb-2">Report Details</p>
          <ul className="space-y-1 text-xs">
            <li>• Available in {report.exportFormats.join(', ').toUpperCase()} format</li>
            <li>• Last updated: {report.updated}</li>
            <li>• Category: {report.category}</li>
            <li>• {report.metrics?.length || 0} key metrics included</li>
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          onClick={() => onView(report.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Eye size={15} />
          Preview
        </button>

        <ExportMenu
          report={report}
          darkMode={darkMode}
          onExport={(format) => onExport?.(report.id, format)}
        />
      </div>
    </div>
  );
}

export function ReportsTab({
  darkMode,
  onView,
  onExport,
}: Props) {
  const [filterCategory, setFilterCategory] = useState<
    'all' | 'operations' | 'insights'
  >('all');

  const filteredReports =
    filterCategory === 'all'
      ? REPORTS
      : REPORTS.filter((r) => r.category === filterCategory);

  const operationsCount = REPORTS.filter(
    (r) => r.category === 'operations'
  ).length;
  const insightsCount = REPORTS.filter(
    (r) => r.category === 'insights'
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h2
          className={`text-xl font-bold ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}
        >
          Reports Center
        </h2>

        <p
          className={`text-sm mt-1 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Monitor key metrics and generate comprehensive reports in multiple formats.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            filterCategory === 'all'
              ? darkMode
                ? 'bg-amber-900/40 text-amber-300 border border-amber-800'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
              : darkMode
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 size={16} />
          All Reports
        </button>

        <button
          onClick={() => setFilterCategory('operations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            filterCategory === 'operations'
              ? darkMode
                ? 'bg-amber-900/40 text-amber-300 border border-amber-800'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
              : darkMode
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Filter size={16} />
          Operations ({operationsCount})
        </button>

        <button
          onClick={() => setFilterCategory('insights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            filterCategory === 'insights'
              ? darkMode
                ? 'bg-amber-900/40 text-amber-300 border border-amber-800'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
              : darkMode
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Filter size={16} />
          Insights ({insightsCount})
        </button>
      </div>

      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            darkMode={darkMode}
            onView={onView}
            onExport={onExport}
          />
        ))}
      </div>
    </div>
  );
}
