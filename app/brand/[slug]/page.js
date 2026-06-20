import ProductGrid from "@/components/ProductGrid";
import { parseVendor } from "@/lib/helpers";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const vendorName = parseVendor(params.slug);
  return {
    title: `${vendorName.toUpperCase()} | Chain & Straps`,
  };
}

export default async function BrandPage({ params }) {
  const vendorName = parseVendor(params.slug);

  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <div className="bg-bg-secondary py-20 border-b border-border-color flex items-center justify-center relative overflow-hidden">
        <h1 className="font-serif text-white text-5xl md:text-[6rem] uppercase tracking-wider relative z-10">
          {vendorName}
        </h1>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/50 to-transparent z-0" />
      </div>
      <ProductGrid initialBrand={vendorName} title={`${vendorName.toUpperCase()} Collection`} />
    </div>
  );
}
