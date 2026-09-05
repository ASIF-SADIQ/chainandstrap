"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroContent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="relative z-10 text-center px-4 flex flex-col items-center max-w-4xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
        <p className="text-white/80 text-xs tracking-[0.3em] uppercase font-semibold">
          ✨ CHAIN & STRAPS
        </p>
      </motion.div>
      
      <motion.h1
        variants={itemVariants}
        className="font-serif text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-white to-gold text-5xl md:text-7xl lg:text-[8rem] font-medium leading-[1.1] mb-8"
      >
        ELEGANCE<br />REDEFINED
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-text-secondary text-sm md:text-base tracking-wide max-w-xl mx-auto mb-12 leading-relaxed"
      >
        Discover our curated collection of premium local bags, engineered for the modern aesthetic with an uncompromising attention to detail.
      </motion.p>
      
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-gold to-accent-orange opacity-40 blur transition duration-500 group-hover:opacity-70 rounded-md"></div>
          <Link
            href="/all"
            className="relative bg-white text-black px-10 py-4 text-sm font-bold tracking-widest w-full sm:w-auto text-center inline-block rounded-sm transition-all duration-300"
          >
            EXPLORE COLLECTION
          </Link>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
          <Link
            href="/all"
            className="bg-black/30 backdrop-blur-lg border border-white/20 text-white hover:border-gold hover:text-gold px-10 py-4 text-sm font-bold tracking-widest w-full sm:w-auto text-center inline-block rounded-sm transition-all duration-300"
          >
            DISCOVER STYLE
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
