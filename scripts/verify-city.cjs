// Browser verification uses a test-only bridge; the shipped game exposes no debug API.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
  const source=await fs.readFile(path.join(root,'index.html'),'utf8'),startup='buildWorld(); player=makePlayer(); initStoryUI();';
  assert(source.includes(startup));
  const html=source.replace(startup,startup+`globalThis.cityQA={cityWorld,state,roads,props,scene,renderer,vehicles,fantasyBuildings,keys,ACTIVITIES,TALE_PLACES,outlines,
    terrainHeight,movementFloor,movePlayer,updateVehicles,toggleRide,summonVehicle,snapshot,restoreData,buildWorld,sculpt,setTime,setWeather,setViewSpan,updateCamera,openAtlas,updateLocationStatus,
    place:(x,y,z)=>{player.position.set(x,y,z);playerVelocity.set(0,0,0);onGround=true;keys.clear();},
    get player(){return player},get elapsed(){return elapsed}};`);
  const allowed={'/world-architecture.js':'text/javascript','/world-style.js':'text/javascript','/house-style.js':'text/javascript','/world-city.js':'text/javascript','/world-city.css':'text/css','/world-tales.js':'text/javascript','/world-tales.css':'text/css','/vendor/three-0.161.0/three.module.js':'text/javascript'};
  const server=http.createServer(async(req,res)=>{try{
    if(req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);}
    else if(allowed[req.url]){res.writeHead(200,{'Content-Type':allowed[req.url]});res.end(await fs.readFile(path.join(root,req.url)));}
    else{res.writeHead(404);res.end();}
  }catch(e){res.writeHead(500);res.end(e.message);}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const report={checks:[],errors:[],consoleErrors:[]},check=(name,ok)=>{assert(ok,name);report.checks.push(name);};
  try{
    await fs.mkdir(path.join(root,'.local'),{recursive:true});
    const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
    await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle',timeout:120000});await page.waitForFunction(()=>!!window.cityQA,{},{timeout:60000});
    await page.evaluate(()=>{cityQA.state.autoTime=false;cityQA.setTime(10.5);});
    report.stats=await page.evaluate(()=>({houses:cityQA.cityWorld.houses.length,districts:cityQA.cityWorld.districts.map(d=>({name:d.def.name,houses:d.houses})),groundRoads:cityQA.roads.length,newRoads:cityQA.roads.filter(r=>r.city).length,skyways:cityQA.cityWorld.skyways.length,citizens:cityQA.cityWorld.pedestrians.length,traffic:cityQA.cityWorld.traffic.length,drawCalls:cityQA.renderer.info.render.calls,triangles:cityQA.renderer.info.render.triangles}));
    console.log(JSON.stringify(report.stats));
    check('art pass preserves all 144 houses in ten neighborhoods',report.stats.districts.length===10&&report.stats.houses===144&&report.stats.districts.every(d=>d.houses>0));
    check('four skyways, 40 local walkers and eight sightseeing shuttles',report.stats.skyways===4&&report.stats.citizens===40&&report.stats.traffic===8);
    check('art pass preserves the 105-road ground network',report.stats.groundRoads===105&&report.stats.newRoads===78);
    check('new buildings preserve all activity and story destinations',await page.evaluate(()=>cityQA.cityWorld.houses.every(b=>cityQA.ACTIVITIES.every(a=>a.stops.every(p=>Math.hypot(b.x-p.x,b.z-p.z)>b.radius+.6))&&cityQA.TALE_PLACES.every(p=>Math.hypot(b.x-p.x,b.z-p.z)>9))));
    const architecture=await page.evaluate(()=>{
      const q=cityQA,materials=new Map();q.props.filter(r=>r.userData.district).forEach(r=>r.traverse(m=>{if(m.material?.isMeshStandardMaterial)materials.set(m.material.userData.surface,{roughness:m.material.roughness,metalness:m.material.metalness});}));
      const regions=q.cityWorld.districts.map(d=>({id:d.def.id,types:[...new Set(q.cityWorld.houses.filter(h=>h.district===d.def.id).map(h=>h.type))]}));
      const moving=q.cityWorld.motionInstances,before=moving.map(i=>Array.from(i.mesh.instanceMatrix.array.slice(i.index*16,i.index*16+16)));
      q.cityWorld.update(.1,7,0);
      const changed=moving.filter((i,n)=>before[n].some((v,k)=>Math.abs(v-i.mesh.instanceMatrix.array[i.index*16+k])>.001)).length;
      const paired=moving.every(i=>!i.hull||Array.from(i.mesh.instanceMatrix.array.slice(i.index*16,i.index*16+16)).every((v,k)=>v===i.hull.instanceMatrix.array[i.index*16+k]));
      return {regions,families:new Set(q.cityWorld.houses.map(h=>h.family)).size,materials:Object.fromEntries(materials),changed,paired,motions:moving.length,environment:!!q.scene.environment};
    });report.architecture=architecture;
    check('ten districts each contain three distinct building types',architecture.families===10&&architecture.regions.every(r=>r.types.length===3));
    check('PBR surfaces distinguish metal, glass, timber and stone',architecture.environment&&architecture.materials.metal.metalness>.6&&architecture.materials.glass.roughness<.25&&architecture.materials.wood.roughness>.6&&architecture.materials.stone.roughness>.8);
    check('regional mechanisms animate with their outlines attached',architecture.changed>100&&architecture.paired);
    await page.screenshot({path:path.join(root,'.local','city-start.png')});
    const outlineCount=await page.evaluate(()=>cityQA.outlines.filter(h=>h.isInstancedMesh).length);
    await page.click('#tools > summary');
    await page.locator('#outline').uncheck();
    check('city contours follow the existing outline switch',outlineCount>0&&await page.evaluate(()=>cityQA.outlines.every(h=>!h.visible)));
    await page.locator('#outline').check();
    check('all original and city contours can be restored',await page.evaluate(()=>cityQA.outlines.every(h=>h.visible)));
    await page.click('#tools > summary');
    await page.click('#openAtlas');
    check('map shows real streets, four skyways and ten district destinations',await page.locator('[data-skyway]').count()===4&&await page.locator('[data-city]').count()===10&&await page.locator('.city-map-skyways polyline').count()===12);
    await page.screenshot({path:path.join(root,'.local','city-map.png')});
    // Traverse each entire skyway with the actual movement functions and direction keys.
    const walks=await page.evaluate(()=>{
      const q=cityQA,results=[];
      for(const route of q.cityWorld.skyways){
        const start=route.points[0];q.state.riding='';q.place(start.x,q.terrainHeight(start.x,start.z)+.03,start.z);
        let frames=0,maxError=0,peak=0;
        for(const target of route.points.slice(1)){
          while(Math.hypot(q.player.position.x-target.x,q.player.position.z-target.z)>.3&&frames++<12000){
            const dx=target.x-q.player.position.x,dz=target.z-q.player.position.z;q.keys.clear();
            if(Math.abs(dx)>.08)q.keys.add(dx>0?'KeyD':'KeyA');if(Math.abs(dz)>.08)q.keys.add(dz>0?'KeyS':'KeyW');q.movePlayer(.025);
            const p=q.cityWorld.surfaceInfo(q.player.position.x,q.player.position.z,100);
            if(p&&p.route===route){maxError=Math.max(maxError,Math.abs(q.player.position.y-p.y-.03));peak=Math.max(peak,q.player.position.y-q.terrainHeight(q.player.position.x,q.player.position.z));}
          }
          if(frames>=12000)break;
        }
        q.keys.clear();const end=route.points.at(-1);
        results.push({id:route.def.id,frames,maxError,peak,arrival:Math.hypot(q.player.position.x-end.x,q.player.position.z-end.z)});
      }
      return results;
    });
    report.walks=walks;console.log(JSON.stringify({walks}));
    for(const w of walks)check('walk the entire ramp, deck and exit: '+w.id,w.frames<12000&&w.arrival<.5&&w.peak>4&&w.maxError<.6);
    const mechanics=await page.evaluate(()=>{
      const q=cityQA,s=q.cityWorld.skyways[0],mid=s.points[Math.floor(s.points.length/2)];q.keys.clear();q.state.riding='';
      q.place(mid.x,q.terrainHeight(mid.x,mid.z)+.03,mid.z);q.movePlayer(.02);const under=Math.abs(q.player.position.y-q.terrainHeight(mid.x,mid.z)-.03)<.01;
      q.place(mid.x,mid.y+.03,mid.z);q.keys.add('KeyS');for(let i=0;i<90;i++)q.movePlayer(.025);q.keys.clear();
      const rail=q.cityWorld.surfaceInfo(q.player.position.x,q.player.position.z,q.player.position.y);const guarded=!!rail&&rail.distance<=s.def.width/2-.48;
      q.place(mid.x,mid.y+.03,mid.z);const saved=q.snapshot();q.restoreData(saved);const footSave=Math.abs(q.player.position.y-mid.y-.03)<.1;
      document.querySelector('#vehicle').value='cart';q.summonVehicle();const vehicle=q.vehicles.find(v=>v.id==='cart');
      const expectedFloor=q.cityWorld.surfaceInfo(vehicle.group.position.x,vehicle.group.position.z,100)?.y;
      const recall=Number.isFinite(expectedFloor)&&Math.abs(vehicle.group.position.y-expectedFloor-vehicle.groundOffset)<.1;
      q.toggleRide();const board=q.state.riding==='cart';q.updateVehicles(0);
      const vehicleSave=q.snapshot();q.restoreData(vehicleSave);const car=q.vehicles.find(v=>v.id==='cart');const rideSave=Math.abs(car.group.position.y-expectedFloor-car.groundOffset)<.1;
      q.toggleRide();const exit=q.player.position.y-q.terrainHeight(q.player.position.x,q.player.position.z)>3;
      const old=JSON.parse(JSON.stringify(saved));old.version=5;old.player={x:0,y:80,z:0};old.vehicles.forEach(v=>delete v.y);q.restoreData(old);const legacy=Math.abs(q.player.position.y-q.terrainHeight(q.player.position.x,q.player.position.z)-.03)<.1;
      return {under,guarded,footSave,recall,board,rideSave,exit,legacy};
    });
    for(const [name,ok]of Object.entries(mechanics))check('layered travel / '+name,ok);
    const carDrive=await page.evaluate(()=>{
      const q=cityQA,route=q.cityWorld.skyways[1],car=q.vehicles.find(v=>v.id==='bus'),start=route.points[0];
      car.group.position.set(start.x,q.terrainHeight(start.x,start.z)+car.groundOffset,start.z);q.state.riding=car.id;car.mounted=true;let frames=0,peak=0;
      for(const target of route.points.slice(1)){while(Math.hypot(car.group.position.x-target.x,car.group.position.z-target.z)>.4&&frames++<12000){
        const dx=target.x-car.group.position.x,dz=target.z-car.group.position.z;q.keys.clear();if(Math.abs(dx)>.12)q.keys.add(dx>0?'KeyD':'KeyA');if(Math.abs(dz)>.12)q.keys.add(dz>0?'KeyS':'KeyW');q.movePlayer(.015);peak=Math.max(peak,car.group.position.y-q.terrainHeight(car.group.position.x,car.group.position.z));
      }if(frames>=12000)break;}q.keys.clear();q.toggleRide();return {frames,peak,distance:Math.hypot(car.group.position.x-route.points.at(-1).x,car.group.position.z-route.points.at(-1).z)};
    });
    report.carDrive=carDrive;console.log(JSON.stringify({carDrive}));check('drive a bus up, across and down an entire elevated road',carDrive.frames<12000&&carDrive.peak>8&&carDrive.distance<.6);
    await page.evaluate(()=>{document.querySelector('#atlas').close();cityQA.cityWorld.visit('seabell',true);cityQA.setViewSpan(98);cityQA.updateCamera(1);});
    await page.waitForTimeout(800);await page.screenshot({path:path.join(root,'.local','city-skyway.png')});
    await page.evaluate(()=>{cityQA.cityWorld.visit('harbor');cityQA.setViewSpan(85);cityQA.updateCamera(1);});await page.waitForTimeout(500);await page.screenshot({path:path.join(root,'.local','city-harbor.png')});
    await page.evaluate(()=>{cityQA.place(80,cityQA.terrainHeight(80,55)+.03,55);cityQA.setViewSpan(43);cityQA.updateCamera(1);});await page.waitForTimeout(500);await page.screenshot({path:path.join(root,'.local','city-cottages.png')});
    for(const district of ['cloudbell','east','grove','whale','harbor','gear','dunes','snow','garden','kite']){
      await page.evaluate(id=>{cityQA.cityWorld.visit(id);cityQA.setViewSpan(48);cityQA.updateCamera(1);},district);
      await page.waitForTimeout(500);await page.screenshot({path:path.join(root,'.local',`city-style-${district}.png`)});
    }
    await page.evaluate(()=>{cityQA.cityWorld.visit('gear');cityQA.setTime(22);cityQA.setViewSpan(78);cityQA.updateCamera(1);});await page.waitForTimeout(500);await page.screenshot({path:path.join(root,'.local','city-night.png')});
    const maintenance=await page.evaluate(()=>{
      const q=cityQA,old=q.cityWorld.houses.length;q.cityWorld.visit('east');q.sculpt('raise');
      const edited=q.cityWorld.houses.length===old&&q.cityWorld.skyways.length===4&&q.cityWorld.skyways.every(s=>s.points.every(p=>Number.isFinite(p.y)));
      q.buildWorld(false);const first=q.props.filter(p=>p.userData.cityManaged).length,contours=q.outlines.length;q.buildWorld(false);return {edited,stable:q.props.filter(p=>p.userData.cityManaged).length===first,duplicates:q.roads.length===new Set(q.roads.map(r=>r.id)).size,contours:q.outlines.length===contours&&q.outlines.filter(h=>h.isInstancedMesh).every(h=>h.parent&&q.props.includes(h.parent))};
    });for(const [name,ok]of Object.entries(maintenance))check('terrain / regeneration / '+name,ok);
    await page.setViewportSize({width:390,height:844});await page.click('#openAtlas');await page.locator('.city-guide').scrollIntoViewIfNeeded();
    check('mobile map guide has no horizontal overflow',await page.locator('#atlas').evaluate(el=>el.scrollWidth-el.clientWidth<=2));
    await page.screenshot({path:path.join(root,'.local','city-mobile.png')});
    await page.click('[data-skyway="starpost"]');check('mobile skyway shortcut reaches the ramp and closes atlas',await page.evaluate(()=>!document.querySelector('#atlas').open&&Math.hypot(cityQA.player.position.x-34,cityQA.player.position.z+21)<2));
    check('no browser errors',report.errors.length===0&&report.consoleErrors.length===0);
    console.log(JSON.stringify({passed:report.checks.length,errors:report.errors,consoleErrors:report.consoleErrors}));
  }finally{await fs.writeFile(path.join(root,'.local','city-test.json'),JSON.stringify({passed:report.checks.length,...report},null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
