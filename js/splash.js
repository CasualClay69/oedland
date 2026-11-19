"use strict";
// =====================================================
//  STARTBILDSCHIRM: 3 Sekunden mit Ladebalken, wechselnden Statustexten und Versionsnummer.
//  Er steht schon im HTML (#splash) und ist deshalb vom ersten Moment an zu sehen.
// =====================================================

const SPLASH = {
  dauerMs: 3000,
  texte: [
    "Geigerzähler wird kalibriert …",
    "Wasserfilter werden gespült …",
    "Funkkontakt wird hergestellt …",
    "Vorräte werden gezählt …",
    "Das Ödland wartet.",
  ],
};

(function startbildschirm() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  document.getElementById("splashVersion").textContent = `Version ${APP_VERSION}`;

  // Statustexte nacheinander zeigen
  const status = document.getElementById("splashStatus");
  let i = 0;
  const wechsel = setInterval(() => {
    i = Math.min(i + 1, SPLASH.texte.length - 1);
    status.textContent = SPLASH.texte[i];
  }, SPLASH.dauerMs / SPLASH.texte.length);

  // 3 Sekunden ab dem Öffnen der Seite (die Ladezeit zählt mit), dann weich ausblenden
  const rest = Math.max(0, SPLASH.dauerMs - performance.now());
  setTimeout(() => {
    clearInterval(wechsel);
    splash.classList.add("weg");
    setTimeout(() => splash.remove(), 700);
  }, rest);
})();
