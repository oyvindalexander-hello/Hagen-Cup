# Hagen Cup 2026 — scoringsapp

Villa Padierna · Alferini. 6 mot 6, Ryder Cup-format.
Front 9 singel (54 poeng), back 9 scramble (27), bonus (4). Sum 85 — 43 vinner.

Alle med lenken kan taste score. Ingen innlogging, ingen kontoer.
Endringer dukker opp hos alle andre umiddelbart.

---

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne http://localhost:3000

## Deploy på Render

1. Legg mappa i et git-repo og push til GitHub.
2. På Render: **New → Blueprint**, pek på repoet. `render.yaml` setter opp alt.
3. Vent på første deploy. Del URL-en med spillerne.

Alternativt uten blueprint: **New → Web Service**, Node, build `npm install && npm run build`,
start `npm start`. Legg til en disk montert på `/var/data` og sett `DATA_DIR=/var/data`.

### Disken er ikke valgfri

Uten en montert disk ligger scoren bare i containerens filsystem. Render kan starte
tjenesten på nytt når som helst, og da er alt borte. Gratisplanen legger på et ekstra
problem: tjenesten sovner ved inaktivitet og våkner med tomt filsystem.

`render.yaml` ber derfor om `plan: starter` med 1 GB disk. Det koster penger.
Sjekk hva Render tar i dag — prisene endrer seg.

---

## API

| Metode | Sti | Kropp |
|---|---|---|
| GET | `/api/state` | — |
| GET | `/api/stream` | SSE, pusher hele tilstanden ved hver endring |
| POST | `/api/hole` | `{ matchId, hole: 0-8, value: "red"\|"white"\|"halve"\|null }` |
| POST | `/api/bonus` | `{ id: "ld"\|"ctp", team?, who? }` |
| POST | `/api/roster` | `{ team, index: 0-5, name }` |
| POST | `/api/reset?key=…` | Nullstiller alt. Krever `RESET_KEY` |

`RESET_KEY` genereres automatisk av Render. Finn den under Environment hvis du
trenger å nullstille før neste runde.

## Matchoppsettet

Rekkefølgen i `roster` styrer alt. Plass 1 møter plass 1, plass 2 møter plass 2,
og så videre. Flight 1 er plass 1–2, flight 2 er plass 3–4, flight 3 er plass 5–6.
På back 9 går de to fra samme lag i hver flight sammen i scramble.

Bytt navn under **Lag**-fanen i appen — oppsettet regnes om av seg selv.

## Filer

```
server.js          hele backenden, ingen avhengigheter utover Node
src/App.jsx        frontend
src/main.jsx       inngangspunkt
public/app.js      ferdig bygget frontend (bygges av npm run build)
public/index.html
public/logo.png
render.yaml        Render-oppsett med disk
```
