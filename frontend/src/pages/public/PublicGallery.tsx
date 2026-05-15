// frontend/src/pages/PublicGallery.tsx
import { motion } from "framer-motion";
import { useState } from "react";
import NeonBackground from "@/components/NeonBackground";

// Venue Images
import venue1 from "@/assets/Cona images/inside_view.webp";
import venue2 from "@/assets/Cona images/inside_view2.webp";
import venue3 from "@/assets/Cona images/inside_view3.webp";
import venue4 from "@/assets/Cona images/inside_view4.webp";
import venue5 from "@/assets/Cona images/inside_view5.webp";
import venue6 from "@/assets/Cona images/inside_view6.webp";
import venue7 from "@/assets/Cona images/staff.webp";

// Drinks & Meals
import drink1 from "@/assets/cocktail.jpg";
import drink2 from "@/assets/bartender.jpg";
import meal1 from "@/assets/dining.jpg";

type Category = "venue" | "drinks" | "meals";

const galleryImages = [
  // Venue
  { src: venue1, alt: "Main Lounge", category: "venue" as Category },
  { src: venue2, alt: "Bar Area", category: "venue" as Category },
  { src: venue3, alt: "Outdoor Seating", category: "venue" as Category },
  { src: venue4, alt: "VIP Section", category: "venue" as Category },
  { src: venue5, alt: "Dance Floor", category: "venue" as Category },
  { src: venue6, alt: "Live Music Stage", category: "venue" as Category },
  { src: venue7, alt: "Friendly Staff", category: "venue" as Category },

  // Drinks
  { src: drink1, alt: "Premium Cocktails", category: "drinks" as Category },
  { src: drink2, alt: "Liquor Collection", category: "drinks" as Category },

  // Meals
  { src: meal1, alt: "Grilled Specials", category: "meals" as Category },
];

export default function PublicGallery() {
  const [activeCategory, setActiveCategory] = useState<Category>("venue");

  const filteredImages = galleryImages.filter(
    (img) => img.category === activeCategory
  );

  return (
    <>
      <NeonBackground primaryColor="#22d3ee" />

      <div className="bg-zinc-950 min-h-screen text-white relative">
        <div className="container mx-auto px-5 sm:px-6 py-16 md:py-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs uppercase tracking-[0.5em] text-primary mb-4">
              GALLERY
            </p>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6">
              Inside <span className="text-primary">CONA</span>
            </h1>

            <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
              Explore our venue, signature cocktails, and delicious meals.
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-14 flex-wrap">
            <FilterButton
              active={activeCategory === "venue"}
              onClick={() => setActiveCategory("venue")}
            >
              Venue
            </FilterButton>

            <FilterButton
              active={activeCategory === "drinks"}
              onClick={() => setActiveCategory("drinks")}
            >
              Cocktails & Drinks
            </FilterButton>

            <FilterButton
              active={activeCategory === "meals"}
              onClick={() => setActiveCategory("meals")}
            >
              Meals
            </FilterButton>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredImages.map((img, index) => (
              <motion.div
                key={`${activeCategory}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl border border-zinc-800 group aspect-[4/3] sm:aspect-[16/13]"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-sm font-medium text-white tracking-wide">
                    {img.alt}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <p className="text-center text-zinc-500 py-20">
              No images available in this category yet.
            </p>
          )}
        </div>
      </div>
    </>
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
      className={`px-6 sm:px-8 py-3 rounded-2xl font-medium transition text-sm sm:text-base ${
        active
          ? "bg-primary text-white shadow-lg shadow-primary/30"
          : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}