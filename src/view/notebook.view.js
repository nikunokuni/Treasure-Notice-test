/* ═══════════════════════════════════════════════════════════
   たからさがし — notebook.view.js
   てちょう画面（付箋・シール配置）
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
  11. てちょう
   ══════════════════════════════════ */

/** てちょう一覧セクション（おきにいりタブ内）を返す */
function renderNotebookSection() {
  if (!S.notebookUnlocked) return '';

  const owned  = S.ownedPageThemes || ['plain'];
  const books  = S.notebooks || [];
  const canAdd = hasNotebookSlot();
  const limit  = calcNotebookLimit();
  const used   = books.length;

  const bookListHtml = books.length === 0
    ? `<div class="nb-empty">まだてちょうがないよ<br>つくってみよう！</div>`
    : books.map((nb, i) => {
        const theme = NOTEBOOK_THEMES.find(t => t.id === nb.themeId) || NOTEBOOK_THEMES[0];
        return `
          <div class="nb-thumb-wrap" onclick="App.openNotebook(${i})">
            <div class="nb-thumb-date-label">${fmtDate(nb.createdAt)}</div>
            <div class="nb-thumb-canvas-clip">
              ${renderNotebookCanvasReadonly(nb, theme)}
            </div>
          </div>`;
      }).join('');

  const newBtn = canAdd
    ? `<button class="nb-create-btn" onclick="App.startNewNotebook()">＋ あたらしいてちょうをつくる</button>`
    : `<p class="notebook-limit-msg">
         📖 てちょうは今 ${used}／${limit} さつ<br>
         バッヂを あと ${15 - (calcBadgePoints() % 15) || 15} こ あつめると もう1ページ ふえるよ！
       </p>`;

  return `
    <div class="nb-section">
      <div class="nb-section-ttl">📔 てちょう</div>
      <div class="nb-thumb-row">${bookListHtml}</div>
      ${newBtn}
    </div>
    <div class="note-section-divider"><span>🏅 かくとくしたバッヂ</span></div>`;
}

/** てちょう編集画面を返す */
function renderNotebookEditor() {
  const nb = S.notebookEditing;
  if (!nb) return '';
  const theme = NOTEBOOK_THEMES.find(t => t.id === nb.themeId) || NOTEBOOK_THEMES[0];
  return `
    <div class="nb-editor-wrap">
      <div class="nb-editor-header">
        <button class="back-btn" onclick="App.cancelNotebook()">◀ もどる</button>
        <span class="nb-editor-title">${theme.emoji} てちょうをかざろう</span>
        <button class="nb-save-btn" onclick="App.saveNotebook()">かんせい！</button>
      </div>
      ${renderNotebookPlacingBanner()}
      ${renderNotebookCanvas(nb, theme)}
      ${renderNotebookTray()}
      <button class="nb-delete-btn" onclick="App.deleteNotebook()">🗑️ てちょうをさくじょする</button>
    </div>`;
}

/** ふせん内コンテンツ：たから型を返す（内部ヘルパー） */
function _renderFavStickerInner(r) {
  const lens     = LENSES.find(l => l.id === r.lens);
  const lensHtml = lens ? `<span class="nsc-lens">${lens.icon} ${esc(lens.name)}</span>` : '';
  const findings = (r.findings || []).slice(0, 3);
  return `
    <div class="nsc-header">
      <span class="nsc-emoji">${esc(r.odai.emoji)}</span>
      <span class="nsc-name">${esc(r.odai.name)}</span>
      ${lensHtml}
    </div>
    <ul class="nsc-findings">
      ${findings.map(f => `<li>${esc(f)}</li>`).join('')}
    </ul>
    <div class="nsc-date">${fmtDate(r.date)}</div>`;
}

/** ふせん内コンテンツ：ノート型（フラッシュカード風）を返す（内部ヘルパー） */
function _renderNoteStickerInner(r) {
  return `
    <div class="nsc-flash">
      <div class="nsc-flash-emoji">${esc(r.odai.emoji)}</div>
      <div class="nsc-flash-name">${esc(r.odai.name)}</div>
      ${r.note ? `<div class="nsc-flash-kana">${esc(r.note.slice(0, 10))}</div>` : ''}
    </div>`;
}

/** てちょうキャンバス（編集可）を返す */
function renderNotebookCanvas(nb, theme) {
  const items = (nb.items || []).map((item, i) => {
    const top  = Math.round(item.y);
    const left = Math.round(item.x);

    // ふせん付きアイテム（たから/ノート）
    if (item.stickerSrc && item.record) {
      const isFav      = item.type === 'fav-sticker';
      const innerHtml  = isFav
        ? _renderFavStickerInner(item.record)
        : _renderNoteStickerInner(item.record);
      return `
        <div class="nb-placed-item nb-placed-item--sticker"
             style="top:${top}px;left:${left}px"
             onclick="event.stopPropagation();App.removePlacedItem(${i})">
         <div class="nb-sticker-card" style="background-image:url('${esc(item.stickerSrc)}')">
            <div class="nb-sticker-card-inner">${innerHtml}</div>
          </div>
          <div class="nb-placed-remove">✕</div>
        </div>`;
    }

    // 通常アイテム（バッヂ・シール等）
    const isBadge  = item.type === 'badge';
    const labelHtml = (!isBadge && item.label)
      ? `<div class="nb-placed-label">${esc(item.label)}</div>`
      : '';
    return `
      <div class="nb-placed-item ${isBadge ? 'nb-placed-item--badge' : ''}"
           style="top:${top}px;left:${left}px"
           onclick="event.stopPropagation();App.removePlacedItem(${i})">
        <span class="nb-placed-emoji">${esc(item.emoji)}</span>
        ${labelHtml}
        <div class="nb-placed-remove">✕</div>
      </div>`;
  }).join('');

  return `
    <div class="nb-canvas nb-canvas--grid" id="nb-canvas"
         style="${_themeBgStyle(theme)}"
         onclick="App.placeItem(event)">
      ${items}
    </div>`;
}

/** テーマの背景スタイル文字列を返す（内部ヘルパー、プレーンは方眼紙模様つき） */
function _themeBgStyle(theme) {
  if (theme.pattern === 'none') {
    return `background-color:${theme.bg};` +
      `background-image:` +
        `linear-gradient(rgba(45,27,0,0.04) 1px, transparent 1px),` +
        `linear-gradient(90deg, rgba(45,27,0,0.04) 1px, transparent 1px);` +
      `background-size:14px 14px;`;
  }
  return `background:${theme.bg}`;
}

/**
 * てちょうキャンバス（読み取り専用サムネ用）を返す
 * ※ スケール計算はCSSで管理するためclassで制御
 */
function renderNotebookCanvasReadonly(nb, theme) {
  const items = (nb.items || []).map(item => `
    <div class="nb-placed-item" style="top:${Math.round(item.y)}px;left:${Math.round(item.x)}px">
      <span class="nb-placed-emoji">${esc(item.emoji)}</span>
      ${item.label ? `<div class="nb-placed-label">${esc(item.label)}</div>` : ''}
    </div>`).join('');

  const hint = (nb.items || []).length === 0
    ? `<div class="nb-canvas-hint">まだなにもないよ</div>`
    : '';

  // スケール計算：CSSに移行できない部分のみここで処理
  const contentW = Math.min(window.innerWidth, 430);
  const thumbW   = Math.floor((contentW - 32 - 10) / 2);
  const scale    = (thumbW / 320).toFixed(3);
  const negH     = (260 * scale - 260).toFixed(1);
  const negW     = (320 * scale - 320).toFixed(1);

  return `
    <div class="nb-canvas nb-canvas--readonly"
         style="${_themeBgStyle(theme)}transform:scale(${scale});margin-bottom:${negH}px;margin-right:${negW}px">
      ${items}
      ${hint}
    </div>`;
}

/** ふせん選択UI（たから/ノート共通）を返す */
function renderStickerPicker(trayType) {
  if (NOTEBOOK_STICKERS.length === 0) {
    return `<div class="nb-tray-empty">ふせんがまだないよ</div>`;
  }
  return `
    <div class="nb-sticker-picker-wrap">
      <div class="nb-sticker-picker-label">どのふせんにする？</div>
      <div class="nb-sticker-picker-scroll">
        ${NOTEBOOK_STICKERS.map(st => `
          <div class="nb-sticker-pick-item ${S.notebookStickerSelected === st.id ? 'selected' : ''}"
               onclick="App.pickSticker('${st.id}','${trayType}')">
            <img class="nb-sticker-pick-img" src="${esc(st.src)}" alt="${esc(st.name)}">
            <div class="nb-sticker-pick-name">${esc(st.name)}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

/** てちょうトレイを返す */
function renderNotebookTray() {
  const tray = S.notebookTray || 'badge';
  const tabs = [
    { id: 'badge',   label: '🏅', name: 'バッヂ' },
    { id: 'sticker', label: '🎨', name: 'シール' },
    { id: 'fav',     label: '⭐', name: 'たから' },
    { id: 'note',    label: '📓', name: 'ノート' },
  ];
  const tabsHtml = tabs.map(t => `
    <div class="nb-tray-tab ${tray === t.id ? 'active' : ''}"
         onclick="App.switchNotebookTray('${t.id}')">
      ${t.label}<span class="nb-tray-tab-name">${t.name}</span>
    </div>`).join('');

  return `
    <div class="nb-tray">
      <div class="nb-tray-tabs">${tabsHtml}</div>
      <div class="nb-tray-items">${_renderTrayItems(tray)}</div>
    </div>`;
}

/**
 * トレイの中身を返す（内部ヘルパー）
 * @param {string} tray - 'badge' | 'sticker' | 'fav' | 'note'
 */
function _renderTrayItems(tray) {
  if (tray === 'badge') {
    const earned = BADGES.filter(b => b.check(S));
    return earned.length === 0
      ? `<div class="nb-tray-empty">まだバッヂがないよ</div>`
      : earned.map(b => `
          <div class="nb-tray-item ${_isPlacing('badge', b.id) ? 'selecting' : ''}"
               onclick="App.selectNotebookItem('badge','${b.id}','${b.icon}','${esc(b.name)}')">
            <div class="nb-tray-emoji">${b.icon}</div>
            <div class="nb-tray-name">${esc(b.name)}</div>
          </div>`).join('');
  }

  if (tray === 'sticker') {
    return STICKERS.map(s => `
      <div class="nb-tray-item ${_isPlacing('sticker', s.id) ? 'selecting' : ''}"
           onclick="App.selectNotebookItem('sticker','${s.id}','${s.emoji}','')">
        <div class="nb-tray-emoji">${s.emoji}</div>
      </div>`).join('');
  }

  if (tray === 'fav') {
    // ふせん選択中 → たから一覧、未選択 → ふせん画像選択
    if (S.notebookStickerPick === 'fav') {
      const favs = S.records.filter(r => r.bookmarked);
      return favs.length === 0
        ? `<div class="nb-tray-empty">おきにいりがまだないよ</div>`
        : favs.map((r, i) => `
            <div class="nb-tray-item ${_isPlacing('fav', String(i)) ? 'selecting' : ''}"
                 onclick="App.selectFavWithSticker(${i})">
              <div class="nb-tray-emoji">${r.odai.emoji}</div>
              <div class="nb-tray-name">${esc(r.odai.name)}</div>
            </div>`).join('');
    }
    return renderStickerPicker('fav');
  }

  if (tray === 'note') {
    // ふせん選択中 → ノート一覧、未選択 → ふせん画像選択
    if (S.notebookStickerPick === 'note') {
      const notes = S.records.filter(r => r.note && r.note.trim());
      return notes.length === 0
        ? `<div class="nb-tray-empty">ノートがまだないよ</div>`
        : notes.map((r, i) => `
            <div class="nb-tray-item nb-tray-item-note ${_isPlacing('note', String(i)) ? 'selecting' : ''}"
                 onclick="App.selectNoteWithSticker(${i})">
              <div class="nb-tray-emoji">📓</div>
              <div class="nb-tray-name">${esc(r.odai.name)}</div>
              <div class="nb-tray-note-preview">${esc(r.note.slice(0, 15))}</div>
            </div>`).join('');
    }
    return renderStickerPicker('note');
  }

  return '';
}

/** 配置中バナーを返す */
function renderNotebookPlacingBanner() {
  if (!S.notebookPlacing) return '';
  return `
    <div class="nb-placing-banner">
      <span class="nb-placing-emoji">${S.notebookPlacing.emoji}</span>
      <span class="nb-placing-msg">おきたいところをタップしてね！</span>
      <button class="nb-placing-cancel" onclick="App.cancelPlacing()">とりけし</button>
    </div>`;
}

/** 配置待ち判定ヘルパー（view内専用） */
function _isPlacing(type, id) {
  return S.notebookPlacing?.type === type && S.notebookPlacing?.id === String(id);
}
