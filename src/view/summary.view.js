/* ═══════════════════════════════════════════════════════════
   たからさがし — summary.view.js
   サマリー画面（findings/opinion/mission/tomorrow 統合・部分更新対応）
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
   7. サマリー
   ══════════════════════════════════ */

const FINDING_COLORS = ['#e8860a', '#0a9396', '#e76f51', '#52b788', '#9b89c4', '#ffd166'];

/* ── 各ボディのHTML生成（renderSummaryと App._fillSummary で共用） ── */

/** きょうのたから（findings）本文を返す */
function summaryFindingsHTML() {
  const items = S.summaryItems || [];
  if (items.length === 0) return renderLoadingRow('まとめているよ…');
  return items.map((f, i) => `
    <div class="finding-item finding-item-anim" style="animation-delay:${0.1 + i * 0.18}s">
      <div class="finding-dot" style="background:${FINDING_COLORS[i % FINDING_COLORS.length]}"></div>
      <div class="finding-text">${esc(f)}</div>
    </div>`).join('');
}

/** AIのかんがえ（opinion 配列）本文を返す */
function summaryOpinionHTML() {
  const paras = S.summaryOpinion || [];
  if (paras.length === 0) return renderLoadingRow('よみこみちゅう…');
  return paras.map(p => `<div class="ai-opinion-para">${esc(p)}</div>`).join('');
}

/** あしたやってみよう（tomorrow）本文を返す */
function summaryTomorrowHTML() {
  if (!S.tomorrowHint) {
    return `<div class="tomorrow-loading">${renderSpinner(12)}<span>かんがえているよ…</span></div>`;
  }
  return `<div class="tomorrow-text">${esc(S.tomorrowHint)}</div>`;
}

/** きもちスタンプ行を返す */
function noteStampsHTML() {
  return NOTE_STAMPS.map(s => `
    <div class="note-stamp ${S.noteStamps.includes(s.id) ? 'selected' : ''}"
         onclick="App.toggleStamp('${s.id}')">
      <span>${s.icon}</span><span>${esc(s.label)}</span>
    </div>`).join('');
}

/** 書き出しヒント行を返す */
function noteHintsHTML() {
  return NOTE_HINTS.map((h, i) => `
    <div class="note-hint-chip" onclick="App.useNoteHint(${i})">${esc(h)}</div>
  `).join('');
}

/** サマリー画面を返す */
function renderSummary() {
  return `
    <div class="content">
      <div id="summary-capture-area">
        ${_renderSummaryHero()}
        ${_renderFindingsCard()}
        ${_renderAiOpinionCard()}
      </div>
      ${_renderTomorrowCard()}
      ${_renderNoteCard()}
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
function _renderFindingsCard() {
  return `
    <div class="findings-card" id="findings-card">
      <button class="bookmark-btn ${S.bookmarked ? 'active' : ''}" onclick="App.toggleBookmark()">🔖</button>
      <div class="findings-label">✨ きょうみつけたたから</div>
      <div id="findings-body">${summaryFindingsHTML()}</div>
    </div>`;
}

/** AIのかんがえカードを返す（内部ヘルパー） */
function _renderAiOpinionCard() {
  return `
    <div class="ai-opinion-card">
      <div class="ai-opinion-toggle" onclick="App.toggleOpinion()">
        <div class="ai-opinion-label">💡 AIのかんがえ（おとな向け）</div>
        <div class="ai-opinion-chevron ${S.opinionOpen ? 'open' : ''}">▾</div>
      </div>
      <div class="ai-opinion-body" style="display:${S.opinionOpen ? 'block' : 'none'}">
        <div id="opinion-body">${summaryOpinionHTML()}</div>
      </div>
    </div>`;
}

/** あしたやってみようカードを返す（内部ヘルパー） */
function _renderTomorrowCard() {
  return `
    <div class="tomorrow-card">
      <div class="tomorrow-label">🌱 あしたやってみよう！</div>
      <div id="tomorrow-body">${summaryTomorrowHTML()}</div>
    </div>`;
}

/** きろくノートカードを返す（内部ヘルパー） */
function _renderNoteCard() {
  return `
    <div class="note-card">
      <div class="note-label">📓 きろくノート</div>
      <div class="note-hint">きょうのきもちを えらんでみよう</div>
      <div class="note-stamp-row">${noteStampsHTML()}</div>
      <div class="note-hint-guide">↓ ヒントをタップしてかきだそう</div>
      <div class="note-hint-row">${noteHintsHTML()}</div>
      <textarea class="note-textarea" id="note-input"
        placeholder="（じゆうにかいてね）"
        oninput="App.onNoteInput(this.value)">${esc(S.currentNote)}</textarea>
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
