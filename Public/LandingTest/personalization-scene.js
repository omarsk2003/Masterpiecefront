(() => {
  'use strict';
  window.buildLiftPersonalizationScene = (T, group, helpers) => {
    const {box,media} = helpers;
    const textures=[];
    const clamp=x=>Math.max(0,Math.min(1,x));
    const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
    const mix=(a,b,t)=>a+(b-a)*t;
    const round=(ctx,x,y,w,h,r,fill,stroke)=>{
      ctx.beginPath();ctx.roundRect(x,y,w,h,r);
      if(fill){ctx.fillStyle=fill;ctx.fill();}
      if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
    };
    const texture=(w,h,draw)=>{
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      draw(canvas.getContext('2d'),w,h);
      const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;textures.push(t);return t;
    };
    const makeCard=(top,bottom,index,output=false)=>texture(640,208,(c,w,h)=>{
      round(c,4,4,w-8,h-8,24,output?'#e6eae3':'#25332e',output?'#c3d0c1':'#718779');
      round(c,24,27,8,154,4,output?'#668443':'#00E894');
      c.font='700 23px Arial';c.fillStyle=output?'#516551':'#b9d49a';c.fillText(output?'YOUR PLAN / 0'+(index+1):'YOUR LIFE / 0'+(index+1),49,66);
      c.font='bold 43px Arial';c.fillStyle=output?'#17241c':'#f0f2e8';c.fillText(top,48,125);
      c.font='25px Arial';c.fillStyle=output?'#4c5f53':'#b8c8bd';c.fillText(bottom,49,169);
    });
    const inputData=[
      ['GOAL','Build strength'],['AVAILABLE TIME','25 min today'],
      ['SLEEP','7 hours'],['HEALTH','Low-impact options'],
      ['SCHEDULE','Work runs late'],['HOME OR GYM','Train at home'],
      ['FOOD HABITS','Simple meals'],['FITNESS LEVEL','Getting started']
    ];
    const outputData=[
      ['WORKOUT','3 sessions / week'],['NUTRITION','Daily meal guidance'],
      ['RECOVERY','Rest + mobility'],['PROGRESS','Track + adapt']
    ];
    const shellMat=new T.MeshStandardMaterial({color:0x687770,metalness:.72,roughness:.28});
    const trimMat=new T.MeshStandardMaterial({color:0x151d1a,metalness:.35,roughness:.4});
    const darkMat=new T.MeshBasicMaterial({color:0x0f1815});
    const shape=new T.Shape();
    const x=-1.1,y=-2.1,w=2.2,h=4.2,r=.27;
    shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
    shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
    shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
    const phone=new T.Group();group.add(phone);
    const frame=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:3,curveSegments:8}),shellMat);
    frame.castShadow=true;phone.add(frame);
    const screenBack=new T.Mesh(new T.ShapeGeometry(shape),trimMat);
    screenBack.position.z=.19;screenBack.scale.set(.955,.975,1);phone.add(screenBack);
    const screenTexture=texture(600,1120,(c,W,H)=>{
      c.fillStyle='#14221e';c.fillRect(0,0,W,H);
      c.fillStyle='#dce9d7';c.font='bold 58px Arial';c.fillText('LIFT',55,97);
      c.font='bold 29px Arial';c.fillStyle='#a9c48d';c.fillText('YOUR LIFE, UNDERSTOOD',55,148);
      round(c,43,211,514,160,25,'#243930','#3a5948');
      c.fillStyle='#e9f2e6';c.font='bold 43px Arial';c.fillText('Your week starts here',70,275);
      c.fillStyle='#c5d4c8';c.font='29px Arial';c.fillText('25 minutes available today',70,326);
      c.fillStyle='#b9d48c';c.font='bold 26px Arial';c.fillText('WHAT LIFT LEARNS',55,448);
      const rows=[['Goal','Build strength'],['Time','25 min'],['Sleep','7 hours'],['Where','Home']];
      rows.forEach(([a,b],i)=>{const Y=480+i*126;round(c,44,Y,512,106,17,'#1d3028','#344a3b');c.font='27px Arial';c.fillStyle='#adc0b1';c.fillText(a,68,Y+41);c.font='bold 34px Arial';c.fillStyle='#e7eee5';c.fillText(b,68,Y+82);});
      c.fillStyle='#d0e3b0';c.font='bold 29px Arial';c.fillText('BUILD MY PLAN  →',68,1057);
    });
    const resultTexture=texture(600,1120,(c,W,H)=>{
      c.fillStyle='#14221e';c.fillRect(0,0,W,H);
      c.fillStyle='#dce9d7';c.font='bold 58px Arial';c.fillText('LIFT',55,97);
      c.fillStyle='#b9d48c';c.font='bold 27px Arial';c.fillText('YOUR PLAN IS READY',55,158);
      c.font='bold 47px Arial';c.fillStyle='#eef3e8';c.fillText('Made for your week.',55,250);
      c.font='28px Arial';c.fillStyle='#c4d2c5';c.fillText('25 minutes today. Real progress ahead.',55,306);
      const rows=[['MON  /  MOVE','Strength · 25 min'],['WED  /  FUEL','Meals that fit'],['FRI  /  RECOVER','Mobility · 15 min'],['SUN  /  REVIEW','Track and adapt']];
      rows.forEach(([a,b],i)=>{const Y=380+i*157;round(c,43,Y,514,137,19,'#21372d','#46654a');round(c,44,Y,9,137,4,'#bbdc87');c.fillStyle='#bfd89b';c.font='bold 26px Arial';c.fillText(a,75,Y+45);c.fillStyle='#edf2e9';c.font='bold 35px Arial';c.fillText(b,75,Y+94);});
      c.fillStyle='#cce7a2';c.font='bold 28px Arial';c.fillText('PLAN ADAPTS WITH YOU  ↗',55,1067);
    });
    const screen=media(phone,screenTexture,0,0,.207,1.98,3.92);screen.material.color.setHex(0xffffff);
    box(phone,0,1.98,.245,.48,.042,.015,darkMat);
    box(phone,1.14,.55,.05,.05,.55,.1,shellMat);
    box(phone,-1.14,.84,.05,.05,.31,.1,shellMat);
    const inputCards=inputData.map(([title,detail],i)=>{
      const mesh=media(group,makeCard(title,detail,i),0,0,.55,1.58,.515);
      mesh.material.color.setHex(0xffffff);mesh.material.transparent=true;mesh.renderOrder=2;
      return mesh;
    });
    const outputCards=outputData.map(([title,detail],i)=>{
      const mesh=media(group,makeCard(title,detail,i,true),0,0,.74,1.9,.62);
      mesh.material.color.setHex(0xffffff);mesh.material.transparent=true;mesh.renderOrder=3;
      return mesh;
    });
    const phoneLight=new T.PointLight(0xb5d0b4,.62,4,2);phoneLight.position.set(1.7,.6,1.8);group.add(phoneLight);
    const inputYs=[1.86,1.32,.78,.24,-.3,-.84,-1.38,-1.92];
    const outputYs=[1.28,.45,-.38,-1.21];
    let showingResult=false;
    function update(progress,isMobile){
      const q=clamp(progress),gather=smooth(.12,.45,q),reveal=smooth(.38,.68,q);
      const baseX=isMobile?.48:2.03,phoneShift=isMobile?-1.05:-1.55;
      phone.position.set(baseX+phoneShift*reveal,-.02,.15);
      phone.rotation.y=mix(-.18,.09,reveal);
      phone.rotation.z=mix(-.035,.025,reveal);
      phone.scale.setScalar(isMobile?.68:1);
      if((reveal>.44)!==showingResult){showingResult=reveal>.44;screen.material.map=showingResult?resultTexture:screenTexture;screen.material.needsUpdate=true;}
      inputCards.forEach((card,i)=>{
        const originX=(isMobile?-.58:-.18)+(i%2)*.4;
        const originY=inputYs[i]*(isMobile?.78:1);
        card.position.set(mix(originX,baseX-.3,gather),mix(originY,.1,gather),mix(.82,.11,gather));
        card.rotation.y=mix(i%2?-.07:.06,0,gather);
        const s=(isMobile?.73:1)*(1-gather*.48);card.scale.set(s,s,1);
        card.material.opacity=1-smooth(.31,.52,q);
        card.visible=card.material.opacity>.01;
      });
      outputCards.forEach((card,i)=>{
        const destX=isMobile?.65:3.18;
        card.position.set(mix(baseX+.1,destX,reveal),outputYs[i]*(isMobile?.69:1),mix(.2,.8,reveal));
        const s=(isMobile?.62:.82)*mix(.62,1,reveal);card.scale.set(s,s,1);
        card.material.opacity=reveal;card.visible=reveal>.01;
      });
    }
    update(0,false);
    return {update,dispose:()=>{textures.forEach(t=>t.dispose());shellMat.dispose();trimMat.dispose();darkMat.dispose();}};
  };
})();
