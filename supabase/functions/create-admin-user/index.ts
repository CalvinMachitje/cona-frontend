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

const isDevelopment = env.APP_ENV === "development";

async function sendEmail(payload: {
  to: string[];
  subject: string;
  text: string;
}) {
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
            category: "Admin User Creation",
          }),
        }
      );

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

    const body = await req.json();

    const full_name = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || null;
    const password = body.password;

    if (!full_name || !email || !password) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: full_name, email, password",
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

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // =====================================================
    // CHECK IF USER ALREADY EXISTS IN PUBLIC USERS TABLE
    // =====================================================

    const { data: existingUser, error: existingUserError } =
      await supabase
        .from("users")
        .select("id,email")
        .eq("email", email)
        .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({
          error: "An account with this email address already exists.",
          code: "EMAIL_EXISTS",
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =====================================================
    // CREATE AUTH USER
    // =====================================================

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          phone,
        },
      });

    if (authError) {
      if ((authError as any).code === "email_exists") {
        return new Response(
          JSON.stringify({
            error: "An account with this email address already exists.",
            code: "EMAIL_EXISTS",
          }),
          {
            status: 409,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      throw authError;
    }

    if (!authData?.user?.id) {
      throw new Error(
        "Supabase Auth user creation succeeded but no user ID was returned."
      );
    }

    const userId = authData.user.id;

    // =====================================================
    // INSERT USER RECORD
    // =====================================================

    const { error: userError } = await supabase
      .from("users")
      .insert({
        id: userId,
        full_name,
        email,
        phone,
        role: "admin",
      });

    if (userError) {
      await supabase.auth.admin.deleteUser(userId);
      throw userError;
    }

    // =====================================================
    // INSERT ADMIN PROFILE
    // =====================================================

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

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);

      await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      throw profileError;
    }

    // =====================================================
    // SEND WELCOME EMAIL
    // =====================================================

    try {
      await sendEmail({
        to: [email],
        subject: "Welcome to CONA Lounge Admin Portal",
        text: `
Hello ${full_name},

Your administrator account has been successfully created.

You can now log in at:
${(env as any).APP_URL || "https://conalounge.co.za"}/admin/login

Best regards,
CONA Lounge Management
        `.trim(),
      });
    } catch (emailError) {
      console.error(
        "Welcome email failed but user was created successfully:",
        emailError
      );
    }

    console.log("Admin user created successfully:", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin account created successfully",
        user_id: userId,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error("Create Admin Error:", err);

    return new Response(
      JSON.stringify({
        error: err?.message || "Failed to create admin user",
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