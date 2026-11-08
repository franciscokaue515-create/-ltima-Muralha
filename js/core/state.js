'use strict';
/* ---------- estado ---------- */
const cv = $('cv'), ctx = cv.getContext('2d');
const app = $('app');
const el = {
  hud: $('hud'), pausebtn: $('pausebtn'), lives: $('lives'), en: $('en'), enfill: $('enfill'), hpfill: $('hpfill'), hptext: $('hptext'), blue: $('blue'), pur: $('pur'), purg: $('purg'),
  round: $('round'), rsub: $('rsub'), kills: $('kills'), boss: $('boss'), bossname: $('bossname'), bossfill: $('bossfill'), banner: $('banner'),
  loadout: $('loadout'), skills: $('skills'), screen: $('screen')
};
let W = 0, H = 0, DPR = 1;
let state = 'menu';            // menu | play | pause | shop | over | win
let G = null, S = null, uid = 0, idle = 0, hc = {}, bannerTimer = 0;
const keys = {};
const mouse = { x: 0, y: 0, left: false };
const grid = new Map();

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = app.clientWidth; H = app.clientHeight;
  cv.width = Math.max(1, Math.round(W * DPR)); cv.height = Math.max(1, Math.round(H * DPR));
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
if (window.ResizeObserver) new ResizeObserver(resize).observe(app); else window.addEventListener('resize', resize);
resize();
mouse.x = W / 2 + 120; mouse.y = H / 2;
