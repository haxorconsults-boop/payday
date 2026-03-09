const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace IBC Credit with Payday
    content = content.replace(/IBC Credit/g, 'Payday');

    // Replace the specific brand icon spans with the img tag
    content = content.replace(/<span class="brand-icon"[^>]*>IC<\/span>/g, '<img src="/payday-logo.png" alt="Payday" class="brand-logo" />');
    content = content.replace(/<span class="brand-icon">IC<\/span>/g, '<img src="/payday-logo.png" alt="Payday" class="brand-logo" />');

    // Some specific cases in login/register/admin-login/employer-login where it's a div
    content = content.replace(/<div style="width: 60px; height: 60px; border-radius: 14px; background: linear-gradient[^>]*>IC<\/div>/g, '<img src="/payday-logo.png" alt="Payday" class="brand-logo-large" />');
    content = content.replace(/<div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient[^>]*>IC<\/div>/g, '<img src="/payday-logo.png" alt="Payday" class="brand-logo-large" />');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(directoryPath);

// Also do index.html and manifest.json
replaceInFile(path.join(__dirname, 'index.html'));
let manifestStr = fs.readFileSync(path.join(__dirname, 'public', 'manifest.json'), 'utf8');
manifestStr = manifestStr.replace(/IBC Credit/g, 'Payday');
fs.writeFileSync(path.join(__dirname, 'public', 'manifest.json'), manifestStr, 'utf8');
console.log('Updated manifest.json');
