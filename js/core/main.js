'use strict';
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 20); last = now;
  if (state === 'play') update(dt);
  else if (state === 'menu') { idle += dt; G.cam.x = Math.sin(idle * .08) * 800; G.cam.y = Math.sin(idle * .17) * 300; clampCam(G.cam); }
  MU.mode = musicMode();
  const dk = (state === 'pause' || state === 'shop') ? .5 : 1; if (dk !== AU.duck) { AU.duck = dk; auVol(); }
  draw();
  if (state !== 'menu' && !el.hud.hidden) updateHud();
  requestAnimationFrame(frame);
}

CITY = buildCity();
refreshKeyLabels();
newGame();
showMenu();
requestAnimationFrame(frame);
