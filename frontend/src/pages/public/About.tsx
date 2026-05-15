// frontend/src/pages/about.tsx
import { motion } from "framer-motion";
import { useState } from "react";

// Assets
import venue1 from "@/assets/Cona images/inside_view.webp";
import venue2 from "@/assets/Cona images/inside_view2.webp";
import venue3 from "@/assets/Cona images/inside_view3.webp";
import venue4 from "@/assets/Cona images/inside_view4.webp";

// Mobile Navigation
const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Menu", href: "#menu" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
      <div className="container mx-auto px-5 py-4 flex items-center justify-between">
        <div className="font-display text-3xl tracking-tight text-primary">CONA</div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-primary transition-colors duration-200"
              onClick={() =>
                document.querySelector(link.href)?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center focus:outline-none"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-zinc-950 z-40 pt-20">
          <div className="flex flex-col items-center gap-10 text-2xl py-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-primary transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  document.querySelector(link.href)?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const stats = [
  { value: "7 Days", label: "Open Weekly" },
  { value: "10AM – 2AM", label: "Operating Hours" },
  { value: "100+", label: "Guests Hosted Weekly" },
  { value: "Coligny", label: "Proudly Local" },
];

const venueImages = [venue1, venue2, venue3, venue4];

export default function About() {
  return (
    <>
      <MobileNav />

      <div className="bg-zinc-950 text-white pt-20">
        {/* Hero Section */}
        <section id="about" className="container mx-auto px-5 sm:px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-xs uppercase tracking-[0.5em] text-primary mb-4">
              About CONA
            </p>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 leading-tight">
              Welcome to <span className="text-primary">CONA Lounge</span>
            </h1>

            <div className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              Welcome to CONA Lounge, Coligny’s go-to destination for great food,
              refreshing drinks, and an unforgettable atmosphere. As a vibrant pub
              and grill, we bring together the perfect mix of delicious meals,
              expertly prepared grilled favorites, and a wide selection of
              beverages to suit every taste.
              <br className="hidden sm:block" />
              <br className="hidden sm:block" />
              Whether you’re stopping by for a relaxed lunch, after-work drinks,
              or a lively night out with friends, CONA Lounge offers a warm,
              welcoming environment where good times come naturally.
              <br className="hidden sm:block" />
              <br className="hidden sm:block" />
              Our menu is crafted to satisfy — from juicy grills to classic
              comfort dishes, perfectly paired with chilled drinks and friendly
              service. Join us for great vibes, great company, and great memories
              in the heart of Coligny.
            </div>
          </motion.div>
        </section>

        {/* Venue Images */}
        <section className="container mx-auto px-5 sm:px-6 pb-20 md:pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 md:mb-12 text-center"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-primary mb-3">
              Our Venue
            </p>
            <h2 className="font-display text-4xl sm:text-5xl">Inside CONA</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {venueImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="overflow-hidden rounded-3xl border border-zinc-800 group"
              >
                <img
                  src={img}
                  alt={`CONA Venue ${index + 1}`}
                  loading="lazy"
                  className="w-full h-auto aspect-[16/10] sm:aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-5 sm:px-6 pb-20 md:pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 border-y border-zinc-800 py-12 md:py-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-4xl sm:text-5xl text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quote */}
        <section className="container mx-auto px-5 sm:px-6 pb-24 text-center">
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-2xl sm:text-3xl md:text-4xl leading-tight md:leading-relaxed max-w-3xl mx-auto"
          >
            "Great food, chilled drinks, and unforgettable moments at
            <span className="text-primary">CONA Lounge</span>."
          </motion.blockquote>
        </section>
      </div>
    </>
  );
}