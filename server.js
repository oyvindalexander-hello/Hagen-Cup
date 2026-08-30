/* Hagen Cup — liten scoringsserver. Ingen avhengigheter. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");
const PUBLIC = __dirname;

const RED = ["Tor M", "Amund", "Lasse", "Noreng", "Vangen", "Mølla"];
const WHITE = ["Stian", "Haltbakk", "Morten", "Hagen", "Ole P.", "Fabian"];
const MATCH_IDS = ["s1", "s2", "s3", "s4", "s5", "s6", "b1", "b2", "b3"];
const VALUES = new Set(["red", "white", "halve", null]);

function fresh() {
  const matches = {};
  for (const id of MATCH_IDS) matches[id] = Array(9).fill(null);
  return {
    roster: { red: [...RED], white: [...WHITE] },
    matches,
    bonus: { ld: { team: null, who: "" }, ctp: { team: null, who: "" } },
    rev: 0,
  };
}

let state = fresh();

/* ---------- lagring ---------- */
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(STATE_FILE)) {
    const saved = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    const base = fresh();
    state = {
      roster: saved.roster && saved.roster.red && saved.roster.white ? saved.roster : base.roster,
      matches: { ...base.matches, ...(saved.matches || {}) },
      bonus: { ...base.bonus, ...(saved.bonus || {}) },
      rev: saved.rev || 0,
    };
    console.log(`Lastet score fra ${STATE_FILE} (rev ${state.rev})`);
  }
} catch (err) {
  console.error("Kunne ikke lese lagret score, starter tomt:", err.message);
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const tmp = STATE_FILE + ".tmp";
    try {
      fs.writeFileSync(tmp, JSON.stringify(state));
      fs.renameSync(tmp, STATE_FILE);
    } catch (err) {
      console.error("Lagring feilet:", err.message);
    }
  }, 400);
}

/* ---------- live oppdatering ---------- */
const clients = new Set();
function broadcast() {
  state.rev += 1;
  save();
  const msg = `data: ${JSON.stringify(state)}\n\n`;
  for (const res of clients) { try { res.write(msg); } catch { clients.delete(res); } }
}

/* ---------- hjelpere ---------- */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".json": "application/json",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

function json(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", c => { raw += c; if (raw.length > 20000) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

/* ---------- server ---------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  if (p === "/api/state" && req.method === "GET") return json(res, 200, state);

  if (p === "/api/stream" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache",
      Connection: "keep-alive", "X-Accel-Buffering": "no" });
    res.write(`data: ${JSON.stringify(state)}\n\n`);
    clients.add(res);
    const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch {} }, 25000);
    req.on("close", () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  if (req.method === "POST") {
    let body;
    try { body = await readBody(req); } catch { return json(res, 400, { error: "Ugyldig JSON" }); }

    if (p === "/api/hole") {
      const { matchId, hole, value } = body;
      if (!MATCH_IDS.includes(matchId)) return json(res, 400, { error: "Ukjent match" });
      if (!Number.isInteger(hole) || hole < 0 || hole > 8) return json(res, 400, { error: "Ugyldig hull" });
      if (!VALUES.has(value)) return json(res, 400, { error: "Ugyldig verdi" });
      state.matches[matchId][hole] = value;
      broadcast();
      return json(res, 200, { ok: true, rev: state.rev });
    }

    if (p === "/api/bonus") {
      const { id, team, who } = body;
      if (!["ld", "ctp"].includes(id)) return json(res, 400, { error: "Ukjent bonus" });
      if (team !== undefined) {
        if (![null, "red", "white"].includes(team)) return json(res, 400, { error: "Ugyldig lag" });
        state.bonus[id].team = team;
      }
      if (who !== undefined) state.bonus[id].who = String(who).slice(0, 40);
      broadcast();
      return json(res, 200, { ok: true, rev: state.rev });
    }

    if (p === "/api/roster") {
      const { team, index, name } = body;
      if (!["red", "white"].includes(team)) return json(res, 400, { error: "Ugyldig lag" });
      if (!Number.isInteger(index) || index < 0 || index > 5) return json(res, 400, { error: "Ugyldig plass" });
      state.roster[team][index] = String(name).slice(0, 24);
      broadcast();
      return json(res, 200, { ok: true, rev: state.rev });
    }

    if (p === "/api/reset") {
      if (url.searchParams.get("key") !== (process.env.RESET_KEY || "")) {
        return json(res, 403, { error: "Feil nøkkel" });
      }
      state = fresh();
      broadcast();
      return json(res, 200, { ok: true });
    }
    return json(res, 404, { error: "Ukjent endepunkt" });
  }

  // statiske filer
  const rel = p === "/" ? "index.html" : p.replace(/^\/+/, "");
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Ikke funnet");
    }
    const ext = path.extname(file);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600",
    });
    res.end(buf);
  });
});

server.listen(PORT, () => console.log(`Hagen Cup kjører på port ${PORT} — data i ${DATA_DIR}`));
