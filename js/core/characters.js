'use strict';
/* ---------- personagens: Guerreiro, Mago e Ladra ----------
   Todos usam os mesmos 4 "slots" de habilidade (sword = botão principal, whirl, dash, shock),
   mas cada personagem define o que cada slot faz. CORE guarda as habilidades do personagem atual. */
Object.assign(ICONS, {
  fireball: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 2 2 2 4 1-3 1-6 1-9z"/><circle cx="12" cy="15" r="2.5" fill="#000" fill-opacity=".35"/>',
  iceb: '<path d="M12 1l2 7 7-2-5 5 5 5-7-2-2 7-2-7-7 2 5-5-5-5 7 2z"/>',
  tele: '<path d="M12 2l3 5h-2v6h-2V7H9z"/><path d="M5 17c3-2 11-2 14 0v3c-3 2-11 2-14 0z"/>',
  flame: '<path d="M2 12c4-4 8-4 10-2 2-5 6-7 10-6-2 3-1 6-4 8 2 0 3 1 4 2-4 3-8 2-10 1-3 3-7 3-10-3z"/>',
  bow: '<path d="M6 3c8 2 12 7 12 9s-4 7-12 9l1-2c6-1 9-5 9-7s-3-6-9-7z"/><path d="M4 11h15v2H4z"/>',
  net: '<path d="M3 3h18v18H3zm2 2v14h14V5z" fill-rule="evenodd"/><path d="M11 3h2v18h-2zM3 11h18v2H3z"/>',
  rope: '<path d="M4 20l6-6 2 2-6 6z"/><path d="M13 3l8 8-3 3-8-8z"/><circle cx="18" cy="6" r="2.5"/>',
  rain: '<path d="M6 2l1 8H5zM12 4l1 8h-2zM18 2l1 8h-2z"/><path d="M5 14h14l-7 8z"/>',
  rshield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M12 7l4 4-4 4-4-4z" fill="#000" fill-opacity=".35"/>',
  bomb: '<circle cx="11" cy="14" r="7"/><path d="M15 6l3-3 3 3-3 3z"/><path d="M13 8l3-2 1 2-3 2z"/>',
  squire: '<path d="M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/><path d="M5 22v-6a7 7 0 0 1 14 0v6z"/>',
  orb: '<circle cx="12" cy="12" r="5"/><path d="M13 1L6 12h5l-1 6 7-11h-5z" fill="#000" fill-opacity=".35"/>',
  bigsword: '<path d="M12 1l3 13h-6z"/><path d="M6 14h12v2H6z"/><path d="M11 16h2v6h-2z"/>',
  rappelcut: '<path d="M3 21L21 3l-2-1L2 19z"/><path d="M14 4l6 6-2 2-6-6z"/>',
  dodge: '<path d="M4 4l16 8-16 8 4-8z"/>',
  multishot: '<path d="M12 2v7M12 15v7M2 12h7M15 12h7M5 5l5 5M14 14l5 5M19 5l-5 5M10 14l-5 5" stroke="currentColor" stroke-width="2" fill="none"/>'
});

const CORE_BY = {};
CORE_BY.warrior = Object.assign({}, CORE);

/* ---------------- MAGO ---------------- */
CORE_BY.mage = {
  sword: { name: 'Bola de Fogo', key: 'Esq', ic: 'fireball', lv: [
    { dmg: 14, cd: .75, rad: 38, burn: 3, spd: 520, range: 640, txt: 'Lança uma bola de fogo de longo alcance que explode em área pequena e incendeia.' },
    { dmg: 14, cd: .62, rad: 42, burn: 3, spd: 540, range: 680, txt: 'Dispara mais rápido, com alcance maior.' },
    { dmg: 20, cd: .62, rad: 46, burn: 4, spd: 540, range: 700, txt: 'Mais dano e queimadura mais forte.' },
    { dmg: 20, cd: .5,  rad: 52, burn: 5, spd: 580, range: 740, txt: 'Explosão maior e disparo mais rápido.' },
    { dmg: 28, cd: .45, rad: 62, burn: 7, spd: 620, range: 800, txt: 'Bola de fogo devastadora: explosão grande e queimadura forte.' }
  ] },
  whirl: { name: 'Bomba de Gelo', key: 'Dir', ic: 'iceb', lv: [
    { dmg: 12, rad: 90,  frz: 2, big: false, cd: 24, txt: 'Projétil de gelo que explode em área e congela inimigos menores por 2 s (os maiores só ficam lentos). Recarga de 24 s.' },
    { dmg: 16, rad: 100, frz: 2, big: false, cd: 22, txt: 'Mais dano, área maior e recarga de 22 s.' },
    { dmg: 20, rad: 110, frz: 2, big: false, cd: 20, txt: 'Mais dano e recarga de 20 s.' },
    { dmg: 26, rad: 125, frz: 2, big: true,  cd: 18, txt: 'Congela também os inimigos grandes. Recarga de 18 s.' },
    { dmg: 36, rad: 145, frz: 2.5, big: true, cd: 15, txt: 'Explosão enorme, congela por 2,5 s. Recarga de 15 s.' }
  ] },
  dash: { name: 'Teletransporte', key: 'Espaço', ic: 'tele', lv: [
    { cd: 30, boom: 0,  rad: 0,   inv: false, txt: 'Fica parado por 1,5 s e então se teletransporta para onde está o mouse. Recarga de 30 s.' },
    { cd: 26, boom: 0,  rad: 0,   inv: false, txt: 'Recarga de 26 s.' },
    { cd: 24, boom: 28, rad: 110, inv: false, txt: 'Ao chegar, uma explosão arcana fere quem estiver perto. Recarga de 24 s.' },
    { cd: 21, boom: 45, rad: 130, inv: true,  txt: 'Fica invulnerável enquanto se concentra. Explosão maior. Recarga de 21 s.' },
    { cd: 18, boom: 70, rad: 160, inv: true,  txt: 'Explosão arcana enorme na chegada. Recarga de 18 s.' }
  ] },
  shock: { name: 'Lança-chamas', key: 'E', ic: 'flame', lv: [
    { dmg: 6,  rng: 170, arc: .9,  burn: 4, cd: 60, txt: 'Por 10 s a Bola de Fogo vira um grande cone de fogo contínuo, com mais dano, que incendeia. Recarga de 60 s (conta a partir do uso).' },
    { dmg: 8,  rng: 190, arc: .95, burn: 4, cd: 56, txt: 'Mais dano e alcance. Recarga de 56 s.' },
    { dmg: 10, rng: 210, arc: 1.0, burn: 5, cd: 52, txt: 'Mais dano. Recarga de 52 s.' },
    { dmg: 13, rng: 235, arc: 1.1, burn: 6, cd: 48, txt: 'Cone mais largo e comprido. Recarga de 48 s.' },
    { dmg: 17, rng: 270, arc: 1.2, burn: 8, cd: 42, txt: 'Fogo devastador, cone enorme. Recarga de 42 s.' }
  ] }
};

/* ---------------- LADRA ---------------- */
CORE_BY.rogue = {
  sword: { name: 'Flechas', key: 'Esq', ic: 'bow', lv: [
    { dmg: 12, cd: .55, n: 1, pierce: 0, txt: 'Dispara flechas na direção do mouse, com alcance um pouco maior que o dos arqueiros inimigos.' },
    { dmg: 12, cd: .45, n: 1, pierce: 0, txt: 'Atira mais rápido.' },
    { dmg: 17, cd: .45, n: 1, pierce: 0, txt: 'Mais dano.' },
    { dmg: 17, cd: .42, n: 2, pierce: 0, txt: 'Atira duas flechas por disparo.' },
    { dmg: 23, cd: .38, n: 2, pierce: 2, txt: 'Mais dano e as flechas atravessam até 3 inimigos.' }
  ] },
  whirl: { name: 'Trapaceira', key: 'Dir', ic: 'net', lv: [
    { dmg: 30, rad: 62,  n: 1, cd: 14, txt: 'Joga uma rede no chão. 1,5 s depois de um inimigo pisar, todos na área sofrem dano e ficam atordoados por 2 s. Recarga de 14 s.' },
    { dmg: 42, rad: 72,  n: 1, cd: 13, txt: 'Mais dano e área maior. Recarga de 13 s.' },
    { dmg: 55, rad: 82,  n: 1, cd: 12, txt: 'Mais dano. Recarga de 12 s.' },
    { dmg: 70, rad: 92,  n: 2, cd: 11, txt: 'Joga duas redes de uma vez. Recarga de 11 s.' },
    { dmg: 95, rad: 105, n: 2, cd: 10, txt: 'Redes enormes e muito mais dano. Recarga de 10 s.' }
  ] },
  dash: { name: 'Rapel', key: 'Espaço', ic: 'rope', lv: [
    { rng: 260, cd: 22, txt: 'Lança uma corda na direção do mouse. Se ela prender numa estrutura, você é puxada até lá sem sofrer dano de nenhum inimigo. Alcance 260. Recarga de 22 s.' },
    { rng: 340, cd: 20, txt: 'Alcance 340. Recarga de 20 s.' },
    { rng: 430, cd: 18, txt: 'Alcance 430. Recarga de 18 s.' },
    { rng: 540, cd: 16, txt: 'Alcance 540. Recarga de 16 s.' },
    { rng: 99999, cd: 14, txt: 'Alcance global: prende em qualquer estrutura do mapa. Recarga de 14 s.' }
  ] },
  shock: { name: 'Chuva de Flechas', key: 'E', ic: 'rain', lv: [
    { dmg: 25, rad: 90,  waves: 1, burn: 0, cd: 12, txt: 'Lança flechas para o alto, marcando a área do mouse. 1 s depois elas caem causando dano em área. Recarga de 12 s.' },
    { dmg: 32, rad: 100, waves: 1, burn: 0, cd: 11, txt: 'Mais dano e área maior. Recarga de 11 s.' },
    { dmg: 40, rad: 110, waves: 1, burn: 4, cd: 10, txt: 'As flechas incendeiam os inimigos. Recarga de 10 s.' },
    { dmg: 50, rad: 125, waves: 1, burn: 5, cd: 9,  txt: 'Mais dano e área maior. Recarga de 9 s.' },
    { dmg: 62, rad: 140, waves: 4, burn: 6, cd: 8,  txt: 'Quatro ondas de flechas caem em sequência. Recarga de 8 s.' }
  ] }
};

/* ---------------- armas novas ---------------- */
Object.assign(WEAPONS, {
  rshield: { name: 'Escudo Reflexo', lv: [
    { cd: 30, txt: 'Bloqueia 1 ataque e se quebra. Se o ataque for um projétil, ele volta contra quem atirou, com mais dano. Recarga de 30 s.' },
    { cd: 24, txt: 'Recarga de 24 s.' },
    { cd: 19, txt: 'Recarga de 19 s.' },
    { cd: 15, txt: 'Recarga de 15 s.' },
    { cd: 12, txt: 'Recarga de 12 s (o mínimo).' }
  ] },
  bomb: { name: 'Bomba', lv: [
    { dmg: 60,  rad: 90,  cd: 28, txt: 'Planta uma bomba onde você está; ela explode em 1,8 s causando dano em área. Recarga de 28 s.' },
    { dmg: 85,  rad: 105, cd: 25, txt: 'Mais dano e área. Recarga de 25 s.' },
    { dmg: 115, rad: 120, cd: 22, txt: 'Mais dano e área. Recarga de 22 s.' },
    { dmg: 150, rad: 135, cd: 18, txt: 'Mais dano e área. Recarga de 18 s.' },
    { dmg: 210, rad: 155, cd: 15, txt: 'Explosão devastadora. Recarga de 15 s (o mínimo).' }
  ] },
  squire: { name: 'Escudeiro', lv: [
    { dmg: 18, n: 1, cd: 2.2, txt: 'Um escudeiro avança num inimigo próximo, causa dano e volta. Não pode ser atacado nem bloqueia o caminho.' },
    { dmg: 24, n: 1, cd: 1.9, txt: 'Mais dano e mais rápido.' },
    { dmg: 24, n: 2, cd: 1.9, txt: '+1 escudeiro.' },
    { dmg: 33, n: 2, cd: 1.6, txt: 'Mais dano e mais rápido.' },
    { dmg: 44, n: 3, cd: 1.4, txt: 'Três escudeiros, mais fortes e rápidos.' }
  ] },
  orb: { name: 'Esfera Elétrica', lv: [
    { dmg: 14, n: 1, cd: 2.0, txt: 'Uma esfera orbita você e lança relâmpagos no inimigo mais próximo.' },
    { dmg: 18, n: 1, cd: 1.7, txt: 'Mais dano e mais rápida.' },
    { dmg: 18, n: 2, cd: 1.7, txt: '+1 esfera.' },
    { dmg: 24, n: 2, cd: 1.4, txt: 'Mais dano e mais rápida.' },
    { dmg: 30, n: 3, cd: 1.2, txt: 'Três esferas, mais fortes e rápidas.' }
  ] },
  bigsword: { name: 'Grande Espada Mágica', lv: [
    { dmg: 12, len: 80,  spd: 2.4, fire: false, txt: 'Uma enorme espada mágica gira 360° ao seu redor (só existe uma).' },
    { dmg: 16, len: 90,  spd: 3.2, fire: false, txt: 'Gira mais rápido e causa mais dano.' },
    { dmg: 22, len: 100, spd: 4.0, fire: false, txt: 'Gira mais rápido e causa mais dano.' },
    { dmg: 28, len: 112, spd: 5.0, fire: false, txt: 'Gira ainda mais rápido, com mais dano.' },
    { dmg: 34, len: 126, spd: 6.2, fire: true,  txt: 'Fogo negro em chamas: giro velocíssimo, dano de fogo e queimadura.' }
  ] },
  rappelcut: { name: 'Rapel Cortante', lv: [
    { dmg: 25,  txt: 'O Rapel passa a ferir os inimigos que estiverem no caminho da puxada.' },
    { dmg: 40,  txt: 'Mais dano no caminho.' },
    { dmg: 65,  txt: 'Mais dano no caminho.' },
    { dmg: 100, txt: 'Muito mais dano no caminho.' },
    { dmg: 160, txt: 'Dano enorme em tudo que a corda atravessa.' }
  ] },
  dodge: { name: 'Esquiva', lv: [
    { ch: .10, txt: 'Chance de 10% de evitar o dano de um ataque.' },
    { ch: .19, txt: 'Chance de 19%.' },
    { ch: .28, txt: 'Chance de 28%.' },
    { ch: .37, txt: 'Chance de 37%.' },
    { ch: .46, txt: 'Chance de 46% de evitar o dano (o máximo).' }
  ] },
  multishot: { name: 'Múltiplos Disparos', lv: [
    { dmg: 10, n: 10, cd: 7.0, txt: 'Dispara 10 flechas elétricas em 360° que deixam os inimigos lentos.' },
    { dmg: 12, n: 13, cd: 6.4, txt: '13 flechas, um pouco mais rápido.' },
    { dmg: 14, n: 16, cd: 5.8, txt: '16 flechas.' },
    { dmg: 18, n: 20, cd: 5.2, txt: '20 flechas e mais dano.' },
    { dmg: 22, n: 25, cd: 4.6, txt: '25 flechas elétricas.' }
  ] }
});

const CHARS = {
  warrior: { name: 'O Guerreiro', desc: 'Corpo a corpo resistente. Espada em arco com Onda de Energia, giro devastador e onda de choque.',
    skills: ['Espada', 'Giro Devastador', 'Avanço Fugaz', 'Onda de Choque'], weapons: ['axe', 'rshield', 'bomb', 'squire'], hp: 100 },
  mage: { name: 'O Mago', desc: 'Dano em área à distância. Fogo, gelo, teletransporte e um lança-chamas.',
    skills: ['Bola de Fogo', 'Bomba de Gelo', 'Teletransporte', 'Lança-chamas'], weapons: ['bolt', 'shield', 'orb', 'bigsword'], hp: 85 },
  rogue: { name: 'A Ladra', desc: 'Ágil e precisa. Flechas, armadilhas, corda de rapel e chuva de flechas.',
    skills: ['Flechas', 'Trapaceira', 'Rapel', 'Chuva de Flechas'], weapons: ['dagger', 'rappelcut', 'dodge', 'multishot'], hp: 90 }
};
function applyChar(c) { for (const k of SKILL_ORDER) CORE[k] = CORE_BY[c][k]; }
