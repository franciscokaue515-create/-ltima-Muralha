'use strict';
function enemyAI(e, dt, d, a) {
  switch (e.type) {
    case 'bat': {
      const w = Math.sin(G.t * 4 + e.ph);
      let ux = Math.cos(a) - Math.sin(a) * w * .9, uy = Math.sin(a) + Math.cos(a) * w * .9;
      const l = Math.hypot(ux, uy) || 1; ux /= l; uy /= l;
      e.x += ux * e.spd * dt; e.y += uy * e.spd * dt; e.face = Math.atan2(uy, ux);
      break; }
    case 'skelarcher': case 'gobarcher':
      e.face = a;
      if (e.nav) { mv(e, e.fa, e.spd, dt); e.face = e.fa; }
      else if (d > e.T.range) mv(e, a, e.spd, dt);
      else {
        e.atk -= dt;
        if (e.atk <= 0) { e.atk = e.T.rate * rand(.85, 1.2); eShot(e.x, e.y, a, 260, { kind: 'arrow', r: 5, dmg: e.T.adm * e.dm, life: 2.4 }); }
      }
      break;
    case 'demon': {
      const h = a + Math.sin(G.t * 2.6 + e.ph) * (d > 90 ? 1.15 : .3);
      mv(e, h, e.spd, dt); e.face = h;
      e.tr -= dt; if (e.tr <= 0 && G.fire.length < 1100) { G.fire.push({ x: e.x, y: e.y, t: G.t }); e.tr = .1; }
      break; }
    case 'mage': {
      e.face = a;
      if (d > 300) mv(e, a, e.spd, dt); else if (d < 200) mv(e, a + Math.PI, e.spd, dt);
      e.skT -= dt;
      if (e.skT <= 0) {
        e.skT = 3.5; const base = rand(0, TAU);
        for (let i = 0; i < 6; i++) eShot(e.x, e.y, base + i * TAU / 6, 150, { kind: 'skull', r: 7, dmg: 0, life: 4, maxD: 320, noHit: true, boom: { r: 84, dmg: 14 * e.dm } });
      }
      e.mtT -= dt;
      if (e.mtT <= 0) { e.mtT = 10; addHz({ x: G.p.x, y: G.p.y, r: 70, t: 1.05, dmg: 26 * e.dm, meteor: true }); }
      break; }
    case 'bomber': {
      e.face = a; const sp = BOMB.spd[e.en - 1];
      if (e.fuse > 0) { e.fuse -= dt; e.bt = (e.bt || 0) - dt; if (e.bt <= 0) { e.bt = .25; sfxAt('beep', e.x, e.y); } if (e.fuse <= 0) killEnemy(e, true); }
      else if (d < 36 + e.en * 6) { e.fuse = 2; addHz({ x: e.x, y: e.y, r: BOMB.rad[e.en - 1], t: 2, dmg: 0, owner: e, follow: true, col: '255,170,40' }); }
      else mv(e, a, sp, dt);
      break; }
    default:
      if (e.boss) {
        if (e.ring2 > 0 && e.type !== 'prince' && e.type !== 'dragon') e.ring2 = 0;
        BOSS[e.type](e, dt, d, a);
      } else { mv(e, a, e.spd, dt); e.face = a; }
  }
}
