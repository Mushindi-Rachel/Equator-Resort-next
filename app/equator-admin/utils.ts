export function statusColor(status: string) {
  if (status === 'paid')     return 'bg-emerald-100 text-emerald-700';
  if (status === 'pending')  return 'bg-amber-100 text-amber-700';
  if (status === 'refunded') return 'bg-blue-100 text-blue-700';
  return 'bg-red-100 text-red-700';
}

export function confirmationColor(status: string) {
  if (status === 'confirmed')   return 'bg-blue-100 text-blue-700';
  if (status === 'rejected')    return 'bg-red-100 text-red-700';
  if (status === 'checked_in')  return 'bg-purple-100 text-purple-700';
  if (status === 'checked_out') return 'bg-slate-100 text-slate-700';
  if (status === 'completed')   return 'bg-emerald-100 text-emerald-700';
  return 'bg-amber-100 text-amber-700';
}

export function generateRef() {
  return 'EPR-' + Math.random().toString(36).toUpperCase().substring(2, 8);
}

export function nightsBetween(checkin: string, checkout: string) {
  const a = new Date(checkin).getTime();
  const b = new Date(checkout).getTime();
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}