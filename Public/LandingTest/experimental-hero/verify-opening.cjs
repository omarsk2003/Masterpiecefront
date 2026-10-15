/* LIFT Experimental Cinematic Intro — opening timing, fallback and lifecycle checks. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'lift-opening-intro.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.ok(html.includes('data-src="experimental-hero/assets/opening-card.mp4"'));
assert.ok(html.includes('poster="experimental-hero/assets/opening-poster.jpg"'));
assert.ok(html.includes('data-opening-scene="prepare-move"'));
assert.ok(html.includes('data-story-card="fuel"')&&html.includes('data-story-card="recover"'));
assert.ok(html.includes('data-opening-adaptation')&&html.includes('data-opening-progress'));
assert.ok(!html.includes('neural-brain.png')&&!html.includes('opening-eye.mp4'));
function fixture(reduce=false){
  class El{constructor(){this.events={};this.dataset={};this.style={setProperty(k,v){this[k]=v;}};this.paused=true;this.currentTime=0;}addEventListener(k,f){(this.events[k]??=[]).push(f);}removeEventListener(k,f){this.events[k]=(this.events[k]||[]).filter(v=>v!==f);}dispatchEvent(e){for(const f of this.events[e.type]||[])f(e);}emit(k){this.dispatchEvent({type:k});}}
  const root=new El(),layer=new El(),video=new El(),doc=new El(),win=new El(),reduced=new El(),timers=new Map();let tid=0,observer,reveals=0,loads=0,plays=0;
  video.dataset.src='assets/opening-card.mp4';video.pause=()=>{video.paused=true;};video.load=()=>loads++;video.play=()=>{plays++;video.paused=false;return {catch(fn){video.reject=fn;}};};
  root.querySelector=s=>s==='[data-lxh-opening-layer]'?layer:s==='[data-lxh-opening-video]'?video:root;layer.querySelector=s=>s==='[data-opening-caption]'||s==='[data-opening-title]'?new El():null;doc.querySelector=()=>root;reduced.matches=reduce;
  root.addEventListener('lift-experimental-intro:reveal',()=>reveals++);
  const context={document:doc,window:win,requestAnimationFrame:()=>1,cancelAnimationFrame(){},Event:class{constructor(type){this.type=type;}},matchMedia:()=>reduced,setTimeout:(fn,ms)=>{timers.set(++tid,{fn,ms});return tid;},clearTimeout:id=>timers.delete(id),IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}disconnect(){}}};
  vm.runInNewContext(source,context);
  return {root,layer,video,doc,win,reduced,timers,get reveals(){return reveals;},get loads(){return loads;},get plays(){return plays;},show:visible=>observer([{isIntersecting:visible}]),fire(ms){for(const [id,t] of [...timers])if(t.ms===ms){timers.delete(id);t.fn();}}};
}
let f=fixture();assert.equal(f.root.dataset.lxhOpening,'pending');assert.equal(f.loads,0,'No video download before visibility');f.show(true);assert.equal(f.loads,1);assert.ok(f.video.muted&&f.video.playsInline);f.video.emit('playing');assert.equal(f.root.dataset.lxhOpening,'playing');assert.equal(f.timers.size,0);
f.video.currentTime=.8;f.video.emit('timeupdate');assert.equal(f.reveals,0);assert.equal(f.layer.style['--opening-fuel'],'0.0000');
f.video.currentTime=2.2;f.video.emit('timeupdate');assert.ok(+f.layer.style['--opening-adaptation']>.9,'Personalization cue responds while movement is the anchor');
f.video.currentTime=3.2;f.video.emit('timeupdate');assert.ok(+f.layer.style['--opening-fuel']>.5,'Fuel image follows movement');assert.equal(f.reveals,0);
f.video.currentTime=4.0;f.video.emit('timeupdate');assert.ok(+f.layer.style['--opening-recover']>.5,'Recovery image follows fuel');
f.video.currentTime=4.95;f.video.emit('timeupdate');assert.ok(+f.layer.style['--opening-progress']>.5,'Progress appears after recovery');assert.equal(f.reveals,0);
f.video.currentTime=5.15;f.video.emit('timeupdate');assert.equal(f.root.dataset.lxhOpening,'revealing');assert.equal(f.reveals,1);assert.equal(f.video.paused,false,'The footage continues during the Hero reveal');
f.video.currentTime=6;f.video.emit('timeupdate');assert.ok(+f.root.style['--lxh-destination-opacity']>0,'Hero composition crossfades in while the film is still visible');
f.show(false);assert.equal(f.video.paused,true);const pausedTime=f.video.currentTime;f.show(true);assert.equal(f.video.currentTime,pausedTime);assert.equal(f.loads,1,'Resume uses the same video');
f.video.currentTime=7.15;f.video.emit('timeupdate');assert.equal(f.root.dataset.lxhOpening,'done');assert.equal(f.layer.hidden,true);assert.equal(f.video.paused,true);f.video.emit('ended');assert.equal(f.reveals,1);const n=f.plays;f.show(false);f.show(true);assert.equal(f.plays,n,'Opening does not replay');
f=fixture(true);assert.equal(f.loads,0);assert.equal(f.root.dataset.lxhOpening,'done');assert.equal(f.timers.size,0);
f=fixture();f.show(true);f.video.reject({name:'NotAllowedError'});assert.equal(f.root.dataset.lxhOpening,'done','Autoplay denied fails open');
f=fixture();f.show(true);f.fire(3000);assert.equal(f.root.dataset.lxhOpening,'done','Loading timeout fails open');
f=fixture();f.show(true);f.video.emit('error');assert.equal(f.root.dataset.lxhOpening,'done','Missing video fails open');
f=fixture();f.show(true);f.video.emit('playing');f.doc.hidden=true;f.doc.emit('visibilitychange');assert.equal(f.video.paused,true);assert.equal(f.timers.size,0);f.video.reject({name:'AbortError'});assert.notEqual(f.root.dataset.lxhOpening,'done','Background pause does not discard intro');f.doc.hidden=false;f.doc.emit('visibilitychange');assert.equal(f.plays,2);f.show(false);assert.equal(f.video.paused,true);f.show(true);assert.equal(f.loads,1,'Resume uses same source');f.root.emit('lift-experimental-hero:destroy');assert.equal(f.video.paused,true);assert.equal(f.timers.size,0);assert.equal(f.layer.hidden,true);
f=fixture();f.show(true);f.video.emit('playing');f.reduced.matches=true;f.reduced.emit('change');assert.equal(f.root.dataset.lxhOpening,'done');
console.log('PASS: preserved Hero/CSS; prepare→move→fuel→recover→progress timing; adaptive cue; continuous reveal; one-time playback; lazy video; reduced motion; autoplay/error/timeout fallback; background resume and teardown.');
