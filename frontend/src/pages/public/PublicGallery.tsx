// frontend/src/pages/public/PublicGallery.tsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type GalleryImage = {
  id: string;
  image_url: string;
  category: "venue" | "lifestyle";
  sort_order: number;
  description?: string;
};

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<"venue" | "lifestyle">("venue");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;

      setGalleryImages(data || []);
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

  const filteredImages = galleryImages.filter(
    (img) => img.category === activeCategory
  );

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
          <p className="text-zinc-400">Loading Gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={loadGallery} className="px-6 py-3 bg-white text-black rounded-xl">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="container mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-[0.5em] text-primary mb-4">Gallery</p>
          <h1 className="font-display text-6xl md:text-8xl text-white mb-6">
            Inside <span className="text-primary">CONA</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Explore our venue, lifestyle, and more through our curated gallery of images.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-14 flex-wrap">
          <FilterButton
            active={activeCategory === "venue"}
            onClick={() => setActiveCategory("venue")}
          >
            Venue Images
          </FilterButton>
          <FilterButton
            active={activeCategory === "lifestyle"}
            onClick={() => setActiveCategory("lifestyle")}
          >
            Lifestyle
          </FilterButton>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {filteredImages.length === 0 ? (
            <div className="col-span-full text-center py-20 text-zinc-400">
              No images found in this category yet.
            </div>
          ) : (
            filteredImages.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                viewport={{ once: true }}
                className="break-inside-avoid mb-5"
              >
                <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm shadow-lg hover:border-primary/40 transition-all duration-300">
                  <div className="p-3">
                    <img
                      src={img.image_url}
                      alt={img.description || img.category}
                      loading="lazy"
                      className="w-full h-auto object-contain rounded-2xl transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition duration-300">
                    <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
                      {img.category === "venue" ? "Venue" : "Lifestyle"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 rounded-2xl font-medium transition-all duration-300 ${
        active
          ? "bg-primary text-white shadow-lg shadow-primary/25"
          : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
      }`}
    >
      {children}
    </button>
  );
}