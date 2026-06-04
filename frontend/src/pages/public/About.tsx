// frontend/src/pages/public/About.tsx
import { motion } from "framer-motion";
import NeonBackground from "@/components/NeonBackground";

const stats = [
  { value: "7 Days", label: "Open Weekly" },
  { value: "10AM – 2AM", label: "Operating Hours" },
  { value: "100+", label: "Guests Hosted Weekly" },
  { value: "Coligny", label: "Proudly Local" },
];

export default function About() {
  return (
    <>
      {/* 3D Neon Background - Consistent with Home */}
      <NeonBackground primaryColor="#22d3ee" />

      <div className="bg-zinc-950 text-white pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-5 sm:px-6 py-16 md:py-24">
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
            "Great food, chilled drinks, and unforgettable moments at{" "}
            <span className="text-primary">CONA Lounge</span>."
          </motion.blockquote>
        </section>
      </div>
    </>
  );
}