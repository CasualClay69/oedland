"use strict";
// =====================================================
//  SPIELLOGIK: Produktion, Plündern, Herstellen, Kampf, Überfälle und der Takt (tick).
// =====================================================

function rates(){const r={};const add=(k,v)=>{if(v)r[k]=(r[k]||0)+v};
 add('wasser',lv('filter')*.2);add('nahrung',lv('garten')*.15);add('chemie',lv('labor')*.03);add('elektronik',lv('generator')*.02);
 const eff=S.starving?.5:1;
 for(const j in JOBS){const n=S.surv.jobs[j]||0;if(n&&JOBS[j].prod)for(const k in JOBS[j].prod)add(k,JOBS[j].prod[k]*n*eff)}
 const up=S.surv.total*.06;add('nahrung',-up);add('wasser',-up);return r}
function produce(dt){const r=rates();let st=false;for(const k in r){S.res[k]+=r[k]*dt;if(S.res[k]<0){S.res[k]=0;st=true}}
 const was=S.starving;S.starving=st&&S.surv.total>0;if(was!==S.starving)markDirty()}

function scavDur(z){return z.t*(S.owned.rucksack?.85:1)/(1+(lvl('plundern')-1)*.01)}
function doScav(dt,off){const a=S.act,z=ZS.find(x=>x.id===a.id);if(!z){S.act=null;return}a.p+=dt;const d=scavDur(z);
 while(a.p>=d){a.p-=d;const bonus=S.owned.brecheisen?1.2:1,got={};
  for(const [k,mn,mx,c] of z.loot)if(Math.random()<Math.min(1,c*bonus)){const n=rnd(mn,mx);S.res[k]+=n;got[k]=(got[k]||0)+n}
  if(Math.random()<.03){const n=rnd(3,10)*Math.ceil(z.lvl/5+1);S.res.kronkorken+=n;got.kronkorken=(got.kronkorken||0)+n;log(`📦 Versteckte Kiste in ${z.n}: +${n} 🪙`,'g');if(!off)toast(`📦 Versteckte Kiste! +${n} 🪙`,'good')}
  S.stats.scav[z.id]=(S.stats.scav[z.id]||0)+1;a.last=lootStr(got);gainXp('plundern',z.xp,off)}}

function doCraft(dt,off){const a=S.act,r=IT[a.id];
 if(!a.paid){if(!canPay(r.cost)){if(!off)toast('Nicht genug Material.','bad');S.act=null;markDirty();return}pay(r.cost);a.paid=true}
 a.p+=dt;if(a.p<r.t)return;a.p=0;a.paid=false;S.stats.crafted[a.id]=(S.stats.crafted[a.id]||0)+1;gainXp('handwerk',r.xp,off);
 if(r.gives){give(r.gives);a.n=(a.n||0)+1}
 else{S.owned[a.id]=1;if(r.typ==='waffe'||r.typ==='ruestung')S.eq[r.typ]=a.id;S.act=null;msg(`${r.i} ${r.n} ${r.typ==='mod'?'eingebaut':'fertig'}${r.typ==='waffe'||r.typ==='ruestung'?' und ausgerüstet':''}!`,'good');markDirty()}}

function startFight(id,boss){S.act={type:'fight',id,ek:null,eh:0,pt:0,et:0,w:.6,boss:!!boss,fl:[]};render()}
function flog(m){const a=S.act;if(!a||a.type!=='fight')return;a.fl.unshift(m);if(a.fl.length>6)a.fl.length=6}
function spawn(){const a=S.act,z=FZ.find(x=>x.id===a.id);const k=a.boss?z.boss:z.en[rnd(0,z.en.length-1)];a.ek=k;a.eh=EN[k].hp;a.pt=0;a.et=.3;flog(`${EN[k].i} ${EN[k].n} taucht auf!`)}
function heal(t,quiet){if(S.res[t]<1)return false;const m=maxHp();if(S.hp>=m)return false;S.res[t]--;const h=t==='medkit'?Math.round(m*.6):Math.round(30+m*.1);S.hp=Math.min(m,S.hp+h);flog(`${R[t][1]} +${h} HP`);return true}
function autoHeal(){if(!S.autoHeal)return;const m=maxHp();if(S.hp>=m*.35)return;const vh=30+m*.1;
 if(S.res.medkit>0&&(m-S.hp>vh*2||S.res.verband<1))heal('medkit');else if(S.res.verband>0)heal('verband');else heal('medkit')}
function doFight(dt){const a=S.act;if(!a.ek){a.w-=dt;if(a.w<=0)spawn();return}
 const e=EN[a.ek],w=weapon();a.pt+=dt;a.et+=dt;
 const wspd=w.spd*(S.owned.daempfer?.9:1);
 if(a.pt>=wspd){a.pt-=wspd;let mn=w.min,mx=w.max;
  if(w.ammo){if(S.res.munition>=1)S.res.munition--;else{mn=2;mx=4;if(!a.na){flog('🔸 Keine Munition – Kolbenhieb!');a.na=1}}}
  if(Math.random()<(S.owned.zielfernrohr?.98:.9)){const krit=S.owned.praezision&&Math.random()<.1;
   const roh=rnd(mn,mx)*(1+(lvl('kampf')-1)*.02)*(S.owned.plasmaladung?1.15:1)*(krit?2:1);
   const d=Math.max(1,Math.round(roh-e.def*(S.owned.panzerbrecher?.7:1)));a.eh-=d;flog(krit?`💥 Kritisch: −${d}`:`Du triffst: −${d}`)}else flog('Du verfehlst.');
  if(a.eh<=0){kill(a,e);return}}
 if(a.et>=e.spd){a.et-=e.spd;
  if(Math.random()<.8){const d=Math.max(1,Math.round(e.atk*(.8+Math.random()*.4)-armor().def));S.hp-=d;flog(`${e.n} trifft dich: −${d}`)}else flog(`${e.n} verfehlt.`);
  if(S.hp<=0){die(e);return}autoHeal()}}
function kill(a,e){const k=a.ek,got={};for(const [r,mn,mx,c] of e.loot)if(Math.random()<c){const n=rnd(mn,mx);S.res[r]+=n;got[r]=(got[r]||0)+n}
 S.stats.kills[a.id]=(S.stats.kills[a.id]||0)+1;gainXp('kampf',e.xp);flog(`✔ ${e.n} besiegt! ${lootStr(got)}`);a.last=lootStr(got);
 dropBeute(FZ.find(z=>z.id===a.id),!!e.boss);
 if(e.boss){S.stats.boss[k]=(S.stats.boss[k]||0)+1;a.boss=false;msg(`🏆 ${e.n} besiegt! ${lootStr(got)}`,'good');markDirty()}
 else if((S.stats.kills[a.id]===BOSS_KILLS)&&FZ.find(z=>z.id===a.id).boss){toast('⚠️ Ein Boss ist erschienen!','bad');markDirty()}
 a.ek=null;a.w=1}
function die(e){S.stats.deaths++;const lost=Math.floor(S.res.kronkorken*.1);S.res.kronkorken-=lost;S.hp=1;S.act=null;msg(`💀 ${e.n} hat dich niedergestreckt. Du schleppst dich zurück (−${lost} 🪙).`,'bad');markDirty()}

function raid(){S.raidT=rnd(240,420);const p=Math.round(raidPower()*(.8+Math.random()*.4)),d=defense();
 if(d>=p){const c=Math.round(p/2);S.res.kronkorken+=c;S.stats.raidsWon++;msg(`🛡️ Überfall abgewehrt! (${d} gegen ${p}) +${c} 🪙`,'good')}
 else{const lost={};for(const k of['schrott','nahrung','wasser']){const n=Math.floor(S.res[k]*.2);S.res[k]-=n;lost[k]=n}S.stats.raidsLost++;msg(`🔥 Raider haben die Basis geplündert! (${d} gegen ${p}) Verloren: ${lootStr(lost)}`,'bad')}
 markDirty()}

function tick(dt,off){produce(dt);
 const a=S.act;if(a){if(a.type==='scav')doScav(dt,off);else if(a.type==='craft')doCraft(dt,off);else if(a.type==='fight'&&!off)doFight(dt)}
 const f=S.act&&S.act.type==='fight';S.hp=Math.min(maxHp(),S.hp+((f?0:1.5)+lv('kranken')*.5)*dt);
 if(!off&&S.surv.total>0){S.raidT-=dt;if(S.raidT<=0)raid()}}
function checkQuest(){const q=Q[S.q];const d=!!(q&&q.c());if(d!==S._qd){if(d)toast('📜 Auftrag erfüllt – Belohnung in der Basis abholen!','good');S._qd=d;markDirty()}}
