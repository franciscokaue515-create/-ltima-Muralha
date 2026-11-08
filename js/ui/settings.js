'use strict';
/* ----- tela de configurações ----- */
let settingsFrom = 'menu', rebinding = null;
function settingsHTML() {
  const sl = (id, label, v) => '<label class="srow"><span>' + label + '</span><input type="range" min="0" max="100" value="' + Math.round(v * 100) + '" data-vol="' + id + '"><b>' + Math.round(v * 100) + '</b></label>';
  let keys = '';
  for (const [a, name] of ACTIONS) keys += '<div class="krow"><span>' + name + '</span><button class="kbtn' + (rebinding === a ? ' wait' : '') + '" data-act="rebind" data-a="' + a + '">' + (rebinding === a ? 'Pressione uma tecla ou botão…' : codeLabel(CFG.bind[a])) + '</button></div>';
  return '<div class="panel wide set"><h2>Configurações</h2>' +
    '<div class="setgrid"><section><p class="sub">Som</p>' +
    sl('master', 'Volume geral', CFG.master) + sl('sfx', 'Efeitos', CFG.sfx) + sl('music', 'Música', CFG.music) +
    '<label class="srow chk"><input type="checkbox" data-mute ' + (CFG.mute ? 'checked' : '') + '><span>Silenciar tudo</span></label></section>' +
    '<section><p class="sub">Controles</p>' + keys + '<p class="lead small">Clique em um controle e pressione a tecla ou o botão do mouse que quiser. Se já estiver em uso, os dois trocam de lugar.</p></section></div>' +
    '<div class="actions"><button class="btn" data-act="setback" data-primary>Voltar</button><button class="btn ghost" data-act="resetkeys">Restaurar controles</button></div></div>';
}
function showSettings(from) { if (from) settingsFrom = from; rebinding = null; showScreen(settingsHTML(), 'settings'); }
function bindCode(code) {
  const a = rebinding; if (!a) return; rebinding = null;
  const old = CFG.bind[a];
  for (const k in CFG.bind) if (k !== a && CFG.bind[k] === code) CFG.bind[k] = old;
  CFG.bind[a] = code; saveCfg(); refreshKeyLabels(); const st = el.screen.scrollTop; showScreen(settingsHTML(), 'settings'); el.screen.scrollTop = st;
}
