"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ images, title }) {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // ULTRA FAST IMAGE OPTIMIZATION: Shrink huge images to max 800px width via global proxy
  const validImages = (images || []).filter(Boolean).map(img => {
    let url = img;
    if (url.includes("digitaloceanspaces.com") && !url.includes(".cdn.")) {
        url = url.replace("sfo3.digitaloceanspaces.com", "sfo3.cdn.digitaloceanspaces.com");
    }
    if (url.includes("digitaloceanspaces.com") || url.includes("amazonaws.com")) {
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=webp&q=80`;
    }
    return url;
  });

  const total = validImages.length;

  const prev = () => setMainImageIndex((i) => (i - 1 + total) % total);
  const next = () => setMainImageIndex((i) => (i + 1) % total);

  if (total === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-bg-secondary flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/placeholder.png" alt="Placeholder" className="w-full h-full object-cover opacity-50" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto lg:sticky lg:top-32 flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full bg-[#f8f8f8] dark:bg-bg-secondary overflow-hidden group aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[mainImageIndex]}
          alt={title}
          className="w-full h-full object-cover object-center transition-opacity duration-500"
        />

        {/* Counter badge */}
        <div className="absolute bottom-4 right-4 bg-black/80 px-4 py-2 text-xs font-bold text-white tracking-[0.2em] uppercase backdrop-blur-md">
          {mainImageIndex + 1} / {total}
        </div>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-black text-black hover:text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-black text-black hover:text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {total > 1 && (
        <div 
          className="flex gap-3 overflow-x-auto pb-2 w-full snap-x snap-mandatory" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImageIndex(i)}
              className={`relative w-20 lg:w-24 aspect-square flex-shrink-0 snap-start overflow-hidden transition-all duration-300 ${
                i === mainImageIndex
                  ? "ring-1 ring-black dark:ring-[#d4af37] opacity-100 shadow-md"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
