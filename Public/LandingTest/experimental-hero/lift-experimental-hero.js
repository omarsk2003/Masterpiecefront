/* LIFT Experimental Hero — no input handlers, storage, API or app state. */
(() => {
  'use strict';
  const root=document.querySelector('[data-lift-experimental-hero]');
  if(!root)return;
  const stage=root.querySelector('.lxh__stage'),globe=root.querySelector('.lxh__globe');
  const assetRoot=new URL('./assets/',document.currentScript.src);
  const photos=[
    ['strength.jpg','TRAIN WITH PURPOSE','50% 50%'],
    ['nutrition.jpg','FOOD THAT FITS','50% 50%'],
    ['wellness.jpg','FIND YOUR BALANCE','50% 50%'],
    ['foam-recovery.jpg','RECOVER WELL','50% 28%'],
    ['running.jpg','KEEP MOVING','50% 50%'],
    ['athlete.jpg','TRACK YOUR PROGRESS','40% 28%'],
    ['recovery.jpg','BUILD YOUR STRENGTH','50% 50%']
  ];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),compact=matchMedia('(max-width: 800px)');
  const headlines=[['YOUR LIFE / UNDERSTOOD','Your life sets the pace.'],['NUTRITION / PERSONALIZED','Fuel that fits your day.'],['WELLNESS / CONNECTED','Recovery is part of progress.'],['LIFT / BUILT AROUND YOU','One life. A plan built around it.']];
  const kicker=root.querySelector('[data-lxh-kicker]'),headline=root.querySelector('[data-lxh-headline]'),portrait=root.querySelector('.lxh__portrait img'),steps=[...root.querySelectorAll('[data-lxh-step]')];
  let tiles=[],width=0,height=0,elapsed=0,last=0,raf=0,intersecting=true,phase=-1,disposed=false;
  function build(){
    globe.replaceChildren();tiles=[];
    const rings=compact.matches?[-.64,0,.64]:[-.82,-.30,.30,.82],count=compact.matches?5:7;
    rings.forEach((latitude,row)=>{
      for(let col=0;col<count;col++){
        const photo=photos[(col+row*2)%photos.length],tile=document.createElement('figure'),img=document.createElement('img'),label=document.createElement('figcaption');
        tile.className='lxh__tile';tile.setAttribute('aria-hidden','true');img.src=new URL(photo[0],assetRoot).href;img.alt='';img.width=600;img.height=400;img.decoding='async';img.draggable=false;img.style.objectPosition=photo[2];label.textContent=photo[1];tile.append(img,label);globe.append(tile);
        img.addEventListener('error',()=>{tile.hidden=true;},{once:true});
        tiles.push({el:tile,latitude,longitude:col/count*Math.PI*2+row*.47});
      }
    });
    resize();
  }
  function resize(){width=stage.clientWidth;height=stage.clientHeight;draw();}
  function draw(){
    if(disposed||!width||!height)return;
    const t=reduced.matches?12:elapsed,angle=t*.075+.38;
    const rx=Math.min(width*.365,height*.49),ry=height*.355,rz=Math.min(width*.23,155);
    for(const tile of tiles){
      const a=tile.longitude+angle,lat=tile.latitude,cos=Math.cos(lat),depth=Math.cos(a)*cos;
      // Tangent photo planes arranged on an ellipsoid in actual CSS 3D space.
      const x=Math.sin(a)*cos*rx,y=Math.sin(lat)*ry,z=depth*rz;
      const tilt=-lat*180/Math.PI*.35,yaw=Math.sin(a)*-32;
      const edge=Math.min(1,Math.abs(x)/(width*.26));
      // Keep the human focal point legible as photos pass across the near hemisphere.
      const opacity=(.32+.62*(depth+1)/2)*(.38+.62*edge);
      tile.el.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) rotateX(${tilt.toFixed(2)}deg)`;
      tile.el.style.opacity=opacity.toFixed(3);
    }
    portrait.style.transform=`scale(${(1.37+Math.sin(t*Math.PI/18)*.025).toFixed(4)}) translateY(${(Math.sin(t*Math.PI/18)*-5).toFixed(2)}px)`;
    const next=reduced.matches?3:Math.floor(t/6)%4;
    if(next!==phase){phase=next;kicker.textContent=headlines[next][0];headline.textContent=headlines[next][1];steps.forEach((el,i)=>el.dataset.active=String(i===next));if(!reduced.matches&&elapsed>0)headline.animate?.([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'});}
  }
  function tick(now){
    raf=0;if(disposed||document.hidden||!intersecting||reduced.matches)return;
    if(!last)last=now;
    const delta=now-last;
    if(delta>=1000/30){elapsed+=Math.min(delta/1000,.1);last=now;draw();}
    raf=requestAnimationFrame(tick);
  }
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
  function start(){if(!disposed&&!raf&&!document.hidden&&intersecting&&!reduced.matches&&!['pending','playing'].includes(root.dataset.lxhOpening)){last=0;raf=requestAnimationFrame(tick);}}
  function visibility(){document.hidden?stop():start();}
  function motion(){stop();draw();start();}
  function layout(){stop();build();start();}
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(stage);
  const visibilityObserver=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;if(intersecting)start();else stop();},{threshold:.01});visibilityObserver.observe(stage);
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',motion);compact.addEventListener('change',layout);
  window.addEventListener('pagehide',stop);window.addEventListener('pageshow',start);
  root.addEventListener('lift-experimental-intro:reveal',start);
  // Optional lifecycle event for removing/transferring this prototype; no global API.
  root.addEventListener('lift-experimental-hero:destroy',()=>{disposed=true;stop();sizeObserver.disconnect();visibilityObserver.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motion);compact.removeEventListener('change',layout);window.removeEventListener('pagehide',stop);window.removeEventListener('pageshow',start);root.removeEventListener('lift-experimental-intro:reveal',start);globe.replaceChildren();},{once:true});
  build();start();
})();
