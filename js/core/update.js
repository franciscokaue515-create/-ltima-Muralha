'use strict';
/* ---------- atualização ---------- */
function separate() {
  grid.clear();
  const en = G.enemies;
  for (let i = 0; i < en.length; i++) {
    const e = en[i], k = Math.floor(e.x / CELL) * 92821 + Math.floor(e.y / CELL);
    const a = grid.get(k); if (a) a.push(e); else grid.set(k, [e]);
  }
  for (let i = 0; i < en.length; i++) {
    const e = en[i], cx = Math.floor(e.x / CELL), cy = Math.floor(e.y / CELL);
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
      const a = grid.get((cx + ox) * 92821 + (cy + oy)); if (!a) continue;
      for (let j = 0; j < a.length; j++) {
        const o = a[j]; if (o === e) continue;
        const dx = e.x - o.x, dy = e.y - o.y, min = e.r + o.r, d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 < min * min) {
          const d = Math.sqrt(d2), push = (min - d) * .5 * (o.mass / (e.mass + o.mass));
          e.x += dx / d * push; e.y += dy / d * push;
        }
      }
    }
  }
}

function moveP(dx, dy) {
  const p = G.p, n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 8));
  for (let i = 0; i < n; i++) { p.x += dx / n; p.y += dy / n; resolveSolids(p); }
}
function update(dt) {
  const p = G.p;
  if (G.pendingClear) {
    G.pendingClear = false; G.es.length = 0; G.hz.length = 0; G.fire = G.fire.filter(f => Math.hypot(f.x - p.x, f.y - p.y) > 260);
    for (const e of G.enemies) if (!e.dead && !e.boss) { const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; if (d < 300) { e.kx += dx / d * 900; e.ky += dy / d * 900; } }
  }
  G.t += dt;
  for (const id in G.cd) G.cd[id] = Math.max(0, G.cd[id] - dt);

  // mira e movimento
  const px0 = p.x, py0 = p.y;
  const aim = aimAngle();
  p.face += angDiff(p.face, aim) * Math.min(1, dt * 22);
  if (p.channel > 0) {
    p.channel -= dt;
    if (p.channel <= 0) { p.channel = 0; blast(); }
  } else if (p.dash) {
    const d = p.dash;
    moveP(d.vx * dt, d.vy * dt); d.t -= dt;
    G.fx.push({ k: 'ghost', x: p.x, y: p.y, t: .22, max: .22 });
    if (d.t <= 0) p.dash = null;
  } else {
    let ix = 0, iy = 0;
    if (isHeld('left')) ix -= 1;
    if (isHeld('right')) ix += 1;
    if (isHeld('up')) iy -= 1;
    if (isHeld('down')) iy += 1;
    const m = Math.hypot(ix, iy);
    if (m > 0) { ix /= m; iy /= m; p.lm = Math.atan2(iy, ix); p.stepT = (p.stepT || 0) - dt; if (p.stepT <= 0) { p.stepT = .3 / S.speed; sfx('step'); } }
    const sp = 150 * S.speed;
    moveP(ix * sp * dt, iy * sp * dt);
  }
  p.vx = (p.x - px0) / Math.max(dt, 1e-3); p.vy = (p.y - py0) / Math.max(dt, 1e-3);
  p.iframes = Math.max(0, p.iframes - dt); p.hurt = Math.max(0, p.hurt - dt);
  p.hp = Math.min(p.maxhp, p.hp + S.regen * dt);
  G.shake = Math.max(0, G.shake - dt * 30);
  G.cam.x += (p.x - G.cam.x) * Math.min(1, dt * 9); G.cam.y += (p.y - G.cam.y) * Math.min(1, dt * 9); clampCam(G.cam);
  G.dawn += (clamp(G.round / WIN_ROUND, 0, 1) - G.dawn) * Math.min(1, dt * .5);

  if (G.en > 0 && G.en < 100 && G.t - G.lastHit > 6) G.en = Math.max(0, G.en - 15 * dt);
  // ataque básico (botão esquerdo, segurar repete)
  if (mouse.left && G.cd.sword <= 0 && p.channel <= 0) swing();

  // giro devastador (sem empurrar)
  const wh = G.whirl;
  if (wh) {
    const L = CORE.whirl.lv[G.core.whirl - 1];
    wh.t -= dt; wh.ang += 13 * dt; wh.tick -= dt;
    if (wh.tick <= 0) {
      wh.tick += .2;
      for (const e of G.enemies) {
        if (e.dead) continue;
        const dx = e.x - p.x, dy = e.y - p.y, rr = L.rad + e.r;
        if (dx * dx + dy * dy < rr * rr) hitEnemy(e, L.dmg, p.x, p.y, 0);
      }
    }
    if (wh.t <= 0) G.whirl = null;
  }

  // rounds
  if (G.phase === 'fight') {
    G.spawnAcc += G.spawnRate * dt;
    while (G.spawnAcc >= 1 && G.toSpawn > 0) {
      if (G.enemies.length >= MAXE) { G.spawnAcc = Math.min(G.spawnAcc, 1); break; }
      G.spawnAcc -= 1; G.toSpawn--; spawnRegular();
    }
    while (G.bombMarks.length && (G.toSpawn <= 0 || 1 - G.toSpawn / G.roundTotal >= G.bombMarks[0])) { G.bombMarks.shift(); spawnBomber(); }
    while (G.waveIdx < G.waves.length && G.toSpawn <= G.roundTotal * (1 - G.waves[G.waveIdx])) { G.waveIdx++; doWave(); }
  } else {
    G.breakT -= dt;
    if (G.breakT <= 0) {
      if (G.round > 0 && !G.shopDone) { openShop(); return; }
      startRound(G.round + 1);
    }
  }

  // inimigos
  const far = Math.hypot(W, H) / 2 + 420, en = G.enemies;
  for (let i = 0; i < en.length; i++) {
    const e = en[i]; if (e.dead) continue;
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
    if (e.flash > 0) e.flash -= dt;
    const edt = e.slow > 0 ? dt * .45 : dt; if (e.slow > 0) e.slow -= dt;
    if (e.stun > 0) e.stun -= dt;
    else {
      let aa = a;
      if (!e.noClip) {
        e.losT -= dt;
        if (e.losT <= 0) {
          e.losT = .2 + Math.random() * .15;
          if (d > 50 && !los(e.x, e.y, p.x, p.y, e.cr * .8)) { e.nav = true; e.navT = G.t + .9; } else if (G.t > e.navT) e.nav = false;
        }
        if (e.nav) {
          const fa = flowAngle(e);
          if (fa === null) e.nav = false;
          else {
            e.fa = fa;
            const t = e.type;
            if (e.boss ? (t !== 'dragon' && t !== 'hound' && (e.st === 'chase' || e.st === 'stalk' || e.st === 'move')) : (t !== 'skelarcher' && t !== 'gobarcher' && t !== 'mage')) aa = fa;
          }
        }
      }
      enemyAI(e, edt, d, aa);
    }
    // anti-travamento: quem não sai do lugar por muito tempo reaparece fora da tela
    e.sk -= dt;
    if (e.sk <= 0) {
      e.sk = 1.6; const mvd = Math.hypot(e.x - e.sx, e.y - e.sy); e.sx = e.x; e.sy = e.y;
      const hold = e.boss || e.sm || e.stun > 0 || e.fuse > 0 || e.slow > 0 || e.type === 'mage' || ((e.type === 'skelarcher' || e.type === 'gobarcher') && d <= e.T.range && !e.nav);
      if (!hold && mvd < 12) { if (++e.stk >= 2) { e.stk = 0; const q = spawnPos(0, e.cr); e.x = q.x; e.y = q.y; e.kx = e.ky = 0; } } else e.stk = 0;
    }
    e.x += e.kx * dt; e.y += e.ky * dt;
    const kd = Math.max(0, 1 - dt * 7); e.kx *= kd; e.ky *= kd;
  }
  separate();
  for (let i = 0; i < en.length; i++) {
    const e = en[i]; if (e.dead) continue;
    if (resolveSolids(e) && e.stun <= 0 && !e.nav && (!e.boss || e.st === 'chase' || e.st === 'stalk' || e.st === 'move' || e.st === 'orbit')) {
      const nx = colNX, ny = colNY, tx = -ny, ty = nx, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
      if ((dx * nx + dy * ny) / d < .2) {
        let sg = (tx * dx + ty * dy) / d; sg = Math.abs(sg) > .15 ? Math.sign(sg) : (e.sl || (e.sl = Math.random() < .5 ? 1 : -1));
        const v = (e.spd || 60) * dt * .9; e.x += tx * sg * v; e.y += ty * sg * v; resolveSolids(e);
      }
    }
  }

  // sons dos mobs
  G.ambT -= dt;
  if (G.ambT <= 0) {
    G.ambT = rand(.5, 1.1);
    const c = en[(Math.random() * en.length) | 0];
    if (c && !c.dead) { const m = { skeleton: 'rattle', skelarcher: 'rattle', goblin: 'cackle', gobarcher: 'cackle', bomber: 'cackle', bat: 'screech', ogre: 'growl', demon: 'hiss', mage: 'whisper' }[c.type] || 'growl'; sfxAt(m, c.x, c.y, .8); }
  }

  // contato com o jogador
  if (p.iframes <= 0) {
    for (let i = 0; i < en.length; i++) {
      const e = en[i]; if (e.dead || e.stun > 0 || e.type === 'bomber') continue;
      const dx = e.x - p.x, dy = e.y - p.y, rr = e.r + p.r - 2;
      if (dx * dx + dy * dy < rr * rr) { hurtPlayer(e.dmg * e.cm); break; }
    }
    if (state !== 'play') return;
  }

  // armas automáticas
  for (const id in G.weapons) WEAPON_UPDATE[id](G.weapons[id], dt);

  // projéteis do jogador
  for (let i = G.shots.length - 1; i >= 0; i--) {
    const s = G.shots[i];
    s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (s.x < MAP.x0 || s.x > MAP.x1 || s.y < MAP.y0 || s.y > MAP.y1) s.life = 0;
    if (s.life > 0) {
      for (const e of en) {
        if (e.dead || s.hit.indexOf(e.id) >= 0) continue;
        const dx = e.x - s.x, dy = e.y - s.y, rr = e.r + 5;
        if (dx * dx + dy * dy < rr * rr) {
          s.hit.push(e.id); hitEnemy(e, s.dmg, s.x - s.vx * .02, s.y - s.vy * .02, 90);
          if (s.pierce > 0) s.pierce--; else { s.life = 0; break; }
        }
      }
    }
    if (s.life <= 0) { G.shots[i] = G.shots[G.shots.length - 1]; G.shots.pop(); }
  }

  // ataques inimigos
  updateEnemyShots(dt); if (state !== 'play') return;
  updateHazards(dt); if (state !== 'play') return;
  updateFire(dt); if (state !== 'play') return;

  // gemas e itens
  for (let i = G.gems.length - 1; i >= 0; i--) {
    const g = G.gems[i], dx = p.x - g.x, dy = p.y - g.y, d2 = dx * dx + dy * dy;
    if (!g.pull && d2 < S.magnet * S.magnet) g.pull = true;
    if (g.pull) {
      g.sp = Math.min(900, (g.sp || 140) + 1400 * dt);
      const d = Math.sqrt(d2) || 1; g.x += dx / d * g.sp * dt; g.y += dy / d * g.sp * dt;
    }
    if (d2 < (p.r + 7) * (p.r + 7)) {
      sfx(g.kind === 'up' ? 'revive' : 'gem', .8);
      if (g.kind === 'up') { G.purple++; G.fx.push({ k: 'ring', t: .5, max: .5, c: '182,140,255' }); popText(p.x, p.y - 24, 'Gema roxa!', '#c9a8ff'); }
      else G.blue += g.v;
      G.gems[i] = G.gems[G.gems.length - 1]; G.gems.pop();
    }
  }
  for (let i = G.loot.length - 1; i >= 0; i--) {
    const l = G.loot[i], dx = p.x - l.x, dy = p.y - l.y;
    if (dx * dx + dy * dy < (p.r + 10) * (p.r + 10)) {
      p.hp = Math.min(p.maxhp, p.hp + 30); popText(p.x, p.y - 22, '+30', '#9be08a');
      G.loot[i] = G.loot[G.loot.length - 1]; G.loot.pop();
    }
  }

  // partículas, textos, efeitos
  for (let i = G.parts.length - 1; i >= 0; i--) {
    const q = G.parts[i]; q.t -= dt;
    if (q.t <= 0) { G.parts[i] = G.parts[G.parts.length - 1]; G.parts.pop(); continue; }
    q.x += q.vx * dt; q.y += q.vy * dt; const f = Math.pow(.02, dt); q.vx *= f; q.vy *= f;
  }
  for (let i = G.texts.length - 1; i >= 0; i--) {
    const q = G.texts[i]; q.t -= dt; q.y -= 34 * dt;
    if (q.t <= 0) { G.texts[i] = G.texts[G.texts.length - 1]; G.texts.pop(); }
  }
  for (let i = G.fx.length - 1; i >= 0; i--) {
    G.fx[i].t -= dt;
    if (G.fx[i].t <= 0) { G.fx[i] = G.fx[G.fx.length - 1]; G.fx.pop(); }
  }

  // remove mortos
  let j = 0;
  for (let i = 0; i < en.length; i++) if (!en[i].dead) en[j++] = en[i];
  en.length = j;

  if (G.phase === 'fight' && G.toSpawn <= 0 && en.length === 0) endRound();
}
