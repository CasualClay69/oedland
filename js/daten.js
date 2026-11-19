"use strict";
// =====================================================
//  DATEN: Rohstoffe, Fähigkeiten, Plünderziele, Gegner, Kampfgebiete, Baupläne, Gebäude, Jobs, Händler, Aufträge.
//  Nur Daten – hier stellt man das Balancing ein.
// =====================================================

const R={schrott:['Schrott','🔩'],wasser:['Wasser','💧'],nahrung:['Nahrung','🥫'],stoff:['Stoff','🧵'],chemie:['Chemie','🧪'],elektronik:['Elektronik','🔌'],kronkorken:['Kronkorken','🪙'],munition:['Munition','🔸'],verband:['Verbände','🩹'],medkit:['Medkits','💊'],kern:['Fusionskerne','⚛️']};
const SK={plundern:['Plündern','🔦'],handwerk:['Handwerk','🔧'],kampf:['Kampf','⚔️']};
const XPT=[0,0];for(let l=2;l<=100;l++)XPT[l]=XPT[l-1]+Math.floor(20*Math.pow(l-1,1.5));

const ZS=[
 {id:'halde',n:'Müllhalde',i:'🗑️',d:'Berge aus Müll. Hier fängt jeder an.',lvl:1,t:4,xp:5,loot:[['schrott',1,3,1],['stoff',1,1,.35],['kronkorken',1,2,.3]]},
 {id:'vorstadt',n:'Verlassene Vorstadt',i:'🏚️',d:'Leere Häuser, volle Keller – manchmal.',lvl:5,t:6,xp:12,loot:[['schrott',2,4,.8],['stoff',1,2,.5],['nahrung',1,3,.5],['wasser',1,3,.4],['kronkorken',1,4,.5]]},
 {id:'tanke',n:'Ausgebrannte Tankstelle',i:'⛽',d:'Riecht nach Benzin und Chemie.',lvl:10,t:8,xp:22,loot:[['chemie',1,2,.6],['schrott',2,5,.7],['nahrung',1,3,.4],['kronkorken',2,6,.6]]},
 {id:'klinik',n:'Krankenhausruine',i:'🏥',d:'Medizin – falls die Ghule etwas übrig gelassen haben.',lvl:15,t:10,xp:35,loot:[['chemie',1,3,.7],['stoff',2,4,.6],['verband',1,2,.35],['medkit',1,1,.08]]},
 {id:'elektro',n:'Elektronikmarkt',i:'📺',d:'Kaputte Fernseher voller wertvoller Platinen.',lvl:20,t:12,xp:50,loot:[['elektronik',1,2,.6],['schrott',3,7,.8],['kronkorken',3,8,.5]]},
 {id:'bunker',n:'Militärbunker',i:'🪖',d:'Die Armee hat viel zurückgelassen.',lvl:30,t:15,xp:80,loot:[['munition',3,8,.7],['elektronik',1,3,.5],['medkit',1,1,.2],['kronkorken',5,12,.6]]},
 {id:'krater',n:'Strahlenkrater',i:'☢️',d:'Tödlich ohne Schutz – aber hier liegen Fusionskerne.',lvl:40,t:20,xp:130,need:'geiger',loot:[['kern',1,1,.12],['elektronik',2,4,.6],['chemie',3,5,.6]]},
];
const EN={
 ratte:{n:'Riesenratte',i:'🐀',hp:12,atk:3,def:0,spd:1.6,xp:6,loot:[['nahrung',1,1,.4],['stoff',1,1,.2]]},
 hund:{n:'Wilder Hund',i:'🐕',hp:20,atk:5,def:0,spd:1.4,xp:10,loot:[['nahrung',1,2,.5]]},
 pluenderer:{n:'Plünderer',i:'🥷',hp:35,atk:7,def:1,spd:1.8,xp:18,loot:[['kronkorken',2,6,.8],['schrott',2,5,.5],['munition',1,3,.3]]},
 ghul:{n:'Ghul',i:'🧟',hp:45,atk:8,def:2,spd:2,xp:24,loot:[['stoff',1,3,.5],['chemie',1,1,.2]]},
 kriecher:{n:'Sumpfkriecher',i:'🦎',hp:80,atk:12,def:4,spd:1.7,xp:45,loot:[['chemie',1,3,.6],['nahrung',2,3,.4]]},
 mutant:{n:'Mutant',i:'👹',hp:120,atk:16,def:5,spd:2.2,xp:65,loot:[['chemie',2,4,.5],['kronkorken',5,12,.6],['verband',1,1,.2],['elektronik',1,1,.1]]},
 sumpfmutter:{n:'Sumpfmutter',i:'🐙',hp:700,atk:22,def:6,spd:2.3,xp:600,boss:1,loot:[['kronkorken',80,120,1],['chemie',20,30,1],['medkit',2,3,1]]},
 spinne:{n:'Tunnelspinne',i:'🕷️',hp:160,atk:19,def:7,spd:1.5,xp:90,loot:[['stoff',3,6,.6],['chemie',2,4,.4]]},
 wildghul:{n:'Wilder Ghul',i:'💀',hp:200,atk:22,def:8,spd:1.8,xp:110,loot:[['elektronik',1,2,.4],['kronkorken',8,15,.6]]},
 leuchtghul:{n:'Leuchtender Ghul',i:'🌟',hp:1400,atk:34,def:10,spd:2,xp:1200,boss:1,loot:[['kronkorken',150,250,1],['elektronik',10,15,1],['medkit',3,4,1]]},
 raider:{n:'Raider',i:'🔫',hp:260,atk:28,def:11,spd:1.9,xp:150,loot:[['munition',4,10,.7],['kronkorken',10,25,.7],['schrott',5,12,.5]]},
 veteran:{n:'Raider-Veteran',i:'🎖️',hp:340,atk:34,def:14,spd:2,xp:200,loot:[['munition',6,14,.7],['elektronik',1,3,.4],['medkit',1,1,.15]]},
 varga:{n:'Kriegsherr Varga',i:'☠️',hp:2000,atk:48,def:16,spd:2.2,xp:2500,boss:1,loot:[['kronkorken',400,600,1],['elektronik',20,30,1],['kern',1,1,1]]},
 bestie:{n:'Strahlenbestie',i:'🐗',hp:480,atk:44,def:18,spd:1.9,xp:300,loot:[['kern',1,1,.08],['elektronik',2,4,.5],['chemie',3,6,.5]]},
 behemoth:{n:'Behemoth',i:'🦍',hp:650,atk:55,def:22,spd:2.4,xp:420,loot:[['kern',1,1,.12],['kronkorken',20,40,.7]]},
 koloss:{n:'Der Koloss',i:'🗿',hp:6000,atk:75,def:26,spd:2.6,xp:8000,boss:1,loot:[['kern',5,5,1],['kronkorken',2000,2000,1]]},
};
const FZ=[
 {id:'rand',n:'Ödland-Rand',i:'🌵',lvl:1,en:['ratte','hund']},
 {id:'highway',n:'Highway 9',i:'🛣️',lvl:5,en:['hund','pluenderer','ghul']},
 {id:'sumpf',n:'Mutantensumpf',i:'🌫️',lvl:12,need:'gasmaske',en:['kriecher','mutant'],boss:'sumpfmutter'},
 {id:'metro',n:'Metro-Tunnel',i:'🚇',lvl:20,need:'lampe',en:['spinne','wildghul'],boss:'leuchtghul'},
 {id:'festung',n:'Raider-Festung',i:'🏴',lvl:28,en:['raider','veteran'],boss:'varga'},
 {id:'krater',n:'Der Krater',i:'☢️',lvl:38,need:'geiger',en:['bestie','behemoth'],boss:'koloss'},
];
const BOSS_KILLS=15;
const IT={
 knueppel:{n:'Rohrknüppel',i:'🏏',typ:'waffe',min:3,max:6,spd:1.4,lvl:1,wb:1,cost:{schrott:10},t:3,xp:8},
 nagelbrett:{n:'Nagelbrett',i:'🪵',typ:'waffe',min:5,max:9,spd:1.5,lvl:4,wb:1,cost:{schrott:25,stoff:5},t:5,xp:20},
 machete:{n:'Machete',i:'🔪',typ:'waffe',min:8,max:14,spd:1.3,lvl:9,wb:2,cost:{schrott:60,stoff:10},t:8,xp:45},
 rohrpistole:{n:'Rohrpistole',i:'🔫',typ:'waffe',min:13,max:21,spd:1.6,ammo:1,lvl:14,wb:2,cost:{schrott:80,chemie:10},t:10,xp:70},
 schrotflinte:{n:'Schrotflinte',i:'💥',typ:'waffe',min:26,max:42,spd:2,ammo:1,lvl:22,wb:3,cost:{schrott:150,chemie:25,elektronik:5},t:14,xp:130},
 jagdgewehr:{n:'Jagdgewehr',i:'🎯',typ:'waffe',min:34,max:50,spd:1.8,ammo:1,lvl:30,wb:4,cost:{schrott:250,elektronik:15,chemie:30},t:18,xp:220},
 laser:{n:'Lasergewehr',i:'🔆',typ:'waffe',min:45,max:70,spd:1.3,lvl:40,wb:5,cost:{elektronik:60,kern:3,chemie:50},t:25,xp:400},
 lumpen:{n:'Lumpenkleidung',i:'👕',typ:'ruestung',def:1,hp:5,lvl:1,wb:1,cost:{stoff:8},t:3,xp:8},
 weste:{n:'Lederweste',i:'🦺',typ:'ruestung',def:3,hp:15,lvl:6,wb:1,cost:{stoff:25,schrott:10},t:6,xp:30},
 reifen:{n:'Reifenpanzer',i:'🛞',typ:'ruestung',def:6,hp:30,lvl:12,wb:2,cost:{schrott:80,stoff:20},t:10,xp:60},
 schrottr:{n:'Schrottrüstung',i:'🛡️',typ:'ruestung',def:10,hp:50,lvl:20,wb:3,cost:{schrott:180,chemie:20},t:14,xp:120},
 kampfr:{n:'Kampfrüstung',i:'🥋',typ:'ruestung',def:15,hp:80,lvl:28,wb:4,cost:{schrott:250,stoff:60,elektronik:20},t:18,xp:200},
 power:{n:'Power-Rüstung',i:'🤖',typ:'ruestung',def:24,hp:140,lvl:40,wb:5,cost:{schrott:500,elektronik:80,kern:5},t:30,xp:450},
 rucksack:{n:'Rucksack',i:'🎒',typ:'tool',d:'Plündern 15 % schneller',lvl:3,wb:1,cost:{stoff:20},t:5,xp:20},
 brecheisen:{n:'Brecheisen',i:'🪛',typ:'tool',d:'+20 % Beute-Chance beim Plündern',lvl:8,wb:2,cost:{schrott:50},t:6,xp:35},
 gasmaske:{n:'Gasmaske',i:'😷',typ:'tool',d:'Zugang zum Mutantensumpf',lvl:10,wb:2,cost:{stoff:20,chemie:15},t:8,xp:50},
 lampe:{n:'Stirnlampe',i:'🔦',typ:'tool',d:'Zugang zu den Metro-Tunneln',lvl:16,wb:3,cost:{schrott:40,elektronik:5,chemie:10},t:10,xp:80},
 geiger:{n:'Geigerzähler',i:'📟',typ:'tool',d:'Zugang zum Strahlenkrater',lvl:35,wb:4,cost:{elektronik:30,schrott:100},t:12,xp:150},
 c_verband:{n:'Verband',i:'🩹',typ:'verbr',gives:{verband:1},lvl:1,wb:1,cost:{stoff:3},t:2,xp:3},
 c_munition:{n:'Munition',i:'🔸',typ:'verbr',gives:{munition:5},lvl:10,wb:2,cost:{schrott:4,chemie:1},t:3,xp:6},
 c_medkit:{n:'Medkit',i:'💊',typ:'verbr',gives:{medkit:1},lvl:15,wb:3,cost:{chemie:4,stoff:2,verband:1},t:5,xp:15},
};
const BU={
 werkbank:{n:'Werkbank',i:'🔧',max:5,costs:[{schrott:15},{schrott:60,stoff:15},{schrott:200,chemie:30},{schrott:400,elektronik:25,chemie:40},{schrott:800,elektronik:60,kern:1}],d:'Jede Stufe schaltet neue Baupläne frei.'},
 filter:{n:'Wasserfilter',i:'💧',cost:{schrott:25,stoff:5},d:'+0,2 Wasser/s pro Stufe',req:['werkbank',1]},
 garten:{n:'Gemüsegarten',i:'🥬',cost:{schrott:20,wasser:25},d:'+0,15 Nahrung/s pro Stufe',req:['werkbank',1]},
 baracke:{n:'Baracke',i:'🛏️',cost:{schrott:50,stoff:20},d:'+2 Plätze für Überlebende',req:['werkbank',2]},
 kranken:{n:'Krankenstation',i:'🏥',cost:{schrott:60,chemie:15},d:'+0,5 HP/s Heilung – auch im Kampf',req:['werkbank',2]},
 mauer:{n:'Schutzmauer',i:'🧱',cost:{schrott:80},d:'+10 Verteidigung gegen Überfälle',req:['werkbank',2]},
 funk:{n:'Funkturm',i:'📡',max:3,cost:{schrott:150,elektronik:8},d:'Lockt Händler an (mehr Angebote pro Stufe) und +1 Platz',req:['werkbank',3]},
 labor:{n:'Chemielabor',i:'⚗️',cost:{schrott:100,chemie:20,elektronik:3},d:'+0,03 Chemie/s, schaltet Chemiker frei',req:['werkbank',3]},
 generator:{n:'Generator',i:'⚡',cost:{schrott:200,chemie:30,elektronik:15},d:'+0,02 Elektronik/s, schaltet Bastler frei',req:['werkbank',4]},
};
const JOBS={
 sammler:{n:'Sammler',i:'🔩',d:'+0,25 Schrott/s',prod:{schrott:.25}},
 traeger:{n:'Wasserträger',i:'💧',d:'+0,2 Wasser/s',prod:{wasser:.2}},
 gaertner:{n:'Gärtner',i:'🥬',d:'+0,2 Nahrung/s',prod:{nahrung:.2},req:'garten'},
 naeher:{n:'Lumpensammler',i:'🧵',d:'+0,08 Stoff/s',prod:{stoff:.08}},
 chemiker:{n:'Chemiker',i:'🧪',d:'+0,05 Chemie/s',prod:{chemie:.05},req:'labor'},
 bastler:{n:'Bastler',i:'🔌',d:'+0,02 Elektronik/s',prod:{elektronik:.02},req:'generator'},
 wache:{n:'Wache',i:'🛡️',d:'+6 Verteidigung'},
};
const TR=[
 {l:1,g:{schrott:25},t:{kronkorken:5}},{l:1,g:{nahrung:25},t:{kronkorken:6}},{l:1,g:{wasser:25},t:{kronkorken:6}},
 {l:1,g:{kronkorken:15},t:{munition:10}},{l:1,g:{kronkorken:12},t:{verband:3}},
 {l:2,g:{kronkorken:25},t:{chemie:5}},{l:2,g:{kronkorken:20},t:{stoff:10}},{l:2,g:{kronkorken:45},t:{medkit:1}},
 {l:3,g:{kronkorken:60},t:{elektronik:2}},{l:3,g:{kronkorken:800},t:{kern:1}},
];
const NAMES=['Mara','Jonas','Rex','Elke','Bolt','Nina','Kurt','Zora','Fritz','Ida','Hagen','Lotte','Sepp','Vera','Ole','Tilda','Brick','Hanne','Milo','Greta','Dusty','Rosa','Knut','Yara'];
const Q=[
 {t:'Erwachen',s:'Du kriechst aus einem eingestürzten Keller. Die Welt ist tot – aber auf der Müllhalde findet man immer etwas.',g:'Plündere 5× die Müllhalde',c:()=>(S.stats.scav.halde||0)>=5,r:{kronkorken:10}},
 {t:'Ein Ort zum Arbeiten',s:'Mit Schrott allein überlebt niemand. Eine Werkbank wäre ein Anfang.',g:'Baue eine Werkbank (Basis)',c:()=>lv('werkbank')>=1,r:{schrott:15}},
 {t:'Bewaffnet',s:'Draußen knurrt etwas. Zeit, sich zu wehren.',g:'Baue eine Waffe und rüste sie aus',c:()=>!!S.eq.waffe,r:{verband:3}},
 {t:'Erste Jagd',s:'Die Ratten am Ödland-Rand werden frech.',g:'Besiege 5 Gegner am Ödland-Rand',c:()=>(S.stats.kills.rand||0)>=5,r:{kronkorken:20}},
 {t:'Wasser ist Leben',s:'Wer überleben will, braucht eine eigene Versorgung.',g:'Baue Wasserfilter und Gemüsegarten',c:()=>lv('filter')>=1&&lv('garten')>=1,r:{stoff:15}},
 {t:'Nicht mehr allein',s:'Ein Rauchsignal am Horizont. Vielleicht gibt es noch andere.',g:'Nimm einen Überlebenden auf',c:()=>S.surv.total>=1,r:{nahrung:30,wasser:30}},
 {t:'Aasgeier',s:'Je besser du plünderst, desto weiter kannst du gehen.',g:'Erreiche Plündern-Level 10',c:()=>lvl('plundern')>=10,r:{kronkorken:50}},
 {t:'Giftige Luft',s:'Hinter dem Highway liegt der Sumpf. Ohne Maske stirbst du dort.',g:'Baue eine Gasmaske',c:()=>!!S.owned.gasmaske,r:{chemie:10}},
 {t:'Die Mutter des Sumpfes',s:'Die Überlebenden flüstern von einer riesigen Kreatur im Nebel.',g:'Besiege die Sumpfmutter',c:()=>!!S.stats.boss.sumpfmutter,r:{kronkorken:100}},
 {t:'Signal',s:'Ein Funkturm könnte Händler aus dem ganzen Ödland anlocken.',g:'Baue den Funkturm',c:()=>lv('funk')>=1,r:{elektronik:5}},
 {t:'Licht im Tunnel',s:'Tief in der Metro glüht etwas. Es ist nicht freundlich.',g:'Besiege den Leuchtenden Ghul',c:()=>!!S.stats.boss.leuchtghul,r:{medkit:3}},
 {t:'Der Kriegsherr',s:'Varga und seine Raider beherrschen die Gegend. Solange er lebt, ist niemand sicher.',g:'Besiege Kriegsherr Varga',c:()=>!!S.stats.boss.varga,r:{kronkorken:300}},
 {t:'Ins Herz der Strahlung',s:'Der Krater ruft. Ohne Geigerzähler wäre es Selbstmord.',g:'Baue einen Geigerzähler',c:()=>!!S.owned.geiger,r:{medkit:3}},
 {t:'Der Koloss',s:'Im Krater schläft das, was die alte Welt beendet hat.',g:'Besiege den Koloss',c:()=>!!S.stats.boss.koloss,r:{kern:3}},
];
