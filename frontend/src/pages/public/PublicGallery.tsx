// frontend/src/pages/public/PublicGallery.tsx
import { motion } from "framer-motion";
import { useState } from "react";

// Venue
import venue1 from "@/assets/Cona images/inside_view.webp";
import venue2 from "@/assets/Cona images/inside_view2.webp";
import venue3 from "@/assets/Cona images/inside_view3.webp";
import venue4 from "@/assets/Cona images/inside_view4.webp";
import venue5 from "@/assets/pictures/venue.jpg";
import venue6 from "@/assets/pictures/venue1.jpg";
import venue7 from "@/assets/pictures/venue2.jpg";
import venue8 from "@/assets/pictures/venue3.jpg";
import venue9 from "@/assets/Cona images/staff.webp";
import venue10 from "@/assets/pictures/bathroom.jpg";
import venue11 from "@/assets/dinepe/Cona images/outside.jpg";

// Lifestyle
import lifestyle1 from "@/assets/pictures/lifestyle.jpg";
import lifestyle2 from "@/assets/pictures/lifestyle2.jpg";
import lifestyle3 from "@/assets/pictures/biya.jpg";
import lifestyle4 from "@/assets/pictures/biya1.jpg";
import lifestyle5 from "@/assets/pictures/logoimage.jpg";
import lifestyle6 from "@/assets/pictures/customers.jpg";
import lifestyle7 from "@/assets/dinepe/Cona images/lifestyle4.jpg";
import lifestyle8 from "@/assets/dinepe/Cona images/inside.jpg";
import lifestyle9 from "@/assets/dinepe/Cona images/view.jpg";
import lifestyle10 from "@/assets/dinepe/Cona images/hubbly.jpg";

type Category = "venue" | "lifestyle";

const galleryImages = [
  // Venue
  { src: venue1, category: "venue" },
  { src: venue2, category: "venue" },
  { src: venue3, category: "venue" },
  { src: venue4, category: "venue" },
  { src: venue5, category: "venue" },
  { src: venue6, category: "venue" },
  { src: venue7, category: "venue" },
  { src: venue8, category: "venue" },
  { src: venue9, category: "venue" },
  { src: venue10, category: "venue" },
  { src: venue11, category: "venue" },

  // Lifestyle
  { src: lifestyle1, category: "lifestyle" },
  { src: lifestyle2, category: "lifestyle" },
  { src: lifestyle3, category: "lifestyle" },
  { src: lifestyle4, category: "lifestyle" },
  { src: lifestyle5, category: "lifestyle" },
  { src: lifestyle6, category: "lifestyle" },
  { src: lifestyle7, category: "lifestyle" },
  { src: lifestyle8, category: "lifestyle" },
  { src: lifestyle9, category: "lifestyle" },
  { src: lifestyle10, category: "lifestyle" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] =
    useState<Category>("venue");

  const filteredImages = galleryImages.filter(
    (img) => img.category === activeCategory
  );

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
          <p className="text-xs uppercase tracking-[0.5em] text-primary mb-4">
            Gallery
          </p>

          <h1 className="font-display text-6xl md:text-8xl text-white mb-6">
            Inside <span className="text-primary">CONA</span>
          </h1>

          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Explore our venue, premium drinks, and delicious meals.
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

          {/*
          <FilterButton
            active={activeCategory === "drinks"}
            onClick={() => setActiveCategory("drinks")}
          >
            Cocktails / Liquor
          </FilterButton>

          <FilterButton
            active={activeCategory === "meals"}
            onClick={() => setActiveCategory("meals")}
          >
            Meals Served
          </FilterButton>*/}

          <FilterButton
            active={activeCategory === "lifestyle"}
            onClick={() => setActiveCategory("lifestyle")}
          >
            Lifestyle
          </FilterButton>
        </div>

        {/* Gallery */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {filteredImages.map((img, index) => (
            <motion.div
              key={`${activeCategory}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.04,
              }}
              viewport={{ once: true }}
              className="break-inside-avoid mb-5"
            >
              <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm shadow-lg hover:border-primary/40 transition-all duration-300">
                <div className="p-3">
                  <img
                    src={img.src}
                    alt={img.category}
                    loading="lazy"
                    className="w-full h-auto object-contain rounded-2xl transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition duration-300">
                  <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
                    {img.category === "venue" && "Venue"}
                    {img.category === "drinks" && "Drinks"}
                    {img.category === "meals" && "Meals"}
                    {img.category === "lifestyle" && "Lifestyle"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
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