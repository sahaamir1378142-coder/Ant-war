const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const $=id=>document.getElementById(id);
let save={stars:[]},cur=0,sel=new Set(),tries=0,busy=false,ac=null,muted=false,L,mode='none',walkers=[],bt=null;
try{save=JSON.parse(localStorage.getItem('ants01'))||save}catch(e){}
function persist(){try{localStorage.setItem('ants01',JSON.stringify(save))}catch(e){}}
function beep(f,d){if(muted)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state=='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.07;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
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
  cur=i;L=LEVELS[i];IA=mk(L.a*L.b,5);tries=0;sel.clear();busy=false;
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
let camDir=1,camT0=0,IA=null;
const S=Math.min(3,Math.max(2,window.devicePixelRatio||2));
const cv=$('cv'),cx=cv.getContext('2d');cv.width=360*S;cv.height=200*S;
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function peek(){
  walkers=Array.from({length:L.a},()=>({x:rnd(80,280),y:rnd(60,140),t:rnd(0,6.28),base:rnd(30,50),z:rnd(0,6),ph:0,sp:0}));
  $('peekui').classList.add('hide');$('playui').classList.add('hide');
  $('peekt').innerHTML=T.peekT+'<br><small>'+T.peekS+'</small>';
  camDir=1;camT0=performance.now();mode='cam';beep(300,.25);
}
$('go').onclick=()=>{$('peekui').classList.add('hide');camDir=-1;camT0=performance.now();mode='cam';beep(500,.25)};
$('eye').onclick=()=>{if(!busy&&mode=='idle')peek()};
const SPECK=Array.from({length:40},(_,i)=>({x:(i*97%340)+10,y:(i*53%180)+10,r:1+i%3}));
function ant(x,y,c,d,w,k=1,rot=0){cx.save();cx.translate(x,y);cx.rotate(rot);cx.scale(d*k,k);cx.fillStyle=c;cx.strokeStyle=c;cx.lineWidth=2;
  for(let i=-1;i<=1;i++){cx.beginPath();cx.moveTo(0,0);cx.lineTo(i*6+Math.sin(w+i*2)*4,9);cx.stroke()}
  cx.beginPath();cx.ellipse(-7,0,7,5,0,0,7);cx.fill();
  cx.beginPath();cx.ellipse(2,0,4,4,0,0,7);cx.fill();
  cx.beginPath();cx.arc(9,-1,5,0,7);cx.fill();
  cx.fillStyle='#fff';cx.beginPath();cx.arc(11,-2,2,0,7);cx.fill();
  cx.fillStyle='#000';cx.beginPath();cx.arc(11.5,-2,1,0,7);cx.fill();cx.restore()}
// هر ارتش = لیست مورچه‌ها؛ هر مورچه پارامتر تصادفی خودش رو داره (تأخیر، سرعت، فاز پا)
function mk(n,cols){const per=Math.ceil(n/20),m=Math.ceil(n/per),a=[];
  for(let i=0;i<m;i++)a.push({i,cols,d:rnd(0,.1),sp:rnd(.85,1.15),ph:rnd(0,6),fx:rnd(450,800),fy:rnd(300,500),spin:rnd(-1,1)*12});
  return{per,a}}
const slot=(a,x0,y0,dir)=>[x0-dir*(a.i%a.cols)*22,y0+((a.i/a.cols)|0)*24];
function tag(per,x,y){cx.fillStyle='#333';cx.font='bold 14px Tahoma,sans-serif';cx.textAlign='center';cx.fillText('×'+fa(per),x,y)}
function mound(x,y,r){
  cx.fillStyle='#a8703a';cx.beginPath();cx.ellipse(x,y+r*.15,r*1.3,r*.44,0,0,7);cx.fill();
  cx.fillStyle='#c48a4d';cx.beginPath();cx.ellipse(x,y,r,r*.36,0,0,7);cx.fill();
  cx.fillStyle='#3b2410';cx.beginPath();cx.ellipse(x,y-r*.02,r*.42,r*.17,0,0,7);cx.fill();
  cx.fillStyle='#a8703a';
  for(let i=0;i<10;i++){const g=i*.63;cx.beginPath();cx.arc(x+Math.cos(g)*r*1.5,y+r*.2+Math.sin(g)*r*.36,r*.05,0,7);cx.fill()}}
function bg(){cx.fillStyle='#8fd3ff';cx.fillRect(0,0,360,200);cx.fillStyle='#9bd35a';cx.fillRect(0,60,360,140);mound(180,168,40)}
function drawIdle(now){
  const w=now/1000;bg();
  IA.a.forEach(a=>{const[sx,sy]=slot(a,110,70,1);ant(sx+Math.sin(w*1.2+a.ph)*3,sy+Math.sin(w*2+a.ph)*2,'#c0392b',1,w*3+a.ph)});
  if(IA.per>1)tag(IA.per,60,58);
}
function moveWalkers(dt){
  walkers.forEach((a,i)=>{
    a.t+=(Math.random()-.5)*dt*5;a.z+=dt*.8;a.sp=a.base*(.5+.5*Math.abs(Math.sin(a.z)));
    a.x+=Math.cos(a.t)*a.sp*dt;a.y+=Math.sin(a.t)*a.sp*dt;a.ph+=a.sp*dt*.5;
    if(a.x<55){a.x=55;a.t=Math.PI-a.t}if(a.x>305){a.x=305;a.t=Math.PI-a.t}
    if(a.y<55){a.y=55;a.t=-a.t}if(a.y>150){a.y=150;a.t=-a.t}
    for(let j=0;j<i;j++){const o=walkers[j],dx=a.x-o.x,dy=a.y-o.y;if(dx*dx+dy*dy<1600){a.x+=dx>0?1.5:-1.5;a.y+=dy>0?1.5:-1.5}}
  })}
function cave(al,s){
  cx.save();cx.globalAlpha=al;
  const g=cx.createRadialGradient(180,100,10,180,100,200);
  g.addColorStop(0,'#d9a066');g.addColorStop(.6,'#a8703a');g.addColorStop(1,'#4a2c14');
  cx.fillStyle=g;cx.fillRect(0,0,360,200);
  cx.fillStyle='#0000001f';SPECK.forEach(p=>{cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});
  cx.fillStyle='#ffffff26';cx.beginPath();cx.moveTo(150,0);cx.lineTo(210,0);cx.lineTo(270,200);cx.lineTo(90,200);cx.fill();
  walkers.forEach(a=>{const f=Math.cos(a.t)>=0;ant(a.x,a.y,'#2b7bd0',f?1:-1,a.ph,1.5,f?a.t:a.t-Math.PI)});
  cx.restore()}
function drawCam(now){
  const t=Math.min((now-camT0)/1300,1),u=camDir>0?t:1-t,e=u*u,hx=180,hy=168,s=1+8*e;
  cx.save();cx.translate(hx,hy+(100-hy)*e);cx.scale(s,s);cx.translate(-hx,-hy);
  drawIdle(now);cx.restore();
  cave(clamp((u-.55)/.4),now/1000);
  if(t>=1){if(camDir>0){mode='peek';$('peekui').classList.remove('hide')}else{mode='idle';$('playui').classList.remove('hide')}}
}
// یک مورچه‌ی جنگ: راه رفتن، حمله‌ی رفت‌وبرگشتی، فرار پرتابی (بازنده) یا ذوق (برنده)
function put(a,c,dir,x,y,lose,t,b,w,moving){
  let rot=0;
  if(lose&&t>b.F){const tau=Math.max(0,(t-b.F)*b.D/1000-a.d*2);x-=dir*a.fx*tau;y+=-a.fy*tau+520*tau*tau;rot=a.spin*tau;moving=false}
  else if(!lose&&t>b.F+.03)y-=Math.abs(Math.sin(w*10+a.ph))*5;
  else if(t>.36&&t<b.F)x+=dir*Math.max(0,Math.sin(w*22+a.ph))*6;
  ant(x,y-(moving?Math.abs(Math.sin(w*14+a.ph))*2:0),c,dir,w*(moving?14:3)+a.ph,1,rot);
}
function drawBattle(now){
  const b=bt,t=clamp((now-b.t0)/b.D),w=now/1000,eLose=b.win,pLose=!b.win;
  bg();
  b.E.a.forEach(a=>{const[sx,sy]=slot(a,110,70,1),p=ease(clamp((t-a.d)/.3));
    put(a,'#c0392b',1,sx+60*p+(a.sp-1)*15*p,sy,eLose,t,b,w,p>0&&p<1)});
  b.P.a.forEach(a=>{const[sx,sy]=slot(a,250,70,-1),p=ease(clamp((t-a.d)/.3));
    put(a,'#2b7bd0',-1,sx+170-230*p+(a.sp-1)*15*p,sy,pLose,t,b,w,p>0&&p<1)});
  if(b.R)b.R.a.forEach(a=>{const[sx,sy]=slot(a,-85,156,1),p=ease(clamp((t-.42-a.d)/.26));
    put(a,'#8e1b12',1,sx+260*p,sy,false,t,b,w,p>0&&p<1)});
  if(t<b.F){if(b.E.per>1)tag(b.E.per,60,58);if(b.P.per>1)tag(b.P.per,300,58)}
  cx.textAlign='center';cx.font='26px sans-serif';
  if(t>.36&&t<b.F)for(let k=0;k<3;k++)if(Math.sin(w*18+k*2)>-.3)cx.fillText('💥',180,90+k*30);
  if(b.R&&t>.66&&t<b.F&&Math.sin(w*18)>-.3)cx.fillText('💥',180,165);
  let label='';
  if(t>.45){if(b.pn>b.en)label=T.tooMany;else if(b.pn<b.en)label=T.tooFew}
  if(label){cx.fillStyle='#333';cx.font='bold 15px Tahoma,sans-serif';cx.fillText(label,180,192)}
  if(!b.hit&&t>.36){b.hit=1;beep(200,.15)}
  if(b.R&&!b.hit2&&t>.66){b.hit2=1;beep(160,.2)}
  if(t>=1){mode='none';end(b.pn,b.en)}
}
let last=performance.now();
function loop(now){cx.setTransform(S,0,0,S,0,0);const dt=Math.min((now-last)/1000,.05);last=now;
  if(mode=='peek'||mode=='cam')moveWalkers(dt);
  if(mode=='peek'){cx.clearRect(0,0,360,200);cave(1,now/1000)}
  else if(mode=='cam')drawCam(now);
  else if(mode=='idle')drawIdle(now);
  else if(mode=='battle')drawBattle(now);
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
function attack(){
  if(busy||sel.size==0||mode!='idle')return;busy=true;
  const en=L.a*L.b,pn=sel.size*L.a,rs=pn>en?pn+3-en:0;
  $('bar').textContent=fa(sel.size)+' × '+fa(L.a)+' = '+fa(pn);
  bt={t0:performance.now(),en,pn,win:pn==en,D:rs?5200:3600,F:rs?.72:.6,hit:0,
    E:mk(en,5),P:mk(pn,5),R:rs?mk(rs,10):null};
  mode='battle';beep(330,.1);
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
