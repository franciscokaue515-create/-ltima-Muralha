'use strict';
/* ---------- inteligência dos inimigos ---------- */
const mv = (e, ang, spd, dt) => {
  const dist = spd * dt, n = Math.max(1, Math.ceil(dist / 12)), sx = Math.cos(ang) * dist / n, sy = Math.sin(ang) * dist / n;
  for (let i = 0; i < n; i++) { e.x += sx; e.y += sy; if (n > 1) resolveSolids(e); }
};
const go = (e, st, t) => { e.st = st; e.sT = t; };
const ph2 = e => e.hp < e.maxhp * .5;
function ring(e, n, spd, off) { for (let i = 0; i < n; i++) eShot(e.x, e.y, off + i / n * TAU, spd, { kind: 'orb', r: 6, dmg: 10 * e.dm, life: 4 }); }
function warnRect(e, a, len, w, t) { addHz({ shape: 'rect', x: e.x, y: e.y, a, len, w, t, dmg: 0 }); }

const BOSS = {};
BOSS.knight = (e, dt, d, a) => {
  if (!e.st) go(e, 'chase', 1);
  e.sT -= dt; const f = ph2(e) ? 1.2 : 1; e.cm = 1;
  switch (e.st) {
    case 'chase':
      mv(e, a, e.spd * f, dt); e.face = a;
      if (e.sT <= 0) {
        if (d < 210) { addHz({ x: e.x, y: e.y, r: 110, t: .5, dmg: 26 * e.dm, owner: e }); go(e, 'slam', .5); }
        else { e.aim = a; warnRect(e, a, 360, 64, .5); go(e, 'cwind', .5); }
      }
      break;
    case 'slam': if (e.sT <= 0) { if (ph2(e)) ring(e, 10, 210, rand(0, TAU)); go(e, 'rest', .4); } break;
    case 'cwind': e.face = e.aim; if (e.sT <= 0) go(e, 'charge', .42); break;
    case 'charge':
      e.cm = 1.8; mv(e, e.aim, 780, dt);
      if (e.sT <= 0) {
        if (ph2(e) && !e.again) { e.again = true; e.aim = a; warnRect(e, a, 360, 64, .35); go(e, 'cwind', .35); }
        else { e.again = false; go(e, 'rest', .45); }
      }
      break;
    case 'rest': if (e.sT <= 0) go(e, 'chase', ph2(e) ? .6 : 1); break;
  }
};
BOSS.hound = (e, dt, d, a) => {
  const p = G.p;
  if (!e.st) { go(e, 'orbit', 3.5); e.orb = Math.atan2(e.y - p.y, e.x - p.x); e.dir = Math.random() < .5 ? 1 : -1; }
  e.sT -= dt; e.cm = 1; const f = ph2(e);
  switch (e.st) {
    case 'orbit': {
      e.orb += e.dir * 1.9 * dt;
      const tx = p.x + Math.cos(e.orb) * 240, ty = p.y + Math.sin(e.orb) * 240, ang = Math.atan2(ty - e.y, tx - e.x), dd = Math.hypot(tx - e.x, ty - e.y);
      mv(e, ang, Math.min(420, dd * 5 + 170), dt); e.face = ang;
      e.tr -= dt; if (e.tr <= 0 && G.fire.length < 1100) { G.fire.push({ x: e.x, y: e.y, t: G.t }); e.tr = .05; }
      if (e.sT <= 0) go(e, 'volley', .5);
      break; }
    case 'volley':
      e.face = a;
      if (e.sT <= 0) {
        const n = f ? 7 : 5;
        for (let i = 0; i < n; i++) eShot(e.x, e.y, a + (i - (n - 1) / 2) * .2, 360, { kind: 'fire', r: 9, dmg: 14 * e.dm, life: 2.2 });
        e.tx = p.x; e.ty = p.y; e.sx = e.x; e.sy = e.y;
        addHz({ x: p.x, y: p.y, r: 90, t: .6, dmg: 26 * e.dm, owner: e });
        go(e, 'leapwind', .5);
      }
      break;
    case 'leapwind': e.face = Math.atan2(e.ty - e.y, e.tx - e.x); if (e.sT <= 0) go(e, 'leap', .25); break;
    case 'leap': {
      const k = 1 - Math.max(0, e.sT) / .25;
      e.x = lerp(e.sx, e.tx, k); e.y = lerp(e.sy, e.ty, k);
      if (e.sT <= 0) { G.shake = Math.max(G.shake, 8); if (f) ring(e, 8, 230, rand(0, TAU)); go(e, 'rest', f ? .8 : 1.2); }
      break; }
    case 'rest': if (e.sT <= 0) go(e, 'orbit', f ? 3 : 4.2); break;
  }
};
BOSS.exec = (e, dt, d, a) => {
  const p = G.p;
  if (!e.st) { go(e, 'chase', 1); e.k = 0; e.axn = 3; }
  e.sT -= dt; e.cm = 1; const f = ph2(e);
  // machados que giram em volta dele indo e vindo (boomerangs)
  const n = f ? 4 : 3; e.axes = [];
  for (let i = 0; i < n; i++) {
    const rad = 70 + 130 * (.5 + .5 * Math.sin(G.t * 1.4 + i * .7)), ang = G.t * 2.6 + i * TAU / n;
    const ax = e.x + Math.cos(ang) * rad, ay = e.y + Math.sin(ang) * rad; e.axes.push({ x: ax, y: ay });
    if (p.iframes <= 0) { const dx = p.x - ax, dy = p.y - ay, rr = 17 + p.r * .8; if (dx * dx + dy * dy < rr * rr) hurtPlayer(14 * e.dm); }
  }
  switch (e.st) {
    case 'chase':
      mv(e, a, e.spd * (f ? 1.2 : 1), dt); e.face = a; e.aim = a;
      if (e.sT <= 0) {
        const k = e.k++ % 4;
        if (k === 0) go(e, 'throw', .3);
        else if (k === 1) { e.aim = a; addHz({ shape: 'rect', x: e.x, y: e.y, a, len: 270, w: 80, t: .4, dmg: 0 }); go(e, 'lwind', .4); }
        else if (k === 2) { addHz({ shape: 'cone', x: e.x, y: e.y, a, arc: 1.5, r: 175, t: .6, dmg: 44 * e.dm, owner: e }); go(e, 'exwind', .6); }
        else { addHz({ x: e.x, y: e.y, r: 118, t: .35, dur: 2, dmg: 18 * e.dm, owner: e, follow: true, spin: true }); go(e, 'spin', 2.35); }
      }
      break;
    case 'throw':
      e.face = a;
      if (e.sT <= 0) {
        const c = f ? 5 : 3;
        for (let i = 0; i < c; i++) eShot(e.x, e.y, a + (i - (c - 1) / 2) * .26, 420, { kind: 'axe', r: 17, dmg: 20 * e.dm, life: 8, maxD: 420, owner: e, ret: true });
        go(e, 'chase', f ? .6 : .85);
      }
      break;
    case 'lwind': e.face = e.aim; if (e.sT <= 0) go(e, 'lunge', .3); break;
    case 'lunge': e.cm = 2; mv(e, e.aim, 900, dt); if (e.sT <= 0) go(e, 'rest', .3); break;
    case 'exwind': e.face = e.aim; if (e.sT <= 0) go(e, 'rest', .35); break;
    case 'spin': mv(e, a, 135, dt); e.face += 10 * dt; if (e.sT <= 0) go(e, 'rest', .5); break;
    case 'rest': if (e.sT <= 0) go(e, 'chase', f ? .65 : 1); break;
  }
};
function findFree(cx, cy, rad, r) {
  for (let k = 0; k < 30; k++) { const an = rand(0, TAU), rr = rad * rand(.7, 1), x = cx + Math.cos(an) * rr, y = cy + Math.sin(an) * rr; if (!blockedAt(x, y, r)) return { x, y }; }
  return null;
}
BOSS.seneschal = (e, dt, d, a) => {
  const p = G.p;
  if (!e.st) { go(e, 'move', 1); e.k = 0; e.bl = 2; e.fireT = 0; e.sp = 0; }
  e.sT -= dt; e.bl -= dt; e.cm = 1; e.face = a; const f = ph2(e);
  switch (e.st) {
    case 'move':
      if (d < 130 && e.bl <= 0) {
        const q = findFree(p.x, p.y, 300, e.cr);
        if (q) {
          G.fx.push({ k: 'blast', x: e.x, y: e.y, rad: 60, t: .35, max: .35, col: '182,90,255' });
          e.x = q.x; e.y = q.y; e.bl = 4;
          G.fx.push({ k: 'blast', x: e.x, y: e.y, rad: 60, t: .35, max: .35, col: '182,90,255' });
        } else e.bl = 1;
      } else if (d < 240) mv(e, a + Math.PI, e.spd * 1.5, dt);
      else if (d > 340) mv(e, a, e.spd * 1.3, dt);
      if (e.sT <= 0) {
        const k = e.k++ % 3;
        if (k === 0) go(e, 'spiral', 2.4);
        else if (k === 1) go(e, 'summon', .5);
        else {
          addHz({ x: p.x, y: p.y, r: 60, t: .9, dmg: 22 * e.dm, col: '182,90,255' });
          for (let i = 0; i < (f ? 7 : 5); i++) { const aa = rand(0, TAU), rr = rand(60, 190); addHz({ x: p.x + Math.cos(aa) * rr, y: p.y + Math.sin(aa) * rr, r: 60, t: .9, dmg: 22 * e.dm, col: '182,90,255' }); }
          go(e, 'chains', 1);
        }
      }
      break;
    case 'spiral':
      e.fireT -= dt;
      if (e.fireT <= 0) { e.fireT = .08; e.sp += .5; const arms = f ? 3 : 2; for (let s = 0; s < arms; s++) eShot(e.x, e.y, e.sp + s * TAU / arms, 230, { kind: 'orb', r: 6, dmg: 9 * e.dm, life: 4 }); }
      if (e.sT <= 0) go(e, 'move', 1);
      break;
    case 'summon':
      if (e.sT <= 0) {
        let alive = 0; for (const o of G.enemies) if (o.sm && !o.dead) alive++;
        if (alive < 8) for (let i = 0; i < 4; i++) { const aa = rand(0, TAU); spawnEnemy(i < 2 ? 'skelarcher' : 'skeleton', e.x + Math.cos(aa) * 60, e.y + Math.sin(aa) * 60, true); }
        G.fx.push({ k: 'blast', x: e.x, y: e.y, rad: 80, t: .4, max: .4, col: '182,90,255' });
        go(e, 'move', 1);
      }
      break;
    case 'chains': if (e.sT <= 0) go(e, 'move', 1); break;
  }
};
BOSS.prince = (e, dt, d, a) => {
  if (!e.st) { go(e, 'stalk', .9); e.k = 0; e.dir = 1; e.again = false; }
  e.sT -= dt; e.cm = 1; const f = ph2(e);
  if (e.ring2 > 0) { e.ring2 -= dt; if (e.ring2 <= 0) ring(e, 16, 190, Math.PI / 16); }
  switch (e.st) {
    case 'stalk': {
      e.face = a; e.aim = a;
      mv(e, d > 230 ? a : d < 170 ? a + Math.PI : a + e.dir * Math.PI / 2, e.spd, dt);
      if (e.sT <= 0) {
        const k = e.k++ % 3; e.dir = -e.dir;
        if (k === 0) go(e, 'fan', .3);
        else if (k === 1) { e.aim = a; warnRect(e, a, 380, 50, .35); go(e, 'dwind', .35); }
        else go(e, 'rose', .35);
      }
      break; }
    case 'fan':
      e.face = a;
      if (e.sT <= 0) { const n = f ? 11 : 9; for (let i = 0; i < n; i++) eShot(e.x, e.y, a + (i - (n - 1) / 2) * .17, 400, { kind: 'dagger', r: 5, dmg: 11 * e.dm, life: 1.8 }); go(e, 'stalk', .7); }
      break;
    case 'dwind': e.face = e.aim; if (e.sT <= 0) go(e, 'dash', .24); break;
    case 'dash':
      e.cm = 1.9; mv(e, e.aim, 1550, dt);
      if (e.sT <= 0) {
        if (f && !e.again) { e.again = true; e.aim = a; warnRect(e, a, 380, 50, .3); go(e, 'dwind', .3); }
        else { e.again = false; go(e, 'rest', .4); }
      }
      break;
    case 'rose':
      e.face = a;
      if (e.sT <= 0) { ring(e, 16, 190, 0); if (f) e.ring2 = .3; go(e, 'stalk', .8); }
      break;
    case 'rest': if (e.sT <= 0) go(e, 'stalk', .8); break;
  }
};
BOSS.dragon = (e, dt, d, a) => {
  const p = G.p;
  if (!e.st) { go(e, 'chase', 1); e.k = 0; e.aim = a; e.n = 0; }
  e.sT -= dt; e.cm = 1; const f = ph2(e);
  if (e.ring2 > 0) { e.ring2 -= dt; if (e.ring2 <= 0) ring(e, 12, 220, .26); }
  switch (e.st) {
    case 'chase':
      mv(e, a, e.spd, dt); e.face = a; e.aim = a;
      if (e.sT <= 0) {
        const k = e.k++ % 4;
        if (k === 0) { addHz({ shape: 'cone', x: e.x, y: e.y, a: e.aim, arc: 1.15, r: 330, t: .55, dur: 2.2, dps: 30 * e.dm, owner: e, follow: true, aimOwner: true, col: '255,140,40' }); go(e, 'breath', 2.75); }
        else if (k === 1) {
          addHz({ x: p.x, y: p.y, r: 70, t: .9, dmg: 28 * e.dm, meteor: true });
          for (let i = 0; i < (f ? 9 : 7); i++) { const aa = rand(0, TAU), rr = rand(60, 290); addHz({ x: p.x + Math.cos(aa) * rr, y: p.y + Math.sin(aa) * rr, r: 70, t: .9, dmg: 28 * e.dm, meteor: true }); }
          go(e, 'cast', .8);
        }
        else if (k === 2) { e.n = 4; e.aim = lead(e); warnRect(e, e.aim, 640, 96, .45); go(e, 'swwind', .45); }
        else { ring(e, 12, 220, 0); e.ring2 = .4; go(e, 'cast', .7); }
      }
      break;
    case 'breath': {
      const da = angDiff(e.aim, a); e.aim += clamp(da, -.9 * dt, .9 * dt); e.face = e.aim;
      if (e.sT <= 0) go(e, 'rest', .6);
      break; }
    case 'cast': e.face = a; if (e.sT <= 0) go(e, 'rest', .5); break;
    case 'swwind': e.face = e.aim; if (e.sT <= 0) go(e, 'swoop', .42); break;
    case 'swoop':
      e.cm = 1.7; mv(e, e.aim, 1500, dt); e.face = e.aim;
      e.tr -= dt; while (e.tr <= 0) { e.tr += .02; if (G.fire.length < 1100) G.fire.push({ x: e.x, y: e.y, t: G.t }); }
      if (e.sT <= 0) {
        if (--e.n > 0) { e.aim = lead(e); warnRect(e, e.aim, 640, 96, .3); go(e, 'swwind', .3); }
        else go(e, 'rest', .8);
      }
      break;
    case 'rest': if (e.sT <= 0) go(e, 'chase', f ? .5 : .9); break;
  }
};
// mira à frente do jogador para tentar cortar o caminho dele
function lead(e) { const p = G.p; return Math.atan2(p.y + (p.vy || 0) * .45 - e.y, p.x + (p.vx || 0) * .45 - e.x); }
