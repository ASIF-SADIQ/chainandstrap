"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const handleId = product.Handle || product.handle || product._id;
  const isHearted = isInWishlist(handleId);

  // MongoDB fields - images is now an array from aggregation grouping
  const images = (product.images || []).filter(Boolean);
  let mainImage = images[0] || product["Image Src"] || "/placeholder.png";
  let hoverImage = images[1] || mainImage;
  
  // Convert standard DO Spaces link to the ultra-fast CDN link on the fly
  if (mainImage.includes("digitaloceanspaces.com") && !mainImage.includes(".cdn.")) {
      mainImage = mainImage.replace("sfo3.digitaloceanspaces.com", "sfo3.cdn.digitaloceanspaces.com");
  }
  if (hoverImage.includes("digitaloceanspaces.com") && !hoverImage.includes(".cdn.")) {
      hoverImage = hoverImage.replace("sfo3.digitaloceanspaces.com", "sfo3.cdn.digitaloceanspaces.com");
  }
  
  // ULTRA FAST IMAGE OPTIMIZATION: Wrap DO Spaces URLs with Cloudflare-backed proxy to resize 5MB images to ~30KB WebP
  if (mainImage.includes("digitaloceanspaces.com")) {
      mainImage = `https://wsrv.nl/?url=${encodeURIComponent(mainImage)}&w=500&output=webp&q=80`;
  }
  if (hoverImage.includes("digitaloceanspaces.com")) {
      hoverImage = `https://wsrv.nl/?url=${encodeURIComponent(hoverImage)}&w=500&output=webp&q=80`;
  }
  
  // Fix Google Drive links so they display inline
  const getGoogleDriveThumbnail = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (!trimmedUrl.includes('drive.google.com')) return trimmedUrl;
    
    let fileId = '';
    const fileDMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      fileId = fileDMatch[1];
    } else {
      const idMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }
    
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
    }
    return trimmedUrl;
  };

  mainImage = getGoogleDriveThumbnail(mainImage);
  hoverImage = getGoogleDriveThumbnail(hoverImage);
  const title = product.Title || "Untitled";
  const vendor = product.vendor || product.Vendor || "";
  const price = product["Variant Price"] || product.price || 0;
  const handle = product.Handle || product.handle || product._id;

  const formattedPrice = price
    ? `$${Number(price).toFixed(2)}`
    : "Price on Request";

  return (
    <Link href={`/product/${handle}`} className="group block relative">
      <div
        className="relative aspect-[4/5] overflow-hidden bg-bg-secondary mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 transition-opacity duration-500 z-10 opacity-100 group-hover:opacity-0">
          <img
            src={mainImage}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Hover image (second image if available) */}
        <div className={`absolute inset-0 transition-opacity duration-500 z-0 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <img
            src={hoverImage}
            alt={`${title} alternate`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 z-30 p-2 bg-bg-primary/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-bg-primary"
        >
          <motion.div
            whileTap={{ scale: 0.8 }}
            animate={isHearted ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              size={18} 
              className={isHearted ? "fill-gold text-gold" : "text-text-primary"} 
            />
          </motion.div>
        </button>

        {/* Quick Add Button overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
          <button
            className="bg-gold text-bg-primary px-6 py-3 text-xs tracking-widest uppercase font-bold hover:bg-[#e8c98a] transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic here
            }}
          >
            Quick Add
          </button>
        </div>

        {/* Border overlay */}
        <div className="absolute inset-0 border border-transparent group-hover:border-gold/50 transition-colors duration-300 z-30 pointer-events-none" />
      </div>

      <div className="text-center px-2">
        <p className="text-gold text-[10px] tracking-widest uppercase mb-2">{vendor}</p>
        <h3 className="text-white text-[0.95rem] font-light mb-2 line-clamp-1">{title}</h3>
        <p className="text-text-secondary text-sm">{formattedPrice}</p>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="block w-full">
      <div className="aspect-[4/5] bg-bg-secondary overflow-hidden relative mb-4">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />
      </div>
      <div className="px-2">
        <div className="h-2 w-1/3 bg-bg-secondary mb-3 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />
        </div>
        <div className="h-4 w-3/4 bg-bg-secondary mb-3 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />
        </div>
        <div className="h-3 w-1/2 bg-bg-secondary rounded-full overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />
        </div>
      </div>
    </div>
  );
}
