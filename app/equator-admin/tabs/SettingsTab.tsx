import { Check } from 'lucide-react';
import type { SettingsForm } from '../types';

interface Props {
  darkMode: boolean;
  settings: SettingsForm;
  setSettings: (fn: (prev: SettingsForm) => SettingsForm) => void;
  onSave: () => void;
}

const FIELDS: { label: string; key: keyof SettingsForm; type: string }[] = [
  { label: 'Tax Rate (%)',        key: 'taxRate',           type: 'number' },
  { label: 'Check-in Time',       key: 'checkinTime',       type: 'time' },
  { label: 'Check-out Time',      key: 'checkoutTime',      type: 'time' },
  { label: 'Currency',            key: 'currency',          type: 'text' },
  { label: 'Booking Deposit (%)', key: 'depositPercent',    type: 'number' },
];

export function SettingsTab({ darkMode, settings, setSettings, onSave }: Props) {
  return (
    <div className="max-w-xl">
      <div className={`rounded-xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Resort Settings</p>
        <div className="space-y-5">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{f.label}</label>
              <input type={f.type} value={settings[f.key]}
                onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
            </div>
          ))}
          <div>
            <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Cancellation Policy</label>
            <textarea value={settings.cancellationPolicy}
              onChange={e => setSettings(p => ({ ...p, cancellationPolicy: e.target.value }))} rows={3}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
          </div>
        </div>
        <button onClick={onSave}
          className="mt-5 py-2.5 px-5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-none flex items-center gap-2">
          <Check size={14} /> Save Settings
        </button>
      </div>
    </div>
  );
}