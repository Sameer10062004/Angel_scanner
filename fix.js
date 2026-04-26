const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');
c = c.replace(/[^\x00-\x7F]/g, '');
fs.writeFileSync('server.js', c);
