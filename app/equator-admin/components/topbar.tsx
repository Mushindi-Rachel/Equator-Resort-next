'use client';
import { LayoutDashboard, Bell, Sun, Moon, UserCircle, LogOut, X } from 'lucide-react';
import type { AdminDashboardProps, ActivityLog } from '../types';

export default function TopBar({
  adminUser,
  darkMode,
  setDarkMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  onClose,
  notifications,
  notifOpen,
  setNotifOpen,
}: {
  adminUser?: { id: string; email: string };
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  onClose: () => void;
  notifications: { id: string; msg: string; type: 'booking' | 'payment' }[];
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-3 flex-shrink-0 border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-slate-400 hover:text-slate-700 transition-colors cursor-none">
          <LayoutDashboard size={18} />
        </button>
        <div>
          <p className={`font-display tracking-[0.2em] uppercase text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>Equator</p>
          <p className={`text-[9px] tracking-[0.25em] uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Christian Retreat Centre</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className={`relative p-2 rounded-lg transition-colors cursor-none ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <Bell size={17} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{notifications.length}</span>
            )}
          </button>
          {notifOpen && (
            <div className={`absolute right-0 top-10 w-72 rounded-xl shadow-xl border z-50 overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className={`px-4 py-3 border-b text-xs font-semibold tracking-wide ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                Notifications
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-slate-400">All caught up!</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b last:border-0 text-xs ${darkMode ? 'border-slate-800 text-slate-300' : 'border-slate-50 text-slate-600'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.type === 'booking' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                      {n.msg}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Dark mode */}
        <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors cursor-none ${darkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-500'}`}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <UserCircle size={15} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
          <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{adminUser?.email}</span>
        </div>
        <button onClick={onClose} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-none ${darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
          <LogOut size={13} /> Sign out
        </button>
        <button onClick={onClose} className={`p-1.5 transition-colors cursor-none ${darkMode ? 'text-slate-500 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'}`}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}