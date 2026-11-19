"use strict";
// =====================================================
//  HILFEN: kleine Werkzeuge (Zahlen formatieren, Kosten prüfen, Tagebuch, Meldungen, Werte wie max. HP).
// =====================================================

const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function fmt(n){n=Math.floor(n);if(n>=1e6)return(n/1e6).toFixed(1).replace('.',',')+'M';if(n>=1e4)return(n/1e3).toFixed(1).replace('.',',')+'k';return''+n}
const dec=(n,d=2)=>(+n.toFixed(d)).toString().replace('.',',');
const mmss=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const lv=b=>S.b[b]||0;
function lvl(sk){const x=S.xp[sk];let l=1;while(l<99&&x>=XPT[l+1])l++;return l}
const canPay=c=>Object.keys(c).every(k=>S.res[k]>=c[k]);
const pay=c=>{for(const k in c)S.res[k]-=c[k]};
const give=c=>{for(const k in c)S.res[k]+=c[k]};
function lootStr(o){const s=Object.entries(o).filter(e=>e[1]>0).map(([k,v])=>R[k][1]+fmt(v)).join(' ');return s||'nichts'}
function costHtml(c){return '<div class="costs">'+Object.entries(c).map(([k,v])=>`<span class="c" data-ck="${k}" data-cv="${v}">${R[k][1]} ${fmt(v)}</span>`).join('')+'</div>'}
const cAttr=c=>`data-cost='${JSON.stringify(c)}'`;
let dirty=false;const markDirty=()=>dirty=true;
function log(m,c=''){S.log.unshift({m,c,t:Date.now()});if(S.log.length>60)S.log.length=60}
function toast(m,c=''){const d=document.createElement('div');d.className='toast '+c;d.textContent=m;const T=$('#toasts');T.appendChild(d);while(T.children.length>3)T.firstChild.remove();setTimeout(()=>d.remove(),2800)}
function msg(m,c){log(m,c);toast(m,c)}
function weapon(){return S.eq.waffe?IT[S.eq.waffe]:{n:'Fäuste',min:1,max:3,spd:1.2}}
function armor(){return S.eq.ruestung?IT[S.eq.ruestung]:{def:0,hp:0}}
function maxHp(){return 60+(lvl('kampf')-1)*10+armor().hp}
function gainXp(sk,n,off){const b=lvl(sk);S.xp[sk]+=n;const a=lvl(sk);if(a>b){log(`${SK[sk][1]} ${SK[sk][0]} erreicht Level ${a}!`,'g');if(!off)toast(`${SK[sk][1]} ${SK[sk][0]} Level ${a}!`,'good');markDirty()}}
function bcost(id){const B=BU[id],l=lv(id);if(B.costs)return B.costs[l]||B.costs[B.costs.length-1];const o={};for(const k in B.cost)o[k]=Math.round(B.cost[k]*Math.pow(1.6,l));return o}
const breq=id=>{const r=BU[id].req;return !r||lv(r[0])>=r[1]};
function survCap(){return 1+lv('baracke')*2+lv('funk')}
function idle(){let n=0;for(const j in S.surv.jobs)n+=S.surv.jobs[j];return S.surv.total-n}
function recruitCost(){return{kronkorken:Math.round(15*Math.pow(1.7,S.surv.total))}}
function defense(){return lv('mauer')*10+(S.surv.jobs.wache||0)*6+lvl('kampf')*2}
function raidPower(){let b=0;for(const k in S.b)b+=S.b[k];return Math.round(8+b*5+S.surv.total*3)}
function zoneOpen(z,sk){return lvl(sk)>=z.lvl&&(!z.need||S.owned[z.need])}
