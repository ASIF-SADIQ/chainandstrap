"use client";

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  return (
    <button 
      className="bg-gold text-bg-primary w-full py-5 text-sm font-bold mb-4 tracking-widest uppercase hover:bg-[#e8c98a] transition-colors"
      onClick={() => addToCart(product)}
    >
      ADD TO CART
    </button>
  );
}
