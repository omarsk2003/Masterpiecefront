/* LIFT Experimental Cinematic Intro — prepare → move → fuel → recover → progress → Hero. */
(() => {
  'use strict';
  const root=document.querySelector('[data-lift-experimental-hero]');
  const layer=root?.querySelector('[data-lxh-opening-layer]'),video=root?.querySelector('[data-lxh-opening-video]');
  if(!layer||!video)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const caption=layer.querySelector('[data-opening-caption]'),title=layer.querySelector('[data-opening-title]');
  let visible=false,done=false,disposed=false,requested=false,revealed=false,watchdog=0,tracking=0,lastFrame=0;
  root.dataset.lxhOpening='pending';video.muted=true;video.defaultMuted=true;video.playsInline=true;layer.hidden=false;
  function clearWatchdog(){clearTimeout(watchdog);watchdog=0;}
  function stopTracking(){cancelAnimationFrame(tracking);tracking=0;lastFrame=0;}
  function revealEvent(){if(!revealed){revealed=true;root.dispatchEvent(new Event('lift-experimental-intro:reveal'));}}
  function finish(){
    if(done||disposed)return;
    done=true;clearWatchdog();stopTracking();video.pause();root.dataset.lxhOpening='done';layer.hidden=true;root.style.setProperty('--lxh-destination-opacity','1');revealEvent();
  }
  function armWatchdog(){clearWatchdog();if(visible&&!document.hidden)watchdog=setTimeout(finish,3000);}
  function sync(){
    if(done||disposed)return;
    if(reduced.matches){finish();return;}
    if(!visible||document.hidden){pause();return;}
    if(!requested){requested=true;video.src=video.dataset.src;video.load();}
    if(video.paused){armWatchdog();try{video.play()?.catch(error=>{if(error?.name==='AbortError'&&(!visible||document.hidden||disposed))return;finish();});}catch{finish();}}
  }
  function playing(){if(done||disposed){video.pause();return;}clearWatchdog();if(root.dataset.lxhOpening==='pending')root.dataset.lxhOpening='playing';if(!tracking)tracking=requestAnimationFrame(track);}
  function progress(){
    if(done||disposed)return;
    const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>n*n*(3-2*n),t=video.currentTime;
    // One continuous 7.32-second source: prepare 0–1.2, move 1.2–2.8,
    // fuel 2.8–3.75, recover 3.75–4.65, progress 4.65–5.5, Hero reveal 5.15–7.15.
    const beat=t<1.2?'prepare':t<2.8?'move':t<3.75?'fuel':t<4.65?'recover':t<5.55?'progress':'reveal';
    layer.dataset.beat=beat;
    const fuel=smooth(clamp((t-2.65)/0.38))*(1-smooth(clamp((t-3.72)/0.38)));
    const recover=smooth(clamp((t-3.52)/0.38))*(1-smooth(clamp((t-4.62)/0.38)));
    const progressCue=smooth(clamp((t-4.38)/0.35))*(1-smooth(clamp((t-5.5)/0.45)));
    const transition=smooth(clamp((t-5.15)/1.9));
    const cardScale=1-.13*smooth(clamp((t-5.25)/1.7));
    const filmFade=1-smooth(clamp((t-5.3)/1.88));
    const backdropFade=1-smooth(clamp((t-5.4)/1.7));
    layer.style.setProperty('--opening-video-y',beat==='move'?'60%':beat==='prepare'?'55%':'53%');
    layer.style.setProperty('--opening-cover',(1-smooth(clamp((t-5.4)/1.7))).toFixed(4));
    layer.style.setProperty('--opening-backdrop-opacity',backdropFade.toFixed(4));
    layer.style.setProperty('--opening-film-opacity',filmFade.toFixed(4));
    layer.style.setProperty('--opening-film-scale',(1.035+.045*smooth(clamp(t/4.2))-.35*transition).toFixed(4));
    layer.style.setProperty('--opening-film-blur',(1.5*transition).toFixed(2)+'px');
    layer.style.setProperty('--opening-fuel',fuel.toFixed(4));
    // Supporting images move inward toward the runner before dissolving into the Hero.
    layer.style.setProperty('--opening-fuel-x',(26*(1-smooth(clamp((t-2.85)/.65)))-42*transition).toFixed(2)+'px');
    layer.style.setProperty('--opening-fuel-y',(10*(1-smooth(clamp((t-2.85)/.65)))-12*transition).toFixed(2)+'px');
    layer.style.setProperty('--opening-recover',recover.toFixed(4));
    layer.style.setProperty('--opening-recover-x',(-24*(1-smooth(clamp((t-3.88)/.65)))+38*transition).toFixed(2)+'px');
    layer.style.setProperty('--opening-recover-y',(8*(1-smooth(clamp((t-3.88)/.65)))-10*transition).toFixed(2)+'px');
    layer.style.setProperty('--opening-card-scale',cardScale.toFixed(4));
    const adaptation=smooth(clamp((t-1.75)/.4))*(1-smooth(clamp((t-2.85)/.4)));
    layer.style.setProperty('--opening-adaptation',adaptation.toFixed(4));
    layer.style.setProperty('--opening-adaptation-y',(8*(1-adaptation)).toFixed(2)+'px');
    layer.style.setProperty('--opening-progress',progressCue.toFixed(4));
    layer.style.setProperty('--opening-progress-y',(8*(1-progressCue)).toFixed(2)+'px');
    layer.style.setProperty('--opening-progress-line',(100*smooth(clamp((t-5.15)/.95))).toFixed(1)+'%');
    layer.style.setProperty('--opening-copy',(1-smooth(clamp((t-6.05)/.45))).toFixed(4));
    root.style.setProperty('--lxh-destination-opacity',transition.toFixed(4));
    if(t<1.2){caption.textContent='PREPARE / A MOMENT FOR YOU';title.textContent='A day begins with one small choice.';}
    else if(t<2.8){caption.textContent='MOVE / AT YOUR OWN PACE';title.textContent='Your pace. Your way forward.';}
    else if(t<3.75){caption.textContent='FUEL / BUILT AROUND REAL LIFE';title.textContent='Nutrition that fits your day.';}
    else if(t<4.65){caption.textContent='RECOVER / PROGRESS NEEDS REST';title.textContent='Recovery belongs in the plan.';}
    else if(t<5.55){caption.textContent='PROGRESS / ONE DAY AT A TIME';title.textContent='Small choices add up.';}
    else{caption.textContent='LIFT / BUILT AROUND YOU';title.textContent='One life. A plan built around it.';}
    if(t>=5.15&&!revealed){root.dataset.lxhOpening='revealing';revealEvent();}
    if(t>=7.15)finish();
  }
  function track(now){tracking=0;if(done||disposed||video.paused||document.hidden||!visible)return;if(now-lastFrame>=1000/30){lastFrame=now;progress();}if(!done)tracking=requestAnimationFrame(track);}
  function waiting(){armWatchdog();}
  function pause(){video.pause();clearWatchdog();stopTracking();}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.08});
  observer.observe(root.querySelector('.lxh__stage'));
  video.addEventListener('playing',playing);video.addEventListener('timeupdate',progress);video.addEventListener('waiting',waiting);video.addEventListener('ended',finish);video.addEventListener('error',finish);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);window.addEventListener('pagehide',pause);window.addEventListener('pageshow',sync);
  root.addEventListener('lift-experimental-hero:destroy',()=>{
    disposed=true;pause();observer.disconnect();layer.hidden=true;root.dataset.lxhOpening='done';root.style.setProperty('--lxh-destination-opacity','1');
    document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);window.removeEventListener('pagehide',pause);window.removeEventListener('pageshow',sync);
    video.removeEventListener('playing',playing);video.removeEventListener('timeupdate',progress);video.removeEventListener('waiting',waiting);video.removeEventListener('ended',finish);video.removeEventListener('error',finish);
  },{once:true});
  if(reduced.matches)finish();
})();
