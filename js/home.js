/* SwiftKick home.
   1. The menu.
   2. The flow field: canvas 2D, no libraries.

   The field is a stream function psi(x, y, t), so paths never cross. It is smooth everywhere
   (no term is switched on or off by a clamped ramp), and gentle noise is present in every region,
   so no path runs ruler-straight. The words are an obstacle applied last, so nothing enters them.

   Particles ride the flow and keep a short history. Each frame every history is redrawn as one fine
   line. One canvas spans the hero and the top of the cream sheet: every line is stroked twice with
   the sheet's own outline as the clip, once in the warm colours outside it and once in the sheet's
   colours inside it. So a line that crosses the sheet's edge is one line, seen against two grounds.

   The lines cross the sheet's edge untouched. Once across (on a phone: once clear of the words) each
   path is drawn gently toward one of three strands, as part of its own motion, so it stays one
   smooth travelling line; the strands end at the three items at the top of the graph. */
(function(){
  'use strict';
  document.documentElement.classList.add('js');




  /* ---------- 1. menu ---------- */
  const mb=document.querySelector('.menu-btn'),menu=document.getElementById('menu');
  if(mb&&menu){
    const set=open=>{menu.hidden=!open;mb.setAttribute('aria-expanded',String(open))};
    mb.addEventListener('click',()=>set(menu.hidden));
    menu.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){set(false);mb.focus()}});
    document.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest('.top'))set(false)});
    window.addEventListener('resize',()=>{if(window.innerWidth>=900)set(false)});
  }

  /* ---------- the product screen: three views ----------
     From 700 px up the tabs switch the view in place, and the views turn by themselves every seven seconds.
     Choosing a tab (click or keyboard) stops the turning for good on this page view. Nothing else stops it.
     It waits only while the whole screen is out of view, and it never runs for visitors who ask for reduced motion.
     Below 700 px, and without script, the views are stacked and the tabs are links that jump to them. */
  const tabs=[].slice.call(document.querySelectorAll('#tabs .tab')),tabMq=window.matchMedia('(min-width:700px)');
  if(tabs.length){
    const box=document.getElementById('tabs'),still=window.matchMedia('(prefers-reduced-motion: reduce)');
    const views=tabs.map(t=>document.getElementById(t.getAttribute('href').slice(1)));
    let auto=true,off=false;const seen=new Set();
    const current=()=>Math.max(0,tabs.findIndex(t=>t.classList.contains('on')));
    const show=i=>tabs.forEach((t,k)=>{t.classList.toggle('on',k===i);views[k].classList.toggle('on',k===i);if(tabMq.matches){t.setAttribute('aria-selected',String(k===i));t.tabIndex=k===i?0:-1}});
    const arm=()=>{box.classList.toggle('rot',auto&&tabMq.matches&&!still.matches);box.classList.toggle('paused',off)};
    const stop=()=>{auto=false;arm()};
    const mode=()=>{const on=tabMq.matches;
      if(on)box.setAttribute('role','tablist');else box.removeAttribute('role');
      tabs.forEach((t,k)=>{if(on){t.setAttribute('role','tab');t.setAttribute('aria-controls',views[k].id);views[k].setAttribute('role','tabpanel')}else{['role','aria-controls','aria-selected','tabindex'].forEach(a=>t.removeAttribute(a));views[k].removeAttribute('role')}});
      show(current());arm()};
    tabs.forEach((t,i)=>{
      t.addEventListener('click',e=>{if(tabMq.matches){e.preventDefault();stop();show(i)}});
      t.addEventListener('keydown',e=>{if(!tabMq.matches)return;const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();stop();const n=(i+d+tabs.length)%tabs.length;show(n);tabs[n].focus()}});
    });
    box.addEventListener('animationend',e=>{if(e.animationName==='tabrun'&&auto&&tabMq.matches)show((current()+1)%tabs.length)});
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)seen.add(e.target);else seen.delete(e.target)});off=seen.size===0;arm()});
      io.observe(box);[].forEach.call(document.querySelectorAll('.view .card'),c=>io.observe(c));off=true;
    }
    if(tabMq.addEventListener){tabMq.addEventListener('change',mode);still.addEventListener('change',arm)}
    mode();
  }

  /* ---------- controls inside the screens ----------
     Change, state and domain filters are toggles: pressing one narrows the view to that kind, pressing it again
     restores it. The map's Changes switch, its Map and Review tabs, and the graph's Ready switch work too. */
  [].forEach.call(document.querySelectorAll('.scr'),card=>{
    const kindOf=el=>{const m=el&&el.classList;return !m?'same':m.contains('add')?'add':m.contains('mod')?'mod':m.contains('rem')?'rem':'same'};
    const pressed=f=>[].slice.call(card.querySelectorAll('[data-filter="'+f+'"] .flt[aria-pressed="true"]')).map(b=>b.dataset.k);
    const apply=()=>{
      const kinds=pressed('kind'),all=!kinds.length;
      [].forEach.call(card.querySelectorAll('.item'),it=>{
        let any=all||kinds.indexOf(kindOf(it.querySelector('.item-h .mk')))>=0;
        [].forEach.call(it.querySelectorAll('.rules li'),li=>{const ok=all||kinds.indexOf(kindOf(li.querySelector('.mk')))>=0;li.hidden=!ok&&!all;if(ok)any=true});
        if(any&&!all&&![].some.call(it.querySelectorAll('.rules li'),li=>!li.hidden))[].forEach.call(it.querySelectorAll('.rules li'),li=>{li.hidden=false});
        it.hidden=!any;
      });
      [].forEach.call(card.querySelectorAll('.same span'),sp=>{sp.hidden=!all&&kinds.indexOf(kindOf(sp.querySelector('.mk')))<0});
      const st=pressed('state');
      [].forEach.call(card.querySelectorAll('.rv-disc li'),li=>{li.hidden=st.length>0&&st.indexOf(li.classList.contains('open')?'open':'res')<0});
      const cv=card.querySelector('.mp-canvas');
      if(cv){const d=pressed('dom');cv.className='mp-canvas'+(d.length?' fd '+d.map(k=>'fd-'+k).join(' '):'')+(card.querySelector('.tog.chg').getAttribute('aria-pressed')==='true'?'':' nochg')}
      const rd=card.querySelector('.tog.rdy');if(rd)[].forEach.call(card.querySelectorAll('.g,.scr-crop .view'),g=>g.classList.toggle('rdyon',rd.getAttribute('aria-pressed')==='true'));
    };
    card.addEventListener('click',e=>{
      if(e.target.closest&&e.target.closest('.selc')){card.classList.toggle('nopanel');return}     // the selected scene opens and closes its panel
      const b=e.target.closest('button');if(!b||!card.contains(b))return;
      if(b.classList.contains('mp-x')){card.classList.add('nopanel');return}
      if(b.classList.contains('mtab')){[].forEach.call(card.querySelectorAll('.mtab'),x=>x.setAttribute('aria-pressed',String(x===b)));card.classList.toggle('rev',b.dataset.v==='review')}
      else{b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));apply()}
    });
  });

  /* ---------- 2. the field ---------- */
  const TAU=Math.PI*2;
  const clamp01=x=>x<0?0:x>1?1:x;
  const smoother=(a,b,x)=>{x=clamp01((x-a)/(b-a));return x*x*x*(x*(x*6-15)+10)};   // zero slope and curvature at both ends
  const sig=x=>1/(1+Math.exp(-x));
  const softplus=(x,s)=>x>12*s?x:s*Math.log(1+Math.exp(x/s));
  const softclamp=(x,lo,hi,s)=>lo+softplus(x-lo,s)-softplus(x-hi,s);
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const K=46,STEP=5,NB=7,AL=[.82,.66,.5,.36,.24,.14,.07];
  const STRAND=['15,31,92','31,69,200','232,66,28'];

  function Field(cv,getGeo){
    const ctx=cv.getContext('2d');
    let W=0,H=0,DPR=1,G=null,parts=[],time=0,rnd=rng(7),raf=0,last=0,visible=false,sheetClip=null,skyClip=null;
    const ptr={x:-999,y:-999,tx:-999,ty:-999,on:0,want:0,psi:0,R:0};
    const waves=[],wr=rng(11);
    for(let j=0;j<6;j++){const lam=240+wr()*520,th=wr()*TAU;waves.push({kx:Math.cos(th)*TAU/lam,ky:Math.sin(th)*TAU/lam,ph:wr()*TAU,w:(wr()-.5)*0.16,a:(0.45+wr()*0.75)*lam/520})}
    let ec=[],quiet=false;

    function layout(){
      const g=getGeo();if(!g)return false;
      W=g.W;H=g.H;DPR=Math.min(2,window.devicePixelRatio||1);
      cv.style.height=H+'px';cv.width=Math.max(1,Math.round(W*DPR));cv.height=Math.max(1,Math.round(H*DPR));
      const t=g.text,hw=(t.r-t.l)/2,hh=(t.b-t.t)/2;
      g.ox=t.l+hw;g.oy=t.t+hh;g.oa=hw*1.123+(g.mode==='tall'?18:30);g.ob=hh*1.123+20;   // a rounded box that just holds the words
      g.vb=g.oy+g.ob;                                                                    // its lower edge
      const E=g.edge;
      if(g.mode==='wide'){
        g.pc=g.oy-0.42*g.ob;g.cTop=g.pc-0.16*E;
        const side=g.T&&W>=1400&&g.T[0]-60>t.r+30;
        if(side){g.xl=g.T[0]-60;g.xr=g.T[2]+60}else{g.xl=Math.max(0.60*W,Math.min(t.r+60,0.70*W));g.xr=Math.min(W-28,Math.max(g.xl+200,0.94*W))}
        // the lowest path that still clears the sheet under the words
        let cb=1e9;for(let x=0;x<=g.xl-80;x+=24){const ax=(x-g.ox)/g.oa,ay=(E-20-g.oy)/g.ob,r2=Math.cbrt(Math.pow(ax,6)+Math.pow(ay,6));const gg=r2<=1?0:Math.pow(1-1/(r2*r2),1.5);cb=Math.min(cb,g.pc+(E-20-g.pc)*gg)}
        g.cBot=cb-10;g.L=0.12*E;g.cA=g.cTop;g.cB=g.cBot;
        // place the bend so the current's two outer paths meet the sheet's edge where they should, measured on the field itself
        const wantL=g.xl,wantR=g.xr;G=g;quiet=true;const sv=ptr.R;ptr.R=0;
        const cross=c=>{let lo=-0.3*W,hi=1.5*W;for(let i=0;i<26;i++){const m=(lo+hi)/2;if(psi(m,E)>c)lo=m;else hi=m}return (lo+hi)/2};
        for(let it=0;it<6;it++){g.k=(g.cBot-g.cTop)/(g.xr-g.xl);g.x0=g.xr+g.cTop/g.k;g.xl+=wantL-cross(g.cBot);g.xr+=wantR-cross(g.cTop)}
        g.k=(g.cBot-g.cTop)/(g.xr-g.xl);g.x0=g.xr+g.cTop/g.k;g.fl=cross(g.cBot);g.fr=cross(g.cTop);quiet=false;ptr.R=sv;
        if(W>=1400){g.a0=E-10;g.a1=E+70;g.vf=1.2;g.sw=26;g.sway=4;const P=(g.fr-g.fl)/3;g.C=[0,1,2].map(b=>g.fl+P*(b+.5))}
        else{ // text above the screen: the strands keep to a channel at the right, clear of the text
          g.a0=E-170;g.a1=E-100;g.vf=2.0;g.sw=16;g.sway=4;const r=g.sheet.r-22,sp=Math.min(56,Math.max(20,18+(W-700)/20));g.C=[r-2*sp,r-sp,r]}
        g.ax0=t.r+0.22*(W-t.r);g.aw=0.07*W;
        g.ed=W-t.r>=260?[[.32,.31,64,.062,0],[.80,.55,-72,.066,2.1],[.26,.71,50,.054,4.2]].map(e=>({x:t.r+(W-t.r)*e[0],y:E*e[1],g:e[2],s:e[3]*W,p:e[4]}))
          :[[.28,.42,46,.085,0],[.66,.6,-52,.09,2.1]].map(e=>({x:W*e[0],y:g.vb+(E-g.vb)*e[1],g:e[2],s:e[3]*W,p:e[4]}));
      }else if(g.mode==='tall'){
        g.pc=-g.ox;g.cA=-W;g.cB=0;
        G=g;quiet=true;const sv=ptr.R;ptr.R=0;g.ed=[];
        const cross=c=>{let lo=-0.6*W,hi=1.6*W;for(let i=0;i<26;i++){const m=(lo+hi)/2;if(psi(m,E)>c)lo=m;else hi=m}return (lo+hi)/2};
        g.fl=cross(0);g.fr=cross(-W);quiet=false;ptr.R=sv;
        g.a0=g.vb+4;g.a1=g.vb+50;g.vf=2.7;g.sw=11;g.sway=4;{const r=g.sheet.r-16;g.C=[r-46,r-28,r-10]}
        g.ed=[[.29,.34,40,.11,0],[.72,.62,-46,.12,2.1]].map(e=>({x:W*e[0],y:g.vb+(E-g.vb)*e[1],g:e[2],s:e[3]*W,p:e[4]}));
      }else{
        g.pc=g.oy;g.cA=-1e9;g.cB=1e9;
        g.ed=[[.16,.24,46,.07,0],[.84,.72,-52,.075,2.1],[.62,.16,38,.06,4.2]].map(e=>({x:W*e[0],y:H*e[1],g:e[2],s:e[3]*W,p:e[4]}));
      }
      if(E!=null){
        g.shift=g.T?[0,1,2].map(b=>g.T[b]-g.C[b]):[0,0,0];
        if(g.T){g.s0=g.boxY-(g.mode==='tall'?136:176);g.s1=g.boxY-12}else{g.s0=1e9;g.s1=1e9+1}
        // the sheet's outline, in this canvas's own coordinates: the clip for the two colourings
        const s=g.sheet,r=Math.min(s.rad,(s.r-s.l)/2);
        sheetClip=new Path2D();sheetClip.moveTo(s.l,H+80);sheetClip.lineTo(s.l,E+r);sheetClip.arcTo(s.l,E,s.l+r,E,r);sheetClip.lineTo(s.r-r,E);sheetClip.arcTo(s.r,E,s.r,E+r,r);sheetClip.lineTo(s.r,H+80);sheetClip.closePath();
        skyClip=new Path2D();skyClip.rect(-10,-10,W+20,H+100);skyClip.addPath(sheetClip);
      }else{sheetClip=skyClip=null}
      const area=W*(E!=null?E:H);
      g.n=Math.round(W<700?Math.min(340,Math.max(220,area/1300)):Math.min(860,Math.max(300,area/1900)));
      G=g;rnd=rng(7);time=0;parts=[];for(let i=0;i<g.n;i++)parts.push(spawn({},true));
      return true;
    }

    function psiBase(x,y){
      const g=G;let p,amp;
      if(g.mode==='wide'){
        const A=y,B=(g.x0-x)*g.k,m=Math.min(A,B);
        p=m-g.L*Math.log(Math.exp(-(A-m)/g.L)+Math.exp(-(B-m)/g.L));
        amp=(9+21*sig((x-g.ax0)/g.aw))*(0.2+0.8*sig((g.edge-120-y)/42));          // calmer, never still, where the strands form
      }else if(g.mode==='tall'){p=-x;amp=(6+11*sig((y-g.vb-30)/36))*(0.3+0.7*sig((g.edge-70-y)/30))}
      else{p=y;amp=20}
      if(quiet)return p;
      let s=0;for(let i=0;i<waves.length;i++){const w=waves[i];s+=w.a*Math.sin(w.kx*x+w.ky*y+w.ph+w.w*time)}
      p+=amp*s;
      for(let i=0;i<ec.length;i++){const e=ec[i],dx=x-e.x,dy=y-e.y;p+=e.g*Math.exp(-(dx*dx+dy*dy)/(2*e.s*e.s))}
      return p;
    }
    function psi(x,y){
      const g=G;let p=psiBase(x,y);
      if(ptr.R>1){const dx=x-ptr.x,dy=y-ptr.y,r2=dx*dx+dy*dy,R2=ptr.R*ptr.R;if(r2<=R2)p=ptr.psi;else{const q=1-R2/r2;p=ptr.psi+(p-ptr.psi)*q*Math.sqrt(q)}}
      const ax=(x-g.ox)/g.oa,ay=(y-g.oy)/g.ob,a2=ax*ax,b2=ay*ay,r2=Math.cbrt(a2*a2*a2+b2*b2*b2);
      if(r2<=1)return g.pc;const q=1-1/(r2*r2);return g.pc+(p-g.pc)*q*Math.sqrt(q);   // falls to rest smoothly at the words' edge, and fades within a short distance
    }
    const FE=0.75;
    function vel(x,y,o){const vx=psi(x,y+FE)-psi(x,y-FE),vy=-(psi(x+FE,y)-psi(x-FE,y)),n=Math.hypot(vx,vy);o[0]=n?vx/n:0;o[1]=n?vy/n:0;o[2]=n/(2*FE)}

    // Gathering. A path is given its strand as it reaches the gathering line, by where it is across the current,
    // and from then on is drawn toward that strand as part of its own motion (bounded, eased in over a distance).
    function gather(p,sp){
      const g=G;if(g.edge==null||p.y<g.a0)return;
      if(p.b<0){const u=clamp01((p.x-g.fl)/(g.fr-g.fl))*2.9999;p.b=Math.floor(u);p.off=(u-p.b-.5)*g.sw;p.ya=p.y}
      const tgt=g.C[p.b]+p.off+g.sway*Math.sin(p.y/70+p.b*1.7+time*0.25);
      p.x+=smoother(g.a0,g.a1,p.y)*g.vf*sp*Math.tanh((tgt-p.x)/50);
    }
    // near the graph each strand is carried across to its item: a shift that eases in along the strand
    // (the carry starts where this path joined its strand, p.ya, never above it: a point already drawn does not move when the path is given its strand)
    const drawX=(p,x,y)=>p.b<0?x:x+smoother(Math.min(Math.max(G.s0,p.ya),G.s1-60),G.s1,y)*G.shift[p.b];

    const v=[0,0,0],v2=[0,0,0];
    function spawn(p,first){
      const g=G;
      if(!p.hx){p.hx=new Float32Array(K);p.hy=new Float32Array(K)}
      p.len=0;p.dead=false;p.drain=0;p.age=0;p.chk=0;p.b=-1;p.off=0;p.ya=-1e9;p.bright=rnd()<0.12;
      const veil=first||rnd()<(g.mode==='tall'?0.85:0.6);p.life=veil?6+rnd()*10:1e9;
      let ok=false;
      if(first&&g.edge!=null&&g.endY-g.a1>40&&rnd()<Math.min(.45,(g.endY-g.a1)/(g.endY+200)*1.2)){
        p.b=Math.floor(rnd()*3);p.off=(rnd()-.5)*g.sw;p.y=g.a1+rnd()*(g.endY-g.a1-6);p.x=g.C[p.b]+p.off+g.sway*Math.sin(p.y/70+p.b*1.7);p.life=1e9;ok=true;
      }
      if(veil&&!ok){
        const yMax=g.edge!=null?g.edge:H;
        for(let k=0;k<6&&!ok;k++){
          p.x=-20+rnd()*(W+40);p.y=-20+rnd()*(yMax+10);
          const c=psi(p.x,p.y);if(c<g.cA||c>g.cB)continue;
          vel(p.x,p.y,v);ok=v[2]>=0.15;
        }
      }
      if(!ok){ // enter at the inflow edge, spaced evenly by level, so the current keeps its shape
        if(g.mode==='tall'){const c=g.cA+rnd()*(g.cB-g.cA);let lo=-0.4*W,hi=1.4*W;for(let i=0;i<20;i++){const m=(lo+hi)/2;if(psi(m,-24)>c)lo=m;else hi=m}p.x=(lo+hi)/2;p.y=-24}
        else if(g.mode==='wide'){const c=g.cA+rnd()*(g.cB-g.cA);let lo=-0.6*g.edge,hi=1.4*g.edge;for(let i=0;i<20;i++){const m=(lo+hi)/2;if(psi(-24,m)<c)lo=m;else hi=m}p.x=-24;p.y=(lo+hi)/2}
        else{p.x=-24;p.y=-0.05*H+rnd()*1.1*H}
      }
      p.lx=p.x;p.ly=p.y;p.cx=p.x;p.cy=p.y;return p;
    }
    function step(dt){
      const g=G;time+=dt;
      ec=g.ed.map(e=>({x:e.x+Math.sin(time*0.11+e.p)*0.022*W,y:e.y+Math.cos(time*0.085+e.p*1.3)*0.03*(g.edge||H),g:e.g,s:e.s}));
      ptr.on+=(ptr.want-ptr.on)*Math.min(1,dt*3.2);ptr.x+=(ptr.tx-ptr.x)*Math.min(1,dt*7);ptr.y+=(ptr.ty-ptr.y)*Math.min(1,dt*7);
      ptr.R=ptr.on*Math.min(86,0.062*W);ptr.psi=ptr.R>1?psiBase(ptr.x,ptr.y):0;
      const U=58*dt,yEnd=g.endY!=null?g.endY:H+20;
      for(let i=0;i<parts.length;i++){
        const p=parts[i];
        if(p.dead){p.drain+=dt;while(p.drain>0.022&&p.len>0){p.drain-=0.022;p.len--}if(p.len<=0)spawn(p,false);continue}
        vel(p.x,p.y,v);
        if(v[2]<0.1){p.dead=true;continue}                    // nothing creeps along the words' edge
        const sp=U*Math.min(1.6,Math.max(.5,Math.pow(v[2],.6)));
        vel(p.x+v[0]*sp*.5,p.y+v[1]*sp*.5,v2);
        p.x+=v2[0]*sp;p.y+=v2[1]*sp;gather(p,sp);p.age+=dt;p.chk+=dt;
        if(Math.hypot(p.x-p.lx,p.y-p.ly)>=STEP){p.hx.copyWithin(1,0,K-1);p.hy.copyWithin(1,0,K-1);p.hx[0]=p.x;p.hy[0]=p.y;p.lx=p.x;p.ly=p.y;if(p.len<K)p.len++}
        if(p.chk>1.1){if(Math.hypot(p.x-p.cx,p.y-p.cy)<12)p.dead=true;p.chk=0;p.cx=p.x;p.cy=p.y}   // a path that has stopped travelling is let go
        if(p.age>p.life&&p.b<0)p.dead=true;                                       // (not while it is part of a strand)
        if(p.y>=yEnd||p.x>1.6*W+80||p.x<-0.6*W-80||p.y<-140)p.dead=true;
      }
    }

    const wx=new Float32Array(K+1),wy=new Float32Array(K+1);
    function draw(){
      const g=G,E=g.edge;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';
      const pn=[],pb=[],ps=[[],[],[]],dots=new Path2D(),sdots=[new Path2D(),new Path2D(),new Path2D()];
      for(let i=0;i<NB;i++){pn.push(new Path2D());pb.push(new Path2D());for(let b=0;b<3;b++)ps[b].push(new Path2D())}
      for(let i=0;i<parts.length;i++){
        const p=parts[i];let m=0,low=-1e9;
        if(!p.dead){wy[0]=p.y;wx[0]=drawX(p,p.x,p.y);m=1;low=p.y}
        for(let j=0;j<p.len;j++){const y=p.hy[j];wy[m]=y;wx[m]=drawX(p,p.hx[j],y);if(y>low)low=y;m++}
        if(m<2)continue;
        const set=p.bright?pb:pn,onSheet=E!=null&&low>E-12,sb=onSheet?ps[p.b<0?0:p.b]:null;
        let cur=-1;
        for(let j=1;j<m;j++){
          let b=Math.min(NB-1,Math.floor((j-1)/K*NB)+(g.fadeTop&&wy[j]<g.fadeTop?4:0));
          if(b!==cur){set[b].moveTo(wx[j-1],wy[j-1]);if(sb)sb[b].moveTo(wx[j-1],wy[j-1]);cur=b}
          set[b].lineTo(wx[j],wy[j]);if(sb)sb[b].lineTo(wx[j],wy[j]);
        }
        if(p.bright&&!p.dead){dots.moveTo(wx[0]+1.5,wy[0]);dots.arc(wx[0],wy[0],1.5,0,TAU);if(sb){const d=sdots[p.b<0?0:p.b];d.moveTo(wx[0]+1.6,wy[0]);d.arc(wx[0],wy[0],1.6,0,TAU)}}
      }
      // outside the sheet: the warm colours
      ctx.save();if(skyClip)ctx.clip(skyClip,'evenodd');
      for(let i=0;i<NB;i++){
        ctx.lineWidth=.85;ctx.strokeStyle='rgba(255,243,220,'+AL[i]*.5+')';ctx.stroke(pn[i]);
        ctx.lineWidth=1.4;ctx.strokeStyle='rgba(255,252,244,'+AL[i]*.82+')';ctx.stroke(pb[i]);
      }
      ctx.fillStyle='rgba(255,255,255,.95)';ctx.fill(dots);ctx.restore();
      // inside the sheet: the same lines, in the sheet's colours
      if(sheetClip){
        ctx.save();ctx.clip(sheetClip);ctx.lineWidth=1;
        for(let b=0;b<3;b++){for(let i=0;i<NB;i++){ctx.strokeStyle='rgba('+STRAND[b]+','+Math.min(.9,AL[i]*.95+.08)+')';ctx.stroke(ps[b][i])}ctx.fillStyle='rgb('+STRAND[b]+')';ctx.fill(sdots[b])}
        ctx.restore();
      }
    }

    function frame(t){
      raf=0;if(!running())return;
      const dt=Math.min(.05,(t-last)/1000||1/60);last=t;step(dt);draw();raf=requestAnimationFrame(frame);
    }
    const running=()=>visible&&!document.hidden&&!reduce.matches&&!!G;
    function kick(){if(!raf&&running()){last=performance.now();raf=requestAnimationFrame(frame)}}
    function start(){
      cancelAnimationFrame(raf);raf=0;if(!layout())return;
      const n=reduce.matches?110:36;for(let i=0;i<n;i++)step(1/12);       // begin mid-flow, not from an empty frame
      draw();kick();
    }
    window.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch'||!G)return;const r=cv.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
      if(y<-40||y>H+40){ptr.want=0;return}
      if(ptr.on<.02){ptr.x=x;ptr.y=y}ptr.tx=x;ptr.ty=y;ptr.want=1;
    },{passive:true});
    document.documentElement.addEventListener('pointerleave',()=>{ptr.want=0});
    window.addEventListener('blur',()=>{ptr.want=0});
    document.addEventListener('visibilitychange',kick);
    if(reduce.addEventListener)reduce.addEventListener('change',start);
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;kick()},{rootMargin:'80px'}).observe(cv);else visible=true;
    const stale=()=>{const g=getGeo();return !G||!g||Math.abs(g.W-W)>0.5||Math.abs((g.edge||0)-(G.edge||0))>1||Math.abs((g.endY||0)-(G.endY||0))>1||Math.abs(g.H-H)>2||Math.abs(g.text.b-G.text.b)>1||(g.T&&G.T&&Math.abs(g.T[0]-G.T[0])>1)};
    return {start,stale};
  }

  const main=document.getElementById('main');
  const fields=[];
  const heroCv=document.getElementById('field');
  if(heroCv&&main){
    fields.push(Field(heroCv,function(){
      const m=main.getBoundingClientRect(),sheet=document.querySelector('.sheet'),tx=document.getElementById('heroText');
      if(!sheet||!tx)return null;
      const s=sheet.getBoundingClientRect(),t=tx.getBoundingClientRect(),W=main.clientWidth;
      const roots=[].slice.call(document.querySelectorAll('#tabs .tab')).filter(n=>n.offsetParent!==null).map(n=>n.getBoundingClientRect());
      const g={W,mode:W<700?'tall':'wide',edge:s.top-m.top,fadeTop:108,
        text:{l:t.left-m.left,r:t.right-m.left,t:t.top-m.top,b:t.bottom-m.top},
        sheet:{l:s.left-m.left,r:s.right-m.left,rad:parseFloat(getComputedStyle(sheet).borderTopLeftRadius)||0}};
      if(roots.length===3){g.T=roots.map(r=>r.left+r.width/2-m.left);g.boxY=roots[0].top-m.top;g.endY=g.boxY+18;g.H=Math.round(g.boxY)+2}   // the canvas ends 2 px inside the tabs' top border, so every strand is cut by the box itself
      else{g.endY=g.edge+140;g.H=Math.ceil(g.endY)}
      return g;
    }));
  }
  const closeCv=document.getElementById('field2'),closeSec=document.getElementById('close');
  if(closeCv&&closeSec){
    fields.push(Field(closeCv,function(){
      const m=closeSec.getBoundingClientRect(),tx=document.getElementById('closeText');if(!tx)return null;
      const t=tx.getBoundingClientRect();
      return {W:closeSec.clientWidth,H:closeSec.clientHeight,mode:'close',edge:null,text:{l:t.left-m.left,r:t.right-m.left,t:t.top-m.top,b:t.bottom-m.top}};
    }));
  }
  let rz=0;
  const refresh=()=>{clearTimeout(rz);rz=setTimeout(()=>fields.forEach(f=>{if(f.stale())f.start()}),140)};
  window.addEventListener('resize',refresh);
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{
    fields.forEach(f=>f.start());
    if('ResizeObserver' in window&&main)new ResizeObserver(refresh).observe(main);
    document.documentElement.dataset.field='ready';
  });
})();
