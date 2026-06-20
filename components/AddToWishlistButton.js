"use client";

import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";

export default function AddToWishlistButton({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isHearted = isInWishlist(product.id || product.Handle);

  return (
    <button 
      onClick={() => toggleWishlist(product)}
      className={`w-full py-5 text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-2 border ${
        isHearted 
          ? "bg-gold text-black border-gold hover:bg-[#e8c98a]" 
          : "bg-transparent text-gold border-gold hover:bg-gold/10"
      }`}
    >
      <Heart size={18} className={isHearted ? "fill-black" : ""} />
      <span>{isHearted ? "SAVED IN WISHLIST" : "WISHLIST"}</span>
    </button>
  );
}
