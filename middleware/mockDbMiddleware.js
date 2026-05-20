const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_PATH = path.join(__dirname, '../data.csv');
const ORDERS_JSON_PATH = path.join(__dirname, '../mock_orders.json');

// In-memory cache for parsed products
let cachedProducts = null;

// Parse the CSV to load products
async function loadProductsFromCsv() {
    if (cachedProducts) return cachedProducts;

    // We completely remove "Dragons Bags" / "dragon bag" products per user request,
    // and seed stunning, high-fidelity luxury products (LV, Gucci, Chanel, Rolex, etc.)
    // with working, beautiful high-resolution image URLs.
    cachedProducts = [
        {
            _id: 'louis-vuitton-monogram-speedy-30',
            Handle: 'louis-vuitton-monogram-speedy-30',
            Title: 'Monogram Speedy 30 Handbag',
            'Body (HTML)': '<p>The Speedy 30 is an elegant, compact handbag, a stylish companion for city life. Launched in 1930 as the "Express" and inspired by that era\'s rapid transit, today’s Speedy 30 remains a timeless House icon.</p><ul><li><strong>Material:</strong> Monogram coated canvas</li><li><strong>Trim:</strong> Natural cowhide-leather</li><li><strong>Hardware:</strong> Gold-color</li></ul>',
            vendor: 'LV',
            'Variant Price': 1450.00,
            status: 'active',
            category: 'Bags',
            images: [
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'gucci-marmont-shoulder-bag',
            Handle: 'gucci-marmont-shoulder-bag',
            Title: 'GG Marmont Small Shoulder Bag',
            'Body (HTML)': '<p>The small GG Marmont camera bag has a softly structured shape and a zip top closure with the Double G hardware. The chain shoulder strap has a leather shoulder detail.</p><ul><li><strong>Material:</strong> Matelassé chevron leather</li><li><strong>Hardware:</strong> Antique gold-toned</li><li><strong>Made in:</strong> Italy</li></ul>',
            vendor: 'GUCCI',
            'Variant Price': 1890.00,
            status: 'active',
            category: 'Bags',
            images: [
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'chanel-classic-double-flap',
            Handle: 'chanel-classic-double-flap',
            Title: 'Classic Double Flap Bag',
            'Body (HTML)': '<p>The Chanel Classic Double Flap Bag is one of the most iconic luxury bags in history. Its quilted design and signature CC turnlock symbolize ultimate luxury and prestige.</p><ul><li><strong>Material:</strong> Lambskin & Gold-Tone Metal</li><li><strong>Color:</strong> Black</li><li><strong>Reference:</strong> Y01864</li></ul>',
            vendor: 'CHANEL',
            'Variant Price': 4200.00,
            status: 'active',
            category: 'Bags',
            images: [
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'rolex-submariner-date',
            Handle: 'rolex-submariner-date',
            Title: 'Submariner Date Oystersteel Watch',
            'Body (HTML)': '<p>The Rolex Submariner Date in Oystersteel with a black Cerachrom bezel and a black dial with large luminescent hour markers. A true benchmark watch.</p><ul><li><strong>Model Case:</strong> Oyster, 41 mm, Oystersteel</li><li><strong>Bezel:</strong> Unidirectional rotatable</li><li><strong>Water Resistance:</strong> 300m / 1000 feet</li></ul>',
            vendor: 'ROLEX',
            'Variant Price': 9500.00,
            status: 'active',
            category: 'Watches',
            images: [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'cartier-love-bracelet-gold',
            Handle: 'cartier-love-bracelet-gold',
            Title: 'Love Bracelet 18K Yellow Gold',
            'Body (HTML)': '<p>A child of 1970s New York, the LOVE collection remains today an iconic symbol of love that transgresses convention. The screw motifs, ideal oval shape and undeniable elegance establish it as a timeless tribute to passionate romance.</p><ul><li><strong>Material:</strong> 18K Yellow Gold</li><li><strong>Width:</strong> 6.1 mm</li></ul>',
            vendor: 'CARTIER',
            'Variant Price': 6300.00,
            status: 'active',
            category: 'Jewellery',
            images: [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'balenciaga-triple-s-sneakers',
            Handle: 'balenciaga-triple-s-sneakers',
            Title: 'Triple S Double Foam Sneakers',
            'Body (HTML)': '<p>Triple S Sneaker in double foam and mesh. 3-layered outsole, embroidered size at the edge of the toe, and functional details that define athletic elegance.</p><ul><li><strong>Material:</strong> 60% Polyester, 25% Calfskin, 15% Lambskin</li><li><strong>Design:</strong> Complex 3-layered sole</li></ul>',
            vendor: 'BALENCIAGA',
            'Variant Price': 975.00,
            status: 'active',
            category: 'Shoes',
            images: [
                'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'prada-saffiano-leather-tote',
            Handle: 'prada-saffiano-leather-tote',
            Title: 'Saffiano Lux Leather Tote Bag',
            'Body (HTML)': '<p>Defined by its crosshatch texture and waxed finish, Saffiano leather is synonymous with luxury. The clean silhouette and timeless elegance make this the ultimate workwear handbag.</p><ul><li><strong>Material:</strong> Saffiano Leather</li><li><strong>Interior:</strong> Prada logo nylon lining</li><li><strong>Details:</strong> Double leather handle</li></ul>',
            vendor: 'PRADA',
            'Variant Price': 2200.00,
            status: 'active',
            category: 'Bags',
            images: [
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'hermes-birkin-30-gold',
            Handle: 'hermes-birkin-30-gold',
            Title: 'Birkin 30 Gold Togo Leather',
            'Body (HTML)': '<p>The legendary Birkin 30, handcrafted in Gold Togo leather with polished gold hardware. Known for its scratch resistance and beautiful textured feel.</p><ul><li><strong>Leather:</strong> Togo Calfskin</li><li><strong>Hardware:</strong> Gold-plated</li><li><strong>Made in:</strong> France</li></ul>',
            vendor: 'HERMES',
            'Variant Price': 12500.00,
            status: 'active',
            category: 'Bags',
            images: [
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'dior-jadior-slingback-pumps',
            Handle: 'dior-jadior-slingback-pumps',
            Title: "J'Adior Slingback Patent Pumps",
            'Body (HTML)': '<p>The J\'Adior slingback pump is a prime example of Dior\'s savoir-faire. Handcrafted in Christian Dior\'s Italian workshops, it features premium patent leather and an embroidered cotton ribbon.</p><ul><li><strong>Material:</strong> Patent Calfskin Leather</li><li><strong>Heel Height:</strong> 6.5 cm</li></ul>',
            vendor: 'DIOR',
            'Variant Price': 890.00,
            status: 'active',
            category: 'Shoes',
            images: [
                'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        },
        {
            _id: 'givenchy-antigona-medium',
            Handle: 'givenchy-antigona-medium',
            Title: 'Antigona Medium Duffel Bag',
            'Body (HTML)': '<p>Trapezoid duffle bag in black box calfskin leather with triangular Givenchy patch, oversized zipper, and silver-finish metal details.</p><ul><li><strong>Material:</strong> 100% Goatskin Leather</li><li><strong>Lining:</strong> Canvas</li><li><strong>Made in:</strong> Italy</li></ul>',
            vendor: 'GIVENCHY',
            'Variant Price': 2450.00,
            status: 'active',
            category: 'Bags',
            images: [
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80'
            ],
            createdAt: new Date()
        }
    ];

    console.log(`📦 Loaded ${cachedProducts.length} curated ultra-premium luxury products for Simulation Mode. (Dragon Bags completely removed)`);
    return cachedProducts;
}

// Load and seed mock orders
function getMockOrders() {
    if (fs.existsSync(ORDERS_JSON_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(ORDERS_JSON_PATH, 'utf8'));
        } catch (e) {
            console.error('❌ Error reading mock_orders.json:', e.message);
        }
    }

    // Default Seed Orders matching premium luxury store theme
    const seedOrders = [
        {
            _id: "order_001_mock",
            orderNumber: 1001,
            user: { name: "Ayesha Khan", email: "ayesha.khan@example.com" },
            shippingAddress: {
                firstName: "Ayesha",
                lastName: "Khan",
                email: "ayesha.khan@example.com",
                phone: "+92 300 1234567",
                address: "Flat 4B, Silver Oak Apartments, F-10 Markaz",
                city: "Islamabad",
                zip: "44000",
                country: "Pakistan"
            },
            orderItems: [
                {
                    product: "dragons-bags-horse-brown-tote-bag",
                    title: "Horse brown tote bag",
                    price: 269.51,
                    quantity: 1,
                    image: "https://cdn.shopify.com/s/files/1/0555/1000/7999/files/dragons-bags-horse-brown-tote-bag-front.jpg"
                }
            ],
            itemsPrice: 269.51,
            shippingPrice: 0.00,
            totalAmount: 269.51,
            status: "Pending",
            isDelivered: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
            _id: "order_002_mock",
            orderNumber: 1002,
            user: { name: "Zainab Malik", email: "zainab.malik@example.com" },
            shippingAddress: {
                firstName: "Zainab",
                lastName: "Malik",
                email: "zainab.malik@example.com",
                phone: "+92 321 9876543",
                address: "House 12, Street 3, Phase 5, DHA",
                city: "Lahore",
                zip: "54000",
                country: "Pakistan"
            },
            orderItems: [
                {
                    product: "off-white-elongated-chain-handle-purse",
                    title: "Off-white elongated chain handle purse",
                    price: 292.89,
                    quantity: 2,
                    image: "https://cdn.shopify.com/s/files/1/0555/1000/7999/files/off-white-elongated-chain-handle-purse-quater.jpg"
                }
            ],
            itemsPrice: 585.78,
            shippingPrice: 0.00,
            totalAmount: 585.78,
            status: "Delivered",
            isDelivered: true,
            deliveredAt: new Date().toISOString(),
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
    ];

    fs.writeFileSync(ORDERS_JSON_PATH, JSON.stringify(seedOrders, null, 2), 'utf8');
    return seedOrders;
}

function saveMockOrders(orders) {
    fs.writeFileSync(ORDERS_JSON_PATH, JSON.stringify(orders, null, 2), 'utf8');
}

module.exports = async function mockDbMiddleware(req, res, next) {
    const url = req.path;
    const method = req.method;

    console.log(`🤖 [SIMULATION MODE] Intercepted request: ${method} ${req.originalUrl}`);

    // Force preloading products
    const products = await loadProductsFromCsv();

    // ─────────────────────────────────────────────
    // 1. POST /api/auth/login
    // ─────────────────────────────────────────────
    if (url === '/api/auth/login' && method === 'POST') {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        // Support both email accounts
        const isCorrectEmail = email === 'chainandstrap@gmail.com' || email === 'admin@chainstraps.com';
        const isCorrectPassword = password === 'Admin@1234';

        if (isCorrectEmail && isCorrectPassword) {
            return res.status(200).json({
                success: true,
                message: 'Logged in successfully! [Simulation Mode]',
                token: 'mock_jwt_token_for_simulation_development',
                user: {
                    id: 'mock_admin_id',
                    name: 'Admin Developer',
                    email: email,
                    role: 'admin'
                }
            });
        }

        return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    // ─────────────────────────────────────────────
    // 2. GET /api/auth/me
    // ─────────────────────────────────────────────
    if (url === '/api/auth/me' && method === 'GET') {
        return res.status(200).json({
            success: true,
            user: {
                id: 'mock_admin_id',
                name: 'Admin Developer',
                email: 'chainandstrap@gmail.com',
                role: 'admin'
            }
        });
    }

    // ─────────────────────────────────────────────
    // 3. GET /api/stats
    // ─────────────────────────────────────────────
    if (url === '/api/stats' && method === 'GET') {
        const orders = getMockOrders();
        const pending = orders.filter(o => o.status === 'Pending').length;
        const total = products.length;

        return res.status(200).json({
            success: true,
            stats: {
                total: total,
                pending: pending,
                posted: total // mock posted products
            }
        });
    }

    // ─────────────────────────────────────────────
    // 4. GET /api/orders
    // ─────────────────────────────────────────────
    if (url === '/api/orders' && method === 'GET') {
        let orders = getMockOrders();

        // Support search
        const search = (req.query.search || '').toLowerCase();
        if (search) {
            orders = orders.filter(o => 
                o.orderNumber.toString().includes(search) ||
                (o.shippingAddress?.firstName || '').toLowerCase().includes(search) ||
                (o.shippingAddress?.lastName || '').toLowerCase().includes(search) ||
                (o.shippingAddress?.email || '').toLowerCase().includes(search)
            );
        }

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders
        });
    }

    // ─────────────────────────────────────────────
    // 5. PUT /api/orders/:id/status
    // ─────────────────────────────────────────────
    const orderStatusMatch = url.match(/^\/api\/orders\/([^\/]+)\/status$/);
    if (orderStatusMatch && method === 'PUT') {
        const orderId = orderStatusMatch[1];
        const { status } = req.body;

        const orders = getMockOrders();
        const order = orders.find(o => o._id === orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        order.status = status;
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date().toISOString();
        } else {
            order.isDelivered = false;
        }

        saveMockOrders(orders);
        console.log(`✅ [SIMULATION MODE] Updated order ${orderId} status to: ${status}`);

        return res.status(200).json({
            success: true,
            order: order
        });
    }

    // ─────────────────────────────────────────────
    // 6. GET /api/products
    // ─────────────────────────────────────────────
    if (url === '/api/products' && method === 'GET') {
        let { page = 1, limit = 20, search = '', brand = '', category = '', sort = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        let filtered = [...products];

        // 1. Search Filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(p => 
                p.Title.toLowerCase().includes(searchLower) ||
                p.vendor.toLowerCase().includes(searchLower)
            );
        }

        // 2. Brand Filter (case-insensitive)
        if (brand) {
            const brandLower = brand.toLowerCase();
            filtered = filtered.filter(p => p.vendor.toLowerCase() === brandLower);
        }

        // 3. Category Filter (case-insensitive, supporting comma-separated list from frontend)
        if (category) {
            const categories = category.toLowerCase().split(',');
            filtered = filtered.filter(p => p.category && categories.includes(p.category.toLowerCase()));
        }

        // 4. Sorting logic
        if (sort === 'price_asc') {
            filtered.sort((a, b) => a['Variant Price'] - b['Variant Price']);
        } else if (sort === 'price_desc') {
            filtered.sort((a, b) => b['Variant Price'] - a['Variant Price']);
        } else {
            // Default newest first
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const skipVal = (page - 1) * limit;
        const pageData = filtered.slice(skipVal, skipVal + limit);

        return res.status(200).json({
            success: true,
            count: pageData.length,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
            currentPage: page,
            data: pageData
        });
    }

    // ─────────────────────────────────────────────
    // 7. GET /api/products/:handle
    // ─────────────────────────────────────────────
    const productMatch = url.match(/^\/api\/products\/([^\/]+)$/);
    if (productMatch && method === 'GET') {
        const handle = productMatch[1];
        const product = products.find(p => p.Handle === handle);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        return res.status(200).json({
            success: true,
            product: product
        });
    }

    // ─────────────────────────────────────────────
    // 8. GET & POST /api/settings
    // ─────────────────────────────────────────────
    if (url === '/api/settings') {
        const settingsPath = path.join(__dirname, '../mock_settings.json');
        if (method === 'GET') {
            let settings = { automationRunning: false, accounts: [] };
            if (fs.existsSync(settingsPath)) {
                try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) {}
            }
            return res.status(200).json({ success: true, settings });
        }
        if (method === 'POST') {
            fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2), 'utf8');
            return res.status(200).json({ success: true, message: 'Settings saved! [Simulation]' });
        }
    }

    // Root endpoint
    if (url === '/' || url === '/api' || url === '/api/') {
        return res.status(200).send('Chain and Straps API is running in offline Simulation Mode... [MOCK DB]');
    }

    // Return 404 for unhandled mock routes
    res.status(404).json({ success: false, message: `Route ${method} ${url} not found in Simulation Mode.` });
};
