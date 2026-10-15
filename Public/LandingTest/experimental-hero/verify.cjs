/* LIFT Experimental Hero — meaningful isolation and playback lifecycle checks. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const preview=path.resolve(__dirname,'..'),project=path.resolve(preview,'../..');
const html=fs.readFileSync(path.join(preview,'index.html'),'utf8'),source=fs.readFileSync(path.join(__dirname,'lift-experimental-hero.js'),'utf8');
const protectedFiles=JSON.parse(fs.readFileSync(path.join(__dirname,'protected-files.json'),'utf8'));
for(const [p,expected] of Object.entries(protectedFiles))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(project,p))).digest('hex'),expected,'Protected file modified: '+p);
assert.ok(!/src="(?:world|story|model|vendor\/three.min)\.js"/.test(html));
assert.ok(!/data-open=|data-stage=|id="details"|id="replay-intro"/.test(html));
assert.ok(!/localStorage|sessionStorage|fetch\(|XMLHttpRequest|pointermove|mousemove|addEventListener\(['"](?:click|pointer|touch|keydown)/.test(source));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(m[1].startsWith('#'))assert.ok(ids.includes(m[1].slice(1)));else assert.ok(fs.existsSync(path.resolve(preview,m[1])),'Local asset/link '+m[1]);}
const original=fs.readFileSync(path.join(project,'Public/LandingPage/landing-page.html'),'utf8');
assert.deepEqual([...html.matchAll(/data-site-copy="([^"]+)"/g)].map(m=>m[1]).sort(),[...original.matchAll(/data-site-copy="([^"]+)"/g)].map(m=>m[1]).sort());
const composition=JSON.parse(fs.readFileSync(path.join(__dirname,'pre-opening-composition.json'),'utf8'));
const normalized=html.replace(/    <!-- LIFT Opening Intro: START -->[\s\S]*?<!-- LIFT Opening Intro: END -->\r?\n/,'').replace(/  <link rel="stylesheet" href="experimental-hero\/lift-opening-intro.css">\r?\n/,'').replace(/  <script src="experimental-hero\/lift-opening-intro.js" defer><\/script>\r?\n/,'').replace(/\s+/g,' ').trim();
assert.equal(crypto.createHash('sha256').update(normalized).digest('hex'),composition.html,'Existing HTML composition preserved exactly apart from opening additions');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'lift-experimental-hero.css'))).digest('hex'),composition.css,'Existing hero CSS is unchanged');
class El {
  constructor(){this.style={};this.dataset={};this.children=[];this.events={};this.hidden=false;this.clientWidth=880;this.clientHeight=715;}
  append(...els){this.children.push(...els);}replaceChildren(){this.children=[];}setAttribute(){}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}removeEventListener(k,fn){this.events[k]=(this.events[k]||[]).filter(x=>x!==fn);}emit(k){for(const fn of this.events[k]||[])fn();}
}
const stage=new El(),globe=new El(),portrait=new El(),headline=new El(),kicker=new El(),steps=Array.from({length:4},()=>new El()),root=new El();
root.querySelector=s=>({'.lxh__stage':stage,'.lxh__globe':globe,'.lxh__portrait img':portrait,'[data-lxh-headline]':headline,'[data-lxh-kicker]':kicker}[s]);root.querySelectorAll=()=>steps;
const doc=new El();doc.querySelector=()=>root;doc.createElement=()=>new El();doc.currentScript={src:'file:///'+path.join(__dirname,'lift-experimental-hero.js').replaceAll('\\','/')};
const reduced=new El(),compact=new El();reduced.matches=compact.matches=false;
const win=new El(),queue=new Map();let rid=0,intersection,resize;
const sandbox={document:doc,window:win,URL,console,matchMedia:q=>q.includes('reduced')?reduced:compact,requestAnimationFrame:fn=>{queue.set(++rid,fn);return rid;},cancelAnimationFrame:id=>queue.delete(id),ResizeObserver:class{constructor(fn){resize=fn;}observe(){}disconnect(){}},IntersectionObserver:class{constructor(fn){intersection=fn;}observe(){}disconnect(){}}};
root.dataset.lxhOpening='pending';
vm.runInNewContext(source,sandbox);
assert.equal(queue.size,0,'Existing sphere waits while opening is pending');
root.dataset.lxhOpening='revealing';root.emit('lift-experimental-intro:reveal');
assert.equal(globe.children.length,28);assert.equal(queue.size,1);
const assets=new Set();for(const tile of globe.children){const file=new URL(tile.children[0].src).pathname.replace(/^\//,'');assert.ok(fs.existsSync(file));assets.add(file);assert.equal(fs.readFileSync(file)[0],255,'JPEG asset');}
let frames=0;function frame(now){const pending=[...queue.values()];queue.clear();for(const fn of pending)fn(now);assert.ok(queue.size<=1,'Single animation loop');for(const tile of globe.children){assert.ok(!/NaN|Infinity/.test(tile.style.transform));assert.ok(+tile.style.opacity>=0&&+tile.style.opacity<=1);}frames++;}
for(let i=0;i<900;i++)frame(100+i*34);assert.ok(headline.textContent.length>0);
intersection([{isIntersecting:false}]);assert.equal(queue.size,0);intersection([{isIntersecting:true}]);assert.equal(queue.size,1);
doc.hidden=true;doc.emit('visibilitychange');assert.equal(queue.size,0);doc.hidden=false;doc.emit('visibilitychange');assert.equal(queue.size,1);
reduced.matches=true;reduced.emit('change');assert.equal(queue.size,0);assert.equal(headline.textContent,'One life. A plan built around it.');
compact.matches=true;stage.clientWidth=360;stage.clientHeight=540;compact.emit('change');assert.equal(globe.children.length,15);assert.equal(queue.size,0);
reduced.matches=false;reduced.emit('change');for(let i=0;i<60;i++)frame(40000+i*34);
const failed=globe.children[0];failed.children[0].emit('error');assert.equal(failed.hidden,true);
root.emit('lift-experimental-hero:destroy');assert.equal(queue.size,0);assert.equal(globe.children.length,0);
const total=[...assets].reduce((n,file)=>n+fs.statSync(file).size,0)+fs.statSync(path.join(__dirname,'assets/runner.jpg')).size;
console.log(`PASS: ${Object.keys(protectedFiles).length} protected files unchanged; preserved copy hooks and links; ${frames} finite animation frames; 28/15 responsive photo planes; reduced motion; offscreen/background pause; image-error handling; teardown; no input handlers or application state.`);
console.log(`Active photographic assets: ${(total/1024).toFixed(0)} KB. DOM simulation only: browser pixels and actual frame rates are not verified.`);
require('./verify-opening.cjs');
