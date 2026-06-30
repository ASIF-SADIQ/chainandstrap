import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import AddToWishlistButton from "@/components/AddToWishlistButton";
import ProductGallery from "@/components/ProductGallery";
import DOMPurify from 'isomorphic-dompurify';
import { API_BASE as API, API_BASE } from "@/lib/config";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { handle } = params;
  try {
    const res = await fetch(`${API_BASE}/products/${handle}`);
    const data = await res.json();
    if (!data.success) return {};
    const product = data.data;
    const mainImage = product.images?.[0] || "";
    return {
      title: `${product.Title} | Chain & Straps`,
      description: `Buy ${product.Title} by ${product.vendor} at Chain & Straps.`,
      openGraph: {
        title: `${product.Title} | Chain & Straps`,
        images: mainImage ? [{ url: mainImage }] : [],
        url: `https://chainandstrap.store/product/${product.Handle}`,
      },
      other: {
        "og:type": "product",
        "og:price:amount": (product["Variant Price"] || product.price || 0).toString(),
        "og:price:currency": "USD",
        "product:price:amount": (product["Variant Price"] || product.price || 0).toString(),
        "product:price:currency": "USD",
        "og:availability": "instock"
      }
    };
  } catch (e) {
    return {};
  }
}

export default async function ProductDetailPage({ params }) {
  const { handle } = params;
  let product = null;
  let relatedProducts = [];

  try {
    const res = await fetch(`${API_BASE}/products/${handle}`, { next: { revalidate: 60 } });
    const data = await res.json();

    if (!data.success || !data.data) {
      notFound();
    }
    product = data.data;

    // Fetch related products (same vendor, different handle)
    const relatedRes = await fetch(`${API_BASE}/products?limit=8&search=${encodeURIComponent(product.vendor || '')}`);
    const relatedData = await relatedRes.json();
    relatedProducts = (relatedData.data || []).filter(p => p.Handle !== handle).slice(0, 4);

  } catch (error) {
    console.error(error);
    notFound();
  }

  const getGoogleDriveThumbnail = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (!trimmedUrl.includes('drive.google.com')) return trimmedUrl;
    
    let fileId = '';
    const fileDMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      fileId = fileDMatch[1];
    } else {
      const idMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }
    
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    }
    return trimmedUrl;
  };

  // Map over images to fix Google Drive preview URLs
  const images = (product.images || [])
    .filter(Boolean)
    .map(url => getGoogleDriveThumbnail(url));

  const price = product["Variant Price"];
  const description = product["Body (HTML)"] || "";
  const formattedPrice = price ? `$${Number(price).toFixed(2)}` : "Price on Request";

  // Helper to extract clean plain text from HTML description
  const getPlainText = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/\s+/g, ' ') // Collapse extra whitespace
      .trim();
  };

  const plainDescription = getPlainText(description).slice(0, 300);
  const pinterestDescription = `${product.Title} by ${product.vendor} - ${formattedPrice}.${plainDescription ? ` ${plainDescription}` : ""}`;

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.Title,
    image: images,
    brand: { "@type": "Brand", name: product.vendor },
    offers: {
      "@type": "Offer",
      price: price || 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  // Normalized product for cart — use Handle as unique cart ID
  const normalizedProduct = {
    id: product.Handle,
    title: product.Title,
    handle: product.Handle,
    vendor: product.vendor,
    price: price,
    images: images,
    image: images[0] || "",
  };

  return (
    <div className="pt-24 min-h-screen bg-bg-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Breadcrumbs */}
        <div className="text-xs text-text-muted mb-8 tracking-widest uppercase flex items-center space-x-2">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/all" className="hover:text-gold transition-colors">All Products</Link>
          <span>/</span>
          <span className="text-text-secondary truncate">{product.Title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: Images Gallery */}
          <div className="lg:w-1/2">
            <ProductGallery images={images} title={product.Title} />
          </div>

          {/* Right: Info */}
          <div className="lg:w-1/2 flex flex-col justify-center lg:sticky lg:top-32 self-start">
            <h2 className="text-gold text-sm tracking-[0.4em] uppercase mb-4">{product.vendor}</h2>
            <h1 className="font-serif text-white text-4xl lg:text-5xl font-light mb-6 leading-tight">
              {product.Title}
            </h1>
            <p className="text-2xl text-white mb-8">{formattedPrice}</p>

            <hr className="border-border-color mb-8" />

            <AddToCartButton product={normalizedProduct} />

            <div className="mb-8">
              <AddToWishlistButton product={normalizedProduct} />
            </div>

            <a
              href={`https://pinterest.com/pin/create/button/?url=https://chainandstrap.store/product/${product.Handle}&media=${encodeURIComponent(images[0] || "")}&title=${encodeURIComponent(product.Title)}&description=${encodeURIComponent(pinterestDescription)}`}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center text-text-muted hover:text-gold transition-colors text-xs tracking-widest uppercase mb-12"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.688 0 1.029-.653 2.568-.992 3.992-.283 1.193.598 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.279 1.14c-.038.154-.127.189-.286.115-1.068-.498-1.736-2.073-1.736-3.337 0-2.712 1.97-5.207 5.688-5.207 2.99 0 5.318 2.13 5.318 4.978 0 2.973-1.875 5.367-4.479 5.367-1.129 0-2.193-.585-2.556-1.279l-.693 2.641c-.25.959-.929 2.158-1.385 2.894 1.077.327 2.215.503 3.395.503 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
              Share to Pinterest
            </a>

            <hr className="border-border-color mb-8" />

            {/* Description */}
            {description && (
              <div className="mb-8">
                <h3 className="font-serif text-white text-sm tracking-widest uppercase mb-4">Product Details</h3>
                <div
                  className="text-text-secondary text-sm leading-relaxed space-y-2 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
                />
              </div>
            )}

          </div>
        </div>

        {/* Related Products - Full Width Row Below */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-border-color pt-16">
            <h3 className="font-serif text-white text-2xl tracking-[0.2em] uppercase mb-12 text-center">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((rp) => (
                <Link key={rp.Handle} href={`/product/${rp.Handle}`} className="group block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rp.images?.[0] || "/placeholder.png"}
                    alt={rp.Title}
                    className="w-full aspect-[4/5] object-cover mb-4 group-hover:opacity-80 transition-opacity border border-transparent group-hover:border-gold"
                  />
                  <p className="text-white text-sm font-light tracking-wide truncate mb-1">{rp.Title}</p>
                  <p className="text-gold text-xs">${Number(rp['Variant Price']).toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
