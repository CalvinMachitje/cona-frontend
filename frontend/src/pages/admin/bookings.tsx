// frontend/src/pages/admin/bookings.tsx

import { useEffect, useState } from "react";
import {
  fetchBookings,
  updateBookingStatus,
  deleteBooking,
} from "@/services/bookings.api";

type Booking = {
  id: string;
  customer_name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail || "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: status as any } : b
        )
      );
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Bookings</h1>
        <div className="text-zinc-400">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Bookings</h1>
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">
          {error}
        </div>

        <button
          onClick={loadBookings}
          className="mt-4 px-4 py-2 bg-white text-black rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">

      <h1 className="text-3xl font-bold">Bookings</h1>

      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="w-full text-left">

          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Guests</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="border-t border-zinc-800 hover:bg-zinc-900/50"
              >
                <td className="p-3">
                  <div>
                    <p className="font-semibold">{b.customer_name}</p>
                    <p className="text-sm text-zinc-400">{b.email}</p>
                  </div>
                </td>

                <td className="p-3">{b.date}</td>
                <td className="p-3">{b.time}</td>
                <td className="p-3">{b.guests}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      b.status === "confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : b.status === "cancelled"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="p-3 space-x-2">

                  <select
                    value={b.status}
                    onChange={(e) =>
                      handleStatusChange(b.id, e.target.value)
                    }
                    className="bg-zinc-800 border border-zinc-700 p-1 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}
