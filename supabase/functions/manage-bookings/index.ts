// supabase/functions/manage-bookings/index.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

function generateReferenceCode() {
  return `CONA-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    const {
      action,
      booking_id,
      status,
      booking_date,
      guests,
      start_time,
      end_time,
      guest_name,
      guest_email,
      guest_phone,
      special_requests,
      booking_purpose,
      experience_type,
      user_id,
    } = body;

    // =====================================
    // GET BOOKINGS
    // =====================================

    if (action === "get") {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          tables!bookings_table_id_fkey(
            id,
            table_number,
            type,
            capacity,
            location
          )
        `)
        .order("booking_date", { ascending: true });

      if (error) throw error;

      return Response.json(
        {
          success: true,
          data,
        },
        {
          headers: corsHeaders,
        }
      );
    }

    // =====================================
    // CREATE BOOKING
    // =====================================

    if (action === "create") {
      if (
        !booking_date ||
        !guests ||
        !start_time ||
        !end_time ||
        !guest_name ||
        !guest_email
      ) {
        throw new Error("Missing required booking fields");
      }

      // find available table
      const { data: availableTables, error: tableError } =
        await supabase
          .from("tables")
          .select("*")
          .gte("capacity", guests)
          .eq("is_active", true)
          .eq("status", "available")
          .order("capacity", { ascending: true });

      if (tableError) throw tableError;

      if (!availableTables || availableTables.length === 0) {
        throw new Error("No available tables found");
      }

      let selectedTable = null;

      for (const table of availableTables) {
        const { data: conflicts } = await supabase
          .from("table_reservations")
          .select("*")
          .eq("table_id", table.id)
          .eq("booking_date", booking_date)
          .eq("status", "active")
          .or(
            `start_time.lt.${end_time},end_time.gt.${start_time}`
          );

        if (!conflicts || conflicts.length === 0) {
          selectedTable = table;
          break;
        }
      }

      if (!selectedTable) {
        throw new Error("No tables available for selected time");
      }

      const referenceCode = generateReferenceCode();

      // create booking
      const { data: booking, error: bookingError } =
        await supabase
          .from("bookings")
          .insert({
            user_id: user_id || null,
            booking_date,
            guests,
            start_time,
            end_time,
            guest_name,
            guest_email,
            guest_phone,
            special_requests,
            booking_purpose,
            experience_type: experience_type || "standard",
            table_id: selectedTable.id,
            booking_type: user_id ? "member" : "guest",
            reference_code: referenceCode,
            status: "confirmed",
          })
          .select()
          .single();

      if (bookingError) throw bookingError;

      // reservation
      await supabase
        .from("table_reservations")
        .insert({
          table_id: selectedTable.id,
          booking_id: booking.id,
          booking_date,
          start_time,
          end_time,
          status: "active",
        });

      // table status
      await supabase
        .from("tables")
        .update({
          status: "reserved",
        })
        .eq("id", selectedTable.id);

      // occupancy tracking
      const { data: occupancy } = await supabase
        .from("occupancy_tracking")
        .select("*")
        .eq("event_date", booking_date)
        .maybeSingle();

      if (occupancy) {
        await supabase
          .from("occupancy_tracking")
          .update({
            current_occupancy:
              occupancy.current_occupancy + guests,
          })
          .eq("id", occupancy.id);
      } else {
        await supabase
          .from("occupancy_tracking")
          .insert({
            event_date: booking_date,
            current_occupancy: guests,
          });
      }

      // notifications
      await supabase.from("notifications").insert({
        user_id: user_id || null,
        title: "Booking Confirmed",
        message: `Booking confirmed for ${booking_date}`,
        type: "booking",
      });

      // send email notification
      await fetch(
        `${env.SUPABASE_URL}/functions/v1/send-booking-notification`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: booking.id,
          }),
        }
      );

      return Response.json(
        {
          success: true,
          data: booking,
        },
        {
          headers: corsHeaders,
        }
      );
    }

    // =====================================
    // UPDATE STATUS
    // =====================================

    if (action === "update-status") {
      if (!booking_id || !status) {
        throw new Error("booking_id and status required");
      }

      const { data: booking, error: bookingFetchError } =
        await supabase
          .from("bookings")
          .select("*")
          .eq("id", booking_id)
          .single();

      if (bookingFetchError) throw bookingFetchError;

      const { error } = await supabase
        .from("bookings")
        .update({
          status,
        })
        .eq("id", booking_id);

      if (error) throw error;

      // cancel reservation
      if (status === "cancelled") {
        await supabase
          .from("table_reservations")
          .update({
            status: "cancelled",
          })
          .eq("booking_id", booking_id);

        await supabase
          .from("tables")
          .update({
            status: "available",
          })
          .eq("id", booking.table_id);
      }

      return Response.json(
        {
          success: true,
        },
        {
          headers: corsHeaders,
        }
      );
    }

    // =====================================
    // DELETE BOOKING
    // =====================================

    if (action === "delete") {
      if (!booking_id) {
        throw new Error("booking_id required");
      }

      const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", booking_id)
        .single();

      if (booking?.table_id) {
        await supabase
          .from("tables")
          .update({
            status: "available",
          })
          .eq("id", booking.table_id);
      }

      await supabase
        .from("table_reservations")
        .delete()
        .eq("booking_id", booking_id);

      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", booking_id);

      if (error) throw error;

      return Response.json(
        {
          success: true,
        },
        {
          headers: corsHeaders,
        }
      );
    }

    throw new Error("Invalid action");
  } catch (err: any) {
    console.error("BOOKINGS FUNCTION ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});