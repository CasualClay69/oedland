"use strict";
// =====================================================
//  ZUSTAND: der Spielstand (S), neuer Spielstand, Laden und Speichern im Browser.
// =====================================================

let S;
function fresh(){return{res:{schrott:0,wasser:20,nahrung:20,stoff:0,chemie:0,elektronik:0,kronkorken:0,munition:0,verband:2,medkit:0,kern:0,titan:0,plasma:0},xp:{plundern:0,handwerk:0,kampf:0},hp:60,eq:{waffe:null,ruestung:null},inv:[],nextU:1,owned:{},b:{},surv:{total:0,jobs:{}},act:null,stats:{scav:{},kills:{},boss:{},crafted:{},deaths:0,raidsWon:0,raidsLost:0},q:0,log:[],last:Date.now(),raidT:300,autoHeal:true,tab:'basis',starving:false}}
function merge(a,b){for(const k in b){const v=b[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))merge(a[k],v);else a[k]=v}return a}
const KEY='oedland-save-v1';
function save(){S.last=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){S=fresh();try{const t=localStorage.getItem(KEY);if(t)merge(S,JSON.parse(t))}catch(e){}}
