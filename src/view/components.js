/* ═══════════════════════════════════════════════════════════
   たからさがし — components.js
   共通パーツ（スピナー・タブバー・チャットヘッダー）
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
   1. ユーティリティ（共通パーツ）
   ══════════════════════════════════ */

/** ローディングスピナーを返す（サイズ指定可） */
function renderSpinner(size = 14) {
  return `<span class="spinner" style="width:${size}px;height:${size}px"></span>`;
}

/** 「よみこみちゅう…」スピナー行を返す */
function renderLoadingRow(msg = 'よみこみちゅう…') {
  return `<div class="loading-row">${renderSpinner(12)}<span>${msg}</span></div>`;
}

/** 「もっと見る」ボタンを返す */
function renderLoadMoreBtn(onclickFn, label = 'つぎの20けん ›') {
  return `<button class="load-more-btn" onclick="${onclickFn}">${label}</button>`;
}

/** 空状態メッセージを返す */
function renderEmptyMsg(emoji, msg) {
  return `<div class="empty-msg">${emoji}<br>${msg}</div>`;
}


/* ══════════════════════════════════
   2. タブバー / チャットヘッダー
   ══════════════════════════════════ */

/** タブバー（5タブ）を返す */
function renderTabs() {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'ホーム',     cls: 'tab-home' },
    { id: 'cal',  icon: '🗓️', label: 'カレンダー', cls: 'tab-cal'  },
    { id: 'box',  icon: '📦', label: 'たからばこ', cls: 'tab-box'  },
    { id: 'fav',  icon: '⭐', label: 'おきにいり', cls: 'tab-fav'  },
    { id: 'set',  icon: '⚙️', label: 'せってい',   cls: 'tab-set'  },
  ];
  const tabItems = tabs.map(t => `
    <div class="tab ${t.cls} ${S.tab === t.id ? 'active' : ''}" onclick="App.switchTab('${t.id}')">
      <span class="tab-icon">${t.icon}</span>
      <span class="tab-label">${t.label}</span>
    </div>`).join('');
  return `
    <div class="tabs">${tabItems}</div>
    <div class="tab-line"></div>`;
}

/**
 * タブコンテンツをシールレイヤーでラップする（全タブ共通）
 * ・stickerPlaceMode 中  → disabled-layer + タップ配置オーバーレイ + トレイ
 * ・通常表示（シールあり）→ 絶対配置のシールを重ねるだけ
 * ・通常表示（シールなし）→ 何もせずそのままreturn
 */
function wrapWithStickerLayer(innerHtml) {
  const placed = _renderPlacedTabStickers();

  if (S.stickerPlaceMode) {
    return `
      <div class="home-sticker-mode-wrap">
        <div class="home-sticker-canvas" id="home-sticker-canvas" onclick="App.placeHomeSticker(event)">
          <div class="home-sticker-disabled-layer">${innerHtml}</div>
          ${placed}
        </div>
        ${_renderStickerTray()}
      </div>`;
  }

  const tabArr = (S.tabStickers || {})[S.tab] || [];
  if (tabArr.length === 0) return innerHtml;
  return `
    <div class="tab-sticker-layer" id="home-sticker-canvas">
      ${innerHtml}
      ${placed}
    </div>`;
}

/** 現在タブに貼られたシール一覧HTMLを返す（内部ヘルパー） */
function _renderPlacedTabStickers() {
  const arr = (S.tabStickers || {})[S.tab] || [];
  return arr.map((s, i) => {
    const removable = S.stickerRemoveMode;
    const onclick   = removable ? `onclick="event.stopPropagation();App.removeHomeSticker(${i})"` : '';
    return `
    <div class="home-placed-sticker ${removable ? 'removable' : ''}" style="left:${s.x}px; top:${s.y}px;" ${onclick}>${esc(s.emoji)}</div>`;
  }).join('');
}

/** シールをはるモードのトレイHTMLを返す（内部ヘルパー） */
function _renderStickerTray() {
  const owned = S.ownedStickers || [];
  const items = owned.map((id, i) => {
    const st = STICKERS.find(s => s.id === id);
    if (!st) return '';
    const sel = S.stickerPlacing && S.stickerPlacing.ownedIndex === i;
    return `
      <div class="home-sticker-tray-item ${sel ? 'selected' : ''}" onclick="App.pickHomeSticker(${i})">
        <span class="home-sticker-tray-emoji">${st.emoji}</span>
      </div>`;
  }).join('');

  const label = S.stickerRemoveMode
    ? 'はずしたいシールをタップしてね'
    : (owned.length === 0
        ? 'シールがまだないよ'
        : (S.stickerPlacing ? 'はりたい ばしょを タップしてね' : 'どのシールをはる？'));

  return `
    <div class="home-sticker-tray">
      <div class="home-sticker-tray-label">${label}</div>
      <div class="home-sticker-tray-scroll">${items}</div>
      <div class="home-sticker-tray-actions">
        <button class="home-sticker-remove-btn ${S.stickerRemoveMode ? 'active' : ''}" onclick="App.toggleStickerRemoveMode()">🗑️ シールをはずす</button>
        <button class="home-sticker-done-btn" onclick="App.closeStickerPlaceMode()">おわる</button>
      </div>
    </div>`;
}

/** チャットヘッダーを返す */
function renderChatHeader() {
  const lens = LENSES.find(l => l.id === S.lens);
  const lensHtml = lens
    ? `<span class="chat-header-lens">${lens.icon} ${esc(lens.name)}</span>`
    : '';
  return `
    <div class="chat-header">
      <div class="chat-header-info">
        <span class="chat-header-emoji">${esc(S.odai?.emoji || '')}</span>
        <span class="chat-header-name">${esc(S.odai?.name || '')}</span>
        ${lensHtml}
      </div>
      <button class="back-btn" onclick="App.closeChatFlow()">◀ ホームにもどる</button>
    </div>`;
}
