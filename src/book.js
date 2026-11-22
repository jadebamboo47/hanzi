// 汉字 Schreibkarten – Buch-Bereich (Lehrbuch & Arbeitsbuch)
// Buchinhalte kommen NICHT aus dem Repo, sondern aus Lektionspaketen, die der Nutzer selbst importiert.
// Sie werden nur lokal in IndexedDB gespeichert.
(function(){
"use strict";
const HZ=window.HZ; if(!HZ) return;
const $=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const PKEY='hanzi-book-v1';

// ---------------------------------------------------------------- storage
let P={ex:{},open:{},rate:{},view:{py:true,de:false},last:null};
try{ const o=JSON.parse(localStorage.getItem(PKEY)||'null'); if(o) P={...P,...o,view:{...P.view,...(o.view||{})}}; }catch(e){}
function saveP(){ try{ localStorage.setItem(PKEY,JSON.stringify(P)); }catch(e){} }

let dbp=null;
function db(){
  if(dbp) return dbp;
  dbp=new Promise((res,rej)=>{ const r=indexedDB.open('hanzi-book',1);
    r.onupgradeneeded=()=>{ r.result.createObjectStore('packs',{keyPath:'id'}); };
    r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
  return dbp;
}
async function tx(mode,fn){ const d=await db(); return new Promise((res,rej)=>{ const t=d.transaction('packs',mode); const st=t.objectStore('packs'); let out; Promise.resolve(fn(st)).then(v=>out=v); t.oncomplete=()=>res(out); t.onerror=()=>rej(t.error||new Error('Speichern fehlgeschlagen')); t.onabort=()=>rej(t.error||new Error('Speichern abgebrochen')); }); }
const req=r=>new Promise((res,rej)=>{ r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
async function listPacks(){ return tx('readonly',st=>req(st.getAll())); }
async function putPack(p){ return tx('readwrite',st=>req(st.put(p))); }
async function delPack(id){ return tx('readwrite',st=>req(st.delete(id))); }
try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){}

function b64toBlob(s){
  const m=s.match(/^data:([^;]+);base64,(.*)$/); const mime=m?m[1]:'application/octet-stream'; const b=atob(m?m[2]:s);
  const a=new Uint8Array(b.length); for(let i=0;i<b.length;i++) a[i]=b.charCodeAt(i); return {type:mime,buf:a.buffer};
}
async function importFile(file){
  const txt=await file.text(); let o;
  try{ o=JSON.parse(txt); }catch(e){ throw new Error('Die Datei ist kein Lektionspaket.'); }
  if(!o||!o.id||!o.parts) throw new Error('Die Datei ist kein Lektionspaket.');
  const media={}; for(const [k,v] of Object.entries(o.media||{})) media[k]=b64toBlob(v);
  delete o.media; o.mediaBlobs=media; o.imported=Date.now();
  await putPack(o); return o;
}

// ---------------------------------------------------------------- UI shell
const css=`
#book{position:fixed;inset:0;z-index:15;background:var(--paper);display:none;flex-direction:column}
#book.show{display:flex}
#book .bk-top{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--line);background:var(--paper)}
#book .bk-top h2{font:600 21px var(--fh,Fraunces),serif;margin:0;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#book .bk-body{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:18px 20px 60px}
#book .bk-wrap{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.bk-pack{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px}
.bk-pack h3{margin:0 0 2px;font:600 22px var(--fh,Fraunces),serif}
.bk-pack .sub{color:var(--ink3);font-size:14px;margin-bottom:10px}
.bk-part{margin-top:12px}
.bk-part h4{margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3)}
.bk-sec{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--paper);margin-bottom:8px;font-size:16px}
.bk-sec .pg{color:var(--ink3);font-size:13px;white-space:nowrap}
.bk-sec .t{flex:1}
.bk-sec .pr{font-size:13px;color:var(--ink3);white-space:nowrap}
.bk-sec.done{border-color:var(--jade)} .bk-sec.done .pr{color:var(--jade);font-weight:600}
.bk-bar{height:4px;border-radius:2px;background:var(--paper2);overflow:hidden;width:60px}.bk-bar i{display:block;height:100%;background:var(--jade)}
.bk-empty{text-align:center;color:var(--ink2);line-height:1.55;padding:30px 10px}
.bk-empty .big{font-family:"Noto Serif SC",serif;font-size:90px;color:var(--seal);line-height:1}
.bk-ex{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;scroll-margin-top:10px}
.bk-ex.ok{border-color:var(--jade);box-shadow:0 0 0 2px var(--jade-soft)}
.bk-ex .hd{display:flex;gap:10px;align-items:flex-start}
.bk-ex .no{flex:none;min-width:28px;height:28px;border-radius:8px;background:var(--ink);color:var(--paper);font-weight:600;font-size:14px;display:grid;place-items:center;padding:0 6px}
.bk-ex .ti{flex:1;font-weight:600;font-size:16.5px;line-height:1.35}
.bk-ex .ti small{display:block;font-weight:400;color:var(--ink2);margin-top:3px;font-size:15px}
.bk-ex .bd{margin-top:12px}
.bk-ex .ft{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center}
.bk-ex .ft .msg{font-size:14px;color:var(--ink2);flex:1;min-width:160px}
.bk-ex .ft .msg.ok{color:var(--jade);font-weight:600}.bk-ex .ft .msg.bad{color:var(--seal)}
.bk-ex img.pic{max-width:100%;max-height:420px;border-radius:12px;display:block;margin:0 auto 12px}
.bk-tracks{display:flex;flex-direction:column;gap:8px}
.bk-ex img.pic.bkscan{max-height:none;width:100%;border:1px solid var(--line)}
.bk-note{background:var(--paper2);border:0}
.bk-note p{margin:8px 0;line-height:1.55;font-size:15.5px}
.bk-why{margin-top:10px;font-size:14px;color:var(--ink2);background:var(--paper2);border-radius:10px;padding:8px 12px;display:none}
.bk-ex.checked .bk-why{display:block}
.bk-self{font-size:13.5px;color:var(--ink3);margin-top:8px}
.zh{font-family:"Noto Serif SC",serif}
.bk-rows{display:flex;flex-direction:column;gap:6px;margin:6px 0}
.bk-row{display:flex;gap:12px;align-items:baseline;flex-wrap:wrap;padding:6px 10px;border-radius:10px;background:var(--card)}
.bk-row .zh{font-size:22px}.bk-row .py{color:var(--ink2);font-size:14.5px}.bk-row .de{color:var(--ink3);font-size:14.5px}
.bk-line{display:flex;gap:10px;padding:8px 10px;border-radius:12px;cursor:pointer;text-align:left;width:100%;align-items:flex-start}
.bk-line:active,.bk-line.on{background:var(--paper2)}
.bk-line .sp{flex:none;min-width:48px;font-size:13px;font-weight:600;color:var(--seal);padding-top:6px}
.bk-line .zh{font-size:24px;line-height:1.35}
.bk-line .py{font-size:15px;color:var(--ink2)}
.bk-line .de{font-size:14.5px;color:var(--ink3)}
.hidepy .py.opt{display:none}.hidede .de.opt{display:none}
.bk-vocab{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.bk-voc{display:flex;gap:10px;align-items:center;text-align:left;padding:8px 12px;border-radius:12px;border:1px solid var(--line);background:var(--paper)}
.bk-voc .zh{font-size:26px;min-width:54px}.bk-voc .py{font-size:14.5px;color:var(--ink2)}.bk-voc .de{font-size:13.5px;color:var(--ink3)}
.bk-voc.x{border-color:#9ec3dd;background:#eef5fa}
.bk-grp{grid-column:1/-1;font-size:13px;font-weight:600;color:var(--ink3);margin-top:6px}
.bk-player{display:flex;align-items:center;gap:10px;background:var(--paper2);border-radius:999px;padding:5px 12px 5px 5px;margin-top:10px}
.bk-player .pp{width:38px;height:38px;border-radius:50%;background:var(--seal);color:#fff;font-size:15px;flex:none}
.bk-player .tr{flex:1;height:6px;background:var(--line);border-radius:3px;position:relative;touch-action:none}
.bk-player .tr i{position:absolute;left:0;top:0;bottom:0;background:var(--seal);border-radius:3px}
.bk-player .tm{font-size:12.5px;color:var(--ink2);font-variant-numeric:tabular-nums;min-width:74px;text-align:right}
.bk-player .lb{font-size:12px;color:var(--ink3)}
.bk-player.miss{border-radius:12px;padding:8px 12px;font-size:13px;color:var(--ink3)}
.chip2{min-height:44px;padding:6px 14px;border-radius:12px;border:1px solid var(--line);background:var(--paper);font-size:18px}
.chip2.zh{font-size:21px}
.chip2.sel{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.chip2.good{background:var(--jade-soft);border-color:var(--jade);color:#1f4d3a}
.chip2.bad{background:var(--seal-soft);border-color:var(--seal);color:var(--seal)}
.chip2.used{opacity:.45}
.bk-match{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px}
.bk-match .col{display:flex;flex-direction:column;gap:8px}
.bk-m{display:flex;align-items:center;gap:10px;text-align:left;min-height:50px;padding:6px 12px;border-radius:12px;border:1px solid var(--line);background:var(--paper);font-size:16px}
.bk-m .k{flex:none;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-size:13px;font-weight:600;background:var(--paper2);color:var(--ink2)}
.bk-m .zh{font-size:23px}.bk-m .py{font-size:13px;color:var(--ink3);margin-left:4px}
.bk-m.sel{border-color:var(--ink);box-shadow:0 0 0 2px var(--ink)}
.bk-m .k.set{background:var(--ink);color:var(--paper)}
.bk-m.good{border-color:var(--jade);background:var(--jade-soft)}.bk-m.bad{border-color:var(--seal);background:var(--seal-soft)}
.bk-q{margin-bottom:14px}
.bk-q .q{font-size:17px;margin-bottom:6px}.bk-q .q .zh{font-size:22px}.bk-q .qpy{font-size:13.5px;color:var(--ink3)}
.bk-opts{display:flex;gap:8px;flex-wrap:wrap}
.bk-gapline{font-size:21px;line-height:2.1;margin-bottom:6px}
.bk-gapline .py{display:block;font-size:13.5px;line-height:1.3;color:var(--ink3)}
.bk-slot{display:inline-block;min-width:64px;min-height:38px;padding:0 10px;margin:0 3px;border-radius:9px;border:1.5px dashed var(--ink3);background:var(--paper);vertical-align:middle;line-height:36px;text-align:center;font-size:20px}
.bk-slot.act{border-style:solid;border-color:var(--seal);box-shadow:0 0 0 3px var(--seal-soft)}
.bk-slot.fill{border-style:solid;border-color:var(--ink2)}
.bk-slot.good{border-color:var(--jade);background:var(--jade-soft)}.bk-slot.bad{border-color:var(--seal);background:var(--seal-soft)}
.bk-bank{display:flex;gap:8px;flex-wrap:wrap;padding:10px;border-radius:12px;background:var(--paper2);margin:8px 0 12px;position:sticky;top:0;z-index:2}
.bk-order{margin-bottom:16px}
.bk-ans{min-height:52px;border:1.5px dashed var(--line);border-radius:12px;padding:6px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px;font-size:20px}
.bk-ans.sep{flex-direction:column;align-items:stretch}
.bk-ans.good{border-color:var(--jade);background:var(--jade-soft)}.bk-ans.bad{border-color:var(--seal);background:var(--seal-soft)}
.bk-seg{display:flex;gap:12px;flex-wrap:wrap}
.bk-syl{display:flex;gap:2px;padding:6px;border-radius:12px;border:1px solid var(--line);background:var(--paper)}
.bk-syl button{width:34px;height:44px;border-radius:8px;font:600 22px var(--fh,Fraunces),serif}
.bk-syl button.on{background:var(--seal-soft);color:var(--seal);box-shadow:inset 0 0 0 2px var(--seal)}
.bk-syl.good{border-color:var(--jade);background:var(--jade-soft)}.bk-syl.bad{border-color:var(--seal);background:var(--seal-soft)}
.bk-tone{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--paper2);flex-wrap:wrap}
.bk-tone .zh{font-size:28px;width:40px;text-align:center}
.bk-tone .chip2{font-family:var(--fh,Fraunces),serif;min-width:58px}
.bk-cats{display:flex;flex-direction:column;gap:8px}
.bk-cat{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-height:54px;padding:6px 10px;border:1.5px dashed var(--line);border-radius:12px;text-align:left;width:100%}
.bk-cat b{min-width:70px;font-size:14px;color:var(--ink2)}
.bk-cat.act{border-color:var(--ink)}
.bk-pin{display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap}
.bk-pin .zh{font-size:24px;min-width:70px}
.bk-pin input{flex:1;min-width:180px;height:46px;border-radius:12px;border:1.5px solid var(--line);background:var(--paper);padding:0 12px;font:500 19px var(--fh,Fraunces),serif;-webkit-user-select:text;user-select:text}
.bk-pin input.good{border-color:var(--jade);background:var(--jade-soft)}.bk-pin input.bad{border-color:var(--seal);background:var(--seal-soft)}
.bk-pin .sol{font-size:14px;color:var(--seal)}
.bk-write{display:flex;gap:10px;flex-wrap:wrap}
.bk-wc{width:84px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:14px;border:1px solid var(--line);background:var(--paper)}
.bk-wc .zh{font-size:40px;line-height:1.1}.bk-wc .py{font-size:13px;color:var(--ink3)}
.bk-wc.done{border-color:var(--jade);background:var(--jade-soft)}
.bk-model{display:none;margin-top:10px}
.bk-ex.showmodel .bk-model{display:block}
.bk-ex textarea{width:100%;min-height:80px;border-radius:12px;border:1.5px solid var(--line);background:var(--paper);padding:10px 12px;font:18px "Noto Serif SC",Inter,sans-serif;-webkit-user-select:text;user-select:text;resize:vertical}
.bk-rate{display:flex;flex-direction:column;gap:12px}
.bk-rate .r b{display:block;font-size:14px}.bk-rate .r span{font-size:14px;color:var(--ink2)}
.bk-rate .opts{display:flex;gap:6px;margin-top:6px}
.bk-rate .opts button{width:46px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--paper);font-weight:600}
.bk-rate .opts button.on{background:var(--ink);color:var(--paper)}
.bk-goals{margin:0;padding-left:20px;color:var(--ink2);line-height:1.6;font-size:15px}
.bk-nav{display:flex;justify-content:space-between;gap:10px;margin-top:6px}
.bk-toggles{display:flex;gap:8px}
.bk-toggles .btn{height:38px;font-size:14px;padding:0 12px}
.bk-today{background:var(--ink);color:var(--paper);border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:10px}
.bk-today h3{margin:0;font:600 20px var(--fh,Fraunces),serif}
.bk-today .row{display:flex;gap:10px;flex-wrap:wrap}
.bk-today .btn{background:var(--paper);color:var(--ink);border-color:var(--paper)}
.bk-today .btn.primary{background:var(--seal);color:#fff;border-color:var(--seal)}
.bk-today small{opacity:.75;font-size:13.5px}
.bk-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.bk-tools .btn{height:40px;font-size:14px}
#bkPages{position:fixed;inset:0;z-index:23;background:#2a2622;display:none;flex-direction:column}
#bkPages.show{display:flex}
#bkPages .pg-top{display:flex;align-items:center;gap:10px;padding:calc(18px + env(safe-area-inset-top)) 14px 10px;color:var(--ink);background:var(--paper)}
#bkPages .pg-top .btn{height:40px}
#bkPages .pg-top h2{flex:1;margin:0;font:600 18px var(--fh,Fraunces),serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bkPages .pg-view{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;align-items:flex-start;justify-content:center;touch-action:pan-x pan-y}
#bkPages .pg-view img{max-width:100%;max-height:100%;object-fit:contain;display:block;margin:auto;user-select:none;-webkit-user-drag:none}
#bkPages.zoom .pg-view{display:block}
#bkPages.zoom .pg-view img{max-width:none;max-height:none;width:200%}
#bkPages .pg-view{position:relative}
#pgHot{position:absolute;pointer-events:none}
.bk-hotw{position:relative}
.bk-hot{position:absolute;border:0;padding:0;margin:0;background:rgba(190,60,40,.08);border-radius:6px;outline:1.5px dashed rgba(190,60,40,.5);outline-offset:-1px;cursor:pointer;pointer-events:auto;-webkit-tap-highlight-color:transparent}
.bk-hot.on{background:rgba(190,60,40,.26);outline-style:solid}
.bk-hotn{color:#d8cfbf;font-size:12.5px;text-align:center}
.bk-pg.fold .bk-hotn,.bk-pg.fold .bk-hot{display:none}
#bkPages .pg-bar{display:flex;gap:8px;align-items:center;padding:10px 14px;flex-wrap:wrap;background:rgba(0,0,0,.35)}
#bkPages .pg-bar .btn{height:42px}
#bkPages .pg-bar .nav{min-width:54px;justify-content:center;font-size:20px}
#bkPages .pg-bar .sp{flex:1}
#bkPages .chip3{height:42px;padding:0 14px;border-radius:999px;background:var(--paper);color:var(--ink);font-weight:500;font-size:14px;display:inline-flex;align-items:center;gap:6px}
#bkPages .chip3.on{background:var(--seal);color:#fff}
#bkPages .chip3.ex{background:var(--jade-soft);color:#1f4d3a}
#bkPages .pg-lbl{color:#f5efe3;font-size:14px;min-width:90px;text-align:center}
/* tab bar */
#hzTabs{position:fixed;left:0;right:0;bottom:0;z-index:22;display:flex;justify-content:center;gap:6px;padding:6px 10px calc(6px + env(safe-area-inset-bottom));background:rgba(245,239,227,.96);border-top:1px solid var(--line);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
#hzTabs button{flex:0 1 180px;height:48px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12.5px;font-weight:600;color:var(--ink3);gap:1px}
#hzTabs button span{font-size:20px;line-height:1}
#hzTabs button.on{color:var(--seal);background:var(--card);box-shadow:0 0 0 1px var(--line)}
body.hz-tabs .app{padding-bottom:78px}
#book .bk-body{padding-bottom:96px}
#bkPages{bottom:0}
/* course */
.cu-head{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap}
.cu-head h2{margin:0;font:600 30px var(--fh,Fraunces),serif;flex:1}
.cu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.cu-unit{position:relative;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px 16px;display:flex;flex-direction:column;gap:4px;min-height:118px}
.cu-unit .no{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
.cu-unit .zh{font-size:22px;line-height:1.25}
.cu-unit .de{font-size:14px;color:var(--ink2)}
.cu-unit .bar{margin-top:auto;height:6px;border-radius:3px;background:var(--paper2);overflow:hidden}.cu-unit .bar i{display:block;height:100%;background:var(--jade)}
.cu-unit .st{font-size:12.5px;color:var(--ink3)}
.cu-unit.cur{border-color:var(--seal);box-shadow:0 0 0 2px var(--seal-soft)}
.cu-unit.missing{opacity:.55;border-style:dashed}
.cu-unit.done{border-color:var(--jade)}
.cu-path{display:flex;flex-direction:column;gap:6px}
.cu-les{margin:14px 0 4px;font:600 19px var(--fh,Fraunces),serif;display:flex;align-items:center;gap:10px}
.cu-les:after{content:'';flex:1;height:1px;background:var(--line)}
.cu-step{display:flex;align-items:center;gap:12px;text-align:left;padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:var(--card);width:100%}
.cu-step .ic{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:19px;background:var(--paper2)}
.cu-step.LB .ic{background:#f6dcd5}.cu-step.AB .ic{background:#dce9e1}.cu-step.LH .ic{background:#e6e0f1}.cu-step.TEST .ic{background:#f3e6c7}
.cu-step .t{flex:1;min-width:0}.cu-step .t b{display:block;font-weight:600;font-size:15.5px}.cu-step .t small{color:var(--ink3);font-size:13px}
.cu-step .ck{flex:none;font-size:13px;color:var(--ink3);white-space:nowrap}
.cu-step.done{border-color:var(--jade)}.cu-step.done .ck{color:var(--jade);font-weight:700}
.cu-step.next{border-color:var(--seal);box-shadow:0 0 0 2px var(--seal-soft)}
.cu-tools{display:flex;gap:8px;flex-wrap:wrap}
/* split reading view */
.bk-split{display:flex;gap:18px;align-items:flex-start;max-width:1400px;margin:0 auto}
.bk-split .bk-wrap{flex:1;min-width:0;max-width:none;margin:0}
.bk-pg{flex:0 0 46%;position:sticky;top:0;align-self:flex-start;background:#2a2622;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:6px}
.bk-pg img{width:100%;border-radius:8px;display:block;cursor:zoom-in}
.bk-pg .r{display:flex;align-items:center;gap:6px;color:#f5efe3;font-size:13px}
.bk-pg .r .btn{height:34px;padding:0 10px;font-size:14px}
.bk-pg .r span{flex:1;text-align:center}
.bk-split.nopg .bk-pg{display:none}
@media (orientation:portrait),(max-width:900px){ .bk-split{flex-direction:column} .bk-pg{position:relative;flex:none;width:100%} .bk-pg.fold img{display:none} }
.bk-step-nav{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:14px 0 4px;border-top:1px solid var(--line);margin-top:6px}
.bk-step-nav .mid{font-size:13px;color:var(--ink3);text-align:center;flex:1}
/* tests */
.testmode .bk-ex .ft button,.testmode .bk-ex .bk-why,.testmode .bk-ex .bk-self{display:none}
.testmode.graded .bk-ex .bk-why{display:block}
.bk-testbar{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.bk-testbar .sc{font:600 34px var(--fh,Fraunces),serif}
.bk-testbar .sc small{font-size:16px;color:var(--ink3)}
.bk-testbar p{margin:0;flex:1;min-width:200px;color:var(--ink2)}
#bkWrite{position:fixed;inset:0;z-index:25;background:rgba(31,27,22,.45);display:none;align-items:center;justify-content:center;padding:16px}
#bkWrite.show{display:flex}
#bkWrite .panel{max-width:560px;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center}
#bkWrite .wh{display:flex;gap:12px;align-items:baseline;justify-content:center}
#bkWrite .wh .py{font:600 28px var(--fh,Fraunces),serif}#bkWrite .wh .de{color:var(--ink2)}
#bkWpad{position:relative;background:var(--card);border-radius:16px;box-shadow:0 0 0 1px var(--line);touch-action:none}
#bkWpad svg.g{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
#bkWhw{position:absolute;inset:0}
#bkWmsg{font-size:14px;color:var(--ink2);min-height:20px}
`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
const root=document.createElement('div'); root.id='book';
root.innerHTML=`<div class="bk-top"><button class="btn" id="bkBack">← Zurück</button><h2 id="bkTitle">Buch</h2><div class="bk-toggles" id="bkToggles"><button class="btn" id="bkPy">Pinyin</button><button class="btn" id="bkDe">Deutsch</button></div></div>
<div class="bk-body" id="bkBody"><div class="bk-split nopg" id="bkSplit"><div class="bk-pg" id="bkPg"></div><div class="bk-wrap" id="bkWrap"></div></div></div>
<input type="file" id="bkFile" accept=".json,application/json,text/plain" style="display:none">`;
document.body.appendChild(root);
const wroot=document.createElement('div'); wroot.id='bkWrite';
wroot.innerHTML=`<div class="panel"><div class="wh"><span class="zh" id="bkWzh" style="font-size:30px"></span><span class="py" id="bkWpy"></span><span class="de" id="bkWde"></span></div>
<div id="bkWpad"><svg class="g" id="bkWgrid"></svg><div id="bkWhw"></div></div><div id="bkWmsg"></div>
<div class="tools"><button class="btn" id="bkWshow">▶︎ Vorführen</button><button class="btn" id="bkWagain">↺ Nochmal</button><button class="btn primary" id="bkWclose">Fertig</button></div></div>`;
document.body.appendChild(wroot);

const proot=document.createElement('div'); proot.id='bkPages';
proot.innerHTML=`<div class="pg-top"><button class="btn" id="pgClose">← Zurück</button><h2 id="pgTitle"></h2><button class="btn" id="pgZoom">🔍</button></div>
<div class="pg-view" id="pgView"><img id="pgImg" alt=""><div id="pgHot"></div></div>
<div class="pg-bar"><button class="btn nav" id="pgPrev">‹</button><span class="pg-lbl" id="pgLbl"></span><button class="btn nav" id="pgNext">›</button><span class="sp"></span><span id="pgChips" style="display:flex;gap:8px;flex-wrap:wrap"></span></div>`;
document.body.appendChild(proot);

// header button
const hb=document.createElement('button'); hb.className='icon-btn'; hb.id='btnBook'; hb.setAttribute('aria-label','Buch'); hb.textContent='📖';
const sb=$('btnSettings'); sb.parentNode.insertBefore(hb,sb); hb.style.display='none';
hb.onclick=()=>openBook();

let packs=[], cur=null, view='home', secRef=null;
const urls=new Map();
function mediaUrl(pack,name){ const k=pack.id+'/'+name; if(urls.has(k)) return urls.get(k); const b=pack.mediaBlobs&&pack.mediaBlobs[name]; if(!b) return null; const u=URL.createObjectURL(b instanceof Blob?b:new Blob([b.buf],{type:b.type})); urls.set(k,u); return u; }
function applyView(){ root.classList.toggle('hidepy',!P.view.py); root.classList.toggle('hidede',!P.view.de); $('bkPy').classList.toggle('on',P.view.py); $('bkDe').classList.toggle('on',P.view.de); }
$('bkPy').onclick=()=>{P.view.py=!P.view.py;saveP();applyView();};
$('bkDe').onclick=()=>{P.view.de=!P.view.de;saveP();applyView();};
$('bkBack').onclick=()=>{ stopAudio(); if(view==='sec'&&curPack){ const s=secRef&&curPack.parts[secRef.pi].sections[secRef.si]; if(s&&s.test&&prevView==='tests'){ showTests(); return; } openUnit(curPack); } else showHome(); };
let prevView='home';
$('bkFile').onchange=async e=>{ const f=e.target.files[0]; e.target.value=''; if(!f) return;
  try{ const p=await importFile(f); toast(`„${p.book} · ${p.unit}“ importiert.`); await showHome(); }catch(err){ toast((err&&err.message)||'Import fehlgeschlagen.'); try{window.__hzlog('book import: '+(err&&(err.message||err.name)));}catch(e){} } };
function toast(t){ try{ window.__hztoast(t); }catch(e){ alert(t); } }

async function openBook(){ root.classList.add('show'); applyView(); await showHome(); }
function closeBook(){ stopAudio(); root.classList.remove('show'); setTab('karten'); }
const tabs=document.createElement('nav'); tabs.id='hzTabs';
tabs.innerHTML=`<button data-t="lernen"><span>✦</span>Lernen</button><button data-t="kurs"><span>📖</span>Buch</button><button data-t="karten"><span>✎</span>Schreibkarten</button><button data-t="tests"><span>📝</span>Tests</button>`;
document.body.appendChild(tabs); document.body.classList.add('hz-tabs');
function setTab(t){ tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===t)); if(P.tab!==t){ P.tab=t; saveP(); } }
tabs.onclick=e=>{ const b=e.target.closest('button'); if(!b) return; const t=b.dataset.t; closePagesIfOpen();
  if(t==='lernen'){ openLp(); return; } try{ closeLp(); }catch(e){}
  if(t==='karten'){ closeBook(); } else if(t==='kurs'){ root.classList.add('show'); applyView(); prevView='home'; showHome(); } else { root.classList.add('show'); applyView(); prevView='tests'; showTests(); } };
function closePagesIfOpen(){ try{ if(proot.classList.contains('show')) closePages(); }catch(e){} }
if(!P.lp1){ P.lp1=1; P.tab='lernen'; saveP(); }
setTimeout(()=>{ if(P.tab==='lernen') openLp(); else if(P.tab!=='karten'){ openBook(); } else setTab('karten'); },50);

// ---------------------------------------------------------------- progress
const GRADED=new Set(['match','choice','gap','order','seg','tone','sort','pinyin','write','open','rating']);
function exGraded(e){ return GRADED.has(e.type); }
function secProgress(s){ const g=s.ex.filter(exGraded); const d=g.filter(e=>P.ex[key(e)]&&P.ex[key(e)].done).length; return {d,n:g.length}; }
let curPack=null;
const key=e=>(curPack?curPack.id:'')+':'+e.id;

function pageRange(str){ const m=String(str||'').match(/(\d+)(?:\s*[–-]\s*(\d+))?/); if(!m) return [0,-1]; return [+m[1], +(m[2]||m[1])]; }
function secsForPages(pack,book,pages){ const out=[]; pack.parts.forEach((pt,pi)=>{ if(pt.id!==book) return; pt.sections.forEach((s,si)=>{ const [a,b]=pageRange(s.page); if(pages.some(p=>p>=a&&p<=b)) out.push({pi,si,s}); }); }); return out; }
function allSecs(){ const out=[]; packs.forEach(p=>p.parts.forEach((pt,pi)=>pt.sections.forEach((s,si)=>out.push({p,pi,si,s,pt})))); return out; }
function secDone(p,s){ curPack=p; const pr=secProgress(s); return pr.n===0 || pr.d>=pr.n; }
function nextSection(){
  if(P.last){ const p=packs.find(x=>x.id===P.last.id); const s=p&&p.parts[P.last.pi]&&p.parts[P.last.pi].sections[P.last.si]; if(s&&!secDone(p,s)) return {p,pi:P.last.pi,si:P.last.si,s,pt:p.parts[P.last.pi]}; }
  const all=allSecs(); const li=P.last?all.findIndex(x=>x.p.id===P.last.id&&x.pi===P.last.pi&&x.si===P.last.si):-1;
  for(let k=1;k<=all.length;k++){ const x=all[(li+k+all.length)%all.length]; if(!secDone(x.p,x.s)) return x; }
  return null;
}

// ---------------------------------------------------------------- home
const UNITS=[['ce1-e0','Einstieg','中文入门','Chinesisch entdecken']].concat([['你好！','Hallo!'],['你是哪国人？','Woher kommen Sie?'],['你做什么工作？','Was machen Sie beruflich?'],['他真高！','Er ist so groß!'],['这是我的电话号码。','Das ist meine Telefonnummer.'],['今天几号？','Welches Datum ist heute?'],['八点见！','Bis um acht!'],['多少钱？','Wie viel kostet das?'],['不远！','Nicht weit!'],['坐火车吧。','Fahren wir mit dem Zug.'],['我会跳舞。','Ich kann tanzen.'],['我们去看京剧。','Wir gehen in die Pekingoper.']].map((x,i)=>['ce1-e'+(i+1),'Einheit '+(i+1),x[0],x[1]]));
function lesOf(pt,s){ if(s.les) return s.les; if(s.test) return 'end'; const m=String(s.title).match(/Lektion\s*(\d)/); return m?+m[1]:'end'; }
function unitPath(pack){
  const out=[];
  const order=[1,2,3,'end'];
  for(const L of order){
    for(const kind of ['LB','AB','LH','TEST']){
      pack.parts.forEach((pt,pi)=>{ if(pt.id!==kind) return; pt.sections.forEach((s,si)=>{ if(String(lesOf(pt,s))===String(L)) out.push({kind,pi,si,s,les:L,pt}); }); });
    }
  }
  return out;
}
const KIND={LB:['📕','Lehrbuch'],AB:['📗','Arbeitsbuch'],LH:['🎓','Lehrer'],TEST:['📝','Test']};
function stepDone(pack,st){ curPack=pack; if(st.s.test){ return !!(P.tests&&P.tests[pack.id+':'+st.s.id]); } return secDone(pack,st.s); }
function unitProgress(pack){ const p=unitPath(pack); const d=p.filter(x=>stepDone(pack,x)).length; return {d,n:p.length}; }
function nextStep(pack){ const p=unitPath(pack); return p.find(x=>!stepDone(pack,x))||null; }
function nextSection(){
  const ids=[]; if(P.last) ids.push(P.last.id); UNITS.forEach(u=>ids.push(u[0])); packs.forEach(p=>ids.push(p.id));
  for(const id of [...new Set(ids)]){ const pk=packs.find(x=>x.id===id); if(!pk) continue; const st=nextStep(pk); if(st) return {p:pk,pi:st.pi,si:st.si,s:st.s,pt:st.pt}; }
  return null;
}
async function loadPacks(){ try{ packs=await listPacks(); }catch(e){ packs=[]; } packs.sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true})); }
async function showHome(){
  view='home'; setTab('kurs'); $('bkBack').style.display='none'; $('bkTitle').textContent='汉字 · China entdecken'; $('bkToggles').style.display='none'; { const old=$('bkPgBtn'); if(old) old.remove(); }
  splitOff();
  await loadPacks();
  const w=$('bkWrap'); w.innerHTML='';
  const nx=nextSection(); const due=HZ.dueCount?HZ.dueCount():0;
  const t=document.createElement('div'); t.className='bk-today';
  t.innerHTML=`<h3>Heute dran</h3>${nx?`<small>Weiter: ${esc(nx.p.unit)} · ${esc(KIND[nx.pt.id][1])} · ${esc(nx.s.title.replace(/^.*?·\s*/,''))}${nx.s.page?` (S. ${esc(nx.s.page)})`:''}</small>`:(packs.length?'<small>Alle importierten Einheiten sind durchgearbeitet. 很好！</small>':'<small>Importiere zuerst deine Lektionspakete (unten).</small>')}
    <div class="row">${nx?'<button class="btn primary" id="tdGo">Weiterlernen →</button>':''}<button class="btn" id="tdCards">✎ Schreibkarten${due?` · ${due} fällig`:''}</button></div>`;
  w.appendChild(t);
  if(nx) $('tdGo').onclick=()=>openSection(nx.p,nx.pi,nx.si);
  $('tdCards').onclick=()=>closeBook();
  const hd=document.createElement('div'); hd.className='cu-head'; hd.innerHTML=`<h2>Band 1</h2><button class="btn" id="bkImp">+ Paket importieren</button>`; w.appendChild(hd);
  const g=document.createElement('div'); g.className='cu-grid';
  for(const [id,label,zh,de] of UNITS){
    const pk=packs.find(x=>x.id===id);
    const b=document.createElement('button'); b.className='cu-unit';
    if(!pk){ b.classList.add('missing'); b.innerHTML=`<span class="no">${label}</span><span class="zh">${esc(zh)}</span><span class="de">${esc(de)}</span><span class="st">noch nicht importiert</span>`; b.onclick=()=>toast('Dieses Paket ist noch nicht importiert.'); }
    else { const pr=unitProgress(pk); if(nx&&nx.p.id===id) b.classList.add('cur'); if(pr.d>=pr.n) b.classList.add('done');
      b.innerHTML=`<span class="no">${label}</span><span class="zh">${esc(zh)}</span><span class="de">${esc(de)}</span><span class="bar"><i style="width:${Math.round(100*pr.d/pr.n)}%"></i></span><span class="st">${pr.d} von ${pr.n} Schritten</span>`;
      b.onclick=()=>openUnit(pk); }
    g.appendChild(b);
  }
  w.appendChild(g);
  const rest=packs.filter(pk=>!UNITS.some(u=>u[0]===pk.id));
  const ord2=p=>{ const m=/-e(\d+)$/.exec(p.id); return m?+m[1]:100+['wdh','pruefung','anhang'].findIndex(x=>p.id.endsWith(x)); };
  for(const [bd,ti] of [[1,'Band 1 · Extras'],[2,'Band 2']]){ const grp=rest.filter(pk=>(pk.band===2?2:1)===bd).sort((x,y)=>ord2(x)-ord2(y)); if(!grp.length) continue;
    const hd2=document.createElement('div'); hd2.className='cu-head'; hd2.innerHTML=`<h2>${ti}</h2>`; w.appendChild(hd2);
    const g2=document.createElement('div'); g2.className='cu-grid';
    for(const pk of grp){ const pr=unitProgress(pk); const b2=document.createElement('button'); b2.className='cu-unit'; if(nx&&nx.p.id===pk.id) b2.classList.add('cur'); if(pr.n&&pr.d>=pr.n) b2.classList.add('done');
      b2.innerHTML=`<span class="no">${esc(pk.unit)}</span><span class="zh">${esc(pk.zh||pk.title||'')}</span><span class="de">${esc(pk.de||pk.book||'')}</span><span class="bar"><i style="width:${pr.n?Math.round(100*pr.d/pr.n):0}%"></i></span><span class="st">${pr.d} von ${pr.n} Schritten</span>`;
      b2.onclick=()=>openUnit(pk); g2.appendChild(b2); }
    w.appendChild(g2); }
  $('bkImp').onclick=()=>$('bkFile').click();
  $('bkBody').scrollTop=0;
}
function openUnit(pack){
  view='unit'; curPack=pack; splitOff(); $('bkBack').style.display=''; $('bkTitle').textContent=`${pack.unit} · ${pack.title||''}`; $('bkToggles').style.display='none'; { const old=$('bkPgBtn'); if(old) old.remove(); }
  const w=$('bkWrap'); w.innerHTML='';
  const tools=document.createElement('div'); tools.className='cu-tools';
  const hasLB=(pack.pages||[]).some(x=>x.b==='LB'), hasAB=(pack.pages||[]).some(x=>x.b==='AB');
  tools.innerHTML=`${hasLB?'<button class="btn" data-pg="LB">📕 Lehrbuch blättern</button>':''}${hasAB?'<button class="btn" data-pg="AB">📗 Arbeitsbuch blättern</button>':''}${pack.deck?`<button class="btn" data-deck="1">${HZ.hasDeck(pack.deck)?'✓ Vokabeln in den Schreibkarten':'+ Vokabeln in die Schreibkarten'}</button>`:''}<span style="flex:1"></span><button class="btn" data-del="1" style="font-size:13px">Paket entfernen</button>`;
  tools.onclick=async e=>{ const pg=e.target.closest('[data-pg]'); if(pg){ openPages(pack,pg.dataset.pg,0); return; }
    if(e.target.closest('[data-deck]')){ if(HZ.hasDeck(pack.deck)){ HZ.removeDeck(pack.deck); toast('Die Vokabeln dieser Einheit sind nicht mehr in den Schreibkarten.'); } else { HZ.addDeck(pack.deck); toast(`Die Vokabeln von ${pack.unit} sind jetzt in deinen Schreibkarten.`); } openUnit(pack); return; }
    if(e.target.closest('[data-del]')){ if(confirm(`„${pack.unit}“ von diesem Gerät entfernen? Dein Übungsfortschritt bleibt erhalten.`)){ await delPack(pack.id); showHome(); } } };
  w.appendChild(tools);
  const path=unitPath(pack), nx=nextStep(pack); let lastL=null;
  const box=document.createElement('div'); box.className='cu-path';
  path.forEach(st=>{
    if(st.les!==lastL){ lastL=st.les; const h=document.createElement('div'); h.className='cu-les'; h.textContent=st.les==='end'?'Abschluss der Einheit':`Lektion ${st.les}`; box.appendChild(h); }
    const b=document.createElement('button'); const done=stepDone(pack,st); curPack=pack; const pr=secProgress(st.s);
    b.className=`cu-step ${st.kind}${done?' done':''}${nx===st?' next':''}`;
    const tst=st.s.test&&P.tests&&P.tests[pack.id+':'+st.s.id];
    b.innerHTML=`<span class="ic">${KIND[st.kind][0]}</span><span class="t"><b>${esc(stepLabel(st))}</b><small>${KIND[st.kind][1]}${st.s.page?` · S. ${esc(st.s.page)}`:''}</small></span><span class="ck">${st.s.test?(tst?`${tst.best} / ${tst.n} Punkte`:'offen'):(done?'✓ erledigt':(pr.n?`${pr.d}/${pr.n}`:''))}</span>`;
    b.onclick=()=>openSection(pack,st.pi,st.si);
    box.appendChild(b);
  });
  w.appendChild(box);
  $('bkBody').scrollTop=0;
}
function stepLabel(st){ let t=st.s.title.replace(/^(Einstieg|Einheit \d+)\s*·\s*/,'').replace(/^Lektion \d\s*·?\s*/,''); if(!t) t=st.kind==='AB'?'Übungen im Arbeitsbuch':'Übungen'; return t; }
function splitOff(){ const sp=$('bkSplit'); if(sp) sp.classList.add('nopg'); }
function pagePanel(pack,book,pageNo){
  const list=(pack.pages||[]).filter(x=>x.b===book).sort((a,b)=>a.p[0]-b.p[0]);
  let i=list.findIndex(x=>x.p.includes(pageNo)); if(i<0) return false;
  const pg=$('bkPg'); const draw=()=>{ const it=list[i]; pg.innerHTML=`<div class="r"><button class="btn" data-d="-1">‹</button><span>${book==='LB'?'Lehrbuch':'Arbeitsbuch'} · S. ${it.p.join('–')}</span><button class="btn" data-d="1">›</button><button class="btn" data-f="1" title="Seite ein-/ausklappen">▾</button></div><div class="bk-hotw"><img src="${mediaUrl(pack,it.img)||''}" alt="">${hotHTML(it)}</div>${(it.hot||[]).length?'<div class="bk-hotn">Markierte Zeilen antippen: einzeln anhören</div>':''}`;
    hotStop(); hotBind(pg,pack,it);
    pg.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ const n=i+(+b.dataset.d); if(n>=0&&n<list.length){ i=n; draw(); } });
    pg.querySelector('[data-f]').onclick=()=>pg.classList.toggle('fold');
    pg.querySelector('img').onclick=()=>openPages(pack,book,0,list[i].p[0]); };
  draw(); return true;
}
function openSection(pack,pi,si){
  curPack=pack; view='sec'; secRef={pack,pi,si}; P.last={id:pack.id,pi,si}; saveP();
  const part=pack.parts[pi], s=part.sections[si]; setTab(s.test&&prevView==='tests'?'tests':'kurs');
  $('bkBack').style.display=''; $('bkTitle').textContent=`${pack.unit} · ${KIND[part.id]?KIND[part.id][1]:part.title} · ${s.title.replace(/^(Einstieg|Einheit \d+)\s*·\s*/,'')}`; $('bkToggles').style.display='';
  { const old=$('bkPgBtn'); if(old) old.remove(); }
  const sp=$('bkSplit'); const [a]=pageRange(s.page);
  const hasPg=(part.id==='LB'||part.id==='AB') && pagePanel(pack,part.id,a);
  sp.classList.toggle('nopg',!hasPg);
  const w=$('bkWrap'); w.innerHTML=''; w.classList.toggle('testmode',!!s.test); w.classList.remove('graded');
  if(s.test){ const tb=document.createElement('div'); tb.className='bk-testbar'; tb.id='bkTestbar';
    const prev=P.tests&&P.tests[pack.id+':'+s.id];
    tb.innerHTML=`<p>${esc(s.intro||'Bearbeite alle Aufgaben ohne Hilfe. Erst beim Abgeben siehst du, was richtig war.')}${prev?` Bisher bestes Ergebnis: <b>${prev.best} / ${prev.n}</b>.`:''}</p>`; w.appendChild(tb); }
  s.ex.forEach(ex=>w.appendChild(renderEx(ex)));
  if(s.test){ const b=document.createElement('button'); b.className='btn primary'; b.style.alignSelf='center'; b.textContent='Test abgeben'; b.onclick=()=>gradeTest(pack,s,w,b); w.appendChild(b); }
  const path=unitPath(pack); const k=path.findIndex(x=>x.pi===pi&&x.si===si);
  const prev=k>0?path[k-1]:null, next=k>=0&&k<path.length-1?path[k+1]:null;
  const nav=document.createElement('div'); nav.className='bk-step-nav';
  nav.innerHTML=`<span>${prev?'<button class="btn" id="bkPrev">← Zurück</button>':''}</span><span class="mid">Schritt ${k+1} von ${path.length}${next?`<br>Als Nächstes: ${KIND[next.kind][1]} · ${esc(next.s.title.replace(/^.*·\s*/,''))}`:''}</span><span>${next?'<button class="btn primary" id="bkNext">Weiter →</button>':'<button class="btn primary" id="bkHome">Einheit abschließen ✓</button>'}</span>`;
  w.appendChild(nav);
  if(prev) $('bkPrev').onclick=()=>{ stopAudio(); openSection(pack,prev.pi,prev.si); };
  if(next) $('bkNext').onclick=()=>{ stopAudio(); openSection(pack,next.pi,next.si); };
  else $('bkHome').onclick=()=>{ stopAudio(); try{HZ.confetti();}catch(e){} openUnit(pack); };
  $('bkBody').scrollTop=0;
}
function exTotal(ex,el){
  switch(ex.type){
    case 'choice': return ex.items.filter(it=>it.ans!=null).length;
    case 'gap': return el.querySelectorAll('.bk-slot').length;
    case 'match': return ex.left.length;
    case 'order': case 'seg': case 'tone': case 'sort': case 'pinyin': return ex.items.length;
    default: return 0;
  }
}
function gradeTest(pack,s,w,btn){
  let got=0, tot=0;
  w.querySelectorAll('.bk-ex').forEach(el=>{ const ex=s.ex.find(e=>'ex-'+e.id===el.id); if(!ex) return; const n=exTotal(ex,el); if(!n) return;
    const c=el.querySelector('[data-a=check]'); if(c) c.click();
    const m=(el.querySelector('.ft .msg')||{}).textContent||''; const mm=m.match(/(\d+) von (\d+)/);
    got += el.classList.contains('ok') ? n : (mm? +mm[1] : 0); tot+=n; });
  w.classList.add('graded'); btn.textContent='Nochmal versuchen'; btn.onclick=()=>{ s.ex.forEach(e=>{ delete P.open[key(e)]; delete P.ex[key(e)]; }); saveP(); openSection(pack,secRef.pi,secRef.si); };
  P.tests=P.tests||{}; const k=pack.id+':'+s.id; const prev=P.tests[k]; P.tests[k]={best:Math.max(got,prev?prev.best:0),last:got,n:tot,t:Date.now()}; saveP();
  const pct=tot?got/tot:0; const note=pct>=.9?'Ausgezeichnet! 太棒了！':pct>=.75?'Gut gemacht! 很好！':pct>=.5?'Bestanden – ein paar Punkte gehen noch. 加油！':'Wiederhole die Einheit und versuch es dann noch einmal. 加油！';
  const tb=$('bkTestbar'); tb.innerHTML=`<div class="sc">${got}<small> / ${tot}</small></div><p><b>${note}</b><br>Rot markiert siehst du, was noch nicht stimmt, grün die richtige Lösung.</p>`;
  if(pct>=.75) try{HZ.confetti();}catch(e){}
  $('bkBody').scrollTop=0;
}
function showTests(){
  view='tests'; setTab('tests'); splitOff(); $('bkBack').style.display='none'; $('bkTitle').textContent='Tests & Prüfungen'; $('bkToggles').style.display='none';
  const w=$('bkWrap'); w.innerHTML='';
  loadPacks().then(()=>{
    w.innerHTML=`<div class="bk-note bk-ex"><div class="ti" style="font-weight:600">Einheitentests aus dem Lehrerhandbuch</div><p class="bk-self" style="display:block">Nach jeder Einheit ein Test mit 25 Punkten – wie im Unterricht. Die Prüfungsaufgaben 1–3 kommen nach Einheit 4, 8 und 12 dazu.</p></div>`;
    const box=document.createElement('div'); box.className='cu-path';
    let any=false;
    for(const pk of packs) pk.parts.forEach((pt,pi)=>pt.sections.forEach((s,si)=>{ if(!s.test) return; any=true; const r=P.tests&&P.tests[pk.id+':'+s.id];
      const b=document.createElement('button'); b.className='cu-step TEST'+(r?' done':''); b.innerHTML=`<span class="ic">📝</span><span class="t"><b>${esc(s.title)}</b><small>${esc(pk.unit)}</small></span><span class="ck">${r?`bestes Ergebnis ${r.best} / ${r.n}`:'noch nicht gemacht'}</span>`;
      b.onclick=()=>openSection(pk,pi,si); box.appendChild(b); }));
    if(!any) box.innerHTML='<p class="bk-self" style="display:block">Noch keine Tests importiert.</p>';
    w.appendChild(box);
  });
}

// ---------------------------------------------------------------- audio
const ap=new Audio(); ap.preload='auto';
let apOwner=null, apStop=null, raf=0;
let hotEl=null, hotRaf=0;
function hotStop(){ cancelAnimationFrame(hotRaf); if(hotEl){ hotEl.classList.remove('on'); hotEl=null; } }
function hotHTML(pg){ return (pg.hot||[]).map((h,i)=>`<button class="bk-hot" data-h="${i}" aria-label="Zeile anhören" style="left:${(100*h.r[0]).toFixed(2)}%;top:${(100*h.r[1]).toFixed(2)}%;width:${(100*h.r[2]).toFixed(2)}%;height:${(100*h.r[3]).toFixed(2)}%"></button>`).join(''); }
function hotBind(box,pack,pg){ box.querySelectorAll('.bk-hot').forEach(b=>b.onclick=e=>{ e.stopPropagation(); playHot(pack,pg.hot[+b.dataset.h],b); }); }
function playHot(pack,h,el){
  const u=mediaUrl(pack,'audio/'+h.a+'.mp3'); if(!u){ toast('Diese Aufnahme fehlt im Paket.'); return; }
  if(hotEl===el){ try{ap.pause();}catch(e){} hotStop(); return; }
  stopAudio(); ap.onended=null; document.querySelectorAll('#pgChips [data-tr].on').forEach(x=>{ x.classList.remove('on'); x.textContent='▶︎ Track '+x.dataset.tr.replace(/^(LB|AB)/,''); });
  const t0=Math.max(0,h.t[0]-0.12), t1=h.t[1]+0.15; let started=false;
  ap.src=u; const go=()=>{ ap.currentTime=t0; ap.play().then(()=>{ started=true; }).catch(()=>{ if(hotEl===el) hotStop(); }); };
  if(ap.readyState>=1) go(); else ap.addEventListener('loadedmetadata',go,{once:true});
  hotEl=el; el.classList.add('on');
  const loop=()=>{ if(hotEl!==el) return; if(ap.currentTime>=t1 || ap.ended || (started&&ap.paused)){ try{ap.pause();}catch(e){} hotStop(); return; } hotRaf=requestAnimationFrame(loop); };
  hotRaf=requestAnimationFrame(loop);
}
function stopAudio(){ hotStop(); try{ap.pause();}catch(e){} apStop=null; if(apOwner) apOwner.classList.remove('playing'); apOwner=null; document.querySelectorAll('.bk-line.on').forEach(x=>x.classList.remove('on')); }
function fmt(t){ t=Math.max(0,t||0); return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'); }
function tick(){ cancelAnimationFrame(raf); const loop=()=>{ if(apOwner){ const d=ap.duration||0; const bar=apOwner.querySelector('.tr i'); if(bar) bar.style.width=(d?100*ap.currentTime/d:0)+'%';
      const tm=apOwner.querySelector('.tm'); if(tm) tm.textContent=fmt(ap.currentTime)+' / '+fmt(d);
      apOwner.querySelector('.pp').textContent=ap.paused?'▶︎':'❚❚';
      if(apStop!=null && ap.currentTime>=apStop){ ap.pause(); apStop=null; document.querySelectorAll('.bk-line.on').forEach(x=>x.classList.remove('on')); } }
    raf=requestAnimationFrame(loop); }; loop(); }
function playerHTML(track){ return `<div class="bk-player" data-track="${esc(track)}"><button class="pp">▶︎</button><div class="tr"><i></i></div><span class="tm">0:00</span><span class="lb">Track ${esc(track.replace(/^(LB|AB)/,'$1 '))}</span></div>`; }
function bindPlayer(el){
  el.querySelectorAll('.bk-player').forEach(pl=>{
    const u=mediaUrl(curPack,'audio/'+pl.dataset.track+'.mp3');
    if(!u){ pl.classList.add('miss'); pl.innerHTML=`🔇 Audio ${esc(pl.dataset.track.replace(/^(LB|AB)/,'$1 '))} fehlt noch in diesem Paket`; return; }
    pl.querySelector('.pp').onclick=()=>{ if(apOwner!==pl){ stopAudio(); apOwner=pl; ap.src=u; } apStop=null; if(ap.paused){ ap.play().catch(()=>{}); } else ap.pause(); tick(); };
    const tr=pl.querySelector('.tr');
    const seek=e=>{ const r=tr.getBoundingClientRect(); const x=((e.touches?e.touches[0].clientX:e.clientX)-r.left)/r.width; if(apOwner!==pl){ stopAudio(); apOwner=pl; ap.src=u; }
      const go=()=>{ ap.currentTime=Math.max(0,Math.min(1,x))*(ap.duration||0); }; if(ap.readyState>=1) go(); else ap.addEventListener('loadedmetadata',go,{once:true}); ap.play().catch(()=>{}); tick(); };
    tr.addEventListener('pointerdown',seek);
  });
}
function playSegment(ex,card,t0,t1,lineEl){
  const u=mediaUrl(curPack,'audio/'+ex.audio+'.mp3'); if(!u) return false;
  const pl=card.querySelector('.bk-player'); stopAudio(); apOwner=pl; ap.src=u;
  const go=()=>{ ap.currentTime=t0; ap.play().catch(()=>{}); }; if(ap.readyState>=1) go(); else ap.addEventListener('loadedmetadata',go,{once:true});
  apStop=t1; if(lineEl) lineEl.classList.add('on'); tick(); return true;
}
function sayZh(zh){ const k=zh.replace(/[！？。，、；：…\s]/g,''); if(HZ.hasWord(k)) HZ.sayWord(k); else HZ.speak(zh.replace(/[A-Za-z][A-Za-z\- ]*/g,m=>m)); }

// ---------------------------------------------------------------- section
function card(ex,inner,opts={}){
  const el=document.createElement('div'); el.className='bk-ex'+(ex.type==='note'?' bk-note':''); el.id='ex-'+ex.id;
  const no=ex.n?`<span class="no">${esc(String(ex.n).replace(/b$/,''))}</span>`:'';
  el.innerHTML=`<div class="hd">${no}<div class="ti">${esc(ex.title||'')}${ex.sub?`<small>${esc(ex.sub)}</small>`:''}</div></div>
    ${ex.audio?playerHTML(ex.audio):''}<div class="bd">${ex.img?`<img class="pic${/^(test|pinyin)/.test(ex.img)?' bkscan':''}" src="${mediaUrl(curPack,'img/'+ex.img)||''}" alt="">`:''}${inner}</div>
    ${ex.selfcheck?`<div class="bk-self">ℹ︎ ${esc(ex.selfcheck)}</div>`:''}${ex.after?`<div class="bk-self">${esc(ex.after)}</div>`:''}
    ${ex.why?`<div class="bk-why">💡 ${esc(ex.why)}</div>`:''}
    ${opts.foot===false?'':`<div class="ft"><span class="msg"></span>${opts.foot||''}</div>`}`;
  if(!ex.title && !ex.n) el.querySelector('.hd').style.display='none';
  bindPlayer(el);
  const pr=P.ex[key(ex)]; if(pr&&pr.done) el.classList.add('ok');
  return el;
}
function autoDeck(){ const p=curPack; if(!p||!p.deck||HZ.hasDeck(p.deck)) return; P.autoDecks=P.autoDecks||{}; if(P.autoDecks[p.deck]) return; P.autoDecks[p.deck]=1; saveP();
  if(HZ.addDeck(p.deck)) toast(`Die Vokabeln von ${p.unit} sind jetzt in deinen Schreibkarten.`); }
function setDone(ex,el,ok,msg){
  const m=el.querySelector('.ft .msg'); el.classList.add('checked');
  if(ok){ P.ex[key(ex)]={done:1,t:Date.now()}; saveP(); el.classList.add('ok'); autoDeck(); if(m){m.className='msg ok'; m.textContent=msg||'Alles richtig! 很好！';} }
  else { el.classList.remove('ok'); if(m){m.className='msg bad'; m.textContent=msg||'Noch nicht ganz – die roten Felder nochmal ansehen.';} }
}
function zhpy(s){ const [zh,py]=String(s).split('|'); return `<span class="zh">${esc(zh)}</span>${py?`<span class="py opt">${esc(py)}</span>`:''}`; }
const L='abcdefghijklmnop';

function renderEx(ex){
  const f=R[ex.type]; if(!f){ return card(ex,`<i>(Übungstyp ${esc(ex.type)})</i>`,{foot:false}); }
  return f(ex);
}
const R={};

R.note=ex=>card(ex,blocks(ex.blocks),{foot:false});
R.tracks=ex=>card(ex,`<div class="bk-tracks">${(ex.tracks||[]).map(t=>playerHTML(t)).join('')}</div>`,{foot:false});
function blocks(bs){ return (bs||[]).map(b=>b.p?`<p>${esc(b.p)}</p>`:b.rows?`<div class="bk-rows">${b.rows.map(r=>`<div class="bk-row"><span class="zh">${esc(r.zh)}</span>${r.py?`<span class="py">${esc(r.py)}</span>`:''}${r.de?`<span class="de">${esc(r.de)}</span>`:''}</div>`).join('')}</div>`:'').join(''); }
R.goals=ex=>card({...ex,title:'Ziele'},`<ol class="bk-goals">${ex.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`,{foot:false});

R.text=ex=>{
  const lines=ex.lines.map((l,i)=>`<button class="bk-line" data-i="${i}">${l.s?`<span class="sp">${esc(l.s)}</span>`:''}<span><span class="zh">${esc(l.zh)}</span>${l.py?`<span class="py opt" style="display:block">${esc(l.py)}</span>`:''}${l.de?`<span class="de opt" style="display:block">${esc(l.de)}</span>`:''}</span></button>`).join('');
  const el=card(ex,`<div>${lines}</div><div class="bk-self">Tippe auf eine Zeile, um sie zu hören.</div>`,{foot:false});
  el.querySelectorAll('.bk-line').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i, l=ex.lines[i];
    if(ex.audio && l.t!=null){ const nx=ex.lines.slice(i+1).find(x=>x.t!=null); if(playSegment(ex,el,Math.max(0,l.t-0.15),nx?nx.t-0.1:null,b)) return; }
    stopAudio(); HZ.speak(l.zh.replace(/[A-Za-z][A-Za-z\- ]*/g,'')); });
  return el;
};
R.vocab=ex=>{
  let h='<div class="bk-vocab">'; let g=-1;
  ex.words.forEach(([zh,py,de,x],i)=>{ if(ex.groups && x!==g && typeof x==='number'){ g=x; h+=`<div class="bk-grp">${esc(ex.groups[x])}</div>`; }
    h+=`<button class="bk-voc${x==='x'?' x':''}" data-i="${i}"><span class="zh">${esc(zh)}</span><span><span class="py" style="display:block">${esc(py)}</span>${de?`<span class="de" style="display:block">${esc(de)}</span>`:''}</span></button>`; });
  h+='</div>'+(ex.foot?`<div class="bk-self">${esc(ex.foot)}</div>`:'');
  const el=card(ex,h,{foot:false});
  el.querySelectorAll('.bk-voc').forEach(b=>b.onclick=()=>{ stopAudio(); sayZh(ex.words[+b.dataset.i][0]); });
  return el;
};

R.match=ex=>{
  const st=(P.open[key(ex)]&&P.open[key(ex)].m)||ex.left.map(()=>-1);
  const pairs=st.slice(); let sel=-1;
  const right=ex.right.map((r,i)=>({r,i}));
  const h=`<div class="bk-match"><div class="col">${ex.left.map((l,i)=>`<button class="bk-m" data-l="${i}"><span class="k">${i+1}</span>${zhpy(l)}<span style="flex:1"></span><span class="k as"></span></button>`).join('')}</div>
    <div class="col">${right.map(o=>`<button class="bk-m" data-r="${o.i}"><span class="k">${L[o.i]}</span><span class="${/[一-鿿]/.test(o.r)?'zh':''}">${esc(o.r)}</span></button>`).join('')}</div></div>`;
  const el=card(ex,h,{foot:'<button class="btn" data-a="reset">Zurücksetzen</button><button class="btn primary" data-a="check">Prüfen</button>'});
  const draw=()=>{ el.querySelectorAll('[data-l]').forEach(b=>{ const i=+b.dataset.l; b.classList.toggle('sel',i===sel); const k=b.querySelector('.as'); k.textContent=pairs[i]>=0?L[pairs[i]]:''; k.classList.toggle('set',pairs[i]>=0); });
    el.querySelectorAll('[data-r]').forEach(b=>{ const r=+b.dataset.r; const li=pairs.indexOf(r); b.querySelector('.k').classList.toggle('set',li>=0); }); };
  const clear=()=>el.querySelectorAll('.bk-m').forEach(b=>b.classList.remove('good','bad'));
  el.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ clear(); const i=+b.dataset.l; sel = sel===i?-1:i; draw(); const zh=ex.left[i].split('|')[0]; if(/[一-鿿]/.test(zh)) sayZh(zh); });
  el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ clear(); const r=+b.dataset.r; if(sel<0){ const fi=pairs.indexOf(-1); if(fi<0) return; sel=fi; }
    const prev=pairs.indexOf(r); if(prev>=0) pairs[prev]=-1; pairs[sel]=r; const nx=pairs.indexOf(-1,sel+1); sel = nx>=0?nx:pairs.indexOf(-1); draw(); P.open[key(ex)]={m:pairs}; saveP(); });
  el.querySelector('[data-a=reset]').onclick=()=>{ pairs.fill(-1); sel=0; clear(); draw(); el.classList.remove('checked'); P.open[key(ex)]={m:pairs}; saveP(); };
  el.querySelector('[data-a=check]').onclick=()=>{ let ok=0; el.querySelectorAll('[data-l]').forEach(b=>{ const i=+b.dataset.l; const g=pairs[i]===ex.ans[i]; if(g) ok++; b.classList.add(g?'good':'bad'); });
    setDone(ex,el,ok===ex.left.length, ok===ex.left.length?null:`${ok} von ${ex.left.length} richtig.`); };
  sel=pairs.indexOf(-1); draw(); return el;
};

R.choice=ex=>{
  const self=ex.items.every(it=>it.ans==null);
  ex.items.forEach(it=>{ if(it.ans==null && !self) it.selfq=1; });
  const saved=(P.open[key(ex)]&&P.open[key(ex)].c)||ex.items.map(()=>[]);
  const h=ex.items.map((it,qi)=>`<div class="bk-q" data-q="${qi}">${it.q?`<div class="q">${/[一-鿿]/.test(it.q)?`<span class="zh">${esc(it.q)}</span>`:esc(it.q)}${it.qpy?`<div class="qpy py opt">${esc(it.qpy)}</div>`:''}</div>`:''}
     <div class="bk-opts">${it.opts.map((o,oi)=>`<button class="chip2${/[一-鿿]/.test(o)?' zh':''}" data-o="${oi}">${esc(o)}</button>`).join('')}</div>${it.why?`<div class="bk-why">💡 ${esc(it.why)}</div>`:''}${it.ans==null&&!ex.items.every(x=>x.ans==null)?'<div class="bk-self">ℹ︎ Diese Teilaufgabe prüfst du selbst mit dem Audio.</div>':''}</div>`).join('')
    + (ex.items.some(it=>it.multi)?'<div class="bk-self">Mehrere Antworten möglich.</div>':'');
  const el=card(ex,h,{foot:self?'<button class="btn primary" data-a="self">Erledigt</button>':'<button class="btn primary" data-a="check">Prüfen</button>'});
  const sel=saved.map(a=>a.slice());
  const draw=()=>el.querySelectorAll('.bk-q').forEach(q=>{ const qi=+q.dataset.q; q.querySelectorAll('[data-o]').forEach(b=>b.classList.toggle('sel',sel[qi].includes(+b.dataset.o))); });
  el.querySelectorAll('.bk-q').forEach(q=>{ const qi=+q.dataset.q, it=ex.items[qi];
    q.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ const o=+b.dataset.o; q.querySelectorAll('[data-o]').forEach(x=>x.classList.remove('good','bad'));
      if(it.multi){ const i=sel[qi].indexOf(o); i>=0?sel[qi].splice(i,1):sel[qi].push(o); } else sel[qi]=[o];
      draw(); P.open[key(ex)]={c:sel}; saveP(); const t=it.opts[o]; if(/^[一-鿿]/.test(t)) sayZh(t.split(' ')[0]); }); });
  const btn=el.querySelector('[data-a]');
  btn.onclick=()=>{ if(self){ setDone(ex,el,true,'Erledigt.'); return; }
    let ok=0; el.querySelectorAll('.bk-q').forEach(q=>{ const qi=+q.dataset.q, it=ex.items[qi]; if(it.ans==null){ ok++; return; } const s=sel[qi].slice().sort().join(); const g=[it.ans||[],...(it.alts||[])].some(x=>x.slice().sort().join()===s); if(g) ok++;
      q.querySelectorAll('[data-o]').forEach(b=>{ const o=+b.dataset.o; b.classList.remove('good','bad'); if(sel[qi].includes(o)) b.classList.add((g||it.ans.includes(o))?'good':'bad'); else if(!g && it.ans.includes(o)) b.classList.add('good'); });
      q.querySelectorAll('.bk-why').forEach(w=>w.style.display='block'); });
    setDone(ex,el,ok===ex.items.length, ok===ex.items.length?null:`${ok} von ${ex.items.length} richtig. Grün markiert ist die richtige Lösung.`); };
  draw(); return el;
};

R.gap=ex=>{
  // parse items
  const gaps=[]; let html='';
  const bank=ex.bank||ex.opts||null;
  ex.items.forEach((it,ii)=>{
    let line=''; const re=/\{([^}]*)\}/g; let last=0, m;
    while((m=re.exec(it.t))){ line+=esc(it.t.slice(last,m.index)); const gi=gaps.length; gaps.push({ans:m[1].split('|'),opts:it.opts||bank,item:ii}); line+=`<button class="bk-slot" data-g="${gi}"></button>`; last=re.lastIndex; }
    line+=esc(it.t.slice(last));
    html+=`<div class="bk-gapline zh" data-it="${ii}">${line}${it.py?`<span class="py opt">${esc(it.py)}</span>`:''}${it.opts&&!bank?`<div class="bk-opts" style="line-height:1.2;margin-top:4px">${it.opts.map(o=>`<button class="chip2 zh" data-io="${esc(o)}">${esc(o)}</button>`).join('')}</div>`:''}</div>`;
  });
  const top=bank?`<div class="bk-bank">${bank.map(o=>`<button class="chip2 zh" data-b="${esc(o)}">${esc(o)}</button>`).join('')}</div>`:'';
  const el=card(ex,top+html,{foot:'<button class="btn" data-a="reset">Zurücksetzen</button><button class="btn primary" data-a="check">Prüfen</button>'});
  const val=((P.open[key(ex)]&&P.open[key(ex)].g)||gaps.map(()=>'')).slice(0,gaps.length); while(val.length<gaps.length) val.push('');
  let act=val.indexOf('');
  const draw=()=>{ el.querySelectorAll('.bk-slot').forEach(s=>{ const i=+s.dataset.g; s.textContent=val[i]; s.classList.toggle('fill',!!val[i]); s.classList.toggle('act',i===act); }); };
  const clear=()=>el.querySelectorAll('.bk-slot').forEach(s=>s.classList.remove('good','bad'));
  const put=(v,onlyItem)=>{ clear(); if(act<0||(onlyItem!=null&&gaps[act].item!==onlyItem)){ const f=gaps.findIndex((g,i)=>!val[i]&&(onlyItem==null||g.item===onlyItem)); if(f<0) return; act=f; }
    val[act]=v; P.open[key(ex)]={g:val}; saveP(); sayZh(v);
    const nx=gaps.findIndex((g,i)=>i>act&&!val[i]); act = nx>=0?nx:val.indexOf(''); draw(); };
  el.querySelectorAll('.bk-slot').forEach(s=>s.onclick=()=>{ clear(); const i=+s.dataset.g; if(act===i && val[i]){ val[i]=''; P.open[key(ex)]={g:val}; saveP(); } act=i; draw(); });
  el.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>put(b.dataset.b));
  el.querySelectorAll('[data-io]').forEach(b=>b.onclick=()=>{ const ii=+b.closest('[data-it]').dataset.it; if(act<0||gaps[act].item!==ii){ const f=gaps.findIndex((g,i)=>g.item===ii&&!val[i]); act = f>=0?f:gaps.findIndex(g=>g.item===ii); } put(b.dataset.io,ii); });
  el.querySelector('[data-a=reset]').onclick=()=>{ val.fill(''); act=0; clear(); el.classList.remove('checked'); P.open[key(ex)]={g:val}; saveP(); draw(); };
  el.querySelector('[data-a=check]').onclick=()=>{ let ok=0; el.querySelectorAll('.bk-slot').forEach(s=>{ const i=+s.dataset.g; const g=gaps[i].ans.includes(val[i]); if(g) ok++; s.classList.add(g?'good':'bad'); });
    act=-1; draw(); setDone(ex,el,ok===gaps.length, ok===gaps.length?null:`${ok} von ${gaps.length} Lücken richtig.`);
    if(ok<gaps.length){ const m=el.querySelector('.ft .msg'); const sol=document.createElement('button'); sol.className='btn'; sol.textContent='Lösung zeigen'; sol.style.marginLeft='8px';
      sol.onclick=()=>{ gaps.forEach((g,i)=>val[i]=g.ans[0]); draw(); el.querySelectorAll('.bk-slot').forEach(s=>s.classList.remove('bad')); sol.remove(); }; m.appendChild(sol); } };
  draw(); return el;
};

R.order=ex=>{
  const sepd=ex.sep==='\n';
  const state=ex.items.map(()=>[]);
  const shuf=ex.items.map(it=>{ const a=it.chunks.map((c,i)=>i); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; });
  const h=ex.items.map((it,ii)=>`<div class="bk-order" data-it="${ii}">${it.pre?`<div class="zh" style="font-size:19px;color:var(--ink2);margin-bottom:6px">${esc(it.pre)}</div>`:''}<div class="bk-ans zh${sepd?' sep':''}"></div><div class="bk-opts"></div></div>`).join('');
  const el=card(ex,h,{foot:'<button class="btn" data-a="reset">Zurücksetzen</button><button class="btn primary" data-a="check">Prüfen</button>'});
  const draw=()=>el.querySelectorAll('.bk-order').forEach(box=>{ const ii=+box.dataset.it, it=ex.items[ii];
    box.querySelector('.bk-ans').innerHTML=state[ii].map((c,pos)=>`<button class="chip2 zh" data-pos="${pos}" style="${sepd?'text-align:left':''}">${esc(it.chunks[c])}</button>`).join('')+(state[ii].length===it.chunks.length&&it.end?`<span>${esc(it.end)}</span>`:'');
    box.querySelector('.bk-opts').innerHTML=shuf[ii].map(c=>`<button class="chip2 zh${state[ii].includes(c)?' used':''}" data-c="${c}" ${state[ii].includes(c)?'disabled':''} style="${sepd?'text-align:left':''}">${esc(it.chunks[c])}</button>`).join('');
    box.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ box.querySelector('.bk-ans').classList.remove('good','bad'); state[ii].push(+b.dataset.c); draw(); });
    box.querySelectorAll('[data-pos]').forEach(b=>b.onclick=()=>{ box.querySelector('.bk-ans').classList.remove('good','bad'); state[ii].splice(+b.dataset.pos,1); draw(); }); });
  el.querySelector('[data-a=reset]').onclick=()=>{ state.forEach(s=>s.length=0); el.classList.remove('checked'); draw(); };
  el.querySelector('[data-a=check]').onclick=()=>{ let ok=0; el.querySelectorAll('.bk-order').forEach(box=>{ const ii=+box.dataset.it, it=ex.items[ii];
      const s=state[ii].map(c=>it.chunks[c]).join(sepd?'\n':''); const g=it.ans.some(a=>a.replace(/\s/g,'')===s.replace(/\s/g,'')); if(g) ok++;
      const a=box.querySelector('.bk-ans'); a.classList.add(g?'good':'bad');
      if(g) HZ.speak(s.replace(/[A-Za-z][A-Za-z\- ]*/g,'')); });
    setDone(ex,el,ok===ex.items.length, ok===ex.items.length?null:`${ok} von ${ex.items.length} richtig. Tippe auf ein Wort oben, um es wieder zu entfernen.`);
    if(ok<ex.items.length){ const m=el.querySelector('.ft .msg'); const sol=document.createElement('button'); sol.className='btn'; sol.textContent='Lösung zeigen'; sol.style.marginLeft='8px';
      sol.onclick=()=>{ el.querySelectorAll('.bk-order').forEach(box=>{ const it=ex.items[+box.dataset.it]; const a=box.querySelector('.bk-ans'); if(a.classList.contains('bad')){ a.innerHTML=`<span style="color:var(--jade)">${esc(it.ans[0]).replace(/\n/g,'<br>')}${esc(it.end||'')}</span>`; } }); sol.remove(); }; m.appendChild(sol); } };
  draw(); return el;
};

const INITS=['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','r','z','c','s','y','w'];
function initLen(syl){ const s=syl.normalize('NFD').replace(/[̀-ͯ]/g,''); const i=INITS.find(x=>s.startsWith(x)); return i?i.length:0; }
R.seg=ex=>{
  const sel=ex.items.map(()=>null);
  const h=`<div class="bk-seg">${ex.items.map((s,i)=>`<div class="bk-syl" data-i="${i}">${Array.from(s).map((c,ci)=>`<button data-c="${ci}">${esc(c)}</button>`).join('')}</div>`).join('')}</div>
    <div class="bk-self">Tippe auf den letzten Buchstaben des ${ex.mode==='init'?'Anlauts':'ersten Buchstabens des Auslauts'}.</div>`;
  const el=card(ex,h,{foot:'<button class="btn primary" data-a="check">Prüfen</button>'});
  el.querySelector('.bk-self').textContent= ex.mode==='init' ? 'Tippe auf den letzten Buchstaben des Anlauts (z. B. h bei „zh“).' : 'Tippe auf den ersten Buchstaben des Auslauts.';
  const draw=()=>el.querySelectorAll('.bk-syl').forEach(b=>{ const i=+b.dataset.i; const n=Array.from(ex.items[i]).length; b.querySelectorAll('button').forEach(x=>{ const c=+x.dataset.c; x.classList.toggle('on', sel[i]!=null && (ex.mode==='init'? c<=sel[i] : c>=sel[i])); }); });
  el.querySelectorAll('.bk-syl').forEach(b=>b.querySelectorAll('button').forEach(x=>x.onclick=()=>{ const i=+b.dataset.i; b.classList.remove('good','bad'); sel[i]=+x.dataset.c; draw(); }));
  el.querySelector('[data-a=check]').onclick=()=>{ let ok=0; el.querySelectorAll('.bk-syl').forEach(b=>{ const i=+b.dataset.i; const L0=initLen(ex.items[i]);
      const want = ex.mode==='init' ? L0-1 : L0; const g=sel[i]===want; if(g) ok++; b.classList.add(g?'good':'bad'); });
    setDone(ex,el,ok===ex.items.length, ok===ex.items.length?null:`${ok} von ${ex.items.length} richtig.`); };
  return el;
};

R.tone=ex=>{
  const tones=ex.neutral?[1,2,3,4,5]:[1,2,3,4];
  const sel=ex.items.map(()=>0);
  const h=ex.items.map(([zh,py],i)=>`<div class="bk-tone" data-i="${i}"><span class="zh">${esc(zh)}</span>${tones.map(t=>`<button class="chip2" data-t="${t}">${esc(HZ.syl2dia(py+t).s)}</button>`).join('')}</div>`).join('');
  const el=card(ex,h,{foot:'<button class="btn primary" data-a="check">Prüfen</button>'});
  el.querySelectorAll('.bk-tone').forEach(r=>r.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ const i=+r.dataset.i; sel[i]=+b.dataset.t; r.querySelectorAll('[data-t]').forEach(x=>{ x.classList.remove('good','bad'); x.classList.toggle('sel',x===b); }); }));
  el.querySelector('[data-a=check]').onclick=()=>{ let ok=0; el.querySelectorAll('.bk-tone').forEach(r=>{ const i=+r.dataset.i; const want=ex.items[i][2]||5; const g=sel[i]===want; if(g) ok++;
      r.querySelectorAll('[data-t]').forEach(x=>{ const t=+x.dataset.t; x.classList.remove('good','bad'); if(t===sel[i]) x.classList.add(g?'good':'bad'); else if(!g&&t===want) x.classList.add('good'); }); });
    setDone(ex,el,ok===ex.items.length, ok===ex.items.length?null:`${ok} von ${ex.items.length} richtig. Grün ist der richtige Ton.`); };
  return el;
};

R.sort=ex=>{
  const as=ex.items.map(()=>-1); let sel=-1;
  const h=`<div class="bk-opts" data-pool style="margin-bottom:10px"></div><div class="bk-cats">${ex.cats.map((c,ci)=>`<button class="bk-cat" data-cat="${ci}"><b>${esc(c)}</b><span class="in" style="display:flex;gap:6px;flex-wrap:wrap"></span></button>`).join('')}</div>
    <div class="bk-self">Tippe auf ein Zeichen und dann auf die passende Zeile.</div>`;
  const el=card(ex,h,{foot:'<button class="btn primary" data-a="check">Prüfen</button>'});
  const draw=()=>{ el.querySelector('[data-pool]').innerHTML=ex.items.map((x,i)=>as[i]<0?`<button class="chip2 zh${i===sel?' sel':''}" data-x="${i}">${esc(x)}</button>`:'').join('')||'<span class="bk-self">Alle Zeichen sind einsortiert.</span>';
    el.querySelectorAll('.bk-cat').forEach(c=>{ const ci=+c.dataset.cat; c.querySelector('.in').innerHTML=ex.items.map((x,i)=>as[i]===ci?`<span class="chip2 zh${i===sel?' sel':''}" data-x="${i}">${esc(x)}</span>`:'').join(''); });
    el.querySelectorAll('[data-x]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const i=+b.dataset.x; sel=i; sayZh(ex.items[i]); el.querySelectorAll('.chip2').forEach(x=>x.classList.remove('good','bad')); draw(); }); };
  el.querySelectorAll('.bk-cat').forEach(c=>c.onclick=()=>{ if(sel<0) return; as[sel]=+c.dataset.cat; sel=as.indexOf(-1); draw(); });
  el.querySelector('[data-a=check]').onclick=()=>{ let ok=0; draw(); el.querySelectorAll('.bk-cat [data-x]').forEach(b=>{ const i=+b.dataset.x; const g=as[i]===ex.ans[i]; if(g) ok++; b.classList.add(g?'good':'bad'); });
    setDone(ex,el,ok===ex.items.length, ok===ex.items.length?null:`${ok} von ${ex.items.length} richtig einsortiert.`); };
  sel=0; draw(); return el;
};

R.pinyin=ex=>{
  const h=ex.items.map(([zh],i)=>`<div class="bk-pin" data-i="${i}"><span class="zh">${esc(zh)}</span><input autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="z. B. ni3 hao3 oder nǐ hǎo"><span class="sol"></span></div>`).join('')
    + `<div class="bk-self">Töne kannst du als Zahl (ni3) oder mit Tonzeichen (nǐ) eingeben.</div>`;
  const el=card(ex,h,{foot:'<button class="btn primary" data-a="check">Prüfen</button>'});
  const norm=s=>{ const p=HZ.parsePy(s); return p.letters+'|'+p.tones.filter(t=>t!==5).join(''); };
  el.querySelector('[data-a=check]').onclick=()=>{ let ok=0; el.querySelectorAll('.bk-pin').forEach(r=>{ const i=+r.dataset.i; const inp=r.querySelector('input'); const g=norm(inp.value)===norm(ex.items[i][1]); if(g) ok++;
      inp.classList.remove('good','bad'); inp.classList.add(g?'good':'bad'); r.querySelector('.sol').textContent=g?'':ex.items[i][1]; });
    setDone(ex,el,ok===ex.items.length, ok===ex.items.length?null:`${ok} von ${ex.items.length} richtig.`); };
  return el;
};

R.open=ex=>{
  const txt=ex.text?`<div style="margin-bottom:10px">${ex.text.map(l=>`<button class="bk-line"><span><span class="zh">${esc(l.zh)}</span>${l.py?`<span class="py opt" style="display:block">${esc(l.py)}</span>`:''}${l.de?`<span class="de opt" style="display:block">${esc(l.de)}</span>`:''}</span></button>`).join('')}</div>`:'';
  const model=ex.model?`<div class="bk-model"><div class="bk-self" style="margin-bottom:4px">Mögliche Lösung:</div><div class="bk-rows">${ex.model.map(r=>`<div class="bk-row"><span class="zh">${esc(r.zh)}</span>${r.py?`<span class="py">${esc(r.py)}</span>`:''}${r.de?`<span class="de">${esc(r.de)}</span>`:''}</div>`).join('')}</div></div>`:'';
  const el=card(ex,`${txt}<textarea placeholder="Deine Antwort (optional) …"></textarea>${model}`,{foot:`${ex.model?'<button class="btn" data-a="model">Lösung zeigen</button>':''}<button class="btn primary" data-a="done">Erledigt</button>`});
  const ta=el.querySelector('textarea'); ta.value=(P.open[key(ex)]&&P.open[key(ex)].t)||''; ta.oninput=()=>{ P.open[key(ex)]={t:ta.value}; saveP(); };
  el.querySelectorAll('.bk-line').forEach((b,i)=>b.onclick=()=>HZ.speak(ex.text[i].zh.replace(/[A-Za-z][A-Za-z\- ]*/g,'')));
  el.querySelectorAll('.bk-model .bk-row').forEach((b,i)=>b.onclick=()=>HZ.speak(ex.model[i].zh.replace(/[A-Za-z……()（）]+/g,'')));
  const mb=el.querySelector('[data-a=model]'); if(mb) mb.onclick=()=>el.classList.toggle('showmodel');
  el.querySelector('[data-a=done]').onclick=()=>setDone(ex,el,true,'Erledigt.');
  return el;
};

R.rating=ex=>{
  const k=key(ex); const r=P.rate[k]||{};
  const h=`<div class="bk-self" style="margin-bottom:8px">${ex.scale.map((s,i)=>`${i+1} = ${esc(s)}`).join(' · ')}</div><div class="bk-rate">${ex.items.map(([t,d],i)=>`<div class="r" data-i="${i}"><b>${esc(t)}</b><span>${esc(d)}</span><div class="opts">${[1,2,3,4,5].map(n=>`<button data-n="${n}" class="${r[i]===n?'on':''}">${n}</button>`).join('')}</div></div>`).join('')}</div>`;
  const el=card(ex,h,{foot:false});
  el.querySelectorAll('.r').forEach(row=>row.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{ const i=+row.dataset.i; r[i]=+b.dataset.n; P.rate[k]=r;
    if(Object.keys(r).length>=ex.items.length) P.ex[k]={done:1,t:Date.now()}; saveP(); row.querySelectorAll('[data-n]').forEach(x=>x.classList.toggle('on',x===b)); if(P.ex[k]) el.classList.add('ok'); }));
  return el;
};

// ---------------------------------------------------------------- writing practice
R.write=ex=>{
  const k=key(ex); const done=(P.open[k]&&P.open[k].w)||{};
  const h=`<div class="bk-write">${ex.chars.map(([zh,py],i)=>`<button class="bk-wc${done[zh]?' done':''}" data-i="${i}"><span class="zh">${esc(zh)}</span><span class="py">${esc(py)}</span></button>`).join('')}</div>
   <div class="bk-self">Tippe auf ein Zeichen: zuerst mit Vorlage nachzeichnen, dann zweimal aus dem Gedächtnis.</div>`;
  const el=card(ex,h,{foot:'<button class="btn primary" data-a="all">Alle nacheinander üben</button>'});
  const upd=()=>{ el.querySelectorAll('.bk-wc').forEach(b=>{ const zh=ex.chars[+b.dataset.i][0]; b.classList.toggle('done',!!done[zh]); });
    if(ex.chars.every(c=>done[c[0]])){ P.ex[k]={done:1,t:Date.now()}; el.classList.add('ok'); } P.open[k]={w:done}; saveP(); };
  el.querySelectorAll('.bk-wc').forEach(b=>b.onclick=()=>writeSeq(ex.chars.slice(+b.dataset.i,+b.dataset.i+1),zh=>{done[zh]=1;upd();}));
  el.querySelector('[data-a=all]').onclick=()=>writeSeq(ex.chars,zh=>{done[zh]=1;upd();});
  return el;
};
let ww=null, wq=null;
function writeSeq(list,onDone){
  wq={list:list.filter(c=>window.CHARS&&window.CHARS[c[0]]),i:0,round:0,onDone};
  if(!wq.list.length){ toast('Für diese Zeichen gibt es keine Strichdaten.'); return; }
  $('bkWrite').classList.add('show'); startW();
}
function wsize(){ return Math.min(440, window.innerWidth-60, window.innerHeight-260); }
function gridSvg(s){ const d='stroke="#e6dccb" stroke-dasharray="5 6" stroke-width="1"'; return `<line x1="0" y1="${s/2}" x2="${s}" y2="${s/2}" ${d}/><line x1="${s/2}" y1="0" x2="${s/2}" y2="${s}" ${d}/><line x1="0" y1="0" x2="${s}" y2="${s}" ${d}/><line x1="${s}" y1="0" x2="0" y2="${s}" ${d}/>`; }
function startW(){
  const [zh,py,de]=wq.list[wq.i]; const s=wsize();
  $('bkWzh').textContent=zh; $('bkWpy').textContent=py; $('bkWde').textContent=de||'';
  const pad=$('bkWpad'); pad.style.width=pad.style.height=s+'px'; $('bkWgrid').setAttribute('viewBox',`0 0 ${s} ${s}`); $('bkWgrid').setAttribute('width',s); $('bkWgrid').setAttribute('height',s); $('bkWgrid').innerHTML=gridSvg(s);
  $('bkWhw').innerHTML='';
  ww=HanziWriter.create('bkWhw',zh,{width:s,height:s,padding:Math.round(s*.06),showCharacter:false,showOutline:wq.round===0,strokeColor:'#1f1b16',outlineColor:'#e4dccd',drawingColor:'#1f1b16',
    drawingWidth:Math.max(14,Math.round(s/26)),highlightColor:'#b8321f',charDataLoader:(c,ok,err)=>{const d=window.CHARS[c];d?ok(d):err(new Error('no data'));}});
  $('bkWmsg').textContent= (wq.round===0?'Nachzeichnen mit Vorlage':`Aus dem Gedächtnis (${wq.round}/2)`) + (wq.list.length>1?` · Zeichen ${wq.i+1} von ${wq.list.length}`:'');
  try{ const x=wq.list[wq.i][0]; if(HZ.hasWord(x)) HZ.sayWord(x); else HZ.speak(x); }catch(e){}
  ww.quiz({leniency:1.4,showHintAfterMisses:wq.round===0?1:3,onComplete:()=>{ setTimeout(()=>{ if(!wq) return; wq.round++; if(wq.round>2){ wq.onDone(wq.list[wq.i][0]); wq.round=0; wq.i++; if(wq.i>=wq.list.length){ $('bkWmsg').textContent='Geschafft! 很好！'; try{HZ.confetti&&wq.list.length>3&&HZ.confetti();}catch(e){} setTimeout(closeW,900); return; } } startW(); },500); }});
}
function closeW(){ try{ww&&ww.cancelQuiz();}catch(e){} wq=null; $('bkWrite').classList.remove('show'); }
$('bkWclose').onclick=closeW;
$('bkWagain').onclick=()=>{ if(wq){ wq.round=0; startW(); } };
$('bkWshow').onclick=()=>{ if(!ww) return; try{ ww.cancelQuiz(); }catch(e){} ww.animateCharacter({onComplete:()=>{ if(wq) startW(); }}); };

// ---------------------------------------------------------------- page viewer
let pv=null;
function openPages(pack,book,idx,pageNo){
  const list=(pack.pages||[]).filter(x=>x.b===book).sort((a,b)=>a.p[0]-b.p[0]);
  if(!list.length) return;
  if(pageNo!=null){ const k=list.findIndex(x=>x.p.includes(pageNo)); if(k>=0) idx=k; }
  pv={pack,book,list,i:Math.max(0,Math.min(idx||0,list.length-1))}; curPack=pack;
  proot.classList.add('show'); proot.classList.remove('zoom'); showPage();
}
function showPage(){
  const {pack,book,list,i}=pv, pg=list[i];
  const lbl=pg.p.length>1?`S. ${pg.p[0]}–${pg.p[pg.p.length-1]}`:`S. ${pg.p[0]}`;
  $('pgTitle').textContent=`${pack.unit} · ${book==='LB'?'Lehrbuch':'Arbeitsbuch'}`; $('pgLbl').textContent=lbl;
  $('pgImg').src=mediaUrl(pack,pg.img)||''; $('pgView').scrollTop=0; $('pgView').scrollLeft=0; hotStop(); $('pgHot').innerHTML=hotHTML(pg); hotBind($('pgHot'),pack,pg); layHot();
  $('pgPrev').disabled=i===0; $('pgNext').disabled=i===list.length-1;
  $('pgPrev').style.opacity=i===0?.3:1; $('pgNext').style.opacity=i===list.length-1?.3:1;
  const secs=secsForPages(pack,book,pg.p);
  const tracks=[]; secs.forEach(x=>x.s.ex.forEach(e=>{ if(e.audio&&!tracks.includes(e.audio)&&mediaUrl(pack,'audio/'+e.audio+'.mp3')) tracks.push(e.audio); }));
  tracks.sort((a,b)=>(+a.replace(/\D/g,''))-(+b.replace(/\D/g,'')));
  const ch=$('pgChips'); ch.innerHTML=tracks.map(t=>`<button class="chip3" data-tr="${t}">▶︎ Track ${t.replace(/^(LB|AB)/,'')}</button>`).join('')+secs.map(x=>`<button class="chip3 ex" data-pi="${x.pi}" data-si="${x.si}">✎ ${esc(x.s.title.replace(/^.*·\s*/,''))}</button>`).join('');
  ch.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{ const u=mediaUrl(pack,'audio/'+b.dataset.tr+'.mp3');
    if(b.classList.contains('on')){ ap.pause(); b.classList.remove('on'); b.textContent='▶︎ Track '+b.dataset.tr.replace(/^(LB|AB)/,''); return; }
    stopAudio(); ch.querySelectorAll('[data-tr]').forEach(x=>{ x.classList.remove('on'); x.textContent='▶︎ Track '+x.dataset.tr.replace(/^(LB|AB)/,''); });
    ap.src=u; ap.play().catch(()=>{}); b.classList.add('on'); b.textContent='❚❚ Track '+b.dataset.tr.replace(/^(LB|AB)/,'');
    ap.onended=()=>{ b.classList.remove('on'); b.textContent='▶︎ Track '+b.dataset.tr.replace(/^(LB|AB)/,''); }; });
  ch.querySelectorAll('[data-si]').forEach(b=>b.onclick=()=>{ stopAudio(); closePages(); root.classList.add('show'); applyView(); openSection(pack,+b.dataset.pi,+b.dataset.si); });
}
function layHot(){ const im=$('pgImg'), h=$('pgHot'); if(!im||!h) return; h.style.left=im.offsetLeft+'px'; h.style.top=im.offsetTop+'px'; h.style.width=im.offsetWidth+'px'; h.style.height=im.offsetHeight+'px'; }
$('pgImg').addEventListener('load',layHot); window.addEventListener('resize',layHot); try{ new ResizeObserver(layHot).observe($('pgImg')); }catch(e){}
function closePages(){ hotStop(); try{ap.pause();}catch(e){} ap.onended=null; proot.classList.remove('show'); }
function pgGo(d){ if(!pv) return; const n=pv.i+d; if(n<0||n>=pv.list.length) return; hotStop(); try{ap.pause();}catch(e){} pv.i=n; proot.classList.remove('zoom'); showPage(); }
$('pgPrev').onclick=()=>pgGo(-1); $('pgNext').onclick=()=>pgGo(1);
$('pgClose').onclick=()=>{ closePages(); if(root.classList.contains('show')) showHome(); };
$('pgZoom').onclick=()=>proot.classList.toggle('zoom');
{ let lastTap=0, sx=0, sy=0, t0=0;
  $('pgView').addEventListener('touchstart',e=>{ if(e.touches.length!==1) return; sx=e.touches[0].clientX; sy=e.touches[0].clientY; t0=Date.now(); },{passive:true});
  $('pgView').addEventListener('touchend',e=>{ const t=e.changedTouches[0]; const dx=t.clientX-sx, dy=t.clientY-sy;
    if(!proot.classList.contains('zoom') && Math.abs(dx)>70 && Math.abs(dx)>2*Math.abs(dy) && Date.now()-t0<700){ pgGo(dx<0?1:-1); return; }
    if(e.target&&e.target.closest&&e.target.closest('.bk-hot')){ lastTap=0; return; }
    if(Math.abs(dx)<10&&Math.abs(dy)<10){ const now=Date.now(); if(now-lastTap<320){ proot.classList.toggle('zoom'); lastTap=0; } else lastTap=now; } },{passive:true});
  $('pgImg').addEventListener('dblclick',()=>proot.classList.toggle('zoom'));
  document.addEventListener('keydown',e=>{ if(!proot.classList.contains('show')) return; if(e.key==='ArrowRight') pgGo(1); if(e.key==='ArrowLeft') pgGo(-1); if(e.key==='Escape') $('pgClose').click(); });
}
// per section: button to the book pages
function pageButton(pack,pi,si){ const s=pack.parts[pi].sections[si], book=pack.parts[pi].id; const [a]=pageRange(s.page);
  if(!(pack.pages||[]).some(x=>x.b===book&&x.p.includes(a))) return null;
  const b=document.createElement('button'); b.className='btn'; b.textContent='📄 Buchseite'; b.onclick=()=>{ stopAudio(); openPages(pack,book,0,a); }; return b; }

// "Im Buch weiterlernen" on the flashcards' done screen
{ const tools=document.querySelector('#empty .tools'); if(tools){ const b=document.createElement('button'); b.className='btn'; b.textContent='📖 Im Buch weiterlernen'; b.onclick=()=>openBook(); tools.appendChild(b); } }

//@@PATH@@
window.HZBook={open:openBook};
})();
