/* Beta helpers: Send feedback, error reports and the one-time welcome.

   Loaded right after config.js so errors anywhere in the app are caught. Everything that touches the app's
   own state (S, store, ACCT ...) runs later, at click or render time.

   Error reports go to the insert-only app_errors table (sql/schema.sql): the error, the screen, the app
   version and the platform. Emails and sign-in tokens are stripped before sending, at most 10 different
   errors per session, and none from the browser preview. Kept 90 days. */

const APP_VERSION = "0.6.1";
const PLATFORM = () => (window.Capacitor && window.Capacitor.getPlatform ? window.Capacitor.getPlatform() : "web");
const DEVICE = () => (navigator.userAgent.match(/Android [\d.]+|iPhone OS [\d_]+|iPad; CPU OS [\d_]+|Mac OS X [\d_.]+|Windows NT [\d.]+/) || [""])[0].replace(/_/g, ".");
const whereNow = () => {
  if (typeof S === "undefined") return "starting";
  return S.view === "company" ? `${S.t} · ${S.tab}` : S.view || "";
};

/* ---------- Send feedback ---------- */
function feedbackHref() {
  const body = `\n\n\n— Please keep this line, it helps us find the problem —\nX-Ray ${APP_VERSION} · ${PLATFORM()} · ${DEVICE()} · screen: ${whereNow()}`;
  return `mailto:support@x-ray.live?subject=${encodeURIComponent("X-Ray beta feedback")}&body=${encodeURIComponent(body)}`;
}
function sendFeedback() {
  location.href = feedbackHref();
  // if no email app opens, say where to write
  setTimeout(() => { if (document.visibilityState === "visible" && typeof toast === "function") toast("Email support@x-ray.live with what you found. Thank you!"); }, 1500);
}
const feedbackButton = (cls = "obghost") => `<button class="${cls}" data-feedback="1">Send feedback</button>`;

/* ---------- error reports ---------- */
const ERRS = { n: 0, seen: new Set() };
const scrub = t => String(t || "")
  .replace(/[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+/g, "[email]")      // email addresses
  .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[token]")                  // sign-in tokens
  .replace(/\b(re|sb)_[A-Za-z0-9_]{16,}\b/g, "[key]");
function reportError(message, stack, source) {
  try {
    const c = window.XRAY_CONFIG || {}, url = (c.supabaseUrl || "").replace(/\/$/, "");
    if (!url || !c.supabaseKey || c.preview) return;
    const msg = scrub(message).trim().slice(0, 300) || "unknown error", key = msg + "|" + (source || "");
    if (ERRS.n >= 10 || ERRS.seen.has(key) || /ResizeObserver loop|Script error\.?$/.test(msg)) return;
    ERRS.seen.add(key); ERRS.n++;
    fetch(`${url}/rest/v1/app_errors`, {
      method: "POST", keepalive: true,
      headers: { apikey: c.supabaseKey, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ message: msg, stack: scrub(stack).slice(0, 1500) || null, source: scrub(source).slice(0, 200) || null,
                             screen: whereNow().slice(0, 60), version: APP_VERSION, platform: PLATFORM() }),
    }).catch(() => {});
  } catch (e) { /* never let error reporting cause an error */ }
}
window.addEventListener("error", e => reportError(e.message, e.error && e.error.stack, `${(e.filename || "").split("/").pop()}:${e.lineno}:${e.colno}`));
window.addEventListener("unhandledrejection", e => { const r = e.reason || {}; reportError(r.message || String(e.reason), r.stack, "promise"); });

/* ---------- Welcome to the beta (shown once) ---------- */
function welcomeSheet() {
  return `<div class="sheetbg" data-welcomeclose="1"></div><div class="sheet welcome" role="dialog" aria-label="Welcome to the X-Ray beta" aria-modal="true">
    <div class="whead"><div><span class="label">Beta</span><h2>Welcome to the X-Ray beta</h2><p class="note" style="margin:0">Thanks for testing. Everything is free while we test.</p></div><button class="iconbtn" data-welcomeclose="1" aria-label="Close">✕</button></div>
    <p class="note" style="margin:0">X-Ray lays a company's SEC filings over its stock price. Here's what to try:</p>
    <ol class="wlist">
      <li><b>Search any S&P 500 company</b> and open its X-Ray.</li>
      <li><b>Tap through the tabs:</b> Balance sheet, Vs. books, Health, Board and the $1M Test.</li>
      <li><b>New to the terms?</b> Turn on beginner mode in <b>Learn</b>, or press and hold any word to look it up.</li>
      <li><b>Compare</b> a few companies side by side.</li>
    </ol>
    <p class="note" style="margin:0"><b>Which companies?</b> All S&P 500 companies, now and in the first live version. After launch we'll add every U.S.-listed company, about 6,000 in all.</p>
    <p class="note" style="margin:0">Something wrong, confusing or missing? Tell us from the account menu: <b>Send feedback</b>. That's what the beta is for.</p>
    <button class="obcta" data-welcomeclose="1">Start X-Raying</button>
    ${feedbackButton()}
    <p class="note" style="margin:0;font-size:12.5px;text-align:center">Prices are end-of-day. X-Ray shows what public filings say; it isn't investment advice.</p></div>`;
}
function maybeWelcome() {
  try {
    const c = window.XRAY_CONFIG || {};
    if (c.freeBeta === false || store.get("betaWelcome", false) || !store.get("onboarded", false)) return;
    if (!["search", "company", "compare"].includes(S.view)) return;
    const el = document.getElementById("sheet"); if (!el || el.innerHTML.trim()) return;
    el.innerHTML = welcomeSheet();
  } catch (e) { reportError(e.message, e.stack, "welcome"); }
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-feedback],[data-welcomeclose]"); if (!t) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (t.dataset.welcomeclose) { store.set("betaWelcome", true); document.getElementById("sheet").innerHTML = ""; return; }
  if (t.dataset.feedback) { if (t.closest(".welcome")) store.set("betaWelcome", true); sendFeedback(); }
}, true);
