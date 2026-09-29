const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const eq=(x,y,z)=>'<span class="eq">'+fa(x)+' × '+fa(y)+' = '+fa(z)+'</span>';
const angd=(a,b)=>((b-a+3*Math.PI)%(2*Math.PI))-Math.PI;
let save={stars:[],seen:0},cur=0,sel=new Set(),tries=0,busy=false,ac=null,muted=false,L,mode='none',walkers=[],bt=null,camDir=1,camT0=0;
try{const s=JSON.parse(localStorage.getItem('ants01'));if(s)save=Object.assign(save,s)}catch(e){}
function persist(){try{localStorage.setItem('ants01',JSON.stringify(save))}catch(e){}}
function beep(f,d){if(muted)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state=='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f;g.gain.value=.08;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
const tune=ns=>ns.forEach((f,i)=>setTimeout(()=>beep(f,.16),i*130));
const NOTES=[523,587,659,784,880,988,1047];
const HILL='<svg viewBox="0 0 80 56"><ellipse cx="40" cy="38" rx="37" ry="14" fill="#3f3122"/><ellipse cx="40" cy="34" rx="28" ry="12" fill="#5b4630"/><ellipse cx="40" cy="32" rx="14" ry="6" fill="#0e0906"/><g fill="#3f3122"><circle cx="8" cy="44" r="2"/><circle cx="70" cy="46" r="2.5"/><circle cx="18" cy="51" r="1.6"/><circle cx="60" cy="52" r="1.8"/><circle cx="4" cy="36" r="1.5"/><circle cx="76" cy="38" r="1.5"/></g></svg>';
const HOLE={e:[36,170],p:[324,170]};
function show(id){['menu','game'].forEach(s=>$(s).classList.toggle('hide',s!==id));if(id=='menu')mode='none'}
function labels(){$('back').textContent=T.menu;$('eye').textContent=T.eye}
function menu(){
  labels();
  $('ttl').textContent=T.title;$('sub').textContent=T.sub;
  const g=$('levels');g.innerHTML='';
  LEVELS.forEach((l,i)=>{const b=document.createElement('button');
    const ok=i==0||save.stars[i-1];const s=save.stars[i]||0;
    b.className='lv';b.disabled=!ok;
    b.innerHTML=ok?fa(i+1)+'<br><small>'+'★'.repeat(s)+'☆'.repeat(3-s)+'</small>':'—';
    b.onclick=()=>start(i);g.appendChild(b)});
  show('menu');
}
function setInfo(){$('info').innerHTML=T.enemy(L.a*L.b)+'<br><small>'+T.ask(L.a*L.b)+'</small>'}
function help(){const o=$('over');o.classList.remove('hide');
  o.innerHTML='<div class="card"><h2>'+T.howT+'</h2><ol class="how">'+T.how.map(x=>'<li>'+x+'</li>').join('')+'</ol><button id="ok">'+T.ok+'</button></div>';
  $('ok').onclick=()=>{o.classList.add('hide');save.seen=1;persist()}}
// سؤال هم‌سطح: برای مرحله‌ای که قبلاً حل شده، جفت (a,b) جدید با «اندازه‌ی» مشابه (حاصل‌ضرب ۰٫۷ تا ۱٫۳۵ برابر) و بدون تکرار سؤال قبلی
const asked={};
function variant(i){
  const base=LEVELS[i],P=base.a*base.b,mx=Math.max(10,base.a,base.b),c=[];
  for(let a=2;a<=mx;a++)for(let b=2;b<=mx;b++){
    if(a==base.a&&b==base.b)continue;
    if(Math.abs(a-base.a)>2||Math.abs(b-base.b)>2)continue;
    const r=a*b/P;if(r<.7||r>1.35)continue;c.push({a,b,r})}
  if(!c.length)return base;
  const used=asked[i]||(asked[i]=[]),key=q=>q.a+'x'+q.b;
  let pool=c.filter(q=>!used.includes(key(q)));
  if(!pool.length){asked[i]=[];pool=c.filter(q=>key(q)!=used[used.length-1]);if(!pool.length)pool=c}
  const q=pool[Math.floor(Math.random()*pool.length)];asked[i].push(key(q));
  return Object.assign({},base,{a:q.a,b:q.b})}
function start(i){
  cur=i;L=save.stars[i]?variant(i):LEVELS[i];tries=0;sel.clear();busy=false;
  $('over').classList.add('hide');
  $('lvl').textContent=T.level+' '+fa(i+1);setInfo();
  $('atk').textContent=T.attack;$('go').textContent=T.go;
  const n=$('nests');n.innerHTML='';
  for(let k=0;k<L.b+EXTRA_NESTS;k++){const b=document.createElement('button');b.className='nest';
    b.innerHTML=HILL;
    b.onclick=()=>{if(busy)return;sel.has(k)?sel.delete(k):sel.add(k);b.classList.toggle('on');beep(sel.has(k)?NOTES[sel.size%7]:380,.1);bar()};
    n.appendChild(b)}
  bar();show('game');peek();if(!save.seen)help();
}
function bar(){$('bar').textContent=fa(sel.size)+' '+T.picked}
// ---- دوربین و داخل لونه ----
function peek(){
  walkers=Array.from({length:L.a},()=>({x:rnd(90,270),y:rnd(70,130),t:rnd(0,6.28),base:rnd(30,50),z:rnd(0,6),ph:0}));
  $('peekui').classList.add('hide');$('playui').classList.add('hide');
  $('peekt').innerHTML=T.peekT+'<br><small>'+T.peekS+'</small>';
  camDir=1;camT0=performance.now();mode='cam';beep(300,.25);
}
$('go').onclick=()=>{$('peekui').classList.add('hide');camDir=-1;camT0=performance.now();mode='cam';beep(500,.25)};
$('eye').onclick=()=>{if(!busy&&mode=='idle')peek()};
$('help').onclick=help;
const S=Math.min(3,Math.max(2,window.devicePixelRatio||2));
const cv=$('cv'),cx=cv.getContext('2d');cv.width=360*S;cv.height=200*S;
const SPECK=Array.from({length:40},(_,i)=>({x:(i*97%340)+10,y:(i*53%180)+10,r:1+i%3}));
// مورچه از بالا دیده میشه (پاها دو طرف، دو چشم) پس هر چرخشی طبیعیه. face: 0 عادی، 1 گیج (چشم ×، دهان ○)، 2 خوشحال
function ant(x,y,c,w,k,rot,face){cx.save();cx.translate(x,y);cx.rotate(rot);cx.scale(k,k);cx.fillStyle="rgba(0,0,0,.28)";cx.beginPath();cx.ellipse(0,3,14,7,0,0,7);cx.fill();cx.fillStyle=c;cx.strokeStyle=c;cx.lineWidth=2;
  for(let i=-1;i<=1;i++)for(let s=-1;s<=1;s+=2){cx.beginPath();cx.moveTo(i*4,0);cx.lineTo(i*4+Math.sin(w+i*2+(s>0?0:3))*4,s*9);cx.stroke()}
  cx.lineWidth=1;for(let s=-1;s<=1;s+=2){cx.beginPath();cx.moveTo(13,s*2);cx.lineTo(18,s*6);cx.stroke()}
  cx.beginPath();cx.ellipse(-7,0,7,5,0,0,7);cx.fill();
  cx.beginPath();cx.ellipse(1,0,4,4,0,0,7);cx.fill();
  cx.beginPath();cx.arc(9,0,5.5,0,7);cx.fill();
  for(let s=-1;s<=1;s+=2){
    if(face==1){cx.strokeStyle='#000';cx.lineWidth=1;cx.beginPath();cx.moveTo(9.5,s*2.6-1.6);cx.lineTo(12.5,s*2.6+1.6);cx.moveTo(12.5,s*2.6-1.6);cx.lineTo(9.5,s*2.6+1.6);cx.stroke()}
    else{cx.fillStyle='#fff';cx.beginPath();cx.arc(11,s*2.6,1.9,0,7);cx.fill();cx.fillStyle='#000';cx.beginPath();cx.arc(11.6,s*2.6,.9,0,7);cx.fill()}}
  cx.strokeStyle='#000';cx.lineWidth=1;
  if(face==1){cx.beginPath();cx.arc(14,0,1.5,0,7);cx.stroke()}
  if(face==2){cx.beginPath();cx.arc(12,0,2.6,-1,1);cx.stroke()}
  cx.restore()}
function mound(x,y,r){
  cx.fillStyle='#3f3122';cx.beginPath();cx.ellipse(x,y+r*.15,r*1.3,r*.44,0,0,7);cx.fill();
  cx.fillStyle='#5b4630';cx.beginPath();cx.ellipse(x,y,r,r*.36,0,0,7);cx.fill();
  cx.strokeStyle='#8a6a47';cx.lineWidth=1;cx.stroke();
  cx.fillStyle='#0e0906';cx.beginPath();cx.ellipse(x,y-r*.02,r*.42,r*.17,0,0,7);cx.fill();
  cx.fillStyle='#3f3122';
  for(let i=0;i<10;i++){const g=i*.63;cx.beginPath();cx.arc(x+Math.cos(g)*r*1.5,y+r*.2+Math.sin(g)*r*.36,r*.05,0,7);cx.fill()}}
function flag(x,y,c){cx.strokeStyle='#c9b79c';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x,y-34);cx.stroke();cx.fillStyle=c;cx.beginPath();cx.moveTo(x,y-34);cx.lineTo(x+16,y-28);cx.lineTo(x,y-22);cx.fill()}
function spark(x,y,w){cx.strokeStyle='#ffe08a';cx.lineWidth=2;for(let j=0;j<8;j++){const t=j*.785+w*3,r1=5,r2=j%2?11:17;cx.beginPath();cx.moveTo(x+Math.cos(t)*r1,y+Math.sin(t)*r1);cx.lineTo(x+Math.cos(t)*r2,y+Math.sin(t)*r2);cx.stroke()}}
function bg(){
  const g=cx.createLinearGradient(0,0,0,46);g.addColorStop(0,'#1c2f44');g.addColorStop(1,'#d69a5a');
  cx.fillStyle=g;cx.fillRect(0,0,360,46);
  cx.fillStyle='#2d3a22';cx.fillRect(0,45,360,155);
  cx.fillStyle='#ffffff0d';for(let y=60;y<200;y+=14)cx.fillRect(0,y,360,1);
  mound(HOLE.e[0],HOLE.e[1],30);mound(HOLE.p[0],HOLE.p[1],30);flag(HOLE.e[0]+8,150,'#d64545');flag(HOLE.p[0]-8,150,'#2ec4b6')}
function moveWalkers(dt){
  walkers.forEach((a,i)=>{
    let rx=0,ry=0;
    walkers.forEach((o,j)=>{if(j!=i){const dx=a.x-o.x,dy=a.y-o.y,d=Math.hypot(dx,dy)||1;if(d<46){rx+=dx/d*(46-d);ry+=dy/d*(46-d)}}});
    if(rx||ry)a.t+=angd(a.t,Math.atan2(ry,rx))*Math.min(1,dt*6);
    else a.t+=(Math.random()-.5)*dt*6;
    if(a.x<70||a.x>290||a.y<60||a.y>145)a.t+=angd(a.t,Math.atan2(100-a.y,180-a.x))*Math.min(1,dt*5);
    a.z+=dt*.8;const sp=a.base*(.5+.5*Math.abs(Math.sin(a.z)));
    a.x=clamp(a.x+Math.cos(a.t)*sp*dt,40,320);a.y=clamp(a.y+Math.sin(a.t)*sp*dt,45,160);a.ph+=sp*dt*.7;
  })}
function cave(al){
  cx.save();cx.globalAlpha=al;
  const g=cx.createRadialGradient(180,100,10,180,100,210);
  g.addColorStop(0,'#7a5535');g.addColorStop(.55,'#4a3221');g.addColorStop(1,'#150d07');
  cx.fillStyle=g;cx.fillRect(0,0,360,200);
  cx.fillStyle='#00000030';SPECK.forEach(p=>{cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});
  cx.fillStyle='#ffd9a01f';cx.beginPath();cx.moveTo(150,0);cx.lineTo(210,0);cx.lineTo(270,200);cx.lineTo(90,200);cx.fill();
  walkers.forEach(a=>ant(a.x,a.y,'#2ec4b6',a.ph,1.5,a.t,0));
  cx.restore()}
function drawCam(now){
  const t=Math.min((now-camT0)/1300,1),u=camDir>0?t:1-t,e=u*u,hx=HOLE.p[0],hy=HOLE.p[1],s=1+8*e;
  cx.save();cx.translate(hx+(180-hx)*e,hy+(100-hy)*e);cx.scale(s,s);cx.translate(-hx,-hy);
  bg();cx.restore();
  cave(clamp((u-.55)/.4));
  if(t>=1){if(camDir>0){mode='peek';$('peekui').classList.remove('hide')}else{mode='idle';$('playui').classList.remove('hide')}}
}
// ---- جنگ: هر مورچه از سوراخ لونه‌ی خودش، مستقل و با زمان‌بندی خودش میاد بیرون ----
function mk(n,cols,cap,fx,dir,hole,t0){
  const per=Math.ceil(n/cap),m=Math.ceil(n/per),a=[];
  for(let i=0;i<m;i++){
    const sx=fx-dir*(i%cols)*26+rnd(-3,3),sy=58+((i/cols)|0)*20+rnd(-2,2),st=t0+i*.07+rnd(0,.06),v=rnd(105,145);
    const dx=sx-hole[0],dy=sy-hole[1],dist=Math.hypot(dx,dy);
    a.push({sx,sy,hx:hole[0],hy:hole[1],st,v,dist,arr:st+.3+dist/v,ph:rnd(0,6),ang:Math.atan2(dy,dx),face:dir==1?0:Math.PI})}
  return{per,a,end:Math.max(...a.map(z=>z.arr))}}
function place(a,s){
  if(s<a.st)return null;
  const e=(s-a.st)/.3;
  if(e<1){const k=ease(e);return{x:a.hx,y:a.hy-4*k,rot:a.ang,k:1.2*k,leg:0,arr:0}}
  const p=clamp((s-a.st-.3)*a.v/a.dist);let rot=a.ang;
  if(p>.85)rot=a.ang+angd(a.ang,a.face)*ease((p-.85)/.15);
  return{x:a.hx+(a.sx-a.hx)*p,y:a.hy+(a.sy-a.hy)*p,rot,k:1.2,leg:p*a.dist*.7,arr:p>=1}}
function tag(per,x,y){cx.font='bold 14px Tahoma,sans-serif';cx.lineWidth=3;cx.strokeStyle='#0b1210';cx.strokeText('×'+fa(per),x,y);cx.fillStyle='#ffe08a';cx.fillText('×'+fa(per),x,y)}
function drawBattle(now){
  const b=bt,s=(now-b.t0)/1000,w=now/1000;
  bg();cx.textAlign='center';cx.direction='ltr';
  const arms=[[b.E,'#d64545',1,b.win],[b.P,'#2ec4b6',-1,!b.win]];
  if(b.R)arms.push([b.R,'#a32a2a',1,false]);
  arms.forEach(([A,c,dir,lose])=>A.a.forEach(a=>{
    const p=place(a,s);if(!p)return;
    let{x,y,rot,k,leg}=p,face=0;
    if(p.arr&&s>b.tM&&s<b.tC){x+=dir*Math.max(0,Math.sin(w*22+a.ph))*5;leg=w*20+a.ph}
    if(s>=b.tC){
      const u=clamp((s-b.tC)/.3);
      if(lose){x-=dir*26*ease(u);y-=Math.sin(Math.PI*u)*12;rot+=Math.sin(w*4+a.ph)*.3;face=1;leg=0}
      else{y-=Math.abs(Math.sin(w*10+a.ph))*5;face=2}}
    ant(x,y,c,leg,k,rot,face);
    if(lose&&s>=b.tC){cx.fillStyle='#ffc400';cx.font='11px sans-serif';
      for(let j=0;j<3;j++){const g=w*5+j*2.1;cx.fillText('★',x+Math.cos(g)*10,y-14+Math.sin(g)*3)}}
  }));
  if(s<b.tC){if(b.E.per>1)tag(b.E.per,36,192);if(b.P.per>1)tag(b.P.per,324,192)}
  cx.font='26px sans-serif';
  if(s>b.tM&&s<b.tC)for(let k=0;k<3;k++)if(Math.sin(w*18+k*2)>-.3)spark(180+Math.sin(k*5)*8,90+k*30,w);
  if(!b.hit&&s>b.tM){b.hit=1;beep(200,.15)}
  if(b.R&&!b.rh&&s>b.R.a[0].st){b.rh=1;beep(160,.2);$('info').textContent=T.reserve}
  if(s>=b.tEnd){mode='none';end(b.pn,b.en)}
}
let last=performance.now();
function loop(now){cx.setTransform(S,0,0,S,0,0);const dt=Math.min((now-last)/1000,.05);last=now;
  if(mode=='peek'||mode=='cam')moveWalkers(dt);
  if(mode=='peek'){cx.clearRect(0,0,360,200);cave(1)}
  else if(mode=='cam')drawCam(now);
  else if(mode=='idle'){bg()}
  else if(mode=='battle')drawBattle(now);
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
function attack(){
  if(busy||sel.size==0||mode!='idle')return;busy=true;
  const en=L.a*L.b,pn=sel.size*L.a,rs=pn>en?pn+3-en:0;
  $('bar').innerHTML=eq(sel.size,L.a,pn);
  const E=mk(en,4,20,170,1,HOLE.e,.2),P=mk(pn,4,20,190,-1,HOLE.p,.2),tM=Math.max(E.end,P.end);
  let R=null,tC=tM+1.1;
  if(rs){R=mk(rs,3,12,66,1,HOLE.e,tM+.4);tC=R.end+.9}
  bt={t0:performance.now(),en,pn,win:pn==en,E,P,R,tM,tC,tEnd:tC+1.6,hit:0,rh:0};
  mode='battle';beep(330,.1);
}
function end(pn,en){
  const win=pn==en;win?tune([523,659,784,1047]):tune([392,349,311]);
  const o=$('over');o.classList.remove('hide');
  let h='<h2>'+(win?T.win:T.lose)+'</h2>';
  if(win){const s=tries==0?3:tries==1?2:1;
    save.stars[cur]=Math.max(save.stars[cur]||0,s);persist();
    h+='<p class="gold" style="font-size:26px">'+'★'.repeat(s)+'☆'.repeat(3-s)+'</p><p>'+eq(L.b,L.a,en)+'</p><p class="mut">'+(s==3?T.perfect:T.starHint)+'</p>';
    h+=(cur<LEVELS.length-1?'<button id="n">'+T.next+'</button>':'')+(s<3?'<button id="rp" class="alt">'+T.replay3+'</button>':'')+'<button id="m" class="'+(s<3?'alt':'')+'">'+T.back+'</button>';
  }else{
    tries++;
    h+='<p>'+(pn>en?T.tooMany:T.tooFew)+'</p><p>'+T.right+'</p><div class="arr">';
    for(let r=0;r<L.b;r++)h+='<div>'+'● '.repeat(L.a)+'</div>';
    h+='</div><p>'+eq(L.b,L.a,en)+'</p><button id="r">'+T.retry+'</button>';
  }
  o.innerHTML='<div class="card">'+h+'</div>';
  if($('n'))$('n').onclick=()=>start(cur+1);
  if($('m'))$('m').onclick=menu;
  if($('rp'))$('rp').onclick=()=>start(cur);
  if($('r'))$('r').onclick=()=>{sel.clear();busy=false;o.classList.add('hide');document.querySelectorAll('.nest').forEach(x=>x.classList.remove('on'));bar();setInfo();mode='idle'};
}
$('atk').onclick=attack;$('back').onclick=menu;
$('snd').onclick=()=>{muted=!muted;$('snd').textContent=muted?'♪ ×':'♪'};
menu();
