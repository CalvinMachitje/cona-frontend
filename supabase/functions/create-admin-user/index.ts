// supabase/functions/create-admin-user/index.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const isDevelopment = env.APP_ENV === "development";

async function sendEmail(payload: {
  to: string[];
  subject: string;
  text: string;
}) {
  if (isDevelopment) {
    console.log("📧 Using Mailtrap (development mode)");
    try {
      const response = await fetch("https://send.api.mailtrap.io/api/send", {
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
          category: "Admin User Creation",
        }),
      });

      if (!response.ok) {
        console.error("Mailtrap failed:", await response.text());
      } else {
        console.log("✅ Mailtrap email sent successfully");
      }
    } catch (err) {
      console.error("Mailtrap exception:", err);
    }
    return;
  }

  // Production - Resend
  console.log("📧 Using Resend (production mode)");
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
      console.log("✅ Resend email sent successfully");
    }
  } catch (err) {
    console.error("Resend exception:", err);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("🚀 Create Admin User function started");

    const body = await req.json();

    const full_name = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || null;
    const password = body.password;

    if (!full_name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: full_name, email, password" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "An account with this email already exists." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone },
    });

    if (authError) {
      console.error("Auth Error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message || "Failed to create auth user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    // Insert into public.users
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      full_name,
      email,
      phone,
      role: "admin",
    });

    if (userError) {
      console.error("Users insert error:", userError);
      await supabase.auth.admin.deleteUser(userId);
      throw userError;
    }

    // Insert admin profile
    const { error: profileError } = await supabase.from("admin_profiles").insert({
      user_id: userId,
      permissions: {
        can_manage_users: true,
        can_manage_bookings: true,
        can_manage_menu: true,
        can_manage_gallery: true,
        can_view_reports: true,
        can_manage_settings: true,
      },
    });

    if (profileError) {
      console.error("Profile insert error:", profileError);
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from("users").delete().eq("id", userId);
      throw profileError;
    }

    // Send welcome email
    try {
      await sendEmail({
        to: [email],
        subject: "Welcome to CONA Lounge Admin Portal",
        text: `
Hello ${full_name},

Your administrator account has been successfully created.

Login URL: ${env.APP_URL || "https://www.conalounge.co.za"}/admin/login

Best regards,
CONA Lounge Management Team
        `.trim(),
      });
    } catch (emailErr) {
      console.error("Email sending failed (non-blocking):", emailErr);
    }

    console.log(`✅ Admin user created successfully: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin account created successfully",
        user_id: userId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Create Admin Error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to create admin user" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});