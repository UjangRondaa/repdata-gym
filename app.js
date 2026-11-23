/* ============ BODY MAP ============ */
const SIL = [['c',50,13,8.5],['r',45,20,10,9,3],['r',31,28,38,58,12],['r',34,80,32,18,8],['r',18,33,11,36,5.5],['r',71,33,11,36,5.5],['r',15,66,10,32,5],['r',75,66,10,32,5],['c',20,101,4.5],['c',80,101,4.5],['r',34,94,15,48,7],['r',51,94,15,48,7],['r',36,140,12,38,6],['r',52,140,12,38,6]];
const FRONT = {bahu:[['e',30,36,7,6.5],['e',70,36,7,6.5]],dada:[['e',42,45,8.5,7],['e',58,45,8.5,7]],bisep:[['e',23.5,53,4.5,10],['e',76.5,53,4.5,10]],lengan:[['e',20,80,4.2,11],['e',80,80,4.2,11]],perut:[['r',44,55,12,27,4]],oblik:[['e',37.5,68,4,11],['e',62.5,68,4,11]],quads:[['e',41.5,116,6,19],['e',58.5,116,6,19]],adduktor:[['e',47.6,104,2.4,9],['e',52.4,104,2.4,9]]};
const BACK = {lats:[['e',39,60,7,13],['e',61,60,7,13]],trap:[['p','50,22 37,33 44,50 50,58 56,50 63,33']],upback:[['e',44,45,4.2,5.5],['e',56,45,4.2,5.5]],bahu:[['e',30,36,7,6.5],['e',70,36,7,6.5]],trisep:[['e',23.5,53,4.5,10],['e',76.5,53,4.5,10]],lengan:[['e',20,80,4.2,11],['e',80,80,4.2,11]],lowback:[['r',44.5,70,11,12,4]],glutes:[['e',42.5,92,7.8,8],['e',57.5,92,7.8,8]],hams:[['e',41.5,120,6,16],['e',58.5,120,6,16]],betis:[['e',42,156,5,11],['e',58,156,5,11]]};
function shp(s,cls){
  const [k,...a]=s;
  if(k==='c') return `<circle class="${cls}" cx="${a[0]}" cy="${a[1]}" r="${a[2]}"/>`;
  if(k==='r') return `<rect class="${cls}" x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" rx="${a[4]}"/>`;
  if(k==='e') return `<ellipse class="${cls}" cx="${a[0]}" cy="${a[1]}" rx="${a[2]}" ry="${a[3]}"/>`;
  return `<polygon class="${cls}" points="${a[0]}"/>`;
}
function fig(m,map,ox){
  let s=`<g transform="translate(${ox} 0)">`+SIL.map(x=>shp(x,'sil')).join('');
  for(const k in map){const l=m[k]||0; s+=`<g><title>${MUS[k]}${l?' · '+LVTXT[l]:''}</title>`+map[k].map(x=>shp(x,'mu l'+l)).join('')+'</g>';}
  return s+'</g>';
}
function bodySVG(m,labels){
  const h=labels?194:180;
  return `<svg viewBox="0 0 200 ${h}" role="img" aria-label="Peta otot depan dan belakang">${fig(m,FRONT,0)}${fig(m,BACK,100)}${labels?'<text class="figlbl" x="50" y="191" text-anchor="middle">DEPAN</text><text class="figlbl" x="150" y="191" text-anchor="middle">BELAKANG</text>':''}</svg>`;
}

/* ============ HELPERS ============ */
const $ = s=>document.querySelector(s);
const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const musList=(m,l)=>Object.keys(m).filter(k=>m[k]===l).map(k=>MUS[k]).join(', ');
const lvBadge=lv=>LV[lv]?`<span class="lv lv${lv}" title="Warna plat ${LV[lv].kg} kg"><i></i>${LV[lv].t}</span>`:'<span class="lv none" title="Level belum diisi">—</span>';
const dash=s=>s?esc(s):'—';
const metaHtml=(v,extra)=>`${v.lv?lvBadge(v.lv):''}${v.t?`<span class="type">${v.t}</span>`:''}${v.p?`<span>${esc(v.p)}</span>`:''}${extra||''}`;
const PAGE=60;
/* Foto gerakan dari free-exercise-db (photos.js): dua foto per gerakan. Urutannya tidak selalu awal lalu akhir. */
const photoDir=v=>typeof PHOTOS!=='undefined'&&PHOTOS[v.id]?PHOTO_BASE+encodeURIComponent(PHOTOS[v.id])+'/':'';
const cardPhoto=v=>{const d=photoDir(v); return d?`<div class="vc-photo" aria-hidden="true"><img loading="lazy" decoding="async" src="${d}0.jpg" alt="" onerror="this.parentNode.remove()"><img loading="lazy" decoding="async" src="${d}1.jpg" alt="" onerror="this.parentNode.remove()"></div>`:'';};
const movePhotos=v=>{const d=photoDir(v); if(!d) return '';
  const fig=(i,cap)=>`<figure><img loading="lazy" decoding="async" src="${d}${i}.jpg" alt="${esc(v.n)}, ${cap.toLowerCase()}" onerror="this.parentNode.remove()"><figcaption>${cap}</figcaption></figure>`;
  return `<section class="photos" aria-label="Foto gerakan">${fig(0,'Posisi 1')}${fig(1,'Posisi 2')}<p class="hint">Foto: <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener">free-exercise-db</a> (domain publik)</p></section>`;};
const moreBtn=(shown,total)=>total>shown?`<div class="more"><button class="btn" type="button" data-more>Tampilkan ${Math.min(PAGE,total-shown)} lagi <span class="hint">(${shown} dari ${total})</span></button></div>`:'';
const tagsHtml=t=>t.length?t.map(x=>`<span class="tag">${esc(x)}</span>`).join(''):'<span class="tag none">Tanpa tag</span>';
const icon=(k)=>`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
const SEND_I='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>';
const SEARCH_I='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="m11 11 3.5 3.5"/></svg>';
const firstNum=s=>parseFloat(String(s).replace(',','.'))||0;
function store(k,v){try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){return null}}
function storeDel(k){try{localStorage.removeItem(k)}catch(e){}}
let toastT; function toast(msg){const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2600);}
function ago(ms){
  if(typeof ms!=='number') return '';
  const d=(Date.now()-ms)/1000; const rtf=new Intl.RelativeTimeFormat('id',{numeric:'auto'});
  if(d<60) return 'baru saja';
  if(d<3600) return rtf.format(-Math.round(d/60),'minute');
  if(d<86400) return rtf.format(-Math.round(d/3600),'hour');
  if(d<86400*30) return rtf.format(-Math.round(d/86400),'day');
  return new Date(ms).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
}

/* ============ NOTES STATE ============ */
const KINDS = {catatan:'Catatan',saran:'Saran',alat:'Usul alat',gerakan:'Usul gerakan',koreksi:'Koreksi',komentar:'Komentar',kritik:'Kritik'};
let SB=null, NOTES=null;
/* schemaOld: database Supabase belum menjalankan schema.sql versi terbaru
   (kolom pinned/is_admin/avatar_v belum ada). Komentar beranda & foto profil
   dimatikan sampai diperbarui, fitur lain tetap jalan. */
let schemaOld=false;
const WEB='_web'; // move_id untuk komentar di Beranda
const PAGE_WEB=10; let webLim=PAGE_WEB;
const PIN_I='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 1.5h5M6.5 1.5v4.2L4 8.5h8L9.5 5.7V1.5M8 8.5v6"/></svg>';
const CHAT_I='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>';
const IMG_I='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="15" height="15" rx="2.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="m18 16-4-4-8 8M19 2v6M16 5h6"/></svg>';
/* Admin (Supabase): profiles.is_admin. Mode lokal: semua orang boleh memoderasi. */
const isMod=()=>REMOTE?!!(account&&members[account.id]&&members[account.id].adm):true;
let REMOTE=false, capsReady=false;
let notes=[], notesState='loading', counts={};
let noteTab='semua';
function rebuildCounts(){counts={}; notes.forEach(n=>{counts[n.v]=(counts[n.v]||0)+1;});}
const noteCount=id=>notesState==='off'?'—':(counts[id]||0);
function cleanNote(d){
  const x=d.data()||{};
  if(typeof x.v!=='string'||typeof x.text!=='string') return null;
  return {id:d.id,v:x.v,k:KINDS[x.k]?x.k:'catatan',text:x.text.slice(0,600),by:typeof x.by==='string'?x.by:null,at:typeof x.at==='number'?x.at:0,pin:x.pin===true};
}
/* Sumber data: Supabase bila config.js terisi, selain itu mode lokal. */
async function initBackend(){
  const cfg=window.REPDATA_CONFIG||{};
  if(cfg.authEmailDomain) EMAIL_DOMAIN=cfg.authEmailDomain;
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey){initLocal(); return;}
  REMOTE=true; AUTH=SupaAuth;
  if(!window.supabase){acctErr=true; capsReady=acctReady=true; notesState='error'; refreshNotesUI(); return;}
  /* Terima juga URL yang tersalin lengkap dengan /rest/v1/ atau garis miring di akhir. */
  const url=String(cfg.supabaseUrl).trim().replace(/\/(rest|auth)\/v1.*$/,'').replace(/\/+$/,'');
  SB=window.supabase.createClient(url,cfg.supabaseAnonKey);
  NOTES={
    async add(n){const {error}=await SB.from('notes').insert({move_id:n.v,kind:n.k,body:n.text}); if(error) throw error; loadNotes();},
    async remove(id){const {error}=await SB.from('notes').delete().eq('id',id); if(error) throw error; loadNotes();},
    async pin(id,on){
      const {data,error}=await SB.from('notes').update({pinned:on}).eq('id',id).select('id');
      if(error) throw error;
      if(!data||!data.length) throw uerr('Hanya admin yang bisa menyematkan komentar.');
      loadNotes();
    }
  };
  capsReady=true;
  try{const {data}=await SB.auth.getSession(); await setUserFromSession(data&&data.session);}
  catch(e){console.error(e); acctReady=true;}
  refreshNotesUI();
  SB.auth.onAuthStateChange((ev,s)=>{
    if(ev==='INITIAL_SESSION') return;
    setTimeout(()=>{setUserFromSession(s).then(refreshNotesUI);},0);
  });
  loadNotes();
  SB.channel('notes-live')
    .on('postgres_changes',{event:'*',schema:'public',table:'notes'},()=>{clearTimeout(reloadT); reloadT=setTimeout(loadNotes,300);})
    .subscribe();
}
let reloadT, loadSeq=0;
async function loadNotes(){
  const seq=++loadSeq;
  const timer=setTimeout(()=>{if(notesState==='loading'){notesState='slow'; refreshNotesUI();}},10000);
  let res;
  const q=cols=>SB.from('notes').select(cols).order('created_at',{ascending:false}).limit(1000);
  try{
    res=await q('id,move_id,kind,body,user_id,created_at,pinned,profiles(username,created_at,is_admin,avatar_v)');
    if(res.error&&isMissingCol(res.error)){schemaOld=true; res=await q('id,move_id,kind,body,user_id,created_at,profiles(username,created_at)');}
    else if(!res.error) schemaOld=false;
  }catch(e){res={error:e};}
  clearTimeout(timer);
  if(seq!==loadSeq) return;
  if(res.error){console.error(res.error); if(notesState!=='ready') notesState='error'; refreshNotesUI(); return;}
  notes=(res.data||[]).map(r=>{
    const p=r.profiles;
    if(p&&p.username) members[r.user_id]=memberFromRow(p);
    return {id:r.id,v:String(r.move_id),k:KINDS[r.kind]?r.kind:'catatan',text:String(r.body).slice(0,600),by:r.user_id,at:Date.parse(r.created_at)||0,pin:r.pinned===true};
  });
  notesState='ready'; rebuildCounts(); refreshNotesUI();
}

function refreshNotesUI(){
  document.querySelectorAll('[data-count]').forEach(el=>{el.textContent=noteCount(el.dataset.count);});
  const ct=$('#notes-total'); if(ct){const v=ct.dataset.v, n=counts[v]||0; ct.textContent=notesState==='off'||notesState==='loading'?'':(v===WEB?`(${n})`:`${n} entri`);}
  renderCompose(); renderPhotoField(); renderNoteList(); renderRecent(); renderAccount(); updateAcctLink();
}

function composeMode(v){
  if(!capsReady||!acctReady) return 'load';
  if(v===WEB&&schemaOld) return 'old';
  if(!account) return 'guest';
  return 'form:'+account.id;
}
function renderCompose(){
  const root=$('#compose-root'); if(!root) return;
  const web=root.dataset.v===WEB;
  const mode=composeMode(root.dataset.v); if(root.dataset.mode===mode) return;
  root.dataset.mode=mode;
  const kinds=root.dataset.kinds.split(',');
  const base=mode.split(':')[0];
  if(base==='load'){root.innerHTML='<div class="empty">Memeriksa akun…</div>';return;}
  if(base==='old'){root.innerHTML='<div class="notice">Kolom komentar belum aktif karena database perlu diperbarui. Admin: jalankan ulang <code>supabase/schema.sql</code> di SQL Editor Supabase.</div>';return;}
  if(base==='guest'){
    const back=esc(lastRoute||'beranda');
    root.innerHTML=`<div class="gate"><div><b>${web?'Masuk untuk menulis komentar, kritik, atau saran':'Masuk untuk menulis catatan atau saran'}</b><p class="hint">Semua orang bisa membaca. Untuk menulis, kamu perlu akun RepData.</p></div>
      <div class="row"><a class="btn primary" href="#akun" data-auth="masuk" data-back="${back}">Masuk</a><a class="btn" href="#akun" data-auth="daftar" data-back="${back}">Daftar</a></div></div>`;
    return;
  }
  const ph = root.dataset.v==='_site' ? 'Contoh: tambahkan alat Hack Squat dengan variasi kaki sempit dan lebar.'
    : web ? 'Contoh: halaman gerakan lebih enak dibaca kalau ada video. Atau: tombol filter susah ditemukan di HP.'
    : 'Contoh: pakai sepatu datar, tumit jadi lebih stabil. Atau: langkah 3 lebih jelas kalau ditambah sudut lutut.';
  root.innerHTML=`<form class="compose${web?' web':''}" id="note-form" data-v="${esc(root.dataset.v)}">
    <div class="as"><span id="as-av">${avatar(account.u,'',account.id)}</span><span>Menulis sebagai <b>${esc(account.u)}</b></span></div>
    <div class="kinds" role="radiogroup" aria-label="Jenis entri">${kinds.map((k,i)=>`<input type="radio" name="nk" id="nk-${k}" value="${k}" ${i===0?'checked':''}><label for="nk-${k}">${KINDS[k]}</label>`).join('')}</div>
    <label class="lbl" for="note-text">${web?'Pesan':'Tulis untuk gerakan ini'}</label>
    <textarea id="note-text" maxlength="600" placeholder="${esc(ph)}" required></textarea>
    <div class="compose-foot"><span class="hint" id="note-hint">0/600 karakter</span>${web?'':'<button class="btn primary" id="note-send" type="submit">Kirim</button>'}</div>
    ${web?'<div class="avfield"><span class="lbl">Foto profil <span class="opt">(opsional)</span></span><div id="av-root"></div></div>':''}
    ${web?`<button class="btn primary block send" id="note-send" type="submit">${SEND_I}Kirim komentar</button>`:''}
  </form>`;
}

async function renderNoteList(){
  const root=$('#notes-root'); if(!root) return;
  const v=root.dataset.v;
  if(notesState==='off'){root.innerHTML='';return;}
  if(notesState==='loading'){root.innerHTML='<div class="empty">Memuat catatan…</div>';return;}
  if(notesState==='error'){root.innerHTML='<div class="empty">Catatan tidak bisa dimuat saat ini. Muat ulang halaman nanti.</div>';return;}
  let list=notes.filter(n=>n.v===v);
  if(noteTab!=='semua') list=list.filter(n=>n.k===noteTab);
  let pre = notesState==='slow' ? '<div class="empty">Server catatan belum menjawab; daftar ini mungkin belum lengkap.</div>' : '';
  if(!list.length){root.innerHTML=pre+`<div class="empty">${noteTab==='semua'?'Belum ada entri. Jadilah yang pertama menulis.':'Belum ada entri jenis ini.'}</div>`;return;}
  let more='';
  if(v===WEB){ // yang disematkan selalu di atas, lalu 10 per halaman
    list=[...list.filter(n=>n.pin),...list.filter(n=>!n.pin)];
    if(list.length>webLim){more=`<div class="more"><button class="btn" type="button" data-cmore>Tampilkan ${Math.min(PAGE_WEB,list.length-webLim)} lagi <span class="hint">(${webLim} dari ${list.length})</span></button></div>`; list=list.slice(0,webLim);}
  }
  root.innerHTML=pre+`<div class="nlist">${list.map(n=>noteHtml(n)).join('')}</div>`+more;
}
function noteHtml(n,ctx){
  const mine = !!(account&&n.by===account.id);
  const del = (mine||isMod())&&NOTES ? `<button class="ghost del" type="button" data-del="${esc(n.id)}">Hapus</button>` : '';
  const pinned = !ctx && n.v===WEB && n.pin;
  const pinBtn = !ctx && n.v===WEB && isMod() && NOTES && NOTES.pin && !schemaOld ? `<button class="ghost" type="button" data-pin="${esc(n.id)}" data-on="${n.pin?'0':'1'}">${n.pin?'Lepas sematan':'Sematkan'}</button>` : '';
  let ctxLink='';
  if(ctx){ if(n.v==='_site') ctxLink='<a class="ctx" href="#saran">di Saran</a>'; else if(n.v===WEB) ctxLink='<a class="ctx" href="#beranda">di Beranda</a>'; else if(BYID[n.v]) ctxLink=`<a class="ctx" href="#gerakan-${n.v}">di ${esc(BYID[n.v].n)}</a>`; }
  const name=uname(n.by);
  const adm=!!(REMOTE&&members[n.by]&&members[n.by].adm);
  return `<article class="note${pinned?' pinned':''}">${pinned?`<div class="pinhead">${PIN_I}Disematkan</div>`:''}${avatar(name,'',n.by)}
    <div><div class="note-top"><b>${esc(name)}${mine?' (kamu)':''}</b>${adm?'<span class="adm">Admin</span>':''}<span class="kb ${n.k}">${KINDS[n.k]}</span><time>${ago(n.at)}</time>${ctxLink}${pinBtn||del?`<span class="acts">${pinBtn}${del}</span>`:''}</div>
    <p>${esc(n.text)}</p></div></article>`;
}
function renderRecent(){
  const root=$('#recent-root'); if(!root) return;
  if(notesState==='loading'){root.innerHTML='<div class="empty">Memuat catatan terbaru…</div>';return;}
  if(notesState==='error'){root.innerHTML='<div class="empty">Catatan tidak bisa dimuat saat ini.</div>';return;}
  const list=notes.filter(n=>n.v!==WEB).slice(0,6);
  if(!list.length){root.innerHTML='<div class="notice">Belum ada catatan. Buka gerakan mana pun di <a href="#database">Database</a> lalu tulis pengalamanmu di bagian bawah halamannya.</div>';return;}
  root.innerHTML=`<div class="nlist">${list.map(n=>noteHtml(n,true)).join('')}</div>`;
}

/* ============ VIEWS ============ */
let viewMode = store('rd-view')==='daftar'?'daftar':'kartu';
const eqState = {}; // per equipment filters
const dbState = {q:'',mus:null,lim:PAGE};

function vCard(v){
  return `<a class="vcard" href="#gerakan-${v.id}">
    ${ANIM.has(v.id)?`<div class="vc-anim" data-anim="${v.id}" aria-hidden="true">${ANIM.svg(v.id)}</div>`:cardPhoto(v)}
    <div class="vc-head">
      <div style="min-width:0"><div class="setup">${esc(v.s)}</div><h3>${esc(v.n)}</h3>
        <div class="vc-meta">${metaHtml(v)}</div></div>
      <div class="vc-map" aria-hidden="true">${bodySVG(v.m,false)}</div>
    </div>
    <dl class="stats">
      <div><dt>Otot utama</dt><dd>${musList(v.m,3)||(v.mx&&v.mx[0])||'—'}</dd></div>
      <div><dt>Pendukung</dt><dd>${musList(v.m,2)||'—'}</dd></div>
      <div><dt>Rep / set</dt><dd class="num">${dash(v.r)}</dd></div>
      <div><dt>Tempo</dt><dd class="num" title="Turun-jeda-naik-jeda (detik)">${dash(v.te)}</dd></div>
      <div><dt>Istirahat</dt><dd class="num">${dash(v.rest)}</dd></div>
      <div><dt>Catatan</dt><dd class="num" data-count="${v.id}">${noteCount(v.id)}</dd></div>
    </dl>
    <div class="tags">${tagsHtml(v.tags)}</div>
  </a>`;
}
function vTable(list,showEq){
  return `<div class="tablewrap"><table><thead><tr><th>Gerakan</th>${showEq?'<th>Alat</th>':''}<th>Level</th><th>Otot utama</th><th>Pendukung</th><th>Rep</th><th>Tempo</th><th>Istirahat</th><th>Catatan</th></tr></thead><tbody>
  ${list.map(v=>`<tr><td><a href="#gerakan-${v.id}">${esc(v.n)}</a><div class="setup">${esc(v.s)}</div></td>${showEq?`<td class="eqname">${esc(v.eq.n)}</td>`:''}<td>${lvBadge(v.lv)}</td><td>${musList(v.m,3)||(v.mx&&v.mx[0])||'—'}</td><td>${musList(v.m,2)||'—'}</td><td class="num">${dash(v.r)}</td><td class="num">${dash(v.te)}</td><td class="num">${dash(v.rest)}</td><td class="num" data-count="${v.id}">${noteCount(v.id)}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function viewToggle(){
  return `<div class="seg" role="group" aria-label="Tampilan"><button type="button" data-view="kartu" aria-pressed="${viewMode==='kartu'}">Kartu</button><button type="button" data-view="daftar" aria-pressed="${viewMode==='daftar'}">Daftar</button></div>`;
}

function viewHome(){
  const sample=BYID['bb-back-squat'];
  const musCount=Object.keys(MUS).length;
  return `<section class="hero">
    <div class="lbl">Database gerakan gym</div>
    <h1>Setiap alat. Setiap variasi. <em>Otot yang kena.</em></h1>
    <p>RepData memetakan cara memakai alat gym, semua variasi gerakannya, dan otot yang bekerja di tiap variasi.</p>
    <div class="counts"><div><b class="num">${EQ.length}</b><span class="lbl">Alat</span></div><div><b class="num">${ALL.length}</b><span class="lbl">Variasi</span></div><div><b class="num">${musCount}</b><span class="lbl">Grup otot</span></div></div>
    <div class="row"><a class="btn primary" href="#database">Buka database</a><a class="btn" href="#saran">Kirim saran</a></div>
  </section>
  <section class="sect">
    <h2>Satu gerakan, semua datanya</h2>
    <p>Setiap variasi punya kartu data yang sama, jadi kamu bisa membandingkan gerakan dengan cepat. Begini cara membacanya.</p>
    <div class="demo">
      <div class="vlist" style="grid-template-columns:minmax(0,1fr)">${vCard(sample)}</div>
      <dl class="legend">
        <div><dt>Setup</dt><dd>Posisi awal: jenis genggaman, posisi kaki, dan letak beban. Contoh: <code>Overhand · Selebar bahu</code>.</dd></div>
        <div><dt>Level</dt><dd>Mengikuti warna plat kompetisi: ${lvBadge(1)} hijau 10 kg, ${lvBadge(2)} kuning 15 kg, ${lvBadge(3)} merah 25 kg.</dd></div>
        <div><dt>Rep / set</dt><dd>Rentang repetisi yang disarankan untuk tiap set kerja.</dd></div>
        <div><dt>Tempo</dt><dd>Empat angka dalam detik: turun, jeda bawah, naik, jeda atas. <code>3-1-1-0</code> berarti turun 3 detik, jeda 1, naik 1, langsung lanjut.</dd></div>
        <div><dt>Animasi</dt><dd>Figur bergerak mengikuti tempo. Bagian tubuh biru = otot utama yang bekerja. Buka gerakan untuk player lengkap dengan timeline per fase.</dd></div>
        <div><dt>Peta otot</dt><dd>Biru paling terang = otot utama, biru sedang = pendukung, biru pudar = stabilisator. Tampak depan dan belakang.</dd></div>
        <div><dt>Tag</dt><dd>Sifat khusus, misalnya <code>Butuh spotter</code>, <code>Unilateral</code>, atau <code>Ramah punggung</code>.</dd></div>
      </dl>
    </div>
  </section>
  <section class="sect">
    <h2>Notes</h2>
    <p>Pengalaman dan saran dari orang-orang yang membuka halaman ini.</p>
    <div id="recent-root"></div>
  </section>
  ${notesSection(WEB,['komentar','kritik','saran'],'Komentar','Punya kritik, komentar, atau saran untuk website RepData? Tulis di sini; semua pengunjung bisa membacanya.')}`;
}

function viewDatabase(){
  return `<div class="pagehead"><div class="lbl">Database</div><h1>Pilih alat</h1><p>${EQ.length} alat dan ${ALL.length} variasi gerakan. Cari langsung nama gerakan, atau telusuri per otot yang ingin kamu latih.</p></div>
  <div class="searchbar"><label class="search">${SEARCH_I}<input id="db-q" type="search" placeholder="Cari gerakan, otot, atau alat" value="${esc(dbState.q)}" aria-label="Cari"></label></div>
  <div class="muscle-row"><span class="lbl">Telusuri per otot</span><div class="chips">${Object.keys(MUS).map(k=>`<button type="button" class="chip" data-gm="${k}" aria-pressed="${dbState.mus===k}">${MUS[k]}</button>`).join('')}</div></div>
  <div id="db-body"></div>`;
}
function renderDbBody(){
  const root=$('#db-body'); if(!root) return;
  const q=dbState.q.trim().toLowerCase(); const mk=dbState.mus;
  if(!q&&!mk){
    root.innerHTML=`<div class="resultline"><span><b>${EQ.length}</b> alat</span></div><div class="eqgrid">${EQ.map(e=>{
      const freq={}; e.v.forEach(v=>Object.keys(v.m).forEach(k=>{if(v.m[k]===3) freq[k]=(freq[k]||0)+1;}));
      const top=Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,3).map(k=>MUS[k]).join(' · ');
      return `<a class="eqcard" href="#alat-${e.id}"><div class="art">${icon(e.icon)}</div><div class="info"><h3>${esc(e.n)}</h3><span class="sub"><b>${e.v.length}</b> variasi</span><span class="sub">${top}</span></div></a>`;}).join('')}</div>`;
    return;
  }
  let list=ALL.filter(v=>{
    if(mk && !((v.m[mk]||0)>=2)) return false;
    if(!q) return true;
    const hay=[v.n,v.s,v.eq.n,v.p,...v.tags,...Object.keys(v.m).filter(k=>v.m[k]>=2).map(k=>MUS[k])].join(' ').toLowerCase();
    return hay.includes(q);
  });
  if(mk) list.sort((a,b)=>(b.m[mk]-a.m[mk])||a.n.localeCompare(b.n));
  const label=[mk?`otot ${MUS[mk]}`:'',q?`"${esc(dbState.q.trim())}"`:''].filter(Boolean).join(' + ');
  const page=list.slice(0,dbState.lim);
  root.innerHTML=`<div class="resultline"><span><b>${list.length}</b> variasi untuk ${label}</span><span style="display:flex;gap:8px;align-items:center">${viewToggle()}<button class="ghost" type="button" data-clear-db>Hapus filter</button></span></div>
   ${list.length?(viewMode==='daftar'?vTable(page,true):`<div class="vlist">${page.map(vCard).join('')}</div>`)+moreBtn(page.length,list.length):'<div class="notice">Tidak ada gerakan yang cocok. Coba kata lain, misalnya "dada", "squat", atau "kabel".</div>'}`;
}

const SORTS={az:'Nama A ke Z',za:'Nama Z ke A','lv-asc':'Level mudah ke sulit','lv-desc':'Level sulit ke mudah','rep-asc':'Rep sedikit ke banyak','rep-desc':'Rep banyak ke sedikit',notes:'Catatan terbanyak'};
function getEq(id){ if(!eqState[id]) eqState[id]={q:'',sort:'az',mus:new Set(),lv:new Set(),t:new Set(),open:false,lim:PAGE}; return eqState[id]; }
function viewEquip(e){
  const st=getEq(e.id);
  const musHere=Object.keys(MUS).filter(k=>e.v.some(v=>(v.m[k]||0)>=2));
  const types=[...new Set(e.v.map(v=>v.t).filter(Boolean))];
  const lvls=[1,2,3].filter(l=>e.v.some(v=>v.lv===l));
  const nf=st.mus.size+st.lv.size+st.t.size;
  return `<nav class="crumbs"><a href="#database">Database</a><span>/</span><span>${esc(e.n)}</span></nav>
  <div class="eqhead"><div class="art">${icon(e.icon)}</div><div><div class="lbl">${e.v.length} variasi</div><h1>${esc(e.n)}</h1><p>${esc(e.desc)}</p></div></div>
  <section class="howto"><h2 class="lbl">Cara pakai alat</h2><ul>${e.use.map(u=>`<li><span>${esc(u)}</span></li>`).join('')}</ul></section>
  <div class="toolbar">
    <label class="search">${SEARCH_I}<input id="eq-q" type="search" placeholder="Cari variasi ${esc(e.n)}" value="${esc(st.q)}" aria-label="Cari variasi"></label>
    <button type="button" class="btn sm" id="eq-filter" aria-expanded="${st.open}">Filter${nf?` (${nf})`:''}</button>
    <select id="eq-sort" aria-label="Urutkan">${Object.entries(SORTS).map(([k,t])=>`<option value="${k}" ${st.sort===k?'selected':''}>${t}</option>`).join('')}</select>
    ${viewToggle()}
  </div>
  <div class="filters" id="eq-filters" ${st.open?'':'hidden'}>
    <div class="grp"><span class="lbl">Otot target</span><div class="chips">${musHere.map(k=>`<button type="button" class="chip" data-f="mus" data-val="${k}" aria-pressed="${st.mus.has(k)}">${MUS[k]}</button>`).join('')}</div></div>
    ${lvls.length?`<div class="grp"><span class="lbl">Level</span><div class="chips">${lvls.map(l=>`<button type="button" class="chip" data-f="lv" data-val="${l}" aria-pressed="${st.lv.has(String(l))}">${LV[l].t}</button>`).join('')}</div></div>`:''}
    ${types.length?`<div class="grp"><span class="lbl">Jenis</span><div class="chips">${types.map(t=>`<button type="button" class="chip" data-f="t" data-val="${t}" aria-pressed="${st.t.has(t)}">${t}</button>`).join('')}</div></div>`:''}
    <div><button type="button" class="ghost" data-clear-eq>Hapus semua filter</button></div>
  </div>
  <div id="eq-body" data-eq="${e.id}"></div>`;
}
function renderEqBody(){
  const root=$('#eq-body'); if(!root) return;
  const e=EQBY[root.dataset.eq]; const st=getEq(e.id);
  const q=st.q.trim().toLowerCase();
  let list=e.v.filter(v=>{
    if(st.mus.size && ![...st.mus].some(k=>(v.m[k]||0)>=2)) return false;
    if(st.lv.size && !st.lv.has(String(v.lv))) return false;
    if(st.t.size && !st.t.has(v.t)) return false;
    if(q){const hay=[v.n,v.s,v.p,...v.tags,...Object.keys(v.m).map(k=>MUS[k])].join(' ').toLowerCase(); if(!hay.includes(q)) return false;}
    return true;
  });
  /* Gerakan tanpa level/rep (dari dataset) selalu di urutan bawah saat diurutkan per level/rep. */
  const lvA=v=>v.lv||9, repA=v=>firstNum(v.r)||Infinity, repD=v=>firstNum(v.r)||-1;
  const cmp={az:(a,b)=>a.n.localeCompare(b.n),za:(a,b)=>b.n.localeCompare(a.n),'lv-asc':(a,b)=>lvA(a)-lvA(b)||a.n.localeCompare(b.n),'lv-desc':(a,b)=>b.lv-a.lv||a.n.localeCompare(b.n),'rep-asc':(a,b)=>repA(a)-repA(b)||a.n.localeCompare(b.n),'rep-desc':(a,b)=>repD(b)-repD(a)||a.n.localeCompare(b.n),notes:(a,b)=>(counts[b.id]||0)-(counts[a.id]||0)};
  list.sort(cmp[st.sort]||cmp.az);
  const page=list.slice(0,st.lim);
  root.innerHTML=`<div class="resultline"><span><b>${list.length}</b> dari ${e.v.length} variasi</span></div>`+
    (list.length?(viewMode==='daftar'?vTable(page,false):`<div class="vlist">${page.map(vCard).join('')}</div>`)+moreBtn(page.length,list.length):'<div class="notice">Tidak ada variasi yang cocok dengan filter ini.</div>');
}

function viewMove(v){
  const e=v.eq;
  const act=Object.keys(v.m).sort((a,b)=>v.m[b]-v.m[a]);
  /* Variasi lain: yang otot utamanya sama lebih dulu, maksimal 30. */
  const main=act.filter(k=>v.m[k]===3);
  const share=x=>main.filter(k=>x.m[k]===3).length;
  const allSibs=e.v.filter(x=>x!==v);
  const sibs=allSibs.map(x=>[share(x),x]).sort((a,b)=>b[0]-a[0]||(a[1].src?1:0)-(b[1].src?1:0)||a[1].n.localeCompare(b[1].n)).slice(0,30).map(p=>p[1]);
  const ds=v.src==='ds';
  return `<nav class="crumbs"><a href="#database">Database</a><span>/</span><a href="#alat-${e.id}">${esc(e.n)}</a><span>/</span><span>${esc(v.n)}</span></nav>
  <header class="mvhead"><div class="setup">${esc(v.s)}</div><h1>${esc(v.n)}</h1>
    <div class="vc-meta">${metaHtml(v,`<span>${v.lv||v.t||v.p?'· ':''}${esc(e.n)}</span>`)}</div></header>
  ${ANIM.player(v.id)}
  ${movePhotos(v)}
  <div class="mvgrid">
    <section class="panel mapbig"><h2 class="lbl">Peta otot</h2>${bodySVG(v.m,true)}
      <div class="mlegend"><span><i style="background:var(--m3)"></i>Utama</span><span><i style="background:var(--m2)"></i>Pendukung</span><span><i style="background:var(--m1)"></i>Stabilisator</span></div>
      <ul class="act">${act.map(k=>`<li><span>${MUS[k]}</span><span class="bars">${[1,2,3].map(i=>`<i class="${i<=v.m[k]?'on':''}"></i>`).join('')}</span><small>${LVTXT[v.m[k]]}</small></li>`).join('')}</ul>
      ${v.mx&&v.mx.length?`<p class="hint mx">Juga melibatkan: ${v.mx.map(esc).join(', ')}</p>`:''}
    </section>
    <div class="mvmain">
      <dl class="stats">
        <div><dt>Rep / set</dt><dd class="num">${dash(v.r)}</dd></div>
        <div><dt>Tempo</dt><dd class="num" title="Turun-jeda-naik-jeda (detik)">${dash(v.te)}</dd></div>
        <div><dt>Istirahat</dt><dd class="num">${dash(v.rest)}</dd></div>
        <div><dt>Jenis</dt><dd>${dash(v.t)}</dd></div>
        <div><dt>Pola gerak</dt><dd>${dash(v.p)}</dd></div>
        <div><dt>Catatan</dt><dd class="num" data-count="${v.id}">${noteCount(v.id)}</dd></div>
      </dl>
      <div class="tags">${tagsHtml(v.tags)}</div>
      <section><h2>Cara melakukan</h2><ol class="steps"${ds?' lang="en"':''}>${v.steps.map(s=>`<li><span>${esc(s)}</span></li>`).join('')}</ol></section>
      ${v.err.length||v.tip?`<div class="split">
        ${v.err.length?`<section><h2>Kesalahan umum</h2><ul class="errs">${v.err.map(s=>`<li><span>${esc(s)}</span></li>`).join('')}</ul></section>`:''}
        ${v.tip?`<section><h2>Tips</h2><p class="tip">${esc(v.tip)}</p></section>`:''}
      </div>`:''}
      ${ds?`<p class="hint src">Gerakan ini dari <a href="https://github.com/hasaneyldrm/exercises-dataset" target="_blank" rel="noopener">exercises-dataset</a> (© Hasan Emir Yıldırım, lisensi MIT); langkahnya masih dalam bahasa Inggris. Level, rep, tempo, dan istirahat belum diisi. Punya data yang tepat? Tulis sebagai saran di bawah.</p>`:''}
      ${sibs.length?`<section><h2 class="lbl" style="margin-bottom:8px">Variasi lain di ${esc(e.n)}</h2><div class="sibs">${sibs.map(x=>`<a class="chip" href="#gerakan-${x.id}">${esc(x.n)}</a>`).join('')}${allSibs.length>sibs.length?`<a class="chip" href="#alat-${e.id}">Lihat semua ${e.v.length} →</a>`:''}</div></section>`:''}
    </div>
  </div>
  ${notesSection(v.id,['catatan','saran'],'Catatan & saran','Bagikan pengalamanmu memakai gerakan ini, atau beri saran bila ada langkah yang kurang tepat.')}`;
}
function notesSection(v,kinds,title,desc){
  if(v===WEB) return `<section class="notes comments" id="catatan">
    <div class="comments-head"><span class="ico">${CHAT_I}</span><div><h2>${title} <span class="cnt" id="notes-total" data-v="${v}"></span></h2><p class="hint">${desc}</p></div></div>
    <div class="comments-body">
    <div id="compose-root" data-v="${v}" data-kinds="${kinds.join(',')}"></div>
    <div class="seg" role="group" aria-label="Saring entri"><button type="button" data-tab="semua" aria-pressed="${noteTab==='semua'}">Semua</button>${kinds.map(k=>`<button type="button" data-tab="${k}" aria-pressed="${noteTab===k}">${KINDS[k]}</button>`).join('')}</div>
    <div id="notes-root" data-v="${v}"></div></div>
  </section>`;
  return `<section class="notes" id="catatan">
    <div class="notes-head"><div><h2>${title}</h2><p class="hint" style="margin:4px 0 0">${desc}</p></div><span class="lbl" id="notes-total" data-v="${v}"></span></div>
    <div id="compose-root" data-v="${v}" data-kinds="${kinds.join(',')}"></div>
    <div class="seg" role="group" aria-label="Saring entri"><button type="button" data-tab="semua" aria-pressed="${noteTab==='semua'}">Semua</button>${kinds.map(k=>`<button type="button" data-tab="${k}" aria-pressed="${noteTab===k}">${KINDS[k]}</button>`).join('')}</div>
    <div id="notes-root" data-v="${v}"></div>
  </section>`;
}
function viewSaran(){
  return `<div class="pagehead"><div class="lbl">Saran</div><h1>Bantu lengkapi RepData</h1><p>Usulkan alat atau variasi gerakan yang belum ada, atau laporkan data yang menurutmu keliru. Untuk masukan tentang satu gerakan tertentu, tulis langsung di halaman gerakan tersebut.</p></div>
  ${notesSection('_site',['gerakan','alat','koreksi'],'Kotak saran','Semua orang yang membuka halaman ini bisa membaca saran yang masuk.')}`;
}
function viewMissing(){return `<div class="pagehead"><h1>Halaman tidak ditemukan</h1><p>Alamat ini tidak cocok dengan alat atau gerakan mana pun.</p></div><a class="btn" href="#database">Kembali ke database</a>`;}


/* ============ AKUN ============
   Supabase: login lewat Supabase Auth dengan username saja (email buatan di
   belakang layar), username tampil dari tabel profiles.
   Mode lokal (config.js kosong): akun & hash password di localStorage browser ini. */
let members={}, account=null, acctReady=false, acctErr=false;
let acctTab='masuk', authBack=null, pendingScroll=null;
let EMAIL_DOMAIN='users.repdata.invalid';
const SESS='rd-sess';
let sessId=store(SESS);
const U_RE=/^[A-Za-z0-9][A-Za-z0-9_.]{2,19}$/;
const PW_MIN=8, PW_MAX=72, PBKDF2_IT=150000;
const U_RULE='Username harus 3–20 karakter (huruf, angka, titik, garis bawah) dan diawali huruf atau angka.';
const uerr=m=>Object.assign(new Error(m),{userMsg:m});
const uname=id=>(id&&members[id]&&members[id].u)||'Anggota';
/* Foto profil: Supabase -> members[id].av = versi (angka), file di bucket avatars/<id>.jpg.
   Mode lokal -> members[id].av = data URL JPEG di localStorage. */
function avatarUrl(uid){
  const m=uid&&members[uid]; if(!m||!m.av) return '';
  if(typeof m.av==='string') return m.av;
  return SB?SB.storage.from('avatars').getPublicUrl(uid+'.jpg').data.publicUrl+'?v='+m.av:'';
}
const avatar=(name,cls='',uid)=>{
  const url=avatarUrl(uid), ch=esc(String(name||'?').charAt(0));
  return url?`<span class="av ${cls}" aria-hidden="true"><img src="${esc(url)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">${ch}</span>`:`<span class="av ${cls}" aria-hidden="true">${ch}</span>`;
};
const AV_DATA=/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
function cleanMember(x){
  if(!x||typeof x.u!=='string'||!x.u) return null;
  const u=x.u.slice(0,20);
  return {u,ulc:typeof x.ulc==='string'?x.ulc:u.toLowerCase(),at:typeof x.at==='number'?x.at:0,adm:false,av:typeof x.av==='string'&&AV_DATA.test(x.av)?x.av:null};
}
function memberFromRow(p){
  const u=String(p.username).slice(0,20);
  return {u,ulc:u.toLowerCase(),at:Date.parse(p.created_at)||0,adm:p.is_admin===true,av:Number.isFinite(p.avatar_v)?p.avatar_v:null};
}
/* Kolom baru belum ada di database (schema.sql belum dijalankan ulang). */
const isMissingCol=e=>!!e&&(e.code==='42703'||e.code==='PGRST204'||/column .* does not exist|could not find the .* column/i.test(String(e.message||'')));
function errMsg(e){
  if(e&&e.userMsg) return e.userMsg;
  const m=String(e&&e.message||'');
  if(e&&(e.status===429||/rate limit/i.test(m))) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  if(/fetch|network/i.test(m)) return 'Tidak bisa terhubung ke server. Periksa koneksi internet lalu coba lagi.';
  return 'Gagal memproses. Coba lagi sebentar lagi.';
}

/* ---- Supabase ---- */
async function setUserFromSession(s){
  const u=s&&s.user;
  if(!u){account=null; acctReady=true; return;}
  let p=members[u.id];
  if(!p){
    const q=cols=>SB.from('profiles').select(cols).eq('id',u.id).maybeSingle();
    let {data,error}=await q('username,created_at,is_admin,avatar_v');
    if(error&&isMissingCol(error)){schemaOld=true; ({data,error}=await q('username,created_at'));}
    if(data){p=memberFromRow(data); members[u.id]=p;}
    else if(error) console.error(error);
  }
  account=p?{id:u.id,...p}:null; acctReady=true;
}
const SupaAuth={
  emailFor(u){return u.trim().toLowerCase()+'@'+EMAIL_DOMAIN;},
  async register(u,p){
    const {error}=await SB.rpc('register_user',{p_username:u,p_password:p});
    if(error){
      const m=String(error.message||'');
      if(/USERNAME_TAKEN/.test(m)||error.code==='23505') throw uerr('Username sudah dipakai. Coba yang lain.');
      if(/USERNAME_INVALID/.test(m)) throw uerr(U_RULE);
      if(/PASSWORD_INVALID/.test(m)) throw uerr(`Password harus ${PW_MIN}–${PW_MAX} karakter.`);
      if(error.code==='PGRST202') throw uerr('Database belum disiapkan. Jalankan supabase/schema.sql di SQL Editor Supabase.');
      throw error;
    }
    await this.login(u,p);
  },
  async login(u,p){
    const {data,error}=await SB.auth.signInWithPassword({email:this.emailFor(u),password:p});
    if(error){
      if(error.status===400||/invalid login credentials/i.test(error.message||'')) throw uerr('Username atau password salah.');
      throw error;
    }
    await setUserFromSession(data.session);
    if(!account){await SB.auth.signOut(); throw uerr('Profil akun ini tidak ditemukan. Hubungi admin RepData.');}
  },
  async change(p){
    const {error}=await SB.auth.updateUser({password:p});
    if(error){
      if(/different from the old/i.test(error.message||'')) throw uerr('Password baru harus berbeda dari password lama.');
      throw error;
    }
  },
  async logout(){try{await SB.auth.signOut();}catch(e){} account=null;},
  async setAvatar(blob){
    const path=account.id+'.jpg', bucket=SB.storage.from('avatars');
    const res=blob?await bucket.upload(path,blob,{upsert:true,contentType:'image/jpeg',cacheControl:'31536000'}):await bucket.remove([path]);
    if(res.error) throw avatarErr(res.error);
    const v=blob?Date.now():null;
    const {error}=await SB.from('profiles').update({avatar_v:v}).eq('id',account.id);
    if(error) throw avatarErr(error);
    members[account.id].av=v;
  }
};
function avatarErr(e){
  const m=String(e&&e.message||'');
  if(isMissingCol(e)||/bucket not found/i.test(m)) return uerr('Penyimpanan foto belum disiapkan. Admin perlu menjalankan ulang supabase/schema.sql di Supabase.');
  if(/payload too large|exceeded the maximum/i.test(m)) return uerr('Foto terlalu besar setelah dikecilkan. Coba foto lain.');
  if(/row-level security|unauthorized|jwt/i.test(m)) return uerr('Sesi kamu sudah berakhir. Keluar lalu masuk lagi.');
  return e;
}

/* ---- Mode lokal ---- */
function setSession(id){sessId=id; if(id) store(SESS,id); else storeDel(SESS);}
const b64=buf=>btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function hashPw(pw,saltB64,it){
  if(!(window.crypto&&crypto.subtle)) throw uerr('Browser ini tidak mendukung enkripsi password. Buka lewat https atau pakai browser lain.');
  it=it||PBKDF2_IT;
  const salt=saltB64?unb64(saltB64):crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:it},key,256);
  return {salt:saltB64||b64(salt),hash:b64(bits),it};
}
const LocalAuth={
  KEY:'rd-accounts',
  read(){try{return JSON.parse(localStorage.getItem(this.KEY)||'{}')||{}}catch(e){return {}}},
  write(o){try{localStorage.setItem(this.KEY,JSON.stringify(o)); return true;}catch(e){return false}},
  load(){
    const o=this.read(); members={};
    Object.values(o).forEach(a=>{const m=cleanMember(a); if(m&&a.id) members[a.id]=m;});
    account=sessId&&members[sessId]?{id:sessId,...members[sessId]}:null; acctReady=true;
  },
  async register(u,p){
    const ulc=u.toLowerCase(), o=this.read();
    if(o[ulc]) throw uerr('Username sudah dipakai. Coba yang lain.');
    o[ulc]={id:'loc-'+ulc,u,ulc,at:Date.now(),...(await hashPw(p))};
    if(!this.write(o)) throw uerr('Browser ini memblokir penyimpanan lokal, jadi akun tidak bisa disimpan.');
    setSession(o[ulc].id); this.load();
  },
  async login(u,p){
    const a=this.read()[u.trim().toLowerCase()];
    if(!a||(await hashPw(p,a.salt,a.it)).hash!==a.hash) throw uerr('Username atau password salah.');
    setSession(a.id); this.load();
  },
  async change(p){
    const o=this.read(), k=Object.keys(o).find(k=>o[k].id===sessId);
    if(!k) throw uerr('Masuk dulu untuk mengganti password.');
    Object.assign(o[k],await hashPw(p));
    if(!this.write(o)) throw uerr('Browser ini memblokir penyimpanan lokal, jadi password tidak bisa disimpan.');
  },
  logout(){setSession(null); account=null;},
  async setAvatar(blob){
    const o=this.read(), k=Object.keys(o).find(k=>o[k].id===sessId);
    if(!k) throw uerr('Masuk dulu untuk mengganti foto.');
    if(blob) o[k].av=await new Promise((ok,no)=>{const r=new FileReader(); r.onload=()=>ok(r.result); r.onerror=()=>no(uerr('Foto tidak bisa dibaca.')); r.readAsDataURL(blob);});
    else delete o[k].av;
    if(!this.write(o)) throw uerr('Penyimpanan browser penuh atau diblokir, jadi foto tidak bisa disimpan.');
    this.load();
  }
};
let AUTH=LocalAuth;

/* ---- Tampilan akun ---- */
function updateAcctLink(){
  const a=$('#acct-link'); if(!a) return;
  const html=account?`${avatar(account.u,'',account.id)}<span>${esc(account.u)}</span>`:'<span>Masuk</span>';
  if(a.dataset.html===html) return;
  a.dataset.html=html; a.innerHTML=html; a.classList.toggle('out',!account);
  a.setAttribute('aria-label',account?`Akun ${account.u}`:'Masuk atau daftar');
}
function acctKey(){
  if(!capsReady||!acctReady) return 'load';
  if(acctErr) return 'err';
  if(account) return 'in:'+account.id+':'+(acctTab==='ganti'?'g':'');
  return 'out:'+(acctTab==='daftar'?'daftar':'masuk');
}
const field=(id,label,type,ac,hint)=>`<div class="field"><label for="${id}">${label}</label>
  <input id="${id}" name="${id}" type="${type}" autocomplete="${ac}"${type==='text'?' autocapitalize="none" spellcheck="false" maxlength="20"':` maxlength="${PW_MAX}"`}>
  ${hint?`<span class="hint">${hint}</span>`:''}</div>`;
const LOCAL_NOTE='<p class="hint">Mode lokal: Supabase belum diatur di config.js, jadi akun dan catatan hanya tersimpan di browser ini.</p>';

function viewAccount(){return '<div id="acct-root"></div>';}
function renderAccount(force){
  const root=$('#acct-root'); if(!root) return;
  const key=acctKey();
  if(force||root.dataset.key!==key){root.dataset.key=key; root.innerHTML=accountHtml(key);}
  renderMine(); renderPhotoField();
}
function accountHtml(key){
  const base=key.split(':')[0];
  const head=(t,p)=>`<div class="pagehead"><div class="lbl">Akun</div><h1>${t}</h1>${p?`<p>${p}</p>`:''}</div>`;
  if(base==='load') return head('Akun')+'<div class="empty">Memeriksa akun…</div>';
  if(base==='err') return head('Akun','Layanan akun tidak bisa dimuat saat ini. Muat ulang halaman sebentar lagi.');
  if(base==='in'){
    const joined=account.at?'Bergabung '+new Date(account.at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})+'.':'';
    const changing=key.endsWith(':g');
    return `<div class="profhead">${avatar(account.u,'lg',account.id)}<div><div class="lbl">Akun</div><h1>${esc(account.u)}</h1><p class="hint">${joined}</p></div>
      <div class="profbtns"><button class="btn sm" type="button" data-atab="${changing?'masuk':'ganti'}">${changing?'Batal':'Ganti password'}</button><button class="btn sm" type="button" id="logout">Keluar</button></div></div>
      ${changing?`<section class="panel auth-card pw-card"><h2 class="lbl">Ganti password</h2>
        <form id="auth-form" data-mode="ganti" novalidate>
          ${field('au-pass','Password baru','password','new-password',`${PW_MIN}–${PW_MAX} karakter.`)}
          ${field('au-pass2','Ulangi password baru','password','new-password')}
          <p class="ferr" id="auth-err" role="alert"></p>
          <button class="btn primary" type="submit">Simpan password</button></form></section>`:''}
      ${schemaOld?'':'<section class="panel avpanel"><h2 class="lbl">Foto profil</h2><div id="av-root"></div></section>'}
      ${REMOTE?'':LOCAL_NOTE}
      <dl class="pstats" id="my-stats"></dl>
      <section class="sect"><h2>Tulisan kamu</h2><div id="my-notes"></div></section>`;
  }
  const tab=acctTab==='daftar'?'daftar':'masuk';
  const form=tab==='daftar'
    ? `<form id="auth-form" data-mode="daftar" novalidate>
      ${field('au-user','Username','text','username','3–20 karakter: huruf, angka, titik, atau garis bawah. Tampil di setiap catatanmu dan tidak bisa diganti.')}
      ${field('au-pass','Password','password','new-password',`${PW_MIN}–${PW_MAX} karakter. Simpan baik-baik: tanpa email, password tidak bisa dipulihkan sendiri.`)}
      ${field('au-pass2','Ulangi password','password','new-password')}
      <p class="ferr" id="auth-err" role="alert"></p>
      <button class="btn primary block" type="submit">Buat akun</button>
      <p class="hint alt">Sudah punya akun? <button type="button" class="link" data-atab="masuk">Masuk</button></p></form>`
    : `<form id="auth-form" data-mode="masuk" novalidate>
      ${field('au-user','Username','text','username')}
      ${field('au-pass','Password','password','current-password')}
      <p class="ferr" id="auth-err" role="alert"></p>
      <button class="btn primary block" type="submit">Masuk</button>
      <p class="hint alt">Belum punya akun? <button type="button" class="link" data-atab="daftar">Daftar</button></p>
      <p class="hint alt">Lupa password? Minta admin RepData mengatur ulang.</p></form>`;
  const tabs=`<div class="seg auth-tabs" role="group" aria-label="Pilih"><button type="button" data-atab="masuk" aria-pressed="${tab==='masuk'}">Masuk</button><button type="button" data-atab="daftar" aria-pressed="${tab==='daftar'}">Daftar</button></div>`;
  const back=authBack&&authBack.startsWith('gerakan-')&&BYID[authBack.slice(8)]?`<p class="hint" style="margin:0">Setelah masuk, kamu kembali ke <b>${esc(BYID[authBack.slice(8)].n)}</b>.</p>`:'';
  return `<nav class="crumbs"><a href="#beranda">Beranda</a><span>/</span><span>Akun</span></nav>
  <div class="auth">
    <section class="panel auth-card"><h1>${tab==='daftar'?'Daftar':'Masuk'}</h1>${tabs}${back}${form}</section>
    <aside class="auth-why"><h2 class="lbl">Dengan akun RepData kamu bisa</h2>
      <ul><li><span>Menulis catatan pengalaman di setiap gerakan.</span></li><li><span>Memberi saran perbaikan langkah, tempo, atau data otot.</span></li><li><span>Mengusulkan alat dan variasi gerakan baru di halaman Saran.</span></li><li><span>Menghapus tulisanmu sendiri kapan saja.</span></li></ul>
      <p class="hint">Tanpa akun kamu tetap bisa membuka database dan membaca semua catatan.</p>
      ${REMOTE?'':LOCAL_NOTE}
    </aside>
  </div>`;
}
function renderMine(){
  const list=$('#my-notes'), st=$('#my-stats'); if(!list||!account) return;
  const mine=notes.filter(n=>n.by===account.id);
  const c=k=>mine.filter(n=>n.k===k).length;
  if(st) st.innerHTML=`<div><dt>Total tulisan</dt><dd class="num">${mine.length}</dd></div><div><dt>Catatan & komentar</dt><dd class="num">${c('catatan')+c('komentar')}</dd></div><div><dt>Saran & kritik</dt><dd class="num">${c('saran')+c('koreksi')+c('kritik')}</dd></div><div><dt>Usulan</dt><dd class="num">${c('alat')+c('gerakan')}</dd></div>`;
  if(notesState==='loading'){list.innerHTML='<div class="empty">Memuat tulisanmu…</div>';return;}
  list.innerHTML=mine.length?`<div class="nlist">${mine.map(n=>noteHtml(n,true)).join('')}</div>`:'<div class="notice">Kamu belum menulis apa pun. Buka gerakan di <a href="#database">Database</a> lalu tulis catatan di bagian bawah halamannya.</div>';
}

async function doAuth(f){
  const mode=f.dataset.mode, err=$('#auth-err'), btn=f.querySelector('button[type="submit"]');
  const val=id=>{const el=f.querySelector('#'+id); return el?el.value:'';};
  f.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  const fail=(m,id)=>{err.textContent=m; const el=id&&f.querySelector('#'+id); if(el){el.setAttribute('aria-invalid','true'); el.focus();}};
  const u=val('au-user').trim(), p=val('au-pass'), p2=val('au-pass2');
  err.textContent='';
  if(mode==='masuk'&&!u) return fail('Isi username kamu.','au-user');
  if(mode==='masuk'&&!p) return fail('Isi password kamu.','au-pass');
  if(mode==='daftar'&&!U_RE.test(u)) return fail(U_RULE,'au-user');
  if(mode!=='masuk'&&(p.length<PW_MIN||p.length>PW_MAX)) return fail(`Password harus ${PW_MIN}–${PW_MAX} karakter.`,'au-pass');
  if(mode!=='masuk'&&p!==p2) return fail('Kedua password tidak sama. Ketik ulang.','au-pass2');
  btn.disabled=true; const label=btn.textContent; btn.textContent='Memproses…';
  try{
    if(mode==='daftar') await AUTH.register(u,p);
    else if(mode==='masuk') await AUTH.login(u,p);
    else await AUTH.change(p);
  }catch(e){
    if(!(e&&e.userMsg)) console.error(e);
    fail(errMsg(e)); if(btn.isConnected){btn.disabled=false; btn.textContent=label;}
    return;
  }
  acctTab='masuk';
  if(mode==='ganti'){toast('Password baru tersimpan.'); renderAccount(true); return;}
  toast(mode==='daftar'?`Akun ${account.u} dibuat. Selamat datang!`:`Halo, ${account.u}!`);
  const back=authBack; authBack=null;
  if(back&&back!=='akun'){pendingScroll='catatan'; location.hash=back;}
  else{refreshNotesUI(); renderAccount(true);}
}

/* ============ MODE LOKAL ============
   Dipakai bila config.js belum berisi data Supabase: akun dan catatan
   disimpan di localStorage browser ini saja. Tidak terkirim ke orang lain. */
function initLocal(){
  const KEY='rd-notes';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}};
  const write=arr=>{try{localStorage.setItem(KEY,JSON.stringify(arr))}catch(e){}};
  const subs=new Set();
  const emit=()=>{const arr=read().sort((a,b)=>b.at-a.at);
    const snap={docs:arr.map(x=>({id:x.id,data:()=>x})),metadata:{fromCache:false,hasPendingWrites:false}};
    subs.forEach(f=>f(snap));};
  const coll={orderBy(){return coll},limit(){return coll},
    onSnapshot(f){subs.add(f); setTimeout(emit,0); return ()=>subs.delete(f);},
    async add(d){const arr=read(); const id='n'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); arr.push({...d,id}); write(arr); emit(); return {id};}};
  NOTES={add:d=>coll.add(d), async remove(id){write(read().filter(x=>x.id!==id)); emit();},
    async pin(id,on){write(read().map(x=>x.id===id?{...x,pin:on}:x)); emit();}};
  capsReady=true;
  AUTH=LocalAuth; LocalAuth.load();
  coll.onSnapshot(snap=>{notes=snap.docs.map(cleanNote).filter(Boolean); notesState='ready'; rebuildCounts(); refreshNotesUI();});
}

/* ============ FOTO PROFIL ============
   Foto dipotong persegi di tengah dan dikecilkan ke 256 px JPEG (sekitar
   20 KB) di browser, jadi yang diunggah selalu kecil walau aslinya 5 MB. */
const PHOTO_MAX=5*1024*1024, PHOTO_PX=256;
let avBusy=false;
async function squarePhoto(file){
  if(!/^image\//.test(file.type||'')) throw uerr('File harus berupa gambar (JPG, PNG, atau WebP).');
  if(file.size>PHOTO_MAX) throw uerr('Ukuran foto maksimal 5 MB.');
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((ok,no)=>{const i=new Image(); i.onload=()=>ok(i); i.onerror=()=>no(uerr('Foto tidak bisa dibaca. Coba format JPG atau PNG.')); i.src=url;});
    const w=img.naturalWidth, h=img.naturalHeight, side=Math.min(w,h);
    if(!side) throw uerr('Foto tidak bisa dibaca. Coba format JPG atau PNG.');
    const c=document.createElement('canvas'); c.width=c.height=PHOTO_PX;
    const g=c.getContext('2d'); g.fillStyle='#ffffff'; g.fillRect(0,0,PHOTO_PX,PHOTO_PX);
    g.drawImage(img,(w-side)/2,(h-side)/2,side,side,0,0,PHOTO_PX,PHOTO_PX);
    const blob=await new Promise(ok=>c.toBlob(ok,'image/jpeg',0.85));
    if(!blob) throw uerr('Foto tidak bisa diproses di browser ini.');
    return blob;
  }finally{URL.revokeObjectURL(url);}
}
async function changePhoto(file){
  if(!account||!AUTH.setAvatar||avBusy) return;
  avBusy=true; renderPhotoField();
  try{
    await AUTH.setAvatar(file?await squarePhoto(file):null);
    toast(file?'Foto profil diperbarui.':'Foto profil dihapus.');
  }catch(e){if(!(e&&e.userMsg)) console.error(e); toast(errMsg(e));}
  avBusy=false;
  const as=$('#as-av'); if(as&&account) as.innerHTML=avatar(account.u,'',account.id);
  refreshNotesUI(); if($('#acct-root')) renderAccount(true);
}
function renderPhotoField(){
  const root=$('#av-root'); if(!root) return;
  const url=account?avatarUrl(account.id):'';
  const key=(account?account.id:'-')+'|'+url+'|'+avBusy;
  if(root.dataset.key===key) return; root.dataset.key=key;
  if(!account){root.innerHTML='';return;}
  const input='<input type="file" id="av-file" class="vh" accept="image/jpeg,image/png,image/webp,image/*">';
  if(avBusy){root.innerHTML='<div class="avpick"><div class="avdrop busy">Memproses foto…</div></div>';return;}
  root.innerHTML=url
    ? `<div class="avpick has">${avatar(account.u,'md',account.id)}<div class="avtxt"><b>Foto profilmu</b><span class="hint">Tampil di semua tulisanmu.</span></div>
        <div class="avbtns">${input}<label class="btn sm" for="av-file">Ganti</label><button class="ghost" type="button" data-av-del>Hapus</button></div></div>`
    : `<div class="avpick">${input}<label class="avdrop" for="av-file">${IMG_I}Pilih foto profil</label><span class="hint">Maks. 5 MB. Dipotong persegi otomatis dan tampil di semua tulisanmu.</span></div>`;
}

/* ============ ROUTER ============ */
let lastRoute=null;
function route(){
  const h=decodeURIComponent(location.hash.slice(1));
  const app=$('#app'); let nav='beranda';
  if(h!==lastRoute){noteTab='semua'; webLim=PAGE_WEB;}
  if(!h||h==='beranda'){app.innerHTML=viewHome();}
  else if(h==='database'){app.innerHTML=viewDatabase(); renderDbBody(); nav='database';}
  else if(h==='saran'){app.innerHTML=viewSaran(); nav='saran';}
  else if(h==='akun'){app.innerHTML=viewAccount(); nav='akun';}
  else if(h.startsWith('alat-')&&EQBY[h.slice(5)]){app.innerHTML=viewEquip(EQBY[h.slice(5)]); renderEqBody(); nav='database';}
  else if(h.startsWith('gerakan-')&&BYID[h.slice(8)]){app.innerHTML=viewMove(BYID[h.slice(8)]); nav='database';}
  else {app.innerHTML=viewMissing(); nav='database';}
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===nav) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');});
  if(h!==lastRoute) window.scrollTo(0,0);
  lastRoute=h;
  refreshNotesUI();
  if(pendingScroll){const el=document.getElementById(pendingScroll); pendingScroll=null; if(el) el.scrollIntoView({block:'start'}); const ta=$('#note-text'); if(ta) ta.focus({preventScroll:true});}
}
window.addEventListener('hashchange',route);

/* ============ EVENTS ============ */
document.addEventListener('input',ev=>{
  const t=ev.target;
  if(t.id==='db-q'){dbState.q=t.value; dbState.lim=PAGE; renderDbBody();}
  else if(t.id==='eq-q'){const st=getEq($('#eq-body').dataset.eq); st.q=t.value; st.lim=PAGE; renderEqBody();}
  else if(t.id==='note-text'){$('#note-hint').textContent=`${t.value.length}/600 karakter`;}
});
document.addEventListener('change',ev=>{
  if(ev.target.id==='av-file'){const f=ev.target.files&&ev.target.files[0]; ev.target.value=''; if(f) changePhoto(f); return;}
  if(ev.target.id==='eq-sort'){const st=getEq($('#eq-body').dataset.eq); st.sort=ev.target.value; st.lim=PAGE; renderEqBody();}
});
document.addEventListener('click',async ev=>{
  const a=ev.target.closest('a[data-auth]');
  if(a){acctTab=a.dataset.auth; authBack=a.dataset.back||null; if(location.hash==='#akun') renderAccount(true); return;}
  const b=ev.target.closest('button'); if(!b) return;
  if(b.dataset.atab){acctTab=b.dataset.atab; renderAccount(true); const first=$('#auth-form input'); if(first) first.focus(); return;}
  if(b.id==='logout'){await AUTH.logout(); acctTab='masuk'; toast('Kamu sudah keluar.'); refreshNotesUI(); return;}
  if(b.dataset.view){viewMode=b.dataset.view; store('rd-view',viewMode);
    document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.view===viewMode));
    renderEqBody(); renderDbBody(); refreshNotesUI(); return;}
  if(b.dataset.gm){dbState.mus = dbState.mus===b.dataset.gm?null:b.dataset.gm; dbState.lim=PAGE;
    document.querySelectorAll('[data-gm]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.gm===dbState.mus)); renderDbBody(); refreshNotesUI(); return;}
  if(b.hasAttribute('data-clear-db')){dbState.q='';dbState.mus=null;dbState.lim=PAGE; route(); return;}
  if(b.hasAttribute('data-more')){const eb=$('#eq-body'); if(eb){getEq(eb.dataset.eq).lim+=PAGE; renderEqBody();} else {dbState.lim+=PAGE; renderDbBody();} refreshNotesUI(); return;}
  if(b.id==='eq-filter'){const st=getEq($('#eq-body').dataset.eq); st.open=!st.open; $('#eq-filters').hidden=!st.open; b.setAttribute('aria-expanded',st.open); return;}
  if(b.dataset.f){const st=getEq($('#eq-body').dataset.eq); const set=st[b.dataset.f]; const val=b.dataset.val;
    set.has(val)?set.delete(val):set.add(val); st.lim=PAGE; b.setAttribute('aria-pressed',set.has(val)); updFilterCount(st); renderEqBody(); refreshNotesUI(); return;}
  if(b.hasAttribute('data-clear-eq')){const st=getEq($('#eq-body').dataset.eq); st.mus.clear();st.lv.clear();st.t.clear();st.lim=PAGE;
    document.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed','false')); updFilterCount(st); renderEqBody(); refreshNotesUI(); return;}
  if(b.hasAttribute('data-av-del')){changePhoto(null); return;}
  if(b.hasAttribute('data-cmore')){webLim+=PAGE_WEB; renderNoteList(); return;}
  if(b.dataset.pin){b.disabled=true;
    try{await NOTES.pin(b.dataset.pin,b.dataset.on==='1'); toast(b.dataset.on==='1'?'Komentar disematkan.':'Sematan dilepas.');}
    catch(e){b.disabled=false; if(!(e&&e.userMsg)) console.error(e); toast(errMsg(e));}
    return;}
  if(b.dataset.tab){noteTab=b.dataset.tab; webLim=PAGE_WEB; document.querySelectorAll('[data-tab]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tab===noteTab)); renderNoteList(); return;}
  if(b.dataset.del){
    if(!b.hasAttribute('data-armed')){b.setAttribute('data-armed',''); b.textContent='Yakin? Klik lagi'; setTimeout(()=>{if(b.isConnected){b.removeAttribute('data-armed'); b.textContent='Hapus';}},3500); return;}
    b.disabled=true;
    try{await NOTES.remove(b.dataset.del); toast('Entri dihapus');}
    catch(e){b.disabled=false; toast('Gagal menghapus. Coba lagi sebentar lagi.');}
  }
});
function updFilterCount(st){const n=st.mus.size+st.lv.size+st.t.size; const b=$('#eq-filter'); if(b) b.textContent='Filter'+(n?` (${n})`:'');}

document.addEventListener('submit',async ev=>{
  if(ev.target.id==='auth-form'){ev.preventDefault(); doAuth(ev.target); return;}
  if(ev.target.id!=='note-form') return;
  ev.preventDefault();
  const f=ev.target; const ta=$('#note-text'); const text=ta.value.trim();
  if(!text){toast('Tulis isi catatan dulu.'); ta.focus(); return;}
  if(!NOTES||!account){toast('Masuk dulu untuk menulis catatan.'); return;}
  const k=(f.querySelector('input[name="nk"]:checked')||{}).value||'catatan';
  const btn=$('#note-send'); const label=btn.innerHTML; btn.disabled=true; btn.textContent='Mengirim…';
  try{
    await NOTES.add({v:f.dataset.v,k,text:text.slice(0,600),by:account.id,at:Date.now()});
    ta.value=''; $('#note-hint').textContent='0/600 karakter'; toast('Terkirim. Terima kasih!');
  }catch(e){
    console.error(e);
    toast(e&&e.code==='42501'?'Sesi kamu sudah berakhir. Keluar lalu masuk lagi.':e&&e.code==='23514'?'Database belum diperbarui. Admin perlu menjalankan ulang supabase/schema.sql.':'Gagal mengirim. Periksa koneksi lalu coba lagi.');
  }
  if(btn.isConnected){btn.disabled=false; btn.innerHTML=label;}
});

new MutationObserver(ms=>{if(ms.some(m=>!(m.target.closest&&m.target.closest('.dyn')))) ANIM.mount($('#app'));}).observe($('#app'),{childList:true,subtree:true});
route();
ANIM.mount($('#app'));
initBackend();
