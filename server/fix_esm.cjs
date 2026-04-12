const fs = require('fs');
const p = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = p.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) { 
      if (!fullPath.includes('node_modules')) {
        results = results.concat(walk(fullPath));
      }
    } else { 
      if (fullPath.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

// Target just folders containing the backend code
const dirsToFix = ['./controllers', './routes', './models', './middleware', './utils'];
let files = [];
dirsToFix.forEach(d => {
  if (fs.existsSync(d)) {
    files = files.concat(walk(d));
  }
});

let filesFixed = 0;

for (const file of files) {
  let initial = fs.readFileSync(file, 'utf8');
  let content = initial;
  
  // Replace const x = require('y') with import x from 'y'
  content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"].+?['"])\);?/g, 'import $1 from $2;');
  
  // Replace const { x, y } = require('z') with import { x, y } from 'z'
  content = content.replace(/const\s+(\{[\s\S]+?\})\s*=\s*require\((['"].+?['"])\);?/g, 'import $1 from $2;');

  // Replace module.exports = x; with export default x;
  content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);?/g, 'export default $1;');

  // Replace exports.foo = with export const foo =
  content = content.replace(/exports\.([a-zA-Z0-9_]+)\s*=/g, 'export const $1 =');

  // Add .js extension to internal relative imports if missing
  // Careful with regex here. It matches `from './file'` and turns it to `from './file.js'`
  content = content.replace(/from\s+(['"])([\.\/].+?)(['"])/g, (match, p1, p2, p3) => {
    if (!p2.endsWith('.js')) return `from ${p1}${p2}.js${p3}`;
    return match;
  });

  if (content !== initial) {
    fs.writeFileSync(file, content);
    filesFixed++;
    console.log('Fixed ESM transpilation for', file);
  }
}
console.log('Total files migrated to ES Modules:', filesFixed);
