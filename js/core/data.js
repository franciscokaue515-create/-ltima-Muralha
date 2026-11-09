'use strict';
/* ---------- dados do jogo ---------- */
const ICONS = {
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/>',
  dagger: '<path d="M12 2l3 12-3 3-3-3z"/><path d="M7 17h10v2H7z"/><path d="M11 19h2v4h-2z"/>',
  axe: '<path d="M11 3h2v19h-2z"/><path d="M13 5c6-1 9 3 7 6-2 2-5 2-7 1z"/>',
  bolt: '<path d="M13 2L5 13h6l-1 9 8-12h-6z"/>',
  sword: '<path d="M20 3l1 3-11 11-3-3z"/><path d="M5 14l5 5-2 2-5-5z"/>',
  whirl: '<path d="M12 3a9 9 0 1 0 9 9h-3a6 6 0 1 1-6-6z"/><path d="M12 0l6 4.5-6 4.5z"/>',
  dash: '<path d="M2 5l8 7-8 7z"/><path d="M12 5l8 7-8 7z"/>',
  shock: '<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/><circle cx="12" cy="12" r="2.4"/>',
  might: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 2 2 2 4 1-3 1-6 1-9z"/>',
  haste: '<path d="M6 2h12v2c0 4-4 6-4 8s4 4 4 8v2H6v-2c0-4 4-6 4-8S6 8 6 4z"/>',
  boots: '<path d="M7 3h6v8l7 3v6H5z"/>',
  armor: '<path d="M12 2l8 3v6c0 5-3 9-8 11-5-2-8-6-8-11V5z"/>',
  magnet: '<path d="M5 3h4v9a3 3 0 0 0 6 0V3h4v9a7 7 0 0 1-14 0z"/>',
  vigor: '<path d="M12 21C4 15 2 11 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 3-2 7-10 13z"/>',
  gem: '<path d="M12 2l8 7-8 13L4 9z"/>'
};
const icon = id => '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ICONS[id] + '</svg>';

/* Habilidades fixas do personagem. lv[n].txt descreve o que o nível n+1 traz. */
const CORE = {
  sword: { name: 'Espada', key: 'Esq', lv: [
    { dmg: 16, cd: .5,  rad: 84,  arc: 2.1, back: false, txt: 'Golpe em arco na direção do mouse.' },
    { dmg: 16, cd: .5,  rad: 98,  arc: 2.3, back: false, txt: 'Alcance maior.' },
    { dmg: 23, cd: .5,  rad: 98,  arc: 2.3, back: false, txt: 'Mais dano.' },
    { dmg: 23, cd: .4,  rad: 104, arc: 2.3, wave: true, wr: 270, warc: 1.0, wdmg: 20, txt: 'Ataca mais rápido e libera a Onda de Energia: matar inimigos enche a barra e, cheia, o próximo golpe lança um cone de energia que empurra os menores.' },
    { dmg: 32, cd: .35, rad: 128, arc: 2.7, wave: true, wr: 350, warc: 1.25, wdmg: 32, txt: 'Golpe devastador com alcance enorme e Onda de Energia maior e mais forte.' }
  ] },
  whirl: { name: 'Giro Devastador', key: 'Dir', lv: [
    { dmg: 6,  rad: 78,  dur: 5,   cd: 20, txt: 'Gira em 360° por 5 s causando dano contínuo. Recarga de 20 s.' },
    { dmg: 6,  rad: 92,  dur: 5,   cd: 20, txt: 'Alcance maior.' },
    { dmg: 9,  rad: 92,  dur: 5,   cd: 20, txt: 'Mais dano a cada giro.' },
    { dmg: 9,  rad: 92,  dur: 5,   cd: 16, txt: 'Recarga de 16 s.' },
    { dmg: 12, rad: 108, dur: 6.5, cd: 14, txt: 'Giro mais forte e maior, dura 6,5 s. Recarga de 14 s.' }
  ] },
  dash: { name: 'Avanço Fugaz', key: 'Espaço', lv: [
    { dist: 150, cd: 10, txt: 'Avança na direção em que você anda (WASD) e fica invulnerável por um instante. Recarga de 10 s.' },
    { dist: 175, cd: 10, txt: 'Distância maior.' },
    { dist: 175, cd: 8,  txt: 'Recarga de 8 s.' },
    { dist: 210, cd: 8,  txt: 'Distância maior.' },
    { dist: 210, cd: 6,  txt: 'Recarga de 6 s.' }
  ] },
  shock: { name: 'Onda de Choque', key: 'E', lv: [
    { dmg: 10, rad: 170, force: 800,  cd: 70, txt: 'Libera uma onda que empurra e atordoa por 2 s (chefões só ficam lentos). Você continua andando. Recarga de 1:10.' },
    { dmg: 10, rad: 205, force: 900,  cd: 70, txt: 'Alcance maior.' },
    { dmg: 20, rad: 205, force: 900,  cd: 70, txt: 'Mais dano.' },
    { dmg: 20, rad: 205, force: 1000, cd: 56, txt: 'Recarga de 56 s.' },
    { dmg: 30, rad: 260, force: 1300, cd: 45, txt: 'Onda enorme, empurra com mais força. Recarga de 45 s.' }
  ] }
};
const SKILL_ORDER = ['sword', 'whirl', 'dash', 'shock'];

/* Armas automáticas. */
const WEAPONS = {
  dagger: { name: 'Adagas', lv: [
    { dmg: 9,  cd: 1.0,  n: 1, pierce: 0, txt: 'Arremessa uma adaga no inimigo mais próximo.' },
    { dmg: 9,  cd: 1.0,  n: 2, pierce: 0, txt: '+1 adaga por disparo.' },
    { dmg: 12, cd: 1.0,  n: 2, pierce: 0, txt: 'Mais dano em cada adaga.' },
    { dmg: 12, cd: 0.85, n: 3, pierce: 0, txt: '+1 adaga e disparo mais rápido.' },
    { dmg: 15, cd: 0.8,  n: 3, pierce: 2, txt: 'As adagas atravessam até 3 inimigos.' }
  ] },
  axe: { name: 'Machados', lv: [
    { dmg: 7,  n: 1, r: 70, spd: 2.6, txt: 'Um machado gira ao seu redor.' },
    { dmg: 7,  n: 2, r: 70, spd: 2.6, txt: '+1 machado.' },
    { dmg: 9,  n: 2, r: 82, spd: 2.8, txt: 'Mais dano e mais alcance.' },
    { dmg: 9,  n: 3, r: 82, spd: 2.8, txt: '+1 machado.' },
    { dmg: 12, n: 4, r: 94, spd: 3.3, txt: 'Quatro machados mais rápidos, e +5 machados em chamas que giram por 2,5 s, somem e voltam 5 s depois.' }
  ] },
  shield: { name: 'Escudo Mágico', lv: [
    { cd: 28, txt: 'Bloqueia 1 ataque inimigo e se quebra. Recarga de 28 s.' },
    { cd: 22, txt: 'Recarga de 22 s.' },
    { cd: 17, txt: 'Recarga de 17 s.' },
    { cd: 13, txt: 'Recarga de 13 s.' },
    { cd: 10, txt: 'Recarga de 10 s (o mínimo).' }
  ] },
  bolt: { name: 'Relâmpago', lv: [
    { dmg: 18, cd: 1.8, n: 1, rad: 38, txt: 'Um raio cai sobre um inimigo próximo.' },
    { dmg: 18, cd: 1.8, n: 2, rad: 38, txt: '+1 raio por disparo.' },
    { dmg: 25, cd: 1.8, n: 2, rad: 40, txt: 'Mais dano.' },
    { dmg: 25, cd: 1.5, n: 3, rad: 44, txt: '+1 raio e recarga mais curta.' },
    { dmg: 32, cd: 1.3, n: 4, rad: 52, txt: 'Quatro raios com área maior.' }
  ] }
};
const PASSIVES = {
  might: { name: 'Fúria',     txt: '+15% de dano em todas as armas e habilidades.' },
  haste: { name: 'Pressa',    txt: 'Habilidades recarregam 8% mais rápido.' },
  boots: { name: 'Botas',     txt: '+8% de velocidade de movimento.' },
  armor: { name: 'Armadura',  txt: 'Reduz em 5 o dano de cada golpe recebido (25 no nível 5).' },
  vigor: { name: 'Vigor',     txt: '+20 de vida máxima e regeneração de 0,4 por segundo.' }
};
const MAXLV = 5, WIN_ROUND = 25, MAXE = 240;
const dn = n => n <= 10 ? n : 10 + (n - 10) * .3;            // dificuldade efetiva (os rounds extras crescem mais devagar)
const isBossRound = n => n >= 5 && (n - 5) % 4 === 0;        // chefão a cada 4 rounds: 3 rounds comuns entre eles

/* custo base: desbloquear custa o valor base; cada nível seguinte custa mais */
const COST_BASE = { sword: 14, whirl: 20, dash: 16, shock: 22, dagger: 22, axe: 26, bolt: 30, shield: 26, rshield: 28, bomb: 28, squire: 30, orb: 30, bigsword: 32, rappelcut: 24, dodge: 22, multishot: 30, might: 24, haste: 24, boots: 20, armor: 22, vigor: 24 };

const ENEMY = {
  skeleton:   { r: 11, hp: 14,   spd: 56,  dmg: 7,  xp: 1, mass: 1 },
  bat:        { r: 8,  hp: 6,    spd: 112, dmg: 5,  xp: 1, mass: .6 },
  goblin:     { r: 11, hp: 26,   spd: 80,  dmg: 9,  xp: 2, mass: 1.2 },
  ogre:       { r: 20, hp: 140,  spd: 44,  dmg: 18, xp: 8, mass: 4 },
  skelarcher: { r: 10, hp: 12,   spd: 54,  dmg: 5,  xp: 2, mass: .9, range: 300, rate: 2.1, adm: 7 },
  gobarcher:  { r: 10, hp: 22,   spd: 74,  dmg: 6,  xp: 3, mass: 1,  range: 300, rate: 1.6, adm: 9 },
  demon:      { r: 12, hp: 34,   spd: 112, dmg: 12, xp: 3, mass: 1.1 },
  mage:       { r: 12, hp: 46,   spd: 34,  dmg: 6,  xp: 6, mass: 1 },
  bomber:     { r: 12, hp: 120,  spd: 45,  dmg: 0,  xp: 5, mass: 1.5 },
  knight:    { r: 30, hp: 1500, spd: 95,  dmg: 24, xp: 60,  mass: 14, boss: true, name: 'Cavaleiro Negro' },
  hound:     { r: 26, hp: 1700, spd: 170, dmg: 22, xp: 70,  mass: 10, boss: true, name: 'Cão Demoníaco' },
  exec:      { r: 34, hp: 2400, spd: 90,  dmg: 28, xp: 80,  mass: 20, boss: true, name: 'Carrasco Maldito' },
  seneschal: { r: 26, hp: 2400, spd: 80,  dmg: 18, xp: 90,  mass: 12, boss: true, name: 'Senescal Corrompido' },
  prince:    { r: 24, hp: 3000, spd: 150, dmg: 22, xp: 100, mass: 10, boss: true, name: 'Príncipe Atormentado' },
  dragon:    { r: 46, hp: 4800, spd: 110, dmg: 34, xp: 140, mass: 30, boss: true, name: 'Dragão da Calamidade' }
};
const BOSS_ORDER = ['knight', 'hound', 'exec', 'seneschal', 'prince', 'dragon'];
const TYPE_COLOR = { skeleton: '#d8dfd0', bat: '#7a4c9a', goblin: '#6a9b45', ogre: '#8b6f5a', skelarcher: '#d8dfd0', gobarcher: '#6a9b45', demon: '#d6502f', mage: '#8a5ad0', bomber: '#6a9b45', knight: '#b0362f', hound: '#c0392b', exec: '#8a7a6a', seneschal: '#9a6ad8', prince: '#c9a23a', dragon: '#c0392b' };
const TABLES = [null,
  { skeleton: 85, bat: 15 },
  { skeleton: 48, bat: 17, goblin: 20, skelarcher: 15 },
  { skeleton: 30, goblin: 22, bat: 12, skelarcher: 14, gobarcher: 12, demon: 10 },
  { skeleton: 24, goblin: 20, bat: 10, skelarcher: 12, gobarcher: 12, demon: 12, ogre: 7, mage: 3 },
  { skeleton: 20, goblin: 18, bat: 8, skelarcher: 12, gobarcher: 12, demon: 12, ogre: 11, mage: 7 },
  { skeleton: 16, goblin: 16, bat: 6, skelarcher: 12, gobarcher: 12, demon: 14, ogre: 14, mage: 10 }
];
const CELL = 48, CS = 96;
const BOMB = { spd: [45, 80, 115, 150, 190], rad: [62, 86, 110, 134, 160], dmg: [12, 22, 34, 48, 64] };

const roundTotal = n => { n = dn(n); return Math.round(18 + 9 * n + 2.6 * n * n); };
