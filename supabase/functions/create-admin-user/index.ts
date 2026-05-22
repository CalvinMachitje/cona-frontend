// supabase/functions/create-admin-user/index.ts
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
  (env as any).APP_ENV === "development" || (env as any).DENO_ENV === "development";

async function sendEmail(payload: {
  to: string[];
  subject: string;
  text: string;
}) {
  if (isDevelopment) {
    console.log("Using Mailtrap (development mode)");
    try {
      const response = await fetch("https://send.api.mailtrap.io/api/send", {
        method: "POST",
        headers: {
          "Api-Token": (env as any).MAILTRAP_TOKEN,
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
      });

      if (!response.ok) {
        console.error("Mailtrap failed:", await response.text());
      } else {
        console.log("Mailtrap success");
      }
    } catch (err) {
      console.error("Mailtrap exception:", err);
    }
    return;
  }

  // Production - Resend
  console.log("Using Resend (production mode)");
  try {
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

    if (!response.ok) {
      console.error("Resend failed:", await response.text());
    } else {
      console.log("Resend success");
    }
  } catch (err) {
    console.error("Resend exception:", err);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Create Admin User function started");

    const { full_name, email, phone, password } = await req.json();

    if (!full_name || !email || !password) {
      throw new Error("Missing required fields: full_name, email, password");
    }

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone: phone || null,
      },
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Insert into public.users table
    const { error: userError } = await supabase
      .from("users")
      .insert({
        id: userId,
        full_name,
        email,
        phone: phone || null,
        role: "admin",
      });

    if (userError) throw userError;

    // 3. Insert into admin_profiles
    const { error: profileError } = await supabase
      .from("admin_profiles")
      .insert({
        user_id: userId,
        permissions: {
          can_manage_users: true,
          can_manage_bookings: true,
          can_manage_menu: true,
          can_view_reports: true,
          can_manage_settings: true,
        },
      });

    if (profileError) console.error("Profile creation warning:", profileError);

    // 4. Send welcome email
    await sendEmail({
      to: [email],
      subject: "Welcome to CONA Lounge Admin Portal",
      text: `
Hello ${full_name},

Your administrator account has been successfully created.

You can now log in at: ${env.APP_URL || "https://conalounge.co.za"}/admin/login

Best regards,
CONA Lounge Management
      `.trim(),
    });

    console.log("Admin user created successfully:", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin account created successfully",
        user_id: userId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Create Admin Error:", err);

    return new Response(
      JSON.stringify({
        error: err.message || "Failed to create admin user",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});