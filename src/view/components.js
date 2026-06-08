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
