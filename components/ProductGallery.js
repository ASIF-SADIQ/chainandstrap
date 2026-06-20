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
    if (url.includes("digitaloceanspaces.com")) {
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=webp&q=80`;
    }
    return url;
  });

  const total = validImages.length;

  const prev = () => setMainImageIndex((i) => (i - 1 + total) % total);
  const next = () => setMainImageIndex((i) => (i + 1) % total);

  return (
    <div className="lg:sticky lg:top-32">
      {/* Main Image — constrained size */}
      <div className="relative w-full max-w-sm mx-auto bg-bg-secondary overflow-hidden group aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[mainImageIndex] || "/placeholder.png"}
          alt={title}
          className="w-full h-full object-cover transition-all duration-500"
        />

        {/* Counter badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 px-3 py-1 text-xs text-gold tracking-widest">
          {mainImageIndex + 1} / {Math.max(1, total)}
        </div>

        {/* Prev / Next arrows — show only if multiple images */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-gold text-white hover:text-black p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-gold text-white hover:text-black p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {total > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-3 mt-4 max-w-sm mx-auto custom-scrollbar">
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImageIndex(i)}
              className={`w-16 h-20 flex-shrink-0 border-2 transition-all duration-200 overflow-hidden ${
                i === mainImageIndex
                  ? "border-gold scale-105"
                  : "border-transparent hover:border-border-color"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
