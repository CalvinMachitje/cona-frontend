// frontend/src/pages/home.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import heroImg from "@/assets/hero-club.jpg";
import logo from "@/assets/Cona images/logo.webp";
import NeonBackground from "@/components/NeonBackground";

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
                document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" })
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

      {/* Mobile Menu */}
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
                  document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
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

export default function Home() {
  return (
    <>
      <MobileNav />
      
      {/* 3D Neon Background */}
      <NeonBackground primaryColor="#22d3ee" />

      <div className="relative overflow-hidden pt-20">
        {/* ================= HERO ================= */}
        <section id="home" className="relative min-h-screen flex items-center justify-center text-center px-5 sm:px-6">
          {/* Background Image */}
          <img
            src={heroImg}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Cona Lounge"
            loading="eager"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/65" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 flex flex-col items-center max-w-4xl mx-auto"
          >
            <p className="text-primary text-xs tracking-[0.5em] uppercase mb-4">
              PREMIUM LOUNGE EXPERIENCE
            </p>

            {/* Logo */}
            <img
              src={logo}
              alt="Cona Logo"
              className="w-28 h-28 md:w-32 md:h-32 object-contain mb-6 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]"
            />

            {/* Brand Name */}
            <h1 className="font-display text-[5.2rem] sm:text-[6.5rem] md:text-[9rem] lg:text-[11rem] leading-none text-white drop-shadow-[0_0_40px_rgba(99,102,241,0.6)]">
              CO<span className="text-primary">NA</span>
            </h1>

            <p className="max-w-xl mt-6 text-base sm:text-lg text-zinc-300 px-4">
              Where the night comes alive.
              <br />
              Experience luxury, music, and unforgettable moments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-xs sm:max-w-none justify-center">
              <Link
                to="/booking"
                className="bg-primary hover:bg-primary/90 px-10 py-4 rounded-xl font-medium transition text-center shadow-lg shadow-primary/30"
              >
                BOOK NOW
              </Link>

              <Link
                to="/menu"
                className="border border-white/40 hover:bg-white/10 px-10 py-4 rounded-xl transition text-center"
              >
                VIEW MENU
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ================= EXPERIENCE ================= */}
        <section className="relative py-20 md:py-24 px-5 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Signature Cocktails",
                desc: "Crafted by expert mixologists with premium spirits.",
              },
              {
                title: "Live DJs",
                desc: "Curated music that sets the perfect atmosphere.",
              },
              {
                title: "VIP Experience",
                desc: "Exclusive tables, bottle service & premium treatment.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-3xl border border-zinc-700/50 hover:border-primary/30 transition-all"
              >
                <h3 className="text-2xl font-medium mb-4 text-white">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-20 md:py-24 px-5 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto glass p-10 md:p-14 rounded-3xl border border-zinc-700/50">
            <h2 className="text-4xl md:text-5xl font-display mb-6 text-white">
              Reserve Your Night
            </h2>

            <p className="text-zinc-400 mb-8 text-lg">
              Secure your table and experience the ultimate nightlife destination in Coligny.
            </p>

            <Link
              to="/booking"
              className="inline-block bg-primary hover:bg-primary/90 px-12 py-4 rounded-xl text-lg font-medium transition shadow-lg shadow-primary/30"
            >
              BOOK YOUR TABLE
            </Link>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="py-12 text-center border-t border-zinc-800 text-sm text-zinc-500">
          © {new Date().getFullYear()} CONA Lounge • Coligny, North West
        </footer>
      </div>
    </>
  );
}