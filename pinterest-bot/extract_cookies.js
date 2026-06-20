const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;

puppeteer.use(StealthPlugin());

async function extractCookies() {
    console.log("🚀 Starting Cookie Extractor...");
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--no-sandbox'],
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 1. Go to Pinterest Login Page
    await page.goto('https://www.pinterest.com/login/', { waitUntil: 'domcontentloaded' });
    
    console.log("\n==================================================");
    console.log("🕒 Browser khul gaya hai! PINTEREST PAR MANUALLY LOGIN KAREIN...");
    console.log("Aap login karein, agar verification ya OTP aaye toh wo bhi complete karein.");
    console.log("==================================================\n");

    // Interactive wait using readline
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    await new Promise(resolve => {
        rl.question("👉 Jab aap fully login ho jayein aur dashboard dikhne lage, tab yahan ENTER press karein...", () => {
            rl.close();
            resolve();
        });
    });

    console.log("\nCapturing fresh cookies...");

    // 3. Extract 100% pure stealth cookies directly from Puppeteer
    const cookies = await page.cookies();
    
    // 4. Save to acc1.json
    await fs.writeFile('./cookies/acc1.json', JSON.stringify(cookies, null, 2));
    
    console.log(`✅ SUCCESS! ${cookies.length} pure cookies saved to acc1.json!`);
    console.log("Ab aapka bot GitHub Actions par bhi smoothly chalega. Browser band ho raha hai...");
    
    await browser.close();
}

extractCookies();
