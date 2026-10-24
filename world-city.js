import {ARCHITECTURE,architectureGeometry,buildingRecipe} from './world-architecture.js';
import {SURFACES} from './world-style.js';

// Hand-authored neighborhoods and layered transport for the existing nine-region world.
export const CITY_DISTRICTS = [
  {id:'cloudbell',name:'云铃环城街',en:'CLOUDBELL LANES',x:9,z:5,rings:[12.5,22],style:'post',colors:[0xf5dfb8,0xe8bfa1,0xb7d5c5],roof:0x579e96,link:[7,3.8],story:'邮戳屋顶挨着花店，晾衣绳上停满了等回信的纸鸟。'},
  {id:'east',name:'铃东叠屋街',en:'EASTERN ROOFTOPS',x:48,z:2,rings:[8,16],style:'post',colors:[0xf3d6ad,0xe8bbb0,0xd4dfb7],roof:0x74a7b0,link:[27,4],story:'圆顶和尖顶沿坡错落，纸鸟在金色信箱与门前花盆之间传信。'},
  {id:'grove',name:'梦孢灯巷',en:'LANTERN GROVE',x:-46,z:18,rings:[8,16],style:'grove',colors:[0xe8cce0,0xd4d5e8,0xc1dbc9],roof:0xac83b4,link:[-20,16],story:'伞屋之间卖梦蕾和热茶，夜灯精沿着弯弯的街道散步。'},
  {id:'whale',name:'鲸眠花坊',en:'WHALEBLOOM QUARTER',x:-7,z:-65,rings:[8,15],style:'bloom',colors:[0xf2d6c3,0xf4dfb3,0xc7ded4],roof:0xdc9f9f,link:[-4,-32],story:'风筝挂满花坊的露台，赶路的人总能带走一朵花。'},
  {id:'harbor',name:'海风阶街',en:'SEABREEZE TERRACES',x:80,z:47,rings:[15,24],style:'harbor',colors:[0xc9e8df,0xf1d7b7,0xd0deef],roof:0x65acb8,link:[73,40],story:'圆鼓鼓的贝壳小屋围着海港，救生圈挂在门边，暖圆窗一盏盏亮起。'},
  {id:'gear',name:'发条南城',en:'CLOCKWORK SOUTH',x:10,z:100,rings:[15,24],style:'clock',colors:[0xe6c6a2,0xc6d4c1,0xf0dba7],roof:0x7e9992,link:[4,92],story:'修钟铺和面包摊共用一条街；观光班车在高架上慢慢经过。'},
  {id:'dunes',name:'薄荷驿城',en:'MINT CARAVANSERAI',x:-82,z:54,rings:[15,24],style:'dune',colors:[0xf0d6a2,0xe8b99e,0xdac8b4],roof:0xcd8d80,link:[-74,47],story:'连片的圆顶屋围住树荫，商队把风铃挂在每个拱门上。'},
  {id:'snow',name:'星邮坡城',en:'STARPOST HILLSIDE',x:77,z:-78,rings:[10,18],style:'snow',colors:[0xe6eeee,0xc8dce9,0xd8d1e7],roof:0x8aabc2,link:[86,-76],story:'陡屋顶接住落雪，观景桥把山坡上的星邮小屋连起来。'},
  {id:'garden',name:'雨歇花园坊',en:'AFTER-RAIN GARDENS',x:-21,z:61,rings:[8,16],style:'bloom',colors:[0xe4d7bd,0xd7e3c2,0xf0cfbd],roof:0x87ae91,link:[-8,42],story:'花商沿林荫道推着小车，桥下的长椅总留着一个空位。'},
  {id:'kite',name:'风筝中转街',en:'KITEWAY CROSSING',x:53,z:-41,rings:[8,16],style:'clock',colors:[0xd8dddb,0xf0d6b0,0xd6cce1],roof:0x858fae,link:[29,-22],story:'去雪境的旅人先在这里读一封信，再沿星邮长桥上山。'}
];

export const CITY_SKYWAYS = [
  {id:'seabell',name:'铃海空中大道',from:'云铃环城街',to:'泡泡海港',color:0x74b8b9,width:4.8,points:[[25,1,0],[38,9,5],[55,13,8.5],[72,21,8.5],[84,30,6],[87,39,0]],note:'从邮戳屋顶出发，掠过沿海街区。'},
  {id:'flowerclock',name:'花钟环城高架',from:'梦孢林南侧',to:'发条南城',color:0xd7ac77,width:4.8,points:[[-7,32,0],[1,43,6],[14,57,10],[20,72,10],[22,85,5],[17,91,0]],note:'桥上有班车，桥下是花园和赶集的小路。'},
  {id:'starpost',name:'星邮观景长桥',from:'暮光钟城',to:'星邮坡城',color:0x9caed2,width:4.6,points:[[34,-21,0],[45,-30,5],[60,-42,8.5],[73,-53,8.5],[84,-64,5],[87,-73,0]],note:'从钟城一路上山，夜里顺着星灯抵达雪境。'},
  {id:'mintwind',name:'薄荷回风栈道',from:'梦孢林南侧',to:'薄荷驿城',color:0xaca6c2,width:4.4,points:[[-22,35,0],[-35,43,4],[-51,51,7],[-65,61,5],[-76,63,0]],note:'薄荷色桥柱把林地、花园与糖沙商路串起来。'}
];

export function createCityWorld(THREE, env) {
  const TAU=Math.PI*2, roots=[], districts=[], skyways=[], houses=[], pedestrians=[], traffic=[], motionInstances=[], movingBatches=new Set();
  let batches, shapes, solid, glow, surfaces, crowdMeshes=[];
  const ink=0x596967, cream=0xf6e7c5, ground=env.terrainHeight;
  const vec=new THREE.Object3D(), tint=new THREE.Color();
  const motionPose=new THREE.Object3D(),motionMatrix=new THREE.Matrix4();
  const clamp=THREE.MathUtils.clamp;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

  function prepareAssets(){
    shapes={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,8,6),cone:new THREE.ConeGeometry(1,1,8),pillar:new THREE.CylinderGeometry(1,1,1,8),ring:new THREE.TorusGeometry(1,.12,6,16)};
    surfaces=Object.fromEntries(Object.keys(SURFACES).map(profile=>[profile,env.material(0xffffff,{},profile)]));
    solid=surfaces.plaster;glow=surfaces.light;
  }
  function add(shape,x,y,z,sx,sy,sz,color,angle=0,lit=false,tiltX=0,tiltZ=0){
    const profile=lit?'light':'plaster',key=shape+'-'+profile;
    if(!batches.has(key))batches.set(key,[]);
    batches.get(key).push({shape,x,y,z,sx,sy,sz,color,angle,lit,tiltX,tiltZ,profile});
  }
  function flush(name){
    const root=new THREE.Group();root.name=name;
    for(const list of batches.values()){
      const first=list[0],mesh=new THREE.InstancedMesh(shapes[first.shape],surfaces[first.profile],list.length);
      list.forEach((p,i)=>{
        if(p.matrix)mesh.setMatrixAt(i,p.matrix);
        else{vec.position.set(p.x,p.y,p.z);vec.rotation.set(p.tiltX,p.angle,p.tiltZ,'YXZ');vec.scale.set(p.sx,p.sy,p.sz);vec.updateMatrix();mesh.setMatrixAt(i,vec.matrix);}
        mesh.setColorAt(i,tint.set(p.color));
      });
      mesh.castShadow=!['glass','light','aether'].includes(first.profile);mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);
      let hull=null;
      // Glass is framed by structural ribs; an opaque back hull would hide its interior.
      if(name.startsWith('city-district-')&&first.profile!=='glass'){
        hull=new THREE.InstancedMesh(mesh.geometry,env.outlineMat,list.length);
        hull.instanceMatrix.copy(mesh.instanceMatrix);hull.computeBoundingSphere();
        hull.name='inverted-hull';hull.userData.isOutline=true;hull.renderOrder=-1;hull.visible=env.state.outline;
        root.add(hull);env.outlines.push(hull);
      }
      list.forEach((p,i)=>{if(p.motion){motionInstances.push({...p.motion,mesh,hull,index:i});movingBatches.add(mesh);if(hull)movingBatches.add(hull);}});
      // Animated parts stay inside this padded bound; distant districts can still be culled.
      if(list.some(p=>p.motion)){mesh.boundingSphere.radius+=3.5;if(hull)hull.boundingSphere.radius+=3.5;}
    }
    env.addProp(root);batches=new Map();return root;
  }
  function nearestSegment(points,x,z){
    let best=null;
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz;
      const t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(l2||1),0,1),px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(x-px,z-pz);
      if(!best||d<best.distance){const l=Math.sqrt(l2)||1;best={x:px,z:pz,y:a.y+(b.y-a.y)*t,distance:d,nx:-dz/l,nz:dx/l,i,t};}
    }
    return best;
  }
  function roadClearance(x,z){
    let value=Infinity;
    for(const road of env.roads){
      const b=road.cityBounds;if(b&&(x<b[0]-5||x>b[1]+5||z<b[2]-5||z>b[3]+5))continue;
      for(let i=0;i<road.points.length;i+=3){const p=road.points[i];value=Math.min(value,Math.hypot(x-p.x,z-p.z)-road.width/2);}
    }
    return value;
  }
  function safeStreet(anchors,width){
    const curve=new THREE.CatmullRomCurve3(anchors.map(p=>new THREE.Vector3(p[0],0,p[1])),false,'centripetal');
    const samples=curve.getSpacedPoints(Math.max(8,Math.ceil(curve.getLength()/2)));
    const obstacles=[...env.buildings.filter(b=>!b.city).map(b=>({x:b.x,z:b.z,r:b.radius+width/2+.6})),...env.tales.map(p=>({x:p.x,z:p.z,r:8+width/2}))];
    for(const p of samples)for(let pass=0;pass<3;pass++)for(const o of obstacles){
      const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<o.r){p.x=o.x+(dx||.01)/(d||.01)*o.r;p.z=o.z+dz/(d||.01)*o.r;}
    }
    return samples.map(p=>[p.x,p.z]);
  }
  function street(id,anchors,width=2.35,type='stone'){
    env.makeRoad('city-'+id,safeStreet(anchors,width),type,width);
    const road=env.roads.at(-1);road.city=true;
    // Adjacent ribbons overlap at intersections; a stable depth offset prevents flicker.
    for(const part of [road.shoulder,road.mesh,road.markings]){
      part.material=part.material.clone();part.material.polygonOffset=true;part.material.polygonOffsetFactor=-.1;part.material.polygonOffsetUnits=-env.roads.length;
    }
    road.cityBounds=[Math.min(...road.points.map(p=>p.x)),Math.max(...road.points.map(p=>p.x)),Math.min(...road.points.map(p=>p.z)),Math.max(...road.points.map(p=>p.z))];
    return road;
  }
  function reserved(x,z,r=2){
    return Math.hypot(x,z)>131-r||ground(x,z)<-.65||
      env.tales.some(p=>Math.hypot(x-p.x,z-p.z)<10+r)||
      env.activities.some(a=>a.stops.some(p=>Math.hypot(x-p.x,z-p.z)<3+r))||
      env.life.some(p=>Math.hypot(x-p.x,z-p.z)<4+r)||
      env.residents.some(p=>Math.hypot(x-p.x,z-p.z)<2.5+r)||
      env.buildings.some(b=>Math.hypot(x-b.x,z-b.z)<b.radius+r+.8)||
      skyways.some(s=>nearestSegment(s.points,x,z).distance<s.def.width/2+r+1)||roadClearance(x,z)<r+.35;
  }
  function house(d,x,z,angle,index){
    const wide=1.35+(index%3)*.12,depth=1.35+(index%2)*.1;
    const samples=[ground(x,z),ground(x-wide,z-depth),ground(x+wide,z+depth)];
    const base=Math.max(...samples)+.12,recipe=buildingRecipe(THREE,d,index);
    const parent=new THREE.Matrix4().compose(new THREE.Vector3(x,base,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angle),new THREE.Vector3(1,1,1));
    for(const part of recipe.parts){
      const shape='architecture-'+part.shape,profile=part.surface,key=shape+'-'+profile;
      if(!shapes[shape])shapes[shape]=architectureGeometry(THREE,part.shape);
      if(part.foundation){const h=Math.max(.7,base-Math.min(...samples)+.35);part.scale[1]=h;part.position[1]=.17-h/2;}
      vec.position.set(...part.position);vec.scale.set(...part.scale);
      if(part.quaternion)vec.quaternion.fromArray(part.quaternion);else vec.rotation.set(...part.rotation,part.rotationOrder);
      vec.updateMatrix();const local=vec.matrix.clone(),matrix=parent.clone().multiply(local);
      const motion=part.motion?{definition:part.motion,local,parent,x,z,family:recipe.family,inversePivot:new THREE.Matrix4().makeTranslation(...part.motion.pivot.map(v=>-v))}:null;
      if(!batches.has(key))batches.set(key,[]);
      batches.get(key).push({shape,profile,color:part.color,matrix,motion});
    }
    const collider=new THREE.Group();collider.position.set(x,base,z);
    const record={group:collider,x,z,radius:Math.hypot(wide,depth)+.1,height:recipe.height,kind:'city-house',city:true,district:d.id,family:recipe.family,type:recipe.type};
    env.buildings.push(record);houses.push(record);return record;
  }
  function furnishing(x,z,index,d){
    if(Math.hypot(x,z)>131||env.tales.some(p=>Math.hypot(x-p.x,z-p.z)<9))return;
    const h=ground(x,z);
    add('pillar',x,h+1.5,z,.065,3,.065,ink);
    add('ball',x,h+3,z,.22,.28,.22,0xffd68f,0,true);
    add('cone',x,h+3.35,z,.4,.3,.4,d.roof);
    if(index%2===0){
      add('box',x+1,h+.22,z,.8,.4,.8,0xc69a78);add('ball',x+1,h+.7,z,.54,.55,.54,0x8db38b);
      add('ball',x+.85,h+1,z,.18,.15,.18,index%4?0xe8a5b3:0xf1ce8e);
    }else{add('box',x+.8,h+.5,z,1.1,.16,.5,0xb58f69);for(const side of [-1,1])add('box',x+.8+side*.38,h+.23,z,.1,.48,.35,ink);}
  }

  function buildDistrictRoads(d){
    const rings=d.rings.map((radius,k)=>{
      const points=Array.from({length:17},(_,i)=>[d.x+Math.cos(i*TAU/16)*radius,d.z+Math.sin(i*TAU/16)*radius]);
      return street(d.id+'-ring-'+k,points,k?2.25:2.65,d.style==='grove'||d.style==='dune'?'wood':d.style==='snow'?'star':'stone');
    });
    for(let i=0;i<4;i++){const a=i*Math.PI/2+.25;
      street(d.id+'-lane-'+i,d.rings.map(r=>[d.x+Math.cos(a)*r,d.z+Math.sin(a)*r]),1.8,'stone');}
    const nearest=rings[0].points.reduce((a,p)=>Math.hypot(p.x-d.link[0],p.z-d.link[1])<Math.hypot(a.x-d.link[0],a.z-d.link[1])?p:a);
    street(d.id+'-entry',[d.link,[nearest.x,nearest.z]],2.5,'stone');
    districts.push({def:d,rings,entry:nearest,houses:0});
  }
  function buildDistrict(district){
    const d=district.def;let index=0;
    for(const radius of [(d.rings[0]+d.rings[1])/2,d.rings[1]+4]){
      const count=Math.floor(TAU*radius/5.1);
      for(let i=0;i<count;i++){
        const a=(i+.35)*TAU/count,x=d.x+Math.cos(a)*radius,z=d.z+Math.sin(a)*radius;
        if(reserved(x,z,2.25))continue;
        house(d,x,z,Math.atan2(d.x-x,d.z-z),index++);district.houses++;
      }
    }
    for(let i=0;i<16;i++){const a=i*TAU/16,r=d.rings[1]+1.7,x=d.x+Math.cos(a)*r,z=d.z+Math.sin(a)*r;
      if(!env.buildings.some(b=>Math.hypot(x-b.x,z-b.z)<b.radius+.7))furnishing(x,z,i,d);}
    const root=flush('city-district-'+d.id);root.userData.district=d.id;
    env.sign(d.name,district.entry.x,district.entry.z,'#f7e7c4');
    for(let i=0;i<4;i++)pedestrians.push({path:district.rings[1].points,phase:i*.24,style:i,color:d.colors[i%3]});
  }
  function skyGeometry(points,halfWidth,yOffset){
    const vertices=[],indices=[];
    points.forEach((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],l=Math.hypot(b.x-a.x,b.z-a.z)||1;
      for(const side of [-1,1])vertices.push(p.x-(b.z-a.z)/l*halfWidth*side,p.y+yOffset,p.z+(b.x-a.x)/l*halfWidth*side);
      if(i<points.length-1){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}
    });
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
  }
  function buildSkyway(def){
    const curve=new THREE.CatmullRomCurve3(def.points.map(([x,z,lift])=>new THREE.Vector3(x,lift,z)),false,'centripetal');
    const points=curve.getSpacedPoints(Math.ceil(curve.getLength()/.7)).map(p=>new THREE.Vector3(p.x,ground(p.x,p.z)+Math.max(0,p.y)+.12,p.z));
    const route={def,points,length:curve.getLength()};skyways.push(route);
    for(const [w,offset,color] of [[def.width/2+.18,-.17,ink],[def.width/2,0,def.color],[.055,.015,cream]]){
      const mesh=new THREE.Mesh(skyGeometry(points,w,offset),env.toon(color,{side:THREE.DoubleSide}));mesh.receiveShadow=true;mesh.castShadow=true;mesh.name='skyway-deck-'+def.id;env.addProp(mesh);
    }
    for(let i=0;i<points.length-1;i++){
      const p=points[i],q=points[i+1],dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,angle=Math.atan2(dx,dz);
      for(const side of [-1,1]){
        const x=(p.x+q.x)/2+nx*(def.width/2-.03)*side,z=(p.z+q.z)/2+nz*(def.width/2-.03)*side,y=(p.y+q.y)/2;
        add('box',x,y+.75,z,.09,.12,l+.05,cream,angle);
        add('box',x,y+.25,z,.12,.25,l+.05,ink,angle);
        if(i%5===0){add('pillar',x,y+.43,z,.065,.86,.065,cream);add('ball',x,y+.93,z,.13,.16,.13,0xffdb93,0,true);}
      }
      if(i%13===6&&p.y-ground(p.x,p.z)>1.4){
        for(const side of [-1,1]){
          const x=p.x+nx*(def.width/2+.55)*side,z=p.z+nz*(def.width/2+.55)*side,bottom=ground(x,z),height=p.y-bottom-.25;
          if(height<.3||roadClearance(x,z)<.7||env.activities.some(a=>a.stops.some(s=>Math.hypot(x-s.x,z-s.z)<2.5)))continue;
          add('pillar',x,bottom+height/2,z,.28,height,.28,def.color);
          add('box',x,bottom+.1,z,.9,.24,.9,cream);
          const collider=new THREE.Group();collider.position.set(x,bottom,z);env.buildings.push({group:collider,x,z,radius:.4,height,kind:'bridge-pier',city:true});
        }
        add('box',p.x,p.y-.32,p.z,def.width+1.65,.3,.45,cream,angle);
      }
    }
    flush('skyway-structure-'+def.id);
    // Short ground approaches make every ramp part of the street network.
    for(const [end,index] of [[points[0],0],[points.at(-1),1]]){
      let near=null,best=Infinity;
      for(const road of env.roads.filter(r=>!r.id.includes('approach')))for(let i=0;i<road.points.length;i+=5){const p=road.points[i],d=dist(p,end);if(d<best){best=d;near=p;}}
      if(near&&best>.5)street(def.id+'-approach-'+index,[[near.x,near.z],[end.x,end.z]],3.2,'star');
      env.sign((index?'驶离 · ':'坡道 ↑ ')+def.name,end.x+3,end.z,'#f3dbab');
    }
    for(let i=0;i<2;i++){
      const bus=new THREE.Group(),color=i?0xf1c58c:def.color;
      const part=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;bus.add(m);};
      part(shapes.box,env.toon(color),0,.7,0,.95,.7,1.7);part(shapes.box,env.toon(cream),0,1.15,0,1.05,.18,1.85);
      part(shapes.box,env.toon(0x6a969e),0,.93,.86,.72,.35,.05);
      const wheelMaterial=env.toon(ink);
      for(const side of [-1,1])for(const z of [-.48,.48])part(shapes.ball,wheelMaterial,side*.49,.27,z,.18,.18,.18);
      bus.name='sightseeing-shuttle';env.addProp(bus);traffic.push({group:bus,route,phase:i*.5});
    }
  }
  function buildCrowds(){
    for(const shape of ['body','head','hat']){
      const mesh=new THREE.InstancedMesh(shape==='hat'?shapes.cone:shapes.ball,solid,pedestrians.length);mesh.castShadow=true;mesh.userData.crowdPart=shape;
      pedestrians.forEach((p,i)=>mesh.setColorAt(i,tint.set(shape==='head'?cream:p.color)));mesh.frustumCulled=false;env.addProp(mesh);crowdMeshes.push(mesh);
    }
  }
  function clear(){
    if(roots.length)env.disposeObjects(roots);
    for(let i=env.props.length-1;i>=0;i--)if(env.props[i].userData.cityManaged)env.props.splice(i,1);
    for(let i=env.roads.length-1;i>=0;i--)if(env.roads[i].city)env.roads.splice(i,1);
    for(let i=env.buildings.length-1;i>=0;i--)if(env.buildings[i].city)env.buildings.splice(i,1);
    roots.length=0;districts.length=0;skyways.length=0;houses.length=0;pedestrians.length=0;traffic.length=0;crowdMeshes=[];motionInstances.length=0;movingBatches.clear();
  }
  function build(){
    clear();prepareAssets();batches=new Map();const start=env.props.length;
    CITY_DISTRICTS.forEach(buildDistrictRoads);
    CITY_SKYWAYS.forEach(buildSkyway);
    districts.forEach(buildDistrict);buildCrowds();
    for(const root of env.props.slice(start)){root.userData.cityManaged=true;roots.push(root);}
    update(0,0,0);
  }
  function surfaceInfo(x,z,referenceY=ground(x,z),step=1){
    let result=null;
    for(const route of skyways){const p=nearestSegment(route.points,x,z);
      if(p.distance<=route.def.width/2+.02&&p.y<=referenceY+step&&(!result||p.y>result.y))result={...p,route};
    }
    return result;
  }
  function surfaceHeight(x,z,referenceY=ground(x,z)){
    return Math.max(ground(x,z),surfaceInfo(x,z,referenceY)?.y??-Infinity);
  }
  function constrain(position,previous,radius=.5,offset=.03){
    const deck=surfaceInfo(previous.x,previous.z,previous.y-offset,.3);
    if(!deck||Math.abs(previous.y-offset-deck.y)>1.1||deck.y-ground(previous.x,previous.z)<.8)return;
    const p=nearestSegment(deck.route.points,position.x,position.z),half=deck.route.def.width/2-radius-.13;
    if(p.distance<=half)return;
    const dx=position.x-p.x,dz=position.z-p.z,l=Math.hypot(dx,dz)||1;
    position.x=p.x+dx/l*half;position.z=p.z+dz/l*half;
  }
  function savedSurface(x,z,y){
    const deck=Number.isFinite(y)?surfaceInfo(x,z,y,.45):null;
    return deck&&Math.abs(deck.y-y)<1.8?Math.max(ground(x,z),deck.y):ground(x,z);
  }
  function sample(points,t){
    const u=clamp(t,0,.999999)*(points.length-1),i=Math.floor(u),a=points[i],b=points[i+1],f=u-i;
    return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,z:a.z+(b.z-a.z)*f,angle:Math.atan2(b.x-a.x,b.z-a.z)};
  }
  function update(dt,t,night){
    if(!glow)return;glow.emissiveIntensity=.1+night*1.7;surfaces.aether.emissiveIntensity=.2+night*1.4;
    const player=env.getPlayer?.();
    for(const item of motionInstances){
      const m=item.definition,near=player?Math.max(0,1-Math.hypot(player.position.x-item.x,player.position.z-item.z)/9):0;
      const wave=Math.sin(t*m.speed+m.phase)*m.amount*(1+near*.45);
      motionPose.position.set(...m.pivot);motionPose.rotation.set(0,0,0,'XYZ');motionPose.scale.set(1,1,1);
      if(m.kind==='float')motionPose.position.y+=wave;
      else if(m.kind==='breathe')motionPose.scale.set(1+wave,1+wave*1.7,1+wave);
      else motionPose.rotation[m.axis]=m.kind==='spin'?t*m.speed+m.phase:wave;
      motionPose.updateMatrix();motionMatrix.copy(item.parent).multiply(motionPose.matrix).multiply(item.inversePivot).multiply(item.local);
      item.mesh.setMatrixAt(item.index,motionMatrix);item.hull?.setMatrixAt(item.index,motionMatrix);
    }
    movingBatches.forEach(mesh=>mesh.instanceMatrix.needsUpdate=true);
    for(const item of traffic){
      const cycle=(t*.022+item.phase)%1,forward=cycle<.5,u=forward?cycle*2:2-cycle*2,p=sample(item.route.points,u),side=forward?.65:-.65;
      item.group.position.set(p.x+Math.cos(p.angle)*side,p.y+.08,p.z-Math.sin(p.angle)*side);item.group.rotation.y=p.angle+(forward?0:Math.PI);
    }
    pedestrians.forEach((person,i)=>{
      const p=sample(person.path,(t*.008+person.phase)%1),y=ground(p.x,p.z);
      crowdMeshes.forEach(mesh=>{const part=mesh.userData.crowdPart;vec.position.set(p.x,y+(part==='body'?.4:part==='head'?.88:1.22)+Math.sin(t*4+i)*.025,p.z);vec.rotation.set(0,p.angle,0);vec.scale.set(part==='body'?.22:part==='head'?.26:.32,part==='body'?.36:part==='head'?.26:.35,part==='body'?.18:.25);vec.updateMatrix();mesh.setMatrixAt(i,vec.matrix);});
    });
    crowdMeshes.forEach(mesh=>mesh.instanceMatrix.needsUpdate=true);
  }
  function location(x,z,y){
    const deck=surfaceInfo(x,z,y,.2);if(deck&&Math.abs(y-deck.y)<2)return {name:deck.route.def.name,en:'SKYWAY · ABOVE THE LITTLE CITY',rule:deck.route.def.note};
    const d=districts.find(d=>Math.hypot(x-d.def.x,z-d.def.z)<d.def.rings[1]+4)?.def;
    return d?{name:d.name,en:d.en,rule:ARCHITECTURE[d.id].life}:null;
  }
  function mapSVG(){
    const poly=(points,color,width,dash='')=>`<polyline points="${points.filter((p,i)=>i%3===0||i===points.length-1).map(p=>p.x+','+p.z).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="'+dash+'"':''} stroke-linejoin="round"/>`;
    return '<g class="city-map-streets">'+env.roads.filter(r=>r.city).map(r=>poly(r.points,'#a99b85',.65)).join('')+houses.map(b=>`<rect x="${b.x-1.2}" y="${b.z-1.2}" width="2.4" height="2.4" rx=".35" fill="#c28e72" opacity=".85"/>`).join('')+'</g><g class="city-map-skyways">'+skyways.map(s=>poly(s.points,'#f6e9c3',3.4)+poly(s.points,'#b47d52',1.8)+poly(s.points,'#ffedb2',.55,'1.3 1.3')).join('')+'</g>';
  }
  function guide(){
    return `<section class="city-guide"><div class="city-guide-heading"><div><small>STREETS & SKYWAYS</small><h3>沿着街巷，走到屋顶上方</h3></div><p>${houses.length} 幢新增建筑 · ${districts.length} 片街区 · ${skyways.length} 条可通行高架</p></div><div class="skyway-cards">${CITY_SKYWAYS.map((s,i)=>`<article><small>0${i+1} / SKYWAY</small><h4>${s.name}</h4><p>${s.from} ↔ ${s.to}</p><span>${s.note}</span><button data-skyway="${s.id}">去坡道入口 ↑</button></article>`).join('')}</div><div class="city-destinations">${districts.map(d=>`<button data-city="${d.def.id}">${d.def.name}<small>${ARCHITECTURE[d.def.id].types.join(' · ')}<br>${d.houses} 幢建筑 ↗</small></button>`).join('')}</div><p class="atlas-footnote">步行或驾驶邮车、小巴沿坡道上桥。桥下仍可通行；观光班车与街上小居民会沿固定路线来回。棕金色双线是高架，细线是地面街道。</p></section>`;
  }
  function visit(id,sky=false){
    const target=sky?skyways.find(s=>s.def.id===id)?.points[0]:districts.find(d=>d.def.id===id)?.entry;
    if(target)env.travel(target.x,target.z);
  }
  function occupied(x,z,r=2){return houses.some(b=>Math.hypot(x-b.x,z-b.z)<b.radius+r)||skyways.some(s=>nearestSegment(s.points,x,z).distance<s.def.width/2+r);}
  return {build,clear,refresh:build,update,constrain,surfaceHeight,surfaceInfo,savedSurface,location,mapSVG,guide,visit,occupied,districts,skyways,houses,pedestrians,traffic,motionInstances};
}
