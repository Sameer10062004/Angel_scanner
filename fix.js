const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');
c = c.replace(/\u200B/g, '');
c = c.replace(/\u200C/g, '');
c = c.replace(/\u200D/g, '');
c = c.replace(/\uFEFF/g, '');
c = c.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
fs.writeFileSync('server.js', c);
console.log('Cleaned server.js');
