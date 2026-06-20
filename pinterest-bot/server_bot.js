const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const fsPromises = require('fs').promises;
const axios = require('axios');
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');

puppeteer.use(StealthPlugin());

const productSchema = new mongoose.Schema({
    Title: String,
    vendor: String,
    Handle: String,
    'Variant Price': Number,
    'Image Src': String,
    'Body (HTML)': String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

function randomDelay(min, max) {
    const time = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`⏳ Waiting for ${time / 1000} seconds to mimic human behavior...`);
    return new Promise(resolve => setTimeout(resolve, time));
}

async function loadProgress() {
    const progressFile = path.join(__dirname, 'server_progress.json');
    if (!fs.existsSync(progressFile)) {
        await fsPromises.writeFile(progressFile, JSON.stringify([]));
        return new Set();
    }
    const data = await fsPromises.readFile(progressFile, 'utf8');
    return new Set(JSON.parse(data));
}

async function saveProgress(handle, processedSet) {
    processedSet.add(handle);
    const progressFile = path.join(__dirname, 'server_progress.json');
    await fsPromises.writeFile(progressFile, JSON.stringify(Array.from(processedSet), null, 2));
    console.log(`✅ Progress saved. Product Handle [${handle}] marked as uploaded.`);
}

async function downloadImage(imageUrl, imagePath) {
    const getGoogleDriveThumbnail = (url) => {
        if (!url) return '';
        const trimmedUrl = url.trim();
        if (!trimmedUrl.includes('drive.google.com')) return trimmedUrl;
        if (trimmedUrl.includes('drive.google.com/thumbnail')) return trimmedUrl;
        
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
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
        return trimmedUrl;
    };

    const finalUrl = getGoogleDriveThumbnail(imageUrl);
    console.log(`📥 Downloading image from: ${finalUrl}`);
    try {
        const response = await axios({ 
            url: finalUrl, 
            method: 'GET', 
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(imagePath);
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => { error = err; writer.close(); reject(err); });
            writer.on('close', () => { if (!error) resolve(true); });
        });
    } catch (e) {
        console.log(`❌ Failed to download image: ${imageUrl}`);
        return false;
    }
}

function determineBoardName(title) {
    const lowerTitle = title.toLowerCase();
    const brands = ['louis vuitton', 'lv', 'gucci', 'prada', 'chanel', 'dior', 'hermes', 'fendi', 'ysl', 'yves saint laurent', 'bottega veneta', 'celine', 'balenciaga', 'valentino', 'givenchy', 'mcm', 'burberry', 'coach', 'michael kors'];
    let foundBrand = '';
    for (const brand of brands) {
        if (lowerTitle.includes(brand)) {
            if (brand === 'lv') foundBrand = 'Louis Vuitton';
            else if (brand === 'ysl') foundBrand = 'Yves Saint Laurent';
            else foundBrand = brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            break;
        }
    }
    const categories = ['bag', 'belt', 'wallet', 'purse', 'shoe', 'sneaker', 'heel', 'glasses', 'sunglasses', 'jewelry', 'watch', 'bracelet', 'necklace'];
    let foundCat = '';
    for (const cat of categories) {
        if (lowerTitle.includes(cat)) {
            foundCat = cat.charAt(0).toUpperCase() + cat.slice(1);
            if (foundCat === 'Purse') foundCat = 'Bag';
            break;
        }
    }
    if (foundBrand && foundCat) return `${foundBrand} ${foundCat}s`;
    if (foundBrand) return `${foundBrand} Accessories`;
    if (foundCat) return `Luxury ${foundCat}s`;
    return 'Luxury Accessories';
}

async function runRoundRobin() {
    const tempDir = os.tmpdir();
    
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect('mongodb://127.0.0.1:27017/mern_pinterest');
    
    const accounts = ['acc1.json', 'acc2.json', 'acc3.json', 'acc4.json', 'acc5.json', 'acc6.json', 'acc7.json'];
    let currentAccountIndex = 0;

    const processedHandles = await loadProgress();
    console.log(`📊 Tracker Loaded: ${processedHandles.size} products already uploaded.`);

    while (true) {
        const products = await Product.find({ 'Handle': { $nin: Array.from(processedHandles) }, 'Image Src': { $exists: true, $ne: null } }).limit(1).lean();
        
        if (products.length === 0) {
            console.log("🎯 All 150k products have been uploaded! Sleeping for 1 hour...");
            await randomDelay(3600000, 3600000);
            continue;
        }

        const product = products[0];
        const handle = product.Handle;
        const destinationLink = `https://chainandstrap.store/products/${handle}`;
        const title = product.Title || handle;
        
        let rawDescription = product['Body (HTML)'] || product.Title || '';
        const description = rawDescription.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 500);
        
        let imageUrl = product['Image Src'];
        if (typeof imageUrl === 'string') {
            const urls = imageUrl.split(',');
            imageUrl = urls[0].trim();
        }

        console.log(`\n==============================================`);
        console.log(`🚀 Processing Product: ${title}`);
        console.log(`🔗 Link: ${destinationLink}`);
        
        const tempImagePath = path.join(tempDir, `temp_${handle}.jpg`);
        const downloaded = await downloadImage(imageUrl, tempImagePath);
        if (!downloaded) {
            console.log("❌ Skipping product due to image download failure. Marking as processed.");
            await saveProgress(handle, processedHandles);
            continue;
        }

        const cookieFile = accounts[currentAccountIndex];
        const cookiePath = path.join(__dirname, 'cookies', cookieFile);
        
        if (!fs.existsSync(cookiePath)) {
            console.log(`❌ Cookie file ${cookieFile} missing. Skipping this account.`);
            currentAccountIndex = (currentAccountIndex + 1) % accounts.length;
            continue;
        }

        console.log(`👤 Switching to Account: ${cookieFile}`);

        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36']
        });
        
        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1366, height: 768 });

            const cookieData = await fsPromises.readFile(cookiePath, 'utf8');
            const cookies = JSON.parse(cookieData);
            
            await page.goto('https://www.pinterest.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            for (const cookie of cookies) {
                let sameSiteStr = undefined;
                if (cookie.sameSite === 'lax') sameSiteStr = 'Lax';
                else if (cookie.sameSite === 'strict') sameSiteStr = 'Strict';
                else if (cookie.sameSite === 'no_restriction') sameSiteStr = 'None';
                
                const cleanCookie = {
                    name: cookie.name, value: cookie.value, domain: cookie.domain, path: cookie.path || '/', secure: cookie.secure, httpOnly: cookie.httpOnly
                };
                if (sameSiteStr) cleanCookie.sameSite = sameSiteStr;
                if (cookie.expirationDate) cleanCookie.expires = cookie.expirationDate;
                else if (cookie.expires) cleanCookie.expires = cookie.expires;

                try { await page.setCookie(cleanCookie); } catch (err) {}
            }

            await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
            await new Promise(r => setTimeout(r, 3000));

            console.log("Navigating to Pin Creation Tool...");
            await page.goto('https://www.pinterest.com/pin-creation-tool/', { waitUntil: 'domcontentloaded', timeout: 60000 });
            await new Promise(r => setTimeout(r, 4000));

            const fileInput = await page.$('input[type="file"][accept*="image"]');
            if (fileInput) {
                await fileInput.uploadFile(tempImagePath);
                console.log("✅ Image attached.");
            } else {
                const debugImagePath = path.join(__dirname, `debug_missing_field_${handle}.jpg`);
                await page.screenshot({ path: debugImagePath, fullPage: true });
                console.log(`📸 Screenshot saved at: ${debugImagePath}`);
                throw new Error("Image upload field missing.");
            }

            await new Promise(r => setTimeout(r, 4000));

            console.log("⚠️ Typing Title, Description, and Link...");
            
            const titleSelector = '[data-test-id="pin-title"] textarea, input[placeholder*="title" i], textarea[placeholder*="title" i]';
            const titleEl = await page.$(titleSelector);
            if(titleEl) {
                await titleEl.click({clickCount: 3});
                await titleEl.type(title, {delay: 50});
                console.log("✅ Title typed.");
            }
            
            const descSelector = '[data-test-id="storyboard-description-field-container"] [contenteditable="true"], [data-test-id="storyboard-description-field-container"] textarea, div[data-test-id="pin-description-editor"] div[contenteditable="true"]';
            const descContainer = '[data-test-id="storyboard-description-field-container"]';
            let descEl = await page.$(descSelector);
            if(descEl) {
                await descEl.click({clickCount: 3});
                await descEl.type(description, {delay: 20});
                console.log("✅ Description typed.");
            } else {
                const containerEl = await page.$(descContainer);
                if (containerEl) {
                    await containerEl.click();
                    await page.keyboard.type(description, {delay: 20});
                    console.log("✅ Description typed.");
                }
            }

            const linkSelector = '[data-test-id="pin-link"] input, input[placeholder*="link" i], textarea[placeholder*="link" i]';
            const linkEl = await page.$(linkSelector);
            if(linkEl) {
                await linkEl.click({clickCount: 3});
                await linkEl.type(destinationLink, {delay: 50});
                console.log("✅ Link typed.");
            }

            console.log("⚠️ Selecting Board...");
            const boardName = determineBoardName(title);
            console.log(`📌 Target Board: ${boardName}`);
            
            const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
            if (boardBtn) {
                await boardBtn.click();
                await new Promise(r => setTimeout(r, 1500));
                
                await page.keyboard.type(boardName, {delay: 50});
                await new Promise(r => setTimeout(r, 2000));
                
                const created = await page.evaluate((bName) => {
                    const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
                    for (let btn of buttons) {
                        if (btn.innerText && btn.innerText.toLowerCase().includes('create') && btn.innerText.toLowerCase().includes('board')) {
                            btn.click();
                            return true;
                        }
                    }
                    for (let item of buttons) {
                        if (item.innerText && item.innerText.toLowerCase().includes(bName.toLowerCase())) {
                            item.click();
                            return false;
                        }
                    }
                    return false;
                }, boardName);
                
                if (created) {
                    console.log(`🛠️ Creating new board: ${boardName}`);
                    await new Promise(r => setTimeout(r, 2000));
                    await page.evaluate(() => {
                        const modalButtons = Array.from(document.querySelectorAll('button'));
                        for (let btn of modalButtons) {
                            if (btn.innerText && (btn.innerText.trim().toLowerCase() === 'create' || btn.innerText.trim().toLowerCase() === 'save')) {
                                btn.click();
                                break;
                            }
                        }
                    });
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            console.log("📸 Taking debug screenshot of the screen before clicking Publish...");
            const debugImagePath = path.join(__dirname, `debug_screenshot_${handle}.jpg`);
            await page.screenshot({ path: debugImagePath, fullPage: true });
            console.log(`📸 Screenshot saved at: ${debugImagePath}`);

            console.log("⚠️ Clicking Publish button...");
            await new Promise(r => setTimeout(r, 2000));
            
            const clicked = await page.evaluate(() => {
                const specificButtons = document.querySelectorAll('[data-test-id="board-dropdown-save-button"], [data-test-id="pin-builder-save"], [data-test-id="save-pin-button"]');
                for (let btn of specificButtons) {
                    if (!btn.disabled && btn.offsetParent !== null) {
                        btn.click();
                        return true;
                    }
                }
                const buttons = Array.from(document.querySelectorAll('button, [role="button"], div[role="button"]'));
                for (let btn of buttons) {
                    const text = btn.innerText || btn.textContent;
                    if (text && (text.trim().toLowerCase() === 'publish' || text.trim().toLowerCase() === 'publish pin')) {
                        const style = window.getComputedStyle(btn);
                        if (style.display !== 'none' && style.visibility !== 'hidden' && btn.offsetParent !== null && !btn.disabled) {
                            btn.click();
                            return true;
                        }
                    }
                }
                return false;
            });

            if(clicked) {
                console.log("✅ Publish clicked!");
                await new Promise(r => setTimeout(r, 6000));
                console.log(`🎉 Product [${handle}] uploaded successfully to Account ${currentAccountIndex + 1}!`);
                await saveProgress(handle, processedHandles);
            } else {
                console.log("❌ Publish button not found. Product NOT saved.");
            }

        } catch (err) {
            console.error(`❌ Error uploading [${handle}] on Account ${currentAccountIndex + 1}:`, err.message);
        } finally {
            if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
            await browser.close();
            console.log(`🔒 Browser closed for Account ${currentAccountIndex + 1}.`);
        }

        currentAccountIndex = (currentAccountIndex + 1) % accounts.length;

        await randomDelay(180000, 360000); 
    }
}

runRoundRobin();
