'use strict';
/* ---------- telas ---------- */
function showScreen(html, cls) {
  el.screen.className = 'screen' + (cls ? ' ' + cls : '');
  el.screen.innerHTML = html; el.screen.hidden = false;
  const f = el.screen.querySelector('[data-primary]');
  if (f) f.focus({ preventScroll: true });
}
function hideScreen() { el.screen.hidden = true; el.screen.innerHTML = ''; el.screen.className = 'screen'; }
function setHud(v) { el.pausebtn.hidden = !v; el.hud.hidden = !v; el.loadout.hidden = !v; el.skills.hidden = !v; if (!v) el.boss.hidden = true; }
function banner(text) {
  el.banner.textContent = text; el.banner.hidden = true; void el.banner.offsetWidth; el.banner.hidden = false;
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => { el.banner.hidden = true; }, 2400);
}
const BEST_KEY = 'ultima-muralha-melhor-round';
function getBest() { try { return +localStorage.getItem(BEST_KEY) || 0; } catch (_) { return 0; } }
function saveBest(r) { try { if (r > getBest()) localStorage.setItem(BEST_KEY, String(r)); } catch (_) {} }

function showMenu() {
  state = 'menu'; setHud(false);
  const best = getBest();
  showScreen(
    '<div class="panel">' +
    '<h1>Última Muralha</h1>' +
    '<p class="lead">' + WIN_ROUND + ' rounds separam a noite do amanhecer. Resista a cada onda, derrote os chefões e não deixe a muralha cair. Você começa com 3 vidas extras.</p>' +
    '<ul class="how">' +
    '<li><b>Mover</b><span>' + keyOf('up') + ' ' + keyOf('left') + ' ' + keyOf('down') + ' ' + keyOf('right') + '</span></li>' +
    '<li><b>Habilidades</b><span>' + keyOf('sword') + ' ataque principal (segure). ' + keyOf('whirl') + ', ' + keyOf('dash') + ' e ' + keyOf('shock') + ' são as habilidades do personagem. Escolha entre Guerreiro, Mago e Ladra.</span></li>' +
    '<li><b>Gemas</b><span>Gemas azuis são a moeda das melhorias, que abrem no fim de cada round. Um inimigo por round carrega uma gema roxa, que dá uma melhoria grátis. ' + keyOf('pause') + ' ou o botão Pausa abre pausa e configurações.</span></li>' +
    '</ul>' +
    (best ? '<p class="best">Melhor resistência <span>round ' + best + '</span></p>' : '') +
    '<div class="actions"><button class="btn" data-act="start" data-primary>Defender a muralha</button><button class="btn ghost" data-act="settings">Configurações</button></div>' +
    '</div>'
  );
}
function showSelect() {
  state = 'menu'; setHud(false);
  const cards = Object.keys(CHARS).map(id => {
    const c = CHARS[id], k = ['sword', 'whirl', 'dash', 'shock'];
    return '<button class="char" data-act="pick" data-c="' + id + '"><b>' + c.name + '</b><span class="cd">' + c.desc + '</span><ul>' +
      c.skills.map((n, i) => '<li><em>' + keyOf(k[i]) + '</em> ' + n + '</li>').join('') + '</ul>' +
      '<span class="cw">Armas: ' + c.weapons.map(w => WEAPONS[w].name).join(', ') + '</span></button>';
  }).join('');
  showScreen('<div class="panel wide"><h2>Escolha seu herói</h2><div class="chars">' + cards + '</div><div class="actions"><button class="btn ghost" data-act="tomenu">Voltar</button></div></div>');
}
function startGame(char) {
  auInit(); newGame(char); hideScreen(); setHud(true); mouse.left = false; state = 'play'; banner('A noite começa'); sfx('horn');
}

/* ----- tela de melhorias (fim de cada round) ----- */
const shopGroups = () => [
  ['Habilidades do herói', SKILL_ORDER],
  ['Armas automáticas', CHARS[G.char].weapons],
  ['Bônus', ['might', 'haste', 'boots', 'armor', 'vigor']]
];
const tagOf = id => CORE[id] ? keyOf(id) : WEAPONS[id] ? 'Arma' : 'Bônus';
function shopHTML() {
  let rows = '';
  for (const g of shopGroups()) {
    rows += '<tr><th class="grp" colspan="4">' + g[0] + '</th></tr>';
    for (const id of g[1]) {
      const def = defOf(id), cur = lvOf(id), max = cur >= MAXLV, cost = costOf(id);
      const pips = cur ? '●'.repeat(cur) + '○'.repeat(MAXLV - cur) + '<span>' + cur + '/' + MAXLV + '</span>' : '<span>Bloqueada</span>';
      let eff, act;
      if (max) { eff = 'Tudo desbloqueado.'; act = '<span class="maxed">Nível máximo</span>'; }
      else {
        eff = (cur ? '' : '<em>Desbloqueia: </em>') + nextText(id);
        act = '<button class="buy" data-act="buy" data-id="' + id + '"' + (G.blue < cost ? ' disabled' : '') + ' title="Custa ' + cost + ' gemas azuis">' + icon('gem') + cost + '</button>';
        if (G.purple > 0) act += '<button class="buy up" data-act="buyp" data-id="' + id + '" title="Usa uma gema roxa: grátis">' + icon('gem') + 'Grátis</button>';
      }
      rows += '<tr><td><div class="nm">' + icon(def.ic || id) + '<div><b>' + def.name + '</b><small>' + tagOf(id) + '</small></div></div></td>' +
        '<td class="lv">' + pips + '</td><td class="ef">' + eff + '</td><td class="ac">' + act + '</td></tr>';
    }
  }
  return '<div class="panel wide"><div class="shophead"><div><p class="sub">Fim do round ' + G.round + '</p><h2>Melhorias</h2></div>' +
    '<div class="bal"><span class="chip blue" title="Gemas azuis">' + icon('gem') + G.blue + '</span>' +
    (G.purple ? '<span class="chip purple" title="Gemas roxas: uma melhoria grátis cada">' + icon('gem') + G.purple + '</span>' : '') +
    '<button class="btn" data-act="shopdone" data-primary>Próximo round</button></div></div>' +
    '<p class="lead small">Gemas azuis compram e evoluem habilidades. Cada nível custa mais que o anterior. A gema roxa evolui qualquer habilidade de graça.</p>' +
    '<div class="tablewrap"><table class="shop"><tbody>' + rows + '</tbody></table></div></div>';
}
function showShop() { const st = el.screen.scrollTop; showScreen(shopHTML(), 'shop'); el.screen.scrollTop = st; }
function openShop() { state = 'shop'; mouse.left = false; G.whirl = null; showShop(); }
function applyUpgrade(id) {
  if (CORE[id]) G.core[id]++;
  else if (WEAPONS[id]) { if (G.weapons[id]) G.weapons[id].lvl++; else G.weapons[id] = { lvl: 1, cd: (id === 'shield' || id === 'rshield') ? 0 : .4, ang: 0, pos: [] }; }
  else {
    G.passives[id] = (G.passives[id] || 0) + 1;
    if (id === 'vigor') { G.p.maxhp += 20; G.p.hp += 20; }
  }
  recalc(); renderLoadout(); hc = {};
}
function buy(id, free) {
  if (state !== 'shop' || lvOf(id) >= MAXLV) return;
  if (free) { if (G.purple < 1) return; G.purple--; }
  else { const c = costOf(id); if (G.blue < c) return; G.blue -= c; }
  applyUpgrade(id); showShop();
}
function renderLoadout() {
  let h = '';
  for (const id in G.weapons) h += '<li>' + icon(id) + '<span>' + WEAPONS[id].name + '</span><b>' + G.weapons[id].lvl + '</b></li>';
  for (const id in G.passives) h += '<li>' + icon(id) + '<span>' + PASSIVES[id].name + '</span><b>' + G.passives[id] + '</b></li>';
  el.loadout.innerHTML = h;
}
function showPause() {
  showScreen('<div class="panel"><h2>Pausa</h2><p class="lead">A muralha aguenta mais um instante.</p>' +
    '<div class="actions"><button class="btn" data-act="resume" data-primary>Continuar</button><button class="btn ghost" data-act="settings">Configurações</button><button class="btn ghost" data-act="start">Recomeçar</button></div></div>');
}
function pause() {
  if (state !== 'play') return; state = 'pause'; mouse.left = false; showPause();
}
function resume() { if (state !== 'pause') return; hideScreen(); state = 'play'; }
function togglePause() { if (state === 'play') pause(); else if (state === 'pause') resume(); }
function statsHTML() {
  return '<dl class="stats"><div><dt>Round</dt><dd>' + G.round + '</dd></div><div><dt>Abates</dt><dd>' + G.kills + '</dd></div><div><dt>Tempo</dt><dd>' + fmt(G.t) + '</dd></div></dl>';
}
function gameOver() {
  if (state === 'over') return;
  state = 'over'; mouse.left = false; saveBest(G.round); setHud(false); sfx('over');
  showScreen('<div class="panel"><h2>A muralha caiu</h2><p class="lead">Você chegou ao round ' + G.round + ' de ' + WIN_ROUND + '.</p>' + statsHTML() +
    '<div class="actions"><button class="btn" data-act="start" data-primary>Tentar de novo</button></div></div>');
}
function winGame() {
  state = 'win'; mouse.left = false; saveBest(G.round); sfx('win');
  showScreen('<div class="panel"><h2>O amanhecer chegou</h2><p class="lead">A muralha resistiu a ' + WIN_ROUND + ' rounds. As hordas recuam com a primeira luz.</p>' + statsHTML() +
    '<div class="actions"><button class="btn" data-act="go" data-primary>Continuar lutando</button><button class="btn ghost" data-act="start">Nova partida</button></div></div>');
}
el.screen.addEventListener('input', e => {
  const v = e.target.dataset && e.target.dataset.vol; if (!v) return;
  CFG[v] = e.target.value / 100; e.target.parentNode.querySelector('b').textContent = e.target.value; auVol(); saveCfg(); if (v === 'sfx') sfx('ui');
});
el.screen.addEventListener('change', e => { if (e.target.dataset && 'mute' in e.target.dataset) { CFG.mute = e.target.checked; auVol(); saveCfg(); } });
el.screen.addEventListener('click', e => {
  if (swallowClick) { swallowClick = false; return; }
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act; sfx('ui');
  if (a === 'settings') { showSettings(state === 'pause' ? 'pause' : 'menu'); return; }
  if (a === 'rebind') { rebinding = b.dataset.a; const st = el.screen.scrollTop; showScreen(settingsHTML(), 'settings'); el.screen.scrollTop = st; return; }
  if (a === 'resetkeys') { CFG.bind = Object.assign({}, DEF_BIND); saveCfg(); refreshKeyLabels(); showSettings(); return; }
  if (a === 'setback') { rebinding = null; if (settingsFrom === 'pause') showPause(); else showMenu(); return; }
  if (a === 'tomenu') { showMenu(); return; }
  if (a === 'start') showSelect();
  else if (a === 'pick') startGame(b.dataset.c);
  else if (a === 'buy') buy(b.dataset.id, false);
  else if (a === 'buyp') buy(b.dataset.id, true);
  else if (a === 'shopdone') { G.shopDone = true; G.breakT = 4; hideScreen(); state = 'play'; }
  else if (a === 'resume') resume();
  else if (a === 'go') { hideScreen(); state = 'play'; }
});
