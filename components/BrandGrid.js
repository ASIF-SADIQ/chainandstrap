"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/config";

export default function BrandGrid() {
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/featured`);
        const result = await res.json();
        
        if (result.success && result.thumbnails) {
          const map = {};
          result.thumbnails.forEach(product => {
            if (product.brandThumbnailName && product.images && product.images.length > 0) {
              const image = product.images[0].split(',')[0].trim();
              if (image) {
                // Ensure image URL routes through our proxy if it's from Drive
                if (image.includes("drive.google.com")) {
                  const fileIdMatch = image.match(/id=([^&]+)/);
                  if (fileIdMatch && fileIdMatch[1]) {
                    map[product.brandThumbnailName] = `/api/image-proxy?id=${fileIdMatch[1]}`;
                  }
                } else if (image.includes("amazonaws.com") || image.includes("digitaloceanspaces.com")) {
                  // Proxy S3 / Spaces images via wsrv.nl for instant loading and resizing
                  map[product.brandThumbnailName] = `https://wsrv.nl/?url=${encodeURIComponent(image)}&w=600&output=webp&q=80`;
                } else {
                  map[product.brandThumbnailName] = image;
                }
              }
            }
          });
          setThumbnails(map);
        }
      } catch (error) {
        console.error("Error fetching brand thumbnails:", error);
      }
    };

    fetchThumbnails();
  }, []);

  const getBrandImage = (brandName, defaultImg) => {
    return thumbnails[brandName] || defaultImg;
  };

  const brands = [
    { name: "Louis Vuitton", slug: "lv", image: "/images/brands/lv_bg_1788622877325.png" },
    { name: "Chanel", slug: "chanel", image: "/images/brands/chanel_bg_1788622889933.png" },
    { name: "Gucci", slug: "gucci", image: "/images/brands/gucci_bg_1788622902195.png" },
    { name: "Dior", slug: "dior", image: "/images/brands/dior_bg_1788622915630.png" },
    { name: "Prada", slug: "prada", image: "/images/brands/prada_bg_1788622928775.png" },
    { name: "YSL", slug: "ysl", image: "/images/brands/ysl_bg_1788622940845.png" },
    { name: "Fendi", slug: "fendi", image: "/images/brands/fendi_bg_1788622954000.png" },
    { name: "Valentino", slug: "valentino", image: "/images/brands/valentino_bg_1788622968290.png" },
    { name: "Versace", slug: "versace", image: "/images/brands/versace_bg_1788622981147.png" },
    { name: "Dolce & Gabbana", slug: "dolce", image: "/images/brands/dolce_bg_1788622994002.png" }
  ];

  return (
    <section className="py-16 bg-bg-primary relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 tracking-wide">
            EXPLORE BRANDS
          </h2>
          <div className="w-16 h-[1px] bg-gold mx-auto opacity-50"></div>
        </div>

        {/* 5 columns on desktop, 2-3 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {brands.map((brand, i) => (
            <Link 
              href={`/all?brand=${brand.slug}`} 
              key={brand.name}
              className="group relative h-32 md:h-48 flex items-center justify-center overflow-hidden border border-white/10 bg-black transition-all duration-500 hover:border-gold/40 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)]"
            >
              {/* Background Image with Zoom on Hover */}
              <img 
                src={getBrandImage(brand.name, brand.image)} 
                alt={`${brand.name} collection`} 
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700 ease-in-out"
              />

              {/* Gradient Overlays for Readability & Mood */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />
              
              {/* Subtle gold gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/20 group-hover:border-gold/80 transition-colors duration-500 m-3 z-10 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/20 group-hover:border-gold/80 transition-colors duration-500 m-3 z-10 pointer-events-none" />

              <span className="font-serif text-sm md:text-lg font-semibold text-white group-hover:text-gold tracking-[0.25em] uppercase transition-colors duration-300 text-center px-4 relative z-20 drop-shadow-xl">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
