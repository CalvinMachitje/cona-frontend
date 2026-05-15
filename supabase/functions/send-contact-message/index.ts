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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Function started");

    const body = await req.json();
    console.log("Request body parsed");

    const { name, email, subject, message, recaptchaToken } = body;

    if (!name || !email || !subject || !message || !recaptchaToken) {
      throw new Error("Missing required fields");
    }

    console.log("Validating captcha...");

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
    console.log("Captcha response:", captchaData);

    if (!captchaData.success) {
      throw new Error("Captcha verification failed");
    }

    console.log("Creating Supabase client...");

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Saving contact message...");

    const { data, error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, subject, message }])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(error.message);
    }

    console.log("Sending admin email...");

    const adminEmailResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
          to: ["smachitje36@gmail.com"],
          subject: `New Contact Form: ${subject}`,
          text: `
New contact form received

Name: ${name}
Email: ${email}
Subject: ${subject}

${message}
          `.trim(),
        }),
      }
    );

    const adminEmailResult = await adminEmailResponse.text();
    console.log("Admin email response:", adminEmailResult);

    if (!adminEmailResponse.ok) {
      throw new Error(`Admin email failed: ${adminEmailResult}`);
    }

    console.log("Sending customer auto reply...");

    const replyResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
          to: [email],
          subject: "We've received your message - CONA Lounge",
          text: `
Hello ${name},

Thank you for contacting CONA Lounge.

We have received your message and will respond within 24 hours.

Best regards,
CONA Lounge Team
          `.trim(),
        }),
      }
    );

    const replyResult = await replyResponse.text();
    console.log("Customer email response:", replyResult);

    if (!replyResponse.ok) {
      throw new Error(`Customer email failed: ${replyResult}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
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
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    console.error("FUNCTION ERROR:", errorMessage);

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