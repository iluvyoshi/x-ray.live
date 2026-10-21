/* Accounts: Supabase Auth with a 6-digit email code (no passwords), plus the user's saved choices.

   Talks to Supabase's REST endpoints directly (no SDK):
     POST /auth/v1/otp          email a sign-in code
     POST /auth/v1/verify       trade the code for a session
     POST /auth/v1/token        refresh the session
     /rest/v1/profiles          the user's watch topics, home lightbox, Compare picks, Pro picks (row-level security:
                                each person can read and write only their own row)
     /rest/v1/rpc/delete_my_account   deletes the account and everything tied to it

   The publishable key in config.js is public by design; the database's row-level security does the protecting. */

const XA = (() => {
  const cfg = window.XRAY_CONFIG || {};
  const url = (cfg.supabaseUrl || "").replace(/\/$/, ""), key = cfg.supabaseKey || "";
  const ready = () => !!(url && key);
  let session = store.get("session", null);  // { access_token, refresh_token, expires_at, user: { id, email } }
  const saveSession = s => { session = s; store.set("session", s); };

  async function call(path, { method = "POST", body, auth = false, prefer } = {}) {
    if (!ready()) throw new Error("Sign-in isn't set up in this build yet.");
    if (auth) await fresh();
    const r = await fetch(url + path, {
      method,
      headers: { apikey: key, "Content-Type": "application/json", ...(auth && session ? { Authorization: `Bearer ${session.access_token}` } : {}), ...(prefer ? { Prefer: prefer } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await r.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!r.ok) {
      const msg = (data && (data.msg || data.message || data.error_description || data.error)) || `Request failed (${r.status})`;
      const e = new Error(msg); e.status = r.status; throw e;
    }
    return data;
  }
  const keep = d => ({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + (d.expires_in || 3600) * 1000, user: { id: d.user.id, email: d.user.email } });

  async function fresh() {
    if (!session) throw new Error("Not signed in.");
    if (Date.now() < session.expires_at - 60_000) return;
    const d = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: session.refresh_token }) });
    if (!d.ok) { saveSession(null); throw new Error("Your session ended. Sign in again."); }
    saveSession(keep(await d.json()));
  }

  /* friendlier words for the errors people actually hit */
  const human = e => /rate limit|too many|security purposes/i.test(e.message) ? "Too many codes requested. Wait a minute, then try again."
    : /invalid login credentials/i.test(e.message) ? "That code doesn't match. Check it and try again."
    : /expired|invalid/i.test(e.message) && /token|otp|code/i.test(e.message) ? "That code doesn't match or has expired. Check it or send a new one."
    : /signups not allowed|user not found/i.test(e.message) ? "No X-Ray account uses that email. Create one instead."
    : /Failed to fetch|NetworkError/i.test(e.message) ? "Can't reach X-Ray. Check your connection and try again." : e.message;

  return {
    ready, human,
    get user() { return session && session.user; },
    signedIn: () => !!session,
    async sendCode(email, create) { await call("/auth/v1/otp", { body: { email, create_user: !!create } }); },
    /* Google Play's reviewers can't receive emailed codes: one review-only account signs in with a fixed 6-digit password instead */
    isReview: email => !!cfg.reviewEmail && String(email || "").trim().toLowerCase() === cfg.reviewEmail,
    async passwordSignIn(email, password) {
      const d = await call("/auth/v1/token?grant_type=password", { body: { email, password } }); saveSession(keep(d)); return session.user;
    },
    async verify(email, token) { const d = await call("/auth/v1/verify", { body: { type: "email", email, token } }); saveSession(keep(d)); return session.user; },
    async signOut() { try { await call("/auth/v1/logout", { auth: true }); } catch {} saveSession(null); },
    async profile() {
      const rows = await call(`/rest/v1/profiles?select=*&user_id=eq.${session.user.id}`, { method: "GET", auth: true });
      return rows && rows[0] || null;
    },
    async saveProfile(p) {
      await call("/rest/v1/profiles?on_conflict=user_id", { auth: true, prefer: "resolution=merge-duplicates,return=minimal", body: { user_id: session.user.id, ...p, updated_at: new Date().toISOString() } });
    },
    async deleteAccount() { await call("/rest/v1/rpc/delete_my_account", { auth: true, body: {} }); saveSession(null); },
  };
})();

/* What gets saved to the account (and restored when you sign in on another phone). */
function profileFromLocal() {
  const a = ACCT.get() || {};
  return { name: a.name || null, likes: a.likes || [], experience: a.exp || null, home: S.home, compare: S.compare, picks: XR.get(),
           adult_confirmed_at: a.adultAt || null, terms_accepted_at: a.termsAt || null };
}
function applyProfile(p) {
  if (!p) return;
  const a = ACCT.get() || {};
  ACCT.set({ ...a, name: p.name || a.name || "Investor", email: XA.user.email, likes: p.likes || [], exp: p.experience || "",
             since: (p.created_at || "").slice(0, 10) || a.since, adultAt: p.adult_confirmed_at, termsAt: p.terms_accepted_at });
  if (p.home && p.home.length) { S.home = p.home; store.set("home2", S.home); }
  if (p.compare && p.compare.length) { S.compare = p.compare; store.set("compare", S.compare); }
  if (p.picks) XR.set(p.picks);
}

/* Save changes a moment after they happen (home, Compare, picks, watch topics all go through store.set). */
let syncTimer = null;
const SYNC_KEYS = new Set(["home2", "compare", "picks", "acct"]);
const rawSet = store.set.bind(store);
store.set = (k, v) => {
  rawSet(k, v);
  if (SYNC_KEYS.has(k) && XA.signedIn() && store.get("onboarded", false)) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => XA.saveProfile(profileFromLocal()).catch(e => console.warn("X-Ray: couldn't save to your account", e)), 1500);
  }
};

/* Sign-up and sign-in screens (replacing the prototype's demo password + texted code). */
async function authSend() {
  if ((window.XRAY_CONFIG || {}).preview) {  // preview build only: no email code, the account lives in this browser
    const a = ACCT.get() || {};
    ACCT.set({ ...a, name: OB.name || a.name || "Investor", email: OB.email, adultAt: OB.adultAt, termsAt: OB.adultAt, since: new Date().toISOString().slice(0, 10) });
    OB.err = ""; return obGo("profile");
  }
  if (XA.isReview(OB.email)) { OB.err = ""; OB.code = ""; return obGo("code"); }
  OB.busy = true; OB.err = ""; render();
  try { await XA.sendCode(OB.email, OB.mode === "create"); OB.code = ""; OB.busy = false; obGo("code"); }
  catch (e) { OB.busy = false; OB.err = XA.human(e); render(); }
}
async function authVerify() {
  if (OB.code.length !== 6) { OB.err = "Enter all 6 digits."; return render(); }
  OB.busy = true; OB.err = ""; render();
  try {
    if (XA.isReview(OB.email)) await XA.passwordSignIn(OB.email, OB.code); else await XA.verify(OB.email, OB.code);
    OB.busy = false; OB.code = "";
    const p = await XA.profile().catch(() => null);
    if (p) {  // an existing account: bring back its choices and go straight in
      applyProfile(p); store.set("onboarded", true); document.body.classList.remove("intro");
      if (LIVE.ok) await Promise.all([...S.home, ...S.compare].map(loadCompany));
      go("search"); return maybeWelcome();
    }
    const a = ACCT.get() || {};
    ACCT.set({ ...a, name: OB.name || a.name || "Investor", email: OB.email, adultAt: OB.adultAt, termsAt: OB.adultAt, since: new Date().toISOString().slice(0, 10) });
    obGo("profile");
  } catch (e) { OB.busy = false; OB.code = ""; OB.err = XA.human(e); render(); }
}
async function authDelete() {
  const el = document.getElementById("sheet");
  try {
    await XA.deleteAccount();
    ACCT.clear(); store.set("onboarded", false); XR.set([]); PLAN.set({ tier: "free" });
    el.innerHTML = ""; Object.assign(OB, { step: "splash", email: "", name: "", picks: [], likes: [], exp: "" }); S.view = "intro"; render();
    toast("Your account and its data were deleted.");
  } catch (e) { toast(XA.human(e)); }
}
function deleteSheet() {
  return `<div class="sheetbg" data-closesheet="1"></div><div class="sheet" role="dialog" aria-label="Delete account">
    <div class="sheethead"><div><b>Delete your account?</b><span>${esc((ACCT.get() || {}).email || "")}</span></div><button class="iconbtn" data-closesheet="1" aria-label="Close">✕</button></div>
    <p class="note">This permanently deletes your X-Ray account, your watch list, home lightbox, Compare picks and settings. It can't be undone.</p>
    <p class="note">A Google Play subscription isn't cancelled by deleting your account. Cancel it in Google Play first: Play Store, Profile, Payments and subscriptions.</p>
    <button class="obcta" style="background:#FF5D5D;color:#fff" data-delconfirm="1">Delete my account</button>
    <button class="obghost" data-closesheet="1">Keep my account</button></div>`;
}
document.addEventListener("click", e => {
  const t = e.target.closest("[data-delacct],[data-delconfirm],[data-authsignout]"); if (!t) return;
  e.stopImmediatePropagation();
  if (t.dataset.delacct) { document.getElementById("sheet").innerHTML = deleteSheet(); return; }
  if (t.dataset.delconfirm) { t.disabled = true; t.textContent = "Deleting…"; authDelete(); return; }
  if (t.dataset.authsignout) {
    XA.signOut().finally(() => { document.getElementById("sheet").innerHTML = ""; ACCT.clear(); store.set("onboarded", false);
      Object.assign(OB, { step: "splash", email: "", name: "", picks: [], likes: [], exp: "" }); S.view = "intro"; render(); });
  }
}, true);
