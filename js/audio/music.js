'use strict';
/* ----- música gerativa ----- */
const MU = { step: 0, next: 0, timer: 0, mode: 'calm' };
const NOTE = m => 440 * Math.pow(2, (m - 69) / 12);
const PROG = [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]];       // Lá menor: Am F C G
const PROGB = [[38, 45, 50, 53], [34, 41, 46, 50], [43, 50, 55, 58], [33, 40, 45, 49]];      // Ré menor, mais sombrio
const PENTA = [57, 60, 62, 64, 67, 69, 72, 74];
function musicStart() { if (MU.timer || !AU.ctx) return; MU.next = AU.ctx.currentTime + .1; MU.timer = setInterval(musicTick, 90); }
function musicTick() {
  const c = AU.ctx; if (!c || c.state !== 'running') return;
  const mode = MU.mode, bpm = mode === 'boss' ? 112 : mode === 'fight' ? 96 : 72, sd = 60 / bpm / 4;
  while (MU.next < c.currentTime + .25) { musicStep(MU.step++, MU.next - c.currentTime, mode, sd); MU.next += sd; }
}
function musicStep(s, dl, mode, sd) {
  const bar = (s >> 4) & 3, st = s & 15, ch = (mode === 'boss' ? PROGB : PROG)[bar], D = AU.mus;
  if (st === 0) { // pad
    for (const n of [ch[1], ch[2], ch[3]]) { const f = NOTE(n); tone(f, sd * 16, 'triangle', mode === 'calm' ? .07 : .05, 0, dl, D); tone(f * 1.004, sd * 16, 'sine', .04, 0, dl, D); }
  }
  if (st % 8 === 0) tone(NOTE(ch[0]), sd * 7, 'sawtooth', mode === 'calm' ? .07 : .1, 0, dl, D);             // baixo
  if (mode !== 'calm' && st % 4 === 2) tone(NOTE(ch[0]), sd * 1.5, 'sawtooth', .05, 0, dl, D);
  const arpOn = mode === 'calm' ? st % 4 === 0 : st % 2 === 0;
  if (arpOn && (mode !== 'calm' || Math.random() < .8)) { const n = ch[1 + ((s >> 1) % 3)] + 12; tone(NOTE(n), sd * 2.2, 'triangle', .05, 0, dl, D); }
  if (st === 0 && Math.random() < (mode === 'calm' ? .7 : .45)) { // melodia esparsa
    const base = (mode === 'boss' ? PENTA.map(n => n - 7) : PENTA);
    for (let i = 0; i < 3; i++) if (Math.random() < .6) tone(NOTE(base[(Math.random() * base.length) | 0] + 12), sd * (3 + i), 'sine', .06, 0, dl + i * sd * 4, D);
  }
  if (mode !== 'calm') { // percussão
    if (st === 0 || st === 8 || (mode === 'boss' && (st === 6 || st === 14))) { tone(120, .16, 'sine', .35, 45, dl, D); }
    if (st === 4 || st === 12) noise(.12, .14, 'highpass', 1800, 0, dl, D);
    if (st % 2 === 0) noise(.04, .035, 'highpass', 6000, 0, dl, D);
  }
}
function musicMode() {
  if (!G || state === 'menu') return 'calm';
  if (G.phase === 'fight' && G.bossRef && !G.bossRef.dead) return 'boss';
  if (G.phase === 'fight') return 'fight';
  return 'calm';
}
