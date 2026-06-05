/* ═══════════════════════════════════════════════════════
   たからさがし — view.js
   「UI描画」の全て (render関数群)

   ■ ファイル構成
   1. ユーティリティ（共通パーツ）
   2. タブバー / チャットヘッダー
   3. オンボーディング
   4. ホーム
   5. レンズ選択
   6. チャット
   7. サマリー
   8. カレンダー
   9. たからばこ
  10. おきにいり（バッヂ・ノート含む）
  11. てちょう
  12. たからカード（共通）
  13. せってい
   ═══════════════════════════════════════════════════════ */


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


/* ══════════════════════════════════
   3. オンボーディング
   ══════════════════════════════════ */

/** オンボーディング画面を返す */
function renderOnboard() {
  const s    = S.step;
  const u    = S.user;
  const dots = [0, 1, 2, 3, 4].map(i =>
    `<div class="step-dot ${i < s ? 'done' : i === s ? 'active' : ''}"></div>`
  ).join('');

  return `
    <div class="onboard-wrap">
      <div class="onboard-hero">
        <span class="onboard-emoji">🔍</span>
        <div class="onboard-ttl">たから<em>さがし</em></div>
        <div class="onboard-sub">まいにちのふとした きづきが、<br>まなびのたからになる</div>
      </div>
      <div class="step-dots">${dots}</div>
      ${_renderOnboardStep(s, u)}
      <div class="onboard-actions">
        <button class="btn-primary" onclick="App.obNext()">
          ${s < 4 ? 'つぎへ ›' : 'はじめる 🔍'}
        </button>
        ${s > 0 ? `<button class="btn-secondary" onclick="App.obBack()">← もどる</button>` : ''}
      </div>
    </div>`;
}

/**
 * オンボーディングのステップごとのbody部分を返す（内部ヘルパー）
 * @param {number} s - ステップ番号
 * @param {Object} u - ユーザーオブジェクト
 */
function _renderOnboardStep(s, u) {
  if (s === 0) return `
    <div class="form-block">
      <div class="form-label">お子さんの <em>よびかた</em></div>
      <input class="form-input" id="ob-name" placeholder="れい：はるくん" value="${esc(u.name)}">
      <div class="form-error" id="ob-name-err">なまえをいれてください</div>
    </div>
    <div class="form-block">
      <div class="form-label"><em>ねんれい</em>をえらんでね</div>
      ${renderAgeIconRow(u.ageGroup, 'App.toggleObAge()', S.obAgeOpen)}
    </div>`;

  if (s === 1) return `
    <div class="form-block">
      <div class="form-label"><em>まなびのタイプ</em>をえらんでね</div>
      ${renderTypeIconRow(u.type, 'App.toggleObType()', S.obTypeOpen)}
    </div>`;

  if (s === 2) return `
    <div class="form-block">
      <div class="form-label">すきなもの <em>（じゆうに）</em></div>
      <input class="form-input" id="ob-likes" placeholder="ポケモン・サッカー…" value="${esc(u.likes)}">
    </div>`;

  if (s === 3) return `
    <div class="form-block">
      <div class="form-label"><em>いっしょにするひと</em>のよびかた</div>
      <div class="parent-chips">${renderParentChips(u.parentName)}</div>
    </div>
    <p class="onboard-settings-note">⚙️ せってい からいつでも かえられます</p>`;

  // s === 4: カラー選択
  const colorChips = COLOR_THEMES.map(t => `
    <div class="color-theme-chip ${S.theme === t.id ? 'selected' : ''}"
         onclick="App.setTheme('${t.id}')"
         style="background:${t.amber}">
      <span class="color-theme-check">${S.theme === t.id ? '✓' : ''}</span>
      <span class="color-theme-name">${t.name}</span>
    </div>`).join('');
  return `
    <div class="form-block">
      <div class="form-label">🎨 すきな <em>いろ</em> をえらんでね</div>
      <div class="form-label form-label--sub">パパ・ママといっしょにえらぼう！</div>
      <div class="color-theme-grid">${colorChips}</div>
    </div>`;
}

/* ── 年齢・タイプ 共通部品 ── */

/** 年齢アイコン行（選択UI）を返す */
function renderAgeIconRow(current, toggleFn, isOpen) {
  const icons = AGE_PROMPTS.map(a => `
    <div class="icon-sel-item ${current === a.id ? 'icon-sel-active' : ''}">
      <div class="icon-sel-badge ${current === a.id ? 'icon-sel-badge-on' : ''}">${a.icon}</div>
      ${current === a.id ? `<div class="icon-sel-current-lbl">${a.label}</div>` : ''}
    </div>`).join('');
  return `
    <div class="icon-row-select" onclick="${toggleFn}">
      ${icons}
      <span class="icon-row-chevron ${isOpen ? 'open' : ''}">▾</span>
    </div>
    ${isOpen ? `<div class="icon-row-detail">${renderAgeCards(current)}</div>` : ''}`;
}

/** タイプアイコン行（選択UI）を返す */
function renderTypeIconRow(current, toggleFn, isOpen) {
  const icons = TYPES.map(t => `
    <div class="icon-sel-item ${current === t.id ? 'icon-sel-active' : ''}">
      <div class="icon-sel-badge ${current === t.id ? 'icon-sel-badge-type' : ''}">${t.icon}</div>
      ${current === t.id ? `<div class="icon-sel-current-lbl">${t.name}</div>` : ''}
    </div>`).join('');
  return `
    <div class="icon-row-select" onclick="${toggleFn}">
      ${icons}
      <span class="icon-row-chevron ${isOpen ? 'open' : ''}">▾</span>
    </div>
    ${isOpen ? `<div class="icon-row-detail">${renderTypeCards(current)}</div>` : ''}`;
}

/** 年齢カード一覧を返す */
function renderAgeCards(current) {
  return AGE_PROMPTS.map(a => `
    <div class="type-card ${current === a.id ? 'sel-age' : ''}" onclick="App.setAge('${a.id}')">
      <div class="type-badge type-badge-age">${a.icon}</div>
      <div class="type-info">
        <div class="type-name">${a.label}</div>
        <div class="type-desc">${a.desc}</div>
      </div>
    </div>`).join('');
}

/** タイプカード一覧を返す */
function renderTypeCards(current) {
  return TYPES.map(t => `
    <div class="type-card ${current === t.id ? 'sel-' + t.id : ''}" onclick="App.setType('${t.id}')">
      <div class="type-badge type-badge-${t.id}">${t.icon}</div>
      <div class="type-info">
        <div class="type-name">${t.name}</div>
        <div class="type-desc">${t.desc}</div>
      </div>
    </div>`).join('');
}

/** 保護者よびかたチップ一覧を返す */
function renderParentChips(current) {
  return PARENT_OPTS.map(p => `
    <div class="parent-chip ${current === p ? 'sel' : ''}" onclick="App.setParent('${esc(p)}')">${esc(p)}</div>`
  ).join('');
}


/* ══════════════════════════════════
   4. ホーム
   ══════════════════════════════════ */

/** ホーム画面を返す */
function renderHome() {
  const u    = S.user;
  const type = TYPES.find(t => t.id === u.type) || TYPES[0];
  const age  = AGE_PROMPTS.find(a => a.id === (u.ageGroup || 'young')) || AGE_PROMPTS[0];
  const r    = S.randOdai || pickRand();
  if (!S.randOdai) S.randOdai = r;

  return `
    ${_renderStreakBrokenPop()}
    <div class="content">
      ${_renderHomeStats()}
      ${_renderTypeBadges(type, age)}
      ${_renderMainActions()}
      ${_renderRandCard(r)}
      ${_renderPrevTakara()}
    </div>`;
}

/** れんぞく途切れポップアップを返す（内部ヘルパー） */
function _renderStreakBrokenPop() {
  if (!S.streakBrokenPop) return '';
  return `
    <div class="streak-broken-pop" id="streak-broken-pop">
      <div class="streak-broken-inner">
        <div class="streak-broken-emoji">😢</div>
        <div>
          <div class="streak-broken-ttl">れんぞくがとぎれちゃったよ</div>
          <div class="streak-broken-sub">でも${S.streakBrokenCount}にちも つづけたのはすごい！また今日からいこう🔥</div>
        </div>
        <button class="streak-broken-close" onclick="App.dismissStreakPop()">✕</button>
      </div>
    </div>`;
}

/** ホーム統計ストリップ（週ドット含む）を返す（内部ヘルパー） */
function _renderHomeStats() {
  const today     = new Date();
  const weekDots  = Array.from({ length: 7 }, (_, i) => {
    const d       = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const done    = S.records.some(rec => {
      const rd = new Date(rec.date);
      return rd.getFullYear() === d.getFullYear()
          && rd.getMonth()    === d.getMonth()
          && rd.getDate()     === d.getDate();
    });
    const isToday = i === 6;
    return `<span class="week-dot ${done ? 'done' : ''} ${isToday ? 'today' : ''}">${done ? '✅' : (isToday ? '⭕' : '○')}</span>`;
  }).join('');

  const streakMsg = S.streak === 0      ? 'きょうからはじめよう！'
    : S.streak < 3                      ? `${S.streak}にちれんぞく！このちょうし！`
    : S.streak < 7                      ? `すごい！${S.streak}にちれんぞく中🎉`
    :                                     `${S.streak}にち！もうヒーローだ⭐`;

  const totalDays   = calcTotalDays();
  const totalTakara = S.records.length;

  return `
    <div class="home-stats-strip">
      <div class="home-stat-chip">
  　    <span class="hsc-lbl">れんぞく</span>
        <span class="hsc-icon">🔥</span>
        <span class="hsc-num">${S.streak}+"にち"</span>  
      </div>
      <div class="hsc-divider"></div>
      <div class="home-stat-chip">
        <span class="hsc-lbl">つうさん</span>
        <span class="hsc-icon">📅</span>
        <span class="hsc-num">${totalDays}+"にち"</span>
      </div>
      <div class="hsc-divider"></div>
      <div class="home-stat-chip">
        <span class="hsc-lbl">たから</span>
        <span class="hsc-icon">📦</span>
        <span class="hsc-num">${totalTakara}+"こ"</span>
      </div>
    </div>
    <div class="home-week-row">
      <div class="home-week-dots">${weekDots}</div>
      <div class="home-streak-msg-inline">${streakMsg}</div>
    </div>`;
}

/** タイプ/年齢バッジ行を返す（内部ヘルパー） */
function _renderTypeBadges(type, age) {
  return `
    <div class="home-type-badges">
      <div class="home-type-badge htb-${type.id}" onclick="App.switchTab('set')">
        ${type.icon} ${esc(type.name)} ›
      </div>
      <div class="home-type-badge htb-age" onclick="App.switchTab('set')">
        ${age.icon} ${esc(age.label)} ›
      </div>
    </div>`;
}

/** メインアクションブロックを返す（内部ヘルパー） */
function _renderMainActions() {
  return `
    <div class="main-block">
      <div class="main-block-label">🔍 きょうのたからをさがそう</div>
      <div class="main-actions">
        <div class="main-action-card main-free">
          <div class="main-action-label">✏️ いまきになること</div>
          <div class="free-row">
            <input class="free-input" id="free-in" placeholder="なんでもかいてみよう…">
            <button class="free-go" id="free-go-btn">➤</button>
          </div>
        </div>
        <div class="main-action-card main-photo">
          <input type="file" accept="image/*" id="photo-input">
          <div class="main-photo-inner">
            <span class="main-photo-icon">📷</span>
            <div>
              <div class="main-action-label">しゃしんでおだいをつくる</div>
              <div class="main-action-sub">とった写真をAIがよみとるよ</div>
            </div>
            <span class="main-photo-arrow">›</span>
          </div>
        </div>
      </div>
    </div>`;
}

/** ランダムおだいカード（ミニ）を返す（内部ヘルパー） */
function _renderRandCard(r) {
  if (S.odaiGenerating) return `
    <div class="rand-card-mini rand-loading">
      ${renderSpinner(14)}
      <span>おだいをかんがえてるよ…</span>
    </div>`;
  return `
    <div class="rand-card-mini" id="rand-card">
      <span class="rand-mini-emoji">${r.emoji}</span>
      <span class="rand-mini-label">🎲 ランダム：${esc(r.name)}</span>
      <button class="rand-mini-reroll" id="reroll-btn">ふりなおす</button>
      <span class="rand-mini-arrow">›</span>
    </div>`;
}

/** まえのたからセクションを返す（内部ヘルパー） */
function _renderPrevTakara() {
  const latestRec    = S.records.length > 0 ? S.records[S.records.length - 1] : null;
  const oneWeekAgo   = new Date(Date.now() - 7 * 86400000);
  const lastWeekRecs = S.records.filter(rec => {
    const d = new Date(rec.date);
    return d >= oneWeekAgo && rec !== latestRec;
  });
  const weekRandRec  = lastWeekRecs.length > 0
    ? lastWeekRecs[Math.floor(Math.random() * lastWeekRecs.length)]
    : null;

  if (!latestRec && !weekRandRec) return '';

  const renderMiniCard = (rec, tag) => `
    <div class="prev-takara-mini" onclick="App.goToLens(${JSON.stringify(rec.odai)})">
      <span class="prev-mini-emoji">${rec.odai.emoji}</span>
      <div class="prev-mini-info">
        <div class="prev-mini-tag">${tag}</div>
        <div class="prev-mini-name">${esc(rec.odai.name)}</div>
        <div class="prev-mini-meta">${fmtDate(rec.date)}</div>
      </div>
    </div>`;

  return `
    <div class="section-ttl section-ttl--top">まえのたから</div>
    <div class="prev-takara-mini-row">
      ${latestRec  ? renderMiniCard(latestRec,  'さいきん')  : ''}
      ${weekRandRec ? renderMiniCard(weekRandRec, 'せんしゅう') : ''}
    </div>`;
}


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
      <div class="lens-odai-pill-wrap">
        <div class="odai-pill">
          <span class="odai-pill-emoji">${esc(S.odai.emoji)}</span>
          <span class="odai-pill-name">${esc(S.odai.name)}</span>
        </div>
      </div>
      ${shortcutBanner}
      <div class="lens-hint">どのレンズでみてみる？ひとつだけえらんでね 🔍</div>
      <div class="lens-grid">${lensCards}</div>
      <button class="btn-dark" onclick="App.startChat()" ${!S.lens ? 'disabled' : ''}>
        ${startBtnText}
      </button>
      <button class="btn-secondary" onclick="App.closeChatFlow()">← おだいにもどる</button>
    </div>`;
}


/* ══════════════════════════════════
   6. チャット
   ══════════════════════════════════ */

/** チャット画面を返す */
function renderChat() {
  const u        = S.user;
  const isPhase4 = S.chatPhase >= 4;
  const phaseDots = [1, 2, 3, 4].map(n => `
    <div class="phase-dot-simple ${S.chatPhase > n ? 'phase-s-done' : ''} ${S.chatPhase === n ? 'phase-s-active' : ''}"></div>
    ${n < 4 ? '<div class="phase-line-simple"></div>' : ''}`).join('');

  const inputPlaceholder = S.speaker === 'child'
    ? 'かんがえてみよう…'
    : `${esc(u.parentName)}もかんがえてみよう…`;

  return `
    <div class="phase-bar-wrap-simple">
      <div class="phase-bar-simple">${phaseDots}</div>
    </div>
    <div class="chat-wrap">
      <div class="speaker-row">
        <div class="speaker-btn ${S.speaker === 'child'  ? 'active-child'  : ''}"
             onclick="App.setSpeaker('child')">👦 ${esc(u.name || 'こども')}</div>
        <div class="speaker-btn ${S.speaker === 'parent' ? 'active-parent' : ''}"
             onclick="App.setSpeaker('parent')">👨 ${esc(u.parentName)}</div>
      </div>
      <div class="chat-area" id="chat-area">
        ${S.messages.map(renderBubble).join('')}
        ${S.isLoading  ? _renderTypingBubble() : ''}
        ${S.lastError  ? _renderChatError()    : ''}
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="chat-in"
          placeholder="${inputPlaceholder}"
          ${S.isLoading ? 'disabled' : ''}>
        <button class="chat-send" onclick="App.sendChat()" ${S.isLoading ? 'disabled' : ''}>➤</button>
      </div>
      ${isPhase4 ? `
        <button class="finish-btn finish-btn-ready" onclick="App.goSummary()">
          📦 たからをしまう
        </button>` : ''}
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


/* ══════════════════════════════════
   8. カレンダー
   ══════════════════════════════════ */

/** カレンダー画面を返す */
function renderCal() {
  const now   = new Date();
  const year  = S.calYear  ?? now.getFullYear();
  const month = S.calMonth ?? now.getMonth();
  const isThisMonth = (year === now.getFullYear() && month === now.getMonth());

  // 日別レコードマップを構築
  const dayMap = {};
  S.records.forEach(r => {
    const d = new Date(r.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push(r);
    }
  });

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName   = `${year}ねん${month + 1}がつ`;
  const dows        = ['日', '月', '火', '水', '木', '金', '土'];
  const monthDays   = Object.keys(dayMap).length;
  const monthTakara = Object.values(dayMap).reduce((a, v) => a + v.length, 0);

  // カレンダーセルを構築
  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday   = isThisMonth && d === now.getDate();
    const isStamped = !!dayMap[d];
    const stamp     = isStamped ? (dayMap[d][0].odai?.emoji || '🔍') : '';
    const onclick   = isStamped ? `onclick="App.showDayTakara(${year},${month},${d})"` : '';
    cells += `
      <div class="cal-day ${isToday ? 'today' : ''} ${isStamped ? 'stamped' : ''}" ${onclick}>
        ${isStamped ? `<div class="cal-stamp">${stamp}</div>` : ''}
        <div class="cal-day-num ${isStamped ? 'cal-day-num--stamped' : ''}">${d}</div>
      </div>`;
  }

  return `
    <div class="content">
      <div class="cal-header">
        <button class="cal-nav" onclick="App.calPrev()">‹</button>
        <div class="cal-month">${monthName}</div>
        <button class="cal-nav" onclick="App.calNext()">›</button>
      </div>
      <div class="cal-month-stats">
        <div class="cal-month-stat">
          <span class="cal-month-stat-num">${monthDays}</span>
          <span class="cal-month-stat-lbl">にち たんけん</span>
        </div>
        <div class="cal-month-stat-div"></div>
        <div class="cal-month-stat">
          <span class="cal-month-stat-num">${monthTakara}</span>
          <span class="cal-month-stat-lbl">こ たから</span>
        </div>
      </div>
      <div class="cal-grid">
        ${dows.map((d, i) => `<div class="cal-dow ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}">${d}</div>`).join('')}
        ${cells}
      </div>
    </div>
    ${S.dayModal ? renderDayModal() : ''}`;
}

/** 日別モーダルを返す */
function renderDayModal() {
  const m       = S.dayModal;
  const records = S.records.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === m.year && d.getMonth() === m.month && d.getDate() === m.day;
  });
  return `
    <div class="modal-overlay" onclick="App.closeDayModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="App.closeDayModal()">✕</button>
        <div class="modal-ttl">${m.month + 1}がつ${m.day}にちのたから</div>
        ${records.map(r => renderTakaraCard(r, false)).join('')}
      </div>
    </div>`;
}


/* ══════════════════════════════════
   9. たからばこ
   ══════════════════════════════════ */

/** たからばこ画面を返す */
function renderBox() {
  const recs      = S.records.slice().reverse();
  const lensCount = {};
  LENSES.forEach(l => { lensCount[l.id] = 0; });
  S.records.forEach(r => { if (r.lens && lensCount[r.lens] !== undefined) lensCount[r.lens]++; });

  const maxCount = Math.max(1, ...Object.values(lensCount));
  const LENS_COLORS = {
    ことば: 'var(--coral)',
    かず:   'var(--teal)',
    かがく: 'var(--mint)',
    しゃかい:'var(--amber)',
    じぶん: '#ffd166',
  };

  const lensTagIds   = LENSES.map(l => l.id);
  const filteredRecs = (S.boxFilterTag && lensTagIds.includes(S.boxFilterTag))
    ? recs.filter(r => r.lens === S.boxFilterTag)
    : recs;

  return `
    <div class="content">
      ${S.records.length > 0 ? `
        <div class="section-ttl">にちべつのたから（1しゅうかん）</div>
        <div class="week-bar-card">
          <div class="week-bar-grid">${_renderWeekBars()}</div>
        </div>
        <div class="section-ttl section-ttl--top">レンズべつのはっけん</div>
        <div class="lens-compare-grid">
          ${LENSES.map(l => `
            <div class="lens-compare-row">
              <span class="lens-compare-icon">${l.icon}</span>
              <span class="lens-compare-name">${esc(l.name)}</span>
              <div class="lens-compare-bar-wrap">
                <div class="lens-compare-bar"
                     style="width:${Math.round(lensCount[l.id] / maxCount * 100)}%;background:${LENS_COLORS[l.id] || 'var(--amber)'}"></div>
              </div>
              <span class="lens-compare-count">${lensCount[l.id]}</span>
            </div>`).join('')}
        </div>` : ''}

      ${_renderBoxFilterBar()}

      ${filteredRecs.length === 0
        ? renderEmptyMsg('📦', S.boxFilterTag ? 'このレンズのたからはまだないよ' : 'まだたからがないよ<br>さがしにいこう！')
        : `<div class="section-ttl">すべてのたから ${S.boxFilterTag ? `（${esc(S.boxFilterTag)}）` : ''}</div>`
          + filteredRecs.map(r => renderTakaraCard(r, true)).join('')}
    </div>`;
}

/** 週間棒グラフHTMLを返す（内部ヘルパー） */
function _renderWeekBars() {
  const dailyData = {};
  S.records.forEach(r => {
    const key = new Date(r.date).toDateString();
    dailyData[key] = (dailyData[key] || 0) + 1;
  });

  const today    = new Date();
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key      = d.toDateString();
    const count    = dailyData[key] || 0;
    const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    weekDays.push({ count, dayLabel, isToday: i === 0 });
  }
  const maxDaily = Math.max(1, ...weekDays.map(d => d.count));

  return weekDays.map(d => `
    <div class="week-bar-col">
      <div class="week-bar-count">${d.count > 0 ? d.count : ''}</div>
      <div class="week-bar-wrap">
        <div class="week-bar-fill ${d.isToday ? 'week-bar-today' : ''}"
             style="height:${Math.round(d.count / maxDaily * 100)}%"></div>
      </div>
      <div class="week-bar-label ${d.isToday ? 'week-bar-label-today' : ''}">${d.dayLabel}</div>
    </div>`).join('');
}

/** フィルターバーHTMLを返す（内部ヘルパー） */
function _renderBoxFilterBar() {
  return `
    <div class="box-filter-bar">
      <div class="box-filter-wrap">
        <div class="box-filter-chip ${!S.boxFilterTag ? 'active' : ''}" onclick="App.setBoxFilter(null)">すべて</div>
        ${LENSES.map(l => `
          <div class="box-filter-chip box-filter-lens ${S.boxFilterTag === l.id ? 'active' : ''}"
               onclick="App.setBoxFilter('${l.id}')">${l.icon} ${esc(l.name)}</div>`).join('')}
      </div>
    </div>`;
}


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
    ${_renderBadgeDetailModal()}`;
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


/* ══════════════════════════════════
  11. てちょう
   ══════════════════════════════════ */

/** てちょう一覧セクション（おきにいりタブ内）を返す */
function renderNotebookSection() {
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
         style="background:${theme.bg}"
         onclick="App.placeItem(event)">
      ${items}
    </div>`;
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
         style="background:${theme.bg};transform:scale(${scale});margin-bottom:${negH}px;margin-right:${negW}px">
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


/* ══════════════════════════════════
  12. たからカード（共通パーツ）
   ══════════════════════════════════ */

/** たからカード1件を返す（共通パーツ） */
function renderTakaraCard(r, showFavBtn) {
  const FINDING_COLORS = ['#e8860a', '#0a9396', '#e76f51', '#52b788', '#9b89c4', '#ffd166'];
  const lens           = LENSES.find(l => l.id === r.lens);
  const idx            = S.records.lastIndexOf(r);
  const odaiJson       = JSON.stringify(r.odai).replace(/'/g, '&#39;');

  const findingsHtml = (r.findings || []).map((f, i) => `
    <div class="takara-finding">
      <div class="finding-dot finding-dot--card" style="background:${FINDING_COLORS[i % FINDING_COLORS.length]}"></div>
      ${esc(f)}
    </div>`).join('');

  const favBtnHtml = showFavBtn ? `
    <div class="takara-action-row">
      <button class="takara-fav-btn ${r.bookmarked ? 'active' : ''}"
              data-idx="${idx}"
              onclick="event.stopPropagation();App.toggleRecordFav(${idx})">🔖</button>
      <button class="takara-delete-btn"
              onclick="event.stopPropagation();App.deleteRecord(${idx})">🗑️</button>
    </div>` : '';

  return `
    <div class="takara-item" onclick="App.goToLens(${odaiJson})" style="cursor:pointer">
      <div class="takara-item-header">
        <span class="takara-item-emoji">${r.odai.emoji}</span>
        <span class="takara-item-name">${esc(r.odai.name)}</span>
        ${lens ? `<span class="takara-item-lens">${lens.icon} ${esc(lens.name)}</span>` : ''}
      </div>
      <div class="takara-findings">${findingsHtml}</div>
      ${r.note ? `<div class="takara-note">📓 ${esc(r.note)}</div>` : ''}
      <div class="takara-item-date">${fmtDate(r.date)}</div>
      ${favBtnHtml}
    </div>`;
}


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
    </div>`;
}

/** こどもよう設定を返す（内部ヘルパー） */
function _renderSettingsKid() {
  const u  = S.user;
  const fs = S.fontSize || 'medium';

  const colorChips = COLOR_THEMES.map(t => `
    <div class="color-theme-chip ${S.theme === t.id ? 'selected' : ''}"
         onclick="App.setTheme('${t.id}')"
         style="background:${t.amber}">
      <span class="color-theme-check">${S.theme === t.id ? '✓' : ''}</span>
      <span class="color-theme-name">${t.name}</span>
    </div>`).join('');

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
      <div class="settings-row-2col settings-row-icon">
        <div class="settings-field settings-field-half">
          <div class="settings-field-label">ねんれい</div>
          ${renderAgeIconRow(u.ageGroup, 'App.toggleSettingsAge()', S.settingsAgeOpen)}
        </div>
        <div class="settings-field settings-field-half">
          <div class="settings-field-label">まなびのタイプ</div>
          ${renderTypeIconRow(u.type, 'App.toggleSettingsType()', S.settingsTypeOpen)}
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">いっしょにするひと</div>
      <div class="settings-field">
        <div class="settings-field-label">よびかた</div>
        <div class="parent-chips">${renderParentChips(u.parentName)}</div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">🎨 アプリのいろ</div>
      <div class="settings-field-hint">パパ・ママといっしょにえらんでね</div>
      <div class="color-theme-grid">${colorChips}</div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">📌 カードのふせん</div>
      <div class="sticky-color-grid">${stickyBtns}</div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">表示設定</div>
      <div class="settings-field">
        <div class="settings-field-label">文字サイズ</div>
        <div class="font-size-chips">
          <div class="font-size-chip ${fs === 'small'  ? 'sel' : ''}" onclick="App.setFontSize('small')">ちいさい</div>
          <div class="font-size-chip ${fs === 'medium' ? 'sel' : ''}" onclick="App.setFontSize('medium')">ふつう</div>
          <div class="font-size-chip ${fs === 'large'  ? 'sel' : ''}" onclick="App.setFontSize('large')">おおきい</div>
        </div>
      </div>
    </div>`;
}

/** おとなよう設定を返す（内部ヘルパー） */
function _renderSettingsAdult() {
  const u            = S.user;
  const adultLinks   = ADULT_LINKS.map(l => `
    <div class="adult-link-row" onclick="App.openExternalLink('${l.id}')">
      <span>${l.emoji}</span>
      <span>${l.label}</span>
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
      <div class="settings-field-hint">今週の学びをAIがまとめるよ（${u.parentName}向け）</div>
      ${reportSection}
    </div>

    <div class="settings-section-adult">
      <div class="settings-ttl-adult">データ管理</div>
      <div class="adult-link-row" onclick="App.exportCSV()">
        <span>📤</span><span>データをエクスポート</span>
        <span class="adult-link-arrow">›</span>
      </div>
      <div class="adult-link-row" onclick="App.triggerImport()">
        <span>📥</span><span>データをインポート</span>
        <span class="adult-link-arrow">›</span>
      </div>
      <input type="file" id="csv-import-input" accept=".csv" style="display:none" onchange="App.importCSV(event)">
    </div>

    <div class="settings-section-adult">
      <div class="settings-ttl-adult">意見・要望</div>
      <div class="settings-field-hint">アプリをよりよくするために、きいてね！</div>
      <button class="btn-primary settings-feedback-btn" onclick="App.sendFeedback()">📨 フォームをひらく</button>
    </div>

    <div class="settings-section-adult">
      <div class="settings-ttl-adult">その他</div>
      ${adultLinks}
    </div>`;
}
