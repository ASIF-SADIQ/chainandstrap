"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroBackground() {
  const videos = ["/videos/hero-bg.mp4", "/videos/hero-bg-2.mp4"];
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <>
      <div className="absolute inset-0 w-full h-full z-0 bg-black">
        <AnimatePresence initial={false}>
          <motion.video
            key={currentIndex}
            src={videos[currentIndex]}
            autoPlay
            muted
            playsInline
            onEnded={() => setCurrentIndex((prev) => (prev + 1) % videos.length)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
      
      {/* Background gradient & particles (Overlays on top of video) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-bg-primary/50 via-bg-primary/80 to-bg-primary z-0 pointer-events-none" />
    </>
  );
}
