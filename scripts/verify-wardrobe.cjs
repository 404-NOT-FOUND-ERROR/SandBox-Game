// Optional browser regression: PLAYWRIGHT_MODULE and BROWSER_EXECUTABLE may point to local installations.
// Run with --screenshots to update the wardrobe and life-corner documentation images.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const screenshots = process.argv.includes('--screenshots');

(async () => {
  const source = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  // Test access exists only in this response, never in the distributed game.
  const startup = 'buildWorld(); player=makePlayer(); initStoryUI();';
  assert(source.includes(startup), 'game startup hook');
  const bridge = `globalThis.wardrobeQA={state,CAST,REGIONS,REGION_LIFE,LOOK_SERIES,CHARACTER_LOOKS,
    scene,renderer,residents,vehicles,outlines,activityMarkers,ACTIVITIES,keys,castPreviews,
    get player(){return player},get portraitCount(){return portraitURLs.size},
    portraitRenderer,snapshot,restoreData,changeAvatar,buildWorld,visitLife,visitRegion,
    nearestStoryResident,talkToResident,collect,terrainHeight,regionAt,setTime,setWeather,
    openAtlas,setViewSpan,updateCamera,movePlayer,updateStoryWorld,updateActivities,
    startActivity,performActivity,toggleRide,summonVehicle,sculpt,disposeObjects};`;
  const html = source.replace(startup, startup + bridge);
  const three = await fs.readFile(path.join(root, 'vendor/three-0.161.0/three.module.js'));
  const tales = await fs.readFile(path.join(root, 'world-tales.js'));
  const taleCSS = await fs.readFile(path.join(root, 'world-tales.css'));
  const server = http.createServer((req, res) => {
    if (req.url === '/') {res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});res.end(html);}
    else if (req.url === '/vendor/three-0.161.0/three.module.js') {res.writeHead(200, {'Content-Type':'text/javascript; charset=utf-8'});res.end(three);}
    else if (req.url === '/world-tales.js') {res.writeHead(200, {'Content-Type':'text/javascript; charset=utf-8'});res.end(tales);}
    else if (req.url === '/world-tales.css') {res.writeHead(200, {'Content-Type':'text/css; charset=utf-8'});res.end(taleCSS);}
    else {res.writeHead(404);res.end();}
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const report = {checks:[],errors:[],consoleErrors:[]};
  const check = (name, value) => {assert(value, name);report.checks.push(name);};
  try {
    browser = await chromium.launch({headless:true, ...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
    const context = await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', msg => {if(msg.type()==='error'&&!msg.text().includes('favicon'))report.consoleErrors.push(msg.text());});
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(origin, {waitUntil:'networkidle',timeout:60000});
    await page.waitForFunction(() => !!window.wardrobeQA);
    await page.evaluate(() => {wardrobeQA.state.autoTime=false;wardrobeQA.setTime(10.5);});
    check('ten characters and nine physical life corners', await page.evaluate(() => wardrobeQA.CAST.length===10&&wardrobeQA.scene.children.filter(g=>g.userData.life).length===9));
    await page.click('#openWardrobe');
    check('wardrobe shortcut opens character page', await page.locator('#tab-cast').getAttribute('aria-selected')==='true');
    check('five playable avatars and ten preview cards', await page.locator('[data-avatar]').count()===5&&await page.locator('.cast-card').count()===10);
    const defaultSnapshot = await page.evaluate(() => JSON.stringify(wardrobeQA.snapshot()));
    const ids = await page.evaluate(() => wardrobeQA.CAST.map(c=>c.id));
    const images = {};
    const series = await page.evaluate(() => wardrobeQA.LOOK_SERIES.map(s=>s.id));
    for (const look of series) {
      await page.click(`[data-series="${look}"]`);
      for (const id of ids) {
        const card=page.locator(`[data-character="${id}"]`);
        const image=card.locator('img');
        await image.evaluate(img=>img.decode());
        const url=await image.getAttribute('src');
        check(`${id}/${look} renders and selects`, url.startsWith('data:image/png;base64,')&&await card.locator(`[data-preview-look][data-look="${look}"]`).getAttribute('aria-pressed')==='true');
        images[id] ||= {};images[id][look]=url;
      }
    }
    for(const id of ids)check(`${id} has six visually distinct renders`, new Set(Object.values(images[id])).size===6);
    check('previews leave gameplay state unchanged', defaultSnapshot===await page.evaluate(() => JSON.stringify(wardrobeQA.snapshot())));
    check('all sixty portraits cached on demand', await page.evaluate(() => wardrobeQA.portraitCount===60));
    const playable=ids.slice(0,5);
    for(const id of playable)for(const look of series){
      await page.locator(`[data-character="${id}"] [data-preview-look][data-look="${look}"]`).click();
      await page.locator(`[data-avatar="${id}"]`).click();
      const result=await page.evaluate(({id,look})=>{
        const q=wardrobeQA,p=q.player,s=q.snapshot();
        return s.avatar===id&&s.looks[id]===look&&p.userData.look===look&&p.parent===q.scene&&document.querySelector(`[data-avatar="${id}"]`).textContent.includes('正在穿着');
      },{id,look});
      check(`wear ${id}/${look} updates live model`,result);
    }
    check('avatar switch remembers per-character outfits',await page.evaluate(()=>{
      const q=wardrobeQA;q.changeAvatar('mori',false,'region');q.changeAvatar('post',false,'hobby');q.changeAvatar('mori',false);
      return q.player.userData.look==='region'&&q.state.looks.post==='hobby';
    }));
    await page.click('#atlasClose');
    const metadata=await page.evaluate(()=>{
      const q=wardrobeQA;q.state.wood=17;q.state.stone=13;q.state.seeds=9;q.state.stamps=['town','crystal','mushroom','whale','nocturne'];
      q.changeAvatar('post',false,'hobby');q.player.rotation.y=1.3;const before=q.player.position.clone();q.changeAvatar('ray',false,'stardream');
      return {position:q.player.position.distanceTo(before),heading:q.player.rotation.y,resources:[q.state.wood,q.state.stone,q.state.seeds],crown:!!q.player.getObjectByName('dreamer-crown')};
    });
    check('outfit changes preserve transform, resources and earned crown',metadata.position===0&&metadata.heading===1.3&&metadata.resources.join(',')==='17,13,9'&&metadata.crown);
    const saved=await page.evaluate(()=>JSON.parse(JSON.stringify(wardrobeQA.snapshot())));
    check('v6 snapshot contains independent character looks',saved.version===6&&saved.looks.post==='hobby'&&saved.looks.ray==='stardream');
    await page.evaluate(s=>{wardrobeQA.changeAvatar('sprout',false,'core');wardrobeQA.restoreData(s);},saved);
    check('v6 restores live avatar and inventory',await page.evaluate(()=>wardrobeQA.player.userData.character==='ray'&&wardrobeQA.player.userData.look==='stardream'&&wardrobeQA.state.wood===17));
    // UI must render a saved look even if it has never been previewed in the new session.
    await page.reload({waitUntil:'networkidle'});
    await page.evaluate(s=>wardrobeQA.restoreData(s),saved);await page.click('#openWardrobe');
    check('fresh load shows correct saved outfit thumbnail',await page.locator('[data-character="ray"] img').getAttribute('src')===images.ray.stardream);
    await page.click('#atlasClose');
    for(const version of [2,3,4]){
      const old={...saved,version};delete old.looks;
      await page.evaluate(s=>wardrobeQA.restoreData(s),old);
      check(`v${version} save migrates to core without losing progress`,await page.evaluate(()=>wardrobeQA.player.userData.look==='core'&&wardrobeQA.state.avatar==='ray'&&wardrobeQA.state.wood===17&&wardrobeQA.state.stamps.length===5));
    }
    await page.evaluate(s=>wardrobeQA.restoreData({...s,looks:{post:'unknown',ray:null,sprout:['region'],ember:42}}),saved);
    check('invalid look data falls back safely',await page.evaluate(()=>Object.values(wardrobeQA.state.looks).every(v=>v==='core')));
    const lifeResults=await page.evaluate(()=>{
      const q=wardrobeQA,results=[];q.state.autoTime=false;q.setTime(21.5);q.setWeather('snow',false);
      for(const l of q.REGION_LIFE){
        q.visitLife(l.region);q.updateStoryWorld(0,0);const nearest=q.nearestStoryResident();q.talkToResident(nearest);
        const collision=q.scene.children.find(g=>g.userData.life===l.region);
        const stopBlocked=q.ACTIVITIES.some(a=>a.stops.some(s=>Math.hypot(s.x-l.x,s.z-l.z)<1.85));
        results.push({region:l.region,playerRegion:q.regionAt(q.player.position.x,q.player.position.z)?.id,nearest:nearest?.id,expected:l.resident,model:nearest?.group.userData.look===l.look,dialog:document.querySelector('#speechText').textContent===l.line,weather:q.state.weather==='snow'&&q.state.time===21.5,floor:Math.abs(q.player.position.y-q.terrainHeight(q.player.position.x,q.player.position.z)-.03)<.01,block:stopBlocked,partCount:collision?.children.length});
      }return results;
    });
    report.lifeCorners=lifeResults;
    for(const life of lifeResults)check(`visit ${life.region}: correct location, reachable themed resident, dialogue, weather and task clearance`,life.playerRegion===life.region&&life.nearest===life.expected&&life.model&&life.dialog&&life.weather&&life.floor&&!life.block&&life.partCount>10);
    await page.evaluate(()=>{document.querySelector('#speech').hidden=true;wardrobeQA.state.stamps=[];wardrobeQA.setTime(10.5);wardrobeQA.setWeather('clear',false);});
    // The actual UI route must also close its modal and keep unrelated adventure progress.
    await page.click('#openWardrobe');const card=page.locator('[data-character="post"]');await card.locator('summary').click();await card.locator('[data-life]').click();
    check('card life link closes handbook and reaches town',await page.evaluate(()=>!document.querySelector('#atlas').open&&wardrobeQA.regionAt(wardrobeQA.player.position.x,wardrobeQA.player.position.z)?.id==='town'));
    await page.click('#openWardrobe');await page.locator('[data-character="post"] details').evaluate(el=>el.open=true);await page.locator('[data-character="post"] [data-start]').click();
    check('life corner connects to existing delivery adventure',await page.evaluate(()=>wardrobeQA.state.activeActivity==='tomorrow-post'));
    // Use the real boarding and disembarking path so occupancy cannot leak between checks.
    await page.evaluate(()=>{const q=wardrobeQA;document.querySelector('#vehicle').value='cart';q.summonVehicle();q.toggleRide();q.changeAvatar('post',false,'hobby');});
    check('model remains hidden while riding',await page.evaluate(()=>!wardrobeQA.player.visible&&wardrobeQA.state.riding==='cart'));
    await page.evaluate(()=>wardrobeQA.toggleRide());
    check('disembarking restores the dressed avatar and clears occupancy',await page.evaluate(()=>wardrobeQA.player.visible&&!wardrobeQA.state.riding&&!wardrobeQA.vehicles.some(vehicle=>vehicle.mounted)&&wardrobeQA.player.userData.look==='hobby'));
    const memoryBefore=await page.evaluate(()=>({geometry:wardrobeQA.renderer.info.memory.geometries,outlines:wardrobeQA.outlines.length}));
    await page.evaluate(()=>{const q=wardrobeQA;for(let i=0;i<25;i++)q.changeAvatar('post',false,['hobby','region','stardream','core'][i%4]);});
    const memoryAfter=await page.evaluate(()=>({geometry:wardrobeQA.renderer.info.memory.geometries,outlines:wardrobeQA.outlines.length}));
    check('repeated outfit changes do not accumulate render objects',memoryAfter.geometry<=memoryBefore.geometry+80&&memoryAfter.outlines<=memoryBefore.outlines+80);
    await page.click('#openWardrobe');await page.click('[data-series="hobby"]');
    if(screenshots){
      await page.setViewportSize({width:1440,height:2450});
      await page.evaluate(()=>{const atlas=document.querySelector('#atlas');atlas.scrollTop=0;atlas.style.maxHeight='none';atlas.style.overflow='visible';});
      await page.screenshot({path:path.join(root,'docs/screenshots/characters.png'),fullPage:true});
      await page.evaluate(()=>{const atlas=document.querySelector('#atlas');atlas.style.removeProperty('max-height');atlas.style.removeProperty('overflow');});
      await page.setViewportSize({width:1440,height:1000});
      const catalog=await context.newPage({viewport:{width:1120,height:1080}});
      const names=await page.evaluate(()=>wardrobeQA.CAST.map(c=>({id:c.id,name:c.name,looks:Object.fromEntries(['core','region','hobby','stardream'].map(l=>[l,wardrobeQA.CHARACTER_LOOKS[c.id]?.[l]?.name||'本真形态']))})));
      const renderSheet=(list)=>`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#fff8e6;color:#263b49;font-family:'Microsoft YaHei',sans-serif;padding:24px}h1{font-size:28px;margin:4px 0 8px}p{font-size:12px;margin:0 0 20px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}article{border:2px solid #263b49;background:#fffdf5}img{width:100%;height:200px;display:block;object-fit:contain}b,small{display:block;padding:0 10px 7px}b{font-size:12px}small{font-size:10px;color:#5a776a}header{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px}header div{padding:7px 10px;border:1px solid #8eaaa0;font-size:12px;background:#e2ead8}</style><h1>一位朋友，许多种可能。</h1><p>浮屿工坊 · 原创角色造型 / 游戏三维模型实机渲染对照</p><header><div>01 最初相遇</div><div>02 风土纪行</div><div>03 小小兴趣社</div><div>04 星愿巡游</div></header><main>${list.map(c=>['core','region','hobby','stardream'].map(l=>`<article><img src="${images[c.id][l]}"><b>${c.looks[l]}</b><small>${c.name}</small></article>`).join('')).join('')}</main>`;
      await catalog.setContent(renderSheet(['mori','post','ember'].map(id=>names.find(c=>c.id===id))));await catalog.screenshot({path:path.join(root,'docs/screenshots/character-series.png'),fullPage:true});
      await catalog.close();
      await page.click('#atlasClose');await page.evaluate(()=>{wardrobeQA.setWeather('clear',false);wardrobeQA.setTime(15);wardrobeQA.visitLife('gear');document.querySelector('#toast').classList.remove('show');document.querySelector('#speech').hidden=true;if(wardrobeQA.regionAt(wardrobeQA.player.position.x,wardrobeQA.player.position.z)?.id!=='gear')throw new Error('life-corner capture did not reach the target region');});
      await page.waitForTimeout(700);
      check('life corner remains in gear after animation resumes',await page.evaluate(()=>wardrobeQA.regionAt(wardrobeQA.player.position.x,wardrobeQA.player.position.z)?.id==='gear'&&document.querySelector('#regionName').textContent==='齿轮集市'));
      await page.screenshot({path:path.join(root,'docs/screenshots/life-corner.png')});
    }
    if (await page.locator('#atlas').evaluate(dialog => dialog.open)) await page.click('#atlasClose');
    await page.setViewportSize({width:390,height:844});await page.click('#openWardrobe');await page.click('[data-series="region"]');
    const mobile=await page.evaluate(()=>{const d=document.querySelector('#atlas');return {overflow:d.scrollWidth-d.clientWidth,columns:getComputedStyle(document.querySelector('.cast-grid')).gridTemplateColumns.split(' ').length,images:[...d.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)};});
    check('390px wardrobe fits and keeps all previews usable',mobile.overflow<=2&&mobile.columns===1&&mobile.images);
    await page.getByRole('button',{name:'关闭奇想手册'}).click();
    await page.keyboard.press('KeyW');
    check('mobile modal close returns to game',await page.evaluate(()=>!document.querySelector('#atlas').open));
    check('no uncaught browser errors',report.errors.length===0);
    console.log(JSON.stringify({passed:report.checks.length,...report},null,2));
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
