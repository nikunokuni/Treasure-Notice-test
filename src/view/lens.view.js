/* ═══════════════════════════════════════════════════════════
   たからさがし — lens.view.js
   レンズ選択画面
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
   5. レンズ選択
   ══════════════════════════════════ */

/** 年齢グループ→おすすめレンズID */
const RECOMMENDED_LENSES = {
  young:  ['ことば', 'じぶん'],
  middle: ['ことば', 'かず'],
  older:  ['もしも', 'つながり'],
};

/** レンズ選択画面を返す */
function renderLens() {
  const currentLens  = LENSES.find(l => l.id === S.lens);
  const startBtnText = !S.lens
    ? 'レンズをえらんでね'
    : `${currentLens?.icon} ${esc(S.lens)}レンズではじめる ›`;

  const recommended = RECOMMENDED_LENSES[S.user.ageGroup] ?? [];

  const lensCards = LENSES.map(l => `
    <div class="lens-card ${l.cls} ${S.lens === l.id ? 'selected' : ''}"
         onclick="App.selectLens('${l.id}')">
      ${recommended.includes(l.id) ? '<span class="lens-recommend-badge">⭐ おすすめ</span>' : ''}
      <div class="lens-card-header">
        <span class="lens-icon">${l.icon}</span>
        <div class="lens-name">${esc(l.name)}</div>
      </div>
      <div class="lens-desc">${esc(l.kidDesc)}</div>
    </div>`).join('');

  return `
    <div class="content">
      <div class="lens-hint">どのレンズでみてみる？ひとつだけえらんでね 🔍</div>
      <div class="lens-grid">${lensCards}</div>
      <button class="btn-dark" onclick="App.startChat()" ${!S.lens ? 'disabled' : ''}>
        ${startBtnText}
      </button>
      <button class="btn-secondary" onclick="App.closeChatFlow()">← おだいにもどる</button>
    </div>`;
}
