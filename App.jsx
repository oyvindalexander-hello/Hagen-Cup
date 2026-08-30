import React, { useState, useEffect, useRef } from "react";

const CSS = `
.hc *, .hc *::before, .hc *::after { box-sizing: border-box; }
.hc {
  --bg:#0A0908; --surface:#151310; --raise:#1F1B17; --line:#2E2721;
  --red:#E5342A; --red-deep:#4C1410;
  --white:#F2F0EA; --white-deep:#3A3934;
  --halve:#2BB6C4; --mute:#8B857C;
  background:var(--bg); color:var(--white);
  font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
  min-height:100%; padding:0 0 64px;
  -webkit-font-smoothing:antialiased;
}
.hc .wrap { max-width:520px; margin:0 auto; padding:0 14px; }
.hc .caps {
  text-transform:uppercase; font-weight:800; letter-spacing:.2em;
}
.hc .num { font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; }

/* ---- header ---- */
.hc .hdr { padding:18px 0 16px; border-bottom:1px solid var(--line); }
.hc .crest { display:flex; flex-direction:column; align-items:center; margin-bottom:20px; }
.hc .crest img { width:88px; height:auto; display:block; }
.hc .eyebrow { font-size:9px; letter-spacing:.34em; color:var(--mute); margin-top:12px; }
.hc .wordmark { font-size:13px; letter-spacing:.28em; margin-top:15px; text-align:center; }
.hc .venue { font-size:9px; letter-spacing:.24em; color:var(--mute); margin-top:8px; text-align:center; }
.hc .tally { display:flex; align-items:flex-end; justify-content:space-between; gap:10px; }
.hc .side { display:flex; flex-direction:column; gap:4px; min-width:0; }
.hc .side.r { align-items:flex-start; }
.hc .side.w { align-items:flex-end; }
.hc .sname { font-size:10px; letter-spacing:.24em; }
.hc .sname.r { color:var(--red); }
.hc .sname.w { color:var(--white); }
.hc .sval { font-size:46px; font-weight:800; line-height:.86; letter-spacing:-.02em; }
.hc .sval.r { color:var(--red); }
.hc .status { font-size:10px; letter-spacing:.16em; color:var(--mute); text-align:center; padding-bottom:7px; }

/* ---- signatur: dragkamp-bar ---- */
.hc .bar { position:relative; height:12px; margin:16px 0 6px; background:var(--surface); overflow:hidden; }
.hc .bar-r { position:absolute; inset:0 auto 0 0; background:var(--red); transition:width .45s cubic-bezier(.22,1,.36,1); }
.hc .bar-w { position:absolute; inset:0 0 0 auto; background:var(--white); transition:width .45s cubic-bezier(.22,1,.36,1); }
.hc .bar-tick { position:absolute; top:-4px; bottom:-4px; left:50%; width:1px; background:var(--mute); }
.hc .barlabels { display:flex; justify-content:space-between; font-size:9px; letter-spacing:.16em; color:var(--mute); }

/* ---- nav ---- */
.hc .nav { display:flex; gap:0; border-bottom:1px solid var(--line); margin-bottom:4px; overflow-x:auto; -ms-overflow-style:none; scrollbar-width:none; }
.hc .nav::-webkit-scrollbar { display:none; }
.hc .nav button {
  flex:1 0 auto; background:none; border:none; border-bottom:2px solid transparent;
  color:var(--mute); font-size:10px; padding:15px 12px; cursor:pointer;
  font-family:inherit; white-space:nowrap;
}
.hc .nav button[data-on="1"] { color:var(--white); border-bottom-color:var(--red); }

/* ---- flight / match ---- */
.hc .flight { margin-top:26px; }
.hc .flabel { font-size:9px; letter-spacing:.3em; color:var(--mute); margin-bottom:9px; }
.hc .match {
  width:100%; text-align:left; background:var(--surface); border:1px solid var(--line);
  border-left:2px solid var(--line); padding:13px 14px; margin-bottom:7px;
  cursor:pointer; color:inherit; font-family:inherit; display:block;
}
.hc .match:hover, .hc .match:focus-visible { background:var(--raise); border-left-color:var(--red); }
.hc .match:focus-visible { outline:2px solid var(--white); outline-offset:2px; }
.hc .mrow { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.hc .mnames { min-width:0; }
.hc .mn { font-size:14px; line-height:1.42; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.hc .mn.r { color:var(--red); }
.hc .mpts { display:flex; align-items:center; gap:9px; font-size:19px; font-weight:800; }
.hc .mpts .r { color:var(--red); }
.hc .mpts .d { color:var(--mute); font-weight:400; font-size:12px; }
.hc .pips { display:flex; gap:2px; margin-top:11px; }
.hc .pip { flex:1; height:4px; background:var(--line); }
.hc .pip[data-v="red"] { background:var(--red); }
.hc .pip[data-v="white"] { background:var(--white); }
.hc .pip[data-v="halve"] { background:var(--halve); }
.hc .mmeta { font-size:9px; letter-spacing:.16em; color:var(--mute); margin-top:9px; }

/* ---- scorer ---- */
.hc .back { background:none; border:none; color:var(--mute); font-size:10px; letter-spacing:.2em;
  padding:16px 0; cursor:pointer; font-family:inherit; }
.hc .back:hover { color:var(--white); }
.hc .sc-head { border-bottom:1px solid var(--line); padding-bottom:16px; margin-bottom:6px; }
.hc .sc-vs { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.hc .sc-side { font-size:15px; line-height:1.42; min-width:0; }
.hc .sc-side.r { color:var(--red); }
.hc .sc-side.w { text-align:right; }
.hc .sc-pts { font-size:30px; font-weight:800; white-space:nowrap; }
.hc .sc-pts .r { color:var(--red); }
.hc .sc-pts .d { color:var(--mute); font-weight:400; font-size:15px; margin:0 5px; }

.hc .hole { display:flex; align-items:center; gap:9px; padding:6px 0; border-bottom:1px solid var(--line); }
.hc .hno { width:52px; flex:none; font-size:9px; letter-spacing:.18em; color:var(--mute); }
.hc .opts { display:flex; gap:5px; flex:1; }
.hc .opt {
  flex:1; padding:14px 4px; background:transparent; border:1px solid var(--line);
  color:var(--mute); font-size:10px; letter-spacing:.14em; cursor:pointer;
  font-family:inherit; text-transform:uppercase; font-weight:800;
  transition:background .12s, color .12s, border-color .12s;
}
.hc .opt:focus-visible { outline:2px solid var(--white); outline-offset:2px; }
.hc .opt[data-k="red"][data-on="1"]   { background:var(--red);   border-color:var(--red);   color:#fff; }
.hc .opt[data-k="halve"][data-on="1"] { background:var(--halve); border-color:var(--halve); color:#000; }
.hc .opt[data-k="white"][data-on="1"] { background:var(--white); border-color:var(--white); color:#000; }
.hc .opt[data-on="0"]:hover { border-color:var(--mute); color:var(--white); }

/* ---- bonus / lag ---- */
.hc .card { background:var(--surface); border:1px solid var(--line); padding:16px 15px; margin-bottom:8px; }
.hc .ctitle { font-size:11px; letter-spacing:.22em; }
.hc .csub { font-size:9px; letter-spacing:.16em; color:var(--mute); margin-top:5px; }
.hc .pick { display:flex; gap:5px; margin-top:14px; }
.hc .inp {
  width:100%; margin-top:9px; background:var(--bg); border:1px solid var(--line);
  color:var(--white); padding:11px 11px; font-size:14px; font-family:inherit;
}
.hc .inp:focus { outline:none; border-color:var(--mute); }
.hc .inp::placeholder { color:#55555C; }
.hc .roster { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.hc .rcol { border-top:2px solid var(--line); padding-top:11px; }
.hc .rcol.r { border-top-color:var(--red); }
.hc .rcol.w { border-top-color:var(--white); }
.hc .rlabel { font-size:9px; letter-spacing:.24em; color:var(--mute); margin-bottom:8px; }
.hc .rname { display:flex; align-items:baseline; gap:7px; padding:7px 0; border-bottom:1px solid var(--line); }
.hc .rname .p { font-size:14px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hc .rname .v { margin-left:auto; font-size:14px; font-weight:800; color:var(--mute); }
.hc .rname .i { font-size:9px; color:var(--mute); width:14px; flex:none; }

.hc .note { font-size:11px; line-height:1.6; color:var(--mute); margin-top:22px; padding-top:16px; border-top:1px solid var(--line); }
.hc .sync { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 0 0; font-size:9px; letter-spacing:.16em; color:var(--mute); }
.hc .sync button { background:none; border:1px solid var(--line); color:var(--mute); padding:7px 12px;
  font-size:9px; letter-spacing:.16em; cursor:pointer; font-family:inherit; text-transform:uppercase; }
.hc .sync button:hover { color:var(--white); border-color:var(--mute); }
.hc .warn { background:var(--red-deep); border:1px solid var(--red); padding:11px 12px; font-size:11px; line-height:1.5; margin-top:12px; }
@media (prefers-reduced-motion: reduce) { .hc * { transition:none !important; } }
`;

const SINGLES = [
  { id: "s1", flight: 1, i: 0 }, { id: "s2", flight: 1, i: 1 },
  { id: "s3", flight: 2, i: 2 }, { id: "s4", flight: 2, i: 3 },
  { id: "s5", flight: 3, i: 4 }, { id: "s6", flight: 3, i: 5 },
];
const SCRAMBLE = [
  { id: "b1", flight: 1, pair: [0, 1] },
  { id: "b2", flight: 2, pair: [2, 3] },
  { id: "b3", flight: 3, pair: [4, 5] },
];
const BONUS_DEFS = [
  { id: "ld", label: "Longest drive", hole: "Hull 12", pts: 2 },
  { id: "ctp", label: "Closest to pin", hole: "Hull 14", pts: 2 },
];

const fmt = n => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

function tally(res) {
  let r = 0, w = 0;
  for (const v of res) {
    if (v === "red") r += 1;
    else if (v === "white") w += 1;
    else if (v === "halve") { r += 0.5; w += 0.5; }
  }
  return [r, w];
}

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function HagenCup() {
  const [state, setState] = useState(null);
  const [view, setView] = useState("oversikt");
  const [open, setOpen] = useState(null);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [synced, setSynced] = useState(null);
  const pending = useRef(0);

  useEffect(() => {
    let es;
    let stopped = false;
    const connect = () => {
      if (stopped) return;
      es = new EventSource("/api/stream");
      es.onopen = () => { setLive(true); setFailed(false); };
      es.onmessage = e => {
        // ikke overskriv mens en egen endring er underveis
        if (pending.current > 0) return;
        try { setState(JSON.parse(e.data)); setSynced(new Date()); } catch {}
      };
      es.onerror = () => {
        setLive(false);
        es.close();
        setTimeout(connect, 3000);
      };
    };
    fetch("/api/state")
      .then(r => r.json())
      .then(s => { setState(s); setSynced(new Date()); connect(); })
      .catch(() => setFailed(true));
    return () => { stopped = true; if (es) es.close(); };
  }, []);

  const send = async (path, body, optimistic) => {
    pending.current += 1;
    setState(prev => optimistic(structuredClone(prev)));
    try { await post(path, body); setSynced(new Date()); setFailed(false); }
    catch { setFailed(true); }
    finally { pending.current -= 1; }
  };

  const setHole = (id, h, val) => {
    const cur = state.matches[id][h];
    const value = cur === val ? null : val;
    send("/api/hole", { matchId: id, hole: h, value }, s => { s.matches[id][h] = value; return s; });
  };
  const setBonusVal = (bid, patch) =>
    send("/api/bonus", { id: bid, ...patch }, s => { Object.assign(s.bonus[bid], patch); return s; });
  const setName = (team, index, name) =>
    send("/api/roster", { team, index, name }, s => { s.roster[team][index] = name; return s; });

  if (!state) {
    return <div className="hc"><style>{CSS}</style>
      <div className="wrap" style={{ paddingTop: 48 }}>
        <div className="crest">
          <img src="/logo.png" alt="Hagen Cup" />
          <div className="eyebrow caps">{failed ? "Får ikke kontakt med serveren" : "Henter score …"}</div>
        </div>
      </div></div>;
  }

  const { roster, matches, bonus } = state;
  const label = m =>
    m.pair
      ? { r: m.pair.map(i => roster.red[i]).join(" + "), w: m.pair.map(i => roster.white[i]).join(" + ") }
      : { r: roster.red[m.i], w: roster.white[m.i] };

  let redPts = 0, whitePts = 0;
  const perMatch = {};
  for (const m of [...SINGLES, ...SCRAMBLE]) {
    const [r, w] = tally(matches[m.id]);
    perMatch[m.id] = [r, w];
    redPts += r; whitePts += w;
  }
  for (const b of BONUS_DEFS) {
    if (bonus[b.id].team === "red") redPts += b.pts;
    if (bonus[b.id].team === "white") whitePts += b.pts;
  }
  const played = redPts + whitePts;
  const remaining = 85 - played;
  const lead = Math.abs(redPts - whitePts);

  let status;
  if (played === 0) status = "Ikke startet";
  else if (redPts >= 43) status = "Rød har vunnet";
  else if (whitePts >= 43) status = "Hvit har vunnet";
  else if (remaining === 0) status = redPts === whitePts ? "Uavgjort 42,5 – 42,5" : "Ferdig";
  else if (lead > remaining) status = `${redPts > whitePts ? "Rød" : "Hvit"} kan ikke tas igjen`;
  else status = `${fmt(remaining)} poeng igjen`;

  const pct = played === 0 ? 50 : (redPts / played) * 100;

  const playerPts = team => {
    const out = roster[team].map(() => 0);
    for (const m of SINGLES) out[m.i] += perMatch[m.id][team === "red" ? 0 : 1];
    for (const m of SCRAMBLE) {
      const p = perMatch[m.id][team === "red" ? 0 : 1];
      m.pair.forEach(i => { out[i] += p / 2; });
    }
    return out;
  };

  if (open) {
    const m = [...SINGLES, ...SCRAMBLE].find(x => x.id === open);
    const isBack = !!m.pair;
    const L = label(m);
    const [r, w] = perMatch[m.id];
    return (
      <div className="hc"><style>{CSS}</style><div className="wrap">
        <button className="back caps" onClick={() => setOpen(null)}>← Oversikt</button>
        <div className="sc-head">
          <div className="caps" style={{ fontSize: 9, letterSpacing: ".3em", color: "var(--mute)", marginBottom: 13 }}>
            Flight {m.flight} · {isBack ? "Back 9 · scramble" : "Front 9 · singel"}
          </div>
          <div className="sc-vs">
            <div className="sc-side r">{L.r}</div>
            <div className="sc-pts num"><span className="r">{fmt(r)}</span><span className="d">–</span>{fmt(w)}</div>
            <div className="sc-side w">{L.w}</div>
          </div>
        </div>
        {matches[m.id].map((v, h) => (
          <div className="hole" key={h}>
            <div className="hno caps">Hull {isBack ? h + 10 : h + 1}</div>
            <div className="opts">
              {[["red", "Rød"], ["halve", "Delt"], ["white", "Hvit"]].map(([k, t]) => (
                <button key={k} className="opt" data-k={k} data-on={v === k ? "1" : "0"}
                  onClick={() => setHole(m.id, h, k)} aria-pressed={v === k}
                  aria-label={`Hull ${isBack ? h + 10 : h + 1}: ${t}`}>{t}</button>
              ))}
            </div>
          </div>
        ))}
        <div className="note">Trykk på valgt knapp igjen for å nullstille hullet. Alle ser den samme tavla med én gang.</div>
      </div></div>
    );
  }

  const MatchBtn = ({ m }) => {
    const L = label(m);
    const [r, w] = perMatch[m.id];
    const res = matches[m.id];
    const done = res.filter(Boolean).length;
    return (
      <button className="match" onClick={() => setOpen(m.id)}>
        <div className="mrow">
          <div className="mnames">
            <div className="mn r">{L.r}</div>
            <div className="mn">{L.w}</div>
          </div>
          <div className="mpts num">
            <span className="r">{fmt(r)}</span><span className="d">–</span><span>{fmt(w)}</span>
          </div>
        </div>
        <div className="pips">{res.map((v, i) => <div className="pip" key={i} data-v={v || ""} />)}</div>
        <div className="mmeta caps">{done === 9 ? "Ferdig" : done === 0 ? "Ikke tastet" : `${done} av 9 hull`}</div>
      </button>
    );
  };

  return (
    <div className="hc"><style>{CSS}</style><div className="wrap">
      <div className="hdr">
        <div className="crest">
          <img src="/logo.png" alt="Hagen Cup" />
          <div className="wordmark caps">Hagen Cup 2026</div>
          <div className="venue caps">Villa Padierna · Alferini</div>
        </div>
        <div className="tally">
          <div className="side r">
            <div className="sname caps r">Rød</div>
            <div className="sval r num">{fmt(redPts)}</div>
          </div>
          <div className="status caps">{status}</div>
          <div className="side w">
            <div className="sname caps w">Hvit</div>
            <div className="sval num">{fmt(whitePts)}</div>
          </div>
        </div>
        <div className="bar">
          <div className="bar-r" style={{ width: `${pct}%` }} />
          <div className="bar-w" style={{ width: `${100 - pct}%` }} />
          <div className="bar-tick" />
        </div>
        <div className="barlabels caps"><span>{fmt(played)} spilt</span><span>43 vinner</span><span>{fmt(remaining)} igjen</span></div>
      </div>

      <div className="nav">
        {[["oversikt", "Oversikt"], ["front", "Front 9"], ["back", "Back 9"], ["bonus", "Bonus"], ["lag", "Lag"]]
          .map(([k, t]) => (
            <button key={k} className="caps" data-on={view === k ? "1" : "0"} onClick={() => setView(k)}>{t}</button>
          ))}
      </div>

      {failed && <div className="warn">Serveren svarer ikke. Siste endring kan ha gått tapt — sjekk hullet på nytt når forbindelsen er tilbake.</div>}

      {(view === "oversikt" || view === "front") && [1, 2, 3].map(f => (
        <div className="flight" key={`f${f}`}>
          <div className="flabel caps">Flight {f} · Front 9 · singel</div>
          {SINGLES.filter(m => m.flight === f).map(m => <MatchBtn key={m.id} m={m} />)}
          {view === "oversikt" && SCRAMBLE.filter(m => m.flight === f).map(m => (
            <div key={m.id}>
              <div className="flabel caps" style={{ marginTop: 16 }}>Flight {f} · Back 9 · scramble</div>
              <MatchBtn m={m} />
            </div>
          ))}
        </div>
      ))}

      {view === "back" && [1, 2, 3].map(f => (
        <div className="flight" key={`b${f}`}>
          <div className="flabel caps">Flight {f} · Back 9 · scramble</div>
          {SCRAMBLE.filter(m => m.flight === f).map(m => <MatchBtn key={m.id} m={m} />)}
        </div>
      ))}

      {view === "bonus" && (
        <div className="flight">
          {BONUS_DEFS.map(b => (
            <div className="card" key={b.id}>
              <div className="ctitle caps">{b.label}</div>
              <div className="csub caps">{b.hole} · {b.pts} poeng</div>
              <div className="pick">
                {[["red", "Rød"], ["white", "Hvit"]].map(([k, t]) => (
                  <button key={k} className="opt" data-k={k} data-on={bonus[b.id].team === k ? "1" : "0"}
                    onClick={() => setBonusVal(b.id, { team: bonus[b.id].team === k ? null : k })}
                    aria-pressed={bonus[b.id].team === k}>{t}</button>
                ))}
              </div>
              <input className="inp" placeholder="Hvem tok den?" value={bonus[b.id].who}
                onChange={e => setBonusVal(b.id, { who: e.target.value })} />
            </div>
          ))}
          <div className="note">Bonuspoengene er ikke fordelt før et lag er valgt. Fram til da spilles det om 81 av 85 poeng.</div>
        </div>
      )}

      {view === "lag" && (
        <div className="flight">
          <div className="roster">
            {[["red", "Rød"], ["white", "Hvit"]].map(([team, t]) => {
              const pts = playerPts(team);
              return (
                <div className={`rcol ${team === "red" ? "r" : "w"}`} key={team}>
                  <div className="rlabel caps">{t} · {fmt(pts.reduce((a, b) => a + b, 0))}</div>
                  {roster[team].map((n, i) => (
                    <div className="rname" key={i}>
                      <span className="i num">{i + 1}</span>
                      <span className="p">{n}</span>
                      <span className="v num">{fmt(pts[i])}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="note" style={{ marginBottom: 12 }}>
            Bytt navn under. Rekkefølgen bestemmer oppsettet: nummer 1 og 2 møter hverandre i flight 1,
            3 og 4 i flight 2, 5 og 6 i flight 3 — og de samme parene går sammen i scramblen på back 9.
          </div>
          {[["red", "Rød"], ["white", "Hvit"]].map(([team, t]) => (
            <div className="card" key={team}>
              <div className="ctitle caps">{t}</div>
              {roster[team].map((n, i) => (
                <input key={i} className="inp" value={n} aria-label={`${t} spiller ${i + 1}`}
                  onChange={e => setName(team, i, e.target.value)} />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="sync caps">
        <span>{live ? "Live" : synced ? `Sist oppdatert ${synced.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}` : "Kobler til …"}</span>
        <button onClick={() => window.location.reload()}>Last inn på nytt</button>
      </div>
    </div></div>
  );
}
