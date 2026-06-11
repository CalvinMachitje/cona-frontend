// frontend/src/pages/public/menu.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Star,
} from "lucide-react";

import champagne from "@/assets/pictures/verve.jpg";
import cocktail from "@/assets/pictures/cocktail.webp";
import shots from "@/assets/pictures/shots.jpg";
import spirits1 from "@/assets/pictures/Spirits1.webp";
import wines from "@/assets/pictures/wines.webp";
import beers from "@/assets/pictures/beers.jpg";
import starters from "@/assets/pictures/starters.webp";
import lightMeals from "@/assets/pictures/lightmeal.jpg";
import mains from "@/assets/pictures/mealsVid.mp4";
import platters from "@/assets/dinepe/Cona images/plater4.jpg";
import desserts from "@/assets/pictures/desserts.jpg";
import softDrinks from "@/assets/pictures/softdrinks.jpg";
import hotBeverages from "@/assets/pictures/hotbeverages.jpg";

import special from "@/assets/dinepe/Cona images/chakalaka.jpg";
import special2 from "@/assets/dinepe/Cona images/chips.jpg";
import special3 from "@/assets/dinepe/Cona images/daily special.jpg";
import special4 from "@/assets/dinepe/Cona images/flame grill combo.jpg";
import special5 from "@/assets/dinepe/Cona images/food7.jpg";
import special6 from "@/assets/dinepe/Cona images/wors roll.jpg";
import { div } from "three/src/nodes/math/OperatorNode.js";

type MenuItem = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  is_featured?: boolean;
  image?: string;
};

type MenuSection = {
  title: string;
  image?: string;
  video?: string;
  items: MenuItem[];
  isSpecials?: boolean;
  specialImages?: string[];
};

const categoryEmoji: Record<string, string> = {
  "Signature Cocktails": "",
  "Shots & Shooters": "",
  "Spirits": "",
  "Wine": "",
  "Champagne & MCC": "",
  "Beer": "",
  "Starters": "",
  "Light Meals": "",
  "Pasta": "",
  "Mains": "",
  "Pizza": "",
  "Platters": "",
  "Desserts": "",
  "Soft Drinks & Ciders": "",
  "Hot Beverages": "",
  "Special Combos": "🔥",
};

const menuSections: MenuSection[] = [
  {
    title: "Signature Cocktails",
    image: cocktail,
    items: [
      { id: "c1", name: "Strawberry Daiquiri", description: "", price: 85 },
      { id: "c2", name: "Blue Lagoon", description: "", price: 90 },
      { id: "c3", name: "Mint Mojito", description: "", price: 75 },
      { id: "c4", name: "Tequila Sunrise / Sunset", description: "", price: 85 },
      { id: "c5", name: "Long Island Iced Tea", description: "", price: 110 },
      { id: "c6", name: "Margarita (Frozen / Shaken)", description: "", price: 90 },
      { id: "c7", name: "Screwdriver (Frozen OPT)", description: "", price: 85 },
      { id: "c8", name: "Cosmopolitan", description: "", price: 75 },
      { id: "c9", name: "Sex on the Beach", description: "", price: 80 },
    ],
  },
  {
    title: "Shots & Shooters",
    image: shots,
    items: [
      { id: "sh1", name: "Passion Fruit", description: "", price: 12 },
      { id: "sh2", name: "Lime", description: "", price: 12 },
      { id: "sh3", name: "Kola Tonic", description: "", price: 12 },
      { id: "sh4", name: "Blowjob", description: "", price: 40 },
      { id: "sh5", name: "Springbok", description: "", price: 35 },
      { id: "sh6", name: "Sowetan Toilet", description: "", price: 35 },
      { id: "sh7", name: "Liquid Cocain", description: "", price: 40 },
    ],
  },
  {
    title: "Spirits",
    image: spirits1,
    items: [
      { id: "sp1", name: "Martel Blue Swift", description: "Shot / Bottle", price: 75 },
      { id: "sp2", name: "Martel VS", description: "Shot / Bottle", price: 60 },
      { id: "sp3", name: "Hennessy VS", description: "Shot / Bottle", price: 55 },
      { id: "sp4", name: "Hennessy VSOP", description: "Shot / Bottle", price: 75 },
      { id: "sp5", name: "Hennessy XO", description: "", price: 6000 },
      { id: "sp6", name: "Jameson", description: "Shot / Bottle", price: 40 },
      { id: "sp7", name: "Jack Daniels", description: "Shot / Bottle", price: 35 },
      { id: "sp8", name: "Glenlivet 12 Yr", description: "Shot / Bottle", price: 70 },
      { id: "sp9", name: "Hendricks", description: "Shot / Bottle", price: 45 },
      { id: "sp10", name: "Tanqueray", description: "Shot / Bottle", price: 35 },
      { id: "sp11", name: "Absolut", description: "Shot / Bottle", price: 45 },
      { id: "sp12", name: "Smirnoff", description: "Shot / Bottle", price: 30 },
      { id: "sp13", name: "Don Julio Blanco", description: "Shot / Bottle", price: 70 },
      { id: "sp14", name: "Jägermeister", description: "", price: 45 },
      { id: "sp15", name: "Kahlua", description: "", price: 25 },
    ],
  },
  {
    title: "Wine",
    image: wines,
    items: [
      { id: "w1", name: "Nederburg Baronne", description: "Red", price: 300 },
      { id: "w2", name: "Rupert & Rothschild", description: "Red", price: 600 },
      { id: "w3", name: "Chocolate Block", description: "Red", price: 600 },
      { id: "w4", name: "Durbanville Hills Sauv Blanc", description: "White", price: 300 },
      { id: "w5", name: "Warwick Chardonnay", description: "White", price: 550 },
    ],
  },
  {
    title: "Champagne & MCC",
    image: champagne,
    items: [
      { id: "ch1", name: "Armand de Brignac Brut", description: "", price: 12000 },
      { id: "ch2", name: "Dom Perignon Blanc", description: "", price: 9500 },
      { id: "ch3", name: "Veuve Clicquot", description: "", price: 1800 },
      { id: "ch4", name: "Moet & Chandon", description: "", price: 1700 },
      { id: "ch5", name: "Krone Brut", description: "", price: 400 },
    ],
  },
  {
    title: "Beer",
    image: beers,
    items: [
      { id: "b1", name: "Castle Lite", description: "", price: 30 },
      { id: "b2", name: "Castle Lager", description: "", price: 32 },
      { id: "b3", name: "Corona Extra", description: "", price: 45 },
      { id: "b4", name: "Heineken", description: "", price: 40 },
      { id: "b5", name: "Stella Artois", description: "", price: 40 },
    ],
  },
  {
    title: "Starters",
    image: starters,
    items: [
      { id: "st1", name: "Stuffed Calamari", description: "Calamari tubes grilled with feta & cream spinach", price: 120 },
      { id: "st2", name: "Lemon Pepper Queen Prawns", description: "4x queen prawns grilled with lemon pepper sauce", price: 150 },
      { id: "st3", name: "Portuguese Chicken Livers", description: "Spicy chicken livers grilled served with toasted ciabatta", price: 90 },
      { id: "st4", name: "Beef Trinchado", description: "Beef strips grilled & smothered in creamy garlic broth", price: 110 },
      { id: "st5", name: "Buffalo Wings", description: "Grilled chicken wings with sweet chilli dip", price: 100 },
    ],
  },
  {
    title: "Light Meals",
    image: lightMeals,
    items: [
      { id: "lm1", name: "Gourmet Sandwich", description: "Grilled chicken breast, hickory ham, English mustard, mayonnaise, cheddar, mozzarella", price: 120 },
      { id: "lm2", name: "Caesar Salad", description: "Fresh mixed lettuce, croutons, grated parmesan cheese", price: 110 },
      { id: "lm3", name: "Fried Chicken Wrap", description: "Chicken breast coated in panko, avocado & mayonnaise", price: 140 },
      { id: "lm4", name: "Garden Salad", description: "Mixed lettuce, cucumber, cherry tomatoes, red onions, feta, olives", price: 100 },
    ],
  },
  {
    title: "Mains",
    image: "",
    video: mains,
    items: [
      { id: "m1", name: "Fillet Steak", description: "Aged 300g fillet with olive oil and coarse salt rub", price: 285 },
      { id: "m2", name: "Pork Belly", description: "Succulent slow cooked pork belly with crispy crackling", price: 200 },
      { id: "m3", name: "Fisherman's Catch", description: "Hake, prawns, squid heads & calamari rings", price: 250 },
      { id: "m4", name: "Kingklip", description: "Meaty fish portion grilled in lemon butter sauce", price: 300 },
      { id: "m5", name: "Chicken Espatada", description: "Deboned chicken thighs marinated overnight", price: 180 },
      { id: "m6", name: "Pig & Chicken", description: "300g loin ribs", price: 275 },
      { id: "m7", name: "T-Bone", description: "500g dry aged T-bone", price: 260 },
    ],
  },
  {
    title: "Platters",
    image: platters,
    items: [
      { id: "pl1", name: "Seafood Platter (4)", description: "4 Hake, 12 Prawns, Calamari, Squid heads", price: 700 },
      { id: "pl2", name: "Meat Platter (4)", description: "Steak, Boerewors, Chicken", price: 400 },
      { id: "pl3", name: "Meat Platter (8)", description: "Ribs, Buffalo wings, Beef sausage, Chicken strips", price: 800 },
    ],
  },
  {
    title: "Desserts",
    image: desserts,
    items: [
      { id: "d1", name: "Cheese Cake", description: "", price: 85 },
      { id: "d2", name: "Malva Pudding", description: "", price: 75 },
      { id: "d3", name: "Chocolate Mud Pie", description: "", price: 90 },
    ],
  },
  {
    title: "Soft Drinks & Ciders",
    image: softDrinks,
    items: [
      { id: "sd1", name: "Coke / Zero / Light", description: "", price: 25 },
      { id: "sd2", name: "Sprite / Zero", description: "", price: 25 },
      { id: "sd3", name: "Red Bull", description: "", price: 45 },
      { id: "sd4", name: "Bernini Classic / Amber / Mimosa", description: "", price: 35 },
      { id: "sd5", name: "Hunters Dry / Gold", description: "", price: 35 },
      { id: "sd6", name: "Savanna", description: "", price: 35 },
    ],
  },
  {
    title: "Hot Beverages",
    image: hotBeverages,
    items: [
      { id: "hb1", name: "Cappuccino", description: "", price: 45 },
      { id: "hb2", name: "Cafe Latte", description: "", price: 40 },
      { id: "hb3", name: "Filter Coffee", description: "", price: 35 },
      { id: "hb4", name: "Hot Chocolate", description: "", price: 45 },
      { id: "hb5", name: "Rooibos", description: "", price: 35 },
    ],
  },
  // ==================== SPECIAL COMBOS ====================
  {
    title: "Special Combos",
    isSpecials: true,
    specialImages: [special, special2, special3, special4, special5, special6],
    items: [], // Empty because we only show images
  },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const current = menuSections[activeCategory];

  const isVideo = !!current.video;
  const isSpecials = current.isSpecials === true;

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

        <p className="text-zinc-400 mt-3 text-lg">
          Premium Spirits • Signature Cocktails • Fine Wines • 
          Sushi • Pizza • Gourmet Mains • Desserts
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
              <span>{categoryEmoji[section.title]}</span>
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
          <div className={`flex ${isSpecials ? 'flex-col' : 'flex-col lg:flex-row'} h-full min-h-[680px]`}>
            {/* LEFT - VISUAL / IMAGES */}
            <div className={`${isSpecials ? 'w-full p-8' : 'lg:w-5/12 bg-black/80 p-10'} flex flex-col items-center justify-center`}>
              {isSpecials ? (
                <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
                  {current.specialImages?.map((img, index) => (
                    <div key={index} className="overflow-hidden rounded-3xl shadow-2xl border border-amber-400/30">
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
                  className="w-full max-h-[520px] object-contain rounded-3xl shadow-2xl mb-8"
                />
              ) : (
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full max-h-[520px] object-contain rounded-3xl shadow-2xl mb-8"
                />
              )}

              {!isSpecials && (
                <>
                  <span className="text-7xl mb-6">{categoryEmoji[current.title]}</span>
                  <h2 className="text-5xl text-center font-bold text-amber-300 tracking-tight">
                    {current.title.toUpperCase()}
                  </h2>
                </>
              )}
            </div>

            {/* RIGHT - ITEMS (Hidden for Special Combos) */}
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
                            <h3 className="text-xl font-semibold leading-tight">
                              {item.name}
                            </h3>
                            {item.is_featured && (
                              <Star size={18} className="text-amber-400 fill-amber-400 mt-0.5" />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-zinc-400 text-sm mt-1.5 leading-snug">
                              {item.description}
                            </p>
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