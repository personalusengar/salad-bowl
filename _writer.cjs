const fs = require('fs');
const content = fs.readFileSync('_app_new.tsx', 'utf8');
fs.writeFileSync('src/app.tsx', content);
console.log('Written ' + content.length + ' chars');
