// A shared rendering language; regional buildings deliberately do not share a silhouette.
export const SURFACES = {
  plaster:{roughness:.82,metalness:.02},
  stone:{roughness:.92,metalness:.03},
  roof:{roughness:.34,metalness:.12},
  wood:{roughness:.76,metalness:0},
  metal:{roughness:.29,metalness:.76},
  glass:{roughness:.16,metalness:.24,transparent:true,opacity:.72,depthWrite:false,side:2},
  cloth:{roughness:.96,metalness:0,side:2},
  leaf:{roughness:.57,metalness:0,side:2},
  light:{roughness:.3,metalness:.05,emissive:0xffd69c,emissiveIntensity:.18},
  aether:{roughness:.2,metalness:.2,emissive:0x84cfdf,emissiveIntensity:.25}
};

export function createWorldStyle(THREE,renderer,scene){
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.16;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // Local studio sky: broad, warm highlights and a cool fill, with no HDR download.
  const studio=new THREE.Scene();studio.background=new THREE.Color(0x9baeb6);
  const room=new THREE.Mesh(new THREE.BoxGeometry(30,24,30),new THREE.MeshBasicMaterial({color:0x91a9a7,side:THREE.BackSide}));studio.add(room);
  for(const [color,intensity,x,y,z,sx,sy,sz]of [
    [0xffe1b5,3.2,-8,10,5,10,.2,7],
    [0xd8ebff,1.8,10,6,-5,.2,8,10],
    [0xfff6df,2.3,0,10,-9,6,5,.2]
  ]){
    const panel=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity)}));
    panel.position.set(x,y,z);studio.add(panel);
  }
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.06,.1,80);
  scene.environment=environment.texture;pmrem.dispose();
  studio.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});

  const materials=new Set();let currentNight=0;
  function material(color,extra={},profile='plaster'){
    const m=new THREE.MeshStandardMaterial({color,envMapIntensity:.42,...SURFACES[profile],...extra});
    m.userData.surface=profile;
    m.userData.environmentStrength=m.envMapIntensity;m.envMapIntensity*=1-currentNight*.88;
    materials.add(m);m.addEventListener('dispose',()=>materials.delete(m));
    return m;
  }
  function updateNight(night){
    if(Math.abs(night-currentNight)<.005)return;currentNight=night;
    for(const m of materials)m.envMapIntensity=m.userData.environmentStrength*(1-night*.88);
  }
  return {material,environment,updateNight};
}
