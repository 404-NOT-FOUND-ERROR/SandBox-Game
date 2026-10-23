// Original inhabitants keep their identity while new interests become places and play.
export const TALE_SERIES = [
  {id:'wander',label:'远游',title:'口袋远游社',subtitle:'把好奇心装进随身行李',color:'#c5dfdf'},
  {id:'masquerade',label:'奇妙',title:'万物借我一天',subtitle:'借一种小生命的方式生活',color:'#ead4e4'}
];
const looks = {
  sprout:[['风筝测绘员','把怕走丢的心情画成风筝地图，兜里总留着给朋友的位置。','kite',0x79b6bb,0xf5c775],['蜗牛慢递员','背起螺旋小屋试着慢一点。原来等一等，也能把朋友等回来。','snail',0xc2a2c9,0xf7d395]],
  post:[['云层试飞邮差','折耳戴上护目镜，让面包气球试飞一封没有地址的信。','aviator',0x7fa9bd,0xffce86],['面团鸟实习生','围着羽片围领，跟面团鸟学会先分享早餐，再开始赶路。','bird',0xf1c37f,0xd6a9bd]],
  mori:[['露水野餐研究员','把茶杯绑在菌帽旁，认真研究一滴雨够不够三位朋友喝。','teapot',0x8eafa6,0xf4d88d],['苔灯萤火客','菌帽下挂着萤火灯笼；说自己不困，其实在给夜行虫让路。','firefly',0xa6be79,0xffdf9a]],
  ray:[['漂浮回声采样师','耳侧的听筒记录水母的无声合唱，寻找记忆之外的新声音。','headphones',0x8da8ce,0xeac2d9],['玻璃水母见习生','穿上水母伞裙后发现，发光不必总是因为被夸奖。','jelly',0xa4cfdf,0xdac3ec]],
  ember:[['月相航灯员','随身小望远镜只看下一站，怕黑也可以成为可靠的领航员。','telescope',0x748ba6,0xf7c28f],['晚安灯蛾','披风长出一对软翼，为最后一名旅人留着最小的一盏灯。','moth',0x987ba6,0xffd8a1]],
  cloudwhale:[['口袋空港领航鲸','背起风向标，邀请走累的朋友到自己的云朵客厅坐一会。','kite',0x9dc7c7,0xf6d69d],['花瓣蝠茶客','花瓣披翼装作一只小蝙蝠，结果还是忍不住把路过的花都带回家。','moth',0xc3a1c1,0xf2c8a4]],
  bubblefolk:[['瓶中海考察员','潜镜里不是更远的海，是漂流瓶主人没说完的一句话。','diver',0x70b6b4,0xffda93],['寄居茶壶蟹','借一只旧茶壶当壳，边走边给每件失物沏一杯欢迎茶。','teapot',0xddae8f,0xaad2c5]],
  gearling:[['慢拍留声师','背着唱片采集脚步声，准备给赶时间的朋友一首不用赶拍的歌。','headphones',0x8aa99d,0xf1c18b],['发条布谷鸟','齿轮耳朵上长出纸羽毛，报时改成提醒大家伸个懒腰。','bird',0xb7ab7c,0xd8c0dd]],
  sugarbeast:[['香气航线向导','风车装在水壶旁，顺着薄荷香带大家找到沙丘后面的茶桌。','kite',0xb8bc8b,0xefbc8c],['布丁蜗牛旅行家','奶油角和螺旋壳一起晃，走得慢，正好记住每一块阴凉。','snail',0xe3b18d,0xa5c6a0]],
  auroraling:[['星页观测员','用小望远镜看书页上的星座，给没有结尾的故事找一个新入口。','telescope',0x9ab8d0,0xf3d7a3],['纸页鳐图书员','绒翼夹着折页小鱼，故事会游到真正需要它的人身边。','jelly',0xb6b7db,0xd7e8dc]]
};
export const TALE_LOOKS=Object.fromEntries(Object.entries(looks).map(([id,list])=>[id,Object.fromEntries(list.map(([name,description,motif,color,accent],i)=>[TALE_SERIES[i].id,{name,description,motif,color,accent}]))]));

export const TALE_PLACES = [
  {id:'cloud-oven',region:'town',name:'云朵吐司邮局',en:'THE CLOUD OVEN',x:24,z:17,color:'#e5b77e',accent:'#f8df9d',host:'post',guest:'ray',kind:'oven',mode:'timing',symbol:'✉',
    premise:'啵啵的面包忘了重力。澄澄借来回声铃，让每一口早餐都带着一声问候。',
    rule:'这里寄出的信，靠面包的香气认路。',task:'等指针进入金色窗，按 H 给面团鼓一次气；成功三次放飞早餐邮班。',action:'给面团鼓气',nodes:['揉进问候','装进香气','寄向明天'],order:[0,1,2],
    day:['早餐逃跑了','三只面团鸟驮起吐司，给还没起床的人送去一句早安。'],night:['月亮的宵夜','吐司亮成一小片月牙，啵啵终于给忘记门牌的自己寄了一份晚安。'],weather:['雨衣面包班','澄澄用玻璃糖衣给面包做了雨披。雨点敲出一首会回家的歌。'],
    invitation:'啵啵：我只想烤早饭，没想到早饭想去旅行。你愿意帮忙试飞吗？'},
  {id:'rain-tea',region:'mushroom',name:'倒雨茶会',en:'THE UPSIDE-DOWN TEA',x:-29,z:24,color:'#c59bc7',accent:'#bde4c8',host:'mori',guest:'sugarbeast',kind:'teapot',mode:'sequence',symbol:'♧',
    premise:'米糯邀请巴斯带来薄荷。杯盏蛙坚持让茶从杯底升到云里，谁也没弄湿脚。',rule:'一杯茶越舍不得喝完，倒着落的雨就越温柔。',task:'按茶谱依次选择「月亮霜 → 薄荷雨 → 莓果露」。点杯子按钮，或走近杯盏按 H。',action:'邀请杯盏蛙',nodes:['薄荷雨','莓果露','月亮霜'],order:[2,0,1],
    day:['云上的空茶杯','茶水升到伞顶，三只杯盏蛙蹦起来，替困倦的米糯开了最后一朵梦花。'],night:['萤火虫借茶','茶会为夜行虫开着。米糯嘴上说不困，菌帽里已经传来细细的呼噜。'],weather:['小雨倒流日','巴斯收起雨伞当茶托，雨滴变成薄荷珍珠，一颗颗回到云端。'],
    invitation:'米糯：请按茶谱帮忙，我真的没有睡着。月亮霜要先放，不然茶会梦游。'},
  {id:'echo-jellies',region:'crystal',name:'回声水母剧院',en:'THE SILENT ORCHESTRA',x:-34,z:-18,color:'#8dc7d8',accent:'#d9b9ea',host:'ray',guest:'gearling',kind:'jelly',mode:'sequence',symbol:'◇',
    premise:'澄澄把玻璃珠吹成水母。咔哒说，听不见的歌，也能用灯光合奏。',rule:'记忆的颜色，会随着认真倾听的人改变。',task:'顺着回声谱「低低 → 亮亮 → 轻轻」点亮三枚音贝。点按钮，或走近音贝按 H。',action:'听一段回声',nodes:['低低','轻轻','亮亮'],order:[0,2,1],
    day:['水母不必懂音乐','三只玻璃水母浮起，彼此错开的节奏，恰好拼出一片温柔的海。'],night:['第一段记忆','澄澄没找回过去，却记住了今天一起听歌的人。水母点亮一页新星图。'],weather:['落雨有回声','水母接住雨雪，透明伞裙里出现细小的光谱，咔哒把天气写进了乐谱。'],
    invitation:'澄澄：请跟着低低、亮亮、轻轻。你听，它们只是不习惯用耳朵唱歌。'},
  {id:'moon-lending',region:'nocturne',name:'借月灯塔',en:'BORROW A LITTLE MOON',x:37,z:-8,color:'#8e9cc4',accent:'#ffe0a1',host:'ember',guest:'auroraling',kind:'moon',mode:'timing',symbol:'☾',
    premise:'余烁和晚邮开了一间借月处。借走的光不用还，只要记得照一照别人。',rule:'月亮可以借半轮，勇气可以从一点点开始。',task:'等指针进入金色窗，按 H 校准月相三次，给夜航灯接通星光。',action:'校准一束月光',nodes:['灯芯','航线','月相'],order:[0,1,2],
    day:['月亮在打盹','白日的月亮挂在塔尖晒被子。余烁发现，害怕的时候也可以先休息。'],night:['借你半轮月','三束暖光连成弯月，晚邮带着第一封回信，穿过不再孤单的夜。'],weather:['云缝里的灯','月光穿过厚厚的雨雪，灯蛾把亮点传向下一座驿站。'],
    invitation:'余烁：我也怕黑。帮我把光调准一点，就能分给下一位晚归的人。'},
  {id:'pocket-airport',region:'whale',name:'口袋鲸空港',en:'THE POCKET SKY PORT',x:-12,z:-45,color:'#e6b39e',accent:'#b8dcce',host:'cloudwhale',guest:'sprout',kind:'whale',mode:'seek',symbol:'✧',
    premise:'阿浮把云朵客厅停在花坡。诺诺收集三枚风向花，替总迷路的朋友铺一条回家航线。',rule:'只有为别人留了座位的云，才会开始飞。',task:'走到三枚发光的风向花旁，按 H 收起它们；收齐后小云鲸起航。',action:'收起风向花',nodes:['东风花','回家花','等一等花'],order:[0,1,2],
    day:['云上还留着座位','口袋鲸们排成一列，阿浮没有急着出发，它在等最后一个朋友。'],night:['星河的候机厅','风向花变成星灯。诺诺在每一朵云上，都挂了一张写着“欢迎”的小卡。'],weather:['雨云也能停靠','阿浮给雨云留了一个座位。原来沉甸甸的心事也可以被载着走。'],
    invitation:'阿浮：有三朵风向花散落在周围。把它们带来，我们就知道下一阵风要去哪里。'},
  {id:'bottle-sea',region:'harbor',name:'瓶中海失物馆',en:'THE SEA IN A BOTTLE',x:99,z:37,color:'#8ecac3',accent:'#f5d49e',host:'bubblefolk',guest:'post',kind:'bottle',mode:'seek',symbol:'◉',
    premise:'泡叽捡到一只装着整片小海的瓶子。啵啵带来三张旧邮票，替失物找一个愿意听故事的人。',rule:'被忘记的东西，会长成一只会走路的茶壶蟹。',task:'沿瓶子四周找到三枚发光失物，走近按 H，为它们写下新地址。',action:'认领一个故事',nodes:['纽扣月亮','半张船票','贝壳耳朵'],order:[0,1,2],
    day:['海浪的抽屉','茶壶蟹把失物搬回瓶中海。泡叽发现，旧东西也能认识新的朋友。'],night:['给海写晚安','瓶子里浮起月色船队，啵啵终于送到那张只写着“给等我的人”的船票。'],weather:['一场瓶内小雨','外面的雨落进瓶子，里面的小海升起一圈圈不会弄湿人的泡泡。'],
    invitation:'泡叽：别急着丢掉奇怪的小东西。它们只是在等下一个喜欢自己的人。'},
  {id:'slow-carousel',region:'gear',name:'慢半拍旋转天台',en:'THE UNHURRIED CAROUSEL',x:27,z:114,color:'#c6ac83',accent:'#bddbd0',host:'gearling',guest:'ember',kind:'carousel',mode:'sequence',symbol:'⚙',
    premise:'咔哒把坏闹钟修成旋转天台。余烁端着热汤，提醒大家演出前先吃晚饭。',rule:'这里的钟不催人，它只为愿意停下的人转动。',task:'按节拍纸条「歇一歇 → 叮 → 咚」选择音键。点按钮，或走近按 H。',action:'给乐队起个拍',nodes:['叮','咚','歇一歇'],order:[2,0,1],
    day:['多出来的五分钟','布谷鸟没有报时，而是一起打了个哈欠。旋转天台终于等齐了观众。'],night:['守夜人的慢舞','齿轮转成一圈暖灯，余烁第一次在守夜途中，放心跳了一小支舞。'],weather:['雨点没跟上拍','雨点乱了拍子，咔哒把每一次停顿都留了下来，结果格外好听。'],
    invitation:'咔哒：先歇一歇，再叮，再咚。这里不考反应，慢半拍的朋友也能合奏。'},
  {id:'walking-oasis',region:'dunes',name:'会散步的薄荷绿洲',en:'THE WANDERING OASIS',x:-105,z:55,color:'#d8b88b',accent:'#b7d7b1',host:'sugarbeast',guest:'mori',kind:'snail',mode:'seek',symbol:'❋',
    premise:'巴斯的香草盆长出了软糖脚。米糯给它做了一把蘑菇伞，绿洲决定自己去找走累的旅人。',rule:'阴凉不是固定的地方，是愿意陪你走的一小段路。',task:'在绿洲周围找回三片薄荷叶，走近按 H，让布丁蜗牛带着茶桌出发。',action:'拾起薄荷叶',nodes:['清晨叶','凉风叶','回甘叶'],order:[0,1,2],
    day:['绿洲出门了','布丁蜗牛驮起小花园，巴斯不再催大家赶路，因为阴凉已经跟来了。'],night:['沙丘的凉梦','月色把糖沙变成银色。米糯把好梦藏在伞下，连脚印都安静了。'],weather:['沙漠收到一封雨','香草盆伸出新叶，巴斯把第一滴水留给更远处的仙人掌。'],
    invitation:'巴斯：帮我找回三片薄荷。茶桌准备好了，下一站去找走累的人。'},
  {id:'snow-library',region:'aurora',name:'未完结的极光书屋',en:'THE UNFINISHED LIBRARY',x:109,z:-66,color:'#b2c3e0',accent:'#dfc6e6',host:'auroraling',guest:'ray',kind:'book',mode:'sequence',symbol:'✦',
    premise:'晚邮收藏没写完的书，澄澄把空白页折成鳐。只要有人翻开，故事就会长出一条新路。',rule:'书的最后一页，永远留给下一位到来的人。',task:'依次翻开「相遇 → 迷路 → 回家」。点书签按钮，或走近书签按 H。',action:'翻开一页故事',nodes:['回家','相遇','迷路'],order:[1,2,0],
    day:['纸页也想旅行','三只纸页鳐从书屋游出，晚邮把空白的一页送给了你。'],night:['一整页极光','书脊打开一条极光河。澄澄发现，没有写完的地方，恰好能装进新的朋友。'],weather:['雪停在逗号上','雪花落进书页，句子没有结束。晚邮轻声说：我们明天还可以接着讲。'],
    invitation:'晚邮：从相遇翻到迷路，再翻到回家。别怕，没写完的故事也可以很好。'}
];

export const taleVariant = state => ['rain','snow','stardust'].includes(state.weather)?'weather':state.time<6||state.time>=18?'night':'day';
export const normalizeTales = data => {
  const allowed=new Set(TALE_PLACES.flatMap(p=>['day','night','weather'].map(v=>p.id+':'+v)));
  return {cards:[...new Set(Array.isArray(data?.cards)?data.cards.filter(v=>allowed.has(v)):[])],visited:[...new Set(Array.isArray(data?.visited)?data.visited.filter(v=>TALE_PLACES.some(p=>p.id===v)):[])]};
};

export function createTaleWorld(THREE, env) {
  const {state,scene,part,outline,addProp,terrainHeight,sign,toast,getPlayer,cast}=env;
  const TAU=Math.PI*2, places=[],offsets=[[-4,3.4],[0,5.6],[4,3.4]];
  let run=null,near=null,hudStamp='',lastHint='',clock=0,lastAttempt=-10;
  let guests=[],suppressed=[];
  const $=id=>document.getElementById(id);
  const story=()=>state.tales||(state.tales=normalizeTales());
  const named=id=>cast.find(c=>c.id===id).name.split(' · ')[1];
  const done=p=>story().cards.some(c=>c.startsWith(p.id+':'));
  const guestLines={
    'cloud-oven':'澄澄：我给面包装了一颗回声铃。如果你听见它，就知道有人惦记你的早餐。',
    'rain-tea':'巴斯：带来了三片薄荷。不过米糯说，倒着喝的茶要从月亮开始泡。',
    'echo-jellies':'咔哒：有些乐器不出声音。留一点空拍，水母就能用光接上。',
    'moon-lending':'晚邮：我的翅膀会把月光寄出去。余烁留的那一小束，已经够一个人走回家。',
    'pocket-airport':'诺诺：阿浮的云朵有很多座位。我想把最后一张留给还没认识的朋友。',
    'bottle-sea':'啵啵：这张旧船票没写地址。泡叽说，先找一个愿意听它讲故事的人就好。',
    'slow-carousel':'余烁：汤还热着。演出可以等一等，饿着肚子的人更需要这五分钟。',
    'walking-oasis':'米糯：蘑菇伞已经撑好了。我没睡着，只是试试这片阴凉舒不舒服。',
    'snow-library':'澄澄：以前我只想找回记忆。现在觉得，和你一起写下一页也很好。'
  };
  function clearGuests(){
    env.disposeObjects(guests.map(g=>g.group));guests=[];
    for(const [group,visible] of suppressed)group.visible=visible;suppressed=[];
  }
  function inviteGuests(item){
    clearGuests();if(!item)return;
    [item.def.host,item.def.guest].forEach((id,i)=>{
      for(const resident of env.residents)if(resident.id===id){suppressed.push([resident.group,resident.group.visible]);resident.group.visible=false;}
      const group=env.makeCharacter(id,true,i?'masquerade':'wander'),x=item.def.x+(i?3.7:-3.7),z=item.def.z+1.2;
      group.scale.setScalar(id==='cloudwhale'?.65:1.08);group.name='tale-guest-'+id;group.userData.taleGuest=id;scene.add(group);
      group.position.set(x,terrainHeight(x,z),z);guests.push({id,group,x,z,index:i});
    });
  }
  function talk(){
    if(!near||state.riding)return false;const player=getPlayer();
    const guest=guests.find(g=>Math.hypot(player.position.x-g.group.position.x,player.position.z-g.group.position.z)<3.2);
    if(!guest)return false;
    if(!state.met.includes(guest.id))state.met.push(guest.id);
    lastHint=guest.index?guestLines[near.def.id]:near.def.invitation;hudStamp='';updateHUD();return true;
  }
  const p=(g,shape,color,x,y,z,sx,sy=sx,sz=sx)=>part(g,shape,color,x,y,z,sx,sy,sz);
  function smallCreature(root,kind,c,a) {
    const g=new THREE.Group();root.add(g);
    if(kind==='jelly') {
      p(g,'ball',c,0,.6,0,.65,.42,.65);p(g,'ring',a,0,.45,0,.58).rotation.x=Math.PI/2;
      for(let i=0;i<5;i++)p(g,'pillar',a,Math.cos(i*TAU/5)*.4,.05,Math.sin(i*TAU/5)*.4,.035,.8,.035);
    } else if(kind==='whale') {
      p(g,'ball',c,0,.5,0,.9,.5,.55);for(const s of [-1,1]){const wing=p(g,'ball',a,-.3,.5,s*.6,.45,.09,.45);wing.rotation.x=s*.3;}p(g,'cone',a,-.85,.65,0,.25,.6,.25).rotation.z=.65;
    } else if(kind==='snail') {
      p(g,'ball',a,0,.2,0,.85,.2,.42);p(g,'ball',c,-.2,.65,0,.65);p(g,'ring',a,-.2,.65,.57,.37);p(g,'ball',a,.7,.5,0,.25);
    } else if(kind==='bird') {
      p(g,'ball',c,0,.5,0,.6,.45,.45);p(g,'cone',a,.55,.57,0,.13,.36,.13).rotation.z=-Math.PI/2;for(const s of [-1,1])p(g,'ball',a,-.1,.55,s*.48,.4,.08,.28);
    } else if(kind==='moth') {
      p(g,'pillar',a,0,.5,0,.15,.8,.15);for(const s of [-1,1])p(g,'ball',c,s*.45,.55,0,.5,.7,.11);
    } else { // The cup frog is also the tea-crab's friendly silhouette.
      p(g,'pillar',c,0,.4,0,.45,.65,.45);p(g,'ring',a,.52,.5,0,.3);for(const s of [-1,1]){p(g,'ball',a,s*.3,.82,0,.18);p(g,'ball',c,s*.5,.1,.25,.25,.12,.3);}
    }
    for(const s of [-1,1])p(g,'eye',0x293a45,(kind==='whale'?.52:s*.19),kind==='jelly'?.63:.65,kind==='whale'?s*.4:.43,.06,.08,.035);
    return g;
  }
  function buildPlace(def) {
    const root=new THREE.Group();root.name='tale-'+def.id;root.userData.tale=def.id;root.position.set(def.x,terrainHeight(def.x,def.z),def.z);
    const c=new THREE.Color(def.color).getHex(),a=new THREE.Color(def.accent).getHex(),ink=0x536675,cream=0xfff0ce;
    env.registerGlow(c,.28);env.registerGlow(a,1.15);env.registerGlow(cream,.6);
    // A terrain-conforming plaza lets the player reach every stop without clipping a platform.
    const floorGeo=new THREE.RingGeometry(.01,6.1,48,12);floorGeo.rotateX(-Math.PI/2);
    const floorPositions=floorGeo.attributes.position;
    for(let i=0;i<floorPositions.count;i++){const x=floorPositions.getX(i)+def.x,z=floorPositions.getZ(i)+def.z;floorPositions.setXYZ(i,x,terrainHeight(x,z)+.09,z);}
    floorGeo.computeVertexNormals();const floor=new THREE.Mesh(floorGeo,env.material(c));floor.userData.groundDisc=true;floor.receiveShadow=true;addProp(floor);
    const hero=new THREE.Group();root.add(hero);const orbit=new THREE.Group();root.add(orbit);
    switch(def.kind) {
      case'oven':
        p(hero,'ball',cream,0,2,0,3,1.8,2);p(hero,'box',c,0,1.65,1.1,3.3,2.1,2);p(hero,'ball',ink,0,1.6,2.15,1.2,.7,.1);p(hero,'pillar',c,-1.9,4,-.6,.55,3,.55);
        for(let i=0;i<3;i++)p(hero,'ball',cream,-1.9+Math.sin(i)*.3,5.6+i*.65,-.6,.6+i*.22,.35,.5);
        for(const s of [-1,1])p(hero,'ball',a,s*1.7,4.1,0,1.7,.6,1);break;
      case'teapot':
        p(hero,'ball',c,0,2.6,0,2.7,2.2,2.1);p(hero,'ring',a,2.5,2.7,0,1.7);const spout=p(hero,'cone',a,-2.6,3.2,0,.7,3,.7);spout.rotation.z=-.9;
        p(hero,'pillar',cream,0,4.45,0,2.3,.25,2);p(hero,'ball',a,0,4.8,0,.6);p(hero,'pillar',ink,0,6,0,.07,2.8,.07);p(hero,'cone',a,0,7,0,4.3,1.6,4.3);break;
      case'jelly':
        for(const s of [-1,1])p(hero,'gem',c,s*3,2,0,.75,2.5,.75);
        p(hero,'ring',a,0,5,0,3.5,3.5,.6);p(hero,'ball',c,0,5.7,0,2.2,1.2,2.2);
        for(let i=0;i<9;i++){const angle=i*TAU/9;p(hero,'pillar',a,Math.cos(angle)*1.5,3.9,Math.sin(angle)*1.5,.055,2.2,.055);}
        break;
      case'moon':
        p(hero,'pillar',c,0,3.2,0,1.5,6,1.5);p(hero,'cone',ink,0,6.5,0,2.3,1.6,2.3);p(hero,'crescent',a,0,9,0,2.7);p(hero,'ball',cream,0,4,1.45,.7,.9,.15);
        for(let i=0;i<3;i++){const ring=p(hero,'ring',a,0,2+i*1.5,0,1.8);ring.rotation.x=Math.PI/2;}break;
      case'whale':
        p(hero,'pillar',ink,0,2.5,0,.3,4.8,.3);p(hero,'ring',a,0,4.5,0,4.2).rotation.x=Math.PI/2;
        const whale=smallCreature(hero,'whale',c,cream);whale.scale.setScalar(3.2);whale.position.y=4.5;
        for(let i=0;i<4;i++)p(hero,'ball',cream,-3+i*2,2,0,1.5,.55,1.8);break;
      case'bottle':
        p(hero,'ring',a,0,3,0,3,3.7,.65);p(hero,'ring',c,0,3,0,2.65,3.4,.6);p(hero,'pillar',c,0,6.9,0,1.1,1.8,1.1);p(hero,'pillar',a,0,7.9,0,1.3,.55,1.3);
        p(hero,'ball',c,0,1.1,0,2.7,.6,2.1);for(let i=0;i<5;i++)p(hero,'ring',cream,(i-2)*.8,3.1+Math.sin(i)*1.4,0,.25+i*.09);break;
      case'carousel':
        p(hero,'pillar',ink,0,3.3,0,.35,6,.35);p(hero,'cone',c,0,6,0,4.5,2.2,4.5);p(hero,'gem',a,0,7.6,0,.45,.9,.45);
        for(let i=0;i<8;i++){const angle=i*TAU/8;p(hero,'pillar',a,Math.cos(angle)*3,3.5,Math.sin(angle)*3,.055,4.3,.055);}break;
      case'snail':
        const snail=smallCreature(hero,'snail',c,a);snail.scale.setScalar(3.7);snail.position.y=.75;
        p(hero,'pillar',cream,-.8,4.3,0,1.5,.2,1.4);for(let i=0;i<7;i++){p(hero,'pillar',0x749d81,-1.6+i*.28,4.9,0,.06,1.2,.06);p(hero,'ball',0xa8c79b,-1.6+i*.28,5.4,0,.35,.1,.25);}break;
      case'book':
        for(const s of [-1,1]){const cover=p(hero,'box',c,s*1.7,3.3,0,3.2,5.5,.45);cover.rotation.y=-s*.35;for(let i=0;i<4;i++)p(hero,'box',cream,s*1.7,2+i*.8,.45,2.3,.09,.15);}
        p(hero,'pillar',a,0,3,0,.3,5.8,.3);for(let i=0;i<5;i++){const ring=p(hero,'ring',i%2?c:a,0,6.6+i*.5,0,2+i*.45,1,.4);ring.rotation.x=.55;}break;
    }
    const petKind={oven:'bird',teapot:'cup',jelly:'jelly',moon:'moth',whale:'whale',bottle:'cup',carousel:'bird',snail:'snail',book:'whale'}[def.kind];
    const pets=[];for(let i=0;i<4;i++){const creature=smallCreature(orbit,petKind,i%2?c:a,cream);creature.userData.phase=i*TAU/4;pets.push(creature);}
    const lights=[];for(let i=0;i<12;i++){const gem=p(root,'gem',i%2?a:cream,Math.cos(i*TAU/12)*5.2,2.6+(i%3)*.7,Math.sin(i*TAU/12)*5.2,.12,.22,.12);gem.userData.baseScale=gem.scale.clone();lights.push(gem);}
    const haloCanvas=document.createElement('canvas');haloCanvas.width=64;haloCanvas.height=64;
    const ctx=haloCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
    gradient.addColorStop(0,'rgba(255,255,255,.9)');gradient.addColorStop(.25,'rgba(255,255,255,.35)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
    const haloMaterial=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(haloCanvas),color:a,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending});
    const halos=lights.map(light=>{const halo=new THREE.Sprite(haloMaterial);halo.position.copy(light.position);halo.scale.set(1.35,1.35,1);root.add(halo);return halo;});
    outline(root,1.018);addProp(root);
    env.buildings.push({group:root,x:def.x,z:def.z,radius:2.8,height:10,kind:'tale-landmark'});
    const stops=offsets.map(([dx,dz],i)=>{
      const stop=new THREE.Group(),x=def.x+dx,z=def.z+dz;stop.position.set(x,terrainHeight(x,z)+.15,z);stop.userData.taleStop=def.id+':'+i;
      const ring=p(stop,'ring',c,0,.1,0,.95);ring.rotation.x=Math.PI/2;
      const token=p(stop,'gem',a,0,1.1,0,.36,.65,.36);
      // Raised dots give each physical station a readable number as well as color.
      for(let n=0;n<=i;n++)p(stop,'ball',cream,(n-i/2)*.27,2,0,.1);
      outline(stop,1.03);addProp(stop,.15);return {root:stop,token,ring,x,z};
    });
    sign(def.name,def.x-5.4,def.z+1.6,def.accent).scale.setScalar(.85);
    const item={def,root,hero,orbit,pets,lights,halos,stops,celebrate:0};places.push(item);return item;
  }
  function build(){places.length=0;for(const def of TALE_PLACES)buildPlace(def);run=null;near=null;hudStamp='';lastHint='';}
  function clear(){clearGuests();places.length=0;run=null;near=null;hudStamp='';$('taleDock').hidden=true;$('wonderDock').hidden=false;document.body.classList.remove('tale-near');}
  function visit(id){const def=TALE_PLACES.find(p=>p.id===id);if(!def)return;env.travel(def.x,def.z+7.6);near=places.find(p=>p.def===def);inviteGuests(near);run=null;lastHint=def.invitation;hudStamp='';toast('抵达 '+def.name+' · H 参与 · E 和伙伴聊聊');env.refreshHUD();updateHUD();}
  function begin(item){
    if(state.riding){toast('先按 V 下车，再和这里的小生命打个招呼');return false;}
    run={id:item.def.id,step:0,found:[],age:0,variant:taleVariant(state)};lastHint=item.def.invitation;lastAttempt=clock;hudStamp='';return true;
  }
  function finish(item){
    const variant=run.variant,key=item.def.id+':'+variant,fresh=!story().cards.includes(key);
    if(fresh){story().cards.push(key);state.seeds+=1;env.updateResources();}
    item.celebrate=16;lastHint='「'+item.def[variant][0]+'」'+item.def[variant][1];
    toast(fresh?'收下故事明信片 · '+item.def[variant][0]+' / 花种 +1':'故事再次发生 · '+item.def[variant][0]);run=null;hudStamp='';
  }
  function interact(index=null){
    if($('atlas').open||!near)return;
    if(state.riding){toast('先按 V 下车，再参与奇想剧场');return;}
    const item=near,def=item.def;
    if(!run||run.id!==def.id){begin(item);updateHUD();return;}
    if(clock-lastAttempt<.23)return;lastAttempt=clock;
    if(def.mode==='timing'){
      const phase=(Math.sin(run.age*2.3)+1)/2;
      if(phase<.32||phase>.75){lastHint='再等一小会，指针进入金色窗就可以了。没有失败惩罚。';hudStamp='';updateHUD();return;}
      run.step++;lastHint=def.nodes[run.step-1]+'，接住了！';
    }else{
      if(index===null){const player=getPlayer();index=item.stops.findIndex(s=>Math.hypot(player.position.x-s.x,player.position.z-s.z)<2.25);}
      if(!Number.isInteger(index)||index<0||index>2){lastHint='走近周围带圆环的标记，按 H；'+(def.mode==='sequence'?'也可以点击下面的名字。':'每个标记上方有 1–3 个小圆点。');hudStamp='';updateHUD();return;}
      if(def.mode==='seek'){
        const player=getPlayer(),s=item.stops[index];if(Math.hypot(player.position.x-s.x,player.position.z-s.z)>2.25)return;
        if(run.found.includes(index)){lastHint='这一枚已经收好了，再找找另外两枚。';}else{run.found.push(index);run.step++;lastHint='收好了「'+def.nodes[index]+'」。';}
      }else if(index===def.order[run.step]){run.step++;lastHint='「'+def.nodes[index]+'」回应了你。';}
      else{run.step=0;lastHint='顺序不太对。再听听：'+def.order.map(i=>def.nodes[i]).join(' → ')+'。';}
    }
    if(run?.step===3)finish(item);hudStamp='';updateHUD();
  }
  function updateHUD(){
    const dock=$('taleDock');dock.hidden=!near;$('wonderDock').hidden=!!near;document.body.classList.toggle('tale-near',!!near);if(!near)return;
    const def=near.def,active=run?.id===def.id,variant=active?run.variant:taleVariant(state),count=story().cards.filter(c=>c.startsWith(def.id+':')).length;
    const stamp=[def.id,active?run.step:'idle',variant,count,lastHint].join('|');
    if(stamp!==hudStamp){
      hudStamp=stamp;$('taleName').textContent=def.name;$('taleEdition').textContent=({day:'日光篇',night:'月色篇',weather:'天候篇'}[variant])+' · 明信片 '+count+'/3';
      $('taleText').textContent=lastHint||def.invitation;$('taleTask').textContent=def.task;
      $('taleAction').textContent=active?(def.mode==='sequence'?'走近音标按 H，或选下方名字':def.action+' · H'):'开始这段小故事 · H';
      $('taleProgress').textContent=(active?'回应 '+run.step+' / 3':'随时可重玩 · 三种天候版本')+' · 靠近伙伴按 E 交谈';
      $('taleChoices').innerHTML=active&&def.mode==='sequence'?def.nodes.map((s,i)=>'<button data-note="'+i+'">'+(i+1)+' · '+s+'</button>').join(''):'';
      for(const b of $('taleChoices').querySelectorAll('[data-note]'))b.onclick=()=>interact(Number(b.dataset.note));
      $('taleMeter').hidden=!active||def.mode!=='timing';
    }
    if(active&&def.mode==='timing')$('taleNeedle').style.left=((Math.sin(run.age*2.3)+1)*50)+'%';
  }
  function update(dt,t){
    clock=t;const player=getPlayer();if(!player)return;
    const closest=places.find(p=>Math.hypot(player.position.x-p.def.x,player.position.z-p.def.z)<10);
    if(closest!==near){near=closest||null;inviteGuests(near);lastHint='';hudStamp='';if(run&&run.id!==near?.def.id)run=null;}
    if(near&&!story().visited.includes(near.def.id))story().visited.push(near.def.id);
    if(run&&!$('atlas').open)run.age+=dt;
    for(const guest of guests){guest.group.position.set(guest.x+Math.sin(t*.65+guest.index)*.3,terrainHeight(guest.x,guest.z)+Math.sin(t*2)*.04,guest.z);guest.group.rotation.y=Math.sin(t*.4)*.2;}
    const variant=taleVariant(state);
    for(const item of places){
      const d=Math.hypot(player.position.x-item.def.x,player.position.z-item.def.z);item.root.visible=d<100;
      for(const stop of item.stops)stop.root.visible=d<100;
      if(d>100)continue;
      item.celebrate=Math.max(0,item.celebrate-dt);const active=item.celebrate>0,complete=done(item.def),v=variant==='night'?1:variant==='weather'?2:0;
      item.orbit.rotation.y=t*(active?.35:.08)*(item.def.kind==='teapot'?-1:1);
      item.pets.forEach((pet,i)=>{const angle=i*TAU/4,r=active?3.8:4.3;pet.position.set(Math.cos(angle)*r,(active?5.5:1.8)+Math.sin(t*1.4+i)*.35+v*.6,Math.sin(angle)*r);pet.rotation.y=-angle;pet.rotation.z=Math.sin(t*2+i)*.06;pet.scale.setScalar(active?1.15:.8);});
      item.hero.rotation.z=Math.sin(t*.6)*.015*(active?3:1);
      item.lights.forEach((light,i)=>{light.visible=complete||v>0||active;light.position.y=(active?4.2:2.6)+(i%3)*.7+Math.sin(t*1.3+i)*.2;light.scale.copy(light.userData.baseScale).multiplyScalar(variant==='weather'?1.4:1);});
      item.halos.forEach((halo,i)=>{halo.visible=item.lights[i].visible;halo.position.copy(item.lights[i].position);});
      item.stops.forEach((s,i)=>{const collected=run?.id===item.def.id&&(run.found.includes(i)||item.def.mode!=='seek'&&item.def.order.indexOf(i)<run.step);s.token.visible=!collected;s.token.rotation.y=t*.8;s.token.position.y=1.1+Math.sin(t*2+i)*.2;s.ring.scale.setScalar(run?.id===item.def.id&&item.def.order[run.step]===i?1.2:1);});
    }
    updateHUD();
  }
  function cardHTML(def){
    const cards=story().cards,edition=taleVariant(state);
    return `<article class="tale-card" style="--tale-color:${def.color};--tale-accent:${def.accent}"><div class="tale-art tale-art-${def.kind}" aria-hidden="true"><span>${def.symbol}</span><i></i><b>${String(TALE_PLACES.indexOf(def)+1).padStart(2,'0')}</b></div><div class="tale-copy"><small>${def.en} · ${named(def.host)} × ${named(def.guest)}</small><h3>${def.name}</h3><p class="tale-rule">${def.rule}</p><p>${def.premise}</p><div class="tale-editions">${['day','night','weather'].map(v=>`<span class="${cards.includes(def.id+':'+v)?'earned':''}">${cards.includes(def.id+':'+v)?'✓ ':''}${{day:'日光',night:'月色',weather:'天候'}[v]}</span>`).join('')}</div><p class="tale-now">此刻：${def[edition][0]} · ${{sequence:'回应音序',timing:'接住时机',seek:'寻找小物'}[def.mode]}</p><button data-tale="${def.id}">去赴这场约 ↗</button><details><summary>翻开这里的故事卡 · ${cards.filter(c=>c.startsWith(def.id+':')).length}/3</summary>${['day','night','weather'].map(v=>`<p><b>${cards.includes(def.id+':'+v)?def[v][0]:'尚未收集 · '+{day:'日光篇',night:'月色篇',weather:'天候篇'}[v]}</b><br>${cards.includes(def.id+':'+v)?def[v][1]:'在'+{day:'晴朗或多云的白天',night:'晴朗或多云的夜晚',weather:'细雨、落雪或星辉天气'}[v]+'完成一次这里的小故事。'}</p>`).join('')}</details></div></article>`;
  }
  function content(){const count=story().cards.length,complete=TALE_PLACES.filter(done).length;return `<div class="tales-cover"><div><small>VOL. 03 / THE DAYS OF LITTLE MARVELS</small><h3>万物都有<br>自己的小心事。</h3><p>九处奇想剧场 · 二十七封故事来信<br>听说面包会飞，绿洲会走，月亮还可以借半轮。</p></div><div class="tales-passport"><b>${count}<em>/27</em></b><span>故事明信片</span><small>到访 ${story().visited.length}/9 · 点亮 ${complete}/9</small></div></div><div class="tales-note"><b>${complete===9?'九处灯都亮了，万物来信节开幕。':'一位朋友的好奇心，会长成一处新的地方。'}</b><p>${complete===9?'九个小心愿连成了回声环。明天去另一种天气里，再听听他们的故事吧。':'在地图上寻找 ✧，或从这里赴约。白天、夜晚与雨雪星辉各有一张故事卡；完成互动就能收下。'}</p><p>H 参与 · 每处三次回应 · 不消耗材料 · 新卡赠一粒花种 · 手动保存旅途</p><button id="taleWorldView" class="secondary">去地图看看这些地方 ↗</button></div><div class="tale-grid">${TALE_PLACES.map(cardHTML).join('')}</div>`;}
  function bind(){for(const b of document.querySelectorAll('[data-tale]'))b.onclick=()=>visit(b.dataset.tale);if($('taleWorldView'))$('taleWorldView').onclick=()=>env.openAtlas('map');}
  function mapPins(point){return TALE_PLACES.map(def=>{const pos=point(def.x,def.z);return `<button class="tale-map-pin ${done(def)?'earned':''}" style="left:${pos.left}%;top:${pos.top}%" title="${def.name}" aria-label="前往${def.name}" data-tale="${def.id}">✧</button>`;}).join('');}
  $('taleAction').onclick=()=>interact();$('openTales').onclick=()=>env.openAtlas('tales');$('taleBook').onclick=()=>env.openAtlas('tales');
  return {build,clear,update,interact,talk,visit,content,bind,mapPins,get places(){return places},get run(){return run},get near(){return near},get guests(){return guests}};
}
