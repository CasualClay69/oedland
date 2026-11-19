"use strict";
// =====================================================
//  FUNDSTÜCKE: Waffen und Rüstungen mit Seltenheit (Gewöhnlich bis Legendär), die Gegner fallen lassen.
//  Ein Fundstück ist { u: Nummer, b: Bauplan-ID aus IT, r: Seltenheit 0–4 }. Ausgerüstet als "u<Nummer>".
//  Seltenheiten und Chancen: RAR und BEUTE in daten.js.
// =====================================================

function fundstueck(eqId) {
  if (!eqId || eqId[0] !== 'u') return null;
  return (S.inv || []).find(f => 'u' + f.u === eqId) || null;
}

// Werte eines Fundstücks: Bauplan × Seltenheits-Faktor
function fundWerte(f) {
  const b = IT[f.b], x = RAR[f.r].f, o = { ...b, n: b.n, rar: f.r };
  if (b.typ === 'waffe') { o.min = Math.round(b.min * x); o.max = Math.round(b.max * x); }
  else { o.def = Math.round(b.def * x); o.hp = Math.round(b.hp * x); }
  return o;
}

const fundName = f => `<span style="color:${RAR[f.r].c}">${IT[f.b].i} ${IT[f.b].n}</span>`;
const fundStats = w => w.typ === 'waffe' ? `⚔️ ${w.min}–${w.max} · ${dec(w.spd, 1)} s${w.ammo ? ' · 🔸' : ''}` : `🛡️ ${w.def} · ❤️ +${w.hp}`;

function waehleSeltenheit(gewichte) {
  const summe = gewichte.reduce((a, b) => a + b, 0);
  let z = Math.random() * summe;
  for (let i = 0; i < gewichte.length; i++) { z -= gewichte[i]; if (z < 0) return i; }
  return 0;
}

// Was zerlegen bringt
function zerlegWert(f) {
  const b = IT[f.b], x = RAR[f.r].f;
  return { schrott: Math.round(b.lvl * 6 * x), kronkorken: Math.round(b.lvl * 8 * x * x) };
}

// Nach einem Sieg: vielleicht ein Fundstück (Bosse immer, mindestens "Selten")
function dropBeute(zone, boss) {
  if (!boss && Math.random() >= BEUTE.chance) return;
  // Baupläne passend zum Gebiet: die vier stärksten bis 8 Level über dem Gebiet
  const passend = Object.keys(IT).filter(id => (IT[id].typ === 'waffe' || IT[id].typ === 'ruestung') && IT[id].lvl <= zone.lvl + 8)
    .sort((a, b) => IT[b].lvl - IT[a].lvl).slice(0, 4);
  if (!passend.length) return;
  const f = { u: S.nextU = (S.nextU || 1) + 1, b: passend[rnd(0, passend.length - 1)], r: waehleSeltenheit(boss ? BEUTE.bossGewicht : BEUTE.gewicht) };
  if (f.r === 4) S.stats.legendaer = 1;
  S.inv = S.inv || [];
  if (S.inv.length >= BEUTE.platz) {
    const w = zerlegWert(f); give(w);
    msg(`🎒 Kein Platz mehr – ${IT[f.b].n} (${RAR[f.r].n}) zerlegt: ${lootStr(w)}`, f.r >= 3 ? 'good' : '');
  } else {
    S.inv.push(f);
    msg(`${f.r >= 4 ? '🌟' : f.r >= 3 ? '✨' : '🎁'} Fundstück: ${IT[f.b].n} (${RAR[f.r].n})!`, f.r >= 2 ? 'good' : '');
  }
  flog(`🎁 ${RAR[f.r].n}: ${IT[f.b].i} ${IT[f.b].n}`);
  markDirty();
}

function fundAusruesten(u) {
  const f = (S.inv || []).find(x => x.u === +u);
  if (!f) return;
  S.eq[IT[f.b].typ] = 'u' + f.u;
  S.hp = Math.min(S.hp, maxHp());
  render();
}

function fundZerlegen(u) {
  const i = (S.inv || []).findIndex(x => x.u === +u);
  if (i < 0) return;
  const f = S.inv[i], id = 'u' + f.u;
  if (S.eq.waffe === id || S.eq.ruestung === id) { toast('Ausgerüstete Fundstücke kann man nicht zerlegen.', 'bad'); return; }
  const w = zerlegWert(f); give(w); S.inv.splice(i, 1);
  toast(`🔨 Zerlegt: ${lootStr(w)}`, 'good');
  render();
}

// HTML für den Profil-Tab
function fundBereich() {
  const inv = S.inv || [];
  let h = `<h2>Fundstücke <span class="mut sm">${inv.length}/${BEUTE.platz}</span></h2>`;
  if (!inv.length) return h + `<div class="card mut sm">Gegner lassen manchmal Waffen und Rüstungen fallen – Bosse immer. Je seltener, desto stärker: ${RAR.map(r => `<span style="color:${r.c}">${r.n}</span>`).join(' · ')}.</div>`;
  const sortiert = [...inv].sort((a, b) => b.r - a.r || IT[b.b].lvl - IT[a.b].lvl);
  for (const f of sortiert) {
    const w = fundWerte(f), id = 'u' + f.u, an = S.eq.waffe === id || S.eq.ruestung === id;
    h += `<div class="card fund" style="border-left:4px solid ${RAR[f.r].c};padding:10px 12px"><div class="row" style="margin:0;flex-wrap:nowrap"><div style="flex:1;min-width:0"><b>${fundName(f)}</b> <span class="sm" style="color:${RAR[f.r].c}">${RAR[f.r].n}</span><div class="mut sm">${fundStats(w)}</div></div>`
      + (an ? '<span class="g sm">✓ Ausgerüstet</span>' : `<span style="display:flex;gap:6px"><button class="btn sm" data-a="fzerl" data-v="${f.u}" title="Zerlegen: ${lootStr(zerlegWert(f))}">🔨</button><button class="btn sm acc" data-a="fausr" data-v="${f.u}">Ausrüsten</button></span>`)
      + '</div></div>';
  }
  return h;
}
