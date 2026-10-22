import json, os, re, subprocess, urllib.request, urllib.error, threading, time
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parent
DATA=ROOT/'data/projects.json'
LOCK=threading.Lock()
SKIP={'.git','node_modules','vendor','Library','Applications','Pictures','Music','Movies','Photos','.Trash','.cache','.npm','.local','.aws','.ssh','.config','.codex','.agents','venv','.venv','dist','build','target'}
def git(path,*args):
    try: return subprocess.check_output(['git','-C',str(path),*args],stderr=subprocess.DEVNULL,text=True,timeout=8).strip()
    except Exception: return ''
def read():
    return json.loads(DATA.read_text()) if DATA.exists() else []
def save(items):
    DATA.parent.mkdir(exist_ok=True); tmp=DATA.with_suffix('.tmp'); tmp.write_text(json.dumps(items,indent=2)); tmp.replace(DATA)
def repo_key(url):
    return url.lower().replace('git@github.com:','https://github.com/').removesuffix('.git').rstrip('/')
def issues(p):
    repo=repo_key(p.get('repo') or '')
    if not re.fullmatch(r'https://github\.com/[a-z0-9_.-]+/[a-z0-9_.-]+',repo):
        return {'issues':[], 'warning':'Add a valid GitHub repository in Edit details to view issues.'}
    headers={'User-Agent':'Fieldnotes','Accept':'application/vnd.github+json'}
    token=os.environ.get('GITHUB_TOKEN')
    if token: headers['Authorization']='Bearer '+token
    result={'issues':[], 'url':repo+'/issues', 'limited':False}
    try:
        req=urllib.request.Request(repo.replace('https://github.com/','https://api.github.com/repos/')+'/issues?state=open&sort=updated&direction=desc&per_page=100',headers=headers)
        with urllib.request.urlopen(req,timeout=15) as response: rows=json.load(response)
        result['limited']=len(rows)==100
        result['issues']=[{'number':r['number'],'title':r['title'],'url':repo+'/issues/'+str(r['number']),'labels':[l['name'] for l in r.get('labels',[])]} for r in rows if 'pull_request' not in r]
    except urllib.error.HTTPError as e:
        result['warning']={404:'Repository unavailable. Check its URL; private repositories require GITHUB_TOKEN access.',401:'GitHub authentication failed. Check the server’s GITHUB_TOKEN.',403:'GitHub denied this request or its API rate limit was reached. Try again later.',429:'GitHub’s API rate limit was reached. Try again later.'}.get(e.code,'GitHub issues are unavailable. Try again later.')
    except (urllib.error.URLError,TimeoutError,OSError,ValueError):
        result['warning']='Could not reach GitHub. Check your connection and retry.'
    return result
def discover():
    candidates={}
    for base,dirs,files in os.walk(Path.home()):
        dirs[:]=[d for d in dirs if d not in SKIP and not d.startswith('.') and not Path(base,d).is_symlink()]
        if len(Path(base).relative_to(Path.home()).parts)>5: dirs[:]=[]; continue
        if not (Path(base)/'.git').exists() and not any(f in files for f in ['package.json','pyproject.toml','Cargo.toml','go.mod']) and not any(d.endswith('.xcodeproj') for d in dirs): continue
        p=Path(base); remote=git(p,'remote','get-url','origin'); status=git(p,'status','--porcelain'); stamp=git(p,'log','-1','--format=%ct'); recent=bool(stamp and time.time()-int(stamp)<90*86400)
        reasons=[]
        if status: reasons.append('Uncommitted changes suggest unfinished work')
        if recent: reasons.append('Commit activity within 90 days')
        if not reasons: reasons.append('Local project found; no recent Git activity detected')
        key=repo_key(remote) if remote else str(p)
        if key in candidates: candidates[key].setdefault('otherPaths',[]).append(str(p)); continue
        candidates[key]={'title':p.name,'path':str(p),'repo':remote,'description':'','category':'personal','reasons':reasons,'recommended':bool(status or recent)}
    warning=''
    try:
        for page in range(1,11):
            req=urllib.request.Request(f'https://api.github.com/users/devness-portfolio/repos?per_page=100&page={page}',headers={'User-Agent':'Devness-Project-Dashboard'})
            repos=json.load(urllib.request.urlopen(req,timeout=20))
            for r in repos:
                key=repo_key(r['html_url'])
                if key in candidates:
                    candidates[key]['description']=r.get('description') or ''; continue
                from datetime import datetime, timezone
                recent=(datetime.now(timezone.utc)-datetime.fromisoformat(r['pushed_at'].replace('Z','+00:00'))).days<90
                candidates[key]={'title':r['name'],'description':r.get('description') or '', 'repo':r['html_url'],'path':'','category':'personal','recommended':recent and not r['archived'],'reasons':['GitHub activity within 90 days' if recent else 'No GitHub activity within 90 days']+(['Archived repository'] if r['archived'] else [])}
            if len(repos)<100: break
    except Exception as e: warning='GitHub discovery unavailable. Local results are available; retry when connected. '+str(e)
    return {'candidates':sorted(candidates.values(),key=lambda p:(not p['recommended'],p['title'].lower())),'warning':warning,'scope':'Public GitHub repositories and local projects, up to six folder levels deep.'}
def context(p):
    path=p.get('path'); result={'commits':[],'changes':'','handoff':''}
    if path and Path(path).is_dir():
        result['commits']=git(path,'log','-3','--format=%h %s').splitlines(); result['changes']=git(path,'status','--short')
        f=Path(path)/'.project-dashboard/handoff.md'
        if f.exists(): result['handoff']=f.read_text()[:30000]
    return result
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=str(ROOT/'web'),**k)
    def respond(self,obj,status=200):
        b=json.dumps(obj).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        try:
            if self.path=='/api/projects': return self.respond(read())
            if self.path=='/api/discover': return self.respond(discover())
            if self.path.startswith('/api/issues/'):
                p=next((p for p in read() if p['id']==self.path.rsplit('/',1)[1]),None)
                return self.respond(issues(p)) if p else self.respond({'error':'Project not found'},404)
            if self.path.startswith('/api/context/'):
                p=next(p for p in read() if p['id']==self.path.rsplit('/',1)[1]); return self.respond(context(p))
            return super().do_GET()
        except Exception as e: self.respond({'error':str(e)},500)
    def do_POST(self):
        if self.headers.get('Origin') and self.headers['Origin']!=f'http://{self.headers.get("Host")}': return self.respond({'error':'Origin rejected'},403)
        try:
            n=int(self.headers.get('Content-Length','0'))
            if n>2_000_000: raise ValueError('Request too large')
            body=json.loads(self.rfile.read(n))
            if self.path=='/api/projects':
                if not isinstance(body,list): raise ValueError('Expected projects list')
                with LOCK: save(body)
                return self.respond({'ok':True})
            self.respond({'error':'Unknown endpoint'},404)
        except Exception as e: self.respond({'error':str(e)},400)
if __name__=='__main__':
    server=ThreadingHTTPServer(('127.0.0.1',18765),Handler)
    print('Project dashboard: http://127.0.0.1:18765',flush=True)
    server.serve_forever()
