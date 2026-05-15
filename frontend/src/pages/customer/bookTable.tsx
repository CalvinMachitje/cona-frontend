// frontend/src/pages/customer/bookTable.tsx
import { useState, useEffect } from "react";
import { Calendar, Clock, Users, ArrowRight, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function BookTable() {
  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "",
    guests: 2,
    booking_type: "lounge",
    special_requests: "",
  });

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("customer_token");

  // Fetch available times when date is selected
  useEffect(() => {
    if (!formData.booking_date) return;

    setLoadingTimes(true);
    fetch(`${API_URL}/customer/available-times?date=${formData.booking_date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAvailableTimes(data.available_times || []))
      .finally(() => setLoadingTimes(false));
  }, [formData.booking_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/customer/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) setSuccess(true);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center px-6">
        <div>
          <Sparkles className="text-emerald-400 mx-auto mb-6" size={64} />
          <h2 className="font-display text-5xl mb-4">Reservation Requested</h2>
          <p className="text-zinc-400">Our team will confirm your booking shortly.</p>
          <button
            onClick={() => window.location.href = "/member"}
            className="mt-10 px-10 py-4 bg-white text-black rounded-2xl font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-6xl mb-3">Book Your Table</h1>
      <p className="text-zinc-400 mb-12">Create a new reservation at Cona Lounge</p>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="text-sm text-zinc-400 block mb-3">DATE</label>
            <input
              type="date"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-5 focus:border-amber-500"
              value={formData.booking_date}
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-3">TIME</label>
            <select
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-5 focus:border-amber-500"
              value={formData.booking_time}
              onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
              required
              disabled={loadingTimes}
            >
              <option value="">Select Time</option>
              {availableTimes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-zinc-400 block mb-3">GUESTS</label>
          <div className="flex gap-3">
            {[2, 3, 4, 5, 6, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setFormData({ ...formData, guests: n })}
                className={`flex-1 py-6 rounded-2xl font-display text-2xl transition-all ${
                  formData.guests === n
                    ? "bg-amber-500 text-black"
                    : "bg-zinc-900 border border-zinc-700 hover:border-amber-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-zinc-400 block mb-3">BOOKING TYPE</label>
          <div className="grid grid-cols-3 gap-4">
            {["lounge", "vip-booth", "private-room"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, booking_type: type })}
                className={`py-6 rounded-2xl border capitalize transition ${
                  formData.booking_type === type
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-zinc-700 hover:border-zinc-500"
                }`}
              >
                {type.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-zinc-400 block mb-3">SPECIAL REQUESTS</label>
          <textarea
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-6 py-5 focus:border-amber-500"
            placeholder="Birthday, dietary requirements, etc."
            value={formData.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-7 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-medium text-xl rounded-3xl hover:brightness-110 transition"
        >
          {submitting ? "Submitting Request..." : "Confirm Reservation"}
          <ArrowRight className="inline ml-3" size={24} />
        </button>
      </form>
    </div>
  );
}