// Exercises the actual game through a test-only bridge; no debug API ships in index.html.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
  const source=await fs.readFile(path.join(root,'index.html'),'utf8');
  const startup='buildWorld(); player=makePlayer(); initStoryUI();';assert(source.includes(startup));
  const html=source.replace(startup,startup+`globalThis.taleQA={taleWorld,state,TALE_PLACES,TALE_SERIES,LOOK_SERIES,CAST,scene,residents,outlines,renderer,fantasyBuildings,
    snapshot,restoreData,setTime,setWeather,terrainHeight,openAtlas,buildWorld,movePlayer,changeAvatar,
    get player(){return player},get elapsed(){return elapsed}};`);
  const allowed={'/house-style.js':'text/javascript','/world-tales.js':'text/javascript','/world-tales.css':'text/css','/world-city.js':'text/javascript','/world-city.css':'text/css','/vendor/three-0.161.0/three.module.js':'text/javascript'};
  const server=http.createServer(async(req,res)=>{
    try{if(req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);}
    else if(allowed[req.url]){const data=await fs.readFile(path.join(root,req.url));res.writeHead(200,{'Content-Type':allowed[req.url]});res.end(data);}
    else{res.writeHead(404);res.end();}}catch(e){res.writeHead(500);res.end(e.message);}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const report={checks:[],errors:[],consoleErrors:[]};
  const check=(name,value)=>{assert(value,name);report.checks.push(name);};
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
    await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.taleQA);
    await page.evaluate(()=>{taleQA.state.autoTime=false;taleQA.setTime(10.5);});
    check('nine physical landmarks and 27 physical interaction stops',await page.evaluate(()=>taleQA.taleWorld.places.length===9&&taleQA.taleWorld.places.every(p=>p.root.parent===taleQA.scene&&p.stops.length===3)));
    check('all interaction stops are outside building collision volumes',await page.evaluate(()=>taleQA.taleWorld.places.every(p=>p.stops.every(s=>taleQA.fantasyBuildings.every(b=>Math.hypot(s.x-b.x,s.z-b.z)>b.radius+.5)))));
    check('animated lights preserve their small authored scale',await page.evaluate(()=>taleQA.taleWorld.places.every(p=>p.lights.every(g=>g.scale.x<.2&&g.scale.y<.35))));
    await page.click('#openTales');check('story shortcut opens nine playable scene cards',await page.locator('.tale-card').count()===9);
    await page.screenshot({path:path.join(root,'.local','tales-book.png')});
    await page.click('[data-tale="rain-tea"]');
    await page.waitForFunction(()=>taleQA.taleWorld.near?.def.id==='rain-tea');
    check('travel closes handbook and brings two dressed residents',await page.evaluate(()=>!document.querySelector('#atlas').open&&taleQA.taleWorld.guests.length===2&&taleQA.taleWorld.guests[0].group.userData.look==='wander'&&taleQA.taleWorld.guests[1].group.userData.look==='masquerade'));
    check('original residents are not duplicated while visiting theater',await page.evaluate(()=>taleQA.residents.filter(r=>['mori','sugarbeast'].includes(r.id)).every(r=>!r.group.visible)));
    // A complete sequence through visible buttons, including recovery from an incorrect choice.
    await page.click('#taleAction');await page.waitForTimeout(300);await page.click('[data-note="0"]');
    check('wrong sequence keeps game playable and resets its progress',await page.evaluate(()=>taleQA.taleWorld.run.step===0));
    for(const note of [2,0,1]){await page.waitForTimeout(300);await page.click(`[data-note="${note}"]`);}
    check('UI sequence grants a day postcard',await page.evaluate(()=>taleQA.state.tales.cards.includes('rain-tea:day')));
    await page.screenshot({path:path.join(root,'.local','tales-tea.png')});
    // Drive each physical stop in one evaluate call; no artificial completion flags are written.
    const results=await page.evaluate(()=>{
      const q=taleQA,out=[];let now=q.elapsed;
      const pump=(dt=.3)=>{now+=dt;q.taleWorld.update(dt,now);};
      const play=(def,edition)=>{
        q.setWeather(edition==='weather'?'rain':'clear',false);q.setTime(edition==='night'?22:10.5);
        q.taleWorld.visit(def.id);pump();q.taleWorld.interact();
        let attempts=0;
        while(q.taleWorld.run&&attempts++<100){
          if(def.mode==='timing'){
            pump(.15);const phase=(Math.sin(q.taleWorld.run.age*2.3)+1)/2;
            if(phase>=.35&&phase<=.7)q.taleWorld.interact();
          }else if(def.mode==='sequence'){pump();q.taleWorld.interact(def.order[q.taleWorld.run.step]);}
          else {const i=[0,1,2].find(i=>!q.taleWorld.run.found.includes(i)),stop=q.taleWorld.near.stops[i];q.player.position.set(stop.x,q.terrainHeight(stop.x,stop.z)+.03,stop.z);pump();q.taleWorld.interact();}
        }
        return q.state.tales.cards.includes(def.id+':'+edition)&&!q.taleWorld.run;
      };
      for(const def of q.TALE_PLACES)for(const edition of ['day','night','weather'])out.push({id:def.id,edition,ok:play(def,edition)});
      const seeds=q.state.seeds;play(q.TALE_PLACES[0],'day');out.push({id:'replay',edition:'no repeat reward',ok:q.state.seeds===seeds});
      return out;
    });
    for(const r of results)check(`${r.id}/${r.edition}`,r.ok);
    check('all 27 unique postcards collected',await page.evaluate(()=>taleQA.state.tales.cards.length===27));
    const saved=await page.evaluate(()=>JSON.parse(JSON.stringify(taleQA.snapshot())));
    check('v6 exports postcards and visits',saved.version===6&&saved.tales.cards.length===27&&saved.tales.visited.length===9);
    await page.evaluate(s=>taleQA.restoreData(s),saved);
    check('v6 restores all story cards',await page.evaluate(()=>taleQA.state.tales.cards.length===27));
    await page.evaluate(s=>{const old={...s,version:5};delete old.tales;taleQA.restoreData(old);},saved);
    check('v5 migrates to empty story album without losing inventory',await page.evaluate(n=>taleQA.state.tales.cards.length===0&&taleQA.state.seeds===n,saved.seeds));
    await page.evaluate(s=>taleQA.restoreData({...s,tales:{cards:['bad','cloud-oven:day','cloud-oven:day'],visited:['bad','cloud-oven']}}),saved);
    check('story save input rejects invalid and duplicate entries',await page.evaluate(()=>taleQA.state.tales.cards.join(',')==='cloud-oven:day'&&taleQA.state.tales.visited.join(',')==='cloud-oven'));
    await page.evaluate(s=>{taleQA.restoreData(s);taleQA.taleWorld.visit('moon-lending');taleQA.setTime(22);taleQA.setWeather('stardust',false);},saved);
    await page.waitForTimeout(600);await page.screenshot({path:path.join(root,'.local','tales-moon.png')});
    await page.evaluate(()=>taleQA.taleWorld.visit('pocket-airport'));await page.waitForTimeout(500);await page.screenshot({path:path.join(root,'.local','tales-airport.png')});
    // Paused handbook must not advance a timing game.
    await page.evaluate(()=>{taleQA.taleWorld.visit('cloud-oven');taleQA.taleWorld.interact();taleQA.openAtlas('tales');});
    const age=await page.evaluate(()=>taleQA.taleWorld.run.age);await page.waitForTimeout(400);
    check('handbook pauses timing interaction',await page.evaluate(a=>taleQA.taleWorld.run.age===a,age));
    await page.click('#tab-map');check('world map contains nine theater shortcuts',await page.locator('.tale-map-pin').count()===9);
    await page.click('[data-tale="snow-library"]');
    await page.waitForTimeout(500);await page.screenshot({path:path.join(root,'.local','tales-library.png')});
    await page.setViewportSize({width:390,height:844});await page.click('#openTales');
    check('mobile story cards fit without horizontal overflow',await page.evaluate(()=>{const d=document.querySelector('#atlas');return d.scrollWidth-d.clientWidth<=2&&getComputedStyle(document.querySelector('.tale-grid')).gridTemplateColumns.split(' ').length===1;}));
    await page.click('[data-tale="rain-tea"]');await page.waitForTimeout(350);await page.screenshot({path:path.join(root,'.local','tales-mobile.png')});
    check('mobile action button stays in viewport',await page.locator('#taleAction').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.right<=innerWidth;}));
    await page.evaluate(()=>{taleQA.buildWorld();});
    check('regeneration clears cards and visiting actors',await page.evaluate(()=>taleQA.state.tales.cards.length===0&&taleQA.taleWorld.guests.length===0));
    check('no uncaught errors or console errors',report.errors.length===0&&report.consoleErrors.length===0);
    await fs.writeFile(path.join(root,'.local','tales-test.json'),JSON.stringify({passed:report.checks.length,...report},null,2));
    console.log(JSON.stringify({passed:report.checks.length,errors:report.errors,consoleErrors:report.consoleErrors}));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
