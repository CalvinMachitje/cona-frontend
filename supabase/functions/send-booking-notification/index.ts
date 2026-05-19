// supabase/functions/send-booking-notification/index.ts

import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const isDevelopment =
  (env as any).APP_ENV === "development" ||
  (env as any).DENO_ENV === "development";

async function sendEmail(payload: {
  to: string[];
  subject: string;
  text: string;
}) {
  // =========================
  // DEV MODE (Mailtrap)
  // =========================
  if (isDevelopment) {
    console.log("Using Mailtrap (development mode)");

    try {
      const response = await fetch(
        "https://send.api.mailtrap.io/api/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.MAILTRAP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: {
              email: env.FROM_EMAIL,
              name: env.FROM_NAME,
            },
            to: payload.to.map((email) => ({ email })),
            subject: payload.subject,
            text: payload.text,
          }),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        console.error("Mailtrap error:", result);

        // ❗ DO NOT crash function
        return;
      }

      console.log("Mailtrap success:", result);
    } catch (err) {
      console.error("Mailtrap exception:", err);
    }

    return;
  }

  // =========================
  // PROD MODE (Resend)
  // =========================
  console.log("Using Resend (production mode)");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    }),
  });

  const result = await response.text();

  if (!response.ok) {
    throw new Error(`Resend failed: ${result}`);
  }

  console.log("Resend success:", result);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Booking function started");

    const { booking_id } = await req.json();

    if (!booking_id) {
      throw new Error("booking_id is required");
    }

    console.log("Fetching booking...");

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        tables(table_number, type, location)
      `)
      .eq("id", booking_id)
      .single();

    if (error || !booking) {
      throw new Error("Booking not found");
    }

    const table = booking.tables;

    const bookingDate = new Date(
      booking.booking_date
    ).toLocaleDateString("en-ZA");

    const message = `
CONA Lounge Booking Confirmed

Dear ${booking.guest_name},

Your reservation is confirmed:

Date: ${bookingDate}
Time: ${booking.start_time} - ${booking.end_time}
Table: ${table?.table_number} (${table?.type})
Guests: ${booking.guests}

We look forward to welcoming you!

CONA Lounge Team
Coligny • 083 200 2516
    `.trim();

    // =========================
    // EMAIL (SAFE CALL)
    // =========================
    await sendEmail({
      to: [booking.guest_email],
      subject: `Confirmed: Table ${table?.table_number} on ${bookingDate}`,
      text: message,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error("Booking function error:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
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