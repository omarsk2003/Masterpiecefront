(() => {
  'use strict';
  window.buildLiftDayEnvironment = (T, day, helpers) => {
    const {box, label, line, mobile} = helpers;
    const mat = (color, roughness = .88, metalness = .04) =>
      new T.MeshStandardMaterial({color, roughness, metalness});
    const concrete = mat(0x79877f), warmStone = mat(0x9b9f93);
    const charcoal = mat(0x34423b), pavement = mat(0x5c6b62);
    const glass = new T.MeshPhysicalMaterial({color:0x647b79,roughness:.23,metalness:.18,transparent:true,opacity:.76,clearcoat:.35});
    const glassDark = mat(0x344c4a,.32,.15);
    const metal = mat(0x9da99f,.43,.52), wood = mat(0x776858,.76);
    const subtleLight = new T.MeshBasicMaterial({color:0x77ddb2});
    const pathLight = new T.MeshBasicMaterial({color:0x00f59b,transparent:true,opacity:.68});
    const localMaterials = [concrete,warmStone,charcoal,pavement,glass,glassDark,metal,wood,subtleLight,pathLight];
    const structure = (parent,x,y,z,w,h,d,m,shadow=true) => {
      const o = box(parent,x,y,z,w,h,d,m);
      o.castShadow=shadow;o.receiveShadow=true;return o;
    };
    const group = (x,z) => {const g=new T.Group();g.position.set(x,0,z);day.add(g);return g;};
    // One continuous urban plinth anchors the five moments in the same place.
    structure(day,0,-1.76,-.55,10.5,.24,5.35,pavement,false);
    structure(day,0,-1.60,-2.54,10.5,.09,1.15,charcoal,false);
    structure(day,0,-1.56,1.56,10.5,.045,.86,warmStone,false);
    for(let i=0;i<8;i++) {
      structure(day,-4.55+i*1.3,-1.61,1.1,.014,.01,2.8,concrete,false);
    }
    // Route sits inside the paving, with a muted inlaid light line.
    const routePts=[[-4.15,-1.51,.45],[-2.28,-1.51,.45],[-.18,-1.51,.45],[1.82,-1.51,.45],[4.1,-1.51,.45]];
    const route=line(day,routePts,0x00f59b);
    route.material.opacity=.86;
    const beacon=new T.Mesh(new T.SphereGeometry(.075,12,10),subtleLight);
    day.add(beacon);
    const stops=[
      {x:-4.15,title:'HOME'},{x:-2.28,title:'WORK'},{x:-.18,title:'MOVE'},
      {x:1.82,title:'FUEL'},{x:4.1,title:'RECOVER'}
    ];
    // HOME: a low residence with entrance, glazing, roof and a small porch.
    {
      const g=group(-4.15,-1.16);
      structure(g,0,-.96,0,1.38,1.14,1.15,warmStone);
      structure(g,0,-.36,-.03,1.58,.12,1.38,charcoal);
      structure(g,0,-.29,-.22,1.38,.025,.65,metal,false);
      structure(g,-.42,-1.07,.59,.32,.69,.055,glassDark,false);
      structure(g,.33,-.89,.59,.4,.44,.055,glass,false);
      structure(g,.33,-.89,.62,.025,.44,.01,metal,false);
      structure(g,0,-1.52,.73,1.55,.11,.55,concrete,false);
      structure(g,-.18,-1.47,1.04,1.1,.035,.29,warmStone,false);
      label(g,'HOME',0,.17,.7,.45);
    }
    // WORK: taller, regular facade with setbacks, mullions and a recessed lobby.
    {
      const g=group(-2.28,-1.52);
      structure(g,0,-.43,0,1.33,2.31,1.18,concrete);
      structure(g,0,.78,-.1,1.47,.11,1.3,charcoal);
      structure(g,0,-.37,.605,1.17,1.91,.035,glassDark,false);
      for(let j=0;j<4;j++) structure(g,0,-1.17+j*.52,.64,1.2,.055,.055,metal,false);
      for(let j=0;j<3;j++) structure(g,-.41+j*.41,-.32,.66,.035,1.95,.055,metal,false);
      structure(g,0,-1.27,.67,.37,.51,.035,glass,false);
      structure(g,0,-1.54,.9,1.47,.07,.65,warmStone,false);
      label(g,'WORK',0,1.18,.7,.45);
    }
    // MOVE: low training pavilion, covered running lane and inset track marks.
    {
      const g=group(-.18,-1.72);
      structure(g,0,-1.39,0,1.67,.24,1.44,concrete);
      for(const x of [-.68,.68]) for(const z of [-.55,.55]) structure(g,x,-.62,z,.075,1.46,.075,metal,false);
      structure(g,0,.16,0,1.86,.105,1.66,charcoal);
      structure(g,0,-.5,-.58,1.47,1.25,.045,glass,false);
      for(let j=0;j<3;j++) structure(g,-.48+j*.48,-1.25,.78,.05,.012,1.56,pathLight,false);
      structure(g,0,-1.57,1.2,1.9,.065,.55,warmStone,false);
      label(g,'MOVE',0,.58,.7,.45);
    }
    // FUEL: a small cafe-like volume, glazing, canopy and timber counter.
    {
      const g=group(1.82,-1.44);
      structure(g,0,-1.07,0,1.46,.93,1.16,warmStone);
      structure(g,0,-.55,.12,1.7,.1,1.33,charcoal);
      structure(g,0,-1.01,.61,1.3,.68,.04,glass,false);
      structure(g,0,-1.19,.66,1.35,.095,.12,wood,false);
      for(const x of [-.5,.5]) structure(g,x,-1.02,.66,.035,.69,.04,metal,false);
      structure(g,0,-1.57,.87,1.65,.07,.78,concrete,false);
      label(g,'FUEL',0,-.17,.7,.45);
    }
    // RECOVER: a quiet pergola, seating and planted stone vessels.
    {
      const g=group(4.1,-1.57);
      structure(g,0,-1.53,0,1.72,.13,1.5,concrete,false);
      for(const x of [-.72,.72]) for(const z of [-.59,.59]) structure(g,x,-.76,z,.055,1.48,.055,metal,false);
      for(let j=0;j<5;j++) structure(g,-.68+j*.34,.02,0,.065,.065,1.65,wood,false);
      structure(g,0,-1.13,-.26,1.23,.1,.38,wood,false);
      for(const x of [-.47,.47]) structure(g,x,-1.38,-.26,.075,.39,.075,charcoal,false);
      for(const x of [-.83,.83]) {
        structure(g,x,-1.31,.77,.28,.42,.29,warmStone,false);
        const foliage=new T.Mesh(new T.IcosahedronGeometry(.24,0),mat(0x556f59));
        foliage.position.set(x,-.92,.77);g.add(foliage);
      }
      label(g,'RECOVER',0,.48,.7,.48);
    }
    // Background massing and foreground edges give the camera multiple depth layers.
    if(!mobile.matches) {
      const back=group(-.25,-4.25);
      structure(back,-3.4,-.64,0,1.3,2.9,1.1,charcoal);
      structure(back,-1.58,-.38,0,1.5,3.4,1.2,concrete);
      structure(back,1.05,-.94,0,1.8,2.27,1.05,warmStone);
      structure(back,3.55,-.57,0,1.5,3.02,1.05,charcoal);
      for(let j=0;j<9;j++) {
        const x=-4.2+j*1.03;
        structure(back,x,-1.46,.57,.42,.025,.08,glassDark,false);
      }
      structure(day,-5.1,-1.12,1.36,.14,1.05,.7,charcoal,false);
      structure(day,5.1,-1.12,1.36,.14,1.05,.7,charcoal,false);
    }
    // The changing time appears as a small sign within the environment.
    label(day,'45 MIN  →  25 MIN',.16,1.68,-.1,.88);
    return {route,beacon,routePts,dispose:()=>localMaterials.forEach(m=>m.dispose())};
  };
})();
