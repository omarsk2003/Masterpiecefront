(function(){
  'use strict';
  const $=id=>document.getElementById(id),S=LiftStory,reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const caption=['It starts with your real life.','LIFT connects the details that make you, you.','One understanding. Two personalized plans.','Your specialists bring a human perspective.','Built around your life. Made to evolve.'];
  let profile={...S.defaults},plan=S.plan(profile),time=reduced.matches?36/42*S.duration:0,playing=!reduced.matches,world=null,visible=true,raf=0,last=0,dirty=true,modalWasPlaying=false,lastStage=-1,lastStatus=-1;
  const inspection=new Set();
  try{world=new LiftWorld($('scene'));}catch(error){$('scene-error').hidden=false;console.error('LIFT 3D layer:',error);}
  function text(id,value){$(id).textContent=value;}
  function updatePlan(){
    plan=S.plan(profile);profile=plan.profile;
    text('life-goal',profile.goal==='strength'?'Build muscle':'Improve fitness');text('life-time',profile.minutes+' minutes');text('life-place',profile.place==='gym'?'Gym':'Home');text('life-food',profile.diet==='plant'?'Plant-based · quick meals':'Balanced · quick meals');text('life-sleep',profile.sleep+' hours');
    text('workout-name',plan.title);text('workout-sub',profile.minutes+' min · '+plan.names.length+' exercises');text('sets-value',plan.sets);text('nutrition-sub',plan.calories.toLocaleString('en-US')+' kcal · 3 meals + snack');
    $('macro-protein').innerHTML=plan.protein+'g <small>PROTEIN</small>';$('macro-carbs').innerHTML=plan.carbs+'g <small>CARBS</small>';$('plate-protein').classList.toggle('plant',profile.diet==='plant');dirty=true;
  }
  function controls(){const paused=!playing;$('pause').setAttribute('aria-pressed',String(paused));$('pause').setAttribute('aria-label',paused?'Play story':'Pause story');$('pause').innerHTML=paused?'▶ <span>Play</span>':'Ⅱ <span>Pause</span>';dirty=true;}
  function selectStage(index){time=S.boundaries[index]+(index===0?5.5:index===3?5.5:index===4?4.5:4)/42*S.duration;playing=false;controls();render();}
  document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>selectStage(Number(b.dataset.stage))));
  $('pause').addEventListener('click',()=>{playing=!playing;controls();});
  $('replay-intro').addEventListener('click',()=>{time=reduced.matches?36/42*S.duration:0;playing=!reduced.matches;controls();$('visual').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});});
  const dialog=$('details');
  function field(label,key,entries){return '<label>'+label+'<select name="'+key+'">'+entries.map(([v,l])=>'<option value="'+v+'"'+(String(profile[key])===String(v)?' selected':'')+'>'+l+'</option>').join('')+'</select></label>';}
  function open(kind){
    modalWasPlaying=playing;playing=false;controls();let html='';
    if(kind==='profile'){
      html='<p class="eyebrow">YOUR LIFE IS THE STARTING POINT</p><h2 id="dialog-title">Make the story yours.</h2><p>Change a few details and see them flow into both plans. These are illustrative scenarios, not a live AI assessment.</p><form id="profile-form"><div class="form-grid">'+field('Your goal','goal',[['strength','Build muscle'],['fitness','Improve general fitness']])+field('Available training time','minutes',[[30,'30 minutes'],[45,'45 minutes'],[60,'60 minutes']])+field('Food preference','diet',[['balanced','Balanced'],['plant','Plant-based']])+field('Training space','place',[['gym','Gym'],['home','Home']])+field('Typical sleep','sleep',[[6,'6 hours'],[7,'7 hours'],[8,'8 hours']])+'</div><div class="dialog-actions"><button class="primary" type="submit">Build my story <span>↗</span></button></div><p class="smallprint">Selections stay only in this page session. No health data is collected.</p></form>';
    }else if(kind==='workout'){
      html='<p class="eyebrow">AI DRAFT → COACH REVIEW</p><h2 id="dialog-title">'+plan.title+'</h2><p>'+plan.why+'</p><ul class="detail-list">'+plan.names.map(n=>'<li><span>'+n+'</span><b>'+plan.sets+'</b></li>').join('')+'</ul><ul class="detail-list">'+plan.blocks.map(([label,n])=>'<li><span>'+label+'</span><b>'+n+' min</b></li>').join('')+'</ul><p class="detail-note">'+plan.sleepNote+' Your coach reviews and adjusts this draft before it is assigned to you.</p><p class="smallprint">Example exercise selection for this interactive story.</p>';
    }else if(kind==='nutrition'){
      html='<p class="eyebrow">AI DRAFT → NUTRITIONIST REVIEW</p><h2 id="dialog-title">Food that fits your day.</h2><p>'+plan.foodWhy+'</p><div class="stat-grid"><div><b>'+plan.protein+'g</b><span>PROTEIN</span></div><div><b>'+plan.carbs+'g</b><span>CARBS</span></div><div><b>'+plan.fat+'g</b><span>FAT</span></div></div><ul class="detail-list"><li><span>Meal example</span><b>'+plan.meal+'</b></li><li><span>Alternative</span><b>'+(profile.diet==='plant'?'Lentils & quinoa':'Fish & potatoes')+'</b></li><li><span>Cooking preference</span><b>Quick-preparation meals</b></li></ul><p class="detail-note">Your nutritionist reviews the ingredients, preferences and portion balance before the plan is approved.</p><p class="smallprint">Illustrative meals and macro values for the animation, not personalized dietary advice.</p>';
    }else{
      html='<p class="eyebrow">PROGRESS, WITH CONTEXT</p><h2 id="dialog-title">More than a number.</h2><p>Completed sessions, food habits and weekly trends give you and your specialists a shared view of your progress.</p><ul class="detail-list"><li><span>Weekly activity</span><b>Sessions & active minutes</b></li><li><span>Workout completion</span><b>Planned vs completed</b></li><li><span>Weight trend</span><b>Tracked over time</b></li><li><span>Professional follow-up</span><b>Discuss & adjust your plan</b></li></ul><p class="detail-note">Progress is individual. The rising chart is a visual example of tracking, not a promised result.</p>';
    }
    $('dialog-body').innerHTML=html;dialog.showModal();document.body.classList.add('modal-open');
    if(kind==='profile')$('profile-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);profile={goal:data.get('goal'),minutes:Number(data.get('minutes')),diet:data.get('diet'),place:data.get('place'),sleep:Number(data.get('sleep'))};updatePlan();time=reduced.matches?36/42*S.duration:0;modalWasPlaying=!reduced.matches;dialog.close();$('visual').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});});
  }
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.open)));
  $('close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');playing=modalWasPlaying;controls();});
  function fallback(time){const data=LiftLayout(time,innerWidth<=800);document.querySelectorAll('[data-node]').forEach(el=>{const n=data.nodes[el.dataset.node];el.style.left=(50+n.position[0]*22)+'%';el.style.top=(47-n.position[1]*14)+'%';el.style.opacity=n.opacity;el.style.transform='translate(-50%,-50%) scale('+n.scale+')';el.style.pointerEvents=n.opacity>.7?'auto':'none';el.setAttribute('aria-hidden',String(n.opacity<=.7));if(el.tagName==='BUTTON')el.tabIndex=n.opacity>.7?0:-1;});return data;}
  function render(){
    const {f}=world?world.render(time,reduced.matches):fallback(time); $('visual').dataset.stage=f.stage;
    if(f.stage!==lastStage){lastStage=f.stage;text('scene-number','0'+(f.stage+1)+' / 05');text('scene-caption',caption[f.stage]);text('scene-hint',f.stage>=2?'Click a module to explore':'Move your cursor to explore');}
    document.querySelectorAll('[data-stage]').forEach((b,i)=>{b.classList.toggle('active',i===f.stage);if(i===f.stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');b.querySelector('i>b').style.width=(i<f.stage?100:i===f.stage?f.progress*100:0)+'%';});
    const status=Math.max(0,Math.min(3,Math.floor((f.time-9)/1.6)));
    if(status!==lastStatus){lastStatus=status;text('ai-status',['Understanding your lifestyle','Analyzing your goals','Considering health & preferences','Personalizing your plan'][status]);document.querySelectorAll('.processing i').forEach((b,i)=>b.classList.toggle('on',i<=status));}
    const coach=f.time>=26.6&&f.time<40,nutrition=f.time>=28&&f.time<40;
    text('coach-review',coach?'Workout reviewed ✓':'Reviewing workout');text('nutrition-review',nutrition?'Nutrition reviewed ✓':'Reviewing nutrition');text('coach-tick',coach?'✓':'○');text('nutrition-tick',nutrition?'✓':'○');text('workout-badge',coach?'REVIEWED':'DRAFT');text('nutrition-badge',nutrition?'REVIEWED':'DRAFT');
    const chart=S.smooth(18,22,f.time)*.4+S.smooth(32,37,f.time)*.6;document.querySelector('.chart-line').style.strokeDashoffset=String(230*(1-chart));dirty=false;
  }
  function tick(now){raf=0;if(document.hidden||!visible)return;const dt=last?Math.min((now-last)/1000,.06):0;last=now;if(playing&&!inspection.size){time=(time+dt)%S.duration;dirty=true;}const parallax=world&&(Math.abs(world.pointer.x-world.currentPointer.x)>.001||Math.abs(world.pointer.y-world.currentPointer.y)>.001);if(dirty||parallax)render();raf=requestAnimationFrame(tick);}
  function start(){if(!raf&&!document.hidden&&visible){last=0;raf=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:0});observer.observe($('visual'));
  $('visual').addEventListener('pointermove',()=>{dirty=true;});$('visual').addEventListener('pointerleave',()=>{dirty=true;});window.addEventListener('resize',()=>{dirty=true;});
  document.querySelectorAll('.module,.specialist').forEach(el=>{el.addEventListener('pointerenter',()=>{inspection.add(el.dataset.node+'pointer');dirty=true;});el.addEventListener('pointerleave',()=>{inspection.delete(el.dataset.node+'pointer');dirty=true;});el.addEventListener('focus',()=>{inspection.add(el.dataset.node+'focus');dirty=true;});el.addEventListener('blur',()=>{inspection.delete(el.dataset.node+'focus');dirty=true;});});
  reduced.addEventListener('change',e=>{playing=!e.matches;if(e.matches)time=36/42*S.duration;controls();});
  document.addEventListener('lift:theme-change',()=>{world?.syncTheme();dirty=true;}); document.addEventListener('lift:site-settings-change',()=>{world?.syncTheme();dirty=true;}); window.addEventListener('pagehide',stop);window.addEventListener('pageshow',start);
  world?.syncTheme();updatePlan();controls();render();start();
})();
