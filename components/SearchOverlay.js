"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, parseImages } from "@/lib/helpers";
import { API_BASE as API, API_BASE } from "@/lib/config";

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim() || query.length < 1) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setResults(data.data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-bg-primary/95 backdrop-blur-md flex flex-col"
        >
          <div className="container mx-auto px-4 md:px-8 py-8 relative flex-1 flex flex-col">
            <button 
              onClick={onClose}
              className="absolute top-8 right-4 md:right-8 text-text-secondary hover:text-white transition-colors"
            >
              <X size={32} />
            </button>

            <div className="max-w-4xl mx-auto w-full mt-12 md:mt-24">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) {
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    onClose();
                  }
                }}
                className="relative border-b border-gold pb-4 mb-12"
              >
                <button type="submit" className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gold focus:outline-none">
                  <Search size={32} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="SEARCH FOR DESIGNERS, BAGS, SHOES..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-white text-2xl md:text-4xl lg:text-5xl font-light placeholder-text-muted focus:outline-none pl-14 tracking-widest uppercase"
                />
              </form>

              {loading && query.length >= 1 && (
                <div className="text-center text-gold tracking-widest uppercase animate-pulse">
                  Searching...
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="animate-fade-up">
                  <h3 className="text-gold text-xs tracking-widest uppercase mb-6">Suggestions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {results.map((product) => {
                      const images = Array.isArray(product.images) ? product.images : parseImages(product.images);
                      const mainImage = images.length > 0 ? images[0] : (product["Image Src"] || "/placeholder.png");
                      const title = product.Title || product.title || "Untitled";
                      const vendor = product.vendor || product.Vendor || "";
                      const price = product["Variant Price"] || product.price || 0;
                      const handle = product.Handle || product.handle || product._id;

                      return (
                        <Link 
                          key={product._id} 
                          href={`/product/${handle}`}
                          onClick={onClose}
                          className="group flex space-x-4 items-center bg-bg-secondary p-4 hover:bg-bg-tertiary transition-colors border border-transparent hover:border-border-color"
                        >
                          <div className="w-16 h-20 bg-black flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={mainImage} alt={title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-gold text-[10px] tracking-widest uppercase mb-1">{vendor}</p>
                            <h4 className="text-white text-sm font-light line-clamp-1 group-hover:text-gold transition-colors">{title}</h4>
                            <p className="text-text-muted text-xs mt-1">{formatPrice(price)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-12 text-center">
                    <Link 
                      href={`/search?q=${encodeURIComponent(query)}`} 
                      onClick={onClose}
                      className="text-white border-b border-gold pb-1 text-xs tracking-widest uppercase hover:text-gold transition-colors"
                    >
                      View All Results for "{query}"
                    </Link>
                  </div>
                </div>
              )}

              {!loading && query.length >= 1 && results.length === 0 && (
                <div className="text-center text-text-muted text-sm tracking-widest uppercase">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
