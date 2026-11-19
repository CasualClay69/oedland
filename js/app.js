"use strict";
// =====================================================
//  APP: installieren (Startbildschirm), offline spielen (sw.js), "Neue Version verfügbar",
//  Spielstand als Datei sichern und wieder laden.
// =====================================================

// ----- Service Worker anmelden (nur über http/https, nicht beim Öffnen als Datei) -----
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// ----- Installieren -----
let installAnfrage = null;   // vom Browser angebotene Installation (Android/Chrome/Edge)
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installAnfrage = e; markDirty(); });
window.addEventListener("appinstalled", () => { installAnfrage = null; toast("📲 Ödland ist jetzt auf deinem Startbildschirm!", "good"); markDirty(); });

const istInstalliert = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const istIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

async function appInstallieren() {
  if (installAnfrage) {
    installAnfrage.prompt();
    try { await installAnfrage.userChoice; } catch (e) { /* egal */ }
    installAnfrage = null;
    markDirty();
  } else if (istIOS()) {
    modal(`<h3>Auf den Home-Bildschirm</h3><p>Tippe unten in Safari auf <b>Teilen</b> (□↑) und dann auf <b>„Zum Home-Bildschirm“</b>.</p>`);
  } else {
    modal(`<h3>Installieren</h3><p>Öffne das Menü deines Browsers (⋮) und wähle <b>„App installieren“</b> oder <b>„Zum Startbildschirm hinzufügen“</b>.</p>`);
  }
}

// HTML-Block für den Profil-Tab
function appBereich() {
  let h = `<h2>App</h2><div class="card">`;
  if (istInstalliert()) h += `<div class="g" style="font-weight:700">📲 Ödland läuft als App – auch offline.</div>`;
  else h += `<div class="row" style="margin-top:0"><span class="mut sm">Aufs Handy holen: eigenes Symbol, Vollbild, offline spielbar.</span><button class="btn acc" data-a="install">📲 Installieren</button></div>`;
  h += `<div class="row"><span class="mut sm">Spielstand als Datei sichern – z. B. für ein neues Handy.</span><span style="display:flex;gap:6px"><button class="btn sm" data-a="export">💾 Sichern</button><button class="btn sm" data-a="import">📂 Laden</button></span></div>`;
  h += `<div class="mut sm" style="margin-top:10px">Version ${APP_VERSION}</div></div>`;
  return h;
}

// ----- Spielstand sichern / laden -----
function spielstandSichern() {
  save();
  const datei = new Blob([JSON.stringify({ spiel: "oedland", version: APP_VERSION, gesichert: new Date().toISOString(), stand: S }, null, 1)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(datei);
  link.download = `oedland-spielstand-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
  toast("💾 Spielstand gesichert.", "good");
}

function spielstandLaden() {
  const eingabe = document.createElement("input");
  eingabe.type = "file";
  eingabe.accept = ".json,application/json";
  eingabe.addEventListener("change", async () => {
    const datei = eingabe.files && eingabe.files[0];
    if (!datei) return;
    try {
      const daten = JSON.parse(await datei.text());
      const stand = daten && daten.spiel === "oedland" ? daten.stand : null;
      if (!stand || typeof stand !== "object" || !stand.res || !stand.xp) throw new Error("keine Ödland-Datei");
      if (!confirm(`Spielstand vom ${new Date(daten.gesichert).toLocaleString("de-DE")} laden? Der jetzige wird ersetzt.`)) return;
      stand.last = Date.now();   // kein riesiger Offline-Bonus durch alte Dateien
      localStorage.setItem(KEY, JSON.stringify(stand));
      location.reload();
    } catch (e) {
      toast("⚠️ Diese Datei ist kein Ödland-Spielstand.", "bad");
    }
  });
  eingabe.click();
}

// ----- Neue Version? -----
function istNeuer(a, b) {
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
  }
  return false;
}

let updateSpaeter = false;
async function pruefeAufUpdate() {
  if (updateSpaeter || !location.protocol.startsWith("http")) return;
  try {
    const antwort = await fetch(`js/version.js?frisch=${Date.now()}`, { cache: "no-store" });
    if (!antwort.ok) return;
    const text = await antwort.text();
    const version = (text.match(/APP_VERSION\s*=\s*"([^"]+)"/) || [])[1];
    const neu = (text.match(/APP_NEU\s*=\s*"([^"]*)"/) || [])[1] || "";
    if (version && istNeuer(version, APP_VERSION)) {
      $("#mbox").innerHTML = `<h3>Neue Version verfügbar!</h3><p class="mut">Du spielst ${APP_VERSION} – neu ist ${version}.</p>${neu ? `<p>🆕 ${neu.replace(/</g, "&lt;")}</p>` : ""}<p class="mut sm">Dein Spielstand bleibt erhalten.</p>
        <div class="row"><button class="btn sm" data-a="spaeter">Später</button><button class="btn acc" data-a="update">🔄 Jetzt aktualisieren</button></div>`;
      $("#modal").classList.remove("hidden");
    }
  } catch (e) { /* offline – später nochmal */ }
}

// Alle Dateien frisch holen, Speicher leeren, neu starten (alte und neue Dateien dürfen sich nie mischen)
async function aktualisiereApp() {
  save();
  try { await Promise.all(APP_DATEIEN.map(d => fetch(d, { cache: "reload" }))); } catch (e) { /* trotzdem weiter */ }
  try { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch (e) { /* egal */ }
  try { for (const n of await caches.keys()) if (n !== "oedland-schriften") await caches.delete(n); } catch (e) { /* egal */ }
  location.reload();
}

setTimeout(pruefeAufUpdate, 5000);
setInterval(pruefeAufUpdate, 30 * 60 * 1000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) pruefeAufUpdate(); });
