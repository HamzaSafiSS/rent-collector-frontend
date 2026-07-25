const fs = require('fs');
const path = require('path');

const directories = [
  'src/pages/admin',
  'src/pages/super-admin',
  'src/pages/landlord',
  'src/pages/tenant'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove PortalLayout imports
  content = content.replace(/import\s+PortalLayout\s+from\s+['"][^'"]+['"];?\n?/g, '');
  
  // Remove NAV array definitions (including exports like export const LANDLORD_NAV = [...])
  // This regex matches `const NAV = [` or `export const TENANT_NAV = [` and goes until the closing `];`
  content = content.replace(/(?:export\s+)?const\s+[A-Z_]*NAV\s*=\s*\[[\s\S]*?\];\n?/g, '');
  
  // Remove imports for specific NAVs
  content = content.replace(/import\s+\{\s*[A-Z_]*NAV\s*\}\s+from\s+['"][^'"]+['"];?\n?/g, '');

  // Replace <PortalLayout ...> with <>
  content = content.replace(/<PortalLayout[^>]*>/g, '<>');
  
  // Replace </PortalLayout> with </>
  content = content.replace(/<\/PortalLayout>/g, '</>');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    walkDir(fullPath);
  }
});
