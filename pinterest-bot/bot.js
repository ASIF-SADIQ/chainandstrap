const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const fsPromises = require('fs').promises;
const axios = require('axios');
const csv = require('csv-parser');
const path = require('path');
const os = require('os');

puppeteer.use(StealthPlugin());

// --- Helper Functions ---

function randomDelay(min, max) {
    const time = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`⏳ Waiting for ${time / 1000} seconds to mimic human behavior...`);
    return new Promise(resolve => setTimeout(resolve, time));
}

async function loadProgress() {
    const progressFile = path.join(__dirname, 'progress.json');
    if (!fs.existsSync(progressFile)) {
        await fsPromises.writeFile(progressFile, JSON.stringify([]));
        return new Set();
    }
    const data = await fsPromises.readFile(progressFile, 'utf8');
    return new Set(JSON.parse(data));
}

async function saveProgress(handle, processedSet) {
    processedSet.add(handle);
    const progressFile = path.join(__dirname, 'progress.json');
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

async function getProductsStream(csvSource) {
    return new Promise((resolve) => {
        let stream;
        if (csvSource.startsWith('http')) {
            axios({ method: 'get', url: csvSource, responseType: 'stream' }).then(response => resolve(response.data));
        } else {
            resolve(fs.createReadStream(csvSource));
        }
    });
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


// --- Main Automation Function ---

async function startBot() {
    const csvSource = 'C:/Users/nas/Downloads/shopify videos song/meera1.csv';

    const tempDir = os.tmpdir();
    // No need to create os.tmpdir() as it already exists
    
    const processedHandles = await loadProgress();
    console.log(`📊 Tracker Loaded: ${processedHandles.size} products already uploaded.`);

    console.log("📂 Reading products from CSV...");
    const products = [];
    const stream = await getProductsStream(csvSource);
    
    await new Promise((resolve) => {
        stream.pipe(csv())
            .on('data', (row) => {
                if (row['Handle'] && row['Image Src'] && !processedHandles.has(row['Handle'])) {
                    if(row['Title']) {
                        products.push(row);
                    }
                }
            })
            .on('end', () => resolve());
    });

    console.log(`🎯 Total ${products.length} new products pending for upload.`);
    if (products.length === 0) {
        console.log("No new products found. Bot will exit.");
        return;
    }

    console.log("🚀 Starting browser session...");
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'],
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log("🍪 Injecting saved cookies...");
    await page.goto('https://www.pinterest.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    const cookieData = await fsPromises.readFile('./cookies/acc1.json', 'utf8');
    const cookies = JSON.parse(cookieData);
    
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

    // --- Loop Through Products ---
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const handle = product['Handle'];
        const destinationLink = `https://chainandstrap.store/products/${handle}`;
        const title = product['Title'];
        let rawDescription = product['SEO Description'] || product['Body (HTML)'] || product['Title'];
        const description = rawDescription.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 500);
        const imageUrl = product['Image Src'];
        
        console.log(`\n==============================================`);
        console.log(`[${i+1}/${products.length}] 🚀 Processing Product: ${title}`);
        console.log(`==============================================`);

        const tempImagePath = path.join(tempDir, `temp_${handle}.jpg`);
        const downloaded = await downloadImage(imageUrl, tempImagePath);
        if (!downloaded) {
            console.log("Skipping product due to image download failure.");
            continue;
        }

        console.log("Navigating to Pin Creation Tool...");
        await page.goto('https://www.pinterest.com/pin-creation-tool/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(r => setTimeout(r, 4000));

        try {
            // Upload Image
            const fileInput = await page.$('input[type="file"][accept*="image"]');
            if (fileInput) {
                await fileInput.uploadFile(tempImagePath);
                console.log("✅ Image attached.");
            } else {
                console.log("❌ Image upload field missing.");
                break; 
            }

            // WAIT FOR PREVIEW
            await new Promise(r => setTimeout(r, 4000));

            // ----- DOM INJECTION -----
            console.log("⚠️ Typing Title, Description, and Link...");
            
            // Title
            const titleSelector = '[data-test-id="pin-title"] textarea, input[placeholder*="title" i], textarea[placeholder*="title" i]';
            const titleEl = await page.$(titleSelector);
            if(titleEl) {
                await titleEl.click({clickCount: 3});
                await titleEl.type(title, {delay: 50});
                console.log("✅ Title typed.");
            } else {
                console.log("❌ Title field not found.");
            }

            // Description
            const descSelector = '[data-test-id="storyboard-description-field-container"] [contenteditable="true"], [data-test-id="storyboard-description-field-container"] textarea, div[data-test-id="pin-description-editor"] div[contenteditable="true"]';
            const descContainer = '[data-test-id="storyboard-description-field-container"]';
            
            let descEl = await page.$(descSelector);
            if(descEl) {
                await descEl.click({clickCount: 3});
                await descEl.type(description, {delay: 20});
                console.log("✅ Description typed.");
            } else {
                // Fallback: Click the container and type using keyboard
                const containerEl = await page.$(descContainer);
                if (containerEl) {
                    await containerEl.click();
                    await page.keyboard.type(description, {delay: 20});
                    console.log("✅ Description typed (via keyboard fallback).");
                } else {
                    console.log("❌ Description field not found.");
                }
            }

            // Link
            const linkSelector = '[data-test-id="pin-link"] input, input[placeholder*="link" i], textarea[placeholder*="link" i]';
            const linkEl = await page.$(linkSelector);
            if(linkEl) {
                await linkEl.click({clickCount: 3});
                await linkEl.type(destinationLink, {delay: 50});
                console.log("✅ Link typed.");
            } else {
                console.log("❌ Link field not found.");
            }

            // BOARD SELECTION
            console.log("⚠️ Selecting Board...");
            const boardName = determineBoardName(title);
            console.log(`📌 Target Board: ${boardName}`);
            
            try {
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
                    } else {
                        console.log(`✅ Selected existing board: ${boardName}`);
                    }
                } else {
                    console.log("❌ Board dropdown button not found.");
                }
            } catch(e) {
                console.log("❌ Error during board selection:", e.message);
            }

            // PUBLISH
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
                // Wait for the pin to be published
                await new Promise(r => setTimeout(r, 6000));
            } else {
                console.log("❌ Publish button not found. You may need to click it manually.");
            }

            console.log(`🎉 Product [${handle}] uploaded successfully!`);
            
            await saveProgress(handle, processedHandles);
            
            if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);

            await randomDelay(15000, 45000); 

        } catch (err) {
            console.error(`❌ Error uploading [${handle}]:`, err.message);
        }
    }

    console.log("✅ All new products processed!");
}

startBot();
