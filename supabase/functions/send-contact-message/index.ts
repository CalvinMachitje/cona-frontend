// supabase/functions/send-contact-message/index.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";
import { sendEmail } from "../_shared/emailSender.ts";
import { 
  contactAdminNotificationHtml, 
  contactCustomerReplyHtml 
} from "../_shared/emailTemplates.ts";

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
    const { name, email, subject, message, recaptchaToken } = await req.json();

    if (!name || !email || !subject || !message || !recaptchaToken) {
      throw new Error("Missing required fields");
    }

    // reCAPTCHA
    const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      }),
    });

    const captchaData = await captchaRes.json();
    if (!captchaData.success) throw new Error("reCAPTCHA verification failed");

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, subject, message }])
      .select()
      .single();

    if (error) throw error;

    // Admin Notification
    await sendEmail({
      to: "smachitje36@gmail.com",
      subject: `New Contact Inquiry: ${subject}`,
      html: contactAdminNotificationHtml({ name, email, subject, message }),
      text: `New contact from ${name} (${email})\nSubject: ${subject}\n\n${message}`,
    });

    // Customer Auto-Reply
    await sendEmail({
      to: email,
      subject: "Thank You - We've Received Your Message | CONA Lounge",
      html: contactCustomerReplyHtml(name),
      text: `Hello ${name},\n\nThank you for contacting CONA Lounge.\nWe have received your message and will respond within 24 hours.\n\nBest regards,\nCONA Lounge Team`,
    });

    console.log(`Contact form processed for ${email}`);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Contact Message Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});