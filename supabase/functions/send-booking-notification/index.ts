// supabase/functions/send-booking-notification/index.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

Deno.serve(async (req: Request) => {
  try {
    const { booking_id } = await req.json();

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: "booking_id is required" }),
        { status: 400 }
      );
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        tables(table_number, type, location)
      `)
      .eq("id", booking_id)
      .single();

    if (error || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404 }
      );
    }

    const table = booking.tables;
    const bookingDate = new Date(booking.booking_date)
      .toLocaleDateString("en-ZA");

    const message = `
✅ CONA Lounge Booking Confirmed!

Dear ${booking.guest_name},

Your reservation is confirmed:

📅 Date: ${bookingDate}
⏰ Time: ${booking.start_time} - ${booking.end_time}
🪑 Table: ${table?.table_number} (${table?.type})
👥 Guests: ${booking.guests}

We look forward to welcoming you!

CONA Lounge Team
Coligny • 083 200 2516
`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
        to: [booking.guest_email],
        subject: `Confirmed: Table ${table?.table_number} on ${bookingDate}`,
        text: message,
      }),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error("Resend API error:", errorText);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error 
      ? err.message 
      : typeof err === "string" 
        ? err 
        : "Unknown error";

    console.error("Function error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500 }
    );
  }
});