'use strict';
/* ---------- habilidades do Mago e da Ladra, armas novas e efeitos de estado ---------- */
const mouseWorld = () => ({ x: G.cam.x + mouse.x - W / 2, y: G.cam.y + mouse.y - H / 2 });
function ignite(e, dps, dur) { if (e.dead) return; e.brn = Math.max(e.brn || 0, dur); e.bdps = Math.max(e.bdps || 0, dps); }
function stunE(e, t) { if (e.boss) e.slow = Math.max(e.slow, 2.5); else e.stun = Math.max(e.stun, t); }
function freezeE(e, t, big) {
  if (e.boss) { e.slow = Math.max(e.slow, 2.5); e.fz = Math.max(e.fz || 0, 1.2); return; }
  if (e.r >= 18 && !big) { e.slow = Math.max(e.slow, t); e.fz = Math.max(e.fz || 0, t * .5); return; }
  e.stun = Math.max(e.stun, t); e.fz = Math.max(e.fz || 0, t);
}
function statusTick(e, dt) {   // queimadura e gelo dos inimigos
  if (e.fz > 0) e.fz -= dt;
  if (e.brn > 0) {
    e.brn -= dt; e.bt = (e.bt || 0) - dt;
    if (e.bt <= 0) {
      e.bt += .5;
      const d = Math.max(1, Math.round(e.bdps * .5 * S.might));
      e.hp -= d; e.flash = .06; popText(e.x, e.y - e.r, d, '#ffa24a');
      if (e.hp <= 0) killEnemy(e);
    }
    if (e.brn <= 0) e.bdps = 0;
  }
}
function aoeHit(x, y, r, dmg, force, fn) {
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = e.x - x, dy = e.y - y, rr = r + e.r;
    if (dx * dx + dy * dy < rr * rr) { hitEnemy(e, dmg, x, y, force); if (!e.dead && fn) fn(e); }
  }
}
function boomShot(s) {
  const A = s.aoe;
  aoeHit(s.x, s.y, A.r, A.dmg, A.force || 90, e => { if (A.burn) ignite(e, A.burn, 3); if (A.frz) freezeE(e, A.frz, A.big); });
  G.fx.push({ k: 'blast', x: s.x, y: s.y, rad: A.r, t: .35, max: .35, col: A.frz ? '140,210,255' : '255,140,40' });
  sparks(s.x, s.y, 12, A.frz ? '#bfe8ff' : '#ffb25a', 160); sfxAt(A.frz ? 'shieldbreak' : 'boom', s.x, s.y, .8);
  G.shake = Math.max(G.shake, 3);
}
function reflectShot(s) {
  const w = G.weapons.rshield; if (!w || w.cd > 0) return false;
  const o = s.owner && !s.owner.dead ? s.owner : null, a = o ? Math.atan2(o.y - s.y, o.x - s.x) : Math.atan2(-s.vy, -s.vx);
  G.shots.push({ x: s.x, y: s.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, a, dmg: 28 + s.dmg * 3, life: 2, pierce: 0, hit: [], kind: 'refl' });
  w.cd = WEAPONS.rshield.lv[w.lvl - 1].cd; G.p.iframes = Math.max(G.p.iframes, .6);
  G.fx.push({ k: 'ring', t: .5, max: .5, c: '255,220,120' }); popText(G.p.x, G.p.y - 24, 'Refletido!', '#ffe08a'); sfx('shieldbreak');
  return true;
}

/* ================= MAGO ================= */
function castFireball() {
  if (G.cd.sword > 0 || G.flame) return;
  const L = CORE.sword.lv[G.core.sword - 1], a = aimAngle(), p = G.p;
  G.shots.push({ x: p.x + Math.cos(a) * 16, y: p.y + Math.sin(a) * 16, vx: Math.cos(a) * L.spd, vy: Math.sin(a) * L.spd, a, dmg: L.dmg, life: L.range / L.spd, pierce: 0, hit: [], kind: 'fire', solid: true,
    aoe: { r: L.rad, dmg: L.dmg, burn: L.burn } });
  p.face = a; sfx('fire'); G.cd.sword = G.cdMax.sword = L.cd * S.haste;
}
function castIce() {
  const p = G.p;
  if (G.cd.whirl > 0) return;
  const L = CORE.whirl.lv[G.core.whirl - 1], a = aimAngle(), m = mouseWorld(), dist = clamp(Math.hypot(m.x - p.x, m.y - p.y), 90, 640);
  G.shots.push({ x: p.x, y: p.y, vx: Math.cos(a) * 430, vy: Math.sin(a) * 430, a, dmg: L.dmg, life: dist / 430, pierce: 0, hit: [], kind: 'ice', solid: true, end: true,
    aoe: { r: L.rad, dmg: L.dmg, frz: L.frz, big: L.big, force: 160 } });
  p.face = a; sfx('magic'); G.cd.whirl = G.cdMax.whirl = L.cd * S.haste;
}
function castTele() {
  const p = G.p;
  if (G.cd.dash > 0 || p.channel > 0 || p.dash) return;
  const L = CORE.dash.lv[G.core.dash - 1];
  p.channel = p.chMax = 1.5; p.chFn = teleNow; p.chKind = 'tele'; p.chInv = L.inv;
  G.cd.dash = G.cdMax.dash = L.cd * S.haste; sfx('magic');
}
function teleNow() {
  const p = G.p, L = CORE.dash.lv[G.core.dash - 1], m = mouseWorld();
  let x = clamp(m.x, MAP.x0 + 40, MAP.x1 - 40), y = clamp(m.y, MAP.y0 + 40, MAP.y1 - 40);
  if (blockedAt(x, y, p.r)) { const q = findFree(x, y, 70, p.r) || findFree(x, y, 160, p.r); if (q) { x = q.x; y = q.y; } else { x = p.x; y = p.y; } }
  sparks(p.x, p.y, 16, '#c9a8ff', 180); G.fx.push({ k: 'blast', x: p.x, y: p.y, rad: 50, t: .3, max: .3, col: '182,140,255' });
  p.x = x; p.y = y; p.iframes = Math.max(p.iframes, .5); p.chKind = null; p.chInv = false;
  G.fx.push({ k: 'blast', x, y, rad: Math.max(50, L.rad || 0), t: .4, max: .4, col: '182,140,255' }); sparks(x, y, 16, '#c9a8ff', 180); sfx('dash');
  if (L.boom) { aoeHit(x, y, L.rad, L.boom, 300); G.shake = Math.max(G.shake, 5); sfxAt('boom', x, y, .8); }
}
function castFlame() {
  if (G.cd.shock > 0 || G.flame) return;
  const L = CORE.shock.lv[G.core.shock - 1];
  G.flame = { t: 10, tk: 0, on: false, a: 0, sf: 0 }; G.cd.shock = G.cdMax.shock = L.cd * S.haste; sfx('roar', .6);
}
function updateFlame(dt) {
  const f = G.flame, p = G.p; if (!f) return;
  const L = CORE.shock.lv[G.core.shock - 1];
  f.t -= dt; f.on = !!mouse.left && p.channel <= 0 && state === 'play';
  if (f.on) {
    f.a = aimAngle(); p.face = f.a; f.tk -= dt; f.sf -= dt;
    if (f.sf <= 0) { f.sf = .35; sfx('fire', .5); }
    if (f.tk <= 0) {
      f.tk += .15;
      for (const e of G.enemies) {
        if (e.dead) continue;
        const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
        if (d > L.rng + e.r) continue;
        if (d > e.r + 12 && Math.abs(angDiff(f.a, Math.atan2(dy, dx))) > L.arc / 2 + e.r / Math.max(d, 30)) continue;
        hitEnemy(e, L.dmg, p.x, p.y, e.boss ? 0 : 40, true); ignite(e, L.burn, 3);
      }
    }
    for (let i = 0; i < 3; i++) {
      const a = f.a + rand(-L.arc / 2, L.arc / 2), v = rand(.5, 1) * L.rng * 2.2;
      if (G.parts.length < 500) G.parts.push({ x: p.x + Math.cos(f.a) * 14, y: p.y + Math.sin(f.a) * 14, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: rand(.2, .38), max: .38, c: Math.random() < .5 ? '#ff9a2a' : '#ffd25a', s: rand(3, 6) });
    }
  }
  if (f.t <= 0) G.flame = null;
}

/* ================= LADRA ================= */
function castArrows() {
  if (G.cd.sword > 0) return;
  const L = CORE.sword.lv[G.core.sword - 1], a = aimAngle(), p = G.p;
  for (let i = 0; i < L.n; i++) {
    const an = a + (i - (L.n - 1) / 2) * .13;
    G.shots.push({ x: p.x + Math.cos(an) * 14, y: p.y + Math.sin(an) * 14, vx: Math.cos(an) * 720, vy: Math.sin(an) * 720, a: an, dmg: L.dmg, life: 370 / 720, pierce: L.pierce, hit: [], kind: 'arrow', solid: true });
  }
  p.face = a; sfxAt('arrow', p.x, p.y, .7); G.cd.sword = G.cdMax.sword = L.cd * S.haste;
}
function castNet() {
  const p = G.p;
  if (G.cd.whirl > 0) return;
  const L = CORE.whirl.lv[G.core.whirl - 1], m = mouseWorld(), d = Math.hypot(m.x - p.x, m.y - p.y) || 1, k = Math.min(1, 430 / d);
  const bx = p.x + (m.x - p.x) * k, by = p.y + (m.y - p.y) * k, pa = Math.atan2(m.y - p.y, m.x - p.x) + Math.PI / 2;
  for (let i = 0; i < L.n; i++) {
    const off = L.n === 1 ? 0 : (i ? 1 : -1) * L.rad * .95;
    G.nets.push({ x: bx + Math.cos(pa) * off, y: by + Math.sin(pa) * off, r: L.rad, dmg: L.dmg, st: 0, t: 14, trig: 1.5 });
  }
  sfx('swing'); G.cd.whirl = G.cdMax.whirl = L.cd * S.haste;
}
function updateNets(dt) {
  for (let i = G.nets.length - 1; i >= 0; i--) {
    const n = G.nets[i];
    if (n.st === 0) {
      n.t -= dt; let on = false;
      for (const e of G.enemies) { if (e.dead) continue; const dx = e.x - n.x, dy = e.y - n.y; if (dx * dx + dy * dy < (n.r * .9) * (n.r * .9)) { on = true; break; } }
      if (on) { n.st = 1; sfxAt('rattle', n.x, n.y, .6); }
      if (n.t <= 0) G.nets.splice(i, 1);
    } else {
      n.trig -= dt;
      if (n.trig <= 0) {
        aoeHit(n.x, n.y, n.r, n.dmg, 0, e => stunE(e, 2));
        G.fx.push({ k: 'blast', x: n.x, y: n.y, rad: n.r, t: .4, max: .4, col: '130,210,120' }); sfxAt('boom', n.x, n.y, .7); G.shake = Math.max(G.shake, 4);
        G.nets.splice(i, 1);
      }
    }
  }
}
function castRappel() {
  const p = G.p;
  if (G.cd.dash > 0 || p.channel > 0 || p.dash) return;
  const L = CORE.dash.lv[G.core.dash - 1], a = aimAngle(), c = Math.cos(a), s = Math.sin(a), rng = Math.min(L.rng, 3600);
  let d = 0, hit = false;
  for (d = 12; d <= rng; d += 6) if (blockedAt(p.x + c * d, p.y + s * d, 3)) { hit = true; break; }
  const dist = d - 6 - (p.r + 6);
  p.face = a;
  if (!hit || dist < 30) {
    G.fx.push({ k: 'rope', x1: p.x, y1: p.y, x2: p.x + c * Math.min(rng, 240), y2: p.y + s * Math.min(rng, 240), t: .25, max: .25 });
    G.cd.dash = G.cdMax.dash = 2; sfx('swing'); popText(p.x, p.y - 24, hit ? 'Perto demais' : 'Sem alvo', '#cfd8e0'); return;
  }
  const sp = 950, T = dist / sp;
  p.dash = { t: T, vx: c * sp, vy: s * sp, rap: true, hit: new Set() };
  p.iframes = Math.max(p.iframes, T + .2);
  G.rope = { x: p.x + c * (d - 6), y: p.y + s * (d - 6) };
  G.cd.dash = G.cdMax.dash = L.cd * S.haste; sfx('dash');
}
function rappelTick() {
  const p = G.p, d = p.dash, w = G.weapons.rappelcut;
  if (!w) return;
  const L = WEAPONS.rappelcut.lv[w.lvl - 1];
  for (const e of G.enemies) {
    if (e.dead || d.hit.has(e.id)) continue;
    const dx = e.x - p.x, dy = e.y - p.y, rr = e.r + 30;
    if (dx * dx + dy * dy < rr * rr) { d.hit.add(e.id); hitEnemy(e, L.dmg, p.x, p.y, e.boss ? 0 : 260); }
  }
}
function castRain() {
  const p = G.p;
  if (G.cd.shock > 0) return;
  const L = CORE.shock.lv[G.core.shock - 1], m = mouseWorld(), d = Math.hypot(m.x - p.x, m.y - p.y) || 1, k = Math.min(1, 560 / d);
  G.rains.push({ x: p.x + (m.x - p.x) * k, y: p.y + (m.y - p.y) * k, r: L.rad, dmg: L.dmg, burn: L.burn, waves: L.waves, wi: 0, t: 1 });
  sfxAt('arrow', p.x, p.y, .9); G.cd.shock = G.cdMax.shock = L.cd * S.haste;
}
function updateRains(dt) {
  for (let i = G.rains.length - 1; i >= 0; i--) {
    const r = G.rains[i]; r.t -= dt;
    if (r.t <= 0) {
      aoeHit(r.x, r.y, r.r, r.dmg, 60, e => { if (r.burn) ignite(e, r.burn, 3); });
      G.fx.push({ k: 'blast', x: r.x, y: r.y, rad: r.r, t: .3, max: .3, col: '255,190,90' }); sfxAt('boom', r.x, r.y, .6); G.shake = Math.max(G.shake, 2);
      if (++r.wi >= r.waves) G.rains.splice(i, 1); else r.t = .55;
    }
  }
}

/* ================= armas novas ================= */
function updateBombs(dt) {
  for (let i = G.bombsP.length - 1; i >= 0; i--) {
    const b = G.bombsP[i]; b.t -= dt;
    if (b.t <= 0) {
      aoeHit(b.x, b.y, b.rad, b.dmg, 320);
      G.fx.push({ k: 'blast', x: b.x, y: b.y, rad: b.rad, t: .4, max: .4, col: '255,170,40' }); sparks(b.x, b.y, 18, '#ffb25a', 220); sfxAt('boom', b.x, b.y); G.shake = Math.max(G.shake, 7);
      G.bombsP.splice(i, 1);
    }
  }
}
function zap(x, y, t, dmg) {
  hitEnemy(t, dmg, x, y, 40);
  const pts = [[x, y]], n = 5;
  for (let i = 1; i < n; i++) pts.push([lerp(x, t.x, i / n) + rand(-10, 10), lerp(y, t.y, i / n) + rand(-10, 10)]);
  pts.push([t.x, t.y]);
  G.fx.push({ k: 'zap', pts, t: .18, max: .18 }); sfxAt('bolt', t.x, t.y, .5);
}
const shield2 = (w, dt) => { if (w.cd > 0) w.cd -= dt; };
Object.assign(WEAPON_UPDATE, {
  rshield: shield2,
  dodge() {}, rappelcut() {},
  bomb(w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    const L = WEAPONS.bomb.lv[w.lvl - 1], p = G.p;
    if (!nearest(p.x, p.y, 420)) { w.cd = .2; return; }
    G.bombsP.push({ x: p.x, y: p.y, t: 1.8, max: 1.8, rad: L.rad, dmg: L.dmg }); sfx('beep');
    w.cd = L.cd * S.haste;
  },
  squire(w, dt) {
    const L = WEAPONS.squire.lv[w.lvl - 1], p = G.p;
    if (!w.sq) w.sq = [];
    while (w.sq.length < L.n) w.sq.push({ x: p.x, y: p.y, st: 0, cd: 1 + w.sq.length * .5, tg: null, a: 0 });
    w.pos = w.sq;
    w.sq.forEach((q, i) => {
      const hx = p.x + Math.cos(G.t * 1.2 + i * TAU / L.n) * 44, hy = p.y + Math.sin(G.t * 1.2 + i * TAU / L.n) * 44;
      let tx = hx, ty = hy, sp = 360;
      if (q.st === 0) { q.cd -= dt; if (q.cd <= 0) { const t = nearest(p.x, p.y, 300); if (t) { q.tg = t; q.st = 1; } else q.cd = .25; } }
      if (q.st === 1) {
        if (!q.tg || q.tg.dead) q.st = 2;
        else { tx = q.tg.x; ty = q.tg.y; sp = 640; if (Math.hypot(tx - q.x, ty - q.y) < q.tg.r + 14) { hitEnemy(q.tg, L.dmg, q.x, q.y, q.tg.boss ? 0 : 200); G.fx.push({ k: 'zap', pts: [[q.x - 10, q.y - 10], [q.x + 10, q.y + 10]], t: .15, max: .15 }); q.st = 2; q.cd = L.cd * S.haste; } }
      }
      if (q.st === 2) { sp = 640; if (Math.hypot(hx - q.x, hy - q.y) < 16) q.st = 0; }
      const dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy) || 1, m = Math.min(d, sp * dt);
      q.x += dx / d * m; q.y += dy / d * m; if (d > 1) q.a = Math.atan2(dy, dx);
    });
  },
  orb(w, dt) {
    const L = WEAPONS.orb.lv[w.lvl - 1], p = G.p;
    if (!w.o) w.o = [];
    while (w.o.length < L.n) w.o.push({ x: p.x, y: p.y, cd: .6 + w.o.length * .4 });
    w.pos = w.o;
    w.o.forEach((q, i) => {
      const a = G.t * 2.4 + i * TAU / L.n; q.x = p.x + Math.cos(a) * 54; q.y = p.y + Math.sin(a) * 54;
      q.cd -= dt;
      if (q.cd <= 0) { const t = nearest(q.x, q.y, 320); if (t) { zap(q.x, q.y, t, L.dmg); q.cd = L.cd * S.haste; } else q.cd = .2; }
    });
  },
  bigsword(w, dt) {
    const L = WEAPONS.bigsword.lv[w.lvl - 1], p = G.p;
    w.ang += L.spd * dt; w.len = L.len; w.fire = L.fire;
    const ux = Math.cos(w.ang), uy = Math.sin(w.ang), x0 = p.x + ux * 14, y0 = p.y + uy * 14, sx = ux * L.len, sy = uy * L.len, ll = L.len * L.len;
    for (const e of G.enemies) {
      if (e.dead || G.t - (e.hitSw || -9) < .3) continue;
      const t = clamp(((e.x - x0) * sx + (e.y - y0) * sy) / ll, 0, 1), dx = e.x - (x0 + sx * t), dy = e.y - (y0 + sy * t), rr = e.r + 12;
      if (dx * dx + dy * dy < rr * rr) { e.hitSw = G.t; hitEnemy(e, L.dmg, p.x, p.y, e.boss ? 0 : 140); if (L.fire && !e.dead) ignite(e, 8, 3); }
    }
  },
  multishot(w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    const L = WEAPONS.multishot.lv[w.lvl - 1], p = G.p;
    if (!nearest(p.x, p.y, 460)) { w.cd = .2; return; }
    const o = rand(0, TAU);
    for (let i = 0; i < L.n; i++) { const a = o + i * TAU / L.n; G.shots.push({ x: p.x, y: p.y, vx: Math.cos(a) * 470, vy: Math.sin(a) * 470, a, dmg: L.dmg, life: 420 / 470, pierce: 0, hit: [], kind: 'earrow', slow: 2, solid: true }); }
    sfx('bolt', .6); w.cd = L.cd * S.haste;
  }
});

/* despacho por personagem */
const CAST = {
  warrior: { sword: swing, whirl: castWhirl, dash: castDash, shock: castShock },
  mage:    { sword: castFireball, whirl: castIce, dash: castTele, shock: castFlame },
  rogue:   { sword: castArrows, whirl: castNet, dash: castRappel, shock: castRain }
};
function updateExtras(dt) {
  updateFlame(dt); updateNets(dt); updateRains(dt); updateBombs(dt);
  if (G.rope && !(G.p.dash && G.p.dash.rap)) G.rope = null;
}
