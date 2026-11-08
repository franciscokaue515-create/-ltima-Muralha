'use strict';
/* ----- áudio sintetizado (sem arquivos) ----- */
const AU = { ctx: null, master: null, sfx: null, mus: null, last: {}, noiseBuf: null, duck: 1 };
function auInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  try {
    const c = AU.ctx = new AC();
    AU.master = c.createGain(); AU.sfx = c.createGain(); AU.mus = c.createGain();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5;
    AU.sfx.connect(AU.master); AU.mus.connect(AU.master); AU.master.connect(comp); comp.connect(c.destination);
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    AU.noiseBuf = nb; auVol(); musicStart();
  } catch (_) { AU.ctx = null; }
}
function auVol() {
  if (!AU.ctx) return;
  const t = AU.ctx.currentTime, m = CFG.mute ? 0 : CFG.master;
  AU.master.gain.setTargetAtTime(m, t, .03); AU.sfx.gain.setTargetAtTime(CFG.sfx * .9, t, .03); AU.mus.gain.setTargetAtTime(CFG.music * .5 * AU.duck, t, .1);
}
function tone(f, dur, type, vol, f2, delay, dest) {
  const c = AU.ctx; if (!c) return;
  const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + Math.min(.02, dur / 3)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(dest || AU.sfx); o.start(t); o.stop(t + dur + .05);
}
function noise(dur, vol, ftype, f1, f2, delay, dest) {
  const c = AU.ctx; if (!c) return;
  const t = c.currentTime + (delay || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noiseBuf; s.loop = true; fl.type = ftype || 'lowpass'; fl.frequency.setValueAtTime(f1 || 1000, t); if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + Math.min(.015, dur / 3)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest || AU.sfx); s.start(t, Math.random()); s.stop(t + dur + .05);
}
const SND = {
  swing: v => noise(.14, .22 * v, 'bandpass', 600, 2400),
  hit: v => { noise(.06, .2 * v, 'highpass', 1500); tone(200, .08, 'square', .08 * v, 90); },
  kill: v => tone(380, .12, 'triangle', .11 * v, 120),
  hurt: v => { tone(160, .28, 'sawtooth', .22 * v, 60); noise(.2, .22 * v, 'lowpass', 900, 200); },
  gem: v => tone(900, .09, 'sine', .09 * v, 1500),
  dash: v => noise(.2, .25 * v, 'highpass', 800, 4000),
  shock: v => { tone(110, .7, 'sine', .5 * v, 35); noise(.6, .35 * v, 'lowpass', 1500, 120); },
  whirl: v => { noise(.5, .22 * v, 'bandpass', 500, 1800); noise(.5, .15 * v, 'bandpass', 1800, 500, .25); },
  bolt: v => { noise(.35, .4 * v, 'bandpass', 3000, 300); tone(1400, .2, 'sawtooth', .12 * v, 70); },
  boom: v => { noise(.55, .5 * v, 'lowpass', 1400, 90); tone(85, .5, 'sine', .5 * v, 30); },
  arrow: v => noise(.09, .12 * v, 'highpass', 2500, 800),
  magic: v => { tone(420, .3, 'sine', .14 * v, 760); tone(425, .3, 'sine', .1 * v, 770); },
  fire: v => noise(.35, .22 * v, 'bandpass', 700, 1500),
  roar: v => { tone(75, 1, 'sawtooth', .35 * v, 38); noise(.9, .3 * v, 'lowpass', 700, 150); },
  shield: v => { tone(660, .18, 'triangle', .2 * v, 990); tone(1320, .3, 'sine', .08 * v); },
  shieldbreak: v => { noise(.3, .3 * v, 'highpass', 1200); tone(420, .35, 'triangle', .2 * v, 110); },
  wave: v => { noise(.5, .35 * v, 'bandpass', 400, 3200); tone(300, .45, 'sawtooth', .12 * v, 900); },
  step: v => noise(.045, .07 * v, 'lowpass', 500 + Math.random() * 300),
  ui: v => tone(520, .06, 'triangle', .14 * v, 700),
  revive: v => [392, 523, 659, 784].forEach((f, i) => tone(f, .35, 'triangle', .2 * v, 0, i * .09)),
  horn: v => { tone(196, .9, 'sawtooth', .16 * v, 0); tone(294, .9, 'sawtooth', .1 * v); },
  over: v => [330, 262, 196, 131].forEach((f, i) => tone(f, .5, 'sawtooth', .18 * v, 0, i * .22)),
  win: v => [262, 330, 392, 523, 659].forEach((f, i) => tone(f, .5, 'triangle', .2 * v, 0, i * .14)),
  beep: v => tone(1300, .06, 'square', .08 * v),
  rattle: v => { for (let i = 0; i < 3; i++) noise(.03, .08 * v, 'highpass', 3000, 0, i * .05); },
  cackle: v => { for (let i = 0; i < 3; i++) tone(520 + i * 70, .06, 'square', .05 * v, 380 + i * 40, i * .07); },
  screech: v => tone(1800, .18, 'sawtooth', .04 * v, 3200),
  growl: v => tone(90, .4, 'sawtooth', .12 * v, 60),
  hiss: v => noise(.35, .09 * v, 'highpass', 3500),
  whisper: v => noise(.5, .06 * v, 'bandpass', 1200, 900)
};
const SND_GAP = { hit: .045, kill: .04, gem: .035, step: .2, arrow: .1, rattle: .3, cackle: .4, screech: .4, growl: .5, hiss: .5, whisper: .6, beep: .08, boom: .08, swing: .05 };
function sfx(name, vol) {
  if (!AU.ctx || CFG.mute || !SND[name]) return;
  const now = AU.ctx.currentTime, gap = SND_GAP[name] || 0;
  if (gap && AU.last[name] && now - AU.last[name] < gap) return;
  AU.last[name] = now; SND[name](vol == null ? 1 : vol);
}
function sfxAt(name, x, y, vol) {
  if (!G) return; const d = Math.hypot(x - G.p.x, y - G.p.y), v = clamp(1 - d / 800, 0, 1) * (vol == null ? 1 : vol);
  if (v > .05) sfx(name, v);
}
