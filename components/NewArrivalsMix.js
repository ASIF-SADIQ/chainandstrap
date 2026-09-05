"use client";

import { useState, useEffect } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

export default function NewArrivalsMix() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const brands = ["lv", "chanel", "gucci", "dior", "prada", "ysl", "fendi", "valentino", "versace", "dolce"];

  useEffect(() => {
    const fetchMixed = async () => {
      setLoading(true);
      try {
        const liveApiBase = "https://chainandstrap.store/api";
        // Fetch 1 item from each brand concurrently
        const promises = brands.map(brand => 
          fetch(`${liveApiBase}/products?brand=${brand}&limit=1`).then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        
        // Extract the products and filter out nulls/errors
        let mixedProducts = results
          .map(res => res.data && res.data.length > 0 ? res.data[0] : null)
          .filter(Boolean);
          
        // Shuffle the array to make it random
        mixedProducts = mixedProducts.sort(() => Math.random() - 0.5);
        
        setProducts(mixedProducts);
      } catch (error) {
        console.error("Error fetching mixed arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMixed();
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-color">
        <h2 className="font-serif text-white text-3xl">NEW ARRIVALS</h2>
        <span className="text-text-muted text-sm tracking-widest uppercase">
          CURATED MIXTURE
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gold font-serif">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
