// frontend/src/pages/customer/myBookings.tsx
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  booking_type: string;
  status: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("customer_token");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_URL}/customer/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await res.json();

        // Support both raw array and wrapped response
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (Array.isArray(data.data)) {
          setBookings(data.data);
        } else {
          console.error("Unexpected bookings response:", data);
          setBookings([]);
          setError("Invalid bookings data received.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 py-20 px-6">
        <div className="max-w-5xl mx-auto text-zinc-400">
          Loading your bookings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 py-20 px-6">
        <div className="max-w-5xl mx-auto text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-5xl mb-10 text-white">
          My Reservations
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            You have no bookings yet.
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex gap-8 items-center"
              >
                <div className="text-center w-24">
                  <Calendar size={48} className="mx-auto text-amber-400" />
                  <p className="text-2xl font-display mt-2 text-white">
                    {new Date(booking.booking_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-2xl text-white">
                        {booking.booking_time}
                      </p>
                      <p className="text-zinc-400">
                        {booking.guests} Guests • {booking.booking_type}
                      </p>
                    </div>

                    <div
                      className={`px-6 py-2 rounded-full text-sm font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-500/20 text-green-400"
                          : booking.status === "pending"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {booking.status?.toUpperCase() || "UNKNOWN"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}