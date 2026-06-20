"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, X, Share2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [filter, setFilter] = useState("all");

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  // Very basic client-side category filtering
  const filteredItems = wishlistItems.filter((item) => {
    if (filter === "all") return true;
    const type = (item.type || item["Product Type"] || "").toLowerCase();
    if (filter === "bags") return type.includes("bag");
    if (filter === "watches") return type.includes("watch");
    if (filter === "shoes") return type.includes("shoe");
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#222] pb-6">
          <div>
            <h1 className="font-serif text-4xl text-white mb-2 tracking-wide">Your Wishlist</h1>
            <p className="text-[#888] text-sm tracking-widest uppercase">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="mt-6 md:mt-0 flex items-center gap-4">
              <button 
                onClick={() => alert("Link copied to clipboard!")}
                className="flex items-center space-x-2 text-xs text-[#888] hover:text-gold tracking-widest uppercase transition-colors"
              >
                <Share2 size={14} />
                <span>Share List</span>
              </button>
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          // Empty State
          <div className="py-20 text-center border border-[#222] bg-[#111]">
            <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-gold opacity-50" size={40} />
            </div>
            <h2 className="font-serif text-3xl text-white mb-4">Nothing Saved Yet</h2>
            <p className="text-[#888] max-w-md mx-auto mb-10">
              Your wishlist is empty. Browse our collections and click the heart icon to save items you love for later.
            </p>
            <Link 
              href="/all" 
              className="inline-block bg-gold text-black px-10 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <>
            {/* Filtering */}
            <div className="flex overflow-x-auto space-x-6 mb-10 no-scrollbar pb-2">
              {["all", "bags", "watches", "shoes"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`text-xs tracking-widest uppercase whitespace-nowrap transition-colors pb-1 border-b-2 ${
                    filter === cat 
                      ? "text-gold border-gold" 
                      : "text-[#666] border-transparent hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence>
                {filteredItems.map((item) => {
                  const images = (item.images || []).filter(Boolean);
                  const mainImage = images[0] || item["Image Src"] || "/placeholder.png";
                  const title = item.title || item.Title || "Untitled";
                  const price = item.price || item["Variant Price"] || 0;
                  const handleId = item.handle || item.Handle || item._id;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      key={handleId}
                      className="group relative"
                    >
                      <div className="aspect-[4/5] bg-[#111] overflow-hidden relative border border-[#222]">
                        {/* Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={mainImage} 
                          alt={title} 
                          className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart({
                                id: handleId,
                                title: title,
                                price: Number(price),
                                image: mainImage,
                                handle: handleId
                              });
                            }}
                            className="bg-gold text-black px-6 py-3 flex items-center space-x-2 text-xs font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                          >
                            <ShoppingBag size={14} />
                            <span>Move to Cart</span>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(item);
                          }}
                          className="absolute top-4 right-4 z-30 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-500 hover:text-white"
                          title="Remove from Wishlist"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="mt-4">
                        <Link href={`/product/${handleId}`} className="block">
                          <h3 className="text-white text-sm font-light line-clamp-1 mb-1 group-hover:text-gold transition-colors">
                            {title}
                          </h3>
                        </Link>
                        <div className="flex justify-between items-center">
                          <p className="text-[#888] text-sm">${Number(price).toFixed(2)}</p>
                          {/* Price drop mock indicator */}
                          {Math.random() > 0.7 && (
                            <span className="flex items-center text-[10px] text-green-400 tracking-widest uppercase">
                              <Info size={12} className="mr-1" />
                              Price Drop
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {filteredItems.length === 0 && filter !== "all" && (
              <div className="text-center py-10 text-[#666] tracking-widest uppercase text-xs">
                No items found in this category.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
