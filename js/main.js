"use strict";
// =====================================================
//  START: Spielstand laden, Offline-Fortschritt nachrechnen, Takt starten, beim Verlassen speichern.
// =====================================================

load();
if(S.act&&S.act.type==='fight')S.act=null;
(function offline(){const el=Math.min(8*3600,(Date.now()-S.last)/1000);if(el<30)return;const before=Object.assign({},S.res);
 for(let t=0;t<el;t+=1)tick(Math.min(1,el-t),true);
 const g={};for(const k in S.res){const d=Math.floor(S.res[k]-before[k]);if(d>0)g[k]=d}
 const hrs=el>=3600?`${Math.floor(el/3600)} Std. ${Math.floor(el%3600/60)} Min.`:`${Math.floor(el/60)} Min.`;
 modal(`<h3>Willkommen zurück</h3><p class="mut">Du warst ${hrs} weg. In der Zwischenzeit:</p><p style="font-size:16px">${lootStr(g)}</p>`)})();
render();
let lastT=Date.now();
setInterval(()=>{const now=Date.now();let dt=Math.min((now-lastT)/1000,8*3600);lastT=now;
 while(dt>0){const s=Math.min(dt>60?1:.25,dt);tick(s,dt>60);dt-=s}
 checkQuest();if(dirty){dirty=false;render()}else upd();
 if(now-S.last>10000)save()},200);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
window.addEventListener('pagehide',save);
