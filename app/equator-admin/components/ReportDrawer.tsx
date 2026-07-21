'use client';

import { Drawer } from './drawer';
import type { EnrichedBooking, Room } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  report: string | null;
  bookings: EnrichedBooking[];
  rooms: Room[];
}

export default function ReportDrawer({
  open,
  onClose,
  report,
  bookings,
  rooms,
}: Props) {
  if (!report) return null;

  const today = new Date().toISOString().split('T')[0];

  const arrivals = bookings.filter(
    b => b.check_in === today
  );

  const departures = bookings.filter(
    b => b.check_out === today
  );

  const revenue = bookings
    .filter(
      b =>
        b.payment_status === 'paid' &&
        b.check_in === today
    )
    .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

  const occupied = rooms.filter(
    r => r.status === 'Occupied'
  ).length;

  const occupancy =
    rooms.length === 0
      ? 0
      : Math.round((occupied / rooms.length) * 100);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Daily Report"
    >
      <div className="space-y-6">

        <div className="grid grid-cols-2 gap-4">

          <Card title="Bookings Today" value={arrivals.length} />

          <Card
            title="Revenue"
            value={`KES ${revenue.toLocaleString()}`}
          />

          <Card
            title="Departures"
            value={departures.length}
          />

          <Card
            title="Occupancy"
            value={`${occupancy}%`}
          />

        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">
            Today's Arrivals
          </h3>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-2">Guest</th>

                  <th className="text-left py-2">Room</th>

                  <th className="text-left py-2">Amount</th>

                </tr>

              </thead>

              <tbody>

                {arrivals.length === 0 ? (
                  <tr>

                    <td
                      colSpan={3}
                      className="py-6 text-center text-slate-400"
                    >
                      No arrivals today
                    </td>

                  </tr>
                ) : (
                  arrivals.map(b => (
                    <tr
                      key={b.id}
                      className="border-b"
                    >
                      <td className="py-2">
                        {b.guest_name}
                      </td>

                      <td className="py-2">
                        {b.rooms?.room_name}
                      </td>

                      <td className="py-2">
                        KES{' '}
                        {b.total_amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </Drawer>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs uppercase text-slate-400">
        {title}
      </p>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}