// frontend/src/pages/public/menu.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_featured: boolean;
  is_published: boolean;
  show_on_public: boolean;
  sort_order: number;
};

type MenuCategory = {
  name: string;
  image_url?: string;
  sort_order: number;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
  image?: string;
  video?: string;
  isSpecials?: boolean;
  specialImages?: string[];
};

const mainsVideo = "/assets/pictures/mealsVid.mp4";

export default function MenuPage() {
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  // Load Categories with Images (from Admin)
  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("name, image_url, sort_order")
        .eq("is_active", true)
        .order("sort_order");

      setCategories(data || []);
      return data || [];
    } catch (err) {
      console.error("Failed to load categories:", err);
      return [];
    }
  };

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      const catData = await loadCategories();

      const { data, error } = await supabase.functions.invoke("manage-menu", {
        body: { 
          action: "get", 
          show_public_only: true 
        },
      });

      if (error) throw error;

      const items: MenuItem[] = data?.data || [];

      // Group items by category
      const grouped = items.reduce((acc: Record<string, MenuItem[]>, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});

      const sections: MenuSection[] = Object.entries(grouped)
        .map(([title, items]) => {
          const catInfo = catData.find((c) => c.name === title);
          return {
            title,
            items: items.sort((a, b) => a.sort_order - b.sort_order),
            image: catInfo?.image_url, // Priority: DB category image
            video: title === "Mains" ? mainsVideo : undefined,
          };
        })
        .sort((a, b) => {
          const orderA = catData.findIndex((c) => c.name === a.title);
          const orderB = catData.findIndex((c) => c.name === b.title);
          return orderA - orderB;
        });

      // Add Special Combos section
      sections.push({
        title: "Special Combos",
        items: [],
        isSpecials: true,
        specialImages: [],
      });

      setMenuSections(sections);
      if (sections.length > 0) setActiveCategory(0);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Load Special Images
  const loadSpecialImages = async () => {
    try {
      const { data } = await supabase
        .from("special_images")
        .select("image_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setMenuSections((prev) =>
          prev.map((section) =>
            section.isSpecials
              ? { ...section, specialImages: data.map((img: any) => img.image_url) }
              : section
          )
        );
      }
    } catch (err) {
      console.error("Failed to load special images:", err);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    if (menuSections.length > 0) {
      loadSpecialImages();
    }
  }, [menuSections.length]);

  const current = menuSections[activeCategory] || { title: "", items: [] };
  const isSpecials = current.isSpecials === true;
  const isVideo = !!current.video;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
          <p>Loading Premium Menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadMenu} 
            className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* HEADER */}
      <div className="pt-20 pb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-10 h-10 text-amber-400" />
          <p className="text-amber-400 text-sm tracking-[0.5em] uppercase">CONA LOUNGE</p>
        </div>
        <h1 className="font-display text-7xl md:text-8xl tracking-tighter">OUR MENU</h1>
        <p className="text-zinc-400 mt-3 text-lg">
          Premium Spirits • Signature Cocktails • Fine Wines • Gourmet Mains
        </p>
      </div>

      {/* CATEGORY NAVIGATION */}
      <div className="max-w-5xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {menuSections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
                idx === activeCategory
                  ? "bg-amber-400 text-black border-amber-400"
                  : "border-zinc-700 hover:border-zinc-500 text-zinc-300"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* SELECTED MENU SECTION */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden border border-amber-400/20 bg-zinc-950"
        >
          <div className={`flex ${isSpecials ? "flex-col" : "flex-col lg:flex-row"} h-full min-h-[680px]`}>
            {/* Visual Side - Now uses Admin-controlled Category Images */}
            <div className={`${isSpecials ? "w-full p-8" : "lg:w-5/12 bg-black/80 p-10"} flex flex-col items-center justify-center`}>
              {isSpecials ? (
                <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
                  {current.specialImages?.map((img, index) => (
                    <div 
                      key={index} 
                      className="overflow-hidden rounded-3xl shadow-2xl border border-amber-400/30"
                    >
                      <img 
                        src={img} 
                        alt={`Special Combo ${index + 1}`} 
                        className="w-full h-full object-contain bg-black" 
                      />
                    </div>
                  ))}
                </div>
              ) : isVideo ? (
                <video
                  src={current.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full max-h-[520px] object-contain rounded-3xl shadow-2xl"
                />
              ) : (
                current.image && (
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full max-h-[520px] object-cover rounded-3xl shadow-2xl"
                  />
                )
              )}

              {!isSpecials && (
                <h2 className="text-5xl text-center font-bold text-amber-300 tracking-tight mt-8">
                  {current.title.toUpperCase()}
                </h2>
              )}
            </div>

            {/* Items List */}
            {!isSpecials && (
              <div className="lg:w-7/12 p-10 bg-zinc-950 overflow-y-auto">
                <div className="space-y-8">
                  {current.items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-white/10 pb-6 last:border-none"
                    >
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <h3 className="text-xl font-semibold leading-tight">{item.name}</h3>
                            {item.is_featured && (
                              <Star size={18} className="text-amber-400 fill-amber-400 mt-1" />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-zinc-400 text-sm mt-1.5 leading-snug">{item.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-amber-400 text-2xl font-bold">R{item.price}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}