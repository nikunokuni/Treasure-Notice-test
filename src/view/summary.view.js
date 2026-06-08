/* ═══════════════════════════════════════════════════════════
   たからさがし — summary.view.js
   サマリー画面
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
   7. サマリー
   ══════════════════════════════════ */

/** サマリー画面を返す */
function renderSummary() {
  const items     = S.summaryItems;
  const paras     = S.summaryOpinion.split(/\n/).filter(Boolean);
  const savedNote = S.currentNote || '';

  return `
    <div class="content">
      <div id="summary-capture-area">
        ${_renderSummaryHero()}
        ${_renderFindingsCard(items)}
        ${_renderAiOpinionCard(paras)}
      </div>
      ${_renderTomorrowCard()}
      ${_renderNoteCard(savedNote)}
      ${_renderSummaryActions()}
    </div>`;
}

/** サマリーヒーロー部分を返す（内部ヘルパー） */
function _renderSummaryHero() {
  return `
    <div class="summary-hero">
      <span class="summary-hero-emoji">${esc(S.odai?.emoji || '🔍')}</span>
      <div class="summary-hero-ttl">たからみつかった！</div>
      <div class="summary-hero-sub">${esc(S.odai?.name || '')} · ${esc(S.lens || '')}レンズ</div>
    </div>`;
}

/** きょうのたからカードを返す（内部ヘルパー） */
function _renderFindingsCard(items) {
  const FINDING_COLORS = ['#e8860a', '#0a9396', '#e76f51', '#52b788', '#9b89c4', '#ffd166'];
  const findingsHtml   = items.length === 0
    ? renderLoadingRow('まとめているよ…')
    : items.map((f, i) => `
        <div class="finding-item finding-item-anim" style="animation-delay:${0.1 + i * 0.18}s">
          <div class="finding-dot" style="background:${FINDING_COLORS[i % FINDING_COLORS.length]}"></div>
          <div class="finding-text">${esc(f)}</div>
        </div>`).join('');
  return `
    <div class="findings-card" id="findings-card">
      <button class="bookmark-btn ${S.bookmarked ? 'active' : ''}" onclick="App.toggleBookmark()">🔖</button>
      <div class="findings-label">✨ きょうみつけたたから</div>
      ${findingsHtml}
    </div>`;
}

/** AIのかんがえカードを返す（内部ヘルパー） */
function _renderAiOpinionCard(paras) {
  const bodyHtml = paras.length > 0
    ? paras.map(p => `<div class="ai-opinion-para">${esc(p)}</div>`).join('')
    : renderLoadingRow('よみこみちゅう…');
  return `
    <div class="ai-opinion-card">
      <div class="ai-opinion-toggle" onclick="App.toggleOpinion()">
        <div class="ai-opinion-label">💡 AIのかんがえ（おとな向け）</div>
        <div class="ai-opinion-chevron ${S.opinionOpen ? 'open' : ''}">▾</div>
      </div>
      <div class="ai-opinion-body" style="display:${S.opinionOpen ? 'block' : 'none'}">
        ${bodyHtml}
      </div>
    </div>`;
}

/** あしたやってみようカードを返す（内部ヘルパー） */
function _renderTomorrowCard() {
  const contentHtml = !S.tomorrowHint
    ? `<div class="tomorrow-loading">${renderSpinner(12)}<span>かんがえているよ…</span></div>`
    : `<div class="tomorrow-text">${esc(S.tomorrowHint)}</div>`;
  return `
    <div class="tomorrow-card">
      <div class="tomorrow-label">🌱 あしたやってみよう！</div>
      ${contentHtml}
    </div>`;
}

/** きろくノートカードを返す（内部ヘルパー） */
function _renderNoteCard(savedNote) {
  return `
    <div class="note-card">
      <div class="note-label">📓 きろくノート</div>
      <div class="note-hint">きょうきづいたこと、おもったことをかいてみよう</div>
      <textarea class="note-textarea" id="note-input" placeholder="（じゆうにかいてね）">${esc(savedNote)}</textarea>
      <button class="note-save-btn" onclick="App.saveNote()">💾 ほぞんする</button>
    </div>`;
}

/** サマリーアクションボタン行を返す（内部ヘルパー） */
function _renderSummaryActions() {
  const actions = [
    { cls: 'summary-action-again', icon: '🔄', label: 'べつのレンズで', fn: 'App.doAgain()'       },
    { cls: 'summary-action-next',  icon: '✨', label: 'つぎのおだい',  fn: 'App.nextOdai()'      },
    { cls: 'summary-action-save',  icon: '📸', label: 'ほぞん',        fn: 'App.saveSummaryImage()' },
    { cls: 'summary-action-x',     icon: '𝕏',  label: 'とうこう',      fn: 'App.shareToX()'      },
  ];
  return `
    <div class="summary-action-row">
      ${actions.map(a => `
        <button class="summary-action-btn ${a.cls}" onclick="${a.fn}">
          <span class="summary-action-icon">${a.icon}</span>
          <span>${a.label}</span>
        </button>`).join('')}
    </div>`;
}

/** サマリーのアニメーション発火 */
function triggerFindingAnim() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.finding-item-anim').forEach(el => {
      el.classList.add('finding-item-visible');
    });
  });
}
