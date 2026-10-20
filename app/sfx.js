/* Sound effects (experiment): electric "lightning" crackle when an X-ray scans, a short zap when a company's
   chart develops, a soft tick on tabs. Made with the Web Audio API, no sound files. Everyone can switch them
   off in the account menu; the setting is remembered on the phone.

   Phones only allow sound after the first tap, so the very first scan (before any tap) is silent. */
const SFX = (() => {
  let ctx = null, master = null;
  const last = {};
  const on = () => { try { return store.get("sfx", true) !== false; } catch (e) { return true; } };

  function audio() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ctx = new C(); master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx.state === "running" ? ctx : null;
  }
  ["pointerdown", "touchstart", "keydown"].forEach(ev => window.addEventListener(ev, () => audio(), { once: true, passive: true, capture: true }));

  const noise = (c, dur) => {
    const n = Math.max(1, Math.floor(c.sampleRate * dur)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };
  /* electric crackle: noise through a sweeping band-pass, gated by random sparks that thin out */
  function crackle(c, t0, dur, level, freq) {
    const src = c.createBufferSource(); src.buffer = noise(c, dur + 0.1);
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(freq, t0); bp.frequency.exponentialRampToValueAtTime(freq * 0.3, t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0);
    for (let t = t0; t < t0 + dur; t += 0.012 + Math.random() * 0.055) {
      const a = Math.max(0.0002, level * (0.25 + Math.random() * 0.75) * Math.pow(1 - (t - t0) / dur, 1.5));
      g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.012 + Math.random() * 0.03);
    }
    src.connect(bp).connect(g).connect(master); src.start(t0); src.stop(t0 + dur + 0.1);
  }
  /* distant rumble under the crackle */
  function rumble(c, t0, dur, level) {
    const src = c.createBufferSource(); src.buffer = noise(c, dur + 0.1);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 110;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(level, t0 + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(lp).connect(g).connect(master); src.start(t0); src.stop(t0 + dur + 0.1);
  }
  /* the bolt itself: a fast falling buzz */
  function bolt(c, t0, dur, level) {
    const o = c.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(2200, t0); o.frequency.exponentialRampToValueAtTime(70, t0 + dur);
    const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 300;
    const g = c.createGain(); g.gain.setValueAtTime(level, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(f).connect(g).connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function tick(c, t0) {
    const o = c.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(1500, t0); o.frequency.exponentialRampToValueAtTime(900, t0 + 0.04);
    const g = c.createGain(); g.gain.setValueAtTime(0.12, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
    o.connect(g).connect(master); o.start(t0); o.stop(t0 + 0.06);
  }
  const SOUNDS = {
    scan: (c, t) => { bolt(c, t, 0.22, 0.12); crackle(c, t, 1.1, 0.55, 3200); rumble(c, t + 0.05, 1.4, 0.5); },
    zap: (c, t) => { bolt(c, t, 0.16, 0.1); crackle(c, t, 0.45, 0.45, 4200); },
    tick: (c, t) => tick(c, t),
  };
  const GAP = { scan: 10000, zap: 1200, tick: 70 };  // never stack the same sound

  /* render a sound to an audio buffer without playing it (used to make samples and in tests) */
  async function render(k, secs = 1.8) {
    const O = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!O) return null;
    const saved = [ctx, master], off = new O(1, Math.floor(44100 * secs), 44100);
    master = off.createGain(); master.gain.value = 0.7; master.connect(off.destination);
    try { SOUNDS[k](off, 0.02); } finally { [ctx, master] = saved; }
    return off.startRendering();
  }
  return {
    on, render,
    set(v) { try { store.set("sfx", !!v); } catch (e) {} },
    play(k) {
      if (!on() || !SOUNDS[k]) return;
      const now = Date.now(); if (now - (last[k] || 0) < GAP[k]) return;
      const c = audio(); if (!c) return;
      last[k] = now;
      try { SOUNDS[k](c, c.currentTime + 0.01); } catch (e) {}
    },
  };
})();

/* when an X-ray film appears (home screen, intro), crackle once */
new MutationObserver(muts => {
  for (const m of muts) for (const n of m.addedNodes) {
    if (n.nodeType === 1 && (n.matches?.(".scanline") || n.querySelector?.(".scanline"))) { SFX.play("scan"); return; }
  }
}).observe(document.getElementById("app"), { childList: true, subtree: true });

/* tabs and bottom navigation tick; the switch in the account menu turns everything on or off */
document.addEventListener("click", e => {
  const s = e.target.closest("[data-sfx]");
  if (s) {
    e.preventDefault(); e.stopImmediatePropagation();
    const v = !SFX.on(); SFX.set(v); s.classList.toggle("on", v); s.setAttribute("aria-checked", v);
    if (v) SFX.play("zap");
    return;
  }
  if (e.target.closest("[data-tab],[data-nav],[data-range],[data-mt]")) SFX.play("tick");
}, true);
