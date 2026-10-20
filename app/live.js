/* Live data: the files the nightly pipeline publishes to Supabase Storage (pipeline/appdata.py).

   index.json  one row per S&P 500 company: name, price, Gap, Z, Piotroski, dilution, insiders ...
   c/T.json    everything one company's screens need, in the same shapes as the hand-built prototype data

   At start the index fills DATA with a light entry per company, so search covers the whole S&P 500.
   A company's full file loads when it is opened (and up front for the home screen and Compare picks),
   then fills DATA, X, BOARDS, VOTE and FLAGS so the screens in app.js draw it unchanged.
   If the files can't be reached, the app keeps the built-in sample of 17 companies and says so. */

const LIVE = { ok: false, built: null, base: (window.XRAY_CONFIG || {}).dataUrl || "", files: {}, pending: {} };
const CURATED_FLAG = new Set(["sec", "short", "going", "halt", "other"]);  // hand-researched events the filings don't flag

async function liveGet(path) {
  const r = await fetch(`${LIVE.base}/${path}`, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

function stubFrom(row, built) {
  return { t: row.t, name: row.name, sector: row.sector || "", note: "", price: row.price, priceDate: row.priceDate || built,
           mcap: row.mcap, mv: row.mcap, pb: row.pb, q: [], extra: [], stub: true };
}

function applyIndex(idx) {
  LIVE.built = idx.built;
  for (const row of idx.companies) {
    const c = co(row.t);
    if (c) Object.assign(c, { price: row.price ?? c.price, pb: row.pb, mcap: row.mcap ?? c.mcap, mv: row.mcap ?? c.mv, priceDate: row.priceDate || c.priceDate });
    else DATA.push(stubFrom(row, idx.built));
    INFO[row.t] = [row.legal || row.name, row.exchange || ""];
    if (row.z != null) X.Z[row.t] = row.z;
    if (row.f != null) X.F[row.t] = row.f;
  }
}

/* $1M Test start for companies without a hand-built one: the earliest weekly close X-Ray holds */
function liveMT(f) {
  if (!f.px || !f.px.length) return null;
  const [d, p] = f.px[0];
  const q0 = f.q.find(q => q.d >= d && q.sh) || f.q.find(q => q.sh), q1 = [...f.q].reverse().find(q => q.sh);
  return { s1: q1 ? q1.sh : null, starts: { ipo: { d, p, s: q0 ? q0.sh : null, label: "the earliest price X-Ray holds", src: "Marketstack end-of-day close" } }, events: [] };
}

function applyCompany(f) {
  let c = co(f.t);
  if (!c) { c = stubFrom({ t: f.t, name: f.name, sector: f.sector }, f.built); DATA.push(c); }
  const curated = FEATURED.includes(f.t);
  Object.assign(c, {
    name: curated ? c.name : f.name, sector: curated ? c.sector : (f.sector || ""), cik: f.cik,
    price: f.price ?? c.price, priceDate: f.priceDate || c.priceDate, mcap: f.mcap, mv: f.mcap, pb: f.pb,
    q: f.q.map(q => ({ ...q })), px: f.px, extra: curated ? c.extra : [], live: true, stub: false,
  });
  INFO[f.t] = [f.legal || f.name, f.exchange || (INFO[f.t] || [])[1] || ""];
  X.Z[f.t] = f.Z; X.F[f.t] = f.F; X.CF[f.t] = f.CF && f.CF.length ? f.CF : undefined;
  X.MAT[f.t] = f.MAT ? { asof: f.MAT.asof, src: f.MAT.src, b: f.MAT.b, note: f.MAT.how || "" } : undefined;
  X.OBS[f.t] = f.OBS || undefined;
  X.DIL[f.t] = f.DIL || undefined;
  X.INS[f.t] = f.INS ? { buy: f.INS.buy, sell: f.INS.sell, rows: f.INS.rows.map(r => [r[0], r[1], r[2] === "P" ? "B" : "S", r[3]]) } : undefined;
  X.PVP[f.t] = f.PVP && f.PVP[1].length ? [f.PVP[0] || "CEO", f.PVP[1]] : undefined;
  X.RPX = X.RPX || {}; X.RPX[f.t] = f.RP || undefined;
  if (!curated) X.RP[f.t] = undefined;  // hand-built deal lists stay for the 17; everyone else gets the proxy's own section
  if (f.BOARD) {
    const m = f.BOARD.m, ceo = m.find(x => x[2] === "exec" && /\bCEO\b|Chief Executive/i.test(x[1]));
    const chair = m.find(x => x[3] === "chair"), lead = m.find(x => x[3] === "lead");
    BOARDS[f.t] = { src: f.BOARD.src, m, ceoChair: !!(ceo && chair && ceo[0] === chair[0]),
                    noChair: chair ? null : lead ? `No chair named; ${lead[0]} is Lead Director` : null };
  } else BOARDS[f.t] = undefined;
  VOTE[f.t] = f.VOTE ? { who: f.VOTE.who, byClass: f.VOTE.byClass, cls: f.VOTE.cls, src: f.VOTE.src, reliable: f.VOTE.reliable } : undefined;
  const hand = (FLAGS[f.t] || []).filter(e => CURATED_FLAG.has(e[1]));
  FLAGS[f.t] = [...hand, ...f.FLAGS.map(e => [e[0], e[1], e[2], e[3]])];
  if (!MT[f.t]) { const m = liveMT(f); if (m) MT[f.t] = m; }
  c.findingsLive = f.findings; c.notesLive = f.notes;
  LIVE.files[f.t] = true;
}

async function loadCompany(t) {
  if (!LIVE.ok || LIVE.files[t]) return true;
  if (!LIVE.pending[t]) LIVE.pending[t] = liveGet(`c/${encodeURIComponent(t)}.json`).then(f => { applyCompany(f); return true; })
    .catch(e => { console.warn("X-Ray: couldn't load", t, e); return false; }).finally(() => { delete LIVE.pending[t]; });
  return LIVE.pending[t];
}

/* Open a company once its file is in: a brief "developing" plate while it loads. */
async function withCompany(t, then) {
  if (!LIVE.ok || LIVE.files[t]) return then();
  const app = document.getElementById("app");
  if (app && S.view !== "company") app.insertAdjacentHTML("beforeend", `<div class="card" id="loadingco"><span class="label">Developing ${esc(t)}…</span></div>`);
  const ok = await loadCompany(t);
  document.getElementById("loadingco")?.remove();
  if (ok || loaded(co(t))) then(); else toast(`Couldn't load ${t}. Check your connection and try again.`);
}

async function boot() {
  try {
    if (!LIVE.base) throw new Error("no data URL configured");
    const idx = await liveGet("index.json");
    applyIndex(idx);
    LIVE.ok = true;
    liveGet("cpi.json").then(d => { if (d && d.m && d.m.length > (CPI.d ? CPI.d.m.length - 1 : 0)) { CPI.d = d; if (S.view === "company") render(); } }).catch(() => {});
  } catch (e) {
    console.warn("X-Ray: live data unavailable, using the built-in sample.", e);
  }
  if (XA.signedIn()) {  // bring back choices saved from another phone
    try { applyProfile(await XA.profile()); } catch (e) { console.warn("X-Ray: couldn't load your account", e); }
  }
  S.home = S.home.filter(t => co(t));
  if (!S.home.length && store.get("home2", null) === null) S.home = FEATURED.slice(0, FREE_HOME);
  if (LIVE.ok) {  // the home lightbox, Compare picks and onboarding tiles draw full companies
    const want = [...new Set([...S.home, ...S.compare, ...FEATURED])];
    await Promise.all(want.map(loadCompany));
    S.compare = S.compare.filter(t => loaded(co(t)));
    S.home = S.home.filter(t => loaded(co(t)));
  }
  render();
  maybeWelcome();
}
boot();

/* A company with no quarterly balance sheet yet (a new listing or spin-off): say so instead of drawing empty charts. */
function viewThin(c) {
  const why = (c.notesLive || {}).z || "no balance sheet yet";
  $("#app").innerHTML = `
    <div class="bar"><button class="iconbtn" data-nav="search" aria-label="Back to search">‹ Search</button></div>
    <div class="cohead"><div style="display:flex;flex-direction:column;gap:6px;min-width:0">
      <div class="plate"><span class="rec"></span>ID ${esc(c.t)} · ${esc((INFO[c.t] || [])[1] || "")}<i>${esc(c.sector || "")}</i></div>
      <div class="co-name">${esc((INFO[c.t] || [c.name])[0])}</div>
      ${c.price != null ? `<div><div class="big num">${usd(c.price)}</div><div class="co-sub">At close: ${fmtD(c.priceDate)}</div></div>` : ""}</div></div>
    <div class="card"><h2>Not enough filings yet</h2>
      <p class="note">X-Ray builds every screen from a company's SEC filings. ${esc(c.name)} hasn't filed a quarterly or annual report X-Ray can read yet (${esc(why)}), usually because it listed or was spun off recently. Its X-Ray appears once the first report is filed.</p>
      <p class="src">Filings: ${srcA(["SEC EDGAR", `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${c.cik || c.t}`])}</p></div>
    ${footer()}`;
}
