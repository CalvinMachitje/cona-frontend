// frontend/src/pages/PublicGallery.tsx
import { motion } from "framer-motion";
import { useState } from "react";

// Venue
import venue1 from "@/assets/Cona images/inside_view.webp";
import venue2 from "@/assets/Cona images/inside_view2.webp";
import venue3 from "@/assets/Cona images/inside_view3.webp";
import venue4 from "@/assets/Cona images/inside_view4.webp";
import venue5 from "@/assets/Cona images/inside_view5.webp";
import venue6 from "@/assets/Cona images/inside_view6.webp";
import venue7 from "@/assets/Cona images/staff.webp";

// Drinks
import drink1 from "@/assets/cocktail.jpg";
import drink2 from "@/assets/bartender.jpg";
/*import drink3 from "@/assets/drink3.jpg";
import drink4 from "@/assets/drink4.jpg";*/

// Meals
import meal1 from "@/assets/dining.jpg";
/*import meal2 from "@/assets/meal2.jpg";
import meal3 from "@/assets/meal3.jpg";
import meal4 from "@/assets/meal4.jpg";*/

type Category = "venue" | "drinks" | "meals";

const galleryImages = [
  // Venue
  { src: venue1, alt: "Main Lounge", category: "venue" },
  { src: venue2, alt: "Bar Area", category: "venue" },
  { src: venue3, alt: "Outdoor Seating", category: "venue" },
  { src: venue4, alt: "VIP Section", category: "venue" },
  { src: venue5, alt: "Dance Floor", category: "venue" },
  { src: venue6, alt: "Live Music Stage", category: "venue" },
  { src: venue7, alt: "Friendly Staff", category: "venue" },

  // Drinks
  { src: drink1, alt: "Premium Cocktails", category: "drinks" },
  { src: drink2, alt: "Liquor Collection", category: "drinks" },
  /*{ src: drink3, alt: "Whiskey Selection", category: "drinks" },
  { src: drink4, alt: "Signature Drinks", category: "drinks" },*/

  // Meals
  { src: meal1, alt: "Grilled Specials", category: "meals" },
  /*{ src: meal2, alt: "Burger Meals", category: "meals" },
  { src: meal3, alt: "Steak Platters", category: "meals" },
  { src: meal4, alt: "Chef Specials", category: "meals" },*/
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
          </FilterButton>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {filteredImages.map((img, index) => (
            <motion.div
              key={`${activeCategory}-${index}`}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border border-zinc-800 group h-[300px]"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition">
                <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium">
                  {img.alt}
                </p>
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
      className={`px-8 py-3 rounded-2xl font-medium transition ${
        active
          ? "bg-primary text-white"
          : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}