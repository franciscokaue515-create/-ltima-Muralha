'use strict';
/* ---------- navegação: campo de fluxo até o jogador (contorna estruturas) ---------- */
const NCELL = 28, NX = Math.ceil((MAP.x1 - MAP.x0) / NCELL), NY = Math.ceil((MAP.y1 - MAP.y0) / NCELL);
const NAVF = [0, 1].map(k => ({ r: k ? 28 : 13, mask: null, dist: new Int16Array(NX * NY), t: -9, cell: -1 }));
const NQ = new Int32Array(NX * NY), NDX = [1, -1, 0, 0, 1, 1, -1, -1], NDY = [0, 0, 1, -1, 1, -1, 1, -1];
function navCell(x, y) { return clamp(Math.floor((y - MAP.y0) / NCELL), 0, NY - 1) * NX + clamp(Math.floor((x - MAP.x0) / NCELL), 0, NX - 1); }
function navField(k) {
  const F = NAVF[k], p = G.p;
  if (!F.mask) {
    F.mask = new Uint8Array(NX * NY);
    for (let i = 0; i < NX * NY; i++) F.mask[i] = blockedAt(MAP.x0 + (i % NX + .5) * NCELL, MAP.y0 + (Math.floor(i / NX) + .5) * NCELL, F.r) ? 1 : 0;
  }
  const pc = navCell(p.x, p.y);
  if (pc === F.cell && G.t - F.t < .4) return F;
  if (G.t - F.t < .15) return F;
  F.cell = pc; F.t = G.t;
  const D = F.dist, M = F.mask; D.fill(-1);
  let qh = 0, qt = 0; const px = pc % NX, py = (pc / NX) | 0;
  for (let rad = 2; rad <= 8 && qt === 0; rad += 2)
    for (let oy = -rad; oy <= rad; oy++) for (let ox = -rad; ox <= rad; ox++) {
      const x = px + ox, y = py + oy; if (x < 0 || y < 0 || x >= NX || y >= NY) continue;
      const i = y * NX + x; if (!M[i]) { D[i] = 0; NQ[qt++] = i; }
    }
  while (qh < qt) {
    const i = NQ[qh++], x = i % NX, y = (i / NX) | 0, d = D[i] + 1;
    for (let n = 0; n < 8; n++) {
      const nx = x + NDX[n], ny = y + NDY[n]; if (nx < 0 || ny < 0 || nx >= NX || ny >= NY) continue;
      const j = ny * NX + nx; if (M[j] || D[j] >= 0) continue;
      if (n >= 4 && (M[y * NX + nx] || M[ny * NX + x])) continue;
      D[j] = d; NQ[qt++] = j;
    }
  }
  return F;
}
function flowAngle(e) {
  if (e.cr >= 20) { const a = flowAngleK(e, 1); if (a !== null) return a; }
  return flowAngleK(e, 0);
}
function flowAngleK(e, k) {
  const F = navField(k), D = F.dist, M = F.mask;
  const c = navCell(e.x, e.y), x = c % NX, y = (c / NX) | 0;
  let best = -1, bd = D[c] >= 0 ? D[c] : 1e9, bx = 0, by = 0;
  for (let n = 0; n < 8; n++) {
    const nx = x + NDX[n], ny = y + NDY[n]; if (nx < 0 || ny < 0 || nx >= NX || ny >= NY) continue;
    const j = ny * NX + nx, dd = D[j]; if (dd < 0 || M[j]) continue;
    if (n >= 4 && (M[y * NX + nx] || M[ny * NX + x])) continue;
    if (dd < bd || (dd === bd && best < 0)) { bd = dd; best = j; bx = nx; by = ny; }
  }
  if (best < 0) return null;
  return Math.atan2(MAP.y0 + (by + .5) * NCELL - e.y, MAP.x0 + (bx + .5) * NCELL - e.x);
}
function los(x0, y0, x1, y1, r) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy), n = Math.max(1, Math.ceil(d / Math.max(16, d / 18)));
  for (let i = 1; i < n; i++) if (blockedAt(x0 + dx * i / n, y0 + dy * i / n, r)) return false;
  return true;
}
