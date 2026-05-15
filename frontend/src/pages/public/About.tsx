// frontend/src/pages/about.tsx
import { motion } from "framer-motion";

import venue1 from "@/assets/Cona images/inside_view.webp";
import venue2 from "@/assets/Cona images/inside_view2.webp";
import venue3 from "@/assets/Cona images/inside_view3.webp";
import venue4 from "@/assets/Cona images/inside_view4.webp";

const stats = [
  { value: "7 Days", label: "Open Weekly" },
  { value: "10AM – 2AM", label: "Operating Hours" },
  { value: "100+", label: "Guests Hosted Weekly" },
  { value: "Coligny", label: "Proudly Local" },
];

const venueImages = [
  venue1,
  venue2,
  venue3,
  venue4,
];

export default function About() {
  return (
    <div className="bg-zinc-950 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-xs uppercase tracking-[0.5em] text-primary mb-4">
            About CONA
          </p>

          <h1 className="font-display text-6xl md:text-8xl mb-8">
            Welcome to <span className="text-primary">CONA Lounge</span>
          </h1>

          <p className="text-zinc-400 text-lg leading-8">
            Welcome to CONA Lounge, Coligny’s go-to destination for great food,
            refreshing drinks, and an unforgettable atmosphere. As a vibrant pub
            and grill, we bring together the perfect mix of delicious meals,
            expertly prepared grilled favorites, and a wide selection of
            beverages to suit every taste.
            <br />
            <br />
            Whether you’re stopping by for a relaxed lunch, after-work drinks,
            or a lively night out with friends, CONA Lounge offers a warm,
            welcoming environment where good times come naturally.
            <br />
            <br />
            Our menu is crafted to satisfy — from juicy grills to classic
            comfort dishes, perfectly paired with chilled drinks and friendly
            service. Join us for great vibes, great company, and great memories
            in the heart of Coligny.
          </p>
        </motion.div>
      </section>

      {/* Venue Images */}
      <section className="container mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-4">
            Our Venue
          </p>
          <h2 className="font-display text-5xl">Inside CONA</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {venueImages.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="overflow-hidden rounded-3xl border border-zinc-800"
            >
              <img
                src={img}
                alt={`CONA Venue ${index + 1}`}
                className="w-full h-[320px] object-cover hover:scale-105 transition duration-700"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-zinc-800 py-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-4xl md:text-5xl text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="container mx-auto px-6 pb-24 text-center max-w-3xl">
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-3xl md:text-4xl leading-relaxed"
        >
          "Great food, chilled drinks, and unforgettable moments at{" "}
          <span className="text-primary">CONA Lounge</span>."
        </motion.blockquote>
      </section>
    </div>
  );
}