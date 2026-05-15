// supabase/functions/send-contact-message/index.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { name, email, subject, message, recaptchaToken } =
      await req.json();

    // Validate request body
    if (!name || !email || !subject || !message || !recaptchaToken) {
      return new Response(
        JSON.stringify({
          error:
            "name, email, subject, message and recaptchaToken are required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify reCAPTCHA
    const captchaRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        }),
      }
    );

    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      return new Response(
        JSON.stringify({
          error: "Captcha verification failed",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Save message to DB
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // -------------------------
    // SEND ADMIN NOTIFICATION
    // -------------------------
    const adminEmailRes = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
          to: ["smachitje36@gmail.com"],
          subject: `New Contact Form: ${subject}`,
          text: `
New website inquiry received

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
          `.trim(),
        }),
      }
    );

    const adminEmailData = await adminEmailRes.json();
    console.log("Admin email response:", adminEmailData);

    if (!adminEmailRes.ok) {
      throw new Error(
        `Admin email failed: ${JSON.stringify(adminEmailData)}`
      );
    }

    // -------------------------
    // SEND CUSTOMER AUTO REPLY
    // -------------------------
    const customerEmailRes = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
          to: [email],
          subject: "We've received your message - CONA Lounge",
          text: `
Hello ${name},

Thank you for contacting CONA Lounge.

We have received your message regarding:
"${subject}"

Our team will respond within 24 hours.

Best regards,
CONA Lounge Team
Coligny • 083 200 2516
          `.trim(),
        }),
      }
    );

    const customerEmailData = await customerEmailRes.json();
    console.log("Customer email response:", customerEmailData);

    if (!customerEmailRes.ok) {
      throw new Error(
        `Customer email failed: ${JSON.stringify(
          customerEmailData
        )}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Contact form submitted successfully",
        id: data.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    console.error("Contact form error:", errorMessage);

    return new Response(
      JSON.stringify({
        error: errorMessage,
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