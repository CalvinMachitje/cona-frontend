// frontend/src/pages/menu.tsx
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import cocktailImg from "@/assets/cocktail.jpg";
import diningImg from "@/assets/dining.jpg";

const menuSections = [
  {
    id: 1,
    title: "Signature Cocktails",
    emoji: "🍸",
    image: cocktailImg,
    items: [
      { name: "Midnight Sapphire", desc: "Gin, blue curaçao, lemon, edible silver", price: "R22" },
      { name: "Electric Storm", desc: "Vodka, elderflower, citrus, smoke", price: "R24" },
      { name: "Velvet Noir", desc: "Bourbon, espresso, dark cacao, vanilla", price: "R23" },
      { name: "Neon Spritz", desc: "Prosecco, aperol, blood orange, basil", price: "R20" },
    ],
  },
  {
    id: 2,
    title: "Fine Dining",
    emoji: "🍽️",
    image: diningImg,
    items: [
      { name: "Wagyu Tartare", desc: "A5 wagyu, quail egg, truffle, brioche", price: "R38" },
      { name: "Yellowfin Crudo", desc: "Citrus, avocado, jalapeño, microgreens", price: "R28" },
      { name: "Black Truffle Risotto", desc: "Carnaroli rice, parmesan, truffle shavings", price: "R34" },
      { name: "Filet Mignon", desc: "8oz prime, foie gras, red wine reduction", price: "R58" },
    ],
  },
  {
    id: 3,
    title: "Bottle Service",
    emoji: "🍾",
    image: diningImg,
    items: [
      { name: "Dom Pérignon Vintage", desc: "750ml — perfect for celebrations", price: "R350" },
      { name: "Grey Goose Magnum", desc: "1.5L vodka — includes mixers", price: "R450" },
      { name: "Macallan 18", desc: "Single malt scotch whisky", price: "R280" },
      { name: "Cristal Rosé", desc: "Limited release — chef's selection", price: "R690" },
    ],
  },
];

export default function Menu() {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % menuSections.length);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + menuSections.length) % menuSections.length);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.x > threshold) prevPage();
    else if (info.offset.x < -threshold) nextPage();
  };

  const current = menuSections[currentPage];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <div className="pt-20 pb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-10 h-10 text-amber-400" />
          <p className="text-amber-400 text-sm tracking-[0.5em] uppercase">CONA LOUNGE</p>
        </div>
        <h1 className="font-display text-7xl md:text-8xl tracking-tighter">OUR MENU</h1>
        <p className="text-zinc-400 mt-3">Drag left or right to flip pages</p>
      </div>

      {/* Book Container */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          className="relative h-[680px] md:h-[740px] perspective-[1800px] mx-auto"
          drag="x"
          dragConstraints={{ left: -100, right: 100 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ 
                opacity: 0, 
                rotateY: 15, 
                scale: 0.95 
              }}
              animate={{ 
                opacity: 1, 
                rotateY: 0, 
                scale: 1 
              }}
              exit={{ 
                opacity: 0, 
                rotateY: -15, 
                scale: 0.95 
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-amber-400/20 bg-zinc-950 shadow-2xl"
              style={{
                boxShadow: `
                  0 60px 100px -20px rgba(0, 0, 0, 0.85),
                  0 25px 50px -12px rgba(0, 0, 0, 0.6),
                  inset 0 0 80px rgba(245, 158, 11, 0.06)
                `,
              }}
            >
              {/* Page Content */}
              <div className="flex h-full">
                {/* Left Side - Visual */}
                <div className="w-5/12 bg-black/80 p-8 md:p-12 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff0a_0%,transparent_70%)]" />
                  
                  <motion.img
                    src={current.image}
                    alt={current.title}
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl mb-10"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                  />

                  <span className="text-7xl mb-6">{current.emoji}</span>
                  <h2 className="font-display text-5xl md:text-6xl text-center tracking-tight text-amber-300 leading-none">
                    {current.title}
                  </h2>
                </div>

                {/* Right Side - Menu Items */}
                <div className="w-7/12 p-8 md:p-12 bg-zinc-950 flex flex-col">
                  <div className="flex-1 space-y-8 pt-4">
                    {current.items.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex justify-between items-start border-b border-white/10 pb-7 last:border-none group"
                      >
                        <div className="pr-8">
                          <h3 className="text-xl font-medium group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                        <span className="font-mono text-amber-400 text-2xl font-medium whitespace-nowrap pt-1">
                          {item.price}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtle Page Curl */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-8 mt-12">
          <button
            onClick={prevPage}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-amber-400/30 hover:border-amber-400 hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={22} /> Previous
          </button>

          <div className="flex gap-3">
            {menuSections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  idx === currentPage 
                    ? "bg-amber-400 scale-125 shadow-[0_0_12px] shadow-amber-400/60" 
                    : "bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-amber-400/30 hover:border-amber-400 hover:bg-white/5 transition-all"
          >
            Next <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Drag left or right to flip pages • All prices in ZAR
      </p>
    </div>
  );
}