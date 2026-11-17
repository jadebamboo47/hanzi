# 汉字 Schreibkarten

Lern-App für chinesische Schriftzeichen auf dem iPad mit Apple Pencil:
deutsches Wort → Pinyin mit Tönen eingeben → Zeichen mit dem Stift schreiben (Strichprüfung mit Hanzi Writer).

- Wortschatz: *China entdecken* Band 1 und 2 (Lektionen 1–12), zusätzlich HSK 1–4
- Wiederholung nach dem Karteikasten-Prinzip, Fortschritt bleibt auf dem Gerät
- Installierbar über Safari → Teilen → „Zum Home-Bildschirm“, funktioniert danach offline

Strichdaten: [Hanzi Writer](https://hanziwriter.org) / [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) (Arphic Public License).

## Aufbau

- `src/app.html` – App (Oberfläche und Logik), mit Platzhaltern für Bibliothek und Daten
- `src/data.js` – Wörter (Band 1, Band 2, HSK 1–4) und Strichdaten
- `src/vokabeln_band*.txt` – Vokabellisten (Wort | Pinyin | Lektion | … | Bedeutung)
- `build.py` – baut daraus `index.html` (`python3 build.py`)
- `sw.js`, `manifest.webmanifest`, Icons – Installierbarkeit und Offline-Betrieb

## Aussprache

Aufnahmen aus [audio-cmn](https://github.com/hugolpz/audio-cmn) – Silben: Chen Wang, Wörter: Yue Tan, Lizenz [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Dateien unverändert in `audio/` (umbenannt).
