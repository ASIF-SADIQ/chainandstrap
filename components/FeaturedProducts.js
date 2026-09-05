"use client";

import { useState, useEffect } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { API_BASE } from "@/lib/config";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products/featured`);
        const result = await res.json();
        
        if (result.success && result.featured) {
          setProducts(result.featured);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (!loading && products.length === 0) {
    return null; // Hide the section completely if no featured products are set
  }

  return (
    <section className="py-12 bg-bg-primary border-t border-border-color">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-color">
          <h2 className="font-serif text-white text-3xl">FEATURED COLLECTION</h2>
          <span className="text-text-muted text-sm tracking-widest uppercase">
            Hand-picked
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
