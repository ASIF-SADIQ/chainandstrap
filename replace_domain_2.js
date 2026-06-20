const fs = require('fs');
const path = require('path');

function replaceInDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Ignore node_modules, .next, .git, and similar dirs
            if (!['node_modules', '.next', '.git', 'cookies', 'admin-panel/node_modules'].includes(entry.name)) {
                replaceInDirectory(fullPath);
            }
        } else {
            // Only process text files by checking extensions roughly
            if (fullPath.match(/\.(js|jsx|ts|tsx|py|html|css|json|env|md)$/) || entry.name === '.env') {
                try {
                    let content = fs.readFileSync(fullPath, 'utf8');
                    let updatedContent = content.replace(/chainandstraps\.com/g, 'chainandstrap.store');
                    
                    if (content !== updatedContent) {
                        fs.writeFileSync(fullPath, updatedContent, 'utf8');
                        console.log(`Updated ${fullPath}`);
                    }
                } catch (err) {
                    console.error(`Error reading ${fullPath}:`, err);
                }
            }
        }
    }
}

replaceInDirectory(__dirname);
