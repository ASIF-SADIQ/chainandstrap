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
      className="relative z-10 text-center px-4 flex flex-col items-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p
        variants={itemVariants}
        className="text-gold text-sm tracking-widest uppercase mb-6"
      >
        CHAIN & STRAPS
      </motion.p>
      
      <motion.h1
        variants={itemVariants}
        className="font-serif text-white text-5xl md:text-7xl lg:text-[8rem] font-extralight leading-none mb-12"
      >
        LUXURY<br />REDEFINED
      </motion.h1>
      
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center justify-center gap-6"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/all"
            className="bg-gold text-black px-10 py-4 text-sm font-bold tracking-widest w-full sm:w-auto text-center inline-block transition-colors hover:bg-[#e8c98a]"
          >
            EXPLORE ATELIER
          </Link>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/all#brands"
            className="bg-transparent border border-gold text-gold px-10 py-4 text-sm font-bold tracking-widest w-full sm:w-auto text-center inline-block transition-colors hover:bg-gold/10"
          >
            DISCOVER BRANDS
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
