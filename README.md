# Unsichere-Webapp-Sanierung

## Aufgabenstellung

Diese Anwendung ist eine einfache Fullstack-Webanwendung (Node.js + Express + SQLite).

### Deine Aufgabe

Analysiere den gesamten Quellcode – Backend und Frontend – und identifiziere alle Verstöße gegen die **DSGVO** sowie alle **Sicherheitsprobleme**. Dokumentiere jeden gefundenen Verstoß mit Datei, Zeilennummer, betroffenem Gesetzesartikel bzw. OWASP-Kategorie und einem konkreten Lösungsvorschlag. Setze anschließend alle gefundenen Fixes um.

---

## Projektstruktur

```
unsichere-webapp-sanierung/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── package.json
├── .gitignore
└── README.md
```

---

## Installation & Start

### Voraussetzungen

- [Node.js](https://nodejs.org/) (empfohlen: Version 18, 20 oder 22; Node 24 ist mit `better-sqlite3@9.4.3` problematisch)
- npm (wird mit Node.js mitgeliefert)

### Abhängigkeiten installieren

```bash
npm run install
```

> Dieser Befehl wechselt in den `backend/`-Ordner und führt dort `npm install` aus.

### Anwendung starten

```bash
npm start
```

Der Server startet auf **http://localhost:3000**.  
Das Frontend wird automatisch aus dem Ordner `frontend/` ausgeliefert.

### Entwicklungsmodus (identisch mit start)

```bash
npm run dev
```

---

## Verwendete Technologien

| Schicht  | Technologie                     |
|----------|---------------------------------|
| Backend  | Node.js, Express, better-sqlite3 |
| Frontend | HTML, Vanilla JavaScript, CSS   |
| Datenbank| SQLite (Datei: `users.db`)      |

---

## Hinweis

Diese Anwendung ist **ausschließlich für Bildungszwecke** erstellt. Sie darf **nicht produktiv eingesetzt** werden, da sie bewusst unsicher ist.
