'use client';
import { ChevronRight } from 'lucide-react';
import { SIDEBAR_ITEMS } from '../constants';
import type { SidebarTab } from '../types';

export default function Sidebar({
  tab,
  setTab,
  collapsed,
  darkMode,
}: {
  tab: SidebarTab;
  setTab: (t: SidebarTab) => void;
  collapsed: boolean;
  darkMode: boolean;
}) {
  return (
    <aside className={`flex-shrink-0 flex flex-col border-r transition-all duration-200 ${collapsed ? 'w-14' : 'w-52'} ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 text-sm">
        {SIDEBAR_ITEMS.map(({ key, label, icon: Icon, section }) => (
          <div key={key}>
            {section && !collapsed && (
              <p className={`px-3 pt-4 pb-1 text-[9px] font-bold tracking-[0.2em] uppercase ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>{section}</p>
            )}
            <button
              onClick={() => setTab(key)}
              title={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                ${tab === key
                  ? darkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                  : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && tab === key && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </button>
          </div>
        ))}
      </nav>

      <div className={`p-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">A</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className={`text-xs font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Admin</p>
              <p className={`text-[9px] truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Super Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}