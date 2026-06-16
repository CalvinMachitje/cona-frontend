// frontend/src/pages/admin/gallery.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
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
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<"venue" | "lifestyle">("venue");
  const [description, setDescription] = useState("");

  const loadGallery = async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const uploadGalleryImage = async (file: File) => {
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

      const { error: insertError } = await supabase.from("gallery_images").insert({
        image_url: urlData.publicUrl,
        category: selectedCategory,
        sort_order: images.filter((img) => img.category === selectedCategory).length + 1,
        description: description.trim() || null,
      });

      if (insertError) throw insertError;

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
      const { error } = await supabase
        .from("gallery_images")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      await loadGallery();
    } catch (err: any) {
      alert("Failed to delete image: " + err.message);
    }
  };

  const filteredImages = images.filter((img) => img.category === selectedCategory);

  if (loading) {
    return (
      <div className="p-6 text-white flex items-center">
        <Loader2 className="animate-spin mr-3" size={24} />
        Loading gallery...
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Gallery Management</h1>
          <p className="text-zinc-400 mt-1">Manage images shown on the public gallery page</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-4 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setSelectedCategory("venue")}
          className={`px-8 py-3 rounded-xl font-medium transition-all ${
            selectedCategory === "venue"
              ? "bg-white text-black"
              : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white"
          }`}
        >
          Venue Images
        </button>
        <button
          onClick={() => setSelectedCategory("lifestyle")}
          className={`px-8 py-3 rounded-xl font-medium transition-all ${
            selectedCategory === "lifestyle"
              ? "bg-white text-black"
              : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white"
          }`}
        >
          Lifestyle Images
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
          <Upload size={24} /> Upload New Gallery Image
        </h3>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm text-zinc-400 mb-2">Select Image</label>
            <div className="border-2 border-dashed border-zinc-600 hover:border-amber-400 rounded-2xl p-10 text-center transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && uploadGalleryImage(e.target.files[0])}
                className="hidden"
                id="gallery-upload"
              />
              <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center">
                <ImageIcon className="w-16 h-16 text-zinc-400 mb-4" />
                <span className="text-white font-medium text-lg">Click or drag image here</span>
                <span className="text-zinc-500 text-sm mt-2">PNG, JPG, WebP • Recommended max 5MB</span>
              </label>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm text-zinc-400 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Main dance floor with VIP seating"
              className="w-full h-40 p-4 bg-zinc-800 border border-zinc-700 rounded-2xl resize-y focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-3 text-amber-400">
            <Loader2 className="animate-spin" size={20} />
            Uploading image...
          </div>
        )}
      </div>

      {/* Current Images Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-6">
          Current {selectedCategory === "venue" ? "Venue" : "Lifestyle"} Images ({filteredImages.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.length === 0 ? (
            <div className="col-span-full bg-zinc-900 border border-dashed border-zinc-700 rounded-3xl p-16 text-center">
              <ImageIcon className="mx-auto text-zinc-500 mb-6" size={64} />
              <h4 className="text-2xl font-semibold text-white mb-2">No images found in this category yet.</h4>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Start building your gallery by uploading some beautiful images for{" "}
                <span className="font-medium text-amber-400">
                  {selectedCategory === "venue" ? "the venue" : "lifestyle"}
                </span>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => document.getElementById("gallery-upload")?.click()}
                  className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  <Upload size={20} />
                  Upload First Image
                </button>

                <button
                  onClick={() => setSelectedCategory(selectedCategory === "venue" ? "lifestyle" : "venue")}
                  className="flex items-center justify-center gap-3 border border-zinc-700 hover:bg-zinc-800 px-8 py-4 rounded-2xl font-medium transition"
                >
                  Switch to {selectedCategory === "venue" ? "Lifestyle" : "Venue"} Gallery
                </button>
              </div>
            </div>
          ) : (
            filteredImages.map((img) => (
              <div
                key={img.id}
                className="relative group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-200"
              >
                <img
                  src={img.image_url}
                  alt={img.description || "Gallery Image"}
                  className="w-full h-64 object-cover"
                />

                {img.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                    <p className="text-sm text-zinc-300 line-clamp-2">{img.description}</p>
                  </div>
                )}

                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="bg-red-600 hover:bg-red-700 p-3 rounded-full text-white shadow-lg transition-all active:scale-95"
                    title="Delete Image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}