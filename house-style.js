// Heritage cottages remain in the old town. New districts have their own architecture.
export const HOUSE_COLORS = {
  stone:0x9c8cae, paleStone:0xdfc8aa, gold:0xffd46e, ink:0x304658,
  walls:[0xffe6bb,0xffcaa7,0xc1e8cf], roofs:[0x519e9d,0xcc7499,0x678eb4],
  window:0xffdb8f
};

const GEOMETRIES = {
  foundation:['CylinderGeometry',[1.57,1.68,1.15,10]],
  wall:['CylinderGeometry',[1.42,1.56,1.9,12]],
  dome:['SphereGeometry',[1.8,12,8]],
  roof:['ConeGeometry',[1.94,1.58,10]],
  spire:['ConeGeometry',[.23,.65,7]],
  finial:['SphereGeometry',[.13,6,5]],
  door:['CapsuleGeometry',[.3,.52,4,8]],
  window:['SphereGeometry',[.29,8,6]],
  chimney:['CylinderGeometry',[.16,.2,.75,7]]
};

export function createHouseGeometry(THREE,shape){
  const [type,args]=GEOMETRIES[shape];
  return new THREE[type](...args);
}

export function houseParts(variant,dome=Boolean(variant%2)){
  const part=(shape,material,x,y,z,scale=[1,1,1],rotation=[0,0,0])=>({shape,material,position:[x,y,z],scale,rotation});
  return [
    part('foundation','paleStone',0,-.26,0),
    part('wall','wall',0,.95,0),
    ...(dome?[
      part('dome','roof',0,2,0,[1,.56,1]),
      part('spire','gold',0,3.13,0)
    ]:[
      part('roof','roof',0,2.56,0),
      part('finial','gold',0,3.43,0)
    ]),
    part('door','ink',0,.56,1.48,[1,1,.12]),
    ...[-1,1].map(side=>part('window','window',side*.83,1.17,1.25,[1,1,.18],[0,side*.55,0])),
    part('chimney','stone',-.85,2.7,-.35,[1,1,1],[0,0,-.06])
  ];
}
