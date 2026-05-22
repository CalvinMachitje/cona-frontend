// supabase/functions/manage-users/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    console.log("REQUEST BODY:", JSON.stringify(body));

    const { action, ...data } = body;

    if (!action) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing action",
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

    // =====================================================
    // GET USERS
    // =====================================================
    if (action === "get") {
      const { data: users, error } = await supabase
        .from("users")
        .select(`
          id,
          full_name,
          email,
          phone,
          role,
          status,
          created_at,
          deleted_at
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("GET USERS ERROR:", error);

        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
            details: error,
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

      return new Response(
        JSON.stringify({
          success: true,
          data: users ?? [],
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =====================================================
    // CREATE USER
    // =====================================================
    if (action === "create") {
      const email = data.email?.trim()?.toLowerCase();
      const full_name = data.full_name?.trim();
      const phone = data.phone?.trim() || null;
      const role = data.role || "staff";

      if (!email || !full_name) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Email and full_name are required",
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

      // =========================================
      // CHECK EXISTING PUBLIC USER
      // =========================================
      const { data: existingPublicUser, error: existingPublicError } =
        await supabase
          .from("users")
          .select("id, email")
          .eq("email", email)
          .maybeSingle();

      if (existingPublicError) {
        console.error(
          "EXISTING PUBLIC USER CHECK ERROR:",
          existingPublicError
        );

        return new Response(
          JSON.stringify({
            success: false,
            error: existingPublicError.message,
            details: existingPublicError,
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

      if (existingPublicUser) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "User with this email already exists",
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

      // =========================================
      // CREATE AUTH USER
      // =========================================
      const temporaryPassword =
        "Temp@" + crypto.randomUUID().replace(/-/g, "").slice(0, 10);

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            full_name,
            role,
          },
        });

      if (authError) {
        console.error("AUTH CREATE ERROR:", authError);

        return new Response(
          JSON.stringify({
            success: false,
            error: authError.message,
            details: authError,
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

      if (!authData?.user?.id) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Auth user creation failed",
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

      console.log("AUTH USER CREATED:", authData.user.id);

      // =========================================
      // OPTIONAL AUDIT LOG
      // =========================================
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          user_id: authData.user.id,
          action: "create_user",
          entity: "users",
          entity_id: authData.user.id,
          metadata: {
            email,
            role,
          },
          service: "admin_panel",
          severity: "info",
          status: "success",
        });

      if (auditError) {
        console.error("AUDIT LOG ERROR:", auditError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "User created successfully",
          user: {
            id: authData.user.id,
            full_name,
            email,
            role,
          },
          temporary_password: temporaryPassword,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =====================================================
    // UPDATE ROLE
    // =====================================================
    if (action === "update-role") {
      if (!data.user_id || !data.role) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "user_id and role are required",
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

      const { error } = await supabase
        .from("users")
        .update({
          role: data.role,
        })
        .eq("id", data.user_id);

      if (error) {
        console.error("UPDATE ROLE ERROR:", error);

        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
            details: error,
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

      return new Response(
        JSON.stringify({
          success: true,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =====================================================
    // SOFT DELETE USER
    // =====================================================
    if (action === "soft-delete") {
      if (!data.user_id) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "user_id required",
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

      const { error } = await supabase
        .from("users")
        .update({
          deleted_at: new Date().toISOString(),
          status: "suspended",
        })
        .eq("id", data.user_id);

      if (error) {
        console.error("SOFT DELETE ERROR:", error);

        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
            details: error,
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

      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          user_id: data.user_id,
          action: "soft_delete",
          entity: "users",
          entity_id: data.user_id,
          metadata: {
            reason: data.reason || "No reason provided",
          },
          service: "admin_panel",
          severity: "warning",
          status: "success",
        });

      if (auditError) {
        console.error("AUDIT LOG ERROR:", auditError);
      }

      return new Response(
        JSON.stringify({
          success: true,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =====================================================
    // HARD DELETE USER
    // =====================================================
    if (action === "delete") {
      if (!data.user_id) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "user_id required",
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

      const { error } = await supabase.auth.admin.deleteUser(data.user_id);

      if (error) {
        console.error("DELETE USER ERROR:", error);

        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
            details: error,
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

      return new Response(
        JSON.stringify({
          success: true,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =====================================================
    // INVALID ACTION
    // =====================================================
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid action",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("FULL EDGE FUNCTION ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Unknown error",
        details: error,
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
});