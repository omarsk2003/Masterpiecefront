(function(){
  'use strict';
  const S=window.LiftStory,clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t;
  const lifestyle=['goal','sleep','work','time','level','days','place','food','health'];
  const origins=[[-1.9,1.45,.2],[1.9,1.4,-.1],[-2.15,.55,.1],[2.12,.52,.3],[-2.08,-.25,.3],[2.08,-.3,0],[-1.78,-1.03,.2],[1.85,-1.04,.25],[0,-1.63,.3]];
  function layout(time,mobile=false){
    const f=S.frame(time),t=f.time,nodes={};
    const converge=S.smooth(8,12,t),closing=S.smooth(39,42,t);
    lifestyle.forEach((name,i)=>{let alpha=S.smooth(.6+i*.48,1.4+i*.48,t)*(1-S.smooth(8.2+i*.19,10.2+i*.19,t));
      const p=origins[i];const drift=Math.sin(t*.38+i)*.045;
      nodes[name]={position:[p[0]*(mobile?.69:1)*(1-converge),mix(p[1]+drift,.2,converge),mix(p[2],-.35,converge)],opacity:alpha,scale:1-converge*.8,tilt:p[0]*-2};
    });
    nodes.corelabel={position:[0,-.62,.75],opacity:S.smooth(9,11,t)*(1-S.smooth(15.5,17,t)),scale:1};
    const side=mobile?1.22:1.94;
    const moduleKeys=['workout','nutrition','progress'];
    const modulePositions=[[-side,.67,.25],[side,.67,.25],[0,mobile?-1.95:-2.05,.3]];
    moduleKeys.forEach((name,i)=>{const enter=S.smooth(16+i*.7,18+i*.7,t);const spread=S.smooth(32,35,t);const base=modulePositions[i];let p=[base[0],base[1],base[2]];
      if(i<2){p[0]*=1+spread*.035;p[1]+=spread*.68;}else p[1]-=spread*.26;
      nodes[name]={position:[p[0]*enter,mix(.2,p[1],enter),p[2]],opacity:enter*(1-S.smooth(38.5+i*.3,40.5+i*.3,t)),scale:mix(.45,1,enter),tilt:i===0?4:i===1?-4:0};
    });
    nodes.coach={position:[-side,mobile?-.76:-.98,.35],opacity:S.smooth(24,25.8,t)*(1-S.smooth(33,35,t)),scale:1};
    nodes.nutritionist={position:[side,mobile?-.76:-.98,.35],opacity:S.smooth(24.8,26.6,t)*(1-S.smooth(33,35,t)),scale:1};
    nodes.ending={position:[0,mobile?-.5:-.63,1],opacity:f.ending,scale:1};
    if(mobile){
      // Mobile has a separate, readable composition, not scaled desktop cards.
      const primary=['goal','time','food'];
      lifestyle.forEach(name=>{const n=nodes[name],i=primary.indexOf(name);n.opacity=i<0?0:S.smooth(.6+i*.7,1.5+i*.7,t)*(1-S.smooth(8+i*.3,10+i*.3,t));n.position=[0,mix(-.45-i*.78,.2,converge),.25];});
      const done=S.smooth(32,34,t);
      nodes.workout.position=[0,.88,.25];nodes.nutrition.position=[0,-1.02,.25];nodes.progress.position=[0,-2.5,.25];
      nodes.workout.opacity*=1-done;nodes.nutrition.opacity*=1-done;
      nodes.coach.position=[0,-.15,.35];nodes.nutritionist.position=[0,-2.05,.35];
      nodes.progress.opacity*=S.smooth(19,21,t)*(1-S.smooth(23,24,t)+S.smooth(34,35,t));nodes.ending.position=[0,-.62,1];
      for(const name of ['workout','nutrition','progress']){nodes[name].position[0]+=(1-nodes[name].scale)*1.5;nodes[name].tilt=0;}
    }
    return {f,nodes,closing};
  }
  window.LiftLayout=layout;
  class World {
    constructor(canvas){
      if(!window.THREE)throw Error('Three.js is unavailable');
      this.T=window.THREE;const T=this.T;
      this.canvas=canvas;this.host=canvas.parentElement;this.nodes=[...document.querySelectorAll('[data-node]')];
      this.renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
      this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));this.renderer.outputColorSpace=T.SRGBColorSpace;
      this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
      this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(38,1,.1,50);
      this.ambient=new T.HemisphereLight('#e3e9d9','#061510',1.8);this.scene.add(this.ambient);
      const light=new T.DirectionalLight('#ffffff',3.5);light.position.set(-3,5,6);this.scene.add(light);
      const rim=this.rim=new T.DirectionalLight('#b7ff6a',2.6);rim.position.set(3,2,-3);this.scene.add(rim);
      const fill=this.fill=new T.PointLight('#8fd4aa',2,7,2);fill.position.set(0,.2,1.8);this.scene.add(fill);
      const env=new T.Scene();env.background=new T.Color('#162822');
      for(const [x,y,z,sx,sy,sz] of [[-3,2,3,1,6,2],[4,3,0,2,5,1],[0,5,0,5,1,5]]){const p=new T.Mesh(new T.BoxGeometry(sx,sy,sz),new T.MeshBasicMaterial({color:'#ffffff'}));p.position.set(x,y,z);env.add(p);}
      const pmrem=new T.PMREMGenerator(this.renderer);this.envTarget=pmrem.fromScene(env,.08);this.scene.environment=this.envTarget.texture;pmrem.dispose();env.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
      this.materials={
        body:new T.MeshPhysicalMaterial({color:'#527563',metalness:.82,roughness:.22,clearcoat:1,clearcoatRoughness:.17}),
        edge:new T.MeshStandardMaterial({color:'#b7ff6a',emissive:'#b7ff6a',emissiveIntensity:.3,roughness:.5,transparent:true,opacity:.8}),
        floor:new T.MeshStandardMaterial({color:'#0a2018',metalness:.5,roughness:.36}),
        ribbon:new T.MeshPhysicalMaterial({color:'#a9c9b0',metalness:.9,roughness:.19,clearcoat:1,side:T.DoubleSide}),
      };
      this.sphereGeo=new T.SphereGeometry(1,40,28);
      this.person=this.makePerson();this.scene.add(this.person);
      this.pedestal=new T.Group();this.scene.add(this.pedestal);
      const base=new T.Mesh(new T.CylinderGeometry(.68,.85,.11,72),this.materials.floor);base.position.y=-1.48;this.pedestal.add(base);
      const ring=new T.Mesh(new T.TorusGeometry(.69,.007,8,96),this.materials.edge);ring.rotation.x=Math.PI/2;ring.position.y=-1.419;this.pedestal.add(ring);
      this.core=new T.Group();this.core.position.y=.15;this.scene.add(this.core);
      this.coreMat=new T.ShaderMaterial({transparent:true,uniforms:{time:{value:0},strength:{value:1},cursor:{value:new T.Vector2()}},vertexShader:`varying vec3 vNormal;varying vec3 vPosition;varying vec3 vView;uniform float time;void main(){vNormal=normalize(normalMatrix*normal);vec3 p=position;float n=sin(p.x*7.+time*.55)*sin(p.y*8.-time*.4)*sin(p.z*6.+time*.3);p+=normal*n*.015;vec4 mv=modelViewMatrix*vec4(p,1.);vPosition=p;vView=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying vec3 vNormal;varying vec3 vPosition;varying vec3 vView;uniform float time;uniform float strength;uniform vec2 cursor;void main(){float f=pow(1.-abs(dot(normalize(vNormal),vView)),2.5);float n=sin(vPosition.y*17.+sin(vPosition.x*10.+time*.6)*2.+time)*sin(vPosition.z*13.-time*.35);float paths=pow(abs(n),12.);vec3 dark=vec3(.022,.072,.055);vec3 green=vec3(0.,.7,.37);vec3 c=dark+green*(f*.95+paths*.35);float glow=pow(max(0.,dot(normalize(vNormal),normalize(vec3(-.6,1.,1.)))),25.);c+=vec3(.7,.9,.8)*glow*.55;gl_FragColor=vec4(c,(.88+f*.12)*strength);}`});
      this.orb=new T.Mesh(new T.SphereGeometry(.68,64,48),this.coreMat);this.core.add(this.orb);
      const shellMat=new T.MeshPhysicalMaterial({color:'#223c33',metalness:.2,roughness:.09,transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false,clearcoat:1});
      this.shell=new T.Mesh(new T.SphereGeometry(.77,48,32),shellMat);this.core.add(this.shell);
      // Broad polished ribbons give the core a sculptural volume and real reflections.
      this.ribbons=new T.Group();this.core.add(this.ribbons);
      for(let k=0;k<3;k++){
        const vertices=[],indices=[];
        for(let j=0;j<=160;j++){
          const a=j/160*Math.PI*2;
          for(const side of [-1,1]){
            const w=side*.07,rad=.88+w*Math.cos(a*.5+k);
            vertices.push(Math.cos(a)*rad,Math.sin(a)*rad,.17*Math.sin(a*2+k)+w*Math.sin(a*.5+k));
          }
          if(j<160){const n=j*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
        }
        const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
        const band=new T.Mesh(geometry,this.materials.ribbon);band.rotation.set(k*.9,.45+k*.75,k*.6);this.ribbons.add(band);
      }
      this.filaments=[];
      for(let j=0;j<5;j++){
        const points=[];for(let i=0;i<=120;i++){const a=i/120*Math.PI*2;const theta=a+.14*Math.sin(a*3+j);const phi=(j/9)*Math.PI+Math.sin(a*2+j)*.13;const r=.71+j*.011;points.push(new T.Vector3(r*Math.cos(theta)*Math.sin(phi),r*Math.cos(phi),r*Math.sin(theta)*Math.sin(phi)));}
        const material=new T.LineBasicMaterial({color:j%3===0?'#a3b3bc':'#00f59b',transparent:true,opacity:.38,depthWrite:false});
        const line=new T.Line(new T.BufferGeometry().setFromPoints(points),material);this.core.add(line);this.filaments.push(line);
      }
      const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(0,245,155,.25)');gradient.addColorStop(.4,'rgba(0,245,155,.09)');gradient.addColorStop(1,'rgba(0,245,155,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);this.glowTexture=new T.CanvasTexture(c);
      this.halo=new T.Sprite(new T.SpriteMaterial({map:this.glowTexture,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));this.halo.scale.set(4,4,1);this.core.add(this.halo);
      this.paths=[];
      // These are the only specialist edges: coach→workout; nutritionist→nutrition.
      this.edges=[...lifestyle.map(id=>[id,'core','data']),['core','workout','plan'],['core','nutrition','plan'],['core','progress','plan'],['coach','workout','support'],['nutritionist','nutrition','support'],['workout','progress','growth'],['nutrition','progress','growth']];
      const pulseGeometry=new T.SphereGeometry(.022,8,6);
      for(const [from,to,type] of this.edges){const positions=new Float32Array(33*3);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));const mat=new T.LineBasicMaterial({color:'#b7ff6a',transparent:true,opacity:0,depthWrite:false});const line=new T.Line(geo,mat);this.scene.add(line);const pulse=new T.Mesh(pulseGeometry,this.materials.edge);this.scene.add(pulse);this.paths.push({from,to,type,line,pulse,positions,curve:new T.QuadraticBezierCurve3(new T.Vector3(),new T.Vector3(),new T.Vector3()),sample:new T.Vector3()});}
      const particleCount=innerWidth<801?64:150;
      this.particleData=Array.from({length:particleCount},(_,i)=>({a:i*2.399963,r:.9+((i*17)%71)/160,h:(i/particleCount-.5)*3.4}));
      const buffer=new Float32Array(particleCount*3),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(buffer,3));this.particles=new T.Points(geo,new T.PointsMaterial({color:'#00f59b',size:.017,transparent:true,opacity:.42,depthWrite:false}));this.scene.add(this.particles);
      this.pointer={x:0,y:0};this.currentPointer={x:0,y:0};this.hover=null;this.size={width:0,height:0};
      this.resize=()=>{this.size.width=this.host.clientWidth;this.size.height=this.host.clientHeight;this.renderer.setSize(this.size.width,this.size.height,false);this.camera.aspect=this.size.width/this.size.height;this.camera.updateProjectionMatrix();};
      this.resizeObserver=new ResizeObserver(this.resize);this.resizeObserver.observe(this.host);this.resize();
      this.onMove=e=>{const r=this.host.getBoundingClientRect();this.pointer.x=(e.clientX-r.left)/r.width-.5;this.pointer.y=(e.clientY-r.top)/r.height-.5;};
      this.onLeave=()=>{this.pointer.x=this.pointer.y=0;this.hover=null;};this.host.addEventListener('pointermove',this.onMove);this.host.addEventListener('pointerleave',this.onLeave);
      this.onLost=e=>{e.preventDefault();document.getElementById('scene-error').hidden=false;this.lost=true;};canvas.addEventListener('webglcontextlost',this.onLost);
      this.onRestored=()=>location.reload();canvas.addEventListener('webglcontextrestored',this.onRestored);
      this.nodes.forEach(el=>{el.addEventListener('pointerenter',()=>{this.hover=el.dataset.node;});el.addEventListener('pointerleave',()=>{this.hover=null;});});
      this.v=new T.Vector3();
    }
    syncTheme(){
      const css=getComputedStyle(document.documentElement),light=document.documentElement.dataset.theme==='light';
      const accent=css.getPropertyValue('--accent').trim()||'#b7ff6a';
      this.materials.edge.color.set(accent);this.materials.edge.emissive.set(accent);this.rim.color.set(accent);
      this.materials.body.color.set(light?'#8b9d85':'#527563');this.materials.floor.color.set(css.getPropertyValue('--surface').trim()||'#0a2018');
      this.paths.forEach(p=>p.line.material.color.set(accent));this.filaments.forEach(p=>p.material.color.set(accent));this.particles.material.color.set(accent);
      this.renderer.toneMappingExposure=light?.95:1.1;
    }
    ellipsoid(parent,x,y,z,sx,sy,sz){const m=new this.T.Mesh(this.sphereGeo,this.materials.body);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
    makePerson(){
      const T=this.T,g=new T.Group();
      const p=[[0,-.36],[.21,-.36],[.25,-.2],[.22,0],[.29,.37],[.38,.53],[.29,.64],[.1,.7],[0,.7]];
      const torso=new T.Mesh(new T.LatheGeometry(p.map(p=>new T.Vector2(...p)),64),this.materials.body);torso.scale.z=.62;g.add(torso);
      this.ellipsoid(g,0,.82,0,.09,.13,.095);this.ellipsoid(g,0,1.09,.015,.165,.223,.16);
      this.arms=[];
      for(const side of [-1,1]){
        const arm=new T.Group();arm.position.set(side*.35,.47,0);g.add(arm);this.ellipsoid(arm,0,-.18,0,.105,.27,.11);this.ellipsoid(arm,side*.025,-.59,.025,.071,.255,.082);this.ellipsoid(arm,side*.026,-.82,.03,.066,.105,.055);arm.rotation.z=side*.13;this.arms.push(arm);
        this.ellipsoid(g,side*.145,-.59,0,.135,.34,.15);this.ellipsoid(g,side*.155,-1.08,-.012,.079,.285,.093);this.ellipsoid(g,side*.155,-1.35,.075,.095,.066,.18);
      }
      const emblem=new T.Mesh(new T.BoxGeometry(.025,.10,.012),this.materials.edge);emblem.position.set(0,.35,.18);g.add(emblem);
      return g;
    }
    render(time,reduced=false){
      const T=this.T,mobile=innerWidth<=800,{f,nodes}=layout(time,mobile),t=f.time;
      this.currentPointer.x=mix(this.currentPointer.x,this.pointer.x,.035);this.currentPointer.y=mix(this.currentPointer.y,this.pointer.y,.035);
      const px=reduced?0:this.currentPointer.x,py=reduced?0:this.currentPointer.y;
      const z=mobile?10.65:10.05;
      this.camera.position.set(px*.3+(reduced?0:Math.sin(t*Math.PI*2/42)*.12),.13-py*.2,z);this.camera.lookAt(0,-.02,0);this.camera.updateMatrixWorld();
      const returning=S.smooth(32,35,t),exit=S.smooth(7.5,10,t);
      const personScale=Math.max(.001,1-exit+returning);
      const settle=returning*(1-S.smooth(39,42,t));
      this.person.scale.setScalar(personScale*(mobile?.82:1));this.person.position.set(0,mobile?1.05:settle*.14,settle*-.3);this.person.rotation.y=(reduced?0:Math.sin(t*Math.PI*2/42)*.10)+px*.14;
      this.arms.forEach((a,i)=>a.rotation.z=(i===0?-1:1)*(.13+settle*.10));
      this.pedestal.scale.setScalar(Math.max(.001,personScale*(mobile?.82:1)));this.pedestal.position.y=mobile?1.05:0;
      const coreScale=Math.max(.001,f.core*(1-S.smooth(16,19,t)*.45));this.core.scale.setScalar(coreScale);this.core.rotation.y=reduced?0:t*.075;this.core.rotation.z=px*.07;
      this.coreMat.uniforms.time.value=reduced?10:t;this.coreMat.uniforms.strength.value=clamp(f.core);this.coreMat.uniforms.cursor.value.set(px,py);
      this.halo.material.opacity=clamp(f.core)*(.72+(reduced?0:Math.sin(t*1.3)*.08));
      for(const el of this.nodes){const n=nodes[el.dataset.node];if(!n)continue;this.v.set(...n.position).project(this.camera);const x=(this.v.x*.5+.5)*this.size.width,y=(-this.v.y*.5+.5)*this.size.height;
        const hover=this.hover===el.dataset.node;const scale=n.scale;
        el.style.left=x+'px';el.style.top=y+'px';el.style.opacity=n.opacity.toFixed(3);el.style.transform='translate(-50%,-50%) scale('+scale.toFixed(3)+') rotateY('+((n.tilt||0)+px*(hover?9:4))+'deg) rotateX('+(-py*(hover?7:2))+'deg)';
        const visible=n.opacity>.7;el.style.pointerEvents=visible?'auto':'none';el.setAttribute('aria-hidden',String(!visible));if(el.tagName==='BUTTON')el.tabIndex=visible?0:-1;
      }
      const position=(id,target)=>id==='core'?target.set(0,.15,0):target.set(...nodes[id].position);
      this.paths.forEach((p,i)=>{
        let opacity=0;if(p.type==='data')opacity=S.smooth(7.5,9,t)*(1-S.smooth(12,14,t));
        if(p.type==='plan')opacity=f.modules*.30*(1-returning*.6);
        if(p.type==='support')opacity=f.support*.8;
        if(p.type==='growth')opacity=S.smooth(32,34,t)*(1-S.smooth(39,41,t))*.65;
        if(this.hover===p.from||this.hover===p.to)opacity=Math.min(1,opacity*1.8);
        if(mobile&&p.type==='growth')opacity=0;
        if(mobile&&p.type==='data'&&nodes[p.from].opacity===0)opacity=0;
        const curve=p.curve,a=position(p.from,curve.v0),b=position(p.to,curve.v2),c=curve.v1.copy(a).lerp(b,.5);c.z-=.6;c.y+=p.type==='support'?0:.18;
        for(let j=0;j<=32;j++){const v=curve.getPoint(j/32,p.sample);p.positions[j*3]=v.x;p.positions[j*3+1]=v.y;p.positions[j*3+2]=v.z;}
        p.line.geometry.attributes.position.needsUpdate=true;p.line.geometry.computeBoundingSphere();p.line.material.opacity=opacity;p.line.visible=opacity>.005;p.pulse.visible=opacity>.05;curve.getPoint(reduced?.5:(t*.22+i*.137)%1,p.pulse.position);p.pulse.scale.setScalar(opacity);
      });
      const particleAttr=this.particles.geometry.attributes.position;
      this.particleData.forEach((d,i)=>{const a=d.a+(reduced?0:t*Math.PI*2/42),core=f.core;const r=mix(2.5,d.r,core);particleAttr.setXYZ(i,Math.cos(a)*r,Math.sin(a)*1.65*(1-core)+d.h*core,Math.sin(a)*r*.6-1);});particleAttr.needsUpdate=true;this.particles.material.opacity=.14+f.core*.3;
      if(!this.lost)this.renderer.render(this.scene,this.camera);
      return {f,nodes};
    }
    dispose(){this.resizeObserver.disconnect();this.host.removeEventListener('pointermove',this.onMove);this.host.removeEventListener('pointerleave',this.onLeave);this.canvas.removeEventListener('webglcontextlost',this.onLost);this.canvas.removeEventListener('webglcontextrestored',this.onRestored);const geometries=new Set(),materials=new Set();this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.glowTexture.dispose();this.envTarget.dispose();this.renderer.dispose();}
  }
  window.LiftWorld=World;
})();
