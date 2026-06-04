// frontend/src/pages/public/Home.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "@/assets/pictures/reception.jpg";
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