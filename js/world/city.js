'use strict';
/* ---------- mapa: cidade cercada por muralha ---------- */
const MAP = { x0: -1600, y0: -1100, x1: 1600, y1: 1100 }, WALL = 64, SOL_CELL = 160, ROAD = 55;
let CITY = null, colNX = 0, colNY = 0;

function mulberry(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function buildCity() {
  const rnd = mulberry(20261108), R = (a, b) => a + rnd() * (b - a), pickOf = a => a[(rnd() * a.length) | 0];
  const solids = [], grid = new Map();
  const addSolid = s => {
    solids.push(s);
    const b = s.b = s.t === 'c' ? [s.x - s.r, s.y - s.r, s.x + s.r, s.y + s.r] : [s.x0, s.y0, s.x1, s.y1];
    for (let cx = Math.floor(b[0] / SOL_CELL); cx <= Math.floor(b[2] / SOL_CELL); cx++)
      for (let cy = Math.floor(b[1] / SOL_CELL); cy <= Math.floor(b[3] / SOL_CELL); cy++) {
        const k = cx * 4096 + cy, l = grid.get(k); if (l) l.push(s); else grid.set(k, [s]);
      }
  };
  const clear = (x0, y0, x1, y1, m) => { for (const s of solids) if (s.b[0] < x1 + m && s.b[2] > x0 - m && s.b[1] < y1 + m && s.b[3] > y0 - m) return false; return true; };
  const hitsRoads = (x0, y0, x1, y1, m) => {
    if (x1 > -ROAD - m && x0 < ROAD + m) return true;
    if (y1 > -ROAD - m && y0 < ROAD + m) return true;
    if (y1 > MAP.y0 + 90 - m && y0 < MAP.y0 + 150 + m) return true;
    if (y1 > MAP.y1 - 150 - m && y0 < MAP.y1 - 90 + m) return true;
    if (x1 > MAP.x0 + 90 - m && x0 < MAP.x0 + 150 + m) return true;
    if (x1 > MAP.x1 - 150 - m && x0 < MAP.x1 - 90 + m) return true;
    return false;
  };
  const inPlaza = (x0, y0, x1, y1, m) => Math.hypot(clamp(0, x0, x1), clamp(0, y0, y1)) < 232 + m;
  const insideRing = (x0, y0, x1, y1, m) => x0 > MAP.x0 + 150 + m && x1 < MAP.x1 - 150 - m && y0 > MAP.y0 + 150 + m && y1 < MAP.y1 - 150 - m;
  const houses = [], trees = [], rocks = [], debris = [], stalls = [], lamps = [], planters = [], wells = [];
  const roofs = ['#9a4a35', '#8a5a3a', '#5c6670', '#a8683a', '#6b4a5a', '#7a8a4a'], walls = ['#d9c9a6', '#cdbb98', '#bfb7a8', '#d6b98f'];

  const tryHouse = (cx, cy, w, h, kind) => {
    const x0 = cx - w / 2, y0 = cy - h / 2, x1 = x0 + w, y1 = y0 + h;
    if (!insideRing(x0, y0, x1, y1, 16) || hitsRoads(x0, y0, x1, y1, 22) || inPlaza(x0, y0, x1, y1, 30) || !clear(x0, y0, x1, y1, 56)) return false;
    addSolid({ t: 'r', x0, y0, x1, y1 });
    houses.push({ x0, y0, x1, y1, roof: pickOf(roofs), wall: pickOf(walls), kind, chim: kind === 'smithy' || rnd() < .6 });
    return true;
  };
  tryHouse(820, -560, 250, 170, 'tavern'); tryHouse(-760, 560, 140, 210, 'chapel'); tryHouse(-860, -540, 170, 120, 'smithy');
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) for (let gx = 0; gx < 3; gx++) for (let gy = 0; gy < 3; gy++) {
    if (rnd() < .3) continue;
    tryHouse(sx * (80 + 455 * (gx + .5)) + R(-50, 50), sy * (80 + 290 * (gy + .5)) + R(-35, 35), R(110, 190), R(92, 130), 'house');
  }

  // praça central
  addSolid({ t: 'c', x: 0, y: 0, r: 58 });
  for (const p of [[0, -175], [0, 175], [-175, 0], [175, 0]]) { addSolid({ t: 'c', x: p[0], y: p[1], r: 16 }); planters.push({ x: p[0], y: p[1] }); }
  for (const p of [[-140, -140], [140, -140], [-140, 140], [140, 140]]) { addSolid({ t: 'c', x: p[0], y: p[1], r: 6 }); lamps.push({ x: p[0], y: p[1] }); }
  for (const p of [[-215, -215], [215, -215], [-215, 215], [215, 215]]) {
    const s = { t: 'r', x0: p[0] - 37, y0: p[1] - 23, x1: p[0] + 37, y1: p[1] + 23 }; addSolid(s); stalls.push({ x0: s.x0, y0: s.y0, x1: s.x1, y1: s.y1, col: pickOf(['#a8403a', '#3a6aa8', '#c9a23a', '#4a8a5a']) });
  }
  // postes ao longo das avenidas
  for (let t = 300; t <= 1500; t += 200) for (const s of [-1, 1]) for (const q of [[s * (ROAD + 9), t], [s * (ROAD + 9), -t], [t, s * (ROAD + 9)], [-t, s * (ROAD + 9)]]) {
    if (clear(q[0] - 5, q[1] - 5, q[0] + 5, q[1] + 5, 4)) { addSolid({ t: 'c', x: q[0], y: q[1], r: 5 }); lamps.push({ x: q[0], y: q[1] }); }
  }
  // poços
  for (let k = 0, n = 0; k < 200 && n < 3; k++) {
    const x = R(MAP.x0 + 200, MAP.x1 - 200), y = R(MAP.y0 + 200, MAP.y1 - 200);
    if (hitsRoads(x - 18, y - 18, x + 18, y + 18, 20) || inPlaza(x - 18, y - 18, x + 18, y + 18, 40) || !clear(x - 18, y - 18, x + 18, y + 18, 80)) continue;
    addSolid({ t: 'c', x, y, r: 18 }); wells.push({ x, y }); n++;
  }
  // árvores
  const tryTree = (x, y) => {
    if (hitsRoads(x - 14, y - 14, x + 14, y + 14, 8) || inPlaza(x - 14, y - 14, x + 14, y + 14, 50) || !clear(x - 14, y - 14, x + 14, y + 14, 74)) return false;
    addSolid({ t: 'c', x, y, r: 12 }); trees.push({ x, y, cr: R(26, 38), ph: rnd() * TAU }); return true;
  };
  for (let k = 0; k < 1500 && trees.length < 70; k++) tryTree(R(MAP.x0 + 25, MAP.x1 - 25), R(MAP.y0 + 25, MAP.y1 - 25));
  for (let k = 0, n = 0; k < 600 && n < 26; k++) {
    const side = (rnd() * 4) | 0;
    const x = side < 2 ? (side ? R(MAP.x1 - 80, MAP.x1 - 12) : R(MAP.x0 + 12, MAP.x0 + 80)) : R(MAP.x0 + 60, MAP.x1 - 60);
    const y = side >= 2 ? (side === 3 ? R(MAP.y1 - 80, MAP.y1 - 12) : R(MAP.y0 + 12, MAP.y0 + 80)) : R(MAP.y0 + 60, MAP.y1 - 60);
    if (tryTree(x, y)) n++;
  }
  // pedras
  for (let k = 0, n = 0; k < 900 && n < 26; k++) {
    const x = R(MAP.x0 + 30, MAP.x1 - 30), y = R(MAP.y0 + 30, MAP.y1 - 30), r = R(11, 21);
    if (hitsRoads(x - r, y - r, x + r, y + r, 6) || inPlaza(x - r, y - r, x + r, y + r, 20) || !clear(x - r, y - r, x + r, y + r, 70)) continue;
    addSolid({ t: 'c', x, y, r }); rocks.push({ x, y, r, ph: rnd() * TAU }); n++;
  }
  // destroços
  const kinds = ['crate', 'barrel', 'cart', 'rubble', 'wallseg', 'rubble', 'barrel'];
  for (let k = 0, n = 0; k < 1500 && n < 44; k++) {
    const kind = pickOf(kinds), x = R(MAP.x0 + 40, MAP.x1 - 40), y = R(MAP.y0 + 40, MAP.y1 - 40);
    const sz = kind === 'crate' ? [24, 24] : kind === 'barrel' ? [22, 22] : kind === 'cart' ? [54, 30] : kind === 'rubble' ? [34, 34] : [76, 18];
    const x0 = x - sz[0] / 2, y0 = y - sz[1] / 2, x1 = x0 + sz[0], y1 = y0 + sz[1];
    const small = kind === 'crate' || kind === 'barrel' || kind === 'rubble';
    const onRoad = hitsRoads(x0, y0, x1, y1, 4);
    if (onRoad && !(small && rnd() < .35 && Math.abs(x) > 28 && Math.abs(y) > 28)) continue;
    if (inPlaza(x0, y0, x1, y1, 12) || !clear(x0, y0, x1, y1, 70)) continue;
    if (kind === 'barrel') addSolid({ t: 'c', x, y, r: 11 }); else if (kind === 'rubble') addSolid({ t: 'c', x, y, r: 16 }); else addSolid({ t: 'r', x0, y0, x1, y1 });
    debris.push({ kind, x, y, x0, y0, x1, y1, ph: rnd() * TAU }); n++;
  }

  /* ----- desenho da camada estática ----- */
  const cw = MAP.x1 - MAP.x0 + WALL * 2, ch = MAP.y1 - MAP.y0 + WALL * 2, W0 = MAP.x1 - MAP.x0, H0 = MAP.y1 - MAP.y0;
  const cvs = document.createElement('canvas'); cvs.width = cw; cvs.height = ch;
  const c = cvs.getContext('2d'); c.translate(WALL - MAP.x0, WALL - MAP.y0);
  c.fillStyle = '#0b0e11'; c.fillRect(MAP.x0 - WALL, MAP.y0 - WALL, cw, ch);
  c.fillStyle = '#5a8647'; c.fillRect(MAP.x0, MAP.y0, W0, H0);
  for (let i = 0; i < 320; i++) { c.fillStyle = rnd() < .5 ? 'rgba(20,50,20,.10)' : 'rgba(180,220,120,.07)'; c.beginPath(); c.ellipse(R(MAP.x0, MAP.x1), R(MAP.y0, MAP.y1), R(40, 130), R(30, 90), rnd() * 3, 0, TAU); c.fill(); }
  c.strokeStyle = 'rgba(30,70,30,.55)'; c.lineWidth = 1.4; c.beginPath();
  for (let i = 0; i < 2600; i++) { const x = R(MAP.x0, MAP.x1), y = R(MAP.y0, MAP.y1); c.moveTo(x, y); c.lineTo(x - 2, y - 6); c.moveTo(x, y); c.lineTo(x + 1, y - 7); c.moveTo(x, y); c.lineTo(x + 3, y - 5); }
  c.stroke();
  for (let i = 0; i < 220; i++) { const x = R(MAP.x0, MAP.x1), y = R(MAP.y0, MAP.y1); c.fillStyle = pickOf(['#e6d46a', '#d68ac0', '#eeeadf']); c.beginPath(); c.arc(x, y, 2.4, 0, TAU); c.fill(); }
  // estradas
  const road = (x, y, w, h) => { c.fillStyle = '#a58f68'; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(60,45,25,.35)'; c.lineWidth = 3; c.strokeRect(x, y, w, h); };
  road(-ROAD, MAP.y0, 2 * ROAD, H0); road(MAP.x0, -ROAD, W0, 2 * ROAD);
  road(MAP.x0 + 90, MAP.y0 + 90, W0 - 180, 60); road(MAP.x0 + 90, MAP.y1 - 150, W0 - 180, 60);
  road(MAP.x0 + 90, MAP.y0 + 90, 60, H0 - 180); road(MAP.x1 - 150, MAP.y0 + 90, 60, H0 - 180);
  for (let i = 0; i < 1800; i++) { const x = R(MAP.x0, MAP.x1), y = R(MAP.y0, MAP.y1); if (!hitsRoads(x, y, x, y, -6)) continue; c.fillStyle = rnd() < .5 ? '#7d6c4c' : '#c2ad85'; c.fillRect(x, y, 2, 2); }
  // praça
  c.fillStyle = '#8f897e'; c.beginPath(); c.arc(0, 0, 232, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2;
  for (let r = 70; r < 232; r += 24) { c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); }
  c.beginPath(); for (let a = 0; a < TAU; a += TAU / 24) { c.moveTo(Math.cos(a) * 70, Math.sin(a) * 70); c.lineTo(Math.cos(a) * 232, Math.sin(a) * 232); } c.stroke();
  c.strokeStyle = '#6d675c'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 232, 0, TAU); c.stroke();
  c.fillStyle = 'rgba(217,169,58,.35)'; c.beginPath(); for (let i = 0; i < 16; i++) { const rr = i % 2 ? 78 : 112, a = i / 16 * TAU; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill();

  const shadowRect = (x0, y0, x1, y1) => { c.fillStyle = 'rgba(0,0,0,.26)'; c.fillRect(x0 + 8, y0 + 10, x1 - x0, y1 - y0); };
  const shadowCirc = (x, y, r) => { c.fillStyle = 'rgba(0,0,0,.26)'; c.beginPath(); c.ellipse(x + 6, y + 8, r, r * .75, 0, 0, TAU); c.fill(); };
  // destroços
  for (const d of debris) {
    if (d.kind === 'crate') { shadowRect(d.x0, d.y0, d.x1, d.y1); c.fillStyle = '#8a6a3a'; c.fillRect(d.x0, d.y0, 24, 24); c.strokeStyle = '#4a3418'; c.lineWidth = 2; c.strokeRect(d.x0, d.y0, 24, 24); c.beginPath(); c.moveTo(d.x0, d.y0); c.lineTo(d.x1, d.y1); c.moveTo(d.x1, d.y0); c.lineTo(d.x0, d.y1); c.stroke(); }
    else if (d.kind === 'barrel') { shadowCirc(d.x, d.y, 11); c.fillStyle = '#6b4a2a'; c.beginPath(); c.arc(d.x, d.y, 11, 0, TAU); c.fill(); c.strokeStyle = '#2d1c0e'; c.lineWidth = 2; c.stroke(); c.strokeStyle = '#b0a58a'; c.beginPath(); c.arc(d.x, d.y, 7, 0, TAU); c.stroke(); }
    else if (d.kind === 'cart') { shadowRect(d.x0, d.y0, d.x1, d.y1); c.fillStyle = '#6b4a2a'; c.fillRect(d.x0, d.y0, 54, 30); c.strokeStyle = '#2d1c0e'; c.lineWidth = 2; c.strokeRect(d.x0, d.y0, 54, 30); c.beginPath(); for (let i = 1; i < 5; i++) { c.moveTo(d.x0 + i * 11, d.y0); c.lineTo(d.x0 + i * 11, d.y1); } c.stroke(); c.fillStyle = '#2d2a27'; c.fillRect(d.x0 + 6, d.y0 - 3, 8, 5); c.fillRect(d.x1 - 14, d.y1 - 2, 8, 5); }
    else if (d.kind === 'rubble') { shadowCirc(d.x, d.y, 16); for (let i = 0; i < 7; i++) { const a = d.ph + i * 0.9, rr = 3 + (i % 3) * 4; c.fillStyle = i % 2 ? '#8a8780' : '#6c6a64'; c.beginPath(); c.arc(d.x + Math.cos(a) * 8, d.y + Math.sin(a) * 8, 5 + rr * .4, 0, TAU); c.fill(); } }
    else { shadowRect(d.x0, d.y0, d.x1, d.y1); c.fillStyle = '#85827a'; c.beginPath(); c.moveTo(d.x0, d.y1); c.lineTo(d.x0, d.y0 + 6); c.lineTo(d.x0 + 16, d.y0); c.lineTo(d.x0 + 28, d.y0 + 7); c.lineTo(d.x0 + 44, d.y0 + 2); c.lineTo(d.x0 + 60, d.y0 + 8); c.lineTo(d.x1, d.y0 + 4); c.lineTo(d.x1, d.y1); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.5; c.stroke(); }
  }
  // pedras
  for (const r of rocks) {
    shadowCirc(r.x, r.y, r.r);
    c.fillStyle = '#7d817f'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr = r.r * (.82 + .18 * Math.sin(i * 2.3 + r.ph)); c.lineTo(r.x + Math.cos(a) * rr, r.y + Math.sin(a) * rr); } c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(r.x - r.r * .25, r.y - r.r * .3, r.r * .4, 0, TAU); c.fill();
  }
  // barracas
  for (const s of stalls) {
    shadowRect(s.x0, s.y0, s.x1, s.y1); c.fillStyle = '#6b4a2a'; c.fillRect(s.x0, s.y0, 74, 46);
    for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? s.col : '#e8e2d2'; c.fillRect(s.x0 + i * 12.33, s.y0, 12.4, 30); }
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.strokeRect(s.x0, s.y0, 74, 46);
    c.fillStyle = '#a8803a'; c.fillRect(s.x0 + 6, s.y0 + 32, 62, 10);
  }
  // fonte
  shadowCirc(0, 0, 58);
  c.fillStyle = '#9a968c'; c.beginPath(); c.arc(0, 0, 58, 0, TAU); c.fill(); c.strokeStyle = '#5e5a52'; c.lineWidth = 6; c.stroke();
  c.fillStyle = '#4a8fd0'; c.beginPath(); c.arc(0, 0, 45, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (const r of [18, 28, 38]) { c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); }
  c.fillStyle = '#b4b0a6'; c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.fill(); c.strokeStyle = '#5e5a52'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#bfe3ff'; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fill();
  // jardineiras
  for (const p of planters) { shadowCirc(p.x, p.y, 16); c.fillStyle = '#6b4a2a'; c.beginPath(); c.arc(p.x, p.y, 16, 0, TAU); c.fill(); c.fillStyle = '#3f7a3a'; c.beginPath(); c.arc(p.x, p.y, 12, 0, TAU); c.fill(); for (let i = 0; i < 6; i++) { c.fillStyle = pickOf(['#e6d46a', '#d68ac0', '#eeeadf', '#e0604a']); c.beginPath(); c.arc(p.x + Math.cos(i * 1.1) * 7, p.y + Math.sin(i * 1.1) * 7, 2.6, 0, TAU); c.fill(); } }
  // poços
  for (const w of wells) { shadowCirc(w.x, w.y, 18); c.fillStyle = '#85827a'; c.beginPath(); c.arc(w.x, w.y, 18, 0, TAU); c.fill(); c.strokeStyle = '#4a4842'; c.lineWidth = 3; c.stroke(); c.fillStyle = '#10181e'; c.beginPath(); c.arc(w.x, w.y, 11, 0, TAU); c.fill(); }
  // postes
  for (const l of lamps) { shadowCirc(l.x, l.y, 6); c.fillStyle = 'rgba(255,220,120,.16)'; c.beginPath(); c.arc(l.x, l.y, 16, 0, TAU); c.fill(); c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(l.x, l.y, 5, 0, TAU); c.fill(); c.fillStyle = '#ffd86a'; c.beginPath(); c.arc(l.x, l.y, 2.4, 0, TAU); c.fill(); }
  // casas
  for (const h of houses) {
    const w = h.x1 - h.x0, hh = h.y1 - h.y0, wh = Math.min(18, hh * .22), ry = h.y1 - wh, ph = hh - wh;
    shadowRect(h.x0, h.y0, h.x1, h.y1);
    c.fillStyle = h.wall; c.fillRect(h.x0, ry, w, wh);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(h.x0, ry, w, 3);
    c.fillStyle = '#5a3d27'; c.fillRect(h.x0 + w / 2 - 7, ry + 3, 14, wh - 3);
    c.fillStyle = '#2d3a4a'; for (const f of [.2, .8]) c.fillRect(h.x0 + w * f - 6, ry + 5, 12, 8);
    c.fillStyle = h.roof; c.fillRect(h.x0, h.y0, w, ph);
    c.fillStyle = 'rgba(255,255,255,.11)'; c.fillRect(h.x0, h.y0, w, ph / 2);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(h.x0, h.y0 + ph / 2, w, ph / 2);
    c.strokeStyle = 'rgba(0,0,0,.16)'; c.lineWidth = 1; c.beginPath(); for (let y = h.y0 + 8; y < ry; y += 8) { c.moveTo(h.x0, y); c.lineTo(h.x1, y); } c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.38)'; c.lineWidth = 3; c.beginPath(); c.moveTo(h.x0, h.y0 + ph / 2); c.lineTo(h.x1, h.y0 + ph / 2); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; c.strokeRect(h.x0, h.y0, w, hh);
    if (h.chim) { c.fillStyle = '#6b6258'; c.fillRect(h.x0 + w * .72, h.y0 + 8, 16, 16); c.fillStyle = '#2a2623'; c.fillRect(h.x0 + w * .72 + 3, h.y0 + 11, 10, 10); }
    if (h.kind === 'chapel') { c.fillStyle = '#d9a93a'; c.fillRect(h.x0 + w / 2 - 3, h.y0 + 14, 6, 40); c.fillRect(h.x0 + w / 2 - 14, h.y0 + 26, 28, 6); }
    if (h.kind === 'tavern') { c.fillStyle = '#7a4a1e'; c.fillRect(h.x0 + 12, ry - 22, 34, 18); c.fillStyle = '#e8d9b0'; c.fillRect(h.x0 + 17, ry - 18, 24, 3); c.fillRect(h.x0 + 17, ry - 12, 18, 3); }
  }
  // árvores (copas por cima)
  for (const t of trees) {
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(t.x + 8, t.y + 10, t.cr * .9, t.cr * .6, 0, 0, TAU); c.fill();
    c.fillStyle = '#4a3524'; c.beginPath(); c.arc(t.x, t.y, 6, 0, TAU); c.fill();
    const cols = ['#2f5f2e', '#3a7338', '#46853f'];
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + t.ph; c.fillStyle = cols[i % 3]; c.beginPath(); c.arc(t.x + Math.cos(a) * t.cr * .45, t.y + Math.sin(a) * t.cr * .4 - 6, t.cr * .62, 0, TAU); c.fill(); }
    c.fillStyle = '#55984a'; c.beginPath(); c.arc(t.x - 4, t.y - 10, t.cr * .4, 0, TAU); c.fill();
  }
  // muralha
  const ox0 = MAP.x0 - WALL, oy0 = MAP.y0 - WALL, ox1 = MAP.x1 + WALL, oy1 = MAP.y1 + WALL;
  for (const b of [[ox0, oy0, ox1 - ox0, WALL, true], [ox0, MAP.y1, ox1 - ox0, WALL, true], [ox0, MAP.y0, WALL, H0, false], [MAP.x1, MAP.y0, WALL, H0, false]]) {
    const x = b[0], y = b[1], w = b[2], h = b[3], hor = b[4];
    c.fillStyle = '#7b786f'; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(0,0,0,.24)'; c.lineWidth = 1.5; c.beginPath();
    for (let r = 1; r < 3; r++) { if (hor) { c.moveTo(x, y + r * h / 3); c.lineTo(x + w, y + r * h / 3); } else { c.moveTo(x + r * w / 3, y); c.lineTo(x + r * w / 3, y + h); } }
    for (let r = 0; r < 3; r++) {
      if (hor) for (let xx = x + (r % 2 ? 17 : 0); xx < x + w; xx += 34) { c.moveTo(xx, y + r * h / 3); c.lineTo(xx, y + (r + 1) * h / 3); }
      else for (let yy = y + (r % 2 ? 17 : 0); yy < y + h; yy += 34) { c.moveTo(x + r * w / 3, yy); c.lineTo(x + (r + 1) * w / 3, yy); }
    }
    c.stroke();
  }
  c.fillStyle = '#8f8c83';
  for (let x = ox0 + 8; x < ox1 - 20; x += 36) { c.fillRect(x, oy0 + 3, 22, 12); c.fillRect(x, oy1 - 15, 22, 12); }
  for (let y = oy0 + 8; y < oy1 - 20; y += 36) { c.fillRect(ox0 + 3, y, 12, 22); c.fillRect(ox1 - 15, y, 12, 22); }
  c.fillStyle = 'rgba(0,0,0,.30)'; c.fillRect(MAP.x0, MAP.y0, W0, 9); c.fillRect(MAP.x0, MAP.y1 - 9, W0, 9); c.fillRect(MAP.x0, MAP.y0, 9, H0); c.fillRect(MAP.x1 - 9, MAP.y0, 9, H0);
  for (const p of [[MAP.x0 - 32, MAP.y0 - 32], [MAP.x1 + 32, MAP.y0 - 32], [MAP.x0 - 32, MAP.y1 + 32], [MAP.x1 + 32, MAP.y1 + 32]]) {
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(p[0] + 4, p[1] + 5, 36, 0, TAU); c.fill();
    c.fillStyle = '#6f6c64'; c.beginPath(); c.arc(p[0], p[1], 34, 0, TAU); c.fill(); c.strokeStyle = '#4a4842'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#8a4a3a'; c.beginPath(); c.arc(p[0], p[1], 22, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(p[0] - 5, p[1] - 5, 12, 0, TAU); c.fill();
  }
  const gate = (x, y, w, h) => {
    c.fillStyle = '#4a3524'; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.5; c.beginPath();
    for (let i = 1; i < 10; i++) { if (w > h) { c.moveTo(x + i * w / 10, y); c.lineTo(x + i * w / 10, y + h); } else { c.moveTo(x, y + i * h / 10); c.lineTo(x + w, y + i * h / 10); } }
    c.stroke();
    c.fillStyle = '#2d2a27';
    if (w > h) { c.fillRect(x, y + h * .3, w, 6); c.fillRect(x, y + h * .65, w, 6); } else { c.fillRect(x + w * .3, y, 6, h); c.fillRect(x + w * .65, y, 6, h); }
    c.fillStyle = '#6a675f';
    if (w > h) { c.fillRect(x - 16, y - 2, 16, h + 4); c.fillRect(x + w, y - 2, 16, h + 4); } else { c.fillRect(x - 2, y - 16, w + 4, 16); c.fillRect(x - 2, y + h, w + 4, 16); }
  };
  gate(-ROAD - 6, oy0, 2 * ROAD + 12, WALL); gate(-ROAD - 6, MAP.y1, 2 * ROAD + 12, WALL);
  gate(ox0, -ROAD - 6, WALL, 2 * ROAD + 12); gate(MAP.x1, -ROAD - 6, WALL, 2 * ROAD + 12);
  return { canvas: cvs, solids, grid };
}
