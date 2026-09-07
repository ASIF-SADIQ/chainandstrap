import ProductGrid from "@/components/ProductGrid";
import { Suspense } from "react";

export const metadata = {
  title: "All Products | Chain & Straps",
  description: "Browse our entire collection of luxury bags, shoes, jewellery, and watches.",
};

export default function AllProductsPage({ searchParams }) {
  const initialBrand = searchParams?.brand || "";

  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <div className="bg-bg-secondary py-12 border-b border-border-color">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-white text-5xl mb-4">The Collection</h1>
          <p className="text-text-secondary text-sm tracking-widest uppercase">
            Curated Luxury
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center text-white">Loading collection...</div>}>
        <ProductGrid title="All Products" initialBrand={initialBrand} />
      </Suspense>
    </div>
  );
}
