// frontend/src/pages/home.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-club.jpg";
import logo from "@/assets/Cona images/logo.webp";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6">
        {/* Background Image */}
        <img
          src={heroImg}
          className="absolute inset-0 w-full h-full object-cover scale-110"
          alt="Cona Lounge"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Glow Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-150 h-150 bg-primary/30 blur-[120px] rounded-full -top-25 -left-25" />
          <div className="absolute w-125 h-125 bg-primary/20 blur-[120px] rounded-full -bottom-25 -right-25" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center"
        >
          <p className="text-primary text-xs tracking-[0.5em] uppercase mb-4">
            PREMIUM LOUNGE EXPERIENCE
          </p>

          {/* Logo */}
          <img
            src={logo}
            alt="Cona Logo"
            className="w-24 h-24 md:w-32 md:h-32 object-contain mb-4 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]"
          />

          {/* Brand Name */}
          <h1 className="font-display text-[7rem] md:text-[11rem] leading-none text-white drop-shadow-[0_0_40px_rgba(99,102,241,0.6)]">
            CO<span className="text-primary">NA</span>
          </h1>

          <p className="max-w-xl mt-6 text-lg text-muted-foreground mx-auto">
            Where the night comes alive.
            <br />
            Experience luxury, music, unforgettable moments.
          </p>

          <div className="flex gap-4 mt-10 justify-center flex-wrap">
            <Link
              to="/booking"
              className="bg-gradient-primary px-8 py-4 rounded-lg shadow-glow hover:shadow-glow-lg transition"
            >
              BOOK NOW
            </Link>

            <Link
              to="/menu"
              className="glass border border-border px-8 py-4 rounded-lg hover:bg-white/10 transition"
            >
              VIEW MENU
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ================= EXPERIENCE ================= */}
      <section className="relative py-24 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute w-100 h-100 bg-primary/20 blur-[120px] rounded-full left-1/2 -translate-x-1/2 top-0" />
        </div>

        {[
          {
            title: "Signature Cocktails",
            desc: "Crafted by expert mixologists.",
          },
          {
            title: "Live DJs",
            desc: "Music that elevates every night.",
          },
          {
            title: "VIP Experience",
            desc: "Exclusive tables & premium service.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="glass p-8 rounded-2xl border border-border shadow-glow hover:shadow-glow-lg transition"
          >
            <h3 className="text-xl mb-3 text-white">{item.title}</h3>
            <p className="text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 text-center px-6">
        <div className="max-w-3xl mx-auto glass p-12 rounded-2xl border border-border shadow-glow">
          <h2 className="text-4xl font-display text-gradient mb-6">
            Reserve Your Night
          </h2>

          <p className="text-muted-foreground mb-8">
            Secure your table and experience the ultimate nightlife destination.
          </p>

          <Link
            to="/booking"
            className="bg-gradient-primary px-10 py-4 rounded-lg shadow-glow hover:shadow-glow-lg transition"
          >
            BOOK NOW
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-10 text-center border-t border-border text-sm text-muted-foreground">
        © {new Date().getFullYear()} CONA Lounge
      </footer>
    </div>
  );
}