/* ═══════════════════════════════════════════════════════════
   たからさがし — fav.view.js
   おきにいり画面（バッヂ・ノート）
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
  10. おきにいり（バッヂ・ノート含む）
   ══════════════════════════════════ */

/** おきにいり画面を返す */
function renderFav() {
  const PAGE        = 20;
  const favPage     = S.favPage  || 0;
  const notePage    = S.notePage || 0;
  const allFavs     = S.records.filter(r => r.bookmarked).slice().reverse();
  const favSlice    = allFavs.slice(0, PAGE * (favPage + 1));
  const hasMoreFav  = allFavs.length > PAGE * (favPage + 1);
  const allNotes    = S.records.filter(r => r.note && r.note.trim()).slice().reverse();
  const noteSlice   = allNotes.slice(0, PAGE * (notePage + 1));
  const hasMoreNote = allNotes.length > PAGE * (notePage + 1);

  return `
    <div class="content">
      ${renderNotebookSection()}
      ${_renderBadgeSection()}

      <div class="fav-section-ttl">⭐ おきにいりのたから</div>
      ${allFavs.length === 0
        ? renderEmptyMsg('⭐', 'おきにいりがまだないよ<br>🔖をおしてみよう！')
        : favSlice.map(r => renderTakaraCard(r, true)).join('')}
      ${hasMoreFav ? renderLoadMoreBtn('App.loadMoreFav()') : ''}

      <div class="note-section-divider"><span>📓 きろくノート</span></div>
      <div class="note-section-hint">サマリーのあとにかいたメモがあつまるよ</div>
      ${allNotes.length === 0
        ? renderEmptyMsg('📓', 'まだメモがないよ')
        : noteSlice.map(r => _renderNoteTabEntry(r)).join('')}
      ${hasMoreNote ? renderLoadMoreBtn('App.loadMoreNote()') : ''}
    </div>
    ${_renderNewBadgeModal()}
    ${_renderNotebookUnlockModal()}
    ${_renderBadgeDetailModal()}`;
}

/** てちょう解放モーダルを返す（内部ヘルパー） */
function _renderNotebookUnlockModal() {
  if (!S.shownNotebookUnlock) return '';
  return `
    <div class="modal-overlay badge-new-overlay" onclick="App.closeNotebookUnlock()">
      <div class="modal-box badge-new-box" onclick="event.stopPropagation()">
        <div class="badge-new-burst">🎉</div>
        <div class="badge-new-icon">📔</div>
        <div class="badge-new-ttl">てちょうが つかえるようになったよ！</div>
        <div class="badge-new-name">📔 てちょう</div>
        <div class="badge-new-cond">あたらしいてちょうを つくってみよう</div>
        <button class="btn-primary badge-new-ok" onclick="App.closeNotebookUnlock()">やったー！</button>
      </div>
    </div>`;
}

/** ノートタブのエントリー1件を返す（内部ヘルパー） */
function _renderNoteTabEntry(r) {
  return `
    <div class="note-tab-section">
      <div class="note-entry-header">
        <span class="note-entry-emoji">${r.odai.emoji}</span>
        <span class="note-entry-name">${esc(r.odai.name)}</span>
        <span class="note-entry-date">${fmtDate(r.date)}</span>
      </div>
      <div class="note-entry-text">${esc(r.note)}</div>
    </div>`;
}

/** バッヂセクションを返す（内部ヘルパー） */
function _renderBadgeSection() {
  const badgeResults = BADGES.map(b => ({ ...b, earned: b.check(S) }));
  const badgeItems   = badgeResults.map(b => {
    const rarity   = b.earned ? (b.rarity || 'normal') : 'off';
    const maxLevel = b.def.levels.length;
    const curLevel = b.def.levels.filter(lv => lv.check(S)).length;
    const sparkle  = maxLevel > 1 && curLevel > 0
      ? `<div class="badge-case-sparkle">${'✨'.repeat(curLevel - 1)}</div>`
      : '';
    return `
      <div class="badge-case-item badge-rarity-${rarity}" onclick="App.openBadge('${b.id}')">
        <div class="badge-case-icon">${b.earned ? b.icon : '○'}</div>
        ${sparkle}
      </div>`;
  }).join('');

  return `
    <div class="badge-section-top">
      <div class="badge-section-ttl">🏅 かくとくしたバッヂ</div>
      <div class="badge-grid-large">${badgeItems}</div>
    </div>`;
}

/** 新規バッヂ取得モーダルを返す（内部ヘルパー） */
function _renderNewBadgeModal() {
  if (!S.shownBadgeModal) return '';
  const badge = BADGES.find(b => b.id === S.shownBadgeModal);
  if (!badge) return '';
  return `
    <div class="modal-overlay badge-new-overlay" onclick="App.closeBadge()">
      <div class="modal-box badge-new-box" onclick="event.stopPropagation()">
        <div class="badge-new-burst">🎉</div>
        <div class="badge-new-icon">${badge.icon}</div>
        <div class="badge-new-ttl">あたらしいバッヂ！</div>
        <div class="badge-new-name">${esc(badge.name)}</div>
        <div class="badge-new-cond">${esc(badge.cond)}</div>
        <button class="btn-primary badge-new-ok" onclick="App.closeBadge()">やったー！</button>
      </div>
    </div>`;
}

/** バッヂ詳細モーダルを返す（内部ヘルパー） */
function _renderBadgeDetailModal() {
  if (!S.badgeModal) return '';
  const def = S.badgeModal.def || BADGE_DEFS.find(d => d.id === S.badgeModal.id);
  if (!def) return '';

  const cur      = _getCurrentLevel(def, S);
  const next     = _getNextLevel(def, S);
  const isEarned = def.levels[0].check(S);
  const nextHtml = next
    ? `<div class="badge-next-level">つぎのステージ：${next.icon} <strong>${esc(next.name)}</strong>（${next.count}かい）</div>`
    : isEarned
      ? `<div class="badge-next-level badge-next-max">🏆 さいこうレベルたっせい！</div>`
      : '';

  return `
    <div class="modal-overlay" onclick="App.closeBadge()">
      <div class="modal-box modal-box--center" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="App.closeBadge()">✕</button>
        <div class="badge-modal-icon badge-rarity-${isEarned ? cur.rarity : 'off'}">${isEarned ? cur.icon : '○'}</div>
        <div class="badge-modal-name">${esc(cur.name)}</div>
        <div class="badge-modal-cond">${esc(cur.cond)}</div>
        <div class="badge-modal-status ${isEarned ? 'earned' : 'not-earned'}">
          ${isEarned ? '✅ かくとくずみ！' : '🔒 まだかくとくしていないよ'}
        </div>
        ${nextHtml}
      </div>
    </div>`;
}
