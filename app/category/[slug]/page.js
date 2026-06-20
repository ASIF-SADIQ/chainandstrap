import ProductGrid from "@/components/ProductGrid";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const categoryName = params.slug.replace(/-/g, ' ');
  return {
    title: `${categoryName.toUpperCase()} | Chain&Straps`,
  };
}

export default async function CategoryPage({ params }) {
  const categoryName = params.slug.replace(/-/g, ' ');

  // Map slugs to product_types as they appear in DB
  const typeMap = {
    'bags': 'Bags',
    'shoes': 'Shoes',
    'jewellery': 'Jewellery',
    'watches': 'Watches'
  };

  const productType = typeMap[params.slug.toLowerCase()] || categoryName;

  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <div className="bg-bg-secondary py-16 border-b border-border-color text-center">
        <h1 className="font-serif text-white text-4xl md:text-5xl uppercase tracking-wider mb-2">
          {categoryName}
        </h1>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Discover Our Curated Selection</p>
      </div>
      <ProductGrid initialCategory={productType} title={`${categoryName.toUpperCase()}`} />
    </div>
  );
}
