'use strict';
function newGame() {
  const oldCam = G ? G.cam : { x: 0, y: 130 };
  G = {
    t: 0, kills: 0, blue: 0, purple: 0,
    p: { x: 0, y: 130, r: 13, vx: 0, vy: 0, hp: 100, maxhp: 100, face: 0, iframes: 0, hurt: 0, dash: null, channel: 0, chMax: .5, burn: 0, bt: 0 },
    cam: { x: oldCam.x, y: oldCam.y },
    enemies: [], shots: [], es: [], hz: [], fire: [], gems: [], loot: [], parts: [], texts: [], fx: [],
    core: { sword: 1, whirl: 1, dash: 1, shock: 1 },
    cd: { sword: 0, whirl: 0, dash: 0, shock: 0 }, cdMax: { sword: 1, whirl: 1, dash: 1, shock: 1 },
    whirl: null, weapons: {}, passives: {}, shake: 0,
    round: 0, phase: 'break', breakT: 2.5, shopDone: true, toSpawn: 0, roundTotal: 0, spawnAcc: 0, spawnRate: 1,
    en: 0, lastHit: 0, lives: 3, pendingClear: false, ambT: 1, spawned: 0, carry: 0, bombMarks: [], waves: [], waveIdx: 0, waveN: 0, bossRef: null,
    dawn: 0, won: false
  };
  hc = {};
  recalc(); renderLoadout();
}
function recalc() {
  const ps = G.passives;
  S = {
    might: 1 + .15 * (ps.might || 0),
    haste: Math.max(.4, 1 - .08 * (ps.haste || 0)),
    speed: 1 + .08 * (ps.boots || 0),
    armor: 5 * (ps.armor || 0),
    magnet: 70,
    regen: .4 * (ps.vigor || 0)
  };
}
function lvOf(id) {
  if (CORE[id]) return G.core[id];
  if (WEAPONS[id]) return G.weapons[id] ? G.weapons[id].lvl : 0;
  return G.passives[id] || 0;
}
const defOf = id => CORE[id] || WEAPONS[id] || PASSIVES[id];
const costOf = id => Math.round(COST_BASE[id] * (1 + 1.2 * lvOf(id)));
function nextText(id) { const d = defOf(id), c = lvOf(id); return d.lv ? d.lv[c].txt : d.txt; }
