const fs = require('fs');
const path = require('path');

function replaceInDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Ignore heavy/binary/dependency directories
            if (!['node_modules', '.next', '.git', 'cookies', 'admin-panel/node_modules', 'dist', 'build', '.cache'].includes(entry.name)) {
                replaceInDirectory(fullPath);
            }
        } else {
            // Process text files by matching extensions
            if (fullPath.match(/\.(js|jsx|ts|tsx|py|html|css|json|env|md)$/) || entry.name === '.env') {
                try {
                    let content = fs.readFileSync(fullPath, 'utf8');
                    let updatedContent = content
                        .replace(/chainandstrap\.com/g, 'chainandstrap.store')
                        .replace(/chainandstraps\.com/g, 'chainandstrap.store')
                        .replace(/chainandstraps\.live/g, 'chainandstrap.store');
                    
                    if (content !== updatedContent) {
                        fs.writeFileSync(fullPath, updatedContent, 'utf8');
                        console.log(`Updated: ${fullPath}`);
                    }
                } catch (err) {
                    console.error(`Error reading/writing ${fullPath}:`, err);
                }
            }
        }
    }
}

console.log("🚀 Starting domain migration to chainandstrap.store...");
replaceInDirectory(__dirname);
console.log("✅ Domain migration complete!");
