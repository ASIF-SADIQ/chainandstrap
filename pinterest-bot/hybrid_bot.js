const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const os = require('os');
puppeteer.use(StealthPlugin());

let envPath = path.join(__dirname, '../backend/.env');
if (!fs.existsSync(envPath)) {
    envPath = require('path').join(__dirname, '../html/backend/.env');
}
require('dotenv').config({ path: envPath });

let Product, PinterestAccount, connectDB;
try {
    Product = require('../backend/models/Product');
    PinterestAccount = require('../backend/models/PinterestAccount');
    connectDB = require('../backend/config/db');
} catch (e) {
    Product = require('../html/backend/models/Product');
    PinterestAccount = require('../html/backend/models/PinterestAccount');
    connectDB = require('../html/backend/config/db');
}

// --- Helpers ---
function randomDelay(min, max) {
    const time = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`⏳ Waiting for ${time / 1000} seconds...`);
    return new Promise(resolve => setTimeout(resolve, time));
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
    console.log(`📥 Downloading image for Browser Bot: ${finalUrl}`);
    try {
        const response = await axios({ url: finalUrl, method: 'GET', responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(imagePath);
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => { error = err; writer.close(); reject(err); });
            writer.on('close', () => { if (!error) resolve(true); });
        });
    } catch (e) {
        console.error(`❌ [BROWSER BOT] Image Download Error:`, e.message);
        return false;
    }
}

async function shortenUrl(longUrl) {
    try {
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, { timeout: 8000 });
        if (res.data && res.data.startsWith('http')) {
            console.log(`🔗 Short link: ${res.data}`);
            return res.data;
        }
    } catch(e) {
        console.log(`⚠️ TinyURL failed, using original link.`);
    }
    return longUrl; // fallback to original
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

async function getOrCreateBoardAPI(boardName, account) {
    // 1. Check MongoDB Cache first (0 API hits)
    const cachedBoard = account.boardsCache.find(b => b.boardName.toLowerCase() === boardName.toLowerCase());
    if (cachedBoard) {
        console.log(`🎯 Found board [${boardName}] in MongoDB Cache (ID: ${cachedBoard.boardId})`);
        return cachedBoard.boardId;
    }

    try {
        console.log(`📡 Board not in cache. Checking Pinterest API for [${boardName}]...`);
        // 2. Check Pinterest API
        const currentBoards = await axios.get("https://api.pinterest.com/v5/boards", {
            headers: { "Authorization": `Bearer ${account.accessToken}` }
        });

        const existingBoard = currentBoards.data.items.find(b => b.name.toLowerCase() === boardName.toLowerCase());
        
        let targetBoardId = null;

        if (existingBoard) {
            console.log(`🎯 Board exists on Pinterest. Caching it locally...`);
            targetBoardId = existingBoard.id;
        } else {
            // 3. Create NEW Board
            console.log(`🛠️ Creating NEW board on Pinterest: ${boardName}...`);
            const createResponse = await axios.post("https://api.pinterest.com/v5/boards", 
            { name: boardName, description: `Premium collection of ${boardName}`, privacy: "PUBLIC" },
            { headers: { "Authorization": `Bearer ${account.accessToken}`, "Content-Type": "application/json" }});
            
            targetBoardId = createResponse.data.id;
            console.log(`✅ Naya Board Ban Gaya: ${boardName} (ID: ${targetBoardId})`);
        }

        // Cache it in MongoDB
        account.boardsCache.push({ boardName: boardName, boardId: targetBoardId });
        await account.save();

        return targetBoardId;
    } catch (error) {
        console.error("❌ Board check/create error:", error.response?.data || error.message);
        return null;
    }
}

// --- Bot Actions ---

async function postViaAPI(account, product) {
    console.log(`🚀 [API BOT] Posting to Pinterest API for ${account.accountName}...`);
    try {
        const boardName = determineBoardName(product.Title || product.Handle);
        const targetBoardId = await getOrCreateBoardAPI(boardName, account);
        
        if (!targetBoardId) {
            console.log("❌ Failed to get board ID. Skipping product.");
            return false;
        }

        const destinationLink = `https://chainandstrap.store/product/${product.Handle}`;
        const payload = {
            title: product.Title || product.Handle,
            description: (product['Body (HTML)'] || '').replace(/<[^>]*>?/gm, '').slice(0, 499),
            link: destinationLink,
            board_id: targetBoardId,
            media_source: {
                source_type: "image_url",
                url: product['Image Src'].split(',')[0]
            }
        };

        const response = await axios.post('https://api.pinterest.com/v5/pins', payload, {
            headers: { 'Authorization': `Bearer ${account.accessToken}`, 'Content-Type': 'application/json' }
        });

        console.log(`✅ [API BOT] Success! Pin ID: ${response.data.id} in Board: ${boardName}`);
        return true;
    } catch (error) {
        console.error(`❌ [API BOT] Failed:`, error.response?.data || error.message);
        return false;
    }
}

async function postViaBrowser(account, product) {
    console.log(`🚀 [BROWSER BOT] Launching Headless Chrome for ${account.accountName}...`);
    
    const cookiePath = path.join(__dirname, 'cookies', account.cookieFile);
    if (!fs.existsSync(cookiePath)) {
        console.error(`❌ Cookie file missing: ${cookiePath}`);
        return false;
    }

    const tempDir = os.tmpdir();
    const tempImagePath = path.join(tempDir, `temp_${product.Handle}.jpg`);
    const imageUrl = product['Image Src'].split(',')[0].trim();
    
    const downloaded = await downloadImage(imageUrl, tempImagePath);
    if (!downloaded) return false;

    // Temporarily disable proxy for local visual testing
    let args = ['--no-sandbox'];
    /*
    if (account.proxyAddress && account.proxyPort) {
        args.push(`--proxy-server=http://${account.proxyAddress}:${account.proxyPort}`);
    } else {
        args.push('--proxy-server=http://38.154.203.95:5863');
    }
    */

    const browser = await puppeteer.launch({ 
        headless: false, // Changed from 'new' to false so you can see it locally
        channel: 'chrome',
        args: args
    });
    try {
        const page = await browser.newPage();
        const pUser = account.proxyUsername || 'seuiirde';
        const pPass = account.proxyPassword || '3xt40ntb79wf';
        await page.authenticate({ username: pUser, password: pPass });
        await page.setViewport({ width: 1366, height: 768 });

        const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
        await page.goto('https://www.pinterest.com/', { waitUntil: 'domcontentloaded' });
        
        for (const cookie of cookies) {
            let sameSiteStr = undefined;
            if (cookie.sameSite === 'lax') sameSiteStr = 'Lax';
            else if (cookie.sameSite === 'strict') sameSiteStr = 'Strict';
            else if (cookie.sameSite === 'no_restriction') sameSiteStr = 'None';
            const cleanCookie = { name: cookie.name, value: cookie.value, domain: cookie.domain, path: cookie.path || '/' };
            if (sameSiteStr) cleanCookie.sameSite = sameSiteStr;
            try { await page.setCookie(cleanCookie); } catch (err) {}
        }

        console.log("Navigating to Pin Creation Tool...");
        await page.goto('https://www.pinterest.com/pin-creation-tool/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(r => setTimeout(r, 8000)); // Increased from 4s to 8s to allow React to fully render the page

        const fileInput = await page.$('input[type="file"]');
        if (fileInput) await fileInput.uploadFile(tempImagePath);
        else {
            await page.screenshot({path: 'error_upload.png', fullPage: true});
            throw new Error("Image upload field missing. Screenshot saved as error_upload.png");
        }
        await new Promise(r => setTimeout(r, 3000));

        const title = product.Title || product.Handle;
        const description = (product['Body (HTML)'] || '').replace(/<[^>]*>?/gm, '').slice(0, 499);
        const destinationLink = `https://chainandstrap.store/product/${product.Handle}`;

        // Type Title Robustly
        const titleLabelClicked = await page.evaluate(() => {
            const xpath = '//*[contains(text(), "Tell everyone what your Pin is about") or contains(text(), "Add a title")]';
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const node = result.singleNodeValue;
            if (node) {
                node.click();
                return true;
            }
            return false;
        });

        if (titleLabelClicked) {
            await new Promise(r => setTimeout(r, 500));
            // Clear just in case
            await page.keyboard.down('Control');
            await page.keyboard.press('A');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            
            await page.keyboard.type(title, {delay: 50});
        } else {
            console.log("⚠️ Could not find Title label. Trying fallback...");
            await page.evaluate((val) => {
                const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
                if (inputs.length > 0) {
                    inputs[0].focus();
                    document.execCommand('insertText', false, val);
                }
            }, title);
        }
        
        // Type Description
        const descSelector = '[data-test-id="storyboard-description-field-container"] [contenteditable="true"]';
        let descEl = await page.$(descSelector);
        if(descEl) {
            await descEl.click({clickCount: 3});
            await descEl.type(description, {delay: 20});
        }

        const longUrl = `https://chainandstrap.store/product/${product.Handle}`;
        const destinationLink = await shortenUrl(longUrl);
        console.log(`🔗 Using link: ${destinationLink}`);

        // Type Link
        await page.evaluate((url) => {
            const inputs = Array.from(document.querySelectorAll('input[type="url"], input[placeholder*="link" i], textarea[placeholder*="link" i], [id*="link" i] input'));
            for (let inp of inputs) {
                if (inp.offsetParent !== null) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value') ?
                        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set : null;
                    if (nativeInputValueSetter) nativeInputValueSetter.call(inp, url);
                    else inp.value = url;
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }, destinationLink);
        await new Promise(r => setTimeout(r, 1000));

        // --- Dynamic Board Provisioning via UI ---
        const boardName = 'Luxury Bags'; // Always use Luxury Bags
        console.log(`📌 Target Board: ${boardName}`);
        
        const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
        if (boardBtn) {
            await boardBtn.click();
            await new Promise(r => setTimeout(r, 2500));
            
            // Type the board name to filter the list
            await page.keyboard.type(boardName, {delay: 80});
            await new Promise(r => setTimeout(r, 2500)); // Wait for Pinterest to show filtered results
            
            // Get coordinates of first result item and click it with mouse
            const firstItemBox = await page.evaluate(() => {
                // Pinterest renders board list items in a scrollable container
                const items = Array.from(document.querySelectorAll('[data-test-id="board-row"], [role="option"], [role="listitem"]'));
                if (items.length > 0) {
                    const rect = items[0].getBoundingClientRect();
                    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                }
                // Fallback: look for any visible clickable element containing our board name
                const allDivs = Array.from(document.querySelectorAll('div[role="button"], li, div'));
                for (let d of allDivs) {
                    if (d.innerText && d.innerText.trim() === 'Luxury Bags' && d.offsetWidth > 0) {
                        const rect = d.getBoundingClientRect();
                        if (rect.top > 100 && rect.height > 10) { // Make sure it's a real visible item
                            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                        }
                    }
                }
                return null;
            });

            if (firstItemBox) {
                console.log(`✅ Found board option at (${Math.round(firstItemBox.x)}, ${Math.round(firstItemBox.y)}), clicking...`);
                await page.mouse.click(firstItemBox.x, firstItemBox.y);
                await new Promise(r => setTimeout(r, 1500));
            } else {
                console.log('⚠️ Board item not found in dropdown, pressing Enter as fallback...');
                await page.keyboard.press('Enter');
                await new Promise(r => setTimeout(r, 1500));
            }
        }

        console.log("⚠️ Clicking Publish button...");
        await new Promise(r => setTimeout(r, 2000));
        
        let clicked = false;
        const publishBox = await page.evaluate(() => {
            const specificButtons = document.querySelectorAll('[data-test-id="board-dropdown-save-button"], [data-test-id="pin-builder-save"], [data-test-id="save-pin-button"]');
            for (let btn of specificButtons) {
                if (!btn.disabled && btn.offsetWidth > 0) { 
                    const rect = btn.getBoundingClientRect();
                    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                }
            }
            
            // Fallback: look for button with text Save or Publish
            const allButtons = Array.from(document.querySelectorAll('button, div[role="button"]'));
            for (let btn of allButtons) {
                const text = btn.innerText ? btn.innerText.trim().toLowerCase() : '';
                if ((text === 'publish' || text === 'save') && !btn.disabled && btn.offsetWidth > 0) {
                    const rect = btn.getBoundingClientRect();
                    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                }
            }
            return null;
        });

        if (publishBox) {
            await page.mouse.click(publishBox.x, publishBox.y);
            clicked = true;
        }

        if(clicked) {
            console.log(`⏳ Waiting for Pinterest to finish uploading and saving...`);
            await new Promise(r => setTimeout(r, 15000)); // Increased wait time to 15 seconds
            console.log(`🎉 [BROWSER BOT] Pin published successfully in ${boardName}!`);
            return true;
        } else {
            await page.screenshot({path: 'error_publish.png', fullPage: true});
            console.log("❌ Publish button not found. Screenshot saved as error_publish.png");
            return false;
        }
    } catch (error) {
        console.error(`❌ [BROWSER BOT] Error:`, error.message);
        return false;
    } finally {
        await browser.close();
        if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
    }
}

// --- Main Engine ---

async function runHybridEngine() {
    console.log("🔌 Connecting to MongoDB...");
    await connectDB();
    
    while (true) {
        try {
            const account = await PinterestAccount.findOne({ 
                isActive: true,
                botType: 'BROWSER', // 🛡️ Force only BROWSER accounts
                $expr: { $lt: ["$postsDoneToday", "$dailyPostLimit"] }
            }).sort({ lastUsed: 1 });

            if (!account) {
                console.log("⚠️ Sab accounts ki limit poori ho chuki hai! Sleeping for 1 hour...");
                await randomDelay(3600000, 3600000);
                await PinterestAccount.updateMany({}, { postsDoneToday: 0 });
                continue;
            }

            console.log(`\n==============================================`);
            console.log(`👤 Active Account: [${account.accountName}] | Type: ${account.botType}`);

            const product = await Product.findOne({
                isDeleted: false,
                isBroken: { $ne: true }, // 🛡️ Bypass permanently broken products
                'Image Src': { $exists: true, $ne: null },
                pinterestPostCount: { $lt: 1 }, // 🛡️ Ensure product has NEVER been posted on ANY account
                failedOnAccounts: { $ne: account._id } // 🛡️ Bypass products that failed on THIS account
            });

            if (!product) {
                console.log(`⚠️ Naya product nahi bacha. Bot 1 minute ke liye sleep mode mein ja raha hai...`);
                account.lastUsed = new Date();
                await account.save();
                await randomDelay(60000, 60000); // 1 minute wait
                continue;
            }

            console.log(`📦 Found Product: ${product.Title || product.Handle}`);

            let success = false;
            if (account.botType === 'API') {
                success = await postViaAPI(account, product);
            } else if (account.botType === 'BROWSER') {
                success = await postViaBrowser(account, product);
            }

            if (success) {
                product.postedOnAccounts.push(account._id);
                product.pinterestPostCount += 1;
                await product.save();

                account.postsDoneToday += 1;
                account.lastUsed = new Date();
                await account.save();
                console.log(`✅ Database records updated.`);
                
                // Normal post ke baad 3-5 minute ka delay
                await randomDelay(180000, 300000);
            } else {
                console.log(`❌ Failed to post. Applying Anti-Trap Strike Logic...`);
                
                // 🛡️ Track Failure
                product.failedOnAccounts.push(account._id);
                product.failureCount = (product.failureCount || 0) + 1;
                
                if (product.failureCount >= 3) {
                    console.log(`🚨 Strike 3! Product failed multiple times. Marking as globally BROKEN.`);
                    product.isBroken = true;
                }
                await product.save();

                await product.save();

                account.lastUsed = new Date();
                await account.save();
                
                // Failure ke case mein sirf 5-10 second ka delay taake bot tezi se agay barhay
                await randomDelay(5000, 10000);
            }

        } catch (error) {
            console.error("❌ Fatal Error in Engine:", error);
        }

        // Agar account successfully process hua (ya bot limits mein hai), toh normal lamba delay.
        // Yeh delay line upar chali gayi.
    }
}

runHybridEngine();
