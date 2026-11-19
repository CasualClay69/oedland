"use strict";
// =====================================================
//  VERSION – die einzige Stelle, an der die Versionsnummer steht.
//  Bei jeder Änderung am Spiel hochzählen: Dann lädt der Service Worker (sw.js) alles neu,
//  und wer eine alte Version offen hat, bekommt "Neue Version verfügbar".
//  APP_NEU: kurzer Text, was neu ist (bitte keine " im Text).
//  APP_DATEIEN: alle Dateien des Spiels – neue Dateien hier eintragen!
// =====================================================
const APP_VERSION = "1.3";
const APP_NEU = "Das Endgame ist da: 6 neue Kampfgebiete und 5 Plünderziele bis Level 95, Titan und Plasma, Werkbank bis Stufe 8, Waffen-Mods, Fundstücke von gewöhnlich bis legendär – und die Jagd auf die Urmutter.";
const APP_DATEIEN = [
  "./", "index.html", "manifest.webmanifest", "css/style.css",
  "js/version.js", "js/splash.js", "js/daten.js", "js/zustand.js", "js/hilfen.js", "js/beute.js", "js/logik.js",
  "js/aktionen.js", "js/anzeige.js", "js/app.js", "js/main.js",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png",
];
