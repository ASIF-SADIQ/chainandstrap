const Product = require('../models/Product');

exports.generatePinterestCatalog = async (req, res) => {
    try {
        // Pinterest needs a CSV file
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="catalog.csv"');

        // Write CSV Header — includes google_product_category to fix Pinterest Warning 157
        res.write('id,title,description,link,image_link,additional_image_link,price,availability,condition,google_product_category,brand\n');

        // Determine Google Product Category from title keywords
        const getGoogleCategory = (title) => {
            const t = (title || '').toLowerCase();
            if (t.includes('shoe') || t.includes('sneaker') || t.includes('heel') || t.includes('boot') || t.includes('loafer') || t.includes('slipper') || t.includes('sandal')) return 'Apparel & Accessories > Shoes';
            if (t.includes('watch')) return 'Apparel & Accessories > Jewelry > Watches';
            if (t.includes('wallet') || t.includes('card holder') || t.includes('cardholder')) return 'Apparel & Accessories > Handbags, Wallets & Cases > Wallets & Money Clips';
            if (t.includes('belt')) return 'Apparel & Accessories > Clothing Accessories > Belts';
            if (t.includes('sunglasses') || t.includes('glasses')) return 'Apparel & Accessories > Clothing Accessories > Sunglasses';
            if (t.includes('scarf') || t.includes('shawl')) return 'Apparel & Accessories > Clothing Accessories > Scarves & Shawls';
            return 'Apparel & Accessories > Handbags, Wallets & Cases > Handbags';
        };

        // We use a cursor to stream products without overloading RAM
        // Only fetch products with a valid title and price
        const cursor = Product.find({
            Title: { $nin: ['', null, 'undefined'] },
            'Variant Price': { $gt: 0 },
            isDeleted: { $ne: true }
        }).cursor();

        for await (const product of cursor) {
            // Escape quotes in strings for CSV
            const escapeCSV = (str) => {
                if (!str) return '';
                const cleanStr = String(str).replace(/"/g, '""').replace(/\n|\r/g, ' ');
                return `"${cleanStr}"`;
            };

            const id = escapeCSV(product.Handle || product._id);
            const title = escapeCSV(product.Title);
            
            // Clean description by stripping HTML
            const description = escapeCSV(
                (product['Body (HTML)'] || product.Title || '')
                    .replace(/<[^>]*>?/gm, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 499)
            );
            
            // Product Link
            const link = escapeCSV(`https://chainandstrap.store/product/${product.Handle || product._id}`);
            
            // Image Link — use the images array (S3), fallback to legacy Image Src
            const productImages = (product.images || []).filter(Boolean);
            const image_link = escapeCSV(productImages[0] || product['Image Src'] || 'https://chainandstrap.store/placeholder.png');
            
            // Additional images (comma-separated in one field)
            const additional_image_link = escapeCSV(productImages.slice(1, 11).join(','));
            
            // Price format for Pinterest: "285.04 USD"
            const price = escapeCSV(`${product['Variant Price']} USD`);
            
            // Availability: in stock
            const availability = escapeCSV('in stock');
            
            // Condition: new
            const condition = escapeCSV('new');

            // Google Product Category
            const google_product_category = escapeCSV(getGoogleCategory(product.Title));

            // Brand
            const brand = escapeCSV(product.vendor || 'Chain and Straps');

            // Write row to stream
            const row = `${id},${title},${description},${link},${image_link},${additional_image_link},${price},${availability},${condition},${google_product_category},${brand}\n`;
            res.write(row);
        }

        res.end();
    } catch (error) {
        console.error('Catalog Generation Error:', error);
        res.status(500).end('Internal Server Error');
    }
};

exports.generatePinterestFeedXml = async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', 'inline; filename="feed.xml"');

        // XML-escape helper to prevent broken XML from special characters in URLs/text
        const xmlEscape = (str) => {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        // Determine Google Product Category from title keywords
        const getGoogleCategory = (title) => {
            const t = (title || '').toLowerCase();
            if (t.includes('shoe') || t.includes('sneaker') || t.includes('heel') || t.includes('boot') || t.includes('loafer') || t.includes('slipper') || t.includes('sandal')) {
                return '187'; // Apparel & Accessories > Shoes
            }
            if (t.includes('watch')) {
                return '201'; // Apparel & Accessories > Jewelry > Watches
            }
            if (t.includes('wallet') || t.includes('card holder') || t.includes('cardholder')) {
                return '6551'; // Apparel & Accessories > Handbags, Wallets & Cases > Wallets & Money Clips
            }
            if (t.includes('belt')) {
                return '175'; // Apparel & Accessories > Clothing Accessories > Belts
            }
            if (t.includes('sunglasses') || t.includes('glasses')) {
                return '178'; // Apparel & Accessories > Clothing Accessories > Sunglasses
            }
            if (t.includes('scarf') || t.includes('shawl')) {
                return '177'; // Apparel & Accessories > Clothing Accessories > Scarves & Shawls
            }
            // Default: Handbags (most products are bags)
            return '3032'; // Apparel & Accessories > Handbags, Wallets & Cases > Handbags
        };

        // Write RSS header with Google and Media namespaces
        res.write(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Chain and Straps</title>
    <link>https://chainandstrap.store</link>
    <description>Luxury bags, shoes, watches and jewellery</description>\n`);

        const cursor = Product.find({
            Title: { $nin: ['', null, 'undefined'] },
            'Variant Price': { $gt: 0 },
            isDeleted: { $ne: true }
        }).cursor();

        for await (const product of cursor) {
            // Clean description: strip HTML tags and limit character count
            const cleanDescription = (product['Body (HTML)'] || product.Title || '')
                .replace(/<[^>]*>?/gm, '') // Strip HTML
                .replace(/&nbsp;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 499);

            const cleanTitle = (product.Title || '').trim();

            const id = product.Handle || product._id;
            const link = `https://chainandstrap.store/product/${product.Handle || product._id}`;
            
            // Use images array (S3), fallback to legacy Image Src
            const productImages = (product.images || []).filter(img => {
                if (!img) return false;
                const trimmed = img.trim();
                // Only include valid http(s) URLs
                return trimmed.startsWith('http://') || trimmed.startsWith('https://');
            });
            const imageLink = productImages[0] || (product['Image Src'] || '').split(',')[0].trim() || 'https://chainandstrap.store/placeholder.png';
            const additionalImages = productImages.slice(1, 11); // Up to 10 additional images
            const price = `${parseFloat(product['Variant Price'] || 0).toFixed(2)} USD`;
            const vendor = (product.vendor || 'Chain and Straps').trim();
            const pubDate = new Date(product.createdAt || Date.now()).toUTCString();
            const googleCategory = getGoogleCategory(cleanTitle);

            // Build additional image lines (XML-escaped)
            const additionalImageLines = additionalImages
                .map(img => `      <g:additional_image_link>${xmlEscape(img.trim())}</g:additional_image_link>`)
                .join('\n');

            const item = `    <item>
      <g:id>${xmlEscape(String(id))}</g:id>
      <title><![CDATA[${cleanTitle}]]></title>
      <description><![CDATA[${cleanDescription}]]></description>
      <link>${xmlEscape(link)}</link>
      <g:image_link>${xmlEscape(imageLink.trim())}</g:image_link>
${additionalImageLines ? additionalImageLines + '\n' : ''}      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type><![CDATA[${vendor} > ${cleanTitle.split(' ')[0]}]]></g:product_type>
      <g:price>${price}</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand><![CDATA[${vendor}]]></g:brand>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${xmlEscape(imageLink.trim())}" type="image/jpeg" />
      <media:content url="${xmlEscape(imageLink.trim())}" type="image/jpeg" />
    </item>\n`;

            res.write(item);
        }

        res.write(`  </channel>
</rss>`);
        res.end();
    } catch (error) {
        console.error('Feed XML Generation Error:', error);
        res.status(500).end('Internal Server Error');
    }
};
