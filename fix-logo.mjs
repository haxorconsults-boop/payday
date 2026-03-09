import fs from 'fs';
import path from 'path';

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('/payday-logo.png')) {
                content = content.replace(/\/payday-logo.png/g, './payday-logo.png');
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

replaceInDir('./src');
