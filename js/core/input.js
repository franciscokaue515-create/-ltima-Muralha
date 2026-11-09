'use strict';
/* ---------- entrada ---------- */
function aimAngle() {
  const sx = G.p.x - G.cam.x + W / 2, sy = G.p.y - G.cam.y + H / 2, dx = mouse.x - sx, dy = mouse.y - sy;
  return (Math.abs(dx) + Math.abs(dy) > 4) ? Math.atan2(dy, dx) : G.p.face;
}
function pressAction(a) {
  if (a === 'pause') { togglePause(); return; }
  if (state !== 'play') return;
  const f = CAST[G.char][a]; if (f && a !== 'sword') f();
}
const actionsFor = code => { const r = []; for (const x of ACTIONS) if (CFG.bind[x[0]] === code) r.push(x[0]); return r; };
let swallowClick = false;
window.addEventListener('keydown', e => {
  auInit();
  if (rebinding) {
    e.preventDefault();
    if (e.code === 'Escape') { rebinding = null; showSettings(); } else bindCode(e.code);
    return;
  }
  const c = e.code;
  if (c.startsWith('Arrow') || (c === 'Space' && state === 'play')) e.preventDefault();
  held[c] = true;
  if (e.repeat) return;
  for (const a of actionsFor(c)) pressAction(a);
  if (c === 'KeyP' && CFG.bind.pause !== 'KeyP') togglePause();
});
window.addEventListener('keyup', e => { if (e.code === 'Space' && state === 'play') e.preventDefault(); held[e.code] = false; });
window.addEventListener('blur', () => { for (const k in held) held[k] = false; if (state === 'play') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') pause(); });

window.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
window.addEventListener('pointerdown', e => {
  auInit();
  if (rebinding) { e.preventDefault(); e.stopPropagation(); swallowClick = true; bindCode('Mouse' + e.button); }
}, true);
cv.addEventListener('pointerdown', e => {
  const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  const c = 'Mouse' + e.button; held[c] = true;
  for (const a of actionsFor(c)) pressAction(a);
  try { cv.setPointerCapture(e.pointerId); } catch (_) {}
});
window.addEventListener('pointerup', e => { held['Mouse' + e.button] = false; });
window.addEventListener('pointercancel', () => { for (const k in held) if (k.startsWith('Mouse')) held[k] = false; });
window.addEventListener('contextmenu', e => { if (e.target === cv || rebinding) e.preventDefault(); });
el.pausebtn.addEventListener('click', () => { auInit(); sfx('ui'); togglePause(); });
