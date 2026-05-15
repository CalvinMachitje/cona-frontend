// frontend/src/pages/public/Bookings.tsx
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  User,
  Mail,
  Phone,
  Users,
  MapPin,
  Table as TableIcon,
  Star,
  Award,
} from "lucide-react";
import CalendarPicker from "@/components/CalendarPicker";
import { supabase } from "@/lib/supabase";

export default function BookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const [guests, setGuests] = useState<number>(2);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 10; h <= 23; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    slots.push("00:00", "00:30", "01:00", "01:30", "02:00");
    return slots;
  }, []);

  // Real-time Table Availability
  useEffect(() => {
    if (!selectedDate || !startTime || !endTime || guests < 1) {
      setAvailableTables([]);
      setSelectedTableId("");
      return;
    }

    const fetchAvailableTables = async () => {
      setLoadingTables(true);
      setError("");

      try {
        const { data: tables } = await supabase
          .from("tables")
          .select("*")
          .eq("is_active", true)
          .order("table_number");

        const { data: booked } = await supabase
          .from("bookings")
          .select("table_id")
          .eq("booking_date", selectedDate)
          .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

        const bookedIds = new Set(booked?.map((b: any) => b.table_id));

        let available = tables?.filter((t: any) => 
          !bookedIds.has(t.id) && t.capacity >= guests
        ) || [];

        // Sort: VIP first, then smallest suitable capacity
        available.sort((a: any, b: any) => {
          if (a.type === "vip" && b.type !== "vip") return -1;
          if (b.type === "vip" && a.type !== "vip") return 1;
          return a.capacity - b.capacity;
        });

        setAvailableTables(available);
      } catch (err: any) {
        console.error(err);
        setError("Could not load available tables. Please try again.");
      } finally {
        setLoadingTables(false);
      }
    };

    fetchAvailableTables();
  }, [selectedDate, startTime, endTime, guests]);

  const recommendedTableId = availableTables[0]?.id || null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedTableId) {
      setError("Please select a table.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const guestEmail = formData.get("email") as string;
    const guestName = formData.get("full_name") as string;

    if (!guestEmail) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    const payload = {
      booking_date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      guests: guests,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: formData.get("phone"),
      table_id: selectedTableId,
      special_requests: formData.get("special_requests") || "",
      booking_purpose: formData.get("booking_purpose") || "",
      experience_type: formData.get("experience_type") || "standard",
      booking_type: "guest",
      status: "confirmed",
    };

    try {
      // Race condition / double booking protection
      const { data: conflict } = await supabase
        .from("bookings")
        .select("id")
        .eq("table_id", selectedTableId)
        .eq("booking_date", selectedDate)
        .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)
        .limit(1);

      if (conflict && conflict.length > 0) {
        setError("This table was just booked by someone else. Please choose another.");
        setSelectedTableId("");
        setLoading(false);
        return;
      }

      // Insert the booking
      const { data: newBooking, error: insertError } = await supabase
        .from("bookings")
        .insert([payload])
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Send booking confirmation email
      if (newBooking?.id) {
        await supabase.functions.invoke("send-booking-notification", {
          body: { 
            booking_id: newBooking.id,
            guest_email: guestEmail 
          },
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
        <div className="text-center max-w-md">
          <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
          <h1 className="font-display text-5xl mb-4 text-white">Reservation Confirmed!</h1>
          <p className="text-zinc-400 mb-8">
            Thank you! Your booking has been successfully received.<br />
            You will receive confirmation via SMS and Email shortly.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-10 py-4 rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-6xl text-white mb-4">Reserve Your Experience</h1>
          <p className="text-zinc-400 text-lg flex items-center justify-center gap-2">
            <MapPin size={18} /> Coligny • 083 200 2516
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        <motion.form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Full Name" name="full_name" type="text" icon={User} required />
            <Field label="Email" name="email" type="email" icon={Mail} required />
            <Field label="Phone" name="phone" type="tel" icon={Phone} required />

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Number of Guests</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setGuests(Math.max(1, Math.min(20, val)));
                    setSelectedTableId("");
                  }}
                  min={1}
                  max={20}
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 pl-11 pr-5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm text-zinc-400 mb-3">Booking Date</label>
            <CalendarPicker value={selectedDate} onChange={setSelectedDate} minDate={new Date().toISOString().split("T")[0]} />
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-3">Start Time</label>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white">
                <option value="">Select Start Time</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-3">End Time</label>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white">
                <option value="">Select End Time</option>
                {timeSlots.map(t => <option key={t} value={t} disabled={t <= startTime}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Table Visualizer */}
          {selectedDate && startTime && endTime && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm text-zinc-400">Available Tables for {guests} Guests</label>
                <p className="text-xs text-amber-400">Real-time availability</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableTables.length > 0 ? (
                  availableTables.map((table: any) => {
                    const isRecommended = table.id === recommendedTableId;
                    const isSelected = table.id === selectedTableId;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => setSelectedTableId(table.id)}
                        className={`relative p-6 rounded-2xl border transition-all group ${
                          isSelected ? "border-amber-500 bg-amber-500/10" : "border-zinc-700 hover:border-amber-400/50"
                        }`}
                      >
                        {isRecommended && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Award size={14} /> RECOMMENDED
                          </div>
                        )}

                        {table.type === "vip" && (
                          <Star className="absolute top-3 right-3 text-amber-400" size={20} fill="currentColor" />
                        )}

                        <div className="flex flex-col items-center text-center">
                          <TableIcon className={`mb-3 ${table.type === 'vip' ? 'text-amber-400' : 'text-zinc-400'}`} size={36} />
                          <p className="font-semibold text-lg">Table {table.table_number}</p>
                          <p className="text-sm text-zinc-400">Up to {table.capacity} guests</p>
                          {table.location && <p className="text-xs text-zinc-500 mt-1">{table.location}</p>}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                    <p className="text-amber-400">No tables available for {guests} guests at this time.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <label className="block text-sm text-zinc-400 mb-2">Experience Type</label>
            <select name="experience_type" className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white">
              <option value="standard">Standard Table</option>
              <option value="vip">VIP Booth</option>
              <option value="bottle">Bottle Service</option>
              <option value="private">Private Event</option>
            </select>
          </div>

          <div className="mt-8">
            <label className="block text-sm text-zinc-400 mb-2">Booking Purpose</label>
            <textarea name="booking_purpose" rows={3} className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white" placeholder="e.g. Birthday celebration..." />
          </div>

          <div className="mt-6">
            <label className="block text-sm text-zinc-400 mb-2">Special Requests</label>
            <textarea name="special_requests" rows={3} className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white" placeholder="Dietary requirements, decorations, etc." />
          </div>

          <button 
            type="submit" 
            disabled={loading || !selectedTableId}
            className="w-full mt-10 bg-primary text-white py-5 rounded-2xl font-semibold disabled:opacity-50 hover:bg-primary/90 transition text-lg"
          >
            {loading ? "Processing & Sending Confirmation..." : "Confirm Reservation"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", icon: Icon, min, max, required }: any) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />}
        <input 
          type={type} 
          name={name} 
          required={required} 
          min={min} 
          max={max} 
          className={`w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 ${Icon ? "pl-11 pr-5" : "px-5"} text-white`} 
        />
      </div>
    </div>
  );
}