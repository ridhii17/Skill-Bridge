const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'Verification.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the template literal issue: text-[10px] inside ${} causes esbuild to choke
// Replace the specific problematic line
content = content.replace(
  /text-\[10px\]/g,
  'text-xs'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed. Verifying...');

const lines = content.split('\n');
if (lines[64] && lines[64].includes('text-[10px]')) {
  console.log('ERROR: Still has text-[10px] on line 65');
} else {
  console.log('OK: Line 65 is clean');
}
