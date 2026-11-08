'use strict';
function blockedAt(x, y, r) {
  if (x < MAP.x0 + r || x > MAP.x1 - r || y < MAP.y0 + r || y > MAP.y1 - r) return true;
  const g = CITY.grid;
  for (let cx = Math.floor((x - r) / SOL_CELL); cx <= Math.floor((x + r) / SOL_CELL); cx++)
    for (let cy = Math.floor((y - r) / SOL_CELL); cy <= Math.floor((y + r) / SOL_CELL); cy++) {
      const l = g.get(cx * 4096 + cy); if (!l) continue;
      for (let i = 0; i < l.length; i++) {
        const s = l[i];
        if (s.t === 'c') { const dx = x - s.x, dy = y - s.y, m = r + s.r; if (dx * dx + dy * dy < m * m) return true; }
        else { const dx = x - clamp(x, s.x0, s.x1), dy = y - clamp(y, s.y0, s.y1); if (dx * dx + dy * dy < r * r) return true; }
      }
    }
  return false;
}
function resolveSolids(e) {
  const r = e.cr || e.r, g = CITY.grid;
  let hit = false, nx = 0, ny = 0;
  if (!e.noClip) for (let cx = Math.floor((e.x - r) / SOL_CELL); cx <= Math.floor((e.x + r) / SOL_CELL); cx++)
    for (let cy = Math.floor((e.y - r) / SOL_CELL); cy <= Math.floor((e.y + r) / SOL_CELL); cy++) {
      const l = g.get(cx * 4096 + cy); if (!l) continue;
      for (let i = 0; i < l.length; i++) {
        const s = l[i];
        if (s.t === 'c') {
          const dx = e.x - s.x, dy = e.y - s.y, m = r + s.r, d2 = dx * dx + dy * dy;
          if (d2 < m * m) { const d = Math.sqrt(d2) || .001, ux = dx / d, uy = dy / d; e.x += ux * (m - d); e.y += uy * (m - d); nx += ux; ny += uy; hit = true; }
        } else {
          const qx = clamp(e.x, s.x0, s.x1), qy = clamp(e.y, s.y0, s.y1), dx = e.x - qx, dy = e.y - qy, d2 = dx * dx + dy * dy;
          if (d2 < r * r) {
            let ux, uy, push;
            if (d2 > 1e-6) { const d = Math.sqrt(d2); ux = dx / d; uy = dy / d; push = r - d; }
            else {
              const l0 = e.x - s.x0, r0 = s.x1 - e.x, t0 = e.y - s.y0, b0 = s.y1 - e.y, m0 = Math.min(l0, r0, t0, b0);
              if (m0 === l0) { ux = -1; uy = 0; push = l0 + r; } else if (m0 === r0) { ux = 1; uy = 0; push = r0 + r; } else if (m0 === t0) { ux = 0; uy = -1; push = t0 + r; } else { ux = 0; uy = 1; push = b0 + r; }
            }
            e.x += ux * push; e.y += uy * push; nx += ux; ny += uy; hit = true;
          }
        }
      }
    }
  if (e.x < MAP.x0 + r) { e.x = MAP.x0 + r; nx += 1; hit = true; } else if (e.x > MAP.x1 - r) { e.x = MAP.x1 - r; nx -= 1; hit = true; }
  if (e.y < MAP.y0 + r) { e.y = MAP.y0 + r; ny += 1; hit = true; } else if (e.y > MAP.y1 - r) { e.y = MAP.y1 - r; ny -= 1; hit = true; }
  const nl = Math.hypot(nx, ny) || 1; colNX = nx / nl; colNY = ny / nl;
  return hit;
}
