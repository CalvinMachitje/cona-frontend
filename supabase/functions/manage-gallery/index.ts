// supabase/functions/manage-gallery/index.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";

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
    const body = await req.json();
    const { action, image_url, category, description, id, sort_order } = body;

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // =========================
    // GET ALL GALLERY IMAGES
    // =========================
    if (action === "get") {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return Response.json(
        { 
          success: true, 
          data: data ?? [] 
        },
        { headers: corsHeaders }
      );
    }

    // =========================
    // CREATE NEW GALLERY IMAGE
    // =========================
    if (action === "create") {
      if (!image_url?.trim() || !category) {
        throw new Error("image_url and category are required");
      }

      const payload = {
        image_url: image_url.trim(),
        category: category.trim(),
        description: description?.trim() || null,
        sort_order: Number(sort_order ?? 0),
        is_active: true,
      };

      const { data, error } = await supabase
        .from("gallery_images")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return Response.json(
        { 
          success: true, 
          data,
          message: "Gallery image created successfully" 
        },
        { 
          status: 201, 
          headers: corsHeaders 
        }
      );
    }

    // =========================
    // UPDATE IMAGE
    // =========================
    if (action === "update") {
      if (!id) throw new Error("Image ID is required for update");

      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      if (description !== undefined) updatePayload.description = description?.trim() || null;
      if (sort_order !== undefined) updatePayload.sort_order = Number(sort_order);

      const { data, error } = await supabase
        .from("gallery_images")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return Response.json(
        { 
          success: true, 
          data,
          message: "Gallery image updated successfully" 
        },
        { headers: corsHeaders }
      );
    }

    // =========================
    // SOFT DELETE
    // =========================
    if (action === "delete") {
      if (!id) throw new Error("Image ID is required");

      const { error } = await supabase
        .from("gallery_images")
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString() 
        })
        .eq("id", id);

      if (error) throw error;

      return Response.json(
        { 
          success: true, 
          message: "Gallery image deleted successfully" 
        },
        { headers: corsHeaders }
      );
    }

    throw new Error("Invalid action specified");
  } catch (err: any) {
    console.error("GALLERY FUNCTION ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Internal server error",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});