'use strict';
function updateHud() {
  const hp = Math.max(0, Math.ceil(G.p.hp)), hk = hp + '/' + G.p.maxhp;
  if (hc.hp !== hk) { el.hpfill.style.width = (hp / G.p.maxhp * 100) + '%'; el.hptext.textContent = hk; hc.hp = hk; }
  const eu = G.char === 'warrior' && G.core.sword >= 4, ev = eu ? Math.round(G.en) : -1;
  if (hc.en !== ev) { el.en.hidden = !eu; el.enfill.style.width = G.en + '%'; el.en.classList.toggle('full', G.en >= 100); hc.en = ev; }
  if (hc.lives !== G.lives) { el.lives.textContent = G.lives; hc.lives = G.lives; }
  if (hc.blue !== G.blue) { el.blue.textContent = G.blue; hc.blue = G.blue; }
  if (hc.pur !== G.purple) { el.pur.textContent = G.purple; el.pur.hidden = el.purg.hidden = !G.purple; hc.pur = G.purple; }
  const rt = G.round ? 'Round ' + G.round + (G.won ? '' : ' / ' + WIN_ROUND) : 'Prepare-se';
  if (hc.rt !== rt) { el.round.textContent = rt; hc.rt = rt; }
  let rs;
  if (G.phase === 'fight') rs = 'Restam ' + (G.toSpawn + G.enemies.length);
  else if (!G.round) rs = 'A noite começa em ' + Math.max(1, Math.ceil(G.breakT));
  else if (!G.shopDone) rs = 'Recolhendo gemas';
  else rs = 'Próximo round em ' + Math.max(1, Math.ceil(G.breakT));
  if (hc.rs !== rs) { el.rsub.textContent = rs; hc.rs = rs; }
  if (hc.k !== G.kills) { el.kills.textContent = G.kills; hc.k = G.kills; }
  const b = G.bossRef, show = !!(b && !b.dead);
  if (hc.boss !== show) { el.boss.hidden = !show; hc.boss = show; }
  if (show) { const w = Math.max(0, b.hp) / b.maxhp * 100 + '%'; if (hc.bw !== w) { el.bossfill.style.width = w; hc.bw = w; } }
  for (const id of SKILL_ORDER) {
    const s = skillEls[id], cd = G.cd[id], mx = G.cdMax[id], lv = G.core[id];
    const pct = cd > 0 ? Math.round(cd / mx * 100) : 0;
    if (hc['c' + id] !== pct) { s.cdo.style.height = pct + '%'; hc['c' + id] = pct; }
    let txt = '';
    if (cd > .95) { const tot = Math.ceil(cd); txt = tot >= 60 ? Math.floor(tot / 60) + ':' + String(tot % 60).padStart(2, '0') : String(tot); }
    if (hc['t' + id] !== txt) { s.cdt.textContent = txt; hc['t' + id] = txt; }
    if (hc['l' + id] !== lv) { s.sl.textContent = lv; hc['l' + id] = lv; }
    const on = (id === 'whirl' && !!G.whirl) || (id === 'shock' && !!G.flame) || (id === 'dash' && G.p.channel > 0);
    if (hc['o' + id] !== on) { s.root.classList.toggle('on', on); hc['o' + id] = on; }
  }
}

/* ---------- laço principal ---------- */
