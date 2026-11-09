'use strict';
/* barra de habilidades (refeita ao escolher o personagem) */
const skillEls = {};
function rebuildSkillbar() {
  el.skills.innerHTML = SKILL_ORDER.map(id =>
    '<div class="skill" data-id="' + id + '" title="' + CORE[id].name + '"><span class="k">' + keyOf(id) + '</span>' + icon(CORE[id].ic || id) +
    '<b class="sl">1</b><i class="cdo"></i><span class="cdt"></span></div>').join('');
  for (const k in skillEls) delete skillEls[k];
  for (const n of el.skills.children) skillEls[n.dataset.id] = { root: n, cdo: n.querySelector('.cdo'), cdt: n.querySelector('.cdt'), sl: n.querySelector('.sl') };
  if (typeof refreshKeyLabels === 'function') refreshKeyLabels();
}
