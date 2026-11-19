"use strict";
// =====================================================
//  ANZEIGE: die Tabs (Basis, Plündern, Werkbank, Kampf, Profil) und die laufende Aktualisierung.
// =====================================================

const TABS=[['basis','🏚️','Basis'],['scav','🔦','Plündern'],['craft','🔧','Werkbank'],['fight','⚔️','Kampf'],['profil','👤','Profil']];
function item(icon,title,lvTxt,desc,bottom,cls=''){return `<div class="card ${cls}"><div class="ih"><span class="ic">${icon}</span><div><b>${title}</b>${lvTxt?`<span class="lv">${lvTxt}</span>`:''}<div class="mut sm">${desc}</div></div></div>${bottom?`<div class="row">${bottom}</div>`:''}</div>`}

function rBasis(){let h='';const q=Q[S.q];
 if(q){const d=q.c();h+=`<div class="card quest"><div class="qh">📜 Auftrag ${S.q+1}/${Q.length}: <b>${q.t}</b></div><p class="mut">${q.s}</p><div class="goal">${d?'✅':'⬜'} ${q.g}</div><div class="row"><span class="mut sm">Belohnung: ${lootStr(q.r)}</span>${d?'<button class="btn acc" data-a="claim">Abholen</button>':''}</div></div>`}
 else h+=`<div class="card quest"><div class="goal">🏆 Alle Aufträge erledigt!</div><p class="mut">Der Koloss ist gefallen. Das Ödland gehört dir – aber es ist noch längst nicht leer. Bau weiter, sammle weiter, überlebe.</p></div>`;
 h+=`<div class="card"><h3>Versorgung</h3><div data-b="rates"></div></div>`;
 h+='<h2>Unterschlupf</h2>';
 for(const id in BU){const B=BU[id],l=lv(id),mx=B.max&&l>=B.max;
  if(!breq(id)){h+=item(B.i,B.n,'',B.d,`<span class="mut sm">🔒 Benötigt ${BU[B.req[0]].n} Stufe ${B.req[1]}</span>`,'lock');continue}
  const c=bcost(id);h+=item(B.i,B.n,`Stufe ${l}${B.max?'/'+B.max:''}`,B.d,mx?'<span class="mut sm">✓ Maximal ausgebaut</span>':`${costHtml(c)}<button class="btn acc" data-a="build" data-v="${id}" ${cAttr(c)}>${l?'Ausbauen':'Bauen'}</button>`)}
 if(S.q>=5||S.surv.total>0){const cap=survCap(),rc=recruitCost();
  h+=`<h2>Überlebende</h2><div class="card"><div class="row" style="margin-top:0"><div><b>${S.surv.total}/${cap}</b> Bewohner · <span class="mut">${idle()} untätig</span><div class="mut sm">Jeder verbraucht 0,06 🥫 und 0,06 💧 pro Sekunde.</div></div>${S.surv.total<cap?`<button class="btn acc" data-a="recruit" ${cAttr(rc)}>Aufnehmen 🪙${fmt(rc.kronkorken)}</button>`:'<span class="mut sm">Kein Platz – baue Baracken</span>'}</div>`;
  if(S.surv.total>0){h+='<div class="jobs" style="margin-top:10px">';for(const j in JOBS){const J=JOBS[j];if(J.req&&!lv(J.req))continue;const n=S.surv.jobs[j]||0;
   h+=`<div class="jr"><span class="ic" style="font-size:20px">${J.i}</span><div class="jn"><b>${J.n}</b><div class="mut sm">${J.d}</div></div><button class="btn sm" data-a="jobm" data-v="${j}" ${n?'':'disabled'}>−</button><span class="cnt">${n}</span><button class="btn sm" data-a="jobp" data-v="${j}" ${idle()>0?'':'disabled'}>+</button></div>`}
   h+='</div>'}
  h+='</div>';
  if(S.surv.total>0)h+=`<h2>Verteidigung</h2><div class="card"><div class="grid2"><div class="stat"><span class="mut sm">Nächster Überfall</span><b data-b="raid"></b></div><div class="stat"><span class="mut sm">Verteidigung / Angreifer</span><b data-b="def"></b></div></div><div class="mut sm" style="margin-top:8px">Mauern, Wachen und dein Kampf-Level schützen die Basis. Verlierst du, rauben die Raider 20 % deiner Vorräte.</div></div>`}
 if(lv('funk')>0){h+='<h2>Händler</h2>';TR.forEach((t,i)=>{if(lv('funk')<t.l)return;h+=`<div class="card" style="padding:10px 12px"><div class="row" style="margin:0"><span>${lootStr(t.g)} → <b>${lootStr(t.t)}</b></span><button class="btn sm" data-a="trade" data-v="${i}" ${cAttr(t.g)}>Tauschen</button></div></div>`})}
 return h}

function rScav(){let h=`<h2>Plünderziele</h2><div class="mut sm" style="margin:-4px 4px 10px">Plündern läuft automatisch weiter – auch wenn du die Seite schließt (bis zu 8 Std.).</div>`;
 for(const z of ZS){const on=S.act&&S.act.type==='scav'&&S.act.id===z.id;const ok=zoneOpen(z,'plundern');
  const info=`${z.d}<div class="loot">${z.loot.map(l=>R[l[0]][1]).join(' ')} · ${dec(scavDur(z),1)} s · +${z.xp} XP</div>`;
  if(!ok){h+=item(z.i,z.n,'',info,`<span class="mut sm">🔒 Plündern-Level ${z.lvl}${z.need&&!S.owned[z.need]?' + '+IT[z.need].n:''}</span>`,'lock');continue}
  h+=item(z.i,z.n,'',info,on?'<span class="sm" style="color:var(--acc)">● Aktiv</span><button class="btn" data-a="stop">Stopp</button>':`<span></span><button class="btn acc" data-a="scav" data-v="${z.id}">Plündern</button>`,on?'on':'')}
 return h}

function rCraft(){let h='';const sec=[['waffe','Waffen'],['ruestung','Rüstungen'],['tool','Werkzeuge'],['verbr','Verbrauchsgüter']];
 if(!lv('werkbank'))return '<h2>Werkbank</h2><div class="card">🔒 Du brauchst zuerst eine <b>Werkbank</b>. Baue sie im Tab <b>Basis</b>.</div>';
 for(const [typ,title] of sec){h+=`<h2>${title}</h2>`;
  for(const id in IT){const r=IT[id];if(r.typ!==typ)continue;
   let desc=typ==='waffe'?`⚔️ ${r.min}–${r.max} Schaden · ${dec(r.spd,1)} s${r.ammo?' · verbraucht 🔸':''}`:typ==='ruestung'?`🛡️ ${r.def} Rüstung · ❤️ +${r.hp} HP`:typ==='tool'?r.d:`ergibt ${lootStr(r.gives)} · ${r.t} s`;
   const lock=lvl('handwerk')<r.lvl||lv('werkbank')<r.wb;
   if(lock){h+=item(r.i,r.n,'',desc,`<span class="mut sm">🔒 Handwerk ${r.lvl} · Werkbank ${r.wb}</span>`,'lock');continue}
   const on=S.act&&S.act.type==='craft'&&S.act.id===id;let bot;
   if(on)bot=`<span class="sm" style="color:var(--acc)">● Wird gebaut${r.gives?' (wiederholt)':''}</span><button class="btn" data-a="stop">Stopp</button>`;
   else if(S.owned[id]){bot=typ==='tool'?'<span class="g sm">✓ Im Besitz</span>':S.eq[typ]===id?'<span class="g sm">✓ Ausgerüstet</span>':`<span class="mut sm">Im Besitz</span><button class="btn" data-a="equip" data-v="${id}">Ausrüsten</button>`}
   else bot=`${costHtml(r.cost)}<button class="btn acc" data-a="craft" data-v="${id}" ${cAttr(r.cost)}>${r.gives?'Herstellen':'Bauen'}</button>`;
   h+=item(r.i,r.n,r.gives?'':`${r.t} s`,desc,bot,on?'on':'')}}
 return h}

function rFight(){let h='';const a=S.act&&S.act.type==='fight'?S.act:null;
 if(a){const z=FZ.find(x=>x.id===a.id);h+=`<h2>${z.i} ${z.n}</h2><div class="card arena"><div class="fighters"><div class="fighter"><div class="portrait">🧍</div><div class="nm">Du</div><div class="bar red"><div class="fill" data-w="php"></div></div><div class="sm mut" data-b="phpT"></div></div><div class="vs">VS</div><div class="fighter gegner"><div class="portrait" data-b="eI"></div><div class="nm" data-b="eN"></div><div class="bar red"><div class="fill" data-w="ehp"></div></div><div class="sm mut" data-b="ehT"></div></div></div><div class="flog" data-b="flog"></div>
 <div class="row"><button class="btn sm" data-a="heal" data-v="verband" ${cAttr({verband:1})}>🩹 <span data-b="cnt:verband"></span></button><button class="btn sm" data-a="heal" data-v="medkit" ${cAttr({medkit:1})}>💊 <span data-b="cnt:medkit"></span></button><button class="btn red sm" data-a="stop">Fliehen</button></div></div>`}
 h+=`<div class="card" style="padding:10px 12px"><div class="tog" data-a="auto"><span class="sw ${S.autoHeal?'on':''}"></span>Automatisch heilen (unter 35 % HP)</div><div class="mut sm" style="margin-top:6px">Waffe: <b>${weapon().n}</b> · Rüstung: <b>${S.eq.ruestung?IT[S.eq.ruestung].n:'keine'}</b> · 🔸 <span data-b="cnt:munition"></span></div></div>`;
 h+='<h2>Kampfgebiete</h2>';
 for(const z of FZ){const ok=zoneOpen(z,'kampf'),on=a&&a.id===z.id;const en=z.en.map(k=>EN[k].i+' '+EN[k].n).join(', ');
  if(!ok){h+=item(z.i,z.n,'',en,`<span class="mut sm">🔒 Kampf-Level ${z.lvl}${z.need&&!S.owned[z.need]?' + '+IT[z.need].n:''}</span>`,'lock');continue}
  const k=S.stats.kills[z.id]||0;let bossTxt='';
  if(z.boss){const B=EN[z.boss];bossTxt=k>=BOSS_KILLS?`<div class="row"><span class="sm">👑 ${B.i} <b>${B.n}</b> · ${B.hp} HP${S.stats.boss[z.boss]?' <span class="g">✓</span>':''}</span><button class="btn red sm" data-a="boss" data-v="${z.id}">Herausfordern</button></div>`:`<div class="mut sm" style="margin-top:6px">👑 Boss erscheint nach ${BOSS_KILLS} Siegen (${k}/${BOSS_KILLS})</div>`}
  h+=`<div class="card ${on?'on':''}"><div class="ih"><span class="ic">${z.i}</span><div><b>${z.n}</b><span class="lv">${k} Siege</span><div class="mut sm">${en}</div></div></div><div class="row"><span></span>${on?'<span class="sm" style="color:var(--acc)">● Kampf läuft</span>':`<button class="btn acc" data-a="fight" data-v="${z.id}">Kämpfen</button>`}</div>${bossTxt}</div>`}
 return h}

function rProfil(){let h='<h2>Fähigkeiten</h2><div class="card">';
 for(const sk in SK)h+=`<div class="sk"><div class="row"><b>${SK[sk][1]} ${SK[sk][0]}</b><span class="mut sm" data-b="xpt:${sk}"></span></div><div class="bar xp"><div class="fill" data-w="xp:${sk}"></div></div></div>`;
 h+='</div><h2>Ausrüstung</h2><div class="card">';const w=weapon(),ar=armor();
 h+=`<div>⚔️ <b>${w.n}</b> <span class="mut sm">${w.min}–${w.max} Schaden</span></div><div style="margin-top:6px">🛡️ <b>${S.eq.ruestung?ar.n:'Keine Rüstung'}</b> <span class="mut sm">${ar.def} Rüstung, +${ar.hp} HP</span></div><div style="margin-top:6px" class="mut sm">Werkzeuge: ${['rucksack','brecheisen','gasmaske','lampe','geiger'].filter(t=>S.owned[t]).map(t=>IT[t].i+' '+IT[t].n).join(', ')||'keine'}</div></div>`;
 let sc=0,kl=0;for(const k in S.stats.scav)sc+=S.stats.scav[k];for(const k in S.stats.kills)kl+=S.stats.kills[k];
 h+=`<h2>Statistik</h2><div class="grid2"><div class="stat"><span class="mut sm">Plünderzüge</span><b>${fmt(sc)}</b></div><div class="stat"><span class="mut sm">Gegner besiegt</span><b>${fmt(kl)}</b></div><div class="stat"><span class="mut sm">Bosse besiegt</span><b>${Object.keys(S.stats.boss).length}/4</b></div><div class="stat"><span class="mut sm">Tode</span><b>${S.stats.deaths}</b></div><div class="stat"><span class="mut sm">Überfälle abgewehrt</span><b>${S.stats.raidsWon}</b></div><div class="stat"><span class="mut sm">Überfälle verloren</span><b>${S.stats.raidsLost}</b></div></div>`;
 h+=`<h2>Tagebuch</h2><div class="card logl" data-b="log"></div>`;
 h+=`<h2>Spielstand</h2><div class="card"><div class="mut sm">Wird automatisch in diesem Browser gespeichert.</div><div class="row"><button class="btn red" data-a="reset">Spielstand löschen</button></div></div>`;
 return h}

const BIND={
 rates:()=>{const r=rates();const ks=Object.keys(r);let s=ks.length?'<div class="rates">'+ks.map(k=>`<span class="c" style="color:${r[k]<0?'var(--bad)':'var(--good)'}">${R[k][1]} ${r[k]>0?'+':''}${dec(r[k])}/s</span>`).join('')+'</div>':'<div class="mut sm">Noch keine Produktion. Baue Wasserfilter und Garten oder nimm Überlebende auf.</div>';
  if(S.starving)s+='<div class="warn">⚠️ Wasser oder Nahrung ist alle – deine Leute arbeiten nur noch mit halber Kraft!</div>';return s},
 raid:()=>mmss(S.raidT),def:()=>`${defense()} / ~${raidPower()}`,
 phpT:()=>`${Math.ceil(S.hp)} / ${maxHp()}`,
 eN:()=>{const a=S.act;return a&&a.ek?EN[a.ek].n:'<span class="mut">…</span>'},
 eI:()=>{const a=S.act;return a&&a.ek?EN[a.ek].i:'❔'},
 ehT:()=>{const a=S.act;return a&&a.ek?`${Math.max(0,Math.ceil(a.eh))} / ${EN[a.ek].hp}`:'suche Gegner'},
 flog:()=>S.act&&S.act.fl?S.act.fl.map(l=>`<div>${l}</div>`).join(''):'',
 cnt:k=>fmt(S.res[k]),
 xpt:sk=>{const l=lvl(sk);return l>=99?`Level ${l}`:`Level ${l} · ${fmt(S.xp[sk]-XPT[l])}/${fmt(XPT[l+1]-XPT[l])} XP`},
 log:()=>S.log.length?S.log.slice(0,30).map(l=>`<div class="${l.c}">${l.m}</div>`).join(''):'<div class="mut">Noch keine Einträge.</div>',
};
const WBIND={
 php:()=>S.hp/maxHp(),
 ehp:()=>{const a=S.act;return a&&a.ek?Math.max(0,a.eh)/EN[a.ek].hp:0},
 xp:sk=>{const l=lvl(sk);return l>=99?1:(S.xp[sk]-XPT[l])/(XPT[l+1]-XPT[l])},
};
const cache=new WeakMap();
function setH(el,h){if(cache.get(el)!==h){cache.set(el,h);el.innerHTML=h}}
function upd(){
 const show=Object.keys(R).filter(k=>S.res[k]>=1||['schrott','wasser','nahrung'].includes(k));
 setH($('#res'),show.map(k=>`<span class="chip">${R[k][1]} ${fmt(S.res[k])}</span>`).join(''));
 const m=maxHp();$('#hpf').style.width=(100*S.hp/m)+'%';$('#hpt').textContent=`❤️ ${Math.ceil(S.hp)}/${m}`;
 const a=S.act;let L='💤 Untätig',Sx='Wähle eine Aktion: Plündern, Bauen oder Kämpfen',p=0;
 if(a&&a.type==='scav'){const z=ZS.find(x=>x.id===a.id);L=`🔦 Plündert: ${z.n}`;Sx=a.last?'Zuletzt: '+a.last:'Suche nach Brauchbarem…';p=a.p/scavDur(z)}
 else if(a&&a.type==='craft'){const r=IT[a.id];L=`🔧 Baut: ${r.n}`;Sx=r.gives?`${a.n||0}× hergestellt`:'Einzelanfertigung';p=a.p/r.t}
 else if(a&&a.type==='fight'){const z=FZ.find(x=>x.id===a.id);L=`⚔️ Kämpft: ${z.n}`;Sx=a.ek?`${EN[a.ek].i} ${EN[a.ek].n} – ${Math.max(0,Math.ceil(a.eh))} HP`:'Suche Gegner…';p=a.ek?Math.max(0,a.eh)/EN[a.ek].hp:0}
 setH($('#actL'),L);setH($('#actS'),Sx);$('#actB').style.width=(100*Math.min(1,p))+'%';$('#actX').style.display=a?'':'none';
 document.querySelectorAll('[data-b]').forEach(el=>{const [k,arg]=el.dataset.b.split(':');if(BIND[k])setH(el,BIND[k](arg))});
 document.querySelectorAll('[data-w]').forEach(el=>{const [k,arg]=el.dataset.w.split(':');el.style.width=(100*Math.min(1,Math.max(0,WBIND[k](arg))))+'%'});
 document.querySelectorAll('[data-ck]').forEach(el=>el.classList.toggle('no',S.res[el.dataset.ck]<+el.dataset.cv));
 document.querySelectorAll('[data-cost]').forEach(el=>{el.disabled=!canPay(JSON.parse(el.dataset.cost))});
 const nd=$('#nav [data-v="basis"] .dot');if(nd)nd.style.display=S._qd?'':'none';}
function render(){
 $('#nav').innerHTML=TABS.map(([id,i,n])=>`<button data-a="tab" data-v="${id}" class="${S.tab===id?'act':''}"><span>${i}</span>${n}${id==='basis'?'<i class="dot" style="display:none"></i>':''}</button>`).join('');
 $('#main').innerHTML=({basis:rBasis,scav:rScav,craft:rCraft,fight:rFight,profil:rProfil}[S.tab]||rBasis)();upd()}
function modal(h){$('#mbox').innerHTML=h+'<div class="row"><span></span><button class="btn acc" data-a="modal">Weiter</button></div>';$('#modal').classList.remove('hidden')}
