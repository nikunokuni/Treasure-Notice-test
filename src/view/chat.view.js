/* ═══════════════════════════════════════════════════════════
   たからさがし — chat.view.js
   チャット画面
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
   6. チャット
   ══════════════════════════════════ */

/** チャット画面を返す */
function renderChat() {
  const u        = S.user;
  const showFinishBtn = S.phase4ConfirmDone;
  const phaseDots = [1, 2, 3, 4].map(n => `
    <div class="phase-dot-simple ${S.chatPhase > n ? 'phase-s-done' : ''} ${S.chatPhase === n ? 'phase-s-active' : ''}"></div>
    ${n < 4 ? '<div class="phase-line-simple"></div>' : ''}`).join('');

  const inputPlaceholder = S.speaker === 'child'
    ? 'かんがえてみよう…'
    : `${esc(u.parentName)}もかんがえてみよう…`;

  return `
    <div class="chat-wrap">
      <div class="chat-status-row">
        <div class="speaker-btn ${S.speaker === 'child'  ? 'active-child'  : ''}"
             onclick="App.setSpeaker('child')">👦 ${esc(u.name || 'こども')}</div>
        <div class="phase-bar-simple">${phaseDots}</div>
        <div class="speaker-btn ${S.speaker === 'parent' ? 'active-parent' : ''}"
             onclick="App.setSpeaker('parent')">👨 ${esc(u.parentName)}</div>
      </div>
      <div class="chat-area" id="chat-area">
        ${S.messages.map(renderBubble).join('')}
        ${S.isLoading  ? _renderTypingBubble() : ''}
        ${S.lastError  ? _renderChatError()    : ''}
        ${S.showDecisionButtons && !S.isLoading ? `
          <div class="decision-buttons">
            <button class="decision-btn decision-save"    onclick="App.chooseSaveNow()">📦 たからをしまう</button>
            <button class="decision-btn decision-explore" onclick="App.chooseKeepExploring()">🔍 もっとたんけんする</button>
          </div>` : ''}
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="chat-in"
          placeholder="${inputPlaceholder}"
          ${S.isLoading ? 'disabled' : ''}>
        <button class="chat-send" onclick="App.sendChat()" ${S.isLoading ? 'disabled' : ''}>➤</button>
      </div>
      ${showFinishBtn ? `
        <button class="finish-btn finish-btn-ready" onclick="App.goSummary()">
          📦 たからをしまう
        </button>` : ''}
    </div>
    ${_renderFirstStickerModal()}`;
}

/** 初回シール取得モーダルを返す（内部ヘルパー） */
function _renderFirstStickerModal() {
  if (!S.firstStickerPending) return '';
  return `
    <div class="modal-overlay badge-new-overlay" onclick="App.closeFirstStickerModal()">
      <div class="modal-box badge-new-box" onclick="event.stopPropagation()">
        <div class="badge-new-burst">🎉</div>
        <div class="badge-new-icon">🎀</div>
        <div class="badge-new-ttl">はじめてのシール！</div>
        <div class="badge-new-name">🎀 シールをゲットしたよ</div>
        <div class="badge-new-cond">せっていの「シールをはる」で かざってみよう</div>
        <button class="btn-primary badge-new-ok" onclick="App.closeFirstStickerModal()">やったー！</button>
      </div>
    </div>`;
}

/** AIタイピング中バブルを返す（内部ヘルパー） */
function _renderTypingBubble() {
  return `
    <div class="bubble-ai">
      <div class="ai-avatar">🔍</div>
      <div class="bubble-ai-text">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>`;
}

/** チャットエラー行を返す（内部ヘルパー） */
function _renderChatError() {
  return `
    <div class="chat-error-row">
      ⚠️ つながらなかったよ
      <button class="retry-btn" onclick="App.retryLastSend()">もう一度</button>
    </div>`;
}

/** チャットバブル1件を返す */
function renderBubble(m) {
  if (m.role === 'ai') return `
    <div class="bubble-ai">
      <div class="ai-avatar">🔍</div>
      <div class="bubble-ai-text">${aiText(m.text)}</div>
    </div>`;
  if (m.role === 'child') return `
    <div class="bubble-child">
      <div class="bubble-child-text">${esc(m.text)}</div>
    </div>`;
  return `
    <div class="bubble-parent-wrap">
      <div class="bubble-parent-who">${esc(S.user.parentName)}</div>
      <div class="bubble-parent-row">
        <div class="bubble-parent-text">${esc(m.text)}</div>
      </div>
    </div>`;
}
