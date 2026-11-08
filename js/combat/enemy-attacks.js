'use strict';
/* ---------- ataques inimigos: projéteis, áreas marcadas, fogo ---------- */
function eShot(x, y, a, spd, o) {
  { const k = o && o.kind; if (k === 'arrow' || k === 'dagger') sfxAt('arrow', x, y, .8); else if (k === 'skull') sfxAt('magic', x, y, .6); else if (k === 'fire') sfxAt('fire', x, y, .6); else if (k === 'axe') sfxAt('swing', x, y, .8); }
  G.es.push(Object.assign({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, a, r: 6, dmg: 8, life: 3, d: 0, kind: 'orb', rot: 0 }, o));
}
function explode(x, y, r, dmg, col) {
  sfxAt('boom', x, y);
  G.fx.push({ k: 'blast', x, y, rad: r, t: .35, max: .35, col: col || '182,90,255' });
  sparks(x, y, 10, '#c9a0ff', 150);
  const p = G.p, dx = p.x - x, dy = p.y - y;
  if (p.iframes <= 0 && dx * dx + dy * dy <= (r + 8) * (r + 8)) hurtPlayer(dmg);
}
function addHz(o) { G.hz.push(Object.assign({ shape: 'circle', t: 1, dur: 0, tk: 0, dmg: 0, col: '255,80,60', a: 0 }, o, { max: o.t })); }
function hzHits(h) {
  const p = G.p, dx = p.x - h.x, dy = p.y - h.y;
  if (h.shape === 'circle') return dx * dx + dy * dy <= (h.r + 8) * (h.r + 8);
  if (h.shape === 'cone') { const d = Math.hypot(dx, dy); return d <= h.r + 8 && (d < 24 || Math.abs(angDiff(h.a, Math.atan2(dy, dx))) <= h.arc / 2); }
  const c = Math.cos(h.a), s = Math.sin(h.a), al = dx * c + dy * s, ac = -dx * s + dy * c;
  return al >= -8 && al <= h.len + 8 && Math.abs(ac) <= h.w / 2 + 8;
}
function updateHazards(dt) {
  const p = G.p;
  for (let i = G.hz.length - 1; i >= 0; i--) {
    const h = G.hz[i];
    if (h.owner) {
      if (h.owner.dead) { G.hz.splice(i, 1); continue; }
      if (h.follow) { h.x = h.owner.x; h.y = h.owner.y; }
      if (h.aimOwner) h.a = h.owner.aim;
    }
    if (h.t > 0) {
      h.t -= dt;
      if (h.t <= 0) {
        h.t = 0;
        if (h.dur > 0) { h.tk = 0; if (h.dps) sfxAt('fire', h.x, h.y); }
        else {
          if (h.dmg > 0 && p.iframes <= 0 && hzHits(h)) hurtPlayer(h.dmg);
          if (h.shape === 'circle' && h.dmg > 0) sfxAt('boom', h.x, h.y, .8);
          if (h.shape === 'circle') G.fx.push({ k: 'blast', x: h.x, y: h.y, rad: h.r, t: .4, max: .4, col: h.col });
          if (h.meteor) G.shake = Math.max(G.shake, 7);
          G.hz.splice(i, 1);
        }
      }
    } else {
      h.dur -= dt; h.tk -= dt;
      if (h.tk <= 0) {
        h.tk += h.dps ? .2 : .25;
        if (h.dps) { if (hzHits(h) && !shieldBlock()) { const dd = Math.max(1, Math.round(h.dps * .2 - S.armor * .3)); p.hp -= dd; p.hurt = .12; popText(p.x, p.y - 20, '-' + dd, '#ffa24a'); if (p.burn <= 0) p.bt = .5; p.burn = 3; if (p.hp <= 0) playerDown(); } }
        else if (h.dmg > 0 && p.iframes <= 0 && hzHits(h)) hurtPlayer(h.dmg);
      }
      if (h.dur <= 0) G.hz.splice(i, 1);
    }
  }
}
function updateEnemyShots(dt) {
  const p = G.p;
  for (let i = G.es.length - 1; i >= 0; i--) {
    const s = G.es[i];
    if (s.kind === 'axe' && s.back) {
      const o = s.owner;
      if (!o || o.dead) s.life = 0;
      else {
        const ang = Math.atan2(o.y - s.y, o.x - s.x); s.vx = Math.cos(ang) * 360; s.vy = Math.sin(ang) * 360;
        if (Math.hypot(o.x - s.x, o.y - s.y) < o.r + 10) s.life = 0;
      }
    }
    s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; s.d += Math.hypot(s.vx, s.vy) * dt; s.rot += dt * 14;
    if (s.x < MAP.x0 || s.x > MAP.x1 || s.y < MAP.y0 || s.y > MAP.y1) { if (s.boom && s.life > 0) explode(clamp(s.x, MAP.x0, MAP.x1), clamp(s.y, MAP.y0, MAP.y1), s.boom.r, s.boom.dmg); if (!s.back) s.life = 0; }
    if (s.maxD && s.d >= s.maxD && !s.back) {
      if (s.boom) { explode(s.x, s.y, s.boom.r, s.boom.dmg); s.life = 0; }
      else if (s.ret) { s.back = true; s.hit = false; }
      else s.life = 0;
    }
    if (s.life > 0 && !s.noHit && !s.hit && p.iframes <= 0) {
      const dx = p.x - s.x, dy = p.y - s.y, rr = s.r + p.r * .8;
      if (dx * dx + dy * dy < rr * rr) { hurtPlayer(s.dmg); s.hit = true; if (!s.ret) s.life = 0; }
    }
    if (s.life <= 0) { G.es[i] = G.es[G.es.length - 1]; G.es.pop(); }
  }
}
function updateFire(dt) {
  const F = G.fire, p = G.p;
  while (F.length && G.t - F[0].t > 5) F.shift();
  if (!p.dash) {
    for (let i = 0; i < F.length; i++) {
      const dx = p.x - F[i].x, dy = p.y - F[i].y;
      if (dx * dx + dy * dy < 441) { if (p.burn <= 0) p.bt = .5; p.burn = 3; break; }
    }
  }
  if (p.burn > 0) {
    p.burn -= dt; p.bt -= dt;
    if (p.bt <= 0) {
      p.bt += .5;
      const d = Math.max(1, Math.round(3 + dn(G.round) * .5));
      p.hp -= d; popText(p.x, p.y - 22, '-' + d, '#ffa24a');
      if (p.hp <= 0) playerDown();
    }
  }
}
