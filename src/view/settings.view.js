/* ═══════════════════════════════════════════════════════════
   たからさがし — settings.view.js
   せってい画面
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
  13. せってい
   ══════════════════════════════════ */

/** せってい画面を返す */
function renderSettings() {
  const tab = S.settingsTab || 'kid';
  return `
    <div class="content">
      <div class="settings-subtabs">
        <div class="settings-subtab ${tab === 'kid'   ? 'active' : ''}" onclick="App.switchSettingsTab('kid')">こどもよう</div>
        <div class="settings-subtab ${tab === 'adult' ? 'active' : ''}" onclick="App.switchSettingsTab('adult')">おとなよう</div>
      </div>
      ${tab === 'kid' ? _renderSettingsKid() : _renderSettingsAdult()}
      ${renderShopModal()}
      ${renderPurchaseCompleteAlert()}
    </div>`;
}

/** 「かいものかんりょうしました」アラームを返す（内部ヘルパー） */
function renderPurchaseCompleteAlert() {
  if (!S.purchaseCompleteAlert) return '';
  return `
    <div class="modal-overlay badge-new-overlay" onclick="App.closePurchaseCompleteAlert()">
      <div class="modal-box badge-new-box" onclick="event.stopPropagation()">
        <div class="badge-new-burst">🎉</div>
        <div class="badge-new-icon">🛍️</div>
        <div class="badge-new-name">かいものかんりょうしました</div>
        <button class="btn-primary badge-new-ok" onclick="App.closePurchaseCompleteAlert()">やったー！</button>
      </div>
    </div>`;
}

/** ショップモーダルを返す（内部ヘルパー） */
function renderShopModal() {
  if (!S.shopModal) return '';
  return `
    <div class="modal-overlay" onclick="App.closeShop()">
      <div class="modal-box modal-box--shop" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="App.closeShop()">✕</button>
        <iframe class="shop-iframe" src="${App.buildShopUrl()}" title="ショップ"></iframe>
      </div>
    </div>`;
}

/** こどもよう設定を返す（内部ヘルパー） */
function _renderSettingsKid() {
  const u  = S.user;
  const fs = S.fontSize || 'medium';

  const colorWheel = _renderColorWheel();

  const stickyBtns = STICKY_COLORS.map(c => `
    <button class="sticky-color-btn ${S.stickyColor === c.id ? 'selected' : ''}"
            onclick="App.setStickyColor('${c.id}', '${c.value}')"
            style="background:${c.value}">
      ${c.label}
    </button>`).join('');

  return `
    <div class="settings-section">
      <div class="settings-ttl">こどものじょうほう</div>
      <div class="settings-row-2col">
        <div class="settings-field settings-field-half">
          <div class="settings-field-label">よびかた</div>
          <input class="form-input" id="s-name" value="${esc(u.name)}" placeholder="ニックネーム">
          <div class="form-error" id="s-name-err">なまえをいれてください</div>
        </div>
        <div class="settings-field settings-field-half">
          <div class="settings-field-label">すきなもの</div>
          <input class="form-input" id="s-likes" value="${esc(u.likes)}" placeholder="ポケモン・サッカーなど">
        </div>
      </div>
      <div class="settings-field settings-row-icon">
        <div class="settings-field-label">ねんれい</div>
        ${renderAgeIconRow(u.ageGroup)}
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">いっしょにするひと</div>
      <div class="settings-field">
        <div class="parent-chips">${renderParentChips(u.parentName)}</div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">🎨 アプリのいろ</div>
      ${colorWheel}
    </div>

    <div class="settings-section">
      <div class="settings-ttl">📌 ふせんのいろ</div>
      <div class="sticky-color-grid">${stickyBtns}</div>
    </div>

    <div class="settings-section">
      <div class="settings-field">
        <div class="settings-field-label">もじサイズ</div>
        <div class="font-size-chips">
          <div class="font-size-chip ${fs === 'small'  ? 'sel' : ''}" onclick="App.setFontSize('small')">ちいさい</div>
          <div class="font-size-chip ${fs === 'medium' ? 'sel' : ''}" onclick="App.setFontSize('medium')">ふつう</div>
          <div class="font-size-chip ${fs === 'large'  ? 'sel' : ''}" onclick="App.setFontSize('large')">おおきい</div>
        </div>
      </div>
    </div>

    ${S.shownFirstSticker ? `
    <div class="settings-section">
      <button class="btn-primary sticker-place-btn" onclick="App.openStickerPlaceMode()">🎀 シールをはる</button>
    </div>` : ''}`;
}

/** カラーホイールSVGを返す（内部ヘルパー） */
function _renderColorWheel() {
  const cx = 120, cy = 120, R = 112, r = 44;
  // 色相環順（12時から時計回り）
  const wheelOrder = ['yellow','amber','orange','rose','red','pink','purple','indigo','blue','teal','green','lime'];
  const colorMap = {};
  COLOR_THEMES.forEach(t => { colorMap[t.id] = t.amber; });
  const paperMap = {};
  COLOR_THEMES.forEach(t => { paperMap[t.id] = t.paper; });

  const toRad = deg => deg * Math.PI / 180;
  let paths = '';

  wheelOrder.forEach((id, i) => {
    const a1 = toRad(i * 30 - 90);
    const a2 = toRad((i + 1) * 30 - 90);
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    const x3 = cx + r * Math.cos(a2), y3 = cy + r * Math.sin(a2);
    const x4 = cx + r * Math.cos(a1), y4 = cy + r * Math.sin(a1);
    const sel = S.theme === id;
    const stroke = sel ? '#fff' : 'rgba(255,255,255,0.6)';
    const sw     = sel ? 3 : 1.5;
    const scale  = sel ? `transform-origin:${cx}px ${cy}px;transform:scale(1.06)` : '';
    paths += `<path d="M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 0 0 ${x4} ${y4}Z"
      fill="${colorMap[id]}" stroke="${stroke}" stroke-width="${sw}" style="cursor:pointer;${scale}"
      onclick="App.setTheme('${id}')"/>`;
    if (sel) {
      const ma = toRad((i + 0.5) * 30 - 90);
      const mr = (R + r) / 2;
      paths += `<text x="${cx + mr * Math.cos(ma)}" y="${cy + mr * Math.sin(ma)}"
        text-anchor="middle" dominant-baseline="middle" font-size="13" fill="white"
        stroke="#0006" stroke-width="2" paint-order="stroke" pointer-events="none">✓</text>`;
    }
  });

  // 中央の白・黒セミサークル
  const selB = S.theme === 'black', selW = S.theme === 'white';
  paths += `<path d="M${cx} ${cy-r} A${r} ${r} 0 0 0 ${cx} ${cy+r}Z"
    fill="${colorMap['black']}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"
    style="cursor:pointer" onclick="App.setTheme('black')"/>`;
  paths += `<path d="M${cx} ${cy-r} A${r} ${r} 0 0 1 ${cx} ${cy+r}Z"
    fill="${paperMap['white']}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"
    style="cursor:pointer" onclick="App.setTheme('white')"/>`;
  paths += `<line x1="${cx}" y1="${cy-r}" x2="${cx}" y2="${cy+r}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" pointer-events="none"/>`;
  if (selB) paths += `<text x="${cx-r*0.45}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
    font-size="13" fill="white" stroke="#0004" stroke-width="2" paint-order="stroke" pointer-events="none">✓</text>`;
  if (selW) paths += `<text x="${cx+r*0.45}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
    font-size="13" fill="white" stroke="#0004" stroke-width="2" paint-order="stroke" pointer-events="none">✓</text>`;

  // 現在のテーマ名
  const cur = COLOR_THEMES.find(t => t.id === S.theme);
  const label = cur ? cur.name : S.theme === 'white' ? 'しろ' : 'くろ';

  return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:4px 0">
    <svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg"
         style="filter:drop-shadow(0 2px 6px #0002)">${paths}</svg>
    <div style="font-size:0.85em;color:var(--deep);opacity:0.7">${label}</div>
  </div>`;
}

/** おとなよう設定を返す（内部ヘルパー） */
function _renderSettingsAdult() {
  const u            = S.user;
  const adultLinks   = ADULT_LINKS.map(l => `
    <div class="adult-link-row" onclick="App.openExternalLink('${l.id}')">
      <span>${l.emoji}</span>
      <span>${l.label}${l.sublabel ? `<br><span style="font-size:0.75em;color:#aaa;">${l.sublabel}</span>` : ''}</span>
      <span class="adult-link-arrow">›</span>
    </div>`).join('');

  const reportSection = S.weeklyReport ? `
    <div class="report-card">
      <div class="report-label">📊 ウィークリーレポート</div>
      <div class="report-body">${aiText(S.weeklyReport)}</div>
    </div>
    <button class="btn-secondary" onclick="App.generateReport()">
      ${S.reportLoading ? renderSpinner() : '🔄 もう一度生成'}
    </button>` : `
    <button class="btn-primary" onclick="App.generateReport()">
      ${S.reportLoading ? `${renderSpinner()} せいせいちゅう…` : '📊 レポートをつくる'}
    </button>`;

  return `
    <div class="settings-section-adult">
      <div class="settings-ttl-adult">ウィークリーレポート</div>
      <div class="settings-field-hint">今週の学びをAIがまとめるよ</div>
      ${reportSection}
    </div>

    <div class="settings-section-adult">
      <div class="adult-link-row" onclick="App.exportAllData()">
        <span>🗂️</span>
        <span>全データをエクスポート<br><span style="font-size:0.75em;color:#aaa;">きろく・せってい・てちょうなど全情報をバックアップ</span></span>
        <span class="adult-link-arrow">›</span>
      </div>
      <div class="adult-link-row" onclick="App.triggerImportAllData()">
        <span>📦</span>
        <span>全データをインポート<br><span style="font-size:0.75em;color:#aaa;">※このアプリでエクスポートしたものを使ってください</span></span>
        <span class="adult-link-arrow">›</span>
      </div>
      <input type="file" id="json-import-input" accept=".json" style="display:none" onchange="App.importAllData(event)">
      <div class="adult-link-row" onclick="App.sendFeedback()">
        <span>📨</span><span>ご意見・感想・バグ報告</span>
        <span class="adult-link-arrow">›</span>
      </div>
      ${adultLinks}
    </div>`;
}
