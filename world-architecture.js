// Building types are authored as silhouettes, structures and moving mechanisms.
// Dimensions are local metres; the city keeps its existing placement envelopes.
export const ARCHITECTURE = {
  cloudbell:{family:'post',types:['折信邮局','风铃钟楼','骑楼书铺'],life:'纸鸟绕着屋脊送信，檐下的邮铃轻轻摆动。'},
  east:{family:'paper',types:['悬挑画室','折纸藏书阁','空中投递站'],life:'错层楼阁托起折纸屋顶，漂浮信笺沿空中邮路绕行。'},
  grove:{family:'grove',types:['梦蕾伞屋','树根书屋','垂藤种子馆'],life:'菌伞与种荚缓慢呼吸，走近时会舒展得更明显。'},
  whale:{family:'sky',types:['鲸骨机库','浮云气象台','气囊旅行社'],life:'小飞艇与云团悬在屋顶上，等待下一阵顺风。'},
  harbor:{family:'tide',types:['高脚帆屋','倒船修理铺','螺壳潮汐馆'],life:'风帆轻摆，潮汐仪里的小船一上一下地浮动。'},
  gear:{family:'clock',types:['齿轮钟坊','蒸汽茶炉','传动修理铺'],life:'齿轮相向咬合，摆锤给整条街数着拍子。'},
  dunes:{family:'desert',types:['捕风塔','月牙商帐','瓶中绿洲'],life:'商帐接住热风，悬浮水晶为旅人辨认方向。'},
  snow:{family:'aurora',types:['棱晶藏书屋','星环观测站','极光折光塔'],life:'星环与望远镜缓缓转动，冰晶把夜灯折成冷色的光。'},
  garden:{family:'garden',types:['拱肋温室','开花茶亭','水轮育苗坊'],life:'花瓣屋顶随着呼吸开合，水轮照料玻璃温室里的幼苗。'},
  kite:{family:'wind',types:['风筝裁缝铺','四翼风车塔','悬铃候风站'],life:'风车、风筝与悬铃各自摆动，整条街都在读风。'}
};

export function architectureGeometry(THREE,shape){
  const extrude=(path,depth=.9,bevel=.04)=>{
    const g=new THREE.ExtrudeGeometry(path,{depth,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:8});
    g.translate(0,0,-depth/2);return g;
  };
  if(shape==='block'){
    const s=new THREE.Shape();s.moveTo(-.46,-.46);s.lineTo(.46,-.46);s.lineTo(.46,.46);s.lineTo(-.46,.46);s.closePath();return extrude(s,.92,.04);
  }
  if(shape==='gable'){
    const s=new THREE.Shape();s.moveTo(-.5,-.5);s.lineTo(.5,-.5);s.lineTo(0,.5);s.closePath();return extrude(s,1,.025);
  }
  if(shape==='sail'||shape==='leaf'){
    const s=new THREE.Shape();s.moveTo(0,-.5);
    if(shape==='leaf'){s.quadraticCurveTo(-.65,0,0,.5);s.quadraticCurveTo(.65,0,0,-.5);}
    else{s.quadraticCurveTo(-.65,-.4,-.48,-.5);s.quadraticCurveTo(-.12,.15,.12,.65);s.quadraticCurveTo(.22,-.05,.5,-.5);s.quadraticCurveTo(.2,-.36,0,-.5);}
    s.closePath();return extrude(s,.035,.012);
  }
  if(shape==='arch'){
    const s=new THREE.Shape();s.moveTo(-.5,-.5);s.lineTo(-.5,0);s.absarc(0,0,.5,Math.PI,0,true);s.lineTo(.5,-.5);s.closePath();return extrude(s,.15,.02);
  }
  if(shape==='gear'){
    const s=new THREE.Shape();for(let i=0;i<48;i++){const a=i*Math.PI/24,r=i%4===0||i%4===3?.48:.58;if(i)s.lineTo(Math.cos(a)*r,Math.sin(a)*r);else s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}s.closePath();
    const hole=new THREE.Path();hole.absarc(0,0,.2,0,Math.PI*2,true);s.holes.push(hole);return extrude(s,.12,.015);
  }
  if(shape==='cap'||shape==='bottle'){
    const points=shape==='cap'?[[0,-.18],[.45,-.18],[.58,-.1],[.5,.04],[.35,.25],[.16,.4],[0,.46]]:[[0,-.5],[.32,-.5],[.5,-.28],[.47,.06],[.22,.27],[.18,.4],[.18,.5],[0,.5]];
    return new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),16);
  }
  if(shape==='vault'){
    const v=[],indices=[];for(let i=0;i<=16;i++)for(const z of [-.5,.5])v.push(Math.cos(i*Math.PI/16)*.5,Math.sin(i*Math.PI/16)*.5,z);
    for(let i=0;i<16;i++){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  const constructors={
    orb:()=>new THREE.SphereGeometry(.5,16,10),column:()=>new THREE.CylinderGeometry(.5,.5,1,12),
    stem:()=>new THREE.CylinderGeometry(.32,.5,1,10),cone:()=>new THREE.ConeGeometry(.5,1,12),
    ring:()=>new THREE.TorusGeometry(.5,.045,6,28),rib:()=>new THREE.TorusGeometry(.5,.025,6,20,Math.PI),
    crystal:()=>new THREE.OctahedronGeometry(.5),hex:()=>new THREE.CylinderGeometry(.5,.5,1,6)
  };
  return constructors[shape]();
}

export function buildingRecipe(THREE,district,index){
  const spec=ARCHITECTURE[district.id],type=index%3,parts=[],PI=Math.PI;
  const C={ivory:0xf3e2c6,ink:0x293f4d,stone:0xa7a79f,wood:0x8f674c,gold:0xd7a75b,glass:0x8bc5d1,light:0xffd69c,
    wall:district.colors[index%3],roof:district.roof,leaf:0x6f9c7c,rose:0xc47e91};
  const p=(shape,surface,color,x,y,z,sx,sy=sx,sz=sx,rotation=[0,0,0],motion=null)=>{
    const part={shape,surface,color,position:[x,y,z],scale:[sx,sy,sz],rotation,rotationOrder:'YXZ',motion};parts.push(part);return part;
  };
  const motion=(kind,pivot,axis='y',speed=.6,amount=.16)=>({kind,pivot,axis,speed,amount,phase:index*.83});
  const beam=(a,b,width=.1,surface='wood',color=C.wood)=>{
    const vector=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
    const part=p('column',surface,color,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,width,vector.length(),width);
    part.quaternion=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),vector.normalize()).toArray();return part;
  };
  const window=(x,y,z,r=.43,angle=0)=>{
    p('orb','light',C.light,x,y,z,r,r,.09,[0,angle,0]);p('ring','metal',C.gold,x+Math.sin(angle)*.035,y,z+Math.cos(angle)*.035,r*1.1,r*1.1,.28,[0,angle,0]);
  };
  const door=(y=.65,z=1.18)=>p('arch','wood',C.ink,0,y,z,.66,1.18,.4);
  const gable=(y=3.1,width=3,depth=2.7,color=C.roof)=>p('gable','roof',color,0,y,0,width,1.45,depth);
  const frame=(height=2.8,width=2.35,depth=2.05)=>{
    p('block','plaster',C.wall,0,height/2+.18,0,width,height,depth);
    for(const x of [-width/2,width/2])p('block','wood',C.wood,x,height/2+.18,depth/2,.13,height,.12);
    p('block','wood',C.wood,0,1.45,depth/2+.04,width,.12,.1);door(.7,depth/2+.06);
    for(const x of [-.72,.72])window(x,height-.4,depth/2+.08,.46);
    window(width/2+.06,height*.6,0,.49,PI/2);window(-width/2-.06,height*.6,0,.49,-PI/2);
    window(0,height*.68,-depth/2-.06,.54,PI);
  };
  const flag=(x,y,z,color=C.rose)=>{
    p('column','metal',C.gold,x,y-.55,z,.045,1.2,.045);
    p('sail','cloth',color,x+.24,y-.15,z,.7,.54,.8,[0,0,-.15],motion('sway',[x,y-.15,z],'y',1,.22));
  };
  const gear=(x,y,z,size=1,reverse=false)=>p('gear','metal',C.gold,x,y,z,size,size,.8,[0,0,0],motion('spin',[x,y,z],'z',reverse?-.38:.32));
  const foundation=p('stem','stone',C.stone,0,-.18,0,2.9,.7,2.7);foundation.foundation=true;
  let height=5;

  if(spec.family==='post'){
    frame(type===1?3.7:2.6,type===1?1.9:2.5);gable(type===1?4.3:3.1,type===1?2.5:3.1);
    if(type===0){p('block','wood',C.wood,0,.48,1.46,2.35,.16,.7);p('sail','cloth',C.roof,0,1.95,1.6,2.6,.9,1.2,[.75,0,PI]);flag(.9,4,0);}
    if(type===1){p('ring','metal',C.gold,0,3.2,1.09,.85,.85,.3);p('orb','plaster',C.ivory,0,3.2,1.09,.77,.77,.08);p('block','metal',C.ink,0,3.37,1.17,.05,.4,.05,[0,0,-.25]);}
    if(type===2){for(let i=0;i<4;i++)p('block','roof',i%2?C.roof:C.rose,(i-1.5)*.43,.9,1.25,.28,.65,.25,[0,0,(i-1.5)*.1]);}
    p('cone','metal',C.gold,-1.1,2.9,1.32,.3,.4,.3,[0,0,0],motion('sway',[-1.1,3.2,1.32],'z',1.7,.25));
    const flightY=type===1?5.7:4.4;
    for(const side of [-1,1])p('sail','cloth',C.ivory,1.65+side*.17,flightY,.35,.55,.42,.8,[PI/2,0,side*.45],motion('spin',[0,flightY,0],'y',.25));
    height=Math.max(height,flightY+.35);
  }else if(spec.family==='paper'){
    frame(2.3,2,1.85);
    p('block','plaster',C.ivory,type===0?.42:-.35,3,0,2.5,1.35,2.2,[0,.16,0]);
    p('gable','roof',C.roof,.15,4.1,0,3.5,1.3,2.8,[0,type===1?PI/2:0,-.12]);
    beam([-1.25,2.25,1.1],[1.25,3.8,1.1],.13,'metal',C.gold);
    for(const x of [-.58,.58])window(x,3.1,1.2,.52);
    if(type===1){p('gable','roof',C.rose,-.3,5,0,2.65,1,2.15,[0,PI/2,0]);height=6;}
    if(type===2){p('column','metal',C.gold,0,4.8,0,.12,2.3,.12);p('ring','metal',C.gold,0,5.65,0,1.7,1.7,.7,[PI/2,0,0]);height=6.5;}
    for(let i=0;i<2;i++)p('gable','cloth',C.ivory,.9-i*1.8,4.9+i*.4,.4,.6,.4,.08,[0,.3,i*.4],motion('float',[0,0,0],'y',.8,.22));
  }else if(spec.family==='grove'){
    if(type===0){
      p('stem','plaster',C.ivory,0,1.65,0,2.05,3.1,1.9);p('cap','roof',0xb875a4,0,3.15,0,3.3,2.5,3.2,[0,0,.08],motion('breathe',[0,3.15,0],'y',.8,.035));
      for(let i=0;i<5;i++){const a=i*PI*.4;p('orb','plaster',C.ivory,Math.cos(a)*.95,3.75,Math.sin(a)*.95,.38,.12,.38);}
      door(.75,1);window(-.62,1.9,.84,.47);window(.62,1.9,.84,.47);height=4.8;
    }else if(type===1){
      p('stem','wood',C.wood,0,2.2,0,1.45,4.3,1.4,[0,0,-.08]);
      p('block','wood',0xa68161,.25,2.8,0,2.4,1.65,2.1,[0,.18,0]);p('block','wood',C.wood,.25,2.1,0,3,.16,2.6);
      for(const side of [-1,1])beam([side*1.3,0,.65],[side*.4,2.2,0],.26);
      for(let i=0;i<5;i++){const a=i*PI*.4;p('leaf','leaf',i%2?0x6d9777:0x95b084,Math.sin(a)*.7,4.2,Math.cos(a)*.7,2.1,3.2,1.2,[1,a,0],motion('sway',[0,3.8,0],'z',.65,.07));}
      window(.25,2.9,1.08,.65);height=5.8;
    }else{
      beam([-1.35,0,0],[-.9,4.6,0],.3);beam([1.35,0,0],[.8,4.9,0],.24);beam([-.9,4.6,0],[.8,4.9,0],.18);
      p('orb','roof',0x93ac80,0,2.8,0,2.4,3.4,2.2,[0,0,0],motion('sway',[0,4.7,0],'z',.7,.07));
      p('leaf','leaf',0x658b76,0,4.4,0,1.2,2,1,[0,.5,.9]);window(0,2.8,1.1,.75);door(.65,.8);height=5.4;
    }
  }else if(spec.family==='tide'){
    for(const x of [-1,1])for(const z of [-.88,.88])p('column','wood',C.wood,x,.75,z,.16,1.7,.16);
    p('block','wood',0x9e8060,0,1.35,0,2.8,.22,2.5);
    if(type===0){
      p('block','plaster',0xe1e9dd,-.15,2.1,0,2.1,1.35,1.95);p('column','metal',C.gold,.25,3.2,0,.08,4,.08);
      p('sail','cloth',0xffe3b6,.15,3.8,0,3,2.8,2.4,[0,.25,0],motion('sway',[.25,3.2,0],'y',.65,.11));height=5.9;
    }else if(type===1){
      p('block','plaster',0xa4c9cf,0,2.35,0,2.3,1.8,2.1);p('orb','wood',C.wood,0,3.2,0,3.2,1.55,2.7);
      for(const x of [-1,-.5,0,.5,1]){const f=Math.sqrt(1-(x/1.6)**2);p('rib','metal',C.gold,x,3.2,0,2.78*f,1.64*f,.9,[0,PI/2,0]);}flag(0,4.5,0,0xe89f85);
    }else{
      p('orb','plaster',0xe7c2af,0,2.7,0,2.65,2.9,2.4);
      for(let i=0;i<4;i++){const y=3.9-i*.45,size=2.77*Math.sqrt(1-((y-2.7)/1.5)**2);p('ring','roof',C.roof,0,y,0,size,size*.91,.7,[PI/2+.08,0,i*.13]);}
      p('cone','roof',C.roof,0,4.2,0,.8,.8,.8);height=5;
    }
    door(1.9,1.06);for(const x of [-.67,.67])window(x,2.6,1.12,.45);
    p('ring','cloth',0xdf956f,1.2,1.65,1.12,.55,.55,.5);
    p('orb','roof',C.roof,-.8,4.7,.2,.65,.2,.3,[0,0,.2],motion('float',[0,0,0],'y',1.2,.16));
  }else if(spec.family==='clock'){
    if(type===0){
      frame(4,1.9,1.8);gable(4.65,2.5,2.35);p('orb','plaster',C.ivory,0,3.4,.97,1.3,1.3,.12);gear(0,3.4,1.09,1.15);
      p('block','metal',C.ink,0,3.62,1.22,.055,.5,.06,[0,0,.4],motion('spin',[0,3.4,1.22],'z',.2));height=5.8;
    }else if(type===1){
      p('column','metal',0x6f9696,0,1.8,0,2.5,3.2,2.5);p('cap','metal',C.gold,0,3.35,0,2.4,1.3,2.4);
      for(const x of [-.8,.65]){p('column','metal',C.gold,x,4.2,-.15,.36,2,.36);p('ring','metal',C.ink,x,5.1,-.15,.5,.5,.5,[PI/2,0,0]);}
      window(0,2.3,1.28,.85);door(.8,1.26);height=5.6;
    }else{
      frame(2.5,2.6,2.05);for(const x of [-.72,.72])p('gable','metal',0x678c8c,x,3.1,0,1.55,1.5,2.65);
      beam([-1.15,0,-.8],[-1.15,4.9,-.8],.17,'metal',C.ink);beam([-1.15,4.9,-.8],[1.3,4.9,-.8],.16,'metal',C.gold);height=5.6;
    }
    gear(-.5,1.75,1.25,.85);gear(.4,1.7,1.25,.72,true);
    p('column','metal',C.gold,0,2.3,1.35,.055,1.4,.055,[0,0,.15],motion('sway',[0,3,1.35],'z',1.6,.32));
    p('orb','metal',C.gold,0,1.6,1.35,.32,.32,.12,[0,0,0],motion('sway',[0,3,1.35],'z',1.6,.32));
  }else if(spec.family==='desert'){
    if(type===0){
      p('block','plaster',0xd9b38a,0,2,0,2.3,3.7,2.1);p('block','stone',C.ivory,0,3.65,0,2.7,.18,2.5);
      for(const x of [-.7,.7])p('block','plaster',C.ivory,x,4.3,0,.32,1.3,1.55);
      p('gable','roof',0x639e97,0,5,0,2.7,.65,2.2);door(.8,1.08);height=5.7;
    }else if(type===1){
      p('block','plaster',C.wall,0,.75,0,2.7,1.15,2.2);
      for(const x of [-1.3,1.3])p('column','wood',C.wood,x,1.8,0,.1,3.6,.1);
      p('sail','cloth',0xbc7f68,0,2.9,0,3.5,2.3,2.6,[0,0,0],motion('sway',[0,3.5,0],'y',.5,.07));
      p('ring','metal',C.gold,0,3.7,0,.9,.9,.8);height=4.5;
    }else{
      p('bottle','glass',0x7cb8a7,0,2.1,0,2.8,4,2.6);p('ring','metal',C.gold,0,3.7,0,1.1,1.1,.9,[PI/2,0,0]);p('cone','metal',C.gold,0,4.35,0,1.45,.7,1.45);
      p('orb','leaf',0x7c9b6e,0,1.9,0,1.15,2.5,1.15);door(.8,1.18);height=5;
    }
    for(const x of [-.7,.7])window(x,1.9,1.12,.4);
    p('crystal','glass',0x99d8bf,0,5.35,0,.48,.85,.48,[0,.4,0],motion('float',[0,0,0],'y',.65,.15));height=Math.max(height,6);
  }else if(spec.family==='aurora'){
    if(type===0){
      p('gable','glass',0x9ccdd7,0,2.1,0,3,4.1,2.35);p('gable','roof',0x56778e,0,2.18,-.24,3.15,4.3,1.75);
      for(const x of [-1.5,1.5])beam([x,.1,1.2],[0,4.3,1.2],.12,'metal',C.ivory);
      door(.65,1.26);window(0,2.3,1.26,.6);height=5;
    }else if(type===1){
      p('hex','stone',0x9aafb9,0,1.65,0,2.4,3,2.4);p('orb','metal',0x698da3,0,3.25,0,2.6,1.8,2.6);
      p('column','metal',C.ivory,0,4.1,.4,.55,2,.55,[.8,0,.2],motion('sway',[0,3.6,0],'y',.35,.5));
      for(let i=0;i<2;i++)p('ring','metal',i?C.gold:0xa1d8dc,0,4.25,0,2.8,2.8,.9,[.7+i*.5,.4,0],motion('spin',[0,4.25,0],'y',.25*(i?1:-1)));
      door(.7,1.08);window(0,2.1,1.18,.62);height=6.2;
    }else{
      p('hex','stone',0x8a9aaf,0,1.4,0,2.35,2.5,2.35);
      for(const x of [-.65,.65])p('crystal','glass',x<0?0xa8bce2:0x9ad1d8,x,3.6,0,1.35,4.6,1.7,[0,0,x*.16]);
      p('ring','metal',C.gold,0,3,0,2.7,2.7,1,[PI/2,.25,0]);door(.75,1.13);height=6.6;
    }
    p('crystal','aether',0xb8e4ed,0,4.9,0,.3,.65,.3,[0,0,0],motion('float',[0,0,0],'y',.5,.13));
  }else if(spec.family==='garden'){
    if(type===0){
      p('block','stone',C.ivory,0,.5,0,2.7,.7,2.6);p('vault','glass',0xa7cfb6,0,1.1,0,2.8,3.3,2.7);
      for(const z of [-1.25,-.4,.4,1.25])p('rib','metal',C.ivory,0,1.1,z,2.8,3.3,.8);
      for(const x of [-.65,.65])p('orb','leaf',C.leaf,x,1.5,0,.7,1.5,.7);door(.7,1.37);height=3.6;
    }else if(type===1){
      p('stem','plaster',C.wall,0,1.5,0,2,2.8,2);p('orb','light',C.light,0,3,0,.8,.7,.8);
      for(let i=0;i<6;i++){const a=i*PI/3;p('leaf','roof',i%2?0xd6a5a9:0xe9c4ac,Math.sin(a)*.7,3.15,Math.cos(a)*.7,1.7,2.8,.9,[.9,a,0],motion('sway',[0,3,0],'x',.55,.1));}
      door(.7,.99);window(-.6,1.8,.83,.42);window(.6,1.8,.83,.42);height=4.8;
    }else{
      frame(3.25,1.85,1.85);p('vault','glass',0xa4cdb4,0,3.35,0,2.4,2.4,2.3);
      const hub=[0,1.6,1.2],turn=motion('spin',hub,'z',.32);
      p('ring','wood',C.wood,...hub,1.7,1.7,1,[0,0,0],turn);
      for(let i=0;i<8;i++){const a=i*PI/4;p('block','wood',C.wood,Math.sin(a)*.67,1.6+Math.cos(a)*.67,1.2,.4,.17,.3,[0,0,-a],turn);}
      p('block','glass',0x78bebb,0,.23,1.35,2.1,.12,.65);p('block','glass',0x90d6cb,.8,1.65,1.25,.13,2.3,.12);
      for(const x of [-.9,.9])p('orb','leaf',C.leaf,x,3.7,0,.55,1.5,.6);height=5.2;
    }
  }else if(spec.family==='sky'){
    if(type===0){
      p('block','stone',C.ivory,0,.45,0,2.8,.5,2.6);p('vault','roof',0x899eae,0,.85,0,3,4.6,2.7);
      for(const z of [-1.3,-.5,.5,1.3])p('rib','stone',0xf1d6bb,0,.85,z,3,4.6,.8);
      p('orb','metal',C.gold,0,1.25,0,1.25,.5,2);height=4.8;
    }else{
      frame(type===1?2.7:2.1,2.15,2);p('block','wood',C.wood,0,3,0,2.7,.18,2.5);
      const y=type===1?4.3:4.7;
      p('orb',type===1?'plaster':'cloth',type===1?C.ivory:0xd2a5b0,0,y,0,2.65,type===1?1.3:2.5,2.15,[0,0,0],motion('float',[0,0,0],'y',.6,.18));
      if(type===1)for(const x of [-.9,.8])p('orb','plaster',C.ivory,x,y+.15,0,1.7,1.4,1.8,[0,0,0],motion('float',[0,0,0],'y',.6,.18));
      else p('ring','metal',C.gold,0,y,0,2.7,2.2,.55,[PI/2,0,0],motion('float',[0,0,0],'y',.6,.18));
      for(const x of [-.85,.85])beam([x,2.9,0],[x*.65,y,0],.045,'metal',C.gold);height=6.3;
    }
    p('orb','roof',0x718fa1,0,5.2,.1,1.7,.5,.6,[0,.4,0],motion('float',[0,0,0],'y',.75,.22));
    for(const side of [-1,1])p('leaf','cloth',C.ivory,side*.65,5.23,.12,.55,1.2,.6,[PI/2,0,side*.8],motion('sway',[side*.4,5.23,.12],'z',1,.12));height=Math.max(height,6);
  }else if(spec.family==='wind'){
    if(type===0){
      frame(2.35,2.2,1.9);p('sail','cloth',0xb39cbf,0,3.6,0,3.4,2.6,2.5,[0,.3,0],motion('sway',[0,3.3,0],'y',.7,.14));flag(0,5.3,0);height=5.9;
    }else if(type===1){
      p('stem','stone',C.ivory,0,2.3,0,2.3,4.3,2.2);p('cone','roof',0x7e8da9,0,4.8,0,2.8,1.3,2.8);door(.65,1.1);window(0,2.2,1.02,.6);
      const hub=[0,3.7,1.4];p('orb','metal',C.gold,...hub,.36,.36,.2);
      for(let i=0;i<4;i++){const a=i*PI/2;p('leaf','cloth',i%2?0xe4c9a2:0xa2b8c1,Math.sin(a)*.7,3.7+Math.cos(a)*.7,1.4,.55,1.7,.7,[0,0,-a],motion('spin',hub,'z',.65));}height=5.8;
    }else{
      for(const x of [-1.15,1.15])beam([x,0,0],[x*.7,4.6,0],.19,'metal',C.gold);
      p('gable','roof',0x8a91ac,0,4.6,0,3.1,.75,2.3);p('block','wood',C.wood,0,1.4,0,2.6,.2,2.3);
      for(let i=0;i<3;i++){
        const x=(i-1)*.66;p('column','metal',C.gold,x,3,0,.045,2,.045);
        p('cone','metal',i%2?C.gold:0x8faaa8,x,2.1,0,.6,.65,.6,[0,0,0],motion('sway',[x,4,0],'z',1+i*.3,.15));
      }height=5.4;
    }
  }
  return {family:spec.family,type:spec.types[type],height,parts};
}
