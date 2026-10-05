import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2]);
const port = Number(process.argv[3] || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.xml':'application/xml; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf'};
http.createServer((req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target = path.resolve(root,'.' + pathname);
    if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target,'index.html');
    if (!fs.existsSync(target)) { res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}); res.end(fs.readFileSync(path.join(root,'404.html'))); return; }
    res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(target).pipe(res);
  } catch { res.writeHead(400).end(); }
}).listen(port,'127.0.0.1',() => console.log('Preview ready at http://127.0.0.1:' + port));
