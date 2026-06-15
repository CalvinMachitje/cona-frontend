// supabase/functions/send-booking-notification/index.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";
import { sendEmail } from "../_shared/emailSender.ts";
import { bookingConfirmationHtml, bookingConfirmationText } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("booking_id is required");

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        tables!bookings_table_id_fkey(table_number, type, location)
      `)
      .eq("id", booking_id)
      .single();

    if (error || !booking) throw new Error("Booking not found");

    const table = booking.tables;
    const subject = `CONA Lounge - Booking Confirmed #${booking.reference_code}`;

    const html = bookingConfirmationHtml(booking, table);
    const text = bookingConfirmationText(booking, table);

    await sendEmail({
      from: `Bookings <${env.BOOKINGS_EMAIL}>`,
      to: booking.guest_email,
      subject,
      html,
      text,
    });

    console.log(`Booking confirmation sent for ${booking.reference_code}`);

    return new Response(
      JSON.stringify({ success: true, reference_code: booking.reference_code }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Booking Notification Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});