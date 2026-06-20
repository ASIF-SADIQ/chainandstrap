"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-bg-primary text-text-primary min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Section 1: Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="h-[70vh] flex flex-col items-center justify-center text-center px-4 relative"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-bg-primary z-10" />
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 grayscale"
          >
            <source src="https://cdn.pixabay.com/video/2019/11/05/28734-370597380_large.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gold tracking-[0.4em] uppercase text-xs md:text-sm mb-6"
          >
            Timeless Elegance, Redefined
          </motion.h2>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 text-white tracking-wide"
          >
            Chain & Straps
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="max-w-2xl mx-auto text-text-muted leading-relaxed italic text-lg md:text-xl px-4"
          >
            "At Chain & Straps, we don’t just sell accessories; we curate legacies. Crafting a world where every piece tells a story of ambition and grace."
          </motion.p>
        </div>
      </motion.section>

      {/* Section 2: Story */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center border border-[#222]">
          <div className="h-[500px] lg:h-[700px] bg-bg-secondary overflow-hidden relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1915&auto=format&fit=crop"
              alt="Craftsmanship"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-1000 transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000" />
          </div>
          <div className="p-12 md:p-20 lg:p-24 space-y-8 bg-[#0a0a0a]">
            <h3 className="text-3xl md:text-4xl font-serif italic text-gold">Our Heritage</h3>
            <div className="space-y-6 text-text-secondary leading-relaxed font-light">
              <p>
                Started in the heart of New York, Chain & Straps was born from a simple obsession: why should true luxury be out of reach for those who appreciate genuine craftsmanship?
              </p>
              <p>
                We believe that luxury is a language. From the meticulous selection of premium leathers to the precision of our horological collections, we bridge the gap between global sophistication and local accessibility.
              </p>
            </div>
            <div className="pt-8 border-t border-[#222]">
              <p className="text-xs text-text-muted uppercase tracking-[0.3em]">New York • California • London</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The 3 Pillars */}
      <section className="py-24 bg-[#0a0a0a] border-y border-[#222] my-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif text-white mb-4">Our Core Values</h3>
            <div className="w-12 h-[1px] bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Excellence", desc: "Every stitch and every link is inspected for perfection. We settle for nothing less than extraordinary." },
              { title: "Authenticity", desc: "100% genuine luxury selection. We stand behind the provenance and quality of every single item we curate." },
              { title: "Community", desc: "An exclusive experience designed specifically for our VIBs (Very Important Buyers). You are our legacy." }
            ].map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="text-center p-8 border border-transparent hover:border-[#222] transition-colors duration-500"
              >
                <div className="w-16 h-16 bg-gold/5 border border-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="font-serif text-gold text-2xl italic">{i + 1}</span>
                </div>
                <h4 className="text-xl font-serif text-white mb-4 tracking-wide">{pillar.title}</h4>
                <p className="text-text-muted text-sm leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Numbers/Stats */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { num: "160K+", label: "Curated Items" },
              { num: "50K+", label: "Global Community" },
              { num: "100%", label: "Authenticity" },
              { num: "24/7", label: "VIB Support" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <h4 className="text-4xl md:text-5xl font-serif text-gold mb-3">{stat.num}</h4>
                <p className="text-[10px] md:text-xs uppercase text-text-muted tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature & Closing */}
      <section className="py-32 text-center px-4 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <p className="text-text-secondary text-lg md:text-xl font-light italic mb-12">
            "We invite you to explore our collection and find the piece that speaks to your unique ambition."
          </p>
          <div className="inline-block">
            <h3 className="font-serif text-3xl md:text-4xl text-white mb-2">The Founders</h3>
            <p className="text-gold text-sm tracking-[0.3em] uppercase">Chain & Straps</p>
          </div>

          <div className="mt-16">
            <Link href="/all" className="inline-block border border-gold text-gold px-12 py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-black transition-all duration-500">
              Explore The Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
