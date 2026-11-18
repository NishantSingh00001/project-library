const fs=require('fs');const path=require('path');const cur=require('./curated.js');const auto=JSON.parse(fs.readFileSync('auto.json','utf8'));
const locked=require('./locked.js');
let total=0;
const projects=cur.map(p=>{const a=auto[p.r];if(!a)throw new Error('no repo '+p.r);total+=a.loc;
  let readme=a.readme; if(readme.length>14000) readme=readme.slice(0,14000).replace(/\n[^\n]*$/,'')+'\n\n*The full write-up continues in the repository README.*';
  const ip='shots/'+p.id+'.webp';const img=fs.existsSync(ip)?'data:image/webp;base64,'+fs.readFileSync(ip).toString('base64'):'';
  return Object.assign({},p,{img,files:a.files,loc:a.loc,langs:a.langs,tree:a.tree,date:a.date,readme});});
const ids=new Set();projects.forEach(p=>{if(ids.has(p.id))throw new Error('dup '+p.id);ids.add(p.id)});
const template=fs.readFileSync('template.html','utf8');
function buildPage(list,totalLoc,outPath,locked,title){
  const data=JSON.stringify({projects:list,totalLoc,locked:!!locked}).replace(/</g,'\\u003c');
  let html=template.replace('/*DATA*/',()=>data);
  if(title)html=html.replace('<title>Nishant Singh Project Library</title>','<title>'+title+'</title>');
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  fs.writeFileSync(outPath,html);
  return html.length;
}
const mainHtmlLen=buildPage(projects,total,'../index.html');
console.log(projects.length,'projects',total,'loc',(mainHtmlLen/1024|0)+'KB');

/* ---------- locked role links: each one its own standalone page with ONLY
   the matching projects' data baked in — see locked.js ---------- */
function searchable(p){return (p.n+' '+p.k+' '+p.t+' '+(p.kw||[]).join(' ')+' '+p.s.join(' ')+' '+p.what+' '+p.how+' '+p.special+' '+p.diff).toLowerCase()}
function matchesRole(p,r){
  if(r.ids)return r.ids.indexOf(p.id)>-1;
  const text=searchable(p);
  if(r.cats&&r.cats.length&&r.cats.some(c=>p.c.indexOf(c)>-1))return true;
  if(r.kw&&r.kw.some(k=>text.indexOf(k)>-1))return true;
  if(r.techAll&&r.techAll.length&&r.techAll.every(re=>p.s.some(s=>re.test(s))))return true;
  if(r.techAny&&r.techAny.some(re=>p.s.some(s=>re.test(s))))return true;
  return false;
}
let lockedCount=0;
locked.forEach(function(r){
  const subset=projects.filter(function(p){return matchesRole(p,r)});
  if(!subset.length){console.log('  locked/'+r.slug+': 0 matches, skipped');return}
  // Give the subset its own spotlight ranks so the carousel is never empty,
  // keeping the relative order of any projects that already had a global rank.
  const ranked=subset.slice().sort(function(a,b){return (a.top||999)-(b.top||999)});
  const n=Math.min(ranked.length,7);
  const rankById={};ranked.slice(0,n).forEach(function(p,i){rankById[p.id]=i+1});
  const scoped=subset.map(function(p){const top=rankById[p.id];const q=Object.assign({},p);if(top)q.top=top;else delete q.top;return q});
  const subTotal=scoped.reduce(function(s,p){return s+(p.loc||0)},0);
  const outPath='../locked/'+r.slug+'-'+r.token+'.html';
  buildPage(scoped,subTotal,outPath,true,'Nishant Singh — Projects for '+r.label+' roles');
  lockedCount++;
  console.log('  locked/'+r.slug+'-'+r.token+'.html —',scoped.length,'projects');
});
console.log(lockedCount,'locked role pages built');
