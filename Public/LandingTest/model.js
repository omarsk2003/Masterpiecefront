(function(root){
  'use strict';
  const duration=16, cues=[0,8,16,24,32,42], boundaries=cues.map(t=>t*duration/42);
  const defaults={goal:'strength',minutes:45,diet:'balanced',place:'gym',sleep:7};
  const options={goal:['strength','fitness'],minutes:[30,45,60],diet:['balanced','plant'],place:['gym','home'],sleep:[6,7,8]};
  const smooth=(a,b,t)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
  function frame(time){
    const clock=((time%duration)+duration)%duration; const t=clock/duration*42;
    const stage=cues.findIndex((b,i)=>i<5&&t>=b&&t<cues[i+1]);
    return {time:t,stage,local:t-cues[stage],progress:(t-cues[stage])/(cues[stage+1]-cues[stage]),
      human:1-smooth(7.5,10,t)+smooth(32,34,t), core:smooth(6.5,10,t)*(1-smooth(32,35,t)),
      modules:smooth(16,18,t)*(1-smooth(39,41,t)),support:smooth(24,26,t)*(1-smooth(34,36,t)),
      ending:smooth(34,36,t)*(1-smooth(39,41,t)), restart:smooth(39,42,t)};
  }
  function plan(input={}){
    const p=Object.fromEntries(Object.keys(defaults).map(k=>[k,options[k].includes(input[k])?input[k]:defaults[k]]));
    const strength=p.goal==='strength',home=p.place==='home',plant=p.diet==='plant';
    const names=strength?(home?['Incline push-ups','Chair squats','Reverse lunges','Dead bugs']:['Dumbbell press','Supported row','Dumbbell curl','Triceps extension']):(home?['Marching high knees','Step-back lunges','Standing reaches','Bird dogs']:['Incline walk','Light dumbbell circuit','Step-ups','Mobility flow']);
    const main=p.minutes-10,protein=strength?140:120,carbs=strength?260:240,fat=67;
    return {profile:p,title:strength?(home?'At-home strength':'Upper-body strength'):'Full-body conditioning',sets:p.minutes===30?'2 × 10':p.minutes===45?'3 × 10':'3 × 12',names,
      meal:plant?'Tofu, chickpeas & greens':'Chicken, rice & greens',protein,carbs,fat,calories:(protein+carbs)*4+fat*9,
      blocks:[['Warm-up',5],['Main session',main],['Cool-down',5]],
      why:(home?'Exercises use your home space.':'Exercises use gym equipment.')+' The full session fits '+p.minutes+' minutes.',
      foodWhy:plant?'Plant-based protein sources, with quick-preparation meals.':'Balanced food choices, with quick-preparation meals.',
      sleepNote:p.sleep===6?'Your shorter sleep window is flagged for your coach to consider.':'Your sleep routine is included in the context your coach reviews.'};
  }
  const api={duration,boundaries,defaults,options,smooth,frame,plan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LiftStory=api;
})(typeof window!=='undefined'?window:globalThis);
