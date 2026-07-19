'use client';

import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Room } from '../types';

interface Category {
  id: string;
  name: string;
}

interface RoomFormData {
  room_number: string;
  room_name: string;
  category_id: string;
  status: string;
  rating: number;
  featured: boolean;
}

interface Props {
  open: boolean;
  darkMode: boolean;
  room: Room | null;
  categories: Category[];
  loading?: boolean;
  onClose: () => void;
  onSave: (data: RoomFormData) => Promise<void>;
}

export default function RoomFormModal({
  open,
  darkMode,
  room,
  categories,
  loading = false,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<RoomFormData>({
  room_number: '',
  room_name: '',
  category_id: '',
  status: 'Available',
  rating: 5,
  featured: false,
});

  useEffect(() => {
    if (room) {
      setForm({
    room_number: room.room_number,
    room_name: room.room_name,
    category_id: (room as any).category_id ?? '',
    status: room.status,
    rating: room.rating,
    featured: room.featured ?? false,
});
    } else {
      setForm({
    room_number: '',
    room_name: '',
    category_id: '',
    status: 'Available',
    rating: 5,
    featured: false,
});
    }
  }, [room, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setForm(prev => ({
      ...prev,
      [name]:
        type === 'number'
          ? Number(value)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl ${
          darkMode ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <h2 className="text-xl font-bold">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium">Room Number</label>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                required
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Room Name</label>
              <input
                name="room_name"
                value={form.room_name}
                onChange={handleChange}
                required
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className="w-full mt-1 border rounded-lg p-2"
              >
                <option value="">Select Category</option>

                {categories?.map((c) => (
  <option key={c.id} value={c.id}>
    {c.name}
  </option>
))}

              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full mt-1 border rounded-lg p-2"
              >
               <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>


            

            <div>
              <label className="text-sm font-medium">Rating</label>
              <input
                type="number"
                min={1}
                max={5}
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg"
            >
              <Save size={16} />
              {loading ? 'Saving...' : room ? 'Update Room' : 'Save Room'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}