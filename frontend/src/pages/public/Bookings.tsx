// frontend/src/pages/public/Bookings.tsx
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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

type TableType = {
  id: string;
  table_number: string;
  capacity: number;
  type: string;
  location?: string;
  is_active: boolean;
};

function generateReferenceCode() {
  return `CONA-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

export default function BookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [guests, setGuests] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState("");

  const [availableTables, setAvailableTables] = useState<TableType[]>([]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];

    for (let h = 10; h <= 23; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }

    slots.push("00:00", "00:30", "01:00", "01:30", "02:00");
    return slots;
  }, []);

  useEffect(() => {
    if (!selectedDate || !startTime || !endTime || guests < 1) {
      setAvailableTables([]);
      setSelectedTableId("");
      return;
    }

    fetchAvailableTables();
  }, [selectedDate, startTime, endTime, guests]);

  async function fetchAvailableTables() {
    try {
      setLoadingTables(true);
      setError("");

      const { data: tables, error: tableError } = await supabase
        .from("tables")
        .select("*")
        .eq("is_active", true);

      if (tableError) throw tableError;

      const { data: reservations, error: reservationError } =
        await supabase
          .from("table_reservations")
          .select("table_id")
          .eq("booking_date", selectedDate)
          .eq("status", "active")
          .or(
            `and(start_time.lt.${endTime},end_time.gt.${startTime})`
          );

      if (reservationError) throw reservationError;

      const reservedIds = new Set(
        reservations?.map((r: any) => r.table_id) || []
      );

      let filtered =
        tables?.filter(
          (table: TableType) =>
            table.capacity >= guests &&
            !reservedIds.has(table.id)
        ) || [];

      filtered.sort((a, b) => {
        if (a.type === "vip" && b.type !== "vip") return -1;
        if (b.type === "vip" && a.type !== "vip") return 1;
        return a.capacity - b.capacity;
      });

      filtered = filtered.slice(0, 4);

      setAvailableTables(filtered);
    } catch (err: any) {
      console.error(err);
      setError("Failed loading available tables.");
    } finally {
      setLoadingTables(false);
    }
  }

  const recommendedTableId = availableTables[0]?.id;

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (!selectedTableId) {
        throw new Error("Please select a table.");
      }

      const form = new FormData(e.currentTarget);

      const payload = {
        booking_date: selectedDate,
        guests,
        status: "confirmed",
        special_requests:
          form.get("special_requests")?.toString() || "",
        guest_name: form.get("full_name"),
        guest_email: form.get("email"),
        guest_phone: form.get("phone"),
        booking_type: "guest",
        table_id: selectedTableId,
        start_time: startTime,
        end_time: endTime,
        booking_purpose:
          form.get("booking_purpose")?.toString() || "",
        experience_type:
          form.get("experience_type")?.toString() || "standard",
        reference_code: generateReferenceCode(),
      };

      const { data: existingReservation } = await supabase
        .from("table_reservations")
        .select("id")
        .eq("table_id", selectedTableId)
        .eq("booking_date", selectedDate)
        .eq("status", "active")
        .or(
          `and(start_time.lt.${endTime},end_time.gt.${startTime})`
        )
        .limit(1);

      if (
        existingReservation &&
        existingReservation.length > 0
      ) {
        throw new Error(
          "This table has just been booked. Please select another."
        );
      }

      const { data: booking, error: bookingError } =
        await supabase
          .from("bookings")
          .insert([payload])
          .select()
          .single();

      if (bookingError) throw bookingError;

      await supabase.from("table_reservations").insert([
        {
          table_id: selectedTableId,
          booking_id: booking.id,
          booking_date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          status: "active",
        },
      ]);

      await supabase.functions.invoke(
        "send-booking-notification",
        {
          body: {
            booking_id: booking.id,
          },
        }
      );

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <CheckCircle2
            size={80}
            className="text-green-500 mx-auto mb-6"
          />

          <h1 className="text-white text-5xl font-display mb-4">
            Booking Confirmed
          </h1>

          <p className="text-zinc-400 mb-8">
            Your reservation was successfully created.
            Confirmation email sent.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-8 py-4 rounded-xl"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-6xl font-display text-white mb-4">
            Reserve Your Experience
          </h1>

          <p className="text-zinc-400 flex items-center justify-center gap-2">
            <MapPin size={18} />
            Coligny • 083 200 2516
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Field
              label="Full Name"
              name="full_name"
              icon={User}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              icon={Mail}
              required
            />
            <Field
              label="Phone"
              name="phone"
              type="tel"
              icon={Phone}
              required
            />

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Number of Guests
              </label>
              <div className="relative">
                <Users
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  size={18}
                />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) =>
                    setGuests(Number(e.target.value))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 pl-11 pr-5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm text-zinc-400 mb-3">
              Booking Date
            </label>
            <CalendarPicker
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={
                new Date().toISOString().split("T")[0]
              }
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <SelectTime
              label="Start Time"
              value={startTime}
              setValue={setStartTime}
              options={timeSlots}
            />

            <SelectTime
              label="End Time"
              value={endTime}
              setValue={setEndTime}
              options={timeSlots.filter(
                (t) => t > startTime
              )}
            />
          </div>

          <div className="mt-8">
            <label className="block text-sm text-zinc-400 mb-2">
              Experience Type
            </label>
            <select
              name="experience_type"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white"
            >
              <option value="standard">Standard</option>
              <option value="vip">VIP</option>
              <option value="private">Private</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          <div className="mt-6">
            <textarea
              name="booking_purpose"
              rows={3}
              placeholder="Booking purpose"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white"
            />
          </div>

          <div className="mt-6">
            <textarea
              name="special_requests"
              rows={3}
              placeholder="Special requests"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white"
            />
          </div>

          {selectedDate && startTime && endTime && (
            <div className="mt-10">
              <h3 className="text-white mb-4">
                Available Tables
              </h3>

              {loadingTables ? (
                <p className="text-zinc-400">
                  Loading tables...
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableTables.map((table) => {
                    const selected =
                      selectedTableId === table.id;
                    const recommended =
                      recommendedTableId === table.id;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() =>
                          setSelectedTableId(table.id)
                        }
                        className={`relative p-5 rounded-2xl border ${
                          selected
                            ? "border-amber-400 bg-amber-400/10"
                            : "border-zinc-700"
                        }`}
                      >
                        {recommended && (
                          <div className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Award size={12} />
                            BEST
                          </div>
                        )}

                        {table.type === "vip" && (
                          <Star
                            className="absolute top-3 right-3 text-amber-400"
                            size={18}
                          />
                        )}

                        <TableIcon className="mx-auto mb-3 text-zinc-400" />
                        <p className="text-white font-semibold">
                          Table {table.table_number}
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {table.capacity} guests
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedTableId}
            className="w-full mt-10 bg-primary text-white py-5 rounded-2xl font-semibold disabled:opacity-50"
          >
            {loading
              ? "Processing Reservation..."
              : "Confirm Reservation"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  icon: Icon,
  required,
}: any) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          size={18}
        />
        <input
          name={name}
          type={type}
          required={required}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 pl-11 pr-5 text-white"
        />
      </div>
    </div>
  );
}

function SelectTime({
  label,
  value,
  setValue,
  options,
}: any) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 px-5 text-white"
      >
        <option value="">Select time</option>
        {options.map((time: string) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  );
}