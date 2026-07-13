'use client';

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
} from 'lucide-react';

interface Props {
    darkMode: boolean;
    onView: (reportId: string) => void;
}

const REPORTS = [
  {
    id: 'daily',
    label: 'Daily Report',
    desc: "Today's arrivals, departures, occupancy and revenue.",
    icon: Calendar,
    updated: 'Today',
  },
  {
    id: 'weekly',
    label: 'Weekly Report',
    desc: 'Weekly booking trends and occupancy statistics.',
    icon: Calendar,
    updated: 'This Week',
  },
  {
    id: 'monthly',
    label: 'Monthly Report',
    desc: 'Monthly reservations, revenue and occupancy.',
    icon: Hotel,
    updated: 'This Month',
  },
  {
    id: 'occupancy',
    label: 'Occupancy Report',
    desc: 'Room utilization and occupancy percentage.',
    icon: BedDouble,
    updated: 'Live',
  },
  {
    id: 'revenue',
    label: 'Revenue Report',
    desc: 'Payments, outstanding balances and income.',
    icon: DollarSign,
    updated: 'Live',
  },
  {
    id: 'guests',
    label: 'Guest Report',
    desc: 'Guest history, repeat visitors and statistics.',
    icon: Users,
    updated: 'Live',
  },
];

export function ReportsTab({
  darkMode,
  onView,
}: Props) {
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
          Preview reports before downloading them in PDF or Excel format.
        </p>
      </div>

      <div className="grid gap-4">

        {REPORTS.map((report) => {
          const Icon = report.icon;

          return (
            <div
              key={report.id}
              className={`rounded-xl border p-5 transition-all ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">

                <div className="flex gap-4">

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      darkMode
                        ? 'bg-slate-800'
                        : 'bg-amber-100'
                    }`}
                  >
                    <Icon
                      size={22}
                      className={
                        darkMode
                          ? 'text-amber-400'
                          : 'text-amber-600'
                      }
                    />
                  </div>

                  <div>
                    <h3
                      className={`font-semibold text-base ${
                        darkMode
                          ? 'text-white'
                          : 'text-slate-800'
                      }`}
                    >
                      {report.label}
                    </h3>

                    <p
                      className={`text-sm mt-1 ${
                        darkMode
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {report.desc}
                    </p>

                    <span
                      className={`inline-block mt-3 text-xs px-2 py-1 rounded-full ${
                        darkMode
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Last Updated: {report.updated}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">

                  {/* View */}

                  <button
                     onClick={() => onView(report.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Eye size={15} />
                    View
                  </button>

                  {/* PDF */}

                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode
                        ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300'
                        : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }`}
                  >
                    <FileText size={15} />
                    PDF
                  </button>

                  {/* Excel */}

                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode
                        ? 'bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    <FileSpreadsheet size={15} />
                    Excel
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}