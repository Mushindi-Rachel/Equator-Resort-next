export function generateBookingRef() {
  return 'ECR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function nightsBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const diff = Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
}