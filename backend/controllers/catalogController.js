const Product = require('../models/Product');

exports.generatePinterestCatalog = async (req, res) => {
    try {
        // Pinterest needs a CSV file
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="catalog.csv"');

        // Write CSV Header
        res.write('id,title,description,link,image_link,price,availability,condition\n');

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
            
            // Clean description by stripping HTML if needed, but for now just escape it
            const description = escapeCSV(product['Body (HTML)'] || product.Title);
            
            // Product Link
            const link = escapeCSV(`https://chainandstrap.store/product/${product.Handle || product._id}`);
            
            // Image Link
            const image_link = escapeCSV(product['Image Src'] || 'https://chainandstrap.store/placeholder.png');
            
            // Price format for Pinterest: "285.04 USD"
            const price = escapeCSV(`${product['Variant Price']} USD`);
            
            // Availability: in stock
            const availability = escapeCSV('in stock');
            
            // Condition: new
            const condition = escapeCSV('new');

            // Write row to stream
            const row = `${id},${title},${description},${link},${image_link},${price},${availability},${condition}\n`;
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

        // Write RSS header
        res.write(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
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
                .replace(/\]\]>/g, ']]&gt;')
                .slice(0, 499);

            const cleanTitle = (product.Title || '')
                .replace(/\]\]>/g, ']]&gt;');

            const id = product.Handle || product._id;
            const link = `https://chainandstrap.store/product/${product.Handle || product._id}`;
            const imageSrc = (product['Image Src'] || '').split(',')[0].trim();
            const imageLink = imageSrc || 'https://chainandstrap.store/placeholder.png';
            const price = `${parseFloat(product['Variant Price'] || 0).toFixed(2)} USD`;
            const vendor = (product.vendor || 'Chain and Straps')
                .replace(/\]\]>/g, ']]&gt;');

            const item = `    <item>
      <g:id>${id}</g:id>
      <title><![CDATA[${cleanTitle}]]></title>
      <description><![CDATA[${cleanDescription}]]></description>
      <link>${link}</link>
      <g:image_link>${imageLink}</g:image_link>
      <g:price>${price}</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand><![CDATA[${vendor}]]></g:brand>
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
