(() => {
  'use strict';
  const canvas = document.getElementById('lift-world');
  const chapters = [...document.querySelectorAll('[data-scene]')];
  const rail = document.getElementById('rail-progress');
  const count = document.getElementById('chapter-count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 800px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v-a)/(b-a)); return t*t*(3-2*t); };
  const mix = (a,b,t) => a+(b-a)*t;
  const chapterDepth = 4.5;
  if (!window.THREE || !canvas) { document.body.classList.add('no-webgl'); return; }
  const T = window.THREE;
  let renderer;
  try { renderer = new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'}); }
  catch { document.body.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile.matches ? 1.25 : 1.6));
  renderer.setClearColor(0x101713,0);
  renderer.shadowMap.enabled = !mobile.matches;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x17221b,.018);
  const camera = new T.PerspectiveCamera(40,1,.1,120);
  scene.add(new T.HemisphereLight(0xe2e8df,0x293b32,1.65));
  const key = new T.DirectionalLight(0xf0eee6,2.3); key.position.set(-4,7,-3);scene.add(key);
  key.target.position.set(0,-1,-chapterDepth);scene.add(key.target);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-10;key.shadow.camera.right=10;
  key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.camera.near=.5;key.shadow.camera.far=35;
  key.shadow.bias=-.00025;key.shadow.normalBias=.025;key.shadow.radius=3;
  const fill = new T.PointLight(0xc4d7ca,.55,14,2);fill.position.set(3,2,-chapterDepth);scene.add(fill);
  const matte = (color,metalness=.12,roughness=.66) => new T.MeshStandardMaterial({color,metalness,roughness});
  const materials = {dark:matte(0x26352c,.4,.42),stone:matte(0x69746b,.25,.65),bright:matte(0xd8e0d6,.18,.52),architecture:matte(0x4d5e54,.05,.85),lime:new T.MeshBasicMaterial({color:0xc9ec78}),black:matte(0x101713,.42,.4)};
  const groups = Array.from({length:7},(_,i)=>{const g=new T.Group();g.position.z=-i*chapterDepth;scene.add(g);return g;});
  const assets='experimental-hero/assets/';
  const textures=[];
  const loader=new T.TextureLoader();
  const load=(src)=>{const t=loader.load(assets+src,()=>requestRender());t.colorSpace=T.SRGBColorSpace;textures.push(t);return t;};
  const image={move:load('lift-move.jpg'),fuel:load('lift-fuel.jpg'),recover:load('lift-recover.jpg'),progress:load('lift-progress.jpg'),coach:load('lift-coach.jpg'),nutritionist:load('lift-nutritionist.jpg'),finish:load('lift-finish.jpg')};
  function box(parent,x,y,z,w,h,d,mat){const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);parent.add(o);return o;}
  function media(parent,tex,x,y,z,w,h){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,color:0xd5e1e2,side:T.DoubleSide,toneMapped:false}));m.position.set(x,y,z);parent.add(m);return m;}
  function line(parent,pts,color=0xc9ec78){const geo=new T.BufferGeometry().setFromPoints(pts.map(p=>new T.Vector3(...p)));const o=new T.Line(geo,new T.LineBasicMaterial({color,transparent:true,opacity:.68}));parent.add(o);return o;}
  function label(parent,text,x,y,z,size=1){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#152019';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#8fa18a';ctx.strokeRect(1,1,510,126);ctx.fillStyle='#dce6d9';ctx.font='700 29px Arial';ctx.textBaseline='middle';ctx.fillText(text,22,65);const tx=new T.CanvasTexture(c);textures.push(tx);const m=media(parent,tx,x,y,z,size*2.3,size*.57);m.userData.label=true;return m;}
  // Sparse floor and structural edges carry the same architectural scale through later chapters.
  groups.slice(2,6).forEach(g=>{
    const floor=box(g,0,-2.58,-1.6,11,.1,5.3,materials.architecture);floor.receiveShadow=true;
    box(g,0,-2.48,1.0,10.7,.018,.025,materials.stone);
    if(!mobile.matches){
      for(const x of [-4.85,4.85]){
        box(g,x,-.45,-3.25,.12,4.15,.18,materials.architecture);
        box(g,x,-2.4,-2.2,.55,.1,2.1,materials.stone);
      }
    }
  });
  // The day route begins after the isolated plan-builder hero.
  const day=groups[1];day.position.x=mobile.matches?0:1.05;day.scale.setScalar(mobile.matches ? .8 : .88);
  const dayEnvironment=window.buildLiftDayEnvironment(T,day,{box,label,line,mobile});
  const {route,routePts,stageMarkers}=dayEnvironment;
  const stageCopy=[
    ['YOUR DAY BEGINS','A plan starts with your real life.','HOME →'],
    ['WORK RUNS LATE','45 MIN AVAILABLE → 25 MIN AVAILABLE','SCHEDULE CHANGED →'],
    ['TIME TO MOVE','A shorter workout fits the new window.','PLAN ADAPTED →'],
    ['FUEL YOUR DAY','Food guidance fits your routine.','NUTRITION FITS →'],
    ['MAKE ROOM TO RECOVER','Rest belongs in the plan, too.','A WHOLE-LIFE PLAN ✓']
  ];
  const stageCaption=[...document.querySelectorAll('[data-day-stage]')];
  const stageKicker=document.getElementById('day-stage-kicker');
  const stageDetail=document.getElementById('day-stage-detail');
  const stageResult=document.getElementById('day-stage-result');
  const journeyDuration=12;
  let dayClock=0,journeyStartedAt=null,activeStage=-1;
  function journeyPosition(seconds){
    const position=clamp(seconds/journeyDuration)*4;
    return {position,walking:seconds<journeyDuration};
  }
  function setActiveStage(index){
    if(index===activeStage) return;
    activeStage=index;
    const [kicker,detail,result]=stageCopy[index];
    stageKicker.textContent=kicker;
    stageDetail.textContent=detail;
    stageResult.textContent=result;
    stageCaption.forEach((item,i)=>item.classList.toggle('is-current',i===index));
    stageMarkers.forEach((marker,i)=>{marker.material.opacity=i===index ? .72 : .08;});
  }
  setActiveStage(0);
  let walker=null,walkMixer=null,walkAction=null,idleAction=null;
  let walkerRequested=false;
  function loadWalker(){
    if(walkerRequested) return;
    walkerRequested=true;
    import('./vendor/loaders/GLTFLoader.js').then(({GLTFLoader})=>{
      new GLTFLoader().load('assets/models/WalkingMan.glb',gltf=>{
        walker=gltf.scene;
        // This rig's animated skin bounds include bones far outside the visible body.
        // Its actual mesh is 4.85 units tall before the scene scale is applied.
        const factor=.78/4.85;
        walker.scale.setScalar(factor);
        walker.rotation.y=Math.PI/2;
        walker.userData.floorOffset=0;
        walker.traverse(object=>{
          if(!object.isMesh) return;
          const parts=Array.isArray(object.material)?object.material:[object.material];
          const colors={Shirt:0x8ba995,Shirt2:0x527465,Skin:0xb78560,Pants:0x34443d,Shoes:0x26332c,Socks:0x5b6f61,Hair:0x715a40,Hair2:0x715a40,Eyes:0x1b251e};
          const converted=parts.map(material=>{
            const newMaterial=new T.MeshStandardMaterial({color:colors[material?.name]||material?.color?.getHex?.()||0xa0b7a5,roughness:.9,metalness:0,side:T.DoubleSide});
            material?.dispose();
            return newMaterial;
          });
          object.material=Array.isArray(object.material)?converted:converted[0];
          object.castShadow=!mobile.matches;
          object.frustumCulled=false;
        });
        day.add(walker);
        if(gltf.animations.length){
          const walkClip=gltf.animations.find(clip=>/Walk$/i.test(clip.name))||gltf.animations[0];
          const idleClip=gltf.animations.find(clip=>/Idle$/i.test(clip.name));
          walkMixer=new T.AnimationMixer(walker);
          walkAction=walkMixer.clipAction(walkClip);
          walkAction.timeScale=.85;
          walkAction.setEffectiveWeight(0);
          walkAction.play();
          if(idleClip){
            idleAction=walkMixer.clipAction(idleClip);
            idleAction.setEffectiveWeight(1);
            idleAction.play();
          }
        }
        requestRender();
      },undefined,error=>{walkerRequested=false;console.error('LIFT test walker model failed to load',error);});
    }).catch(error=>{walkerRequested=false;console.error('LIFT test walker loader failed to import',error);});
  }
  if('IntersectionObserver' in window){
    const walkerObserver=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){walkerObserver.disconnect();loadWalker();}
    },{rootMargin:'100% 0px'});
    walkerObserver.observe(chapters[1]);
  }else loadWalker();
  // Four distinct starting points travel along separate paths toward one way forward.
  const directionScene=groups[2];
  const directionPhotos=['lift-direction-start.jpg','lift-direction-pace.jpg','lift-direction-mobility.jpg','lift-direction-everyday.jpg'];
  const directionLabels=['YOUR START','YOUR PACE','YOUR SPACE','YOUR WAY'];
  const directionStarts=[[-4.2,1.22,-.6],[-2.18,1.25,-1.65],[-3.55,-1.38,-1.1],[-1.43,-1.28,-.25]];
  const mobileDirectionStarts=[[-1.12,1,-1.05],[.82,.82,-1.5],[-.9,-1.12,-.35],[.95,-1.04,-.9]];
  const directionCards=directionPhotos.map((src,i)=>{const g=new T.Group();directionScene.add(g);const tex=load(src);box(g,0,0,-.08,1.74,2.33,.1,materials.black);media(g,tex,0,0,.03,1.65,2.24);label(g,directionLabels[i],0,-1.36,.15,.66);return g;});
  const directionPaths=directionStarts.map((start,i)=>line(directionScene,[start,[(start[0]-2.7)/2,start[1]*.35,-1.7],[-2.7+(i-1.5)*.22,-.15,-1.25]],0xc9ec78));
  const directionHub=label(directionScene,'LIFT / A WAY FORWARD',-2.7,-1.48,.15,.95);directionHub.material.transparent=true;
  // Lifestyle cards feed the LIFT app; real plan modules emerge as the section progresses.
  const personalization=window.buildLiftPersonalizationScene(T,groups[3],{box,media});
  // Four photo planes pass through the camera in sequence.
  const pillars=groups[4];
  const storyCards=['move','fuel','recover','progress'].map((n,i)=>{const g=new T.Group();pillars.add(g);box(g,0,0,-.06,2.9,3.85,.12,materials.black);media(g,image[n],0,0,.04,2.76,3.65);label(g,n.toUpperCase(),0,-2.18,.15,1.15);return g;});
  // Premium puts the client, AI and two specialists in spatial relationship.
  const experts=groups[5];
  const expertCards=[['coach','COACH / TRAINING'],['nutritionist','NUTRITION / FOOD']].map(([role,title],i)=>{
    const card=new T.Group();experts.add(card);
    box(card,0,0,-.08,2.35,3.17,.1,materials.black);
    media(card,image[role],0,0,.02,2.24,3.05);
    label(card,title,0,-1.82,.16,.85);
    card.userData.index=i;return card;
  });
  const aiNode=label(experts,'AI / ADAPTS',0,2.12,.55,.82);
  line(experts,[[0,1.98,.48],[-.95,1.45,.2],[-1.3,.5,.12]]);
  line(experts,[[0,1.98,.48],[.95,1.45,.2],[1.3,.5,.12]]);
  const finish=groups[6];
  const finishFrame=box(finish,0,0,-.3,3.1,4.45,.12,materials.black);
  const finishPhoto=media(finish,image.finish,0,0,-.18,2.95,4.25);
  const finishLine=box(finish,0,-2.28,.05,3.1,.035,.01,materials.lime);
  function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile.matches?1.25:1.6));renderer.shadowMap.enabled=!mobile.matches;camera.aspect=w/h;camera.updateProjectionMatrix();day.position.x=mobile.matches?0:1.05;day.scale.setScalar(mobile.matches ? .8 : .88);requestRender();}
  let current=0,target=0,raf=0,visible=true,last=0;
  function requestRender(){if(!raf&&visible)raf=requestAnimationFrame(frame);}
  function readScroll(){const pos=scrollY;let i=0;while(i<chapters.length-1&&pos>=chapters[i+1].offsetTop)i++;const a=chapters[i].offsetTop,b=i<chapters.length-1?chapters[i+1].offsetTop:chapters[i].offsetTop+chapters[i].offsetHeight;target=clamp(i+(pos-a)/(b-a),0,chapters.length-1);if(i===1&&journeyStartedAt===null&&!reduced.matches)journeyStartedAt=performance.now();count.textContent=String(i+1).padStart(2,'0')+' / '+String(chapters.length).padStart(2,'0');rail.style.setProperty('--progress',Math.round(target/(chapters.length-1)*100)+'%');chapters.forEach((c,j)=>c.classList.toggle('is-active',i===j));requestRender();}
  function frame(ts){raf=0;const dt=Math.min(.05,(ts-last)/1000||.016);last=ts;const ease=reduced.matches?1:1-Math.exp(-dt*5.8);current=mix(current,target,ease);const p=current;
    const isMobile=mobile.matches,scale=isMobile?.72:1;
    const dayView=p>=1&&p<2 ? 1-smooth(1.75,2,p) : Math.exp(-Math.pow((p-1)/.56,2));
    const cameraStage=p>=1&&p<2 ? 1+smooth(1.75,2,p) : Math.floor(p)+smooth(.62,1,p%1);
    camera.position.set(Math.sin(p*.74)*.78*scale,.2+dayView*.85,8-cameraStage*chapterDepth);
    camera.lookAt(Math.sin(p*.74)*.44*scale,-dayView*.4,-cameraStage*chapterDepth);
    groups.forEach((g,j)=>{g.visible=Math.abs(j-p)<.88;g.rotation.y=Math.sin(p*.55+j)*.035;});
    if(journeyStartedAt!==null&&!reduced.matches)dayClock=Math.min(journeyDuration,(ts-journeyStartedAt)/1000);
    const journey=reduced.matches
      ? {position:smooth(1,2,p)*4,walking:false}
      : journeyPosition(dayClock);
    const routeTravel=journey.position;
    const segment=Math.min(routePts.length-2,Math.floor(routeTravel));
    const part=routeTravel-segment;
    setActiveStage(Math.min(4,Math.floor(routeTravel+.001)));
    if(walker){
      const walkX=mix(routePts[segment][0],routePts[segment+1][0],part);
      walker.position.set(walkX,-1.63-walker.userData.floorOffset,routePts[segment][2]);
      if(walkMixer){
        walkAction?.setEffectiveWeight(journey.walking?1:0);
        idleAction?.setEffectiveWeight(journey.walking?0:1);
        if(journeyStartedAt!==null && !reduced.matches)walkMixer.update(dt);
      }
    }
    route.material.opacity=smooth(.72,1.1,p)*(1-smooth(1.9,2.2,p));
    const directionTravel=smooth(2.08,2.88,p);
    directionCards.forEach((g,k)=>{const start=(isMobile?mobileDirectionStarts:directionStarts)[k];g.position.set(mix(start[0],(isMobile?0:-2.7)+(k-1.5)*.34,directionTravel),mix(start[1],.05+(k-1.5)*.08,directionTravel)+Math.sin(directionTravel*Math.PI)*.13*(k%2?1:-1),mix(start[2],-1.3-k*.13,directionTravel));g.rotation.y=mix((k-1.5)*-.12,0,directionTravel);g.scale.setScalar((isMobile?.68:1)*(1-directionTravel*.48));});
    directionPaths.forEach(path=>{path.visible=!isMobile;path.material.opacity=.4*smooth(2.05,2.38,p)*(1-smooth(2.75,3,p));});
    directionHub.position.x=isMobile?0:-2.7;directionHub.scale.setScalar(isMobile?.7:1);directionHub.material.opacity=smooth(2.52,2.86,p);
    personalization.update(p-3,isMobile);
    storyCards.forEach((g,k)=>{const q=clamp(p-4,0,1);g.position.set(((k-1.5)*2.25-q*3.15)*scale,Math.sin(q*3.2+k)*.32,((k-1.5)*-.95)+q*2.35);g.rotation.y=(k-1.5)*-.16+q*.26;g.scale.setScalar(isMobile?.77:1);g.visible=!isMobile||k<3||q>.55;});
    expertCards.forEach((card,k)=>{card.position.set(isMobile?(k?.9:-.9):(k?3.5:1.2),k?-.18:.12,k?-.35:.15);card.rotation.y=(k?-.1:.1)+Math.sin(p*.7+k)*.035;card.scale.setScalar(isMobile?.72:.84);});
    aiNode.position.x=isMobile?0:2.35;aiNode.scale.setScalar(isMobile?.8:1);
    finishFrame.rotation.y=Math.sin(p*.8)*.1;finishPhoto.rotation.y=finishFrame.rotation.y;finishLine.rotation.y=finishFrame.rotation.y;
    renderer.render(scene,camera);
    if(Math.abs(current-target)>.001 || (journeyStartedAt!==null && dayClock<journeyDuration && !reduced.matches))requestRender();
  }
  addEventListener('resize',resize,{passive:true});addEventListener('scroll',readScroll,{passive:true});document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)readScroll();});reduced.addEventListener?.('change',readScroll);mobile.addEventListener?.('change',resize);
  resize();readScroll();
  addEventListener('pagehide',()=>{cancelAnimationFrame(raf);scene.traverse(o=>{o.geometry?.dispose();if(o.material&&!Object.values(materials).includes(o.material))o.material.dispose?.();});Object.values(materials).forEach(m=>m.dispose());dayEnvironment.dispose();personalization.dispose();textures.forEach(t=>t.dispose());renderer.dispose();},{once:true});
})();
