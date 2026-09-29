const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const $=id=>document.getElementById(id);
let save={stars:[]},cur=0,sel=new Set(),tries=0,busy=false,ac=null,muted=false,L;
try{save=JSON.parse(localStorage.getItem('ants01'))||save}catch(e){}
function persist(){try{localStorage.setItem('ants01',JSON.stringify(save))}catch(e){}}
function beep(f,d){if(muted)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.07;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function show(id){['menu','game'].forEach(s=>$(s).classList.toggle('hide',s!==id))}
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
  $('atk').textContent=T.attack;$('hint').textContent=T.pick;
  const n=$('nests');n.innerHTML='';
  const total=L.b+EXTRA_NESTS;
  for(let k=0;k<total;k++){const b=document.createElement('button');b.className='nest';
    b.innerHTML='<span class="hole">🕳️</span><span>'+'🐜'.repeat(L.a)+'</span>';
    b.onclick=()=>{if(busy)return;sel.has(k)?sel.delete(k):sel.add(k);b.classList.toggle('on');beep(sel.has(k)?520:380,.08);bar()};
    n.appendChild(b)}
  bar();draw(0,L.a*L.b,0,-1);show('game');
}
function bar(){const k=sel.size;$('bar').textContent=fa(k)+' × '+fa(L.a)+' = '+fa(k*L.a)}
// ---- canvas ----
const cv=$('cv'),cx=cv.getContext('2d');
function ant(x,y,c,d){cx.save();cx.translate(x,y);cx.scale(d,1);cx.fillStyle=c;cx.strokeStyle=c;cx.lineWidth=2;
  for(let i=-1;i<=1;i++){cx.beginPath();cx.moveTo(0,0);cx.lineTo(i*6,9);cx.stroke()}
  cx.beginPath();cx.ellipse(-7,0,7,5,0,0,7);cx.fill();
  cx.beginPath();cx.ellipse(2,0,4,4,0,0,7);cx.fill();
  cx.beginPath();cx.arc(9,-1,5,0,7);cx.fill();
  cx.fillStyle='#fff';cx.beginPath();cx.arc(11,-2,2,0,7);cx.fill();
  cx.fillStyle='#000';cx.beginPath();cx.arc(11.5,-2,1,0,7);cx.fill();cx.restore()}
function army(n,x,y,dir,c,t){
  const per=Math.ceil(n/20),m=Math.ceil(n/per);
  for(let i=0;i<m;i++){ant(x-dir*(i%5)*22,y+((i/5)|0)*24+Math.sin(t*25+i)*2,c,dir)}
  if(per>1){cx.fillStyle='#333';cx.font='bold 14px sans-serif';cx.fillText('×'+fa(per)+' هر مورچه',x-dir*40,y-14)}}
function star(x,y,t){cx.font='26px sans-serif';cx.fillText('💥',x+Math.sin(t*40)*4,y)}
// t: 0..1 ، ln: پیروز 'p' / 'e' / -1
function draw(t,en,pn,winner,label){
  cx.clearRect(0,0,cv.width,cv.height);
  cx.fillStyle='#b7e08a';cx.fillRect(0,150,cv.width,50);
  let ex=40,px=cv.width-60,ey=40,py=40,ox=0,oy=0;
  if(winner!=-1){
    const a=Math.min(t/.4,1);ex=40+a*120;px=cv.width-60-a*120;
    if(t>.6){const f=t-.6;ox=f*900;oy=-f*300}
  }
  const eOff=winner=='p'?-ox:0,eOffY=winner=='p'?oy:0,pOff=winner=='e'?ox:0,pOffY=winner=='e'?oy:0;
  army(en,ex+eOff,ey+eOffY,1,'#c0392b',t);
  if(winner!=-1||pn)army(pn,px+pOff,py+pOffY,-1,'#2b7bd0',t);
  if(t>.35&&t<.65)star(cv.width/2-12,90,t);
  if(label){cx.fillStyle='#333';cx.font='bold 16px sans-serif';cx.fillText(label,10,190)}
}
function attack(){
  if(busy||sel.size==0)return;busy=true;
  const en=L.a*L.b,pn=sel.size*L.a;
  const winner=pn==en?'p':'e';
  let enShow=en,label='';const t0=performance.now(),D=3200;
  (function f(now){
    const t=Math.min((now-t0)/D,1);
    if(pn>en&&t>.45){enShow=pn+3;label=T.tooMany}
    draw(t,enShow,pn,winner,label);
    if(t>.4&&t<.45)beep(200,.15);
    if(t<1)requestAnimationFrame(f);else end(pn,en)})(t0);
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
  const B=id=>$(id)&&($(id).onclick=null);
  if($('n'))$('n').onclick=()=>start(cur+1);
  if($('m'))$('m').onclick=menu;
  if($('r'))$('r').onclick=()=>{sel.clear();busy=false;o.classList.add('hide');document.querySelectorAll('.nest').forEach(x=>x.classList.remove('on'));bar();draw(0,en,0,-1)};
}
$('atk').onclick=attack;$('back').onclick=menu;
$('snd').onclick=()=>{muted=!muted;$('snd').textContent=muted?'🔇':'🔊'};
menu();
