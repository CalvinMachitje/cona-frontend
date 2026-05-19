// frontend/src/pages/staff/pos.tsx
import { useEffect, useState } from "react";
import axios from "axios";

type Table = {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
};

type Booking = {
  id: string;
  guest_name: string;
  guests: number;
  status: string;
};

export default function StaffPOS() {
  const [tables, setTables] = useState<Table[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const token = localStorage.getItem("admin_token");

  const loadData = async () => {
    const [t, b] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${import.meta.env.VITE_API_URL}/staff/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setTables(t.data);
    setBookings(b.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔥 Seat customer (create session)
  const seatCustomer = async (bookingId: string, tableId: string) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/staff/seat`,
      { bookingId, tableId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    loadData();
  };

  return (
    <div className="p-6 text-white space-y-6">

      <h1 className="text-3xl font-bold">
        Staff POS System
      </h1>

      {/* BOOKINGS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Live Bookings Queue
        </h2>

        <div className="space-y-2">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded flex justify-between"
            >
              <div>
                <p className="font-bold">{b.guest_name}</p>
                <p className="text-sm text-zinc-400">
                  {b.guests} guests
                </p>
              </div>

              <div className="space-x-2">
                {tables
                  .filter(
                    (t) =>
                      t.capacity >= b.guests &&
                      t.status === "available"
                  )
                  .slice(0, 2)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => seatCustomer(b.id, t.id)}
                      className="px-3 py-1 bg-white text-black rounded"
                    >
                      Seat at {t.table_number}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE GRID */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Table Status
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {tables.map((t) => (
            <div
              key={t.id}
              className={`p-3 rounded border ${
                t.status === "available"
                  ? "border-green-500"
                  : t.status === "occupied"
                  ? "border-red-500"
                  : "border-yellow-500"
              }`}
            >
              <p className="font-bold">
                Table {t.table_number}
              </p>

              <p className="text-sm text-zinc-400">
                {t.status}
              </p>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}