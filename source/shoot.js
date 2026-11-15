const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('/opt/npm-tools/node_modules/playwright-core');
const cur=require('./curated.js');const R='/home/claude/repos';
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.bin':'application/octet-stream','.wasm':'application/wasm'};
function serve(root){return new Promise(res=>{const s=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.startsWith('/api/')){r.writeHead(503,{'content-type':'application/json'});return r.end('{"error":"offline"}')}
  let f=path.join(root,u);if(!f.startsWith(root))f=root;
  const tryf=[f,f+'.html',path.join(f,'index.html'),path.join(root,'index.html')];
  for(const t of tryf){if(fs.existsSync(t)&&fs.statSync(t).isFile()){r.writeHead(200,{'content-type':MIME[path.extname(t)]||'application/octet-stream'});return fs.createReadStream(t).pipe(r)}}
  r.writeHead(404);r.end()}).listen(0,()=>res(s))})}
(async()=>{const only=process.argv.slice(2);
const b=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const list=cur.filter(p=>p.id!=='tf-digits'&&(!only.length||only.includes(p.id)));
let i=0;async function worker(){while(i<list.length){const p=list[i++];let root=path.join(R,p.r);if(fs.existsSync(path.join(root,'dist/index.html')))root=path.join(root,'dist');
  const s=await serve(root);const pg=await b.newPage({viewport:{width:1440,height:810},colorScheme:'dark'});
  try{await pg.goto('http://localhost:'+s.address().port+'/',{waitUntil:'load',timeout:20000}).catch(()=>{});await pg.waitForTimeout(5000);await pg.screenshot({path:'shots/'+p.id+'.png'});console.log('ok',p.id)}catch(e){console.log('FAIL',p.id,e.message.slice(0,80))}
  await pg.close();s.close()}}
await Promise.all([worker(),worker(),worker(),worker()]);await b.close()})();
