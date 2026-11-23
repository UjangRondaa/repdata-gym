/* ============ ANIMASI GERAKAN ============
   Figur SVG bersendi yang digerakkan mengikuti tempo tiap gerakan.
   Setiap gerakan = beberapa pose kunci (k) + urutan fase (dari tempo v.te atau seq khusus).

   Konvensi sudut (derajat): 0 = atas, 90 = depan (kanan), 180 = bawah, -90 = belakang.
   Pose:
     h:[x,y]   posisi pinggul            t: sudut torso (0 = tegak)
     hn/hn2    target tangan (IK)        a/a2: sudut lengan [atas, bawah] absolut
     ar/ar2    sudut lengan relatif torso
     fk/fk2    target pergelangan kaki   l/l2: sudut kaki [paha, betis] absolut
     ft/ft2    arah telapak kaki         ed/kd: arah tekuk siku/lutut (+1/-1)
     se        elevasi bahu (shrug)      as/ls: skala panjang lengan/kaki (perspektif)
   Tampak depan (fr:1): sisi kiri dicerminkan otomatis dari sisi kanan.
   Pose A = posisi sebelum fase eksentrik, B = akhir fase eksentrik. */
(function(){
const L={tor:32,nk:6,hd:6.5,ua:17,fa:15,th:25,sh:24,ft:8};
const VB='20 -16 160 140', GY=120;
const R=Math.PI/180;
const dir=a=>[Math.sin(a*R),-Math.cos(a*R)];
const add=(p,a,d)=>{const v=dir(a);return [p[0]+v[0]*d,p[1]+v[1]*d];};
const angOf=(P,T)=>Math.atan2(T[0]-P[0],-(T[1]-P[1]))/R;
const f1=n=>Math.round(n*10)/10;
function ik(P,T,a,b,s){
  let d=Math.hypot(T[0]-P[0],T[1]-P[1]);
  d=Math.max(Math.abs(a-b)+.01,Math.min(a+b-.01,d));
  const off=Math.acos(Math.max(-1,Math.min(1,(a*a+d*d-b*b)/(2*a*d))))/R;
  const J=add(P,angOf(P,T)+s*off,a);
  return [J,add(J,angOf(J,T),b)];
}
function fk(P,ang,a,b){const J=add(P,ang[0],a);return [J,add(J,ang[1],b)];}

/* ---- pemecah pose ---- */
function solve(p,front){
  const t=p.t||0, se=p.se||0, tl=p.tl??1, as=p.as??1, ls=p.ls??1;
  const hip=p.h, sh=add(hip,t,L.tor*tl+se);
  const head=add(sh,t+(p.hd||0),(p.hl??(L.nk+L.hd))-se);
  const S={p,t,hip,sh,head,front};
  let shN=sh,shF=sh,hpN=hip,hpF=hip;
  if(front){const sw=p.sw??10; shN=add(sh,t+90,sw); shF=add(sh,t-90,sw); hpN=add(hip,t+90,6.5); hpF=add(hip,t-90,6.5);}
  const ua=L.ua*as, fa=L.fa*as, th=L.th*ls, sn=L.sh*ls;
  const ed=p.ed??1, kd=p.kd??-1;
  const arm=(root,tg,ang,rel,s)=>tg?ik(root,tg,ua,fa,s):fk(root,rel?[rel[0]+t,rel[1]+t]:ang,ua,fa);
  const leg=(root,tg,ang,s)=>tg?ik(root,tg,th,sn,s):fk(root,ang,th,sn);
  const mx=(q,c)=>q&&[2*c-q[0],q[1]];
  const neg=a=>a&&[-a[0],-a[1]];
  [S.elN,S.haN]=arm(shN,p.hn,p.a,p.ar,ed);
  [S.knN,S.anN]=leg(hpN,p.fk,p.l,kd);
  if(front){
    const c=hip[0];
    [S.elF,S.haF]=p.hn2||p.a2?arm(shF,p.hn2,p.a2,null,-(p.ed2??ed)):arm(shF,mx(p.hn,c),neg(p.a),p.ar&&neg(p.ar),-ed);
    [S.knF,S.anF]=p.fk2||p.l2?leg(hpF,p.fk2,p.l2,-(p.kd2??kd)):leg(hpF,mx(p.fk,c),neg(p.l),-kd);
    S.toN=add(S.anN,p.ft??150,5); S.toF=add(S.anF,p.ft2??-(p.ft??150),5);
  }else{
    const sh2=q=>q&&[q[0]+2.5,q[1]];
    [S.elF,S.haF]=p.hn2||p.a2||p.ar2?arm(shF,p.hn2,p.a2,p.ar2,p.ed2??ed):arm(shF,sh2(p.hn),p.a,p.ar,ed);
    [S.knF,S.anF]=p.fk2||p.l2?leg(hpF,p.fk2,p.l2,p.kd2??kd):leg(hpF,sh2(p.fk),p.l,kd);
    S.toN=add(S.anN,p.ft??92,L.ft*ls); S.toF=add(S.anF,p.ft2??p.ft??92,L.ft*ls);
  }
  S.shN=shN;S.shF=shF;S.hpN=hpN;S.hpF=hpF;
  S.faN=angOf(S.elN,S.haN); S.faF=angOf(S.elF,S.haF); S.snN=angOf(S.knN,S.anN);
  return S;
}

/* ---- interpolasi pose ---- */
function lerpP(A,B,u){
  if(u<=0) return A; if(u>=1) return B;
  const o={};
  for(const k of new Set([...Object.keys(A),...Object.keys(B)])){
    const a=A[k],b=B[k];
    if(a===undefined){o[k]=b;continue} if(b===undefined){o[k]=a;continue}
    o[k]=Array.isArray(a)?a.map((x,i)=>x+(b[i]-x)*u):(typeof a==='number'?a+(b-a)*u:a);
  }
  return o;
}
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;

/* ---- gambar figur ---- */
const SEGM={ua:['bahu','bisep','trisep'],fa:['lengan'],up:['dada','lats','upback','trap'],lo:['perut','oblik','lowback'],th:['quads','hams','glutes','adduktor'],sn:['betis']};
function hlOf(m){const o={};for(const s in SEGM){o[s]=Math.max(0,...SEGM[s].map(k=>m[k]||0));}return o;}
const P=q=>`${f1(q[0])} ${f1(q[1])}`;
const ln=(a,b,w,c)=>`<path class="${c}" d="M${P(a)}L${P(b)}" stroke-width="${w}"/>`;
function cls(lv,far){return (far?'bf':'bn')+(lv>=3?(far?' k3f':' k3'):lv===2&&!far?' k2':'');}
function drawFig(S,hl,uni){
  const arm=(sh,el,ha,far)=>{const n=!far||uni!=='arm';return ln(sh,el,6,cls(n?hl.ua:0,far))+ln(el,ha,5,cls(n?hl.fa:0,far))+`<circle class="${far?'jf':'jn'}" cx="${f1(ha[0])}" cy="${f1(ha[1])}" r="2.6"/>`;};
  const leg=(hp,kn,an,to,far)=>{const n=!far||uni!=='leg';return ln(hp,kn,8.5,cls(n?hl.th:0,far))+ln(kn,an,6.5,cls(n?hl.sn:0,far))+ln(an,to,4,far?'bf':'bn');};
  const mid=[(S.hip[0]+S.sh[0])/2,(S.hip[1]+S.sh[1])/2];
  let s='';
  if(S.front){
    s+=leg(S.hpF,S.knF,S.anF,S.toF,0)+leg(S.hpN,S.knN,S.anN,S.toN,0);
    const tc=hl.up>=3?' k3':hl.up===2?' k2':'';
    s+=`<path class="tor${tc}" d="M${P(S.shF)}L${P(S.shN)}L${P(S.hpN)}L${P(S.hpF)}Z"/>`;
    if(hl.lo){const lc=hl.lo>=3?' k3':hl.lo===2?' k2':'';const m1=[(S.shF[0]*.45+S.hpF[0]*.55),(S.shF[1]*.45+S.hpF[1]*.55)],m2=[(S.shN[0]*.45+S.hpN[0]*.55),(S.shN[1]*.45+S.hpN[1]*.55)];s+=`<path class="tor${lc}" d="M${P(m1)}L${P(m2)}L${P(S.hpN)}L${P(S.hpF)}Z"/>`;}
    s+=ln(S.sh,add(S.sh,S.t,3),5,'bn');
    s+=`<circle class="hd" cx="${f1(S.head[0])}" cy="${f1(S.head[1])}" r="${L.hd}"/>`;
    s+=arm(S.shF,S.elF,S.haF,0)+arm(S.shN,S.elN,S.haN,0);
    return s;
  }
  s+=arm(S.sh,S.elF,S.haF,1)+leg(S.hip,S.knF,S.anF,S.toF,1);
  s+=ln(S.hip,mid,11,cls(hl.lo,0))+ln(mid,S.sh,11.5,cls(hl.up,0));
  s+=ln(S.sh,add(S.sh,S.t+(S.p.hd||0),5),5,'bn');
  s+=`<circle class="hd" cx="${f1(S.head[0])}" cy="${f1(S.head[1])}" r="${L.hd}"/>`;
  s+=leg(S.hip,S.knN,S.anN,S.toN,0)+arm(S.sh,S.elN,S.haN,0);
  return s;
}

/* ---- alat & properti ---- */
const eq=(d,w=3,c='eq')=>`<path class="${c}" d="${d}" stroke-width="${w}"/>`;
const C=(x,y,r,c)=>`<circle class="${c}" cx="${f1(x)}" cy="${f1(y)}" r="${r}"/>`;
const bench=(x1,x2,top)=>`<rect class="pad" x="${x1}" y="${top}" width="${x2-x1}" height="5" rx="2.5"/>`+eq(`M${x1+7} ${top+5}V${GY}M${x2-7} ${top+5}V${GY}`,2.5);
const stack=(x,py,lo)=>eq(`M${x} -14V${GY}M${x-9} ${GY}h18`,3)+`<rect class="wt" x="${x-6}" y="${lo||86}" width="12" height="${GY-4-(lo||86)}" rx="1.5"/>`+C(x,py,3.2,'pul');
const rails=x=>eq(`M${x} -14V${GY}`,1.6,'eq2');
const plate=q=>C(q[0],q[1],12.5,'plate')+C(q[0],q[1],3,'hub');
const hub=q=>C(q[0],q[1],2.6,'hub');
const dbl=q=>`<rect class="dbb" x="${f1(q[0]-5)}" y="${f1(q[1]-4.5)}" width="10" height="9" rx="2.5"/>`;
const kb=(q,a)=>{const c=add(q,a,6.5);return `<path class="kbh" d="M${P(add(c,a+150,6))}Q${P(q)} ${P(add(c,a-150,6))}"/>`+C(c[0],c[1],5.6,'kbb');};
const cab=(a,b)=>`<path class="cab" d="M${P(a)}L${P(b)}"/>`;
const handle=q=>C(q[0],q[1],2.2,'hub');
const midH=S=>[(S.haN[0]+S.haF[0])/2,(S.haN[1]+S.haF[1])/2];
const onBack=S=>add(add(S.sh,S.t-90,6.5),S.t,-1.5);
const onFront=S=>add(S.sh,S.t+90,5);
const pbar=(x,y)=>eq(`M${x-26} ${y}H${x+26}`,2,'eq2')+C(x,y,2.4,'hub');

/* ---- pose dasar ---- */
const ST={h:[98,69],t:2,fk:[100,117]};
const st=o=>Object.assign({},ST,o);
const HANG={a:[180,180]};

/* ---- definisi per gerakan ---- */
const A={};
/* BARBELL */
A['bb-back-squat']={k:[st({ar:[210,20]}),{h:[86,96],t:42,fk:[100,117],ar:[210,20]}],b:S=>plate(onBack(S))};
A['bb-front-squat']={k:[st({t:3,ar:[85,-95]}),{h:[88,97],t:22,fk:[100,117],ar:[85,-95]}],b:S=>plate(onFront(S))};
A['bb-deadlift']={k:[st({h:[96,69],t:0,hn:[100,70]}),{h:[80,90],t:62,fk:[100,117],hn:[104,107]}],b:S=>plate(S.haN)};
A['bb-rdl']={k:[st({h:[96,69],t:0,hn:[100,70]}),{h:[82,73],t:72,fk:[100,117],hn:[110,94]}],b:S=>plate(S.haN)};
A['bb-bench']={sc:bench(58,128,94),k:[{h:[112,88],t:-90,fk:[130,117],hn:[84,57]},{h:[112,88],t:-90,fk:[130,117],hn:[88,80]}],b:S=>plate(S.haN)};
A['bb-ohp']={k:[st({t:0,hn:[101,5]}),st({t:-5,hn:[106,36]})],b:S=>plate(S.haN)};
A['bb-row']={k:[{h:[84,72],t:50,fk:[100,117],hn:[97,75]},{h:[84,72],t:50,fk:[100,117],hn:[108,84]}],b:S=>plate(S.haN)};
A['bb-hip-thrust']={sc:bench(26,72,97),k:[{h:[102,94],t:-90,fk:[118,117],hn:[100,87]},{h:[96,112],t:-59,fk:[118,117],hn:[98,106]}],b:S=>plate(add(S.hip,S.t+90,7))};
/* DUMBBELL */
const INC=eq('M97 97L58 75',6,'padl')+`<rect class="pad" x="90" y="96" width="30" height="5" rx="2.5"/>`+eq('M96 101V120M114 101V120M70 84V120',2.5);
A['db-incline-press']={sc:INC,k:[{h:[100,92],t:-60,fk:[124,117],hn:[74,45]},{h:[100,92],t:-60,fk:[124,117],hn:[80,72]}],f:S=>dbl(S.haN)};
A['db-lateral-raise']={fr:1,k:[st({h:[100,69],t:0,a:[95,92]}),st({h:[100,69],t:0,a:[170,170]})],f:S=>dbl(S.haN)+dbl(S.haF)};
A['db-hammer-curl']={k:[st({a:[172,25]}),st({a:[178,178]})],f:S=>dbl(S.haN)};
A['db-goblet-squat']={k:[st({t:4,ar:[160,20]}),{h:[88,98],t:25,fk:[100,117],ar:[160,20]}],f:S=>`<rect class="dbb" x="${f1(S.haN[0]-4)}" y="${f1(S.haN[1]-2)}" width="8" height="14" rx="2.5"/>`};
A['db-one-arm-row']={uni:'arm',sc:bench(40,118,95),k:[{h:[70,68],t:88,fk:[66,117],hn:[90,76],hn2:[104,92],l2:[180,-90]},{h:[70,68],t:88,fk:[66,117],hn:[103,99],hn2:[104,92],l2:[180,-90]}],f:S=>dbl(S.haN)};
A['db-bulgarian']={uni:'leg',sc:bench(26,62,95),k:[{h:[86,72],t:5,fk:[106,117],fk2:[58,92],ft2:-80,a:[178,178]},{h:[86,96],t:10,fk:[106,117],fk2:[58,92],ft2:-80,a:[178,178]}],f:S=>dbl(S.haN)};
A['db-oh-triceps']={k:[st({a:[5,5]}),st({a:[8,-165]})],f:S=>dbl(S.haN)};
A['db-rear-fly']={fr:1,k:[{h:[100,72],t:0,tl:.45,hl:3,fk:[106,117],a:[95,100]},{h:[100,72],t:0,tl:.45,hl:3,fk:[106,117],a:[178,178]}],f:S=>dbl(S.haN)+dbl(S.haF)};
/* KABEL */
A['cb-fly']={fr:1,sc:stack(28,40)+stack(172,40),k:[st({h:[100,69],t:0,fk:[110,117],a:[190,200],as:.62}),st({h:[100,69],t:0,fk:[110,117],a:[100,85]})],b:S=>cab([172,40],S.haN)+cab([28,40],S.haF),f:S=>handle(S.haN)+handle(S.haF)};
A['cb-face-pull']={sc:stack(168,22),k:[st({h:[96,69],t:-4,hn:[101,24],ed:-1}),st({h:[96,69],t:2,hn:[126,30],ed:-1})],b:S=>cab([168,22],midH(S))};
A['cb-pushdown']={sc:stack(150,2),k:[st({t:8,a:[185,165]}),st({t:8,a:[185,45]})],b:S=>cab([150,2],S.haN),f:S=>handle(S.haN)};
A['cb-seated-row']={sc:`<rect class="pad" x="62" y="101" width="46" height="5" rx="2.5"/>`+eq('M70 106V120M100 106V120')+eq('M140 90V114',4)+stack(158,94,96),k:[{h:[88,96],t:0,fk:[134,100],ft:10,hn:[100,82]},{h:[88,96],t:25,fk:[134,100],ft:10,hn:[130,78]}],b:S=>cab([155,94],S.haN),f:S=>handle(S.haN)};
A['cb-pallof']={sc:`<g opacity=".55">${stack(100,52)}</g>`,seq:[[0,1,1,'con','Dorong keluar'],[1,1,3,'hold','Tahan, lawan rotasi'],[1,0,1,'ecc','Kembali ke dada']],k:[st({t:0,hn:[106,54]}),st({t:0,hn:[131,52]})],b:S=>cab([100,52],S.haN),f:S=>handle(S.haN)};
A['cb-kickback']={uni:'leg',sc:stack(150,114),k:[{h:[100,70],t:20,fk2:[104,117],l:[-145,-135],ft:-160,hn:[140,62]},{h:[100,70],t:20,fk2:[104,117],l:[170,175],hn:[140,62]}],b:S=>cab([150,114],S.anN)};
A['cb-woodchop']={fr:1,sc:stack(30,0),k:[{h:[104,71],t:18,sw:4,fk:[112,117],hn:[123,73],hn2:[121,74]},{h:[96,70],t:-10,sw:4,fk:[112,117],hn:[78,13],hn2:[76,12]}],b:S=>cab([30,0],midH(S)),f:S=>handle(midH(S))};
/* LAT PULLDOWN */
const LAT=`<rect class="pad" x="76" y="98" width="34" height="5" rx="2.5"/>`+eq('M93 103V120M84 120h18')+eq('M112 80h8',5,'padl')+eq('M120 80V120',2.5)+eq('M60 -14V120M52 120h16M60 -10H100',3)+C(100,-8,3,'pul');
const LATK=(a,b,o)=>({sc:LAT,k:[Object.assign({h:[92,93],t:-12,fk:[122,117],hn:a},o),Object.assign({h:[92,93],t:-6,fk:[122,117],hn:b},o)],b:S=>cab([100,-8],midH(S)),f:S=>handle(S.haN)});
A['lat-wide']=LATK([96,58],[95,30]);
A['lat-close']=LATK([98,68],[96,31]);
A['lat-reverse']=LATK([97,60],[95,30]);
A['lat-single']=Object.assign(LATK([97,64],[95,30],{hn2:[110,88]}),{uni:'arm'});
A['lat-straight-arm']={sc:stack(150,2),k:[{h:[96,70],t:25,fk:[100,117],hn:[112,72]},{h:[96,70],t:25,fk:[100,117],hn:[137,16]}],b:S=>cab([148,2],S.haN),f:S=>handle(S.haN)};
/* LEG PRESS 45° */
const LP=eq('M52 76L82 108',7,'padl')+`<rect class="pad" x="78" y="106" width="22" height="5" rx="2.5"/>`+eq('M88 111V120M70 120h40')+eq('M104 118L170 52',3,'eq2');
const sled=q=>{const c=add(q,45,4);return `<path class="padl" d="M${P(add(c,-45,15))}L${P(add(c,135,15))}" stroke-width="5"/>`+`<rect class="wt" x="${f1(c[0]+3)}" y="${f1(c[1]-4)}" width="10" height="8" rx="1.5" transform="rotate(45 ${f1(c[0]+8)} ${f1(c[1])})"/>`;};
const LPB={h:[86,104],t:-55,hn:[90,104],ft:-45};
const lpk=(a,b,o)=>({sc:LP,k:[Object.assign({},LPB,{fk:a},o),Object.assign({},LPB,{fk:b},o)],b:S=>sled(S.p.uni2?S.anN:S.anN)});
A['lp-standard']=lpk([118,72],[103,87]);
A['lp-high-wide']=lpk([114,66],[99,81]);
A['lp-low-narrow']=lpk([122,78],[107,93]);
A['lp-single']=Object.assign(lpk([118,72],[103,87],{l2:[30,160]}),{uni:'leg'});
A['lp-calf']={sc:LP,k:[Object.assign({},LPB,{fk:[116,70],ft:-10}),Object.assign({},LPB,{fk:[119,73],ft:-60})],b:S=>sled(S.toN)};
/* SMITH */
A['sm-squat']={sc:rails(94),k:[{h:[96,69],t:0,fk:[106,117],ar:[210,20]},{h:[80,96],t:30,fk:[106,117],ar:[210,20]}],b:S=>plate(onBack(S))};
A['sm-incline']={sc:INC+rails(76),k:[{h:[100,92],t:-60,fk:[124,117],hn:[76,44.5]},{h:[100,92],t:-60,fk:[124,117],hn:[76,64]}],b:S=>plate(S.haN)};
A['sm-split']={uni:'leg',sc:rails(95),k:[{h:[96,72],t:2,fk:[116,117],fk2:[74,114],ft2:115,ar:[210,20]},{h:[96,97],t:4,fk:[116,117],fk2:[74,114],ft2:115,ar:[210,20]}],b:S=>plate(onBack(S))};
A['sm-shrug']={sc:rails(104),seq:[[1,0,1,'con','Angkat bahu'],[0,0,2,'hold','Tahan di atas'],[0,1,1,'ecc','Turunkan']],k:[st({t:0,se:4,hn:[103,65]}),st({t:0,se:0,hn:[103,69]})],b:S=>plate(S.haN)};
A['sm-inverted-row']={sc:rails(73)+plate([73,72]),k:[{h:[105.2,97.2],t:-65.7,fk:[149,117],hn:[74,72],ft:20},{h:[101.5,109.4],t:-80.3,fk:[149,117],hn:[73,72],ft:20}]};
/* KETTLEBELL */
A['kb-swing']={seq:[[0,1,.7,'ecc','Ayun ke bawah'],[1,1,.1,'hold','Hike'],[1,0,.5,'con','Hip snap'],[0,0,.3,'hold','Melayang']],k:[st({t:-3,fk:[102,117],hn:[132,40]}),{h:[80,78],t:65,fk:[102,117],hn:[92,100]}],f:S=>kb(S.haN,S.faN)};
A['kb-clean']={uni:'arm',seq:[[1,0,.6,'con','Tarik & tangkap'],[0,0,.8,'hold','Posisi rack'],[0,1,.7,'ecc','Turunkan ke hike'],[1,1,.2,'hold','Hike']],k:[st({t:0,fk:[102,117],hn:[106,40],a2:[178,178],kbo:150}),{h:[80,78],t:65,fk:[102,117],hn:[92,100],a2:[165,165],kbo:0}],f:S=>kb(S.haN,S.faN+S.p.kbo)};
A['kb-press']={uni:'arm',k:[st({t:-2,hn:[101,5],a2:[178,178],kbo:180}),st({t:0,hn:[106,40],a2:[178,178],kbo:150})],f:S=>kb(S.haN,S.faN+S.p.kbo)};
A['kb-tgu']={uni:'arm',seq:[[0,1,1.2,'con','Naik ke siku'],[1,2,1,'con','Naik ke tangan'],[2,3,1.6,'con','Sapu kaki, berlutut'],[3,4,1.4,'con','Berdiri'],[4,4,.8,'hold','Tahan di atas'],[4,3,1.4,'ecc','Mundur berlutut'],[3,2,1.6,'ecc','Kembali ke tangan'],[2,1,1,'ecc','Turun ke siku'],[1,0,1.2,'ecc','Berbaring'],[0,0,.6,'hold','Reset']],
 k:[{h:[100,111],t:-90,a:[0,0],a2:[110,95],fk:[118,117],l2:[90,90]},
    {h:[100,111],t:-60,a:[0,0],a2:[175,90],fk:[118,117],l2:[90,90]},
    {h:[100,111],t:-35,a:[0,0],a2:[190,190],fk:[118,117],l2:[90,90]},
    {h:[100,90],t:0,a:[0,0],a2:[180,180],fk:[120,117],l2:[200,270],ft2:-90},
    {h:[100,69],t:0,a:[0,0],a2:[180,180],fk:[104,117],l2:[180,180],ft2:92}],f:S=>kb(S.haN,0)};
const WALK=(n,f,y)=>({h:[100,y],t:3,a:[178,178],l:n,l2:f});
A['kb-farmer']={seq:[[0,1,.34,'con','Langkah 1'],[1,2,.34,'con','Ayun'],[2,3,.34,'con','Langkah 2'],[3,0,.34,'con','Ayun']],k:[WALK([160,178],[198,205],70),WALK([182,182],[168,215],68),WALK([198,205],[160,178],70),WALK([168,215],[182,182],68)],f:S=>kb(S.haN,180)};
/* PULL-UP */
const PB=x=>pbar(x,-2);
A['pu-pullup']={fr:1,sc:eq('M50 -2H150',2.5,'eq2'),k:[{h:[100,36.5],t:0,hn:[124,-2],l:[178,182]},{h:[100,58.8],t:0,hn:[124,-2],l:[178,182]}]};
A['pu-chinup']={sc:PB(104),k:[{h:[93,37],t:6,hn:[104,-2],l:[172,200]},{h:[100,62],t:3,hn:[104,-2],l:[175,195]}]};
A['pu-neutral']={sc:PB(104),k:[{h:[93,37],t:5,hn:[104,-2],l:[172,200]},{h:[100,62],t:3,hn:[104,-2],l:[175,195]}]};
A['pu-knee-raise']={sc:PB(104),k:[{h:[101,62],t:-6,hn:[104,-2],l:[78,178]},{h:[100,62],t:3,hn:[104,-2],l:[180,182]}]};
A['pu-dead-hang']={sc:PB(104),seq:[[0,1,2,'hold','Tahan, tarik napas'],[1,0,2,'hold','Tahan, buang napas']],k:[{h:[100,62],t:3,hn:[104,-2],l:[178,184]},{h:[100,63],t:2,hn:[104,-2],l:[180,186]}]};
/* DIP */
const DB=eq('M68 51H140',3.5,'eq2')+eq('M74 51V120M134 51V120',2.5);
A['dip-chest']={sc:DB,k:[{h:[91.3,50.3],t:12,hn:[100,51],l:[178,-100]},{h:[85.6,66.2],t:35,hn:[100,51],l:[178,-100]}]};
A['dip-triceps']={sc:DB,k:[{h:[98.3,51],t:3,hn:[100,51],l:[180,-110]},{h:[97.3,71.9],t:3,hn:[100,51],l:[180,-110]}]};
A['dip-leg-raise']={sc:eq('M82 16V84',6,'padl')+eq('M88 47H112',5,'padl')+eq('M82 84V120M74 120h16'),k:[{h:[92,61],t:0,a:[180,90],l:[80,178]},{h:[92,61],t:0,a:[180,90],l:[180,182]}]};
A['dip-lsit']={sc:DB,seq:[[0,1,2,'hold','Tahan, tarik napas'],[1,0,2,'hold','Tahan, buang napas']],k:[{h:[99,51],t:-2,hn:[100,51],l:[90,90],ft:0},{h:[99,51.5],t:-1,hn:[100,51],l:[86,88],ft:-4}]};
/* MESIN KAKI */
const SEAT=`<rect class="pad" x="78" y="93" width="40" height="5" rx="2.5"/>`+eq('M80 52L84 92',6,'padl')+eq('M98 98V120M86 120h24');
const pad=(kn,an,sn,back)=>{const c=add(an,sn+(back?90:-90),4.5);return `<path class="eq" d="M${P(kn)}L${P(c)}" stroke-width="2"/>`+C(c[0],c[1],4,'roll');};
A['leg-ext']={sc:SEAT,k:[{h:[92,87],t:-8,hn:[96,96],l:[90,95],ft:5},{h:[92,87],t:-8,hn:[96,96],l:[90,180]}],f:S=>pad([117,87],S.anN,S.snN,0)};
A['leg-ext-single']=Object.assign({},A['leg-ext'],{uni:'leg',k:A['leg-ext'].k.map(p=>Object.assign({},p,{l2:[90,180],ft2:92}))});
A['leg-seated-curl']={sc:SEAT+eq('M110 76h12',5,'padl'),k:[{h:[92,87],t:-8,hn:[96,96],l:[90,-150],ft:-60},{h:[92,87],t:-8,hn:[96,96],l:[90,100],ft:10}],f:S=>pad([117,87],S.anN,S.snN,1)};
A['leg-lying-curl']={sc:bench(52,138,92),k:[{h:[80,86],t:90,hn:[134,98],l:[-90,20],ft:-70},{h:[80,86],t:90,hn:[134,98],l:[-90,-90],ft:180}],f:S=>pad([55,86],S.anN,S.snN,1)};

/* ---- urutan fase ---- */
const PH={ecc:'Eksentrik',con:'Konsentrik',hold:'Jeda'};
const PHD={ecc:'Otot memanjang, kendalikan beban',con:'Otot memendek, gerakkan beban',hold:'Tahan posisi'};
function seqOf(v){
  const d=A[v.id]; if(d.seq) return d.seq.map(([a,b,dur,ty,lb])=>({a,b,dur,ty,lb:lb||PH[ty]}));
  const m=/^(\d+)-(\d+)-(\d+)-(\d+)$/.exec(v.te||''); const t=m?m.slice(1).map(Number):[2,0,1,0];
  return [[0,1,t[0],'ecc'],[1,1,t[1],'hold'],[1,0,t[2],'con'],[0,0,t[3],'hold']].filter(x=>x[2]>0).map(([a,b,dur,ty])=>({a,b,dur,ty,lb:PH[ty]}));
}

/* ---- render ---- */
const BYV={};
function info(id){
  if(BYV[id]) return BYV[id];
  const v=BYID[id], d=A[id]; if(!v||!d) return null;
  const seq=seqOf(v); const total=seq.reduce((s,x)=>s+x.dur,0);
  return BYV[id]={v,d,seq,total,hl:hlOf(v.m)};
}
function poseAt(I,time){
  let t=((time%I.total)+I.total)%I.total;
  for(let i=0;i<I.seq.length;i++){const s=I.seq[i]; if(t<=s.dur||i===I.seq.length-1){const u=s.dur?Math.min(1,t/s.dur):1; return {pose:lerpP(I.d.k[s.a],I.d.k[s.b],ease(u)),i,u};} t-=s.dur;}
}
function frame(I,pose){
  const S=solve(pose,I.d.fr);
  return (I.d.b?I.d.b(S):'')+drawFig(S,I.hl,I.d.uni)+(I.d.f?I.d.f(S):'');
}
function stillPose(I){const k=I.d.k; return k.length>2?k[Math.min(2,k.length-1)]:lerpP(k[0],k[1],.55);}
function svg(id,label){
  const I=info(id); if(!I) return '';
  return `<svg class="anim" viewBox="${VB}" role="img" aria-label="${esc(label||('Animasi '+I.v.n))}"><path class="gnd" d="M20 ${GY}H180"/>${I.d.sc||''}<g class="dyn">${frame(I,stillPose(I))}</g></svg>`;
}

/* ---- player & loop ---- */
const RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const live=new Map();
let raf=0, io=null;
function tick(now){
  raf=0;
  live.forEach(st=>{
    if(!st.el.isConnected){live.delete(st.el);return;}
    if(st.playing&&st.vis){
      if(st.last!=null){const dt=Math.min(.1,(now-st.last)/1000)*st.speed; const prev=st.time; st.time+=dt; if(Math.floor(st.time/st.I.total)>Math.floor(prev/st.I.total)) st.reps++;}
      st.last=now; draw(st);
    }else st.last=null;
  });
  if([...live.values()].some(s=>s.playing&&s.vis)) raf=requestAnimationFrame(tick);
}
function kick(){if(!raf) raf=requestAnimationFrame(tick);}
function draw(st){
  const r=poseAt(st.I,st.time);
  st.g.innerHTML=frame(st.I,r.pose);
  if(st.ui) st.ui(r);
}
function mount(root){
  (root||document).querySelectorAll('[data-anim]:not([data-live])').forEach(el=>{
    const I=info(el.dataset.anim); if(!I) return;
    el.setAttribute('data-live','');
    const st={el,I,g:el.querySelector('.dyn'),time:0,speed:1,reps:0,playing:!RM,vis:false,last:null};
    live.set(el,st);
    if(el.dataset.mode==='player') initPlayer(st); else { if(!io) io=new IntersectionObserver(es=>{es.forEach(e=>{const s=live.get(e.target); if(s){s.vis=e.isIntersecting; if(s.vis) kick();}});},{rootMargin:'80px'}); io.observe(el);}
  });
  kick();
}
function fmt(n){return n.toFixed(1).replace('.',',');}
function initPlayer(st){
  st.vis=true;
  const root=st.el.closest('.player'); const I=st.I;
  const $$=s=>root.querySelector(s);
  const btn=$$('[data-pl="play"]'), head=$$('.tl-head'), now=$$('.ph-now'), clock=$$('.ph-clock'), reps=$$('.ph-reps'), rows=[...root.querySelectorAll('.phases tr[data-row]')], tl=$$('.tl');
  const setBtn=()=>{btn.setAttribute('aria-pressed',st.playing); btn.innerHTML=st.playing?PAUSE_I+'<span>Berhenti</span>':PLAY_I+'<span>Putar</span>';};
  setBtn();
  st.ui=r=>{
    const t=((st.time%I.total)+I.total)%I.total;
    head.style.left=(t/I.total*100)+'%';
    tl.setAttribute('aria-valuenow',fmt(t)); tl.setAttribute('aria-valuetext',`${I.seq[r.i].lb}, ${fmt(t)} dari ${fmt(I.total)} detik`);
    const s=I.seq[r.i];
    if(now.dataset.i!=String(r.i)){now.dataset.i=r.i; now.innerHTML=`<i class="ty ${s.ty}"></i><b>${esc(s.lb)}</b><span>${PHD[s.ty]}</span>`; rows.forEach((li,j)=>li.toggleAttribute('data-on',j===r.i));}
    clock.textContent=`${fmt(t)} / ${fmt(I.total)} dtk`;
    reps.textContent=st.reps;
  };
  draw(st);
  btn.addEventListener('click',()=>{st.playing=!st.playing; setBtn(); kick();});
  root.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{st.speed=+b.dataset.speed; root.querySelectorAll('[data-speed]').forEach(x=>x.setAttribute('aria-pressed',x===b));}));
  const seek=e=>{const r=tl.getBoundingClientRect(); const u=Math.max(0,Math.min(.9999,(e.clientX-r.left)/r.width)); st.time=Math.floor(st.time/I.total)*I.total+u*I.total; draw(st);};
  tl.addEventListener('pointerdown',e=>{tl.setPointerCapture(e.pointerId); st.wasPlaying=st.playing; st.playing=false; seek(e); setBtn();});
  tl.addEventListener('pointermove',e=>{if(tl.hasPointerCapture(e.pointerId)) seek(e);});
  tl.addEventListener('pointerup',e=>{st.playing=st.wasPlaying; setBtn(); kick();});
  tl.addEventListener('keydown',e=>{
    const step={ArrowRight:.1,ArrowLeft:-.1,PageUp:1,PageDown:-1}[e.key];
    if(step!=null){e.preventDefault(); st.playing=false; setBtn(); st.time=Math.max(0,st.time+step); draw(st);}
    else if(e.key===' '){e.preventDefault(); btn.click();}
  });
  rows.forEach((li,j)=>li.addEventListener('click',()=>{let t=0; for(let i=0;i<j;i++) t+=I.seq[i].dur; st.time=Math.floor(st.time/I.total)*I.total+t+.001; draw(st);}));
}
const PLAY_I='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9.5-5.5z" fill="currentColor"/></svg>';
const PAUSE_I='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>';
function player(id){
  const I=info(id); if(!I) return '';
  return `<section class="panel player" aria-label="Animasi gerakan">
    <div class="stage" data-anim="${id}" data-mode="player">${svg(id)}</div>
    <div class="pctl">
      <div class="pc-top"><h2 class="lbl">Gerak per fase</h2><span class="lbl">Rep <b class="num ph-reps">0</b></span></div>
      <div class="ph-now" aria-live="off"></div>
      <div class="tl" tabindex="0" role="slider" aria-label="Posisi dalam satu rep" aria-valuemin="0" aria-valuemax="${fmt(I.total)}">
        ${I.seq.map(s=>`<i class="ty ${s.ty}" style="flex-grow:${s.dur}" title="${esc(s.lb)} · ${fmt(s.dur)} dtk"></i>`).join('')}<span class="tl-head"></span></div>
      <div class="pc-row">
        <button type="button" class="btn sm" data-pl="play" aria-pressed="true"></button>
        <div class="seg" role="group" aria-label="Kecepatan">${[.5,1,2].map(x=>`<button type="button" data-speed="${x}" aria-pressed="${x===1}">${String(x).replace('.',',')}×</button>`).join('')}</div>
        <span class="ph-clock num"></span>
      </div>
      <table class="phases"><thead><tr><th>#</th><th>Fase</th><th class="r">Durasi</th></tr></thead><tbody>
        ${I.seq.map((s,i)=>`<tr data-row tabindex="-1"><td class="num">${i+1}</td><td><i class="ty ${s.ty}"></i>${esc(s.lb)}</td><td class="num r">${fmt(s.dur)} dtk</td></tr>`).join('')}
        <tr class="sum"><td></td><td>Satu rep</td><td class="num r">${fmt(I.total)} dtk</td></tr></tbody></table>
      <p class="hint">Bagian tubuh berwarna biru = otot utama, biru pudar = pendukung. Klik timeline atau baris fase untuk melompat.</p>
    </div>
  </section>`;
}
window.ANIM={svg,player,mount,has:id=>!!A[id],defs:A,_solve:solve,_info:info,_frame:frame,_poseAt:poseAt};
})();
