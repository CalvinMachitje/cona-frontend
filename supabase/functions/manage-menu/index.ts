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
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (search?.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
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
      if (!item?.name?.trim() || !item?.price) {
        throw new Error("Item name and price are required");
      }

      const payload = {
        name: item.name.trim(),
        description: item.description?.trim() || null,
        price: Number(item.price),
        cost_price: Number(item.cost_price ?? 0),
        image_url: item.image_url || null,
        category: item.category?.trim() || "General",
        is_available: true,
        is_featured: Boolean(item.is_featured),
        is_published: Boolean(item.is_published ?? true),
        show_on_public: Boolean(item.show_on_public ?? true),
        sort_order: Number(item.sort_order ?? 0),
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
          message: "Menu item created successfully",
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
      if (!item?.id) throw new Error("Item ID is required for update");

      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      // Only include fields that were sent
      if (item.name !== undefined) updatePayload.name = item.name.trim();
      if (item.description !== undefined) updatePayload.description = item.description?.trim() || null;
      if (item.price !== undefined) updatePayload.price = Number(item.price);
      if (item.cost_price !== undefined) updatePayload.cost_price = Number(item.cost_price ?? 0);
      if (item.image_url !== undefined) updatePayload.image_url = item.image_url || null;
      if (item.category !== undefined) updatePayload.category = item.category.trim();
      if (item.is_available !== undefined) updatePayload.is_available = Boolean(item.is_available);
      if (item.is_featured !== undefined) updatePayload.is_featured = Boolean(item.is_featured);
      if (item.is_published !== undefined) updatePayload.is_published = Boolean(item.is_published);
      if (item.show_on_public !== undefined) updatePayload.show_on_public = Boolean(item.show_on_public);
      if (item.sort_order !== undefined) updatePayload.sort_order = Number(item.sort_order);

      const { data, error } = await supabase
        .from("menu_items")
        .update(updatePayload)
        .eq("id", item.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data,
          message: "Menu item updated successfully",
        }),
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
      if (!id) throw new Error("Item ID is required for deletion");

      const { error } = await supabase
        .from("menu_items")
        .update({
          deleted_at: new Date().toISOString(),
          is_available: false,
          is_published: false,
          show_on_public: false,
        })
        .eq("id", id);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Menu item deleted successfully",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // =========================
    // TOGGLE AVAILABILITY (Legacy support)
    // =========================
    if (action === "toggle-availability") {
      if (!id) throw new Error("Item ID required");

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
        JSON.stringify({ success: true, message: "Availability toggled" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    throw new Error("Invalid action specified");
  } catch (err: any) {
    console.error("MENU FUNCTION ERROR:", err);

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