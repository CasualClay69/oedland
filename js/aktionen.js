"use strict";
// =====================================================
//  AKTIONEN: was beim Antippen passiert (Bauen, Aufnehmen, Jobs, Aufträge, Handel …).
// =====================================================

function build(id){const B=BU[id],l=lv(id);if((B.max&&l>=B.max)||!breq(id))return;const c=bcost(id);if(!canPay(c))return;pay(c);S.b[id]=l+1;msg(`${B.i} ${B.n} → Stufe ${l+1}`,'good');render()}
function recruit(){if(S.surv.total>=survCap())return;const c=recruitCost();if(!canPay(c))return;pay(c);S.surv.total++;msg(`👤 ${NAMES[rnd(0,NAMES.length-1)]} schließt sich dir an.`,'good');render()}
function jobAdd(j,d){if(d>0&&idle()<1)return;if(d<0&&!(S.surv.jobs[j]>0))return;S.surv.jobs[j]=(S.surv.jobs[j]||0)+d;render()}
function claim(){const q=Q[S.q];if(!q||!q.c())return;give(q.r);msg(`📜 „${q.t}“ abgeschlossen: ${lootStr(q.r)}`,'good');S.q++;S._qd=undefined;render()}
function trade(i){const t=TR[i];if(!t||lv('funk')<t.l||!canPay(t.g))return;pay(t.g);give(t.t);toast(`Getauscht: ${lootStr(t.t)}`,'good')}
function act(a,v,el){switch(a){
 case 'tab':S.tab=v;render();window.scrollTo(0,0);break;
 case 'scav':S.act={type:'scav',id:v,p:0,last:''};render();break;
 case 'stop':S.act=null;render();break;
 case 'craft':S.act={type:'craft',id:v,p:0,paid:false};render();break;
 case 'equip':S.eq[IT[v].typ]=v;S.hp=Math.min(S.hp,maxHp());render();break;
 case 'build':build(v);break;
 case 'recruit':recruit();break;
 case 'jobp':jobAdd(v,1);break;case 'jobm':jobAdd(v,-1);break;
 case 'fight':startFight(v,false);break;case 'boss':startFight(v,true);break;
 case 'heal':heal(v);break;
 case 'auto':S.autoHeal=!S.autoHeal;render();break;
 case 'claim':claim();break;
 case 'trade':trade(+v);break;
 case 'modal':$('#modal').classList.add('hidden');break;
 case 'reset':if(el.dataset.sure){try{localStorage.removeItem(KEY)}catch(e){}S=fresh();render();toast('Neues Spiel gestartet.')}else{el.dataset.sure=1;el.textContent='Wirklich löschen? Nochmal tippen'}return;
}save()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;act(b.dataset.a,b.dataset.v,b)});
