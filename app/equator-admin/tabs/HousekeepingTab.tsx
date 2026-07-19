import {
  Search,
  CheckCircle2,
  BrushCleaning,
  Wrench,
  BedDouble,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Room, EnrichedBooking } from "../types";

interface Props {
  darkMode: boolean;
  rooms: Room[];
  bookings: EnrichedBooking[];
  onStatusChange: (
    roomId: string,
    status: "clean" | "cleaning" | "maintenance"
  ) => void;
}

export function HousekeepingTab({
  darkMode,
  rooms,
  bookings,
  onStatusChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const roomBookings = useMemo(() => {
    const map = new Map<string, EnrichedBooking>();

    bookings.forEach((b) => {
      if (
        b.room_id &&
        (b.booking_status === "checked_in" ||
          b.booking_status === "confirmed")
      ) {
        map.set(String(b.room_id), b);
      }
    });

    return map;
  }, [bookings]);

  const filteredRooms = rooms.filter((room) => {
    const q = search.toLowerCase();

    const matchSearch =
      room.name.toLowerCase().includes(q) ||
      room.room_number.toString().includes(q) ||
      room.category.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (filter === "all") return true;

    if (filter === "ready") return room.status === "available";

    if (filter === "cleaning") return room.status === "cleaning";

    if (filter === "maintenance") return room.status === "maintenance";

    if (filter === "occupied") return room.status === "occupied";

    return true;
  });

  const ready = rooms.filter((r) => r.status === "available").length;
  const cleaning = rooms.filter((r) => r.status === "cleaning").length;
  const maintenance = rooms.filter((r) => r.status === "maintenance").length;
  const occupied = rooms.filter((r) => r.status === "occupied").length;

  return (
    <div className="space-y-6">
      {/* KPI */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          darkMode={darkMode}
          title="Ready"
          value={ready}
          color="bg-emerald-500"
          icon={<CheckCircle2 size={18} />}
        />

        <Stat
          darkMode={darkMode}
          title="Cleaning"
          value={cleaning}
          color="bg-amber-500"
          icon={<BrushCleaning size={18} />}
        />

        <Stat
          darkMode={darkMode}
          title="Maintenance"
          value={maintenance}
          color="bg-red-500"
          icon={<Wrench size={18} />}
        />

        <Stat
          darkMode={darkMode}
          title="Occupied"
          value={occupied}
          color="bg-blue-500"
          icon={<BedDouble size={18} />}
        />
      </div>

      {/* Filters */}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room..."
            className={`w-full pl-9 pr-4 py-2 rounded-lg border ${
              darkMode
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-white border-slate-200"
            }`}
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`px-3 rounded-lg border ${
            darkMode
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <option value="all">All Rooms</option>
          <option value="ready">Ready</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          const booking = roomBookings.get(room.id);

          return (
            <div
              key={room.id}
              className={`rounded-xl border p-5 ${
                darkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">
                    Room {room.room_number}
                  </p>

                  <p className="text-sm text-slate-500">
                    {room.name}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {room.category}
                  </p>
                </div>

                <StatusBadge status={room.status} />
              </div>

              <div className="mt-5 space-y-2 text-sm">
                {booking ? (
                  <>
                    <div className="flex gap-2 items-center">
                      <User size={15} />

                      <span>{booking.guest_name}</span>
                    </div>

                    <p className="text-slate-500">
                      Checkout: {booking.check_out}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500">
                    No active guest
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5">
                <button
                  onClick={() =>
                    onStatusChange(room.id, "clean")
                  }
                  className="rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-white"
                >
                  Ready
                </button>

                <button
                  onClick={() =>
                    onStatusChange(room.id, "cleaning")
                  }
                  className="rounded-lg bg-amber-500 py-2 text-xs font-semibold text-white"
                >
                  Cleaning
                </button>

                <button
                  onClick={() =>
                    onStatusChange(room.id, "maintenance")
                  }
                  className="rounded-lg bg-red-500 py-2 text-xs font-semibold text-white"
                >
                  Repair
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  darkMode,
  title,
  value,
  color,
  icon,
}: any) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        darkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-white border-slate-100"
      }`}
    >
      <div className="flex justify-between">
        <span className="text-xs uppercase text-slate-400">
          {title}
        </span>

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${color}`}
        >
          {icon}
        </div>
      </div>

      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Available: "bg-emerald-100 text-emerald-700",
    Occupied: "bg-blue-100 text-blue-700",
    Cleaning: "bg-amber-100 text-amber-700",
    Maintenance: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status as keyof typeof styles] ??
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}