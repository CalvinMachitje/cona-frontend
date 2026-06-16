// frontend/src/pages/admin/gallery.tsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Eye,
} from "lucide-react";

type GalleryImage = {
  id: string;
  image_url: string;
  category: "venue" | "lifestyle";
  sort_order: number;
  description?: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"venue" | "lifestyle">("venue");
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);

  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      const fileName = `gallery-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(fileName);

      await supabase.from("gallery_images").insert({
        image_url: urlData.publicUrl,
        category: selectedCategory,
        sort_order: images.filter((img) => img.category === selectedCategory).length + 1,
        description: description.trim() || null,
      });

      setDescription("");
      await loadGallery();
      alert("✅ Image uploaded successfully!");
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm("Delete this gallery image?")) return;
    try {
      await supabase.from("gallery_images").update({ is_active: false }).eq("id", id);
      await loadGallery();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const venueImages = images.filter((img) => img.category === "venue");
  const lifestyleImages = images.filter((img) => img.category === "lifestyle");

  const currentImages = selectedCategory === "venue" ? venueImages : lifestyleImages;

  if (loading) {
    return (
      <div className="p-6 text-white flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin mr-3" size={32} />
        Loading gallery...
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-zinc-400 mt-2 text-lg">Showcase the atmosphere and lifestyle of Cona Lounge</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setSelectedCategory("venue")}
          className={`flex-1 py-5 text-center font-semibold text-lg transition-all border-b-4 ${
            selectedCategory === "venue"
              ? "border-white text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          VENUE GALLERY ({venueImages.length})
        </button>
        <button
          onClick={() => setSelectedCategory("lifestyle")}
          className={`flex-1 py-5 text-center font-semibold text-lg transition-all border-b-4 ${
            selectedCategory === "lifestyle"
              ? "border-white text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          LIFESTYLE GALLERY ({lifestyleImages.length})
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold flex items-center gap-3">
            <Upload size={28} /> Add New {selectedCategory === "venue" ? "Venue" : "Lifestyle"} Image
          </h3>
        </div>

        <button
          onClick={() => document.getElementById("gallery-upload")?.click()}
          className="w-full py-8 border-2 border-dashed border-zinc-600 hover:border-amber-400 rounded-3xl transition-all hover:bg-zinc-950 group"
        >
          <div className="flex flex-col items-center">
            <Upload className="w-16 h-16 text-zinc-400 group-hover:text-amber-400 transition" />
            <p className="mt-6 text-xl font-medium">Click to Upload Image</p>
            <p className="text-zinc-500 mt-1">PNG, JPG, WebP — Recommended size under 5MB</p>
          </div>
        </button>

        <input
          type="file"
          accept="image/*"
          id="gallery-upload"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />

        {uploading && <p className="text-amber-400 text-center mt-4">Uploading...</p>}
      </div>

      {/* Description Input */}
      <div className="max-w-2xl">
        <label className="block text-sm text-zinc-400 mb-2">Image Description (Optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description for this image..."
          className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-2xl p-5 focus:border-white resize-y"
        />
      </div>

      {/* Images Grid for Selected Category */}
      <div>
        <h3 className="text-2xl font-semibold mb-6">
          {selectedCategory === "venue" ? "Venue" : "Lifestyle"} Images • {currentImages.length} total
        </h3>

        {currentImages.length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-3xl p-20 text-center">
            <ImageIcon className="mx-auto text-zinc-500 mb-6" size={80} />
            <h4 className="text-3xl font-semibold">No images in this category yet</h4>
            <p className="text-zinc-400 mt-4">Use the upload button above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentImages.map((img) => (
              <div
                key={img.id}
                className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-amber-400 transition-all cursor-pointer"
                onClick={() => setPreviewImage(img)}
              >
                <img
                  src={img.image_url}
                  alt={img.description || ""}
                  className="w-full aspect-video object-cover"
                />

                {img.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-5">
                    <p className="text-sm text-white line-clamp-2">{img.description}</p>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(img.id);
                  }}
                  className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-700 p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition z-10"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-5 -right-5 bg-zinc-900 p-4 rounded-full text-white hover:bg-zinc-800"
            >
              <X size={28} />
            </button>
            <img
              src={previewImage.image_url}
              alt={previewImage.description}
              className="w-full rounded-3xl shadow-2xl"
            />
            {previewImage.description && (
              <div className="mt-8 bg-zinc-900 p-8 rounded-2xl">
                <p className="text-lg leading-relaxed">{previewImage.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}