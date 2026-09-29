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
    b.innerHTML='<span class="hole">🚪</span>';
    b.onclick=()=>{if(busy)return;sel.has(k)?sel.delete(k):sel.add(k);b.classList.toggle('on');beep(sel.has(k)?NOTES[sel.size%7]:380,.1);bar()};
    n.appendChild(b)}
  bar();show('game');peek();
}
function bar(){$('bar').textContent=fa(sel.size)+' '+T.picked}
// ---- دیدن داخل لونه ----
function peek(){
  mode='peek';
  walkers=Array.from({length:L.a},()=>({x:60+Math.random()*240,y:50+Math.random()*90,vx:(Math.random()<.5?-1:1)*(25+Math.random()*25),vy:(Math.random()-.5)*40}));
  $('peekt').innerHTML=T.peekT+'<br><small>'+T.peekS+'</small>';
  $('peekui').classList.remove('hide');$('playui').classList.add('hide');
}
$('go').onclick=()=>{mode='idle';$('peekui').classList.add('hide');$('playui').classList.remove('hide')};
$('eye').onclick=()=>{if(!busy&&mode=='idle')peek()};
// ---- رسم ----
const cv=$('cv'),cx=cv.getContext('2d');
function ant(x,y,c,d,w){cx.save();cx.translate(x,y);cx.scale(d,1);cx.fillStyle=c;cx.strokeStyle=c;cx.lineWidth=2;
  for(let i=-1;i<=1;i++){cx.beginPath();cx.moveTo(0,0);cx.lineTo(i*6+Math.sin(w+i*2)*4,9);cx.stroke()}
  cx.beginPath();cx.ellipse(-7,0,7,5,0,0,7);cx.fill();
  cx.beginPath();cx.ellipse(2,0,4,4,0,0,7);cx.fill();
  cx.beginPath();cx.arc(9,-1,5,0,7);cx.fill();
  cx.fillStyle='#fff';cx.beginPath();cx.arc(11,-2,2,0,7);cx.fill();
  cx.fillStyle='#000';cx.beginPath();cx.arc(11.5,-2,1,0,7);cx.fill();cx.restore()}
function army(n,x,y,dir,c,w){
  const per=Math.ceil(n/20),m=Math.ceil(n/per);
  for(let i=0;i<m;i++)ant(x-dir*(i%5)*22,y+((i/5)|0)*24+Math.sin(w*.8+i)*2,c,dir,w+i);
  if(per>1){cx.fillStyle='#333';cx.font='bold 14px Tahoma,sans-serif';cx.textAlign='center';cx.fillText('×'+fa(per),x-dir*44,y-14)}}
function draw(t,en,pn,win,label,w){
  cx.clearRect(0,0,360,200);
  cx.fillStyle='#b7e08a';cx.fillRect(0,150,360,50);
  let a=0,ox=0,oy=0;
  if(win!=-1){a=Math.min(t/.4,1);if(t>.6){const f=t-.6;ox=f*900;oy=-f*300}}
  army(en,110+a*60+(win=='p'?-ox:0),40+(win=='p'?oy:0),1,'#c0392b',w);
  if(pn)army(pn,250-a*60+(win=='e'?ox:0),40+(win=='e'?oy:0),-1,'#2b7bd0',w);
  cx.textAlign='center';
  if(t>.35&&t<.65){cx.font='28px sans-serif';cx.fillText('💥',180+Math.sin(t*40)*4,95)}
  if(label){cx.fillStyle='#333';cx.font='bold 15px Tahoma,sans-serif';cx.fillText(label,180,190)}
}
function drawPeek(s,dt){
  cx.clearRect(0,0,360,200);
  cx.fillStyle='#7a4a22';cx.fillRect(0,0,360,200);
  cx.fillStyle='#b98352';cx.beginPath();cx.ellipse(180,100,170,88,0,0,7);cx.fill();
  walkers.forEach((w,i)=>{
    w.x+=w.vx*dt;w.y+=w.vy*dt;
    if(w.x<45||w.x>315)w.vx=-w.vx;
    if(w.y<45||w.y>150)w.vy=-w.vy;
    w.x=Math.max(45,Math.min(315,w.x));w.y=Math.max(45,Math.min(150,w.y));
    for(let j=0;j<i;j++){const o=walkers[j],dx=w.x-o.x,dy=w.y-o.y;if(dx*dx+dy*dy<900){w.x+=dx>0?1:-1;w.y+=dy>0?1:-1}}
  });
  walkers.forEach((w,i)=>ant(w.x,w.y,'#2b7bd0',w.vx>=0?1:-1,s*12+i*2));
}
function drawBattle(now){
  const b=bt,t=Math.min((now-b.t0)/3200,1);let en=b.en,label='';
  if(t>.45){if(b.pn>b.en){en=b.pn+3;label=T.tooMany}else if(b.pn<b.en)label=T.tooFew}
  if(!b.hit&&t>.4){b.hit=1;beep(200,.15)}
  draw(t,en,b.pn,b.winner,label,now/1000*12);
  if(t>=1){mode='none';end(b.pn,b.en)}
}
let last=performance.now();
function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;
  if(mode=='peek')drawPeek(now/1000,dt);
  else if(mode=='idle')draw(0,L.a*L.b,0,-1,'',now/1000*12);
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
