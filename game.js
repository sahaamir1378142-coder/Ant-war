const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const $=id=>document.getElementById(id);
let save={stars:[]},cur=0,sel=new Set(),tries=0,busy=false,ac=null,muted=false,L,mode='none',walkers=[],bt=null;
try{save=JSON.parse(localStorage.getItem('ants01'))||save}catch(e){}
function persist(){try{localStorage.setItem('ants01',JSON.stringify(save))}catch(e){}}
function beep(f,d){if(muted)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.07;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
const NOTES=[523,587,659,784,880,988,1047];
function show(id){['menu','game'].forEach(s=>$(s).classList.toggle('hide',s!==id));if(id=='menu')mode='none'}
function menu(){
  $('ttl').textContent=T.title;$('sub').textContent=T.sub;
  const g=$('levels');g.innerHTML='';
  LEVELS.forEach((l,i)=>{const b=document.createElement('button');
    const ok=i==0||save.stars[i-1];const s=save.stars[i]||0;
    b.className='lv';b.disabled=!ok;
    b.innerHTML=ok?fa(i+1)+'<br><small>'+'⭐'.repeat(s)+'</small>':'🔒';
    b.onclick=()=>start(i);g.appendChild(b)});
  show('menu');
}
function start(i){
  cur=i;L=LEVELS[i];tries=0;sel.clear();busy=false;
  $('over').classList.add('hide');
  $('lvl').textContent=T.level+' '+fa(i+1);
  $('info').textContent=T.enemy+': '+fa(L.a*L.b);
  $('atk').textContent=T.attack;$('hint').textContent=T.pick;$('go').textContent=T.go;
  const n=$('nests');n.innerHTML='';
  for(let k=0;k<L.b+EXTRA_NESTS;k++){const b=document.createElement('button');b.className='nest';
    b.innerHTML=''+HILL+'';
    b.onclick=()=>{if(busy)return;sel.has(k)?sel.delete(k):sel.add(k);b.classList.toggle('on');beep(sel.has(k)?NOTES[sel.size%7]:380,.1);bar()};
    n.appendChild(b)}
  bar();show('game');peek();
}
function bar(){$('bar').textContent=fa(sel.size)+' '+T.picked}
// ---- دوربین، لونه و رسم ----
const HILL='<svg viewBox="0 0 80 56"><ellipse cx="40" cy="38" rx="37" ry="14" fill="#a8703a"/><ellipse cx="40" cy="34" rx="28" ry="12" fill="#c48a4d"/><ellipse cx="40" cy="32" rx="14" ry="6" fill="#3b2410"/><g fill="#a8703a"><circle cx="8" cy="44" r="2"/><circle cx="70" cy="46" r="2.5"/><circle cx="18" cy="51" r="1.6"/><circle cx="60" cy="52" r="1.8"/><circle cx="4" cy="36" r="1.5"/><circle cx="76" cy="38" r="1.5"/></g></svg>';
let camDir=1,camT0=0;
function peek(){
  walkers=Array.from({length:L.a},()=>({x:80+Math.random()*200,y:60+Math.random()*80,vx:(Math.random()<.5?-1:1)*(25+Math.random()*25),vy:(Math.random()-.5)*40}));
  $('peekui').classList.add('hide');$('playui').classList.add('hide');
  $('peekt').innerHTML=T.peekT+'<br><small>'+T.peekS+'</small>';
  camDir=1;camT0=performance.now();mode='cam';beep(300,.25);
}
$('go').onclick=()=>{$('peekui').classList.add('hide');camDir=-1;camT0=performance.now();mode='cam';beep(500,.25)};
$('eye').onclick=()=>{if(!busy&&mode=='idle')peek()};
const cv=$('cv'),cx=cv.getContext('2d');
const SPECK=Array.from({length:40},(_,i)=>({x:(i*97%340)+10,y:(i*53%180)+10,r:1+i%3}));
function ant(x,y,c,d,w,k=1){cx.save();cx.translate(x,y);cx.scale(d*k,k);cx.fillStyle=c;cx.strokeStyle=c;cx.lineWidth=2;
  for(let i=-1;i<=1;i++){cx.beginPath();cx.moveTo(0,0);cx.lineTo(i*6+Math.sin(w+i*2)*4,9);cx.stroke()}
  cx.beginPath();cx.ellipse(-7,0,7,5,0,0,7);cx.fill();
  cx.beginPath();cx.ellipse(2,0,4,4,0,0,7);cx.fill();
  cx.beginPath();cx.arc(9,-1,5,0,7);cx.fill();
  cx.fillStyle='#fff';cx.beginPath();cx.arc(11,-2,2,0,7);cx.fill();
  cx.fillStyle='#000';cx.beginPath();cx.arc(11.5,-2,1,0,7);cx.fill();cx.restore()}
function army(n,x,y,dir,c,w,cols=5){
  const per=Math.ceil(n/20),m=Math.ceil(n/per);
  for(let i=0;i<m;i++)ant(x-dir*(i%cols)*22,y+((i/cols)|0)*24+Math.sin(w*.8+i)*2,c,dir,w+i);
  if(per>1){cx.fillStyle='#333';cx.font='bold 14px Tahoma,sans-serif';cx.textAlign='center';cx.fillText('×'+fa(per),x-dir*44,y-14)}}
function mound(x,y,r){
  cx.fillStyle='#a8703a';cx.beginPath();cx.ellipse(x,y+r*.15,r*1.3,r*.44,0,0,7);cx.fill();
  cx.fillStyle='#c48a4d';cx.beginPath();cx.ellipse(x,y,r,r*.36,0,0,7);cx.fill();
  cx.fillStyle='#3b2410';cx.beginPath();cx.ellipse(x,y-r*.02,r*.42,r*.17,0,0,7);cx.fill();
  cx.fillStyle='#a8703a';
  for(let i=0;i<10;i++){const g=i*.63;cx.beginPath();cx.arc(x+Math.cos(g)*r*1.5,y+r*.2+Math.sin(g)*r*.36,r*.05,0,7);cx.fill()}}
function bg(){cx.fillStyle='#8fd3ff';cx.fillRect(0,0,360,200);cx.fillStyle='#9bd35a';cx.fillRect(0,60,360,140);mound(180,168,40)}
function draw(t,en,pn,win,label,w,rs){
  bg();
  let a=0,ox=0,oy=0;
  if(win!=-1){a=Math.min(t/.4,1);if(t>.6){const f=t-.6;ox=f*900;oy=-f*300}}
  army(en,110+a*60+(win=='p'?-ox:0),70+(win=='p'?oy:0),1,'#c0392b',w);
  if(pn)army(pn,250-a*60+(1-Math.min(t/.15,1))*150+(win=='e'?ox:0),70+(win=='e'?oy:0),-1,'#2b7bd0',w);
  if(rs&&t>.45)army(rs,-20+Math.min((t-.45)/.2,1)*210,156,1,'#8e1b12',w,10);
  cx.textAlign='center';
  if(t>.35&&t<.65){cx.font='28px sans-serif';cx.fillText('💥',180+Math.sin(t*40)*4,110)}
  if(label){cx.fillStyle='#333';cx.font='bold 15px Tahoma,sans-serif';cx.fillText(label,180,192)}
}
function moveWalkers(dt){
  walkers.forEach((w,i)=>{
    w.x+=w.vx*dt;w.y+=w.vy*dt;
    if(w.x<55||w.x>305)w.vx=-w.vx;
    if(w.y<55||w.y>150)w.vy=-w.vy;
    w.x=Math.max(55,Math.min(305,w.x));w.y=Math.max(55,Math.min(150,w.y));
    for(let j=0;j<i;j++){const o=walkers[j],dx=w.x-o.x,dy=w.y-o.y;if(dx*dx+dy*dy<1600){w.x+=dx>0?1.5:-1.5;w.y+=dy>0?1.5:-1.5}}
  })}
function cave(al,s){
  cx.save();cx.globalAlpha=al;
  const g=cx.createRadialGradient(180,100,10,180,100,200);
  g.addColorStop(0,'#d9a066');g.addColorStop(.6,'#a8703a');g.addColorStop(1,'#4a2c14');
  cx.fillStyle=g;cx.fillRect(0,0,360,200);
  cx.fillStyle='#0000001f';SPECK.forEach(p=>{cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});
  cx.fillStyle='#ffffff26';cx.beginPath();cx.moveTo(150,0);cx.lineTo(210,0);cx.lineTo(270,200);cx.lineTo(90,200);cx.fill();
  walkers.forEach((w,i)=>ant(w.x,w.y,'#2b7bd0',w.vx>=0?1:-1,s*12+i*2,1.5));
  cx.restore()}
function drawCam(now){
  const t=Math.min((now-camT0)/1300,1),u=camDir>0?t:1-t,e=u*u,hx=180,hy=168,s=1+8*e;
  cx.save();cx.translate(hx,hy+(100-hy)*e);cx.scale(s,s);cx.translate(-hx,-hy);
  draw(0,L.a*L.b,0,-1,'',now/1000*12,0);cx.restore();
  cave(Math.max(0,Math.min((u-.55)/.4,1)),now/1000);
  if(t>=1){if(camDir>0){mode='peek';$('peekui').classList.remove('hide')}else{mode='idle';$('playui').classList.remove('hide')}}
}
function drawBattle(now){
  const b=bt,t=Math.min((now-b.t0)/3200,1);let label='';
  if(t>.45){if(b.pn>b.en)label=T.tooMany;else if(b.pn<b.en)label=T.tooFew}
  if(!b.hit&&t>.4){b.hit=1;beep(200,.15)}
  draw(t,b.en,b.pn,b.winner,label,now/1000*12,b.pn>b.en?b.pn+3-b.en:0);
  if(t>=1){mode='none';end(b.pn,b.en)}
}
let last=performance.now();
function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;
  if(mode=='peek'||mode=='cam')moveWalkers(dt);
  if(mode=='peek'){cx.clearRect(0,0,360,200);cave(1,now/1000)}
  else if(mode=='cam')drawCam(now);
  else if(mode=='idle')draw(0,L.a*L.b,0,-1,'',now/1000*12,0);
  else if(mode=='battle')drawBattle(now);
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
function attack(){
  if(busy||sel.size==0||mode!='idle')return;busy=true;
  const en=L.a*L.b,pn=sel.size*L.a;
  $('bar').textContent=fa(sel.size)+' × '+fa(L.a)+' = '+fa(pn);
  bt={t0:performance.now(),en,pn,winner:pn==en?'p':'e'};mode='battle';
}
function end(pn,en){
  const win=pn==en;beep(win?700:180,.4);
  const o=$('over');o.classList.remove('hide');
  let h='<h2>'+(win?T.win:T.lose)+'</h2>';
  if(win){const s=tries==0?3:tries==1?2:1;
    save.stars[cur]=Math.max(save.stars[cur]||0,s);persist();
    h+='<p>'+'⭐'.repeat(s)+'</p><p>'+fa(L.b)+' × '+fa(L.a)+' = '+fa(en)+'</p>';
    h+=(cur<LEVELS.length-1?'<button id="n">'+T.next+'</button>':'')+'<button id="m">'+T.back+'</button>';
  }else{
    tries++;
    h+='<p>'+(pn>en?T.tooMany:T.tooFew)+'</p><p>'+T.right+'</p><div class="arr">';
    for(let r=0;r<L.b;r++)h+='<div>'+'🐜'.repeat(L.a)+'</div>';
    h+='</div><p>'+fa(L.b)+' × '+fa(L.a)+' = '+fa(en)+'</p><button id="r">'+T.retry+'</button>';
  }
  o.innerHTML='<div class="card">'+h+'</div>';
  if($('n'))$('n').onclick=()=>start(cur+1);
  if($('m'))$('m').onclick=menu;
  if($('r'))$('r').onclick=()=>{sel.clear();busy=false;o.classList.add('hide');document.querySelectorAll('.nest').forEach(x=>x.classList.remove('on'));bar();mode='idle'};
}
$('atk').onclick=attack;$('back').onclick=menu;
$('snd').onclick=()=>{muted=!muted;$('snd').textContent=muted?'🔇':'🔊'};
menu();
