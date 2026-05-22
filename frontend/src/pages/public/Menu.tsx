// frontend/src/pages/public/Menu.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Star,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  is_featured: boolean;
};

type MenuSection = {
  title: string;
  image: string;
  emoji: string;
  items: MenuItem[];
};

const categoryEmoji: Record<string, string> = {
  Cocktails: "🍸",
  Food: "🍽️",
  "Bottle Service": "🍾",
  Wine: "🍷",
  Beer: "🍺",
  Shots: "🥃",
  Desserts: "🍰",
  General: "✨",
};

export default function MenuPage() {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadMenu = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke(
        "manage-menu",
        {
          body: {
            action: "get",
          },
        }
      );

      if (error) throw error;

      const rawItems: MenuItem[] = data?.data ?? [];

      // IMPORTANT: only available items shown publicly
      const items = rawItems.filter(
        (item) => item?.is_available === true
      );

      const groupedMap: Record<string, MenuSection> = {};

      for (const item of items) {
        if (!groupedMap[item.category]) {
          groupedMap[item.category] = {
            title: item.category,
            image:
              item.image_url ||
              "https://placehold.co/800x800?text=CONA",
            emoji: categoryEmoji[item.category] || "🍽️",
            items: [],
          };
        }

        groupedMap[item.category].items.push(item);
      }

      const grouped = Object.values(groupedMap);

      setSections(grouped);
      setCurrentPage(0); // reset page when reload
    } catch (err) {
      console.error("MENU LOAD ERROR:", err);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const nextPage = () => {
    if (!sections.length) return;
    setCurrentPage((prev) => (prev + 1) % sections.length);
  };

  const prevPage = () => {
    if (!sections.length) return;
    setCurrentPage(
      (prev) => (prev - 1 + sections.length) % sections.length
    );
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;

    if (!sections.length) return;

    if (info.offset.x > threshold) {
      prevPage();
    } else if (info.offset.x < -threshold) {
      nextPage();
    }
  };

  const current = useMemo(
    () => sections[currentPage],
    [sections, currentPage]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading menu...
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-center px-6">
        <div>
          <p className="text-xl font-semibold">
            No menu items available
          </p>
          <p className="text-zinc-400 mt-2">
            Please check back later.
          </p>
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

          <p className="text-amber-400 text-sm tracking-[0.5em] uppercase">
            CONA LOUNGE
          </p>
        </div>

        <h1 className="font-display text-7xl md:text-8xl tracking-tighter">
          OUR MENU
        </h1>

        <p className="text-zinc-400 mt-3">
          Drag left or right to flip pages
        </p>
      </div>

      {/* BOOK */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          className="relative h-[720px] perspective-[1800px]"
          drag="x"
          dragConstraints={{ left: -100, right: 100 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, rotateY: 15, scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: -15, scale: 0.95 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-amber-400/20 bg-zinc-950"
            >
              <div className="flex h-full">
                {/* LEFT */}
                <div className="w-5/12 bg-black/80 p-10 flex flex-col items-center justify-center">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full aspect-square object-cover rounded-3xl shadow-2xl mb-8"
                  />

                  <span className="text-7xl mb-6">
                    {current.emoji}
                  </span>

                  <h2 className="text-5xl text-center font-bold text-amber-300">
                    {current.title}
                  </h2>
                </div>

                {/* RIGHT */}
                <div className="w-7/12 p-10 bg-zinc-950 overflow-y-auto">
                  <div className="space-y-8">
                    {current.items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-white/10 pb-6"
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">
                                {item.name}
                              </h3>

                              {item.is_featured && (
                                <Star
                                  size={16}
                                  className="text-amber-400 fill-amber-400"
                                />
                              )}
                            </div>

                            <p className="text-zinc-400 text-sm mt-2">
                              {item.description}
                            </p>
                          </div>

                          <span className="text-amber-400 text-2xl font-bold">
                            R {item.price}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* CONTROLS */}
        <div className="flex justify-center items-center gap-8 mt-12">
          <button
            onClick={prevPage}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-amber-400/30"
          >
            <ChevronLeft size={22} />
            Previous
          </button>

          <div className="flex gap-3">
            {sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-3.5 h-3.5 rounded-full ${
                  idx === currentPage
                    ? "bg-amber-400 scale-125"
                    : "bg-zinc-700"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-amber-400/30"
          >
            Next
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <p className="text-center text-zinc-500 text-sm pb-10">
        Dynamic digital menu • All prices in ZAR
      </p>
    </div>
  );
}