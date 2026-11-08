'use strict';
/* ---------- configurações, controles e áudio ---------- */
const CFG_KEY = 'ultima-muralha-config';
const ACTIONS = [
  ['up', 'Mover para cima'], ['down', 'Mover para baixo'], ['left', 'Mover para a esquerda'], ['right', 'Mover para a direita'],
  ['sword', 'Espada (segure para repetir)'], ['whirl', 'Giro Devastador'], ['dash', 'Avanço Fugaz'], ['shock', 'Onda de Choque'], ['pause', 'Pausar']
];
const DEF_BIND = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', sword: 'Mouse0', whirl: 'Mouse2', dash: 'Space', shock: 'KeyE', pause: 'Escape' };
const CFG = { master: .8, sfx: .8, music: .45, mute: false, bind: Object.assign({}, DEF_BIND) };
try { const j = JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); if (j) { for (const k of ['master', 'sfx', 'music']) if (typeof j[k] === 'number') CFG[k] = clamp(j[k], 0, 1); CFG.mute = !!j.mute; if (j.bind) for (const k in DEF_BIND) if (typeof j.bind[k] === 'string') CFG.bind[k] = j.bind[k]; } } catch (_) {}
function saveCfg() { try { localStorage.setItem(CFG_KEY, JSON.stringify(CFG)); } catch (_) {} }
const KEYNAMES = { Space: 'Espaço', Escape: 'Esc', ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt', AltRight: 'Alt', Tab: 'Tab', Enter: 'Enter', Backspace: 'Backspace',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Mouse0: 'Mouse esq.', Mouse1: 'Mouse meio', Mouse2: 'Mouse dir.', Mouse3: 'Mouse 4', Mouse4: 'Mouse 5', Semicolon: ';', Comma: ',', Period: '.', Slash: '/' };
function codeLabel(c) { if (KEYNAMES[c]) return KEYNAMES[c]; if (/^Key/.test(c)) return c.slice(3); if (/^Digit/.test(c)) return c.slice(5); return c; }
const keyOf = a => codeLabel(CFG.bind[a]);
const held = {};
const isHeld = a => !!held[CFG.bind[a]] || (a === 'up' && !!held.ArrowUp) || (a === 'down' && !!held.ArrowDown) || (a === 'left' && !!held.ArrowLeft) || (a === 'right' && !!held.ArrowRight);
Object.defineProperty(mouse, 'left', { get() { return !!held[CFG.bind.sword]; }, set(v) { held[CFG.bind.sword] = !!v; } });
function refreshKeyLabels() {
  document.querySelectorAll('.skill').forEach(n => { const id = n.dataset.id; const c = CFG.bind[id]; n.querySelector('.k').textContent = c === 'Mouse0' ? 'Esq' : c === 'Mouse2' ? 'Dir' : c === 'Mouse1' ? 'Meio' : codeLabel(c); });
}
