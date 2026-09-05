import { NextResponse } from 'next/server';

// Opt out of caching to ensure the feed is always fresh
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // We use the direct backend IP if running server side, or localhost if testing
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.startsWith('http') 
      ? process.env.NEXT_PUBLIC_API_URL 
      : 'http://52.9.12.224:5000/api';

    const res = await fetch(`${API_URL}/products?limit=5000`, { cache: 'no-store' });
    const data = await res.json();
    const products = data.data || [];

    const site_url = 'https://chainandstrap.store';

    let rssItems = products.map(product => {
      const handle = product.Handle || product.handle || product._id;
      const title = product.Title || "Untitled Product";
      const description = product['Body (HTML)'] || product.Body_HTML || title;
      const price = product['Variant Price'] || product.price || 0;
      let image = (product.images && product.images.length > 0) ? product.images[0] : (product['Image Src'] || '');
      
      // Clean XML characters to avoid invalid feed
      const cleanTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const cleanDesc = description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Fix google drive links if any
      if (image.includes('drive.google.com')) {
          image = image.replace(/&/g, '&amp;');
      }

      const vendor = (product.Vendor || product.vendor || 'Chain & Straps').replace(/&/g, '&amp;');

      // Skip products without images to prevent Pinterest catalog errors (Error 1009)
      if (!image) return '';

      return `
    <item>
      <title>${cleanTitle}</title>
      <link>${site_url}/product/${handle}</link>
      <description>${cleanDesc}</description>
      <g:id>${handle}</g:id>
      <g:price>${price} USD</g:price>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:image_link>${image}</g:image_link>
      <g:brand>${vendor}</g:brand>
      <g:google_product_category>Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases &gt; Handbags</g:google_product_category>
    </item>`;
    }).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Chain &amp; Straps</title>
    <link>${site_url}</link>
    <description>Premium Local Bags Collection</description>
${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error("Error generating feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
