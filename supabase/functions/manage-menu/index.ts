// supabase/functions/manage-menu/index.ts
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
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, item, id, search, category } = body;

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // =========================
    // GET MENU ITEMS
    // =========================
    if (action === "get") {
      let query = supabase
        .from("menu_items")
        .select("*")
        .is("deleted_at", null)                    // Respect soft delete
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data: data ?? [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // =========================
    // CREATE ITEM
    // =========================
    if (action === "create") {
      if (!item?.name || !item?.price) {
        throw new Error("Name and price are required");
      }

      const payload = {
        name: item.name,
        description: item.description || "",
        price: Number(item.price),
        image_url: item.image_url || null,
        category: item.category || "General",
        is_available: true,
        is_featured: item.is_featured ?? false,
        is_published: item.is_published ?? true,
        show_on_public: item.show_on_public ?? true,
        sort_order: Number(item.sort_order ?? 0),
        cost_price: Number(item.cost_price ?? 0),
      };

      const { data, error } = await supabase
        .from("menu_items")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // =========================
    // UPDATE ITEM
    // =========================
    if (action === "update") {
      if (!item?.id) throw new Error("Item ID required");

      const { data, error } = await supabase
        .from("menu_items")
        .update({
          name: item.name,
          description: item.description,
          price: Number(item.price),
          image_url: item.image_url,
          category: item.category,
          is_available: item.is_available,
          is_featured: item.is_featured,
          is_published: item.is_published,
          show_on_public: item.show_on_public,
          sort_order: Number(item.sort_order ?? 0),
          cost_price: Number(item.cost_price ?? 0),
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // =========================
    // TOGGLE AVAILABILITY
    // =========================
    if (action === "toggle-availability") {
      const { data: existing, error: fetchError } = await supabase
        .from("menu_items")
        .select("is_available")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("menu_items")
        .update({
          is_available: !existing.is_available,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // =========================
    // SOFT DELETE
    // =========================
    if (action === "delete") {
      if (!id) throw new Error("Item ID required");

      const { error } = await supabase
        .from("menu_items")
        .update({
          deleted_at: new Date().toISOString(),
          is_available: false,
          is_published: false,
        })
        .eq("id", id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    throw new Error("Invalid action");
  } catch (err: any) {
    console.error("MENU FUNCTION ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});