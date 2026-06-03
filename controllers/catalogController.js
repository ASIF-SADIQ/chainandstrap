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
            const link = escapeCSV(`https://chainandstrap.com/product/${product.Handle || product._id}`);
            
            // Image Link
            const image_link = escapeCSV(product['Image Src'] || 'https://chainandstrap.com/placeholder.png');
            
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
