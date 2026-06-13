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

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // GET ALL GALLERY IMAGES
    if (action === "get") {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("category")
        .order("sort_order");

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data: data ?? [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CREATE / UPLOAD NEW IMAGE
    if (action === "create") {
      if (!image_url || !category) {
        throw new Error("image_url and category are required");
      }

      const { data, error } = await supabase
        .from("gallery_images")
        .insert({
          image_url,
          category,
          description: description || null,
          sort_order: sort_order || 0,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // UPDATE IMAGE
    if (action === "update") {
      if (!id) throw new Error("ID is required");

      const { error } = await supabase
        .from("gallery_images")
        .update({
          description,
          sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SOFT DELETE
    if (action === "delete") {
      if (!id) throw new Error("ID is required");

      const { error } = await supabase
        .from("gallery_images")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (err: any) {
    console.error("GALLERY FUNCTION ERROR:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});