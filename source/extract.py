import os,re,json,subprocess,sys,collections
R='/home/claude/repos'
EXT={'.js':'JavaScript','.jsx':'JavaScript','.mjs':'JavaScript','.ts':'TypeScript','.tsx':'TypeScript','.html':'HTML','.css':'CSS','.py':'Python','.java':'Java','.sql':'SQL','.ipynb':'Jupyter','.json':'JSON','.md':'Markdown','.toml':'Config','.yml':'Config','.yaml':'Config','.go':'Go'}
SKIP=('three.min.js','package-lock.json','.min.js','.bundle.js','.woff2','.png','.jpg','.jpeg','.webp','.svg','.ico','.pdf','.mp4','.bin','.gif')
out={}
for r in sorted(os.listdir(R)):
    p=os.path.join(R,r)
    files=subprocess.run(['git','-C',p,'ls-files'],capture_output=True,text=True).stdout.split('\n')
    files=[f for f in files if f]
    date=subprocess.run(['git','-C',p,'log','-1','--format=%cs'],capture_output=True,text=True).stdout.strip()
    loc=collections.Counter(); total=0
    for f in files:
        e=os.path.splitext(f)[1].lower()
        if any(f.endswith(s) for s in SKIP) or e not in EXT or EXT[e] in('JSON','Markdown','Config'): continue
        try: n=sum(1 for _ in open(os.path.join(p,f),errors='ignore'))
        except: n=0
        loc[EXT[e]]+=n; total+=n
    # tree: depth<=3, collapse big dirs
    tree=collections.OrderedDict()
    dirs=collections.Counter()
    for f in files:
        parts=f.split('/')
        for d in range(1,len(parts)): dirs['/'.join(parts[:d])]+=1
    lines=[]
    def walk(prefix,depth):
        kids=collections.OrderedDict()
        for f in files:
            if prefix and not f.startswith(prefix+'/'): continue
            rest=f[len(prefix)+1:] if prefix else f
            k=rest.split('/')[0]
            kids[k]= '/' in rest
        names=sorted(kids,key=lambda k:(not kids[k],k.lower()))
        shown=0
        for k in names:
            full=(prefix+'/'+k) if prefix else k
            ind='  '*depth
            if kids[k]:
                n=dirs[full]
                if depth>=2 or n>14 or k in('assets','public','fonts','icons','images','img','node_modules'):
                    lines.append(f'{ind}{k}/  ({n} files)')
                else:
                    lines.append(f'{ind}{k}/'); walk(full,depth+1)
            else:
                shown+=1
                if shown>12 and depth>0:
                    lines.append(f'{ind}… {sum(1 for x in names if not kids[x])-12} more'); break
                lines.append(f'{ind}{k}')
    walk('',0)
    lines=lines[:60]
    # colors
    cols=[]
    for f in files:
        if f.endswith('.css') or f.endswith('.html'):
            try: t=open(os.path.join(p,f),errors='ignore').read()
            except: continue
            for m in re.finditer(r'--(?:acc\w*|accent\w*|brand\w*|primary\w*|a1|a2|hot|glow)\s*:\s*(#[0-9a-fA-F]{6})\b',t):
                c=m.group(1).lower()
                if c not in cols: cols.append(c)
    md=''
    rp=os.path.join(p,'README.md')
    if os.path.exists(rp):
        md=open(rp,errors='ignore').read()
        md=re.sub(r'!\[[^\]]*\]\([^)]*\)','',md); md=re.sub(r'<img[^>]*>','',md); md=re.sub(r'</?(p|div|br|a|h\d|picture|source)[^>]*>','',md)
        md=re.sub(r'\n{3,}','\n\n',md).strip()
    out[r]={'files':len(files),'loc':total,'langs':loc.most_common(5),'tree':'\n'.join(lines),'colors':cols[:4],'date':date,'readme':md}
json.dump(out,open('/home/claude/site/auto.json','w'))
for r,v in out.items(): print(r,v['files'],v['loc'],v['langs'][:3],v['colors'][:3],v['date'])
