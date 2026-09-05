import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import HeroContent from "@/components/HeroContent";
import BrandGrid from "@/components/BrandGrid";
import { API_BASE } from "@/lib/config";

import HeroBackground from "@/components/HeroBackground";

import NewArrivalsMix from "@/components/NewArrivalsMix";

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

export default async function Home() {
  // Marquee Brands
  const marqueeBrands = [
    "LOCAL BAGS", "PREMIUM", "QUALITY", "FASHION", "STYLE", "TREND"
  ];

  return (
    <div>
      {/* SECTION 2 - HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />
        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }} 
            />
          ))}
        </div>

        <HeroContent />
      </section>

      {/* SECTION 3 - BRAND GRID */}
      <BrandGrid />

      {/* SECTION 5 - FEATURED PRODUCTS (Paginated) */}
      <section className="py-12 bg-bg-secondary border-t border-border-color">
        <ProductGrid title="NEW ARRIVALS" hideSidebar={true} />
      </section>

      {/* SECTION 7 - PROMISE STRIP */}
      <section className="py-16 border-t border-border-color">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">💎</span>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-2">Quality Guaranteed</h4>
              <p className="text-text-muted text-xs">100% verified materials</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">🚀</span>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-2">Premium Shipping</h4>
              <p className="text-text-muted text-xs">Worldwide secure delivery</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">🔙</span>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-2">Easy Returns</h4>
              <p className="text-text-muted text-xs">Hassle-free 14 day returns</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">🌟</span>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-2">Exclusive Benefits</h4>
              <p className="text-text-muted text-xs">For registered members</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
