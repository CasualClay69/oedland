"use strict";
// =====================================================
//  DATEN: Rohstoffe, Fähigkeiten, Plünderziele, Gegner, Kampfgebiete, Baupläne, Gebäude, Jobs, Händler, Aufträge.
//  Nur Daten – hier stellt man das Balancing ein.
// =====================================================

const R={schrott:['Schrott','🔩'],wasser:['Wasser','💧'],nahrung:['Nahrung','🥫'],stoff:['Stoff','🧵'],chemie:['Chemie','🧪'],elektronik:['Elektronik','🔌'],kronkorken:['Kronkorken','🪙'],munition:['Munition','🔸'],verband:['Verbände','🩹'],medkit:['Medkits','💊'],kern:['Fusionskerne','⚛️'],titan:['Titan','🔷'],plasma:['Plasmazellen','🔋']};
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
 // ----- Endgame -----
 {id:'raffinerie',n:'Ölraffinerie',i:'🏭',d:'Rostige Tanks, giftige Pfützen – und erste Titanbleche.',lvl:45,t:22,xp:200,loot:[['chemie',4,8,.7],['schrott',6,12,.7],['titan',1,1,.18],['kronkorken',8,16,.5]]},
 {id:'flughafen',n:'Flughafen-Wrack',i:'✈️',d:'Zerschellte Jets aus Titan. Ohne Schneidbrenner kommt man nicht ran.',lvl:55,t:25,xp:300,need:'schneidbrenner',loot:[['titan',1,2,.6],['elektronik',3,6,.6],['schrott',8,15,.6],['kronkorken',10,25,.5]]},
 {id:'geheimlabor',n:'Geheimlabor',i:'🔬',d:'Hier wurde an Dingen geforscht, die man besser vergessen hätte.',lvl:65,t:28,xp:420,loot:[['plasma',1,1,.4],['chemie',6,12,.7],['elektronik',4,8,.5],['medkit',1,1,.25]]},
 {id:'satellit',n:'Satellitenabsturz',i:'🛰️',d:'Ein Stück Himmel, glühend und verstrahlt.',lvl:75,t:32,xp:600,need:'schutzanzug',loot:[['plasma',1,2,.6],['titan',2,3,.6],['kern',1,1,.25],['elektronik',5,10,.5]]},
 {id:'hauptstadt',n:'Ruinen der Hauptstadt',i:'🏛️',d:'Das Herz der alten Welt. Wer hier plündert, findet Schätze – oder sein Ende.',lvl:88,t:36,xp:850,need:'schutzanzug',loot:[['kern',1,2,.35],['plasma',1,2,.5],['titan',2,4,.5],['kronkorken',40,90,.7]]},
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
 // ----- Endgame -----
 brandstifter:{n:'Brandstifter',i:'🔥',hp:650,atk:58,def:26,spd:1.9,xp:360,loot:[['chemie',3,6,.6],['kronkorken',15,30,.6],['munition',5,10,.4]]},
 oelkaefer:{n:'Ölkäfer',i:'🪲',hp:820,atk:64,def:30,spd:2.2,xp:450,loot:[['chemie',4,8,.6],['titan',1,1,.08]]},
 oelwurm:{n:'Der Ölwurm',i:'🪱',hp:6500,atk:100,def:32,spd:2.5,xp:9000,boss:1,loot:[['titan',10,15,1],['kronkorken',1500,2500,1],['medkit',3,5,1]]},
 schatten:{n:'Schattenläufer',i:'👤',hp:850,atk:70,def:42,spd:1.6,xp:470,loot:[['stoff',5,10,.6],['kronkorken',20,40,.6],['elektronik',2,4,.3]]},
 drohne:{n:'Wachdrohne',i:'🛸',hp:1000,atk:78,def:48,spd:2,xp:560,loot:[['elektronik',4,8,.6],['titan',1,2,.15]]},
 omega:{n:'Kampfroboter Omega',i:'🦾',hp:9000,atk:110,def:50,spd:2.6,xp:14000,boss:1,loot:[['titan',20,30,1],['elektronik',60,90,1],['plasma',3,5,1]]},
 skorpion:{n:'Riesenskorpion',i:'🦂',hp:1400,atk:95,def:65,spd:1.8,xp:780,loot:[['chemie',8,14,.6],['titan',1,2,.2]]},
 geier:{n:'Mutantengeier',i:'🦅',hp:1200,atk:100,def:60,spd:1.5,xp:700,loot:[['nahrung',10,20,.5],['kronkorken',30,60,.6]]},
 koenigin:{n:'Skorpionkönigin',i:'👑',hp:15000,atk:140,def:72,spd:2.6,xp:22000,boss:1,loot:[['kern',3,5,1],['titan',30,40,1],['kronkorken',4000,6000,1]]},
 experiment:{n:'Entflohenes Experiment',i:'🧬',hp:1600,atk:108,def:80,spd:1.7,xp:900,loot:[['plasma',1,1,.12],['chemie',10,18,.6],['medkit',1,1,.2]]},
 klon:{n:'Klonsoldat',i:'💂',hp:1800,atk:112,def:88,spd:1.9,xp:1000,loot:[['munition',15,30,.6],['elektronik',5,10,.5],['plasma',1,1,.1]]},
 ascher:{n:'Dr. Ascher',i:'🥼',hp:20000,atk:160,def:90,spd:2.4,xp:32000,boss:1,loot:[['plasma',15,25,1],['kern',5,8,1],['medkit',5,8,1]]},
 wolf:{n:'Strahlenwolf',i:'🐺',hp:2200,atk:125,def:105,spd:1.6,xp:1250,loot:[['nahrung',15,30,.5],['kern',1,1,.06],['titan',2,3,.3]]},
 frostmutant:{n:'Frostmutant',i:'🥶',hp:2600,atk:130,def:115,spd:2,xp:1450,loot:[['plasma',1,2,.2],['kronkorken',50,90,.6]]},
 eisbestie:{n:'Die Eisbestie',i:'🐻‍❄️',hp:28000,atk:190,def:115,spd:2.5,xp:45000,boss:1,loot:[['kern',8,12,1],['plasma',25,35,1],['titan',50,70,1]]},
 geist:{n:'Strahlengeist',i:'👻',hp:4000,atk:155,def:140,spd:1.5,xp:2100,loot:[['kern',1,1,.1],['plasma',1,2,.3]]},
 golem:{n:'Atomgolem',i:'🪨',hp:4800,atk:165,def:150,spd:2.2,xp:2500,loot:[['titan',3,5,.5],['kern',1,1,.12]]},
 urmutter:{n:'Die Urmutter',i:'👁️',hp:60000,atk:240,def:155,spd:2.6,xp:120000,boss:1,loot:[['kern',30,30,1],['kronkorken',25000,25000,1]]},
};
const FZ=[
 {id:'rand',n:'Ödland-Rand',i:'🌵',lvl:1,en:['ratte','hund']},
 {id:'highway',n:'Highway 9',i:'🛣️',lvl:5,en:['hund','pluenderer','ghul']},
 {id:'sumpf',n:'Mutantensumpf',i:'🌫️',lvl:12,need:'gasmaske',en:['kriecher','mutant'],boss:'sumpfmutter'},
 {id:'metro',n:'Metro-Tunnel',i:'🚇',lvl:20,need:'lampe',en:['spinne','wildghul'],boss:'leuchtghul'},
 {id:'festung',n:'Raider-Festung',i:'🏴',lvl:28,en:['raider','veteran'],boss:'varga'},
 {id:'krater',n:'Der Krater',i:'☢️',lvl:38,need:'geiger',en:['bestie','behemoth'],boss:'koloss'},
 // ----- Endgame -----
 {id:'oelfeld',n:'Brennende Ölfelder',i:'🛢️',lvl:45,en:['brandstifter','oelkaefer'],boss:'oelwurm'},
 {id:'geisterstadt',n:'Geisterstadt',i:'🌆',lvl:55,en:['schatten','drohne'],boss:'omega'},
 {id:'saeure',n:'Säurewüste',i:'🏜️',lvl:65,en:['skorpion','geier'],boss:'koenigin'},
 {id:'laborx',n:'Labor X',i:'🧪',lvl:75,en:['experiment','klon'],boss:'ascher'},
 {id:'frost',n:'Ewiger Winter',i:'❄️',lvl:85,need:'schutzanzug',en:['wolf','frostmutant'],boss:'eisbestie'},
 {id:'epizentrum',n:'Das Epizentrum',i:'💥',lvl:95,need:'schutzanzug',en:['geist','golem'],boss:'urmutter'},
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
 kettensaege:{n:'Kettensäge',i:'🪚',typ:'waffe',min:62,max:90,spd:1.5,lvl:48,wb:6,cost:{schrott:600,titan:10,chemie:80},t:30,xp:600},
 plasmagewehr:{n:'Plasmagewehr',i:'🟢',typ:'waffe',min:85,max:125,spd:1.3,lvl:62,wb:7,cost:{plasma:12,elektronik:150,titan:20},t:35,xp:900},
 schienenkanone:{n:'Schienenkanone',i:'🧲',typ:'waffe',min:120,max:170,spd:1.6,ammo:1,lvl:76,wb:7,cost:{titan:60,plasma:25,kern:8},t:40,xp:1300},
 fusionsklinge:{n:'Fusionsklinge',i:'🗡️',typ:'waffe',min:160,max:230,spd:1.2,lvl:90,wb:8,cost:{kern:25,plasma:60,titan:80},t:50,xp:2000},
 lumpen:{n:'Lumpenkleidung',i:'👕',typ:'ruestung',def:1,hp:5,lvl:1,wb:1,cost:{stoff:8},t:3,xp:8},
 weste:{n:'Lederweste',i:'🦺',typ:'ruestung',def:3,hp:15,lvl:6,wb:1,cost:{stoff:25,schrott:10},t:6,xp:30},
 reifen:{n:'Reifenpanzer',i:'🛞',typ:'ruestung',def:6,hp:30,lvl:12,wb:2,cost:{schrott:80,stoff:20},t:10,xp:60},
 schrottr:{n:'Schrottrüstung',i:'🛡️',typ:'ruestung',def:10,hp:50,lvl:20,wb:3,cost:{schrott:180,chemie:20},t:14,xp:120},
 kampfr:{n:'Kampfrüstung',i:'🥋',typ:'ruestung',def:15,hp:80,lvl:28,wb:4,cost:{schrott:250,stoff:60,elektronik:20},t:18,xp:200},
 power:{n:'Power-Rüstung',i:'🤖',typ:'ruestung',def:24,hp:140,lvl:40,wb:5,cost:{schrott:500,elektronik:80,kern:5},t:30,xp:450},
 titanr:{n:'Titanrüstung',i:'🔰',typ:'ruestung',def:32,hp:200,lvl:50,wb:6,cost:{titan:25,schrott:600,stoff:120},t:32,xp:650},
 tarnanzug:{n:'Tarnanzug',i:'🥷',typ:'ruestung',def:40,hp:280,lvl:64,wb:7,cost:{plasma:15,stoff:200,titan:40,elektronik:100},t:36,xp:950},
 exo:{n:'Exoskelett',i:'🦿',typ:'ruestung',def:50,hp:380,lvl:78,wb:7,cost:{titan:100,plasma:40,kern:10},t:42,xp:1400},
 fusionspanzer:{n:'Fusionspanzer',i:'💠',typ:'ruestung',def:62,hp:520,lvl:92,wb:8,cost:{kern:30,titan:150,plasma:80},t:55,xp:2200},
 rucksack:{n:'Rucksack',i:'🎒',typ:'tool',d:'Plündern 15 % schneller',lvl:3,wb:1,cost:{stoff:20},t:5,xp:20},
 brecheisen:{n:'Brecheisen',i:'🪛',typ:'tool',d:'+20 % Beute-Chance beim Plündern',lvl:8,wb:2,cost:{schrott:50},t:6,xp:35},
 gasmaske:{n:'Gasmaske',i:'😷',typ:'tool',d:'Zugang zum Mutantensumpf',lvl:10,wb:2,cost:{stoff:20,chemie:15},t:8,xp:50},
 lampe:{n:'Stirnlampe',i:'🔦',typ:'tool',d:'Zugang zu den Metro-Tunneln',lvl:16,wb:3,cost:{schrott:40,elektronik:5,chemie:10},t:10,xp:80},
 geiger:{n:'Geigerzähler',i:'📟',typ:'tool',d:'Zugang zum Strahlenkrater',lvl:35,wb:4,cost:{elektronik:30,schrott:100},t:12,xp:150},
 schneidbrenner:{n:'Schneidbrenner',i:'🔥',typ:'tool',d:'Zugang zum Flughafen-Wrack',lvl:52,wb:6,cost:{chemie:120,schrott:300,elektronik:40},t:20,xp:500},
 schutzanzug:{n:'Strahlenschutzanzug',i:'☣️',typ:'tool',d:'Zugang zu Satellitenabsturz, Hauptstadt, Ewigem Winter und Epizentrum',lvl:72,wb:7,cost:{stoff:300,plasma:10,titan:30},t:30,xp:900},
 // Waffen-Mods: gelten für jede Waffe
 zielfernrohr:{n:'Zielfernrohr',i:'🔭',typ:'mod',d:'Trefferchance 90 % → 98 %',lvl:42,wb:5,cost:{elektronik:40,schrott:150,chemie:20},t:15,xp:300},
 daempfer:{n:'Rückstoßdämpfer',i:'🌀',typ:'mod',d:'Angriffe 10 % schneller',lvl:50,wb:6,cost:{titan:8,schrott:300},t:18,xp:550},
 panzerbrecher:{n:'Panzerbrecher',i:'🪓',typ:'mod',d:'Ignoriert 30 % der gegnerischen Rüstung',lvl:60,wb:6,cost:{titan:20,chemie:120,elektronik:60},t:22,xp:800},
 plasmaladung:{n:'Plasma-Ladung',i:'⚡',typ:'mod',d:'+15 % Schaden',lvl:70,wb:7,cost:{plasma:15,elektronik:120},t:26,xp:1100},
 praezision:{n:'Präzisionschip',i:'💡',typ:'mod',d:'10 % Chance auf kritischen Treffer (doppelter Schaden)',lvl:84,wb:8,cost:{plasma:30,kern:6,elektronik:200},t:30,xp:1600},
 c_verband:{n:'Verband',i:'🩹',typ:'verbr',gives:{verband:1},lvl:1,wb:1,cost:{stoff:3},t:2,xp:3},
 c_munition:{n:'Munition',i:'🔸',typ:'verbr',gives:{munition:5},lvl:10,wb:2,cost:{schrott:4,chemie:1},t:3,xp:6},
 c_medkit:{n:'Medkit',i:'💊',typ:'verbr',gives:{medkit:1},lvl:15,wb:3,cost:{chemie:4,stoff:2,verband:1},t:5,xp:15},
 c_munkiste:{n:'Munitionskiste',i:'📦',typ:'verbr',gives:{munition:30},lvl:40,wb:5,cost:{schrott:20,chemie:6},t:8,xp:45},
 c_handelsware:{n:'Handelsware',i:'💰',typ:'verbr',gives:{kronkorken:60},lvl:55,wb:6,cost:{schrott:60,stoff:20,elektronik:5},t:12,xp:110},
 c_plasma:{n:'Plasmazelle',i:'🔋',typ:'verbr',gives:{plasma:1},lvl:70,wb:7,cost:{elektronik:25,chemie:40},t:20,xp:240},
};
const BU={
 werkbank:{n:'Werkbank',i:'🔧',max:8,costs:[{schrott:15},{schrott:60,stoff:15},{schrott:200,chemie:30},{schrott:400,elektronik:25,chemie:40},{schrott:800,elektronik:60,kern:1},{schrott:1500,elektronik:120,titan:10},{schrott:3000,elektronik:250,titan:40,plasma:10},{schrott:6000,titan:120,plasma:40,kern:10}],d:'Jede Stufe schaltet neue Baupläne frei.'},
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
 {l:3,g:{kronkorken:400},t:{titan:2}},{l:3,g:{kronkorken:900},t:{plasma:1}},
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
 // ----- Endgame: die Spur der Urmutter -----
 {t:'Funksprüche aus dem Osten',s:'Der Koloss ist gefallen. Doch das Funkgerät knackt: Jemand im Osten sendet Koordinaten – und eine Warnung.',g:'Plündere 10× die Ölraffinerie',c:()=>(S.stats.scav.raffinerie||0)>=10,r:{kronkorken:500}},
 {t:'Feuer im Ölfeld',s:'Die Ölfelder brennen seit Jahren. Darunter bewegt sich etwas Riesiges.',g:'Besiege den Ölwurm',c:()=>!!S.stats.boss.oelwurm,r:{titan:10}},
 {t:'Bessere Werkzeuge',s:'Mit Titan lässt sich eine Werkbank bauen, die Dinge kann, von denen die alte Welt nur träumte.',g:'Baue die Werkbank auf Stufe 6',c:()=>lv('werkbank')>=6,r:{chemie:100}},
 {t:'Stahlvögel',s:'Am alten Flughafen liegen Jets voller Titan. Man muss sie nur aufschneiden.',g:'Plündere 10× das Flughafen-Wrack',c:()=>(S.stats.scav.flughafen||0)>=10,r:{elektronik:80}},
 {t:'Die Stadt der Schatten',s:'In der Geisterstadt patrouilliert eine Maschine, die nie den Befehl zum Aufhören bekommen hat.',g:'Besiege Kampfroboter Omega',c:()=>!!S.stats.boss.omega,r:{plasma:5}},
 {t:'Gift im Sand',s:'Die Säurewüste gehört einer Königin mit Stachel. Wer zum Labor will, muss an ihr vorbei.',g:'Besiege die Skorpionkönigin',c:()=>!!S.stats.boss.koenigin,r:{kern:3}},
 {t:'Das Geheimlabor',s:'Die Koordinaten führen zu einem Labor. In den Akten taucht immer wieder ein Name auf: „Projekt Urmutter“.',g:'Plündere 10× das Geheimlabor',c:()=>(S.stats.scav.geheimlabor||0)>=10,r:{plasma:10}},
 {t:'Der Doktor',s:'Dr. Ascher hat das Projekt geleitet – und sich selbst zum Versuchskaninchen gemacht.',g:'Besiege Dr. Ascher',c:()=>!!S.stats.boss.ascher,r:{kern:5}},
 {t:'Sterne, die fielen',s:'Ein Satellit ist abgestürzt. Seine Daten zeigen, wo die Urmutter schläft – im Epizentrum.',g:'Plündere 10× den Satellitenabsturz',c:()=>(S.stats.scav.satellit||0)>=10,r:{titan:40}},
 {t:'Ewiger Winter',s:'Der Weg ins Epizentrum führt durch Eis und Strahlung. Und durch das, was dort jagt.',g:'Besiege die Eisbestie',c:()=>!!S.stats.boss.eisbestie,r:{kern:8}},
 {t:'Legenden',s:'Die alten Geschichten erzählen von Waffen, die heller leuchten als alles andere.',g:'Finde ein legendäres Fundstück',c:()=>!!S.stats.legendaer,r:{kronkorken:5000}},
 {t:'Die Urmutter',s:'Im Epizentrum pulsiert das Wesen, aus dem alle Mutationen stammen. Beende es – und das Ödland kann heilen.',g:'Besiege die Urmutter',c:()=>!!S.stats.boss.urmutter,r:{kern:20}},
];

// ----- Fundstücke: Seltenheiten (f = Faktor auf Schaden, Rüstung und HP) -----
const RAR=[
 {n:'Gewöhnlich',f:1,c:'#cfc6b4'},
 {n:'Ungewöhnlich',f:1.12,c:'#7bd389'},
 {n:'Selten',f:1.25,c:'#5aa9e6'},
 {n:'Episch',f:1.4,c:'#b07bff'},
 {n:'Legendär',f:1.6,c:'#ffb02e'},
];
const BEUTE={chance:.03,gewicht:[50,30,14,5,1],bossGewicht:[0,0,55,35,10],platz:20};
