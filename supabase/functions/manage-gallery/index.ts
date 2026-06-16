// supabase/functions/manage-gallery/index.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
};

const VALID_CATEGORIES = ["venue", "lifestyle"];

function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    const {
      action,
      image_url,
      category,
      description,
      id,
      sort_order,
    } = body;

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // ==================================================
    // GET GALLERY IMAGES
    // ==================================================
    if (action === "get") {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return jsonResponse({
        success: true,
        data: data ?? [],
      });
    }

    // ==================================================
    // CREATE IMAGE
    // ==================================================
    if (action === "create") {
      if (!image_url?.trim()) {
        throw new Error("Image URL is required");
      }

      if (!category?.trim()) {
        throw new Error("Category is required");
      }

      if (!VALID_CATEGORIES.includes(category)) {
        throw new Error(
          `Invalid category. Allowed values: ${VALID_CATEGORIES.join(", ")}`,
        );
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

      return jsonResponse(
        {
          success: true,
          message: "Gallery image created successfully",
          data,
        },
        201,
      );
    }

    // ==================================================
    // UPDATE IMAGE
    // ==================================================
    if (action === "update") {
      if (!id) {
        throw new Error("Image ID is required");
      }

      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (description !== undefined) {
        updatePayload.description =
          description?.trim() || null;
      }

      if (sort_order !== undefined) {
        updatePayload.sort_order = Number(sort_order);
      }

      if (category !== undefined) {
        if (!VALID_CATEGORIES.includes(category)) {
          throw new Error(
            `Invalid category. Allowed values: ${VALID_CATEGORIES.join(", ")}`,
          );
        }

        updatePayload.category = category.trim();
      }

      const { data, error } = await supabase
        .from("gallery_images")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return jsonResponse({
        success: true,
        message: "Gallery image updated successfully",
        data,
      });
    }

    // ==================================================
    // DELETE IMAGE (SOFT DELETE)
    // ==================================================
    if (action === "delete") {
      if (!id) {
        throw new Error("Image ID is required");
      }

      const { error } = await supabase
        .from("gallery_images")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      return jsonResponse({
        success: true,
        message: "Gallery image deleted successfully",
      });
    }

    // ==================================================
    // GET BY CATEGORY
    // ==================================================
    if (action === "get-by-category") {
      if (!category) {
        throw new Error("Category is required");
      }

      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .eq("category", category)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return jsonResponse({
        success: true,
        data: data ?? [],
      });
    }

    throw new Error("Invalid action specified");
  } catch (err: any) {
    console.error("MANAGE GALLERY ERROR:", err);

    return jsonResponse(
      {
        success: false,
        error: err?.message || "Internal server error",
      },
      400,
    );
  }
});