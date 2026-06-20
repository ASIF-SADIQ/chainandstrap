const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'backend/.env',
    'pinterest-bot/bot.js',
    'backend/test_live.js',
    'backend/test_live_api.js',
    'backend/test_live_products.js',
    'backend/test_proxy_api.js',
    'backend/test_live_images.js',
    'backend/test_domain.js',
    'backend/services/emailService.js',
    'backend/controllers/catalogController.js'
];

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const updatedContent = content.replace(/chainandstraps\.live/g, 'chainandstrap.store');
        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`Updated ${file}`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});
