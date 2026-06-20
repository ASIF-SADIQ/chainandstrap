import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import HeroContent from "@/components/HeroContent";
import { API_BASE } from "@/lib/config";

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

export default async function Home() {
  // Marquee Brands
  const marqueeBrands = [
    "LV", "GUCCI", "PRADA", "CHANEL", "DIOR", "BALENCIAGA"
  ];

  return (
    <div>
      {/* SECTION 2 - HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient & particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/10 via-bg-primary to-bg-primary z-0" />
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

      {/* SECTION 3 - BRAND MARQUEE */}
      <div className="bg-bg-secondary border-y border-border-color py-6 overflow-hidden relative flex">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeBrands, ...marqueeBrands, ...marqueeBrands].map((brand, i) => (
            <div key={i} className="flex items-center mx-8">
              <span className="text-gold text-lg tracking-[0.4em] uppercase">{brand}</span>
              <span className="text-gold mx-8 text-[8px]">◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4 - BRANDS GRID */}
      <section className="py-24 container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-gold text-2xl tracking-[0.3em] uppercase">
            Shop by Brand
          </h2>
          <div className="w-16 h-[1px] bg-gold/50 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Louis Vuitton",
              slug: "louis-vuitton",
              image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000",
              desc: "1:1 Mirror Quality Bags & Accessories"
            },
            {
              name: "Chanel",
              slug: "chanel",
              image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000",
              desc: "Timeless Quilting & Classic Elegance"
            },
            {
              name: "Hermès",
              slug: "hermes",
              image: "https://images.unsplash.com/photo-1598532187856-32724ad61f40?q=80&w=1000",
              desc: "Ultimate Luxury Leather Craftsmanship"
            },
            {
              name: "Gucci",
              slug: "gucci",
              image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=1000",
              desc: "Bold Italian Statements & Iconic Hardware"
            },
            {
              name: "Prada",
              slug: "prada",
              image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1000",
              desc: "Minimalist Modernity & Premium Nylon"
            },
            {
              name: "Dior",
              slug: "dior",
              image: "https://images.unsplash.com/photo-1537799944747-d576a1663b92?q=80&w=1000",
              desc: "Sophisticated Paris Couture & Accents"
            }
          ].map((brand) => (
            <Link 
              key={brand.name}
              href={`/brand/${brand.slug}`}
              className="group relative overflow-hidden bg-bg-secondary aspect-[4/3] rounded-sm border border-border-color/30 hover:border-gold/50 transition-colors duration-500"
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:via-black/20 transition-all duration-500 z-10" />
              
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: `url('${brand.image}')` }}
              />
              
              {/* Inner animated gold border */}
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/30 transition-all duration-500 z-20 m-3" />
              
              {/* Text content */}
              <div className="absolute bottom-6 left-6 right-6 z-30">
                <h3 className="font-serif text-white text-2xl lg:text-3xl tracking-wide group-hover:text-gold transition-colors duration-300">
                  {brand.name.toUpperCase()}
                </h3>
                <p className="text-text-muted text-xs font-light mt-1 tracking-wider uppercase truncate">
                  {brand.desc}
                </p>
                <div className="w-0 group-hover:w-12 h-[1px] bg-gold mt-3 transition-all duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 5 - FEATURED PRODUCTS (Paginated) */}
      <section className="py-12 bg-bg-secondary border-t border-border-color">
        <ProductGrid title="NEW ARRIVALS" hideSidebar={true} />
      </section>

      {/* SECTION 7 - PROMISE STRIP */}
      <section className="py-16 border-t border-border-color">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">🔒</span>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-2">Authenticity Guaranteed</h4>
              <p className="text-text-muted text-xs">100% verified luxury</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">🚚</span>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-2">Premium Shipping</h4>
              <p className="text-text-muted text-xs">Worldwide secure delivery</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">↩️</span>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-2">Easy Returns</h4>
              <p className="text-text-muted text-xs">Hassle-free 14 day returns</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">💎</span>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-2">Exclusive Benefits</h4>
              <p className="text-text-muted text-xs">For registered members</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
