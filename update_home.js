const fs = require('fs');

let content = fs.readFileSync('app/page.js', 'utf8');

// Replace imports
content = content.replace(
  'import ProductCard from "@/components/ProductCard";\r\nimport HeroContent from "@/components/HeroContent";',
  'import ProductCard from "@/components/ProductCard";\r\nimport ProductGrid from "@/components/ProductGrid";\r\nimport HeroContent from "@/components/HeroContent";'
);
content = content.replace(
  'import ProductCard from "@/components/ProductCard";\nimport HeroContent from "@/components/HeroContent";',
  'import ProductCard from "@/components/ProductCard";\nimport ProductGrid from "@/components/ProductGrid";\nimport HeroContent from "@/components/HeroContent";'
);

// Replace Section 5
const section5Regex = /\{\/\* SECTION 5 - FEATURED PRODUCTS \*\/\}\s*<section className="py-24 bg-bg-secondary border-t border-border-color">[\s\S]*?<\/section>/m;
const replacement = `{/* SECTION 5 - FEATURED PRODUCTS (Paginated) */}
      <section className="py-12 bg-bg-secondary border-t border-border-color">
        <ProductGrid title="NEW ARRIVALS" hideSidebar={true} />
      </section>`;

if (section5Regex.test(content)) {
  content = content.replace(section5Regex, replacement);
  fs.writeFileSync('app/page.js', content);
  console.log('Successfully updated app/page.js');
} else {
  console.log('Could not find Section 5');
}
