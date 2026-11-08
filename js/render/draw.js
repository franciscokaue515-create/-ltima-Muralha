'use strict';
/* ---------- desenho ---------- */
function dot(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

function drawGround(cx, cy) {
  ctx.fillStyle = '#0b0e11'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(CITY.canvas, W / 2 - cx + MAP.x0 - WALL, H / 2 - cy + MAP.y0 - WALL);
  ctx.fillStyle = 'rgba(10,16,40,' + lerp(.5, .04, G.dawn) + ')'; ctx.fillRect(0, 0, W, H);
}

function drawPlayer(x, y) {
  const p = G.p;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 8, 14, 7, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.rotate(p.face);
  if (p.iframes > 0 && Math.floor(G.t * 20) % 2) ctx.globalAlpha = .5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#d3dce4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, 11); ctx.lineTo(27, 7); ctx.stroke();
  ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, 11); ctx.lineTo(5, 12); ctx.stroke();
  ctx.fillStyle = '#d9a93a'; ctx.strokeStyle = '#14233d'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(5, -12, 9, 6.5, -.15, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2f5fa8'; ctx.beginPath(); ctx.ellipse(5, -12, 4.5, 3, -.15, 0, TAU); ctx.fill();
  ctx.fillStyle = p.hurt > 0 ? '#e2574c' : '#2f5fa8'; ctx.strokeStyle = '#14233d';
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#d9a93a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
  ctx.fillStyle = '#b0362f'; ctx.beginPath(); ctx.ellipse(-8, 0, 6, 3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#aeb9c4'; ctx.strokeStyle = '#1b2430'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(1, 0, 8.5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#1b2430'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(5.5, -4); ctx.lineTo(5.5, 4); ctx.stroke();
  ctx.restore();
  if (p.burn > 0) {
    for (let i = 0; i < 4; i++) {
      const fl = Math.sin(G.t * 16 + i * 2);
      ctx.fillStyle = 'rgba(255,' + (130 + fl * 50 | 0) + ',40,.8)';
      ctx.beginPath(); ctx.arc(x + Math.cos(i * 1.6 + G.t * 3) * 11, y - 6 - i * 3 - fl * 3, 4.5 - i * .6, 0, TAU); ctx.fill();
    }
  }
  const w = 32, hx = x - w / 2, hy = y + 20;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(hx - 1, hy - 1, w + 2, 6);
  ctx.fillStyle = '#b0362f'; ctx.fillRect(hx, hy, w * clamp(p.hp / p.maxhp, 0, 1), 4);
}

function tri(x1, y1, x2, y2, x3, y3) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function drawBow(r, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(r * .95, 0, r * .95, -1.15, 1.15); ctx.stroke();
  ctx.strokeStyle = 'rgba(230,230,220,.7)'; ctx.lineWidth = 1; ctx.beginPath();
  ctx.moveTo(r * .95 + Math.cos(-1.15) * r * .95, Math.sin(-1.15) * r * .95); ctx.lineTo(r * .95 + Math.cos(1.15) * r * .95, Math.sin(1.15) * r * .95); ctx.stroke();
}

function drawEnemy(e, x, y) {
  const r = e.r, f = e.flash > 0;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y + r * .55, r * .95, r * .5, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.rotate(e.face);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 1.5; ctx.strokeStyle = '#10161a';
  switch (e.type) {
    case 'skeleton': case 'skelarcher':
      if (e.type === 'skeleton') {
        ctx.strokeStyle = f ? '#fff' : '#cdd5c6'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(r * .2, -r * .85); ctx.lineTo(r * 1.25, -r * .7); ctx.moveTo(r * .2, r * .85); ctx.lineTo(r * 1.25, r * .7); ctx.stroke();
      } else drawBow(r, '#8a6a3a');
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#10161a'; ctx.fillStyle = f ? '#fff' : '#d8dfd0';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      dot(r * .45, -r * .34, r * .2, '#10161a'); dot(r * .45, r * .34, r * .2, '#10161a');
      ctx.strokeStyle = 'rgba(16,22,26,.4)'; ctx.beginPath();
      ctx.moveTo(-r * .7, -r * .35); ctx.lineTo(-r * .1, -r * .35); ctx.moveTo(-r * .75, 0); ctx.lineTo(-r * .1, 0); ctx.moveTo(-r * .7, r * .35); ctx.lineTo(-r * .1, r * .35); ctx.stroke();
      break;
    case 'bat': {
      const w = Math.sin(G.t * 22 + e.ph) * .5 + .5;
      ctx.fillStyle = f ? '#fff' : '#5d3a78';
      for (const sd of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, sd * 2);
        ctx.quadraticCurveTo(-r * .5, sd * r * (1.5 + w), r * .9, sd * r * (2 + w * .6));
        ctx.quadraticCurveTo(r * .3, sd * r * .9, r * .4, sd * 2); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = f ? '#fff' : '#7a4c9a'; ctx.beginPath(); ctx.ellipse(0, 0, r * .9, r * .65, 0, 0, TAU); ctx.fill(); ctx.stroke();
      dot(r * .5, -r * .22, 1.4, '#ff5a4a'); dot(r * .5, r * .22, 1.4, '#ff5a4a');
      break; }
    case 'goblin': case 'gobarcher':
      ctx.fillStyle = f ? '#fff' : '#6a9b45';
      tri(-2, -r * .8, -r * .5, -r * 1.55, r * .35, -r * .85);
      tri(-2, r * .8, -r * .5, r * 1.55, r * .35, r * .85);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      dot(r * .5, -r * .36, 2, '#f1d84a'); dot(r * .5, r * .36, 2, '#f1d84a');
      if (e.type === 'goblin') { ctx.strokeStyle = '#c9d2da'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(r * .6, r * .9); ctx.lineTo(r * 1.5, r * .6); ctx.stroke(); }
      else drawBow(r, '#7a5a2a');
      break;
    case 'bomber': {
      const en = e.en || 1, pulse = .5 + .5 * Math.sin(G.t * (8 + en * 3)), hot = e.fuse > 0 && Math.floor(G.t * 20) % 2;
      if (en > 1 || e.fuse > 0) dot(0, 0, r * (1.5 + en * .22), 'rgba(120,190,255,' + (.10 + .04 * en) + ')');
      ctx.fillStyle = f ? '#fff' : hot ? '#ff6a4a' : '#6a9b45';
      tri(-2, -r * .8, -r * .5, -r * 1.55, r * .35, -r * .85);
      tri(-2, r * .8, -r * .5, r * 1.55, r * .35, r * .85);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      dot(r * .5, -r * .36, 2, '#f1d84a'); dot(r * .5, r * .36, 2, '#f1d84a');
      ctx.save(); ctx.rotate(-e.face);
      ctx.strokeStyle = '#cfd8e0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -r * .4); ctx.lineTo(0, -r * 2.6); ctx.moveTo(-4, -r * 2.2); ctx.lineTo(0, -r * 2.7); ctx.lineTo(4, -r * 2.2); ctx.stroke();
      dot(0, -r * 2.75, 2.5 + en * .5, en > 1 ? '#bfe0ff' : '#e8eef2');
      if (en > 1) {
        ctx.strokeStyle = 'rgba(170,215,255,' + (.5 + .5 * pulse) + ')'; ctx.lineWidth = 1.5; ctx.beginPath();
        for (let i = 0; i < en; i++) { const a = G.t * 9 + i * 1.7 + e.ph; ctx.moveTo(0, -r * 2.75); ctx.lineTo(Math.cos(a) * (8 + en * 2), -r * 2.75 + Math.sin(a) * (8 + en * 2)); }
        ctx.stroke();
      }
      for (let i = 0; i < 5; i++) dot((i - 2) * 6, r + 9, 2, i < en ? '#7fc4ff' : 'rgba(255,255,255,.2)');
      ctx.restore();
      break; }
    case 'ogre':
      ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(r * .5, r * .95); ctx.lineTo(r * 1.65, r * .55); ctx.stroke();
      dot(r * 1.7, r * .52, 6, '#6b4c38');
      ctx.lineWidth = 2; ctx.strokeStyle = '#10161a'; ctx.fillStyle = f ? '#fff' : '#8b6f5a';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#a38468'; ctx.beginPath(); ctx.ellipse(-r * .2, 0, r * .55, r * .7, 0, 0, TAU); ctx.fill();
      dot(r * .55, -r * .3, 2.4, '#1a1008'); dot(r * .55, r * .3, 2.4, '#1a1008');
      break;
    case 'demon': {
      for (let i = 0; i < 3; i++) { const fl = Math.sin(G.t * 18 + i * 2 + e.ph); dot(-r * (1.1 + i * .5), fl * 2, r * (.5 - i * .1), 'rgba(255,' + (120 + i * 40) + ',40,' + (.8 - i * .2) + ')'); }
      ctx.fillStyle = f ? '#fff' : '#3a1a14';
      tri(r * .2, -r * .6, r * .9, -r * 1.5, r * .8, -r * .3);
      tri(r * .2, r * .6, r * .9, r * 1.5, r * .8, r * .3);
      ctx.fillStyle = f ? '#fff' : '#c2432f';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      dot(r * .5, -r * .3, 2.2, '#ffd23a'); dot(r * .5, r * .3, 2.2, '#ffd23a');
      break; }
    case 'mage': {
      const pulse = .5 + Math.sin(G.t * 5 + e.ph) * .5;
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r * .1, r * .95); ctx.lineTo(r * 1.5, r * .95); ctx.stroke();
      dot(r * 1.6, r * .95, 9, 'rgba(182,90,255,' + (.18 + pulse * .2) + ')'); dot(r * 1.6, r * .95, 4.2, '#c78bff');
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#10161a'; ctx.fillStyle = f ? '#fff' : '#4b2f7a';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#2a1a48'; ctx.beginPath(); ctx.arc(r * .1, 0, r * .62, 0, TAU); ctx.fill();
      dot(r * .45, -r * .2, 2, '#ff6ad5'); dot(r * .45, r * .2, 2, '#ff6ad5');
      break; }
    case 'knight': {
      const pulse = .5 + Math.sin(G.t * 4) * .5;
      ctx.strokeStyle = 'rgba(176,54,47,' + (.25 + pulse * .25) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r + 6 + pulse * 4, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#c9d2da'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(r * .7, r * .9); ctx.lineTo(r * 2.1, r * .75); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = '#0c0f14'; ctx.fillStyle = f ? '#fff' : '#2c313d';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#58606e';
      ctx.beginPath(); ctx.arc(0, -r * .85, r * .36, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, r * .85, r * .36, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#b0362f'; ctx.beginPath(); ctx.ellipse(-r * .55, 0, r * .55, r * .22, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = f ? '#fff' : '#3c4352'; ctx.beginPath(); ctx.arc(r * .1, 0, r * .55, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r * .5, -r * .22); ctx.lineTo(r * .5, r * .22); ctx.stroke();
      break; }
    case 'hound': {
      ctx.lineWidth = 2; ctx.strokeStyle = '#150606'; ctx.fillStyle = f ? '#fff' : '#5a1a1a';
      ctx.beginPath(); ctx.ellipse(-r * .1, 0, r * 1.15, r * .8, 0, 0, TAU); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 5; i++) { const fl = Math.sin(G.t * 14 + i * 1.7); dot(-r * .7 + i * r * .3, fl * r * .12, r * (.28 + .05 * fl), 'rgba(255,' + (120 + fl * 50 | 0) + ',40,.85)'); }
      ctx.fillStyle = f ? '#fff' : '#3a0f0f'; tri(r * .8, -r * .35, r * .55, -r * 1.0, r * 1.15, -r * .55); tri(r * .8, r * .35, r * .55, r * 1.0, r * 1.15, r * .55);
      ctx.fillStyle = f ? '#fff' : '#7a2424'; ctx.beginPath(); ctx.arc(r * 1.05, 0, r * .5, 0, TAU); ctx.fill(); ctx.stroke();
      dot(r * 1.28, -r * .2, 3, '#ffc23a'); dot(r * 1.28, r * .2, 3, '#ffc23a');
      break; }
    case 'exec': {
      ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(r * .4, r * .95); ctx.lineTo(r * 1.7, r * .95); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = '#10161a'; ctx.fillStyle = '#c9d2da';
      ctx.beginPath(); ctx.moveTo(r * 1.45, r * .95); ctx.quadraticCurveTo(r * 1.9, r * .1, r * 2.35, r * .85); ctx.quadraticCurveTo(r * 2.0, r * 1.2, r * 1.45, r * 1.15); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#463a32'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#6a5f55'; ctx.beginPath(); ctx.arc(0, -r * .85, r * .4, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, r * .85, r * .4, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#17120f'; ctx.beginPath(); ctx.arc(r * .15, 0, r * .55, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff3a2a'; ctx.fillRect(r * .5, -r * .22, 3, 3); ctx.fillRect(r * .5, r * .12, 3, 3);
      break; }
    case 'seneschal': {
      ctx.lineWidth = 2; ctx.strokeStyle = '#10161a'; ctx.fillStyle = f ? '#fff' : '#3b2a5e';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#d9a93a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * .9, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(182,140,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r * .15, 0, r * .62, 0, TAU); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#d8d0b8'; ctx.beginPath(); ctx.arc(r * .15, 0, r * .42, 0, TAU); ctx.fill();
      dot(r * .4, -r * .14, 2.2, '#b05aff'); dot(r * .4, r * .14, 2.2, '#b05aff');
      for (let i = 0; i < 3; i++) { const ang = G.t * 2 + i * 2.09; dot(Math.cos(ang) * r * 1.25, Math.sin(ang) * r * 1.25, 4, '#d9a93a'); }
      break; }
    case 'prince': {
      ctx.lineWidth = 2; ctx.strokeStyle = '#10161a'; ctx.fillStyle = f ? '#fff' : '#8a1f2a';
      tri(-r * .2, -r * .9, -r * 1.7, 0, -r * .2, r * .9);
      ctx.strokeStyle = '#dfe7ee'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(r * .5, r * .75); ctx.lineTo(r * 2, r * .5); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = '#d9a93a'; ctx.fillStyle = f ? '#fff' : '#1f2b4d';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#e8d9c0'; ctx.strokeStyle = '#10161a'; ctx.beginPath(); ctx.arc(r * .1, 0, r * .45, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d9a93a'; for (let i = 0; i < 5; i++) { const ang = -1.1 + i * .55; tri(r * .1 + Math.cos(ang) * r * .38, Math.sin(ang) * r * .38, r * .1 + Math.cos(ang) * r * .75, Math.sin(ang) * r * .75, r * .1 + Math.cos(ang + .25) * r * .38, Math.sin(ang + .25) * r * .38); }
      dot(r * .35, -r * .12, 1.8, '#7a1a1a'); dot(r * .35, r * .12, 1.8, '#7a1a1a');
      break; }
    case 'dragon': {
      const w = Math.sin(G.t * 5);
      ctx.lineWidth = 2; ctx.strokeStyle = '#1a0808'; ctx.fillStyle = f ? '#fff' : '#5b1f1f';
      for (const sd of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, sd * r * .4); ctx.lineTo(-r * .5, sd * r * (1.9 + w * .25)); ctx.lineTo(-r * 1.5, sd * r * (1.45 + w * .2)); ctx.lineTo(-r * 1.1, sd * r * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = f ? '#fff' : '#7a2a2a'; ctx.beginPath(); ctx.moveTo(-r * .8, -r * .3); ctx.lineTo(-r * 2.1, 0); ctx.lineTo(-r * .8, r * .3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#8a2c2c'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * .72, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f ? '#fff' : '#a33636'; ctx.beginPath(); ctx.ellipse(r * 1.05, 0, r * .55, r * .38, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#2a1414'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r * .85, -r * .3); ctx.lineTo(r * .4, -r * .8); ctx.moveTo(r * .85, r * .3); ctx.lineTo(r * .4, r * .8); ctx.stroke();
      dot(r * 1.2, -r * .16, 3.4, '#ffd24a'); dot(r * 1.2, r * .16, 3.4, '#ffd24a');
      break; }
  }
  ctx.restore();
  if (e.carry) {
    const pu = .5 + Math.sin(G.t * 6) * .5;
    ctx.strokeStyle = 'rgba(182,140,255,' + (.5 + pu * .4) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 6 + pu * 2, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#b68cff'; ctx.beginPath(); ctx.moveTo(x, y - r - 20); ctx.lineTo(x + 5, y - r - 14); ctx.lineTo(x, y - r - 6); ctx.lineTo(x - 5, y - r - 14); ctx.closePath(); ctx.fill();
  }
  if (e.stun > 0) {
    for (let i = 0; i < 3; i++) { const ang = G.t * 6 + i * 2.09; dot(x + Math.cos(ang) * (r * .7 + 4), y - r - 8 + Math.sin(ang) * 3, 2.6, '#ffe36a'); }
  }
  if (e.hp < e.maxhp && !e.boss) {
    const w = r * 1.8;
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x - w / 2, y - r - 8, w, 3);
    ctx.fillStyle = '#c9524a'; ctx.fillRect(x - w / 2, y - r - 8, w * clamp(e.hp / e.maxhp, 0, 1), 3);
  }
}

function drawGem(g, x, y) {
  if (g.kind === 'up') {
    const pulse = .5 + Math.sin(G.t * 6 + x * .05) * .5, s = 9 + pulse * 1.2;
    ctx.fillStyle = 'rgba(182,140,255,' + (.12 + pulse * .12) + ')'; ctx.beginPath(); ctx.arc(x, y, s + 9, 0, TAU); ctx.fill();
    ctx.fillStyle = '#b68cff';
    ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .8, y - s * .15); ctx.lineTo(x + s * .5, y + s * .85); ctx.lineTo(x - s * .5, y + s * .85); ctx.lineTo(x - s * .8, y - s * .15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .8, y - s * .15); ctx.lineTo(x, y); ctx.lineTo(x - s * .8, y - s * .15); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#4b2a8a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .8, y - s * .15); ctx.lineTo(x + s * .5, y + s * .85); ctx.lineTo(x - s * .5, y + s * .85); ctx.lineTo(x - s * .8, y - s * .15); ctx.closePath(); ctx.stroke();
    return;
  }
  const big = g.v >= 8, mid = g.v >= 2, s = big ? 7.5 : mid ? 6 : 4.6;
  ctx.fillStyle = big ? '#2f7fe0' : '#4da3ff';
  ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .75, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * .75, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.42)';
  ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .75, y); ctx.lineTo(x, y - s * .1); ctx.closePath(); ctx.fill();
}

function drawHazards(X, Y) {
  for (const h of G.hz) {
    const x = X(h.x), y = Y(h.y), warn = h.t > 0, prog = warn ? 1 - h.t / h.max : 1, col = h.col;
    const fillA = warn ? .08 + .27 * prog : .38 + Math.sin(G.t * 30) * .06;
    ctx.fillStyle = 'rgba(' + col + ',' + fillA + ')'; ctx.strokeStyle = 'rgba(' + col + ',.85)'; ctx.lineWidth = 2;
    if (h.shape === 'circle') {
      ctx.beginPath(); ctx.arc(x, y, h.r, 0, TAU); ctx.fill(); ctx.stroke();
      if (warn) { ctx.strokeStyle = 'rgba(' + col + ',.5)'; ctx.beginPath(); ctx.arc(x, y, h.r * prog, 0, TAU); ctx.stroke(); }
      if (h.spin) { ctx.strokeStyle = 'rgba(240,220,200,.7)'; ctx.lineWidth = 6; ctx.beginPath(); const sa = G.t * 12; ctx.arc(x, y, h.r * .85, sa, sa + 1.2); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, h.r * .85, sa + Math.PI, sa + Math.PI + 1.2); ctx.stroke(); }
      if (h.meteor && warn && h.t < .3) {
        const q = h.t / .3, mx = x + q * 150, my = y - q * 420;
        ctx.strokeStyle = 'rgba(255,170,60,.7)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(mx + 40, my - 120); ctx.lineTo(mx, my); ctx.stroke();
        dot(mx, my, 14, '#ffb340'); dot(mx, my, 7, '#fff2c0');
      }
    } else if (h.shape === 'cone') {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, h.r, h.a - h.arc / 2, h.a + h.arc / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (h.dps && !warn) for (let i = 0; i < 26; i++) {
        const q = (i * .137 + G.t * 1.6) % 1, aa = h.a + (((i * 7919) % 100) / 100 - .5) * h.arc * .9, rr = q * h.r;
        dot(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr, 6 + q * 16, 'rgba(255,' + (190 - q * 110 | 0) + ',50,' + (.5 - q * .35) + ')');
      }
    } else {
      ctx.save(); ctx.translate(x, y); ctx.rotate(h.a); ctx.fillRect(0, -h.w / 2, h.len, h.w); ctx.strokeRect(0, -h.w / 2, h.len, h.w); ctx.restore();
    }
  }
}
function drawEnemyShots(X, Y) {
  for (const s of G.es) {
    const x = X(s.x), y = Y(s.y);
    if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
    switch (s.kind) {
      case 'arrow':
        ctx.save(); ctx.translate(x, y); ctx.rotate(s.a); ctx.strokeStyle = '#d8c9a0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(8, 0); ctx.stroke();
        ctx.fillStyle = '#c9d2da'; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(6, -3); ctx.lineTo(6, 3); ctx.closePath(); ctx.fill(); ctx.restore(); break;
      case 'skull': {
        const near = s.maxD && s.d > s.maxD - 50, bl = near && Math.floor(G.t * 16) % 2;
        dot(x, y, 11, 'rgba(182,90,255,.2)'); dot(x, y, 7, bl ? '#ff8a7c' : '#e8e4d8'); dot(x - 2.5, y - 1, 1.6, '#1a1020'); dot(x + 2.5, y - 1, 1.6, '#1a1020'); break; }
      case 'fire': dot(x, y, 14, 'rgba(255,120,30,.25)'); dot(x, y, 8, '#ff8a2a'); dot(x, y, 4, '#ffe08a'); break;
      case 'dagger':
        ctx.save(); ctx.translate(x, y); ctx.rotate(s.a); ctx.fillStyle = '#b8c4e8'; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -3); ctx.lineTo(-5, 3); ctx.closePath(); ctx.fill(); ctx.restore(); break;
      case 'axe':
        ctx.save(); ctx.translate(x, y); ctx.rotate(s.rot); ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
        ctx.fillStyle = '#cfd8e0'; ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(12, -18, 19, 1); ctx.quadraticCurveTo(10, 5, 0, 3); ctx.closePath(); ctx.fill(); ctx.restore(); break;
      default: dot(x, y, 11, 'rgba(182,90,255,.22)'); dot(x, y, 6, '#c78bff'); dot(x, y, 2.5, '#fff');
    }
  }
}
function drawFire(X, Y) {
  for (const f of G.fire) {
    const age = G.t - f.t, a = clamp((5 - age) / 1.2, 0, 1) * (.78 + .22 * Math.sin(G.t * 20 + f.x * .3));
    const x = X(f.x), y = Y(f.y);
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    ctx.fillStyle = 'rgba(255,100,25,' + (a * .5) + ')'; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,205,80,' + (a * .85) + ')'; ctx.beginPath(); ctx.arc(x, y - 2 * Math.sin(G.t * 12 + f.y), 8, 0, TAU); ctx.fill();
  }
}

function draw() {
  const cam = G.cam, sh = REDUCE ? 0 : G.shake;
  const cx = cam.x + (sh ? rand(-sh, sh) : 0), cy = cam.y + (sh ? rand(-sh, sh) : 0);
  const X = x => x - cx + W / 2, Y = y => y - cy + H / 2;
  drawGround(cx, cy);
  const playing = state !== 'menu';

  drawFire(X, Y);
  drawHazards(X, Y);

  for (const l of G.loot) {
    const x = X(l.x), y = Y(l.y);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 5, 9, 3.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c98f4f'; ctx.strokeStyle = '#6b4520'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y, 9, 6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#8a5a2a'; ctx.beginPath(); ctx.moveTo(x - 3, y - 4); ctx.lineTo(x - 1, y + 4); ctx.moveTo(x + 2, y - 4); ctx.lineTo(x + 4, y + 4); ctx.stroke();
  }
  for (const g of G.gems) { const x = X(g.x), y = Y(g.y); if (x > -20 && x < W + 20 && y > -20 && y < H + 20) drawGem(g, x, y); }

  // rastro da investida
  for (const f of G.fx) {
    if (f.k !== 'ghost') continue;
    ctx.fillStyle = 'rgba(111,208,230,' + (f.t / f.max * .35) + ')'; ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), 13, 0, TAU); ctx.fill();
  }

  for (const e of G.enemies) {
    const x = X(e.x), y = Y(e.y), m = e.r * 3 + 12;
    if (x < -m || x > W + m || y < -m || y > H + m) continue;
    drawEnemy(e, x, y);
  }

  // machados do Carrasco
  for (const e of G.enemies) if (e.axes && !e.dead) for (const a of e.axes) {
    const x = X(a.x), y = Y(a.y);
    ctx.strokeStyle = 'rgba(200,200,200,.18)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(e.x), Y(e.y)); ctx.lineTo(x, y); ctx.stroke();
    ctx.save(); ctx.translate(x, y); ctx.rotate(G.t * 14);
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
    ctx.fillStyle = '#cfd8e0'; ctx.strokeStyle = '#23303c'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(12, -18, 19, 1); ctx.quadraticCurveTo(10, 5, 0, 3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  // carga da onda de choque
  const P = G.p;
  if (playing && P.channel > 0) {
    const L = CORE.shock.lv[G.core.shock - 1], t = P.channel / P.chMax, rr = lerp(18, L.rad, t);
    ctx.strokeStyle = 'rgba(217,169,58,' + (.9 - t * .5) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(P.x), Y(P.y), rr, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(217,169,58,' + ((1 - t) * .22) + ')'; ctx.beginPath(); ctx.arc(X(P.x), Y(P.y), rr, 0, TAU); ctx.fill();
  }
  if (playing) drawPlayer(X(P.x), Y(P.y));
  const shw = G.weapons.shield;
  if (shw && playing) {
    const px = X(P.x), py = Y(P.y);
    if (shw.cd <= 0) {
      const pl = .5 + .5 * Math.sin(G.t * 4);
      ctx.fillStyle = 'rgba(120,200,255,' + (.08 + .05 * pl) + ')'; ctx.beginPath(); ctx.arc(px, py, 25, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(160,225,255,' + (.55 + .25 * pl) + ')'; ctx.lineWidth = 2; ctx.stroke();
    } else {
      const mx = WEAPONS.shield.lv[shw.lvl - 1].cd;
      ctx.strokeStyle = 'rgba(120,200,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 24, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - shw.cd / mx)); ctx.stroke();
    }
  }

  // giro devastador
  const wh = G.whirl;
  if (wh && playing) {
    const L = CORE.whirl.lv[G.core.whirl - 1], px = X(P.x), py = Y(P.y), a = Math.min(1, wh.t / .4), R = L.rad * .82;
    ctx.fillStyle = 'rgba(230,240,250,' + (.07 * a) + ')'; ctx.beginPath(); ctx.arc(px, py, L.rad, 0, TAU); ctx.fill();
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ang = wh.ang + i * TAU / 3;
      ctx.strokeStyle = 'rgba(240,246,252,' + (.8 * a) + ')'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(px, py, R, ang - 1.0, ang); ctx.stroke();
      ctx.strokeStyle = 'rgba(240,246,252,' + (.25 * a) + ')'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, R, ang - 1.9, ang - 1.0); ctx.stroke();
      dot(px + Math.cos(ang) * R, py + Math.sin(ang) * R, 4, 'rgba(255,255,255,' + a + ')');
    }
  }

  // machados em órbita
  const axe = G.weapons.axe;
  if (axe && playing) for (const a of axe.pos) {
    ctx.save(); ctx.translate(X(a.x), Y(a.y)); ctx.rotate(G.t * 12);
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
    ctx.fillStyle = '#cfd8e0'; ctx.strokeStyle = '#23303c'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(10, -16, 16, 1); ctx.quadraticCurveTo(9, 4, 0, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // machados em chamas
  const fax = G.weapons.axe;
  if (fax && playing && fax.fpos) for (const a of fax.fpos) {
    const x = X(a.x), y = Y(a.y), al = fax.fa == null ? 1 : fax.fa;
    ctx.globalAlpha = al;
    for (let i = 0; i < 5; i++) { const ang = G.t * 14 - i * .28, rr = 9 + i * 3; dot(x - Math.cos(ang) * 6 - i * 2, y - Math.sin(ang) * 6 - i, rr, 'rgba(255,' + (150 - i * 18) + ',40,' + (.3 - i * .04) + ')'); }
    dot(x, y, 22, 'rgba(255,120,30,.22)');
    ctx.save(); ctx.translate(x, y); ctx.rotate(G.t * 13);
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(11, 0); ctx.stroke();
    ctx.fillStyle = '#ffd27a'; ctx.strokeStyle = '#8a2a10'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(11, -17, 18, 1); ctx.quadraticCurveTo(10, 4, 0, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  // adagas do jogador
  for (const s of G.shots) {
    const x = X(s.x), y = Y(s.y);
    ctx.strokeStyle = 'rgba(230,236,240,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s.vx * .04, y - s.vy * .04); ctx.stroke();
    ctx.save(); ctx.translate(x, y); ctx.rotate(s.a);
    ctx.fillStyle = '#e3e9ee'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-5, -3); ctx.lineTo(-5, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d9a93a'; ctx.fillRect(-8, -3.5, 3, 7);
    ctx.restore();
  }

  drawEnemyShots(X, Y);

  // efeitos
  for (const f of G.fx) {
    const a = f.t / f.max;
    if (f.k === 'bolt') {
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'rgba(150,200,255,' + (a * .3) + ')'; ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), f.rad * (1.15 - a * .2), 0, TAU); ctx.fill();
      for (const pass of [[4, 'rgba(120,180,255,' + a + ')'], [1.5, 'rgba(255,255,255,' + a + ')']]) {
        ctx.lineWidth = pass[0]; ctx.strokeStyle = pass[1]; ctx.beginPath();
        f.pts.forEach((q, i) => { if (i) ctx.lineTo(X(q[0]), Y(q[1])); else ctx.moveTo(X(q[0]), Y(q[1])); });
        ctx.stroke();
      }
    } else if (f.k === 'slash') {
      const prog = 1 - a;
      ctx.save(); ctx.translate(X(G.p.x), Y(G.p.y)); ctx.rotate(f.a);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, f.rad, -f.arc / 2, f.arc / 2); ctx.closePath();
      ctx.fillStyle = 'rgba(230,240,250,' + (.18 * a) + ')'; ctx.fill();
      ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(240,246,252,' + (.9 * a) + ')';
      ctx.beginPath(); ctx.arc(0, 0, f.rad * (.85 + .15 * prog), -f.arc / 2, f.arc / 2); ctx.stroke();
      ctx.restore();
    } else if (f.k === 'wave') {
      const prog = 1 - a, px = X(G.p.x), py = Y(G.p.y);
      ctx.save(); ctx.translate(px, py); ctx.rotate(f.a); ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const rr = f.rad * clamp(prog * 1.1 - i * .12, 0, 1), al = a * (1 - i * .25);
        if (rr <= 4) continue;
        ctx.strokeStyle = 'rgba(' + (i ? '140,205,255' : '235,248,255') + ',' + al + ')'; ctx.lineWidth = 10 - i * 3;
        ctx.beginPath(); ctx.arc(0, 0, rr, -f.arc / 2, f.arc / 2); ctx.stroke();
      }
      ctx.restore();
    } else if (f.k === 'ring') {
      ctx.strokeStyle = 'rgba(' + f.c + ',' + a + ')'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(X(G.p.x), Y(G.p.y), 12 + (1 - a) * 120, 0, TAU); ctx.stroke();
    } else if (f.k === 'shock') {
      const rr = f.rad * (1 - a * a);
      ctx.fillStyle = 'rgba(255,236,170,' + (a * .16) + ')'; ctx.beginPath(); ctx.arc(X(G.p.x), Y(G.p.y), rr, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,236,170,' + a + ')'; ctx.lineWidth = 3 + a * 7;
      ctx.beginPath(); ctx.arc(X(G.p.x), Y(G.p.y), rr, 0, TAU); ctx.stroke();
    } else if (f.k === 'blast') {
      const rr = f.rad * (.55 + .45 * (1 - a));
      ctx.fillStyle = 'rgba(' + f.col + ',' + (a * .35) + ')'; ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), rr, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(' + f.col + ',' + a + ')'; ctx.lineWidth = 2 + a * 5; ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), rr, 0, TAU); ctx.stroke();
    }
  }

  // partículas
  for (const q of G.parts) {
    ctx.globalAlpha = clamp(q.t / q.max * 1.5, 0, 1); ctx.fillStyle = q.c;
    ctx.fillRect(X(q.x) - q.s / 2, Y(q.y) - q.s / 2, q.s, q.s);
  }
  ctx.globalAlpha = 1;

  // números de dano
  ctx.font = '700 13px "Alegreya Sans SC", "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.7)';
  for (const q of G.texts) {
    ctx.globalAlpha = clamp(q.t / .3, 0, 1); const x = X(q.x), y = Y(q.y);
    ctx.strokeText(q.s, x, y); ctx.fillStyle = q.c; ctx.fillText(q.s, x, y);
  }
  ctx.globalAlpha = 1;

  // luz e sombra
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .32, W / 2, H / 2, Math.hypot(W, H) * .62);
  vg.addColorStop(0, 'rgba(4,8,10,0)'); vg.addColorStop(1, 'rgba(4,8,10,' + lerp(.62, .22, G.dawn) + ')');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (playing) {
    const low = G.p.hp / G.p.maxhp < .3 ? .12 + Math.sin(G.t * 6) * .05 : 0, hurt = G.p.hurt * .6;
    if (low || hurt) { ctx.fillStyle = 'rgba(176,54,47,' + (low + hurt) + ')'; ctx.fillRect(0, 0, W, H); }
  }
}
