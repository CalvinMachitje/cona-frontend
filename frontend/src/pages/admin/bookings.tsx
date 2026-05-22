// frontend/src/pages/admin/bookings.tsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  Clock3,
  Users,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

type Booking = {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  special_request?: string;
  created_at?: string;

  table_id?: string;
  table_number?: string;
  table_type?: string;
  table_location?: string;
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =========================
  // LOAD BOOKINGS
  // =========================
  const loadBookings = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      const { data, error } = await supabase.functions.invoke(
        "manage-bookings",
        {
          body: {
            action: "get",
            booking_date: selectedDate,
          },
        }
      );

      if (error) {
        console.error("BOOKING LOAD ERROR:", error);
        throw error;
      }

      setBookings(data?.data || []);
    } catch (err: any) {
      console.error("LOAD BOOKINGS ERROR:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================
  const handleStatusChange = async (
    bookingId: string,
    status: Booking["status"]
  ) => {
    try {
      const { error } = await supabase.functions.invoke(
        "manage-bookings",
        {
          body: {
            action: "update-status",
            booking_id: bookingId,
            status,
          },
        }
      );

      if (error) {
        console.error("STATUS UPDATE ERROR:", error);
        throw error;
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status,
              }
            : booking
        )
      );
    } catch (err: any) {
      console.error("STATUS UPDATE FAILED:", err);
      alert(err.message || "Failed to update booking status");
    }
  };

  // =========================
  // DELETE BOOKING
  // =========================
  const handleDelete = async (bookingId: string) => {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this booking?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase.functions.invoke(
        "manage-bookings",
        {
          body: {
            action: "delete",
            booking_id: bookingId,
          },
        }
      );

      if (error) {
        console.error("DELETE ERROR:", error);
        throw error;
      }

      setBookings((prev) =>
        prev.filter((booking) => booking.id !== bookingId)
      );
    } catch (err: any) {
      console.error("DELETE FAILED:", err);
      alert(err.message || "Failed to delete booking");
    }
  };

  // =========================
  // FILTER BOOKINGS
  // =========================
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.guest_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.guest_email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.table_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // =========================
  // STATS
  // =========================
  const stats = useMemo(() => {
    return {
      total: filteredBookings.length,
      pending: filteredBookings.filter((b) => b.status === "pending").length,
      confirmed: filteredBookings.filter((b) => b.status === "confirmed")
        .length,
      cancelled: filteredBookings.filter((b) => b.status === "cancelled")
        .length,
      guests: filteredBookings.reduce(
        (total, booking) => total + Number(booking.guests || 0),
        0
      ),
    };
  }, [filteredBookings]);

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-72 bg-zinc-800 rounded-xl" />
          <div className="h-32 bg-zinc-900 rounded-2xl" />
          <div className="h-96 bg-zinc-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <div className="p-6 text-white">
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-5 rounded-2xl">
          <h2 className="text-xl font-semibold mb-2">
            Failed to load bookings
          </h2>

          <p>{error}</p>

          <button
            onClick={() => loadBookings()}
            className="mt-5 px-5 py-2 bg-white text-black rounded-xl font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            Booking Management
          </h1>

          <p className="text-zinc-400 mt-2">
            Automated booking administration dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadBookings(false)}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl hover:bg-zinc-800 transition"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ========================= */}
      {/* FILTERS */}
      {/* ========================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-4 text-zinc-500"
          />

          <input
            type="text"
            placeholder="Search customer, email, or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-white"
          />
        </div>

        <div className="relative">
          <CalendarDays
            size={18}
            className="absolute left-4 top-4 text-zinc-500"
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* ========================= */}
      {/* STATS */}
      {/* ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">Total Bookings</p>
          <h2 className="text-3xl font-bold mt-2">{stats.total}</h2>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle size={18} />
            <p className="text-sm">Pending</p>
          </div>

          <h2 className="text-3xl font-bold mt-2">
            {stats.pending}
          </h2>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} />
            <p className="text-sm">Confirmed</p>
          </div>

          <h2 className="text-3xl font-bold mt-2">
            {stats.confirmed}
          </h2>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle size={18} />
            <p className="text-sm">Cancelled</p>
          </div>

          <h2 className="text-3xl font-bold mt-2">
            {stats.cancelled}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-zinc-300">
            <Users size={18} />
            <p className="text-sm">Total Guests</p>
          </div>

          <h2 className="text-3xl font-bold mt-2">
            {stats.guests}
          </h2>
        </div>
      </div>

      {/* ========================= */}
      {/* BOOKINGS TABLE */}
      {/* ========================= */}

      <div className="border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Booking Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Guests</th>
                <th className="p-4">Table</th>
                <th className="p-4">Status</th>
                <th className="p-4">Special Request</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-16 text-zinc-500"
                  >
                    No bookings found for selected filters
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/40 transition"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">
                          {booking.guest_name}
                        </p>

                        <p className="text-sm text-zinc-400">
                          {booking.guest_email}
                        </p>

                        {booking.guest_phone && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {booking.guest_phone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        {new Date(
                          booking.booking_date
                        ).toLocaleDateString("en-ZA")}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock3 size={16} />

                        <span>
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        {booking.guests}
                      </div>
                    </td>

                    <td className="p-4">
                      {booking.table_number ? (
                        <div>
                          <p className="font-medium">
                            Table {booking.table_number}
                          </p>

                          <p className="text-xs text-zinc-400">
                            {booking.table_type}
                          </p>

                          {booking.table_location && (
                            <p className="text-xs text-zinc-500">
                              {booking.table_location}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-yellow-400">
                          Auto assigning...
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          handleStatusChange(
                            booking.id,
                            e.target.value as Booking["status"]
                          )
                        }
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">
                          Confirmed
                        </option>
                        <option value="cancelled">
                          Cancelled
                        </option>
                        <option value="completed">
                          Completed
                        </option>
                      </select>
                    </td>

                    <td className="p-4 max-w-[240px]">
                      <p className="text-sm text-zinc-400 truncate">
                        {booking.special_request || "—"}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-zinc-400">
                      {booking.created_at
                        ? new Date(
                            booking.created_at
                          ).toLocaleString("en-ZA")
                        : "—"}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() =>
                            handleDelete(booking.id)
                          }
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                          title="Delete booking"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}