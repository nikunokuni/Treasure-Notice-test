/* ═══════════════════════════════════════════════════════════
   たからさがし — lens.view.js
   レンズ選択画面
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
   5. レンズ選択
   ══════════════════════════════════ */

/** レンズ選択画面を返す */
function renderLens() {
  const sameAsLast   = S.lens && S.lens === S.lastLens;
  const currentLens  = LENSES.find(l => l.id === S.lens);
  const startBtnText = !S.lens
    ? 'レンズをえらんでね'
    : `${currentLens?.icon} ${esc(S.lens)}レンズではじめる ›`;

  const shortcutBanner = sameAsLast ? `
    <div class="lens-shortcut-banner">
      <div class="lens-shortcut-left">
        <span class="lens-shortcut-icon">${currentLens?.icon || ''}</span>
        <div>
          <div class="lens-shortcut-ttl">まえと同じ「${esc(S.lens)}」レンズ</div>
          <div class="lens-shortcut-sub">そのままはじめることもできるよ</div>
        </div>
      </div>
      <button class="btn-shortcut" onclick="App.startChat()">そのままはじめる ›</button>
    </div>` : '';

  const lensCards = LENSES.map(l => `
    <div class="lens-card ${l.cls} ${S.lens === l.id ? 'selected' : ''}"
         onclick="App.selectLens('${l.id}')">
      <div class="lens-card-header">
        <span class="lens-icon">${l.icon}</span>
        <div class="lens-name">${esc(l.name)}</div>
      </div>
      <div class="lens-desc">${esc(l.kidDesc)}</div>
    </div>`).join('');

  return `
    <div class="content">
      ${shortcutBanner}
      <div class="lens-hint">どのレンズでみてみる？ひとつだけえらんでね 🔍</div>
      <div class="lens-grid">${lensCards}</div>
      <button class="btn-dark" onclick="App.startChat()" ${!S.lens ? 'disabled' : ''}>
        ${startBtnText}
      </button>
      <button class="btn-secondary" onclick="App.closeChatFlow()">← おだいにもどる</button>
    </div>`;
}
