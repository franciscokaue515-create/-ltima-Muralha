'use strict';
/* ---------- habilidades do personagem ---------- */
function slash(a, L) {
  const p = G.p;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
    if (d > L.rad + e.r) continue;
    if (d > e.r + 8 && Math.abs(angDiff(a, Math.atan2(dy, dx))) > L.arc / 2) continue;
    hitEnemy(e, L.dmg, p.x, p.y, 0);
  }
  G.fx.push({ k: 'slash', a, rad: L.rad, arc: L.arc, t: .2, max: .2 });
}
function waveBlast(a, L) {
  const p = G.p;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
    if (d > L.wr + e.r) continue;
    if (d > e.r + 10 && Math.abs(angDiff(a, Math.atan2(dy, dx))) > L.warc / 2) continue;
    hitEnemy(e, L.wdmg, p.x, p.y, e.boss ? 0 : 420);
  }
  G.fx.push({ k: 'wave', a, rad: L.wr, arc: L.warc, t: .5, max: .5 }); sfx('wave');
  G.shake = Math.max(G.shake, 4);
}
function swing() {
  const L = CORE.sword.lv[G.core.sword - 1], a = aimAngle();
  slash(a, L); sfx('swing');
  if (L.wave && G.en >= 100) { waveBlast(a, L); G.en = 0; }
  G.p.face = a;
  G.cd.sword = G.cdMax.sword = L.cd * S.haste;
}
function castWhirl() {
  const p = G.p;
  if (G.cd.whirl > 0 || G.whirl || p.channel > 0) return;
  const L = CORE.whirl.lv[G.core.whirl - 1];
  G.whirl = { t: L.dur, dur: L.dur, tick: 0, ang: 0 }; sfx('whirl');
  G.cd.whirl = G.cdMax.whirl = L.cd * S.haste;
}
function castDash() {
  const p = G.p;
  if (G.cd.dash > 0 || p.channel > 0 || p.dash) return;
  const L = CORE.dash.lv[G.core.dash - 1], T = .15;
  let ix = (isHeld('right') ? 1 : 0) - (isHeld('left') ? 1 : 0), iy = (isHeld('down') ? 1 : 0) - (isHeld('up') ? 1 : 0);
  const a = (ix || iy) ? Math.atan2(iy, ix) : (p.lm != null ? p.lm : aimAngle());
  sfx('dash');
  p.dash = { t: T, vx: Math.cos(a) * L.dist / T, vy: Math.sin(a) * L.dist / T };
  p.iframes = Math.max(p.iframes, .3);
  G.cd.dash = G.cdMax.dash = L.cd * S.haste;
  sparks(p.x, p.y, 8, '#6fd0e6', 110);
}
function castShock() {
  const p = G.p;
  if (G.cd.shock > 0) return;
  const L = CORE.shock.lv[G.core.shock - 1];
  G.cd.shock = G.cdMax.shock = L.cd * S.haste;
  blast();
}
function blast() {
  const p = G.p, L = CORE.shock.lv[G.core.shock - 1];
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = e.x - p.x, dy = e.y - p.y, rr = L.rad + e.r;
    if (dx * dx + dy * dy < rr * rr) { hitEnemy(e, L.dmg, p.x, p.y, L.force); if (!e.dead) { if (e.boss) e.slow = 2.5; else e.stun = 2; } }
  }
  G.fx.push({ k: 'shock', rad: L.rad, t: .45, max: .45 }); sfx('shock');
  G.shake = Math.max(G.shake, 9);
}

/* ---------- armas automáticas ---------- */
const WEAPON_UPDATE = {
  dagger(w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    const L = WEAPONS.dagger.lv[w.lvl - 1], p = G.p, t = nearest(p.x, p.y, 560);
    if (!t) { w.cd = .1; return; }
    const base = Math.atan2(t.y - p.y, t.x - p.x);
    for (let i = 0; i < L.n; i++) {
      const a = base + (i - (L.n - 1) / 2) * .18;
      G.shots.push({ x: p.x, y: p.y, vx: Math.cos(a) * 430, vy: Math.sin(a) * 430, a, dmg: L.dmg, life: 1.2, pierce: L.pierce, hit: [] });
    }
    w.cd = L.cd * S.haste;
  },
  axe(w, dt) {
    const L = WEAPONS.axe.lv[w.lvl - 1], p = G.p;
    w.ang += L.spd * dt; w.pos = [];
    for (let i = 0; i < L.n; i++) {
      const a = w.ang + i * TAU / L.n, x = p.x + Math.cos(a) * L.r, y = p.y + Math.sin(a) * L.r;
      w.pos.push({ x, y });
      for (const e of G.enemies) {
        if (e.dead) continue;
        const dx = e.x - x, dy = e.y - y, rr = e.r + 15;
        if (dx * dx + dy * dy < rr * rr && G.t - e.hitAxe > .4) { e.hitAxe = G.t; hitEnemy(e, L.dmg, p.x, p.y, 110); }
      }
    }
    w.fpos = [];
    if (w.lvl >= 5) {
      if (w.fT === undefined) { w.fT = 2.5; w.fOn = true; sfx('fire'); }
      w.fT -= dt;
      if (w.fT <= 0) { w.fOn = !w.fOn; w.fT = w.fOn ? 2.5 : 5; if (w.fOn) sfx('fire'); }
      if (w.fOn) {
        w.fa = clamp(Math.min(w.fT / .3, (2.5 - w.fT) / .2), 0, 1);
        for (let i = 0; i < 5; i++) {
          const a = -w.ang * .85 + i * TAU / 5, x = p.x + Math.cos(a) * (L.r + 62), y = p.y + Math.sin(a) * (L.r + 62);
          w.fpos.push({ x, y });
          for (const e of G.enemies) {
            if (e.dead) continue;
            const dx = e.x - x, dy = e.y - y, rr = e.r + 19;
            if (dx * dx + dy * dy < rr * rr && G.t - (e.hitFx || -9) > .4) { e.hitFx = G.t; hitEnemy(e, L.dmg * 1.6, p.x, p.y, 110); }
          }
        }
      }
    }
  },
  shield(w, dt) { if (w.cd > 0) w.cd -= dt; },
  bolt(w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    const L = WEAPONS.bolt.lv[w.lvl - 1], p = G.p, R = Math.min(W, H) * .5 + 40, R2 = R * R;
    const cand = G.enemies.filter(e => !e.dead && (e.x - p.x) * (e.x - p.x) + (e.y - p.y) * (e.y - p.y) < R2);
    if (!cand.length) { w.cd = .15; return; }
    const bs = cand.filter(e => e.type === 'bomber');
    for (let i = 0; i < L.n; i++) { const t = bs.length ? bs[i % bs.length] : cand[(Math.random() * cand.length) | 0]; strike(t.x, t.y, L); }
    w.cd = L.cd * S.haste;
  }
};
function strike(x, y, L) {
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = e.x - x, dy = e.y - y, rr = L.rad + e.r;
    if (dx * dx + dy * dy < rr * rr) {
      if (e.type === 'bomber') {   // o raio energiza mas nunca mata o goblin do para-raios (fica com 1 de vida)
        if (!e.fuse) e.en = Math.min(5, e.en + 1);
        const dd = Math.max(1, Math.round(L.dmg * S.might)); e.hp = Math.max(1, e.hp - dd); e.flash = .09; G.lastHit = G.t;
        popText(e.x, e.y - e.r, dd, '#f3efe2'); popText(e.x, e.y - 26, '⚡' + e.en, '#9fd0ff');
      } else hitEnemy(e, L.dmg, x, y, 60);
    }
  }
  const pts = [[x + rand(-30, 30), y - 420]], steps = 7;
  for (let i = 1; i < steps; i++) pts.push([lerp(pts[0][0], x, i / steps) + rand(-18, 18), lerp(pts[0][1], y, i / steps)]);
  pts.push([x, y]);
  G.fx.push({ k: 'bolt', x, y, rad: L.rad, pts, t: .28, max: .28 }); sfxAt('bolt', x, y);
  G.shake = Math.max(G.shake, 2);
}
