'use strict';
/* ---------- rounds e inimigos ---------- */
function spawnPos(extra, r) {
  r = r || 12; const p = G.p, R = Math.hypot(W, H) / 2 + 60 + (extra || 0);
  for (let k = 0; k < 20; k++) { const a = rand(0, TAU), x = p.x + Math.cos(a) * R, y = p.y + Math.sin(a) * R; if (!blockedAt(x, y, r)) return { x, y }; }
  for (let k = 0; k < 120; k++) {
    const x = rand(MAP.x0 + 30, MAP.x1 - 30), y = rand(MAP.y0 + 30, MAP.y1 - 30);
    if ((Math.abs(x - p.x) > W / 2 + 40 || Math.abs(y - p.y) > H / 2 + 40) && !blockedAt(x, y, r)) return { x, y };
  }
  for (let k = 0; k < 120; k++) {
    const x = rand(MAP.x0 + 30, MAP.x1 - 30), y = rand(MAP.y0 + 30, MAP.y1 - 30);
    if (Math.hypot(x - p.x, y - p.y) > 260 && !blockedAt(x, y, r)) return { x, y };
  }
  return { x: 0, y: -300 };
}
const ringPos = extra => spawnPos(extra);
function spawnEnemy(type, x, y, sm, ex) {
  const T = ENEMY[type], n = dn(G.round), boss = !!T.boss;
  const hpMul = boss ? 1 + Math.max(0, n - 5) * .1 : 1 + (n - 1) * .22 + (n - 1) * (n - 1) * .035;
  const dm = boss ? 1 + Math.max(0, n - 5) * .1 : 1 + (n - 1) * .12;
  const e = {
    id: ++uid, type, T, x, y, r: T.r, hp: T.hp * hpMul, maxhp: T.hp * hpMul,
    spd: T.spd * (boss ? 1 : 1 + Math.min((n - 1) * .03, .3)), dmg: T.dmg * dm, dm, xp: T.xp, mass: T.mass, boss,
    losT: Math.random() * .3, nav: false, navT: 0, fa: 0, sk: 1.6, stk: 0, sx: x, sy: y, slow: 0, cr: Math.min(T.r, 34), noClip: type === 'dragon', en: 1, fuse: 0, kx: 0, ky: 0, flash: 0, stun: 0, ph: rand(0, TAU), face: 0, dead: false, hitAxe: -9,
    st: null, sT: 0, cm: 1, atk: rand(.4, T.rate || 1), skT: rand(1.2, 3), mtT: rand(3, 8), tr: 0, carry: false, sm: !!sm
  };
  if (sm) { if (blockedAt(e.x, e.y, e.cr)) { const q = findFree(x, y, 60, e.cr); if (q) { e.x = q.x; e.y = q.y; } else { e.x = x; e.y = y; } } }
  else if (blockedAt(e.x, e.y, e.cr)) { const q = spawnPos(boss ? 40 : 0, e.cr); e.x = q.x; e.y = q.y; }
  if (!boss && !sm && !ex) { if (G.spawned++ === G.carry) e.carry = true; }
  G.enemies.push(e); return e;
}
function countType(t) { let c = 0; for (const e of G.enemies) if (e.type === t && !e.dead) c++; return c; }
function pickType() {
  const n = G.round, tbl = TABLES[n <= 1 ? 1 : n === 2 ? 2 : n === 3 ? 3 : n === 4 ? 4 : n <= 6 ? 5 : 6];
  let sum = 0, k; for (k in tbl) sum += tbl[k];
  let r = Math.random() * sum, pick = 'skeleton';
  for (k in tbl) { r -= tbl[k]; if (r <= 0) { pick = k; break; } }
  if (pick === 'mage' && countType('mage') >= 2 + Math.floor(dn(n) / 3)) pick = 'skeleton';
  return pick;
}
function spawnRegular() {
  const type = pickType();
  if (type === 'mage') { const q = findFree(G.p.x, G.p.y, 300, 14) || spawnPos(); spawnEnemy(type, q.x, q.y); }
  else { const q = ringPos(); spawnEnemy(type, q.x, q.y); }
}
function spawnBoss() {
  const idx = Math.floor((G.round - 5) / 4) % 6, type = BOSS_ORDER[idx < 0 ? 0 : idx], q = spawnPos(40, 34);
  G.bossRef = spawnEnemy(type, q.x, q.y);
  el.bossname.textContent = ENEMY[type].name;
}
function doWave() {
  const n = dn(G.round), kind = ['ring', 'flock', 'cluster'][G.waveN++ % 3], p = G.p;
  let c = kind === 'ring' ? 18 + 3 * n : 14 + 2 * n;
  c = Math.min(c, G.toSpawn); if (c <= 0) return;
  G.toSpawn -= c;
  const R = Math.hypot(W, H) / 2 + 80, a0 = rand(0, TAU), ux = Math.cos(a0), uy = Math.sin(a0), vx = -uy, vy = ux;
  if (kind === 'ring') {
    banner('Cerco!');
    for (let i = 0; i < c; i++) {
      const a = i / c * TAU, type = n >= 3 && i % 2 ? 'goblin' : 'skeleton';
      spawnEnemy(type, p.x + Math.cos(a) * R, p.y + Math.sin(a) * R);
    }
  } else if (kind === 'flock') {
    banner('Revoada!');
    for (let i = 0; i < c; i++) {
      const row = Math.floor(i / 2) + (i % 2), side = i % 2 ? 1 : -1;
      spawnEnemy('bat', p.x + ux * (R + row * 22) + vx * side * row * 16, p.y + uy * (R + row * 22) + vy * side * row * 16);
    }
  } else {
    banner('Horda!');
    const cols = 6;
    for (let i = 0; i < c; i++) {
      const row = Math.floor(i / cols), col = i % cols, off = (col - (cols - 1) / 2) * 30;
      const type = n >= 5 && i % 9 === 0 ? 'ogre' : n >= 3 ? 'goblin' : 'skeleton';
      spawnEnemy(type, p.x + ux * (R + row * 30) + vx * off, p.y + uy * (R + row * 30) + vy * off);
    }
  }
}
function spawnBomber() { const q = spawnPos(0, 12); spawnEnemy('bomber', q.x, q.y, false, true); }
function startRound(n) {
  G.round = n; G.phase = 'fight';
  const total = roundTotal(n);
  G.toSpawn = G.roundTotal = total; G.spawnAcc = 0; G.spawnRate = total / (26 + 3 * dn(n));
  G.spawned = 0; G.carry = Math.floor(Math.random() * total);
  { const c = 4 + Math.floor(Math.random() * 3); G.bombMarks = []; for (let i = 0; i < c; i++) G.bombMarks.push(.08 + (i + Math.random() * .9) / c * .85); }
  G.waves = n === 1 ? [.55] : n <= 3 ? [.35, .7] : n < 10 ? [.2, .45, .7] : [.12, .28, .44, .6, .76]; G.waveIdx = 0;
  const boss = isBossRound(n);
  banner(boss ? 'Round ' + n + ' · ' + ENEMY[BOSS_ORDER[Math.floor((n - 5) / 4) % 6]].name : 'Round ' + n);
  sfx(boss ? 'roar' : 'horn');
  if (boss) spawnBoss();
}
function endRound() {
  G.phase = 'break'; G.breakT = 3; G.shopDone = false;
  for (const g of G.gems) g.pull = true;
  G.p.hp = Math.min(G.p.maxhp, G.p.hp + G.p.maxhp * .25);
  G.es.length = 0; G.hz.length = 0;
  if (G.round >= WIN_ROUND && !G.won) { G.won = true; winGame(); return; }
  banner('Round ' + G.round + ' concluído');
}
function nearest(x, y, maxD) {
  let best = null, bd = maxD * maxD;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = e.x - x, dy = e.y - y, d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function popText(x, y, s, c) { if (G.texts.length < 60) G.texts.push({ x: x + rand(-6, 6), y, s, t: .55, c }); }
function sparks(x, y, n, c, sp) {
  for (let i = 0; i < n && G.parts.length < 500; i++) {
    const a = rand(0, TAU), v = rand(.3, 1) * sp;
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: rand(.25, .55), max: .55, c, s: rand(1.5, 3.2) });
  }
}
function hitEnemy(e, dmg, ox, oy, force) {
  dmg = Math.max(1, Math.round(dmg * S.might));
  e.hp -= dmg; e.flash = .09; G.lastHit = G.t; sfx('hit', .8);
  if (force) {
    const dx = e.x - ox, dy = e.y - oy, d = Math.hypot(dx, dy) || 1, k = force / Math.sqrt(e.mass);
    e.kx = clamp(e.kx + dx / d * k, -1400, 1400); e.ky = clamp(e.ky + dy / d * k, -1400, 1400);
  }
  popText(e.x, e.y - e.r, dmg, '#f3efe2');
  if (e.hp <= 0 && !e.dead) killEnemy(e); else sparks(e.x, e.y, 2, '#e9efe6', 70);
}
function killEnemy(e, silent) {
  if (e.dead) return;
  e.dead = true;
  if (e.type === 'bomber') explode(e.x, e.y, BOMB.rad[e.en - 1], BOMB.dmg[e.en - 1] * e.dm, '255,170,40');
  if (silent) return;
  G.kills++; sfx(e.boss ? 'boom' : 'kill');
  if (G.core.sword >= 4) G.en = Math.min(100, G.en + (e.boss ? 30 : 5));
  if (e.boss) {
    for (let i = 0; i < 8; i++) G.gems.push({ x: e.x + rand(-30, 30), y: e.y + rand(-30, 30), v: Math.round(e.xp / 8), kind: 'blue', pull: true, sp: 0 });
    banner(e.T.name + ' derrotado'); G.bossRef = null; G.shake = 10;
    for (const o of G.enemies) if (o.sm && !o.dead) killEnemy(o, true);
    G.fx.push({ k: 'ring', t: .6, max: .6, c: '176,54,47' });
  } else {
    G.gems.push({ x: e.x, y: e.y, v: e.xp, kind: 'blue', pull: false, sp: 0 });
    if (!e.sm && Math.random() < .02) G.loot.push({ x: e.x + 8, y: e.y });
  }
  if (e.carry) G.gems.push({ x: e.x + 6, y: e.y - 6, v: 0, kind: 'up', pull: false, sp: 0 });
  sparks(e.x, e.y, e.boss ? 40 : 7, TYPE_COLOR[e.type], e.boss ? 220 : 120);
}
function shieldBlock() {
  const w = G.weapons.shield; if (!w || w.cd > 0) return false;
  w.cd = WEAPONS.shield.lv[w.lvl - 1].cd; G.p.iframes = Math.max(G.p.iframes, .6);
  G.fx.push({ k: 'ring', t: .5, max: .5, c: '120,200,255' }); popText(G.p.x, G.p.y - 24, 'Bloqueado!', '#9fe0ff'); sfx('shieldbreak');
  return true;
}
function playerDown() {
  const p = G.p;
  if (G.lives > 0) {
    G.lives--; p.hp = p.maxhp; p.iframes = 3; p.burn = 0; p.hurt = 0; G.pendingClear = true; G.shake = 8;
    G.fx.push({ k: 'shock', rad: 260, t: .5, max: .5 }); sfx('revive'); banner('Vida extra usada · restam ' + G.lives); hc.lives = -1;
  } else { p.hp = 0; gameOver(); }
}
function hurtPlayer(d) {
  if (shieldBlock()) return;
  const p = G.p, dmg = Math.max(1, Math.round(d - S.armor));
  p.hp -= dmg; p.iframes = .5; p.hurt = .25; G.shake = Math.max(G.shake, 6);
  popText(p.x, p.y - 20, '-' + dmg, '#ff8a7c');
  sfx('hurt');
  if (p.hp <= 0) playerDown();
}
