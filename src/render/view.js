/* ═══════════════════════════════
   たからさがし — view.js
   「UI描画」の全て (render関数群)
   ═══════════════════════════════ */

/* ── タブバー（5タブ） ── */
function renderTabs() {
  const tabs = [
    { id:'home', icon:'🏠', label:'ホーム',     cls:'tab-home' },
    { id:'cal',  icon:'🗓️', label:'カレンダー', cls:'tab-cal'  },
    { id:'box',  icon:'📦', label:'たからばこ', cls:'tab-box'  },
    { id:'fav',  icon:'⭐', label:'おきにいり', cls:'tab-fav'  },
    { id:'set',  icon:'⚙️', label:'せってい',   cls:'tab-set'  },
  ];
  return `
    <div class="tabs">
      ${tabs.map(t => `
        <div class="tab ${t.cls} ${S.tab === t.id ? 'active' : ''}" onclick="App.switchTab('${t.id}')">
          <span class="tab-icon">${t.icon}</span>
          <span class="tab-label">${t.label}</span>
        </div>`).join('')}
    </div>
    <div class="tab-line"></div>`;
}

/* ── チャットヘッダー ── */
function renderChatHeader() {
  const lens = LENSES.find(l => l.id === S.lens);
  return `
    <div class="chat-header">
      <div class="chat-header-info">
        <span class="chat-header-emoji">${esc(S.odai?.emoji || '')}</span>
        <span class="chat-header-name">${esc(S.odai?.name || '')}</span>
        ${lens ? `<span class="chat-header-lens">${lens.icon} ${esc(lens.name)}</span>` : ''}
      </div>
      <button class="back-btn" onclick="App.closeChatFlow()">◀ ホームにもどる</button>
    </div>`;
}

/* ══════════════════════════
   オンボーディング
   ══════════════════════════ */
function renderOnboard() {
  const s = S.step;
  const u = S.user;
  const dots = [0,1,2,3,4].map(i =>
    `<div class="step-dot ${i < s ? 'done' : i === s ? 'active' : ''}"></div>`
  ).join('');

  let body = '';
  if (s === 0) {
    body = `
      <div class="form-block">
        <div class="form-label">お子さんの <em>よびかた</em></div>
        <input class="form-input" id="ob-name" placeholder="れい：はるくん" value="${esc(u.name)}">
        <div class="form-error" id="ob-name-err">なまえをいれてください</div>
      </div>
      <div class="form-block">
        <div class="form-label"><em>ねんれい</em>をえらんでね</div>
        ${renderAgeIconRow(u.ageGroup, "App.toggleObAge()", S.obAgeOpen)}
      </div>`;
  } else if (s === 1) {
    body = `
      <div class="form-block">
        <div class="form-label"><em>まなびのタイプ</em>をえらんでね</div>
        ${renderTypeIconRow(u.type, "App.toggleObType()", S.obTypeOpen)}
      </div>`;
  } else if (s === 2) {
    body = `
      <div class="form-block">
        <div class="form-label">すきなもの <em>（じゆうに）</em></div>
        <input class="form-input" id="ob-likes" placeholder="ポケモン・サッカー…" value="${esc(u.likes)}">
      </div>`;
  } else if (s === 3) {
    body = `
      <div class="form-block">
        <div class="form-label"><em>いっしょにするひと</em>のよびかた</div>
        <div class="parent-chips">${renderParentChips(u.parentName)}</div>
      </div>
      <p style="font-size:11px;color:rgba(45,27,0,0.4);line-height:1.7;text-align:center;padding:0 8px;margin-top:4px">
        ⚙️ せってい からいつでも かえられます
      </p>`;
  } else {
    // step === 4: カラー選択
    body = `
      <div class="form-block">
        <div class="form-label">🎨 すきな <em>いろ</em> をえらんでね</div>
        <div class="form-label" style="font-size:10px;margin-top:-4px;margin-bottom:10px;color:rgba(45,27,0,0.35)">
          パパ・ママといっしょにえらぼう！
        </div>
        <div class="color-theme-grid">
          ${COLOR_THEMES.map(t => `
            <div class="color-theme-chip ${S.theme === t.id ? 'selected' : ''}"
                 onclick="App.setTheme('${t.id}')"
                 style="background:${t.amber}">
              <span class="color-theme-check">${S.theme === t.id ? '✓' : ''}</span>
              <span class="color-theme-name">${t.name}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  return `
    <div class="onboard-wrap">
      <div class="onboard-hero">
        <span class="onboard-emoji">🔍</span>
        <div class="onboard-ttl">たから<em>さがし</em></div>
        <div class="onboard-sub">まいにちのふとした きづきが、<br>まなびのたからになる</div>
      </div>
      <div class="step-dots">${dots}</div>
      ${body}
      <div style="padding-top:18px">
        <button class="btn-primary" onclick="App.obNext()">
          ${s < 4 ? 'つぎへ ›' : 'はじめる 🔍'}
        </button>
        ${s > 0 ? `<button class="btn-secondary" onclick="App.obBack()">← もどる</button>` : ''}
      </div>
    </div>`;
}

/* ── 年齢・タイプ 共通部品 ── */
function renderAgeIconRow(current, toggleFn, isOpen) {
  return `
    <div class="icon-row-select" onclick="${toggleFn}">
      ${AGE_PROMPTS.map(a => `
        <div class="icon-sel-item ${current === a.id ? 'icon-sel-active' : ''}">
          <div class="icon-sel-badge ${current === a.id ? 'icon-sel-badge-on' : ''}">${a.icon}</div>
          ${current === a.id ? `<div class="icon-sel-current-lbl">${a.label}</div>` : ''}
        </div>`).join('')}
      <span class="icon-row-chevron ${isOpen ? 'open' : ''}">▾</span>
    </div>
    ${isOpen ? `<div class="icon-row-detail">${renderAgeCards(current)}</div>` : ''}`;
}

function renderTypeIconRow(current, toggleFn, isOpen) {
  return `
    <div class="icon-row-select" onclick="${toggleFn}">
      ${TYPES.map(t => `
        <div class="icon-sel-item ${current === t.id ? 'icon-sel-active' : ''}">
          <div class="icon-sel-badge ${current === t.id ? 'icon-sel-badge-type' : ''}">${t.icon}</div>
          ${current === t.id ? `<div class="icon-sel-current-lbl">${t.name}</div>` : ''}
        </div>`).join('')}
      <span class="icon-row-chevron ${isOpen ? 'open' : ''}">▾</span>
    </div>
    ${isOpen ? `<div class="icon-row-detail">${renderTypeCards(current)}</div>` : ''}`;
}

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

function renderParentChips(current) {
  return PARENT_OPTS.map(p => `
    <div class="parent-chip ${current === p ? 'sel' : ''}" onclick="App.setParent('${esc(p)}')">${esc(p)}</div>`).join('');
}

/* ══════════════════════════
   ホーム
   ══════════════════════════ */
function renderHome() {
  const u    = S.user;
  const type = TYPES.find(t => t.id === u.type) || TYPES[0];
  const age  = AGE_PROMPTS.find(a => a.id === (u.ageGroup || 'young')) || AGE_PROMPTS[0];
  const r    = S.randOdai || pickRand();
  if (!S.randOdai) S.randOdai = r;

  // 週ドット（過去7日）
  const today   = new Date();
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d    = new Date(today); d.setDate(today.getDate() - (6 - i));
    const done = S.records.some(rec => {
      const rd = new Date(rec.date);
      return rd.getFullYear() === d.getFullYear() &&
             rd.getMonth()    === d.getMonth()    &&
             rd.getDate()     === d.getDate();
    });
    const isToday = i === 6;
    return `<span class="week-dot ${done ? 'done' : ''} ${isToday ? 'today' : ''}">${done ? '✅' : (isToday ? '⭕' : '○')}</span>`;
  }).join('');

  const streakMsg = S.streak === 0        ? 'きょうからはじめよう！'
    : S.streak < 3 ? `${S.streak}にちれんぞく！このちょうし！`
    : S.streak < 7 ? `すごい！${S.streak}にちれんぞく中🎉`
    : `${S.streak}にち！もうヒーローだ⭐`;

  const totalDays   = calcTotalDays();
  const totalTakara = S.records.length;

  const brokenPop = S.streakBrokenPop ? `
    <div class="streak-broken-pop" id="streak-broken-pop">
      <div class="streak-broken-inner">
        <div class="streak-broken-emoji">😢</div>
        <div>
          <div class="streak-broken-ttl">れんぞくがとぎれちゃったよ</div>
          <div class="streak-broken-sub">でも${S.streakBrokenCount}にちも つづけたのはすごい！また今日からいこう🔥</div>
        </div>
        <button class="streak-broken-close" onclick="App.dismissStreakPop()">✕</button>
      </div>
    </div>` : '';

  // まえのたから：直近1件と先週のランダム1件
  const latestRec  = S.records.length > 0 ? S.records[S.records.length - 1] : null;
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  const lastWeekRecs = S.records.filter(rec => {
    const d = new Date(rec.date);
    return d >= oneWeekAgo && rec !== latestRec;
  });
  const weekRandRec = lastWeekRecs.length > 0
    ? lastWeekRecs[Math.floor(Math.random() * lastWeekRecs.length)]
    : null;

  return `
    ${brokenPop}
    <div class="content">

     <!-- 統計ストリップ（上段：3列） -->
<div class="home-stats-strip">
  <div class="home-stat-chip">
    <span class="hsc-icon">🔥</span>
    <span class="hsc-num">${S.streak}</span>
    <span class="hsc-lbl">れんぞく</span>
  </div>
  <div class="hsc-divider"></div>
  <div class="home-stat-chip">
    <span class="hsc-icon">📅</span>
    <span class="hsc-num">${totalDays}</span>
    <span class="hsc-lbl">つうさん</span>
  </div>
  <div class="hsc-divider"></div>
  <div class="home-stat-chip">
    <span class="hsc-icon">📦</span>
    <span class="hsc-num">${totalTakara}</span>
    <span class="hsc-lbl">たから</span>
  </div>
</div>
<!-- 下段：週ドット＋メッセージ -->
<div class="home-week-row">
  <div class="home-week-dots">${weekDots}</div>
  <div class="home-streak-msg-inline">${streakMsg}</div>
</div>

      <!-- タイプ/年齢バッジ -->
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:14px">
        <div class="home-type-badge htb-${type.id}" onclick="App.switchTab('set')" style="margin-bottom:0">
          ${type.icon} ${esc(type.name)} ›
        </div>
        <div class="home-type-badge htb-age" onclick="App.switchTab('set')" style="margin-bottom:0">
          ${age.icon} ${esc(age.label)} ›
        </div>
      </div>

      <!-- メインアクションブロック -->
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
              <span style="font-size:28px">📷</span>
              <div>
                <div class="main-action-label">しゃしんでおだいをつくる</div>
                <div class="main-action-sub">とった写真をAIがよみとるよ</div>
              </div>
              <span class="main-photo-arrow">›</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ランダム（小さく補助的に） -->
      ${S.odaiGenerating ? `
        <div class="rand-card-mini rand-loading">
          <span class="spinner" style="width:14px;height:14px"></span>
          <span>おだいをかんがえてるよ…</span>
        </div>` : `
        <div class="rand-card-mini" id="rand-card">
          <span style="font-size:18px">${r.emoji}</span>
          <span class="rand-mini-label">🎲 ランダム：${esc(r.name)}</span>
          <button class="rand-mini-reroll" id="reroll-btn">ふりなおす</button>
          <span style="font-size:14px;color:rgba(45,27,0,0.2)">›</span>
        </div>`}

      <!-- まえのたから（直近1件 + 先週の1件） -->
      ${(latestRec || weekRandRec) ? `
        <div class="section-ttl" style="margin-top:16px">まえのたから</div>
        <div class="prev-takara-mini-row">
          ${latestRec ? `
            <div class="prev-takara-mini" onclick="App.goToLens(${JSON.stringify(latestRec.odai)})">
              <span class="prev-mini-emoji">${latestRec.odai.emoji}</span>
              <div class="prev-mini-info">
                <div class="prev-mini-tag">さいきん</div>
                <div class="prev-mini-name">${esc(latestRec.odai.name)}</div>
                <div class="prev-mini-meta">${fmtDate(latestRec.date)}</div>
              </div>
            </div>` : ''}
          ${weekRandRec ? `
            <div class="prev-takara-mini" onclick="App.goToLens(${JSON.stringify(weekRandRec.odai)})">
              <span class="prev-mini-emoji">${weekRandRec.odai.emoji}</span>
              <div class="prev-mini-info">
                <div class="prev-mini-tag">せんしゅう</div>
                <div class="prev-mini-name">${esc(weekRandRec.odai.name)}</div>
                <div class="prev-mini-meta">${fmtDate(weekRandRec.date)}</div>
              </div>
            </div>` : ''}
        </div>` : ''}
    </div>`;
}

/* ══════════════════════════
   レンズ選択
   ══════════════════════════ */
function renderLens() {
  const sameAsLast = S.lens && S.lens === S.lastLens;
  return `
    <div class="content">
      <div style="margin-bottom:14px">
        <div class="odai-pill">
          <span class="odai-pill-emoji">${esc(S.odai.emoji)}</span>
          <span class="odai-pill-name">${esc(S.odai.name)}</span>
        </div>
      </div>

      ${sameAsLast ? `
        <div class="lens-shortcut-banner">
          <div class="lens-shortcut-left">
            <span style="font-size:20px">${LENSES.find(l => l.id === S.lens)?.icon || ''}</span>
            <div>
              <div style="font-size:var(--fs-sm);font-weight:700;color:var(--deep)">まえと同じ「${esc(S.lens)}」レンズ</div>
              <div style="font-size:var(--fs-xs);color:rgba(45,27,0,0.45)">そのままはじめることもできるよ</div>
            </div>
          </div>
          <button class="btn-shortcut" onclick="App.startChat()">そのままはじめる ›</button>
        </div>` : ''}

      <div class="lens-hint">どのレンズでみてみる？ひとつだけえらんでね 🔍</div>
      <div class="lens-grid">
        ${LENSES.map(l => `
          <div class="lens-card ${l.cls} ${S.lens === l.id ? 'selected' : ''}"
               onclick="App.selectLens('${l.id}')">
            <div style="display:flex;align-items:center;gap:8px">
              <span class="lens-icon">${l.icon}</span>
              <div class="lens-name">${esc(l.name)}</div>
            </div>
            <div class="lens-desc">${esc(l.kidDesc)}</div>
          </div>`).join('')}
      </div>
      <button class="btn-dark" onclick="App.startChat()" ${!S.lens ? 'disabled' : ''}>
        ${!S.lens ? 'レンズをえらんでね' : `${LENSES.find(l => l.id === S.lens)?.icon} ${esc(S.lens)}レンズではじめる ›`}
      </button>
      <button class="btn-secondary" onclick="App.closeChatFlow()">← おだいにもどる</button>
    </div>`;
}

/* ══════════════════════════
   チャット
   ══════════════════════════ */
function renderChat() {
  const u       = S.user;
  const isPhase4 = S.chatPhase >= 4;
  const phaseDots = [1,2,3,4].map(n => `
    <div class="phase-dot-simple ${S.chatPhase > n ? 'phase-s-done' : ''} ${S.chatPhase === n ? 'phase-s-active' : ''}"></div>
    ${n < 4 ? '<div class="phase-line-simple"></div>' : ''}`).join('');

  return `
    <div class="phase-bar-wrap-simple">
      <div class="phase-bar-simple">${phaseDots}</div>
    </div>
    <div class="chat-wrap">
      <div class="speaker-row">
        <div class="speaker-btn ${S.speaker === 'child' ? 'active-child' : ''}"
             onclick="App.setSpeaker('child')">👦 ${esc(u.name || 'こども')}</div>
        <div class="speaker-btn ${S.speaker === 'parent' ? 'active-parent' : ''}"
             onclick="App.setSpeaker('parent')">👨 ${esc(u.parentName)}</div>
      </div>
      <div class="chat-area" id="chat-area">
        ${S.messages.map(renderBubble).join('')}
        ${S.isLoading ? `
          <div class="bubble-ai">
            <div class="ai-avatar">🔍</div>
            <div class="bubble-ai-text">
              <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
          </div>` : ''}
        ${S.lastError ? `
          <div class="chat-error-row">
            ⚠️ つながらなかったよ
            <button class="retry-btn" onclick="App.retryLastSend()">もう一度</button>
          </div>` : ''}
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="chat-in"
          placeholder="${S.speaker === 'child' ? 'かんがえてみよう…' : esc(u.parentName) + 'もかんがえてみよう…'}"
          ${S.isLoading ? 'disabled' : ''}>
        <button class="chat-send" onclick="App.sendChat()" ${S.isLoading ? 'disabled' : ''}>➤</button>
      </div>
      ${isPhase4 ? `
        <button class="finish-btn finish-btn-ready" onclick="App.goSummary()">
          📦 たからをしまう
        </button>` : ''}
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
    <div class="bubble-child"><div class="bubble-child-text">${esc(m.text)}</div></div>`;
  return `
    <div class="bubble-parent-wrap">
      <div class="bubble-parent-who">${esc(S.user.parentName)}</div>
      <div style="display:flex;justify-content:flex-end">
        <div class="bubble-parent-text">${esc(m.text)}</div>
      </div>
    </div>`;
}

/* ══════════════════════════
   サマリー
   ══════════════════════════ */
function renderSummary() {
  const items     = S.summaryItems;
  const paras     = S.summaryOpinion.split(/\n/).filter(Boolean);
  const colors    = ['#e8860a','#0a9396','#e76f51','#52b788','#9b89c4','#ffd166'];
  const savedNote = S.currentNote || '';

  return `
    <div class="content">
      <div id="summary-capture-area">
        <div class="summary-hero">
          <span class="summary-hero-emoji">${esc(S.odai?.emoji || '🔍')}</span>
          <div class="summary-hero-ttl">たからみつかった！</div>
          <div class="summary-hero-sub">${esc(S.odai?.name || '')} · ${esc(S.lens || '')}レンズ</div>
        </div>

        <!-- きょうのたから（消えない） -->
        <div class="findings-card" id="findings-card">
          <button class="bookmark-btn ${S.bookmarked ? 'active' : ''}" onclick="App.toggleBookmark()">🔖</button>
          <div class="findings-label">✨ きょうみつけたたから</div>
          ${items.length === 0
            ? `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(45,27,0,0.4)">
                <span class="spinner"></span>まとめているよ…
              </div>`
            : items.map((f, i) => `
                <div class="finding-item finding-item-anim" style="animation-delay:${0.1 + i * 0.18}s">
                  <div class="finding-dot" style="background:${colors[i % colors.length]}"></div>
                  <div class="finding-text">${esc(f)}</div>
                </div>`).join('')}
        </div>

        <!-- AIのかんがえ（独立DOM） -->
        <div class="ai-opinion-card">
          <div class="ai-opinion-toggle" onclick="App.toggleOpinion()">
            <div class="ai-opinion-label">💡 AIのかんがえ（おとな向け）</div>
            <div class="ai-opinion-chevron ${S.opinionOpen ? 'open' : ''}">▾</div>
          </div>
          <div class="ai-opinion-body" style="display:${S.opinionOpen ? 'block' : 'none'}">
            ${paras.length > 0
              ? paras.map(p => `<div class="ai-opinion-para">${esc(p)}</div>`).join('')
              : `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(45,27,0,0.4)">
                  <span class="spinner"></span>よみこみちゅう…
                </div>`}
          </div>
        </div>
      </div>
<!-- あしたやってみよう！ -->
      <div class="tomorrow-card">
        <div class="tomorrow-label">🌱 あしたやってみよう！</div>
        ${!S.tomorrowHint
          ? `<div class="tomorrow-loading">
               <span class="spinner" style="width:12px;height:12px"></span>
               <span>かんがえているよ…</span>
             </div>`
          : `<div class="tomorrow-text">${esc(S.tomorrowHint)}</div>`}
      </div>
      <!-- きろくノート -->
      <div class="note-card">
        <div class="note-label">📓 きろくノート</div>
        <div style="font-size:var(--fs-xs);color:rgba(45,27,0,0.45);margin-bottom:6px">きょうきづいたこと、おもったことをかいてみよう</div>
        <textarea class="note-textarea" id="note-input" placeholder="（じゆうにかいてね）">${esc(savedNote)}</textarea>
        <button class="note-save-btn" onclick="App.saveNote()">💾 ほぞんする</button>
      </div>

      <!-- アクション -->
      <div class="summary-action-row">
        <button class="summary-action-btn summary-action-again" onclick="App.doAgain()">
          <span class="summary-action-icon">🔄</span>
          <span>べつのレンズで</span>
        </button>
        <button class="summary-action-btn summary-action-next" onclick="App.nextOdai()">
          <span class="summary-action-icon">✨</span>
          <span>つぎのおだい</span>
        </button>
        <button class="summary-action-btn summary-action-save" onclick="App.saveSummaryImage()">
          <span class="summary-action-icon">📸</span>
          <span>ほぞん</span>
        </button>
        <button class="summary-action-btn summary-action-x" onclick="App.shareToX()">
          <span class="summary-action-icon">𝕏</span>
          <span>とうこう</span>
        </button>
      </div>
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

/* ══════════════════════════
   カレンダー
   ══════════════════════════ */
function renderCal() {
  const now   = new Date();
  const year  = S.calYear  ?? now.getFullYear();
  const month = S.calMonth ?? now.getMonth();
  const isThisMonth = (year === now.getFullYear() && month === now.getMonth());

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
  const dows        = ['日','月','火','水','木','金','土'];
  const monthDays   = Object.keys(dayMap).length;
  const monthTakara = Object.values(dayMap).reduce((a, v) => a + v.length, 0);

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
        <div class="cal-day-num" style="${isStamped ? 'font-size:9px;opacity:.5' : ''}">${d}</div>
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

function renderDayModal() {
  const m = S.dayModal;
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

/* ══════════════════════════
   たからばこ
   ══════════════════════════ */
function renderBox() {
  const recs      = S.records.slice().reverse();
  const lensCount = {};
  LENSES.forEach(l => { lensCount[l.id] = 0; });
  S.records.forEach(r => { if (r.lens && lensCount[r.lens] !== undefined) lensCount[r.lens]++; });
  const maxCount   = Math.max(1, ...Object.values(lensCount));
  const lensColors = { ことば:'var(--coral)', かず:'var(--teal)', かがく:'var(--mint)', しゃかい:'var(--amber)', じぶん:'#ffd166' };

  // ── 日別たから棒グラフ（過去7日、今日が右端）──
  const dailyData = {};
  S.records.forEach(r => {
    const key = new Date(r.date).toDateString();
    dailyData[key] = (dailyData[key] || 0) + 1;
  });
  const today = new Date();
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key   = d.toDateString();
    const count = dailyData[key] || 0;
    const dayLabel = ['日','月','火','水','木','金','土'][d.getDay()];
    weekDays.push({ key, count, dayLabel, isToday: i === 0 });
  }
  const maxDaily = Math.max(1, ...weekDays.map(d => d.count));

  const weekBarHtml = weekDays.map(d => `
    <div class="week-bar-col">
      <div class="week-bar-count">${d.count > 0 ? d.count : ''}</div>
      <div class="week-bar-wrap">
        <div class="week-bar-fill ${d.isToday ? 'week-bar-today' : ''}"
             style="height:${Math.round(d.count / maxDaily * 100)}%"></div>
      </div>
      <div class="week-bar-label ${d.isToday ? 'week-bar-label-today' : ''}">${d.dayLabel}</div>
    </div>`).join('');

  // ── フィルターバー（折り返し表示）──
  const lensTagIds   = LENSES.map(l => l.id);
  let   filteredRecs = recs;
  if (S.boxFilterTag && lensTagIds.includes(S.boxFilterTag)) {
    filteredRecs = recs.filter(r => r.lens === S.boxFilterTag);
  }

  const filterBar = `
    <div class="box-filter-bar">
      <div class="box-filter-wrap">
        <div class="box-filter-chip ${!S.boxFilterTag ? 'active' : ''}" onclick="App.setBoxFilter(null)">すべて</div>
        ${LENSES.map(l => `
          <div class="box-filter-chip box-filter-lens ${S.boxFilterTag === l.id ? 'active' : ''}" onclick="App.setBoxFilter('${l.id}')">${l.icon} ${esc(l.name)}</div>`).join('')}
      </div>
    </div>`;

  return `
    <div class="content">
      ${S.records.length > 0 ? `
        <div class="section-ttl">にちべつのたから（1しゅうかん）</div>
        <div class="week-bar-card">
          <div class="week-bar-grid">${weekBarHtml}</div>
        </div>
        <div class="section-ttl" style="margin-top:14px">レンズべつのはっけん</div>
        <div class="lens-compare-grid">
          ${LENSES.map(l => `
            <div class="lens-compare-row">
              <span style="font-size:14px;width:20px">${l.icon}</span>
              <span style="font-size:10px;font-weight:700;color:var(--deep);width:48px">${esc(l.name)}</span>
              <div class="lens-compare-bar-wrap">
                <div class="lens-compare-bar" style="width:${Math.round(lensCount[l.id] / maxCount * 100)}%;background:${lensColors[l.id] || 'var(--amber)'}"></div>
              </div>
              <span class="lens-compare-count">${lensCount[l.id]}</span>
            </div>`).join('')}
        </div>` : ''}

      ${filterBar}

      ${filteredRecs.length === 0
        ? `<div class="empty-msg">📦<br>${S.boxFilterTag ? 'このレンズのたからはまだないよ' : 'まだたからがないよ<br>さがしにいこう！'}</div>`
        : `<div class="section-ttl">すべてのたから ${S.boxFilterTag ? `（${esc(S.boxFilterTag)}）` : ''}</div>`
          + filteredRecs.map(r => renderTakaraCard(r, true)).join('')}
    </div>`;
}

/* ══════════════════════════
   おきにいり
   ══════════════════════════ */
function renderFav() {
  const PAGE      = 20;
  const favPage   = S.favPage  || 0;
  const notePage  = S.notePage || 0;
  const allFavs   = S.records.filter(r => r.bookmarked).slice().reverse();
  const favSlice  = allFavs.slice(0, PAGE * (favPage + 1));
  const hasMoreFav = allFavs.length > PAGE * (favPage + 1);
  const allNotes  = S.records.filter(r => r.note && r.note.trim()).slice().reverse();
  const noteSlice = allNotes.slice(0, PAGE * (notePage + 1));
  const hasMoreNote = allNotes.length > PAGE * (notePage + 1);
  const badgeResults = BADGES.map(b => ({ ...b, earned: b.check(S) }));

  // 新規バッヂ取得モーダル（tab開時に自動表示）
  const newBadgeData = S.shownBadgeModal ? BADGES.find(b => b.id === S.shownBadgeModal) : null;
  const newBadgeModalHtml = newBadgeData ? `
    <div class="modal-overlay badge-new-overlay" onclick="App.closeBadge()">
      <div class="modal-box badge-new-box" onclick="event.stopPropagation()">
        <div class="badge-new-burst">🎉</div>
        <div class="badge-new-icon">${newBadgeData.icon}</div>
        <div class="badge-new-ttl">あたらしいバッヂ！</div>
        <div class="badge-new-name">${esc(newBadgeData.name)}</div>
        <div class="badge-new-cond">${esc(newBadgeData.cond)}</div>
        <button class="btn-primary" style="margin-top:16px" onclick="App.closeBadge()">やったー！</button>
      </div>
    </div>` : '';

  // 通常バッヂモーダル
  const badgeModalData = S.badgeModal
  ? (() => {
      const def   = S.badgeModal.def || BADGE_DEFS.find(d => d.id === S.badgeModal.id);
      if (!def) return null;
      const cur   = _getCurrentLevel(def, S);
      const next  = _getNextLevel(def, S);
      const isEarned = def.levels[0].check(S);
      return { def, cur, next, isEarned };
    })()
  : null;

const badgeModalHtml = badgeModalData ? (() => {
  const { def, cur, next, isEarned } = badgeModalData;
  const nextHtml = next
    ? `<div class="badge-next-level">
         つぎのステージ：${next.icon} <strong>${esc(next.name)}</strong>（${next.count}かい）
       </div>`
    : isEarned
      ? `<div class="badge-next-level badge-next-max">🏆 さいこうレベルたっせい！</div>`
      : '';
  return `
    <div class="modal-overlay" onclick="App.closeBadge()">
      <div class="modal-box" onclick="event.stopPropagation()" style="text-align:center">
        <button class="modal-close" onclick="App.closeBadge()">✕</button>
        <div class="badge-modal-icon badge-rarity-${isEarned ? cur.rarity : 'off'}">${isEarned ? cur.icon : '○'}</div>
        <div style="font-family:'Kaisei Decol',serif;font-size:var(--fs-xl);color:var(--deep);margin-bottom:6px">${esc(cur.name)}</div>
        <div style="font-size:var(--fs-sm);color:rgba(45,27,0,0.5);line-height:1.7;margin-bottom:8px">${esc(cur.cond)}</div>
        <div class="badge-modal-status ${isEarned ? 'earned' : 'not-earned'}">
          ${isEarned ? '✅ かくとくずみ！' : '🔒 まだかくとくしていないよ'}
        </div>
        ${nextHtml}
      </div>
    </div>`;
})() : '';
// ── 手帳セクション用HTML ──
  const notebookSectionHtml = renderNotebookSection();
  return `
    <div class="content">
    ${notebookSectionHtml}
      <div class="badge-section-top">
        <div class="badge-section-ttl">🏅 かくとくしたバッヂ</div>
        <div class="badge-grid-large">
       ${badgeResults.map(b => {
  const rarity   = b.earned ? (b.rarity || 'normal') : 'off';
  const maxLevel = b.def.levels.length;
  const curLevel = b.def.levels.filter(lv => lv.check(S)).length;
  const sparkle = maxLevel > 1 && curLevel > 0
    ? `<div class="badge-case-sparkle">${'✨'.repeat(curLevel-1)}</div>`
    : '';
  return `
    <div class="badge-case-item badge-rarity-${rarity}" onclick="App.openBadge('${b.id}')">
      <div class="badge-case-icon">${b.earned ? b.icon : '○'}</div>
      ${sparkle}
    </div>`;
}).join('')}
        </div>
      </div>

      <div style="font-family:'Kaisei Decol',serif;font-size:var(--fs-lg);color:var(--deep);margin:14px 0 10px">
        ⭐ おきにいりのたから
      </div>
      ${allFavs.length === 0
        ? `<div class="empty-msg">⭐<br>おきにいりがまだないよ<br>🔖をおしてみよう！</div>`
        : favSlice.map(r => renderTakaraCard(r, true)).join('')}
      ${hasMoreFav ? `<button class="load-more-btn" onclick="App.loadMoreFav()">つぎの20けん ›</button>` : ''}

      <div class="note-section-divider"><span>📓 きろくノート</span></div>
      <div style="font-size:var(--fs-xs);color:rgba(45,27,0,0.45);margin-bottom:14px;line-height:1.7">
        サマリーのあとにかいたメモがあつまるよ
      </div>
      ${allNotes.length === 0
        ? `<div class="empty-msg" style="padding:16px 0">📓<br>まだメモがないよ</div>`
        : noteSlice.map(r => `
          <div class="note-tab-section">
            <div class="note-entry-header">
              <span class="note-entry-emoji">${r.odai.emoji}</span>
              <span class="note-entry-name">${esc(r.odai.name)}</span>
              <span style="font-size:9px;color:rgba(45,27,0,0.35);margin-left:auto">${fmtDate(r.date)}</span>
            </div>
            <div class="note-entry-text">${esc(r.note)}</div>
          </div>`).join('')}
      ${hasMoreNote ? `<button class="load-more-btn" onclick="App.loadMoreNote()">つぎの20けん ›</button>` : ''}
    </div>
    ${newBadgeModalHtml}
    ${badgeModalHtml}`;
}
/* ══════════════════════════
   てちょう：一覧セクション（おきにいりタブ内）
   ══════════════════════════ */
function renderNotebookSection() {
  const owned = S.ownedPageThemes || ['plain'];
  const books = S.notebooks || [];

 const bookListHtml = books.length === 0
  ? `<div class="nb-empty">まだてちょうがないよ<br>つくってみよう！</div>`
  : books.map((nb, i) => {
      const theme = NOTEBOOK_THEMES.find(t => t.id === nb.themeId) || NOTEBOOK_THEMES[0];
      return `
        <div class="nb-thumb-wrap" onclick="App.openNotebook(${i})">
          <div class="nb-thumb-date-label">${fmtDate(nb.createdAt)}</div>
          ${renderNotebookCanvasReadonly(nb, theme)}
        </div>`;
    }).join('');

  const canCreate = owned.length > 0;
  const limit  = calcNotebookLimit();
  const used   = (S.notebooks || []).length;
  const canAdd = hasNotebookSlot();

  const newBtn = canAdd
    ?`<button class="nb-create-btn" onclick="App.startNewNotebook()">
   ＋ あたらしいてちょうをつくる
 </button>`
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

/* ══════════════════════════
   てちょう：編集画面
   ══════════════════════════ */
function renderNotebookEditor() {
  const nb    = S.notebookEditing;
  if (!nb) return '';
  const theme = NOTEBOOK_THEMES.find(t => t.id === nb.themeId) || NOTEBOOK_THEMES[0];

  const canvasHtml  = renderNotebookCanvas(nb, theme);
  const trayHtml    = renderNotebookTray();
  const placingHtml = renderNotebookPlacingBanner();

  return `
    <div class="nb-editor-wrap">
      <div class="nb-editor-header">
        <button class="back-btn" onclick="App.cancelNotebook()">◀ もどる</button>
        <span class="nb-editor-title">${theme.emoji} てちょうをかざろう</span>
        <button class="nb-save-btn" onclick="App.saveNotebook()">かんせい！</button>
      </div>
      ${placingHtml}
      ${canvasHtml}
      ${trayHtml}
       <button class="nb-delete-btn" onclick="App.deleteNotebook()">🗑️ てちょうをさくじょする</button>
    </div>`;
}

function renderNotebookCanvas(nb, theme) {
  const items = (nb.items || []).map((item, i) => {
    const top      = Math.round(item.y);
    const left     = Math.round(item.x);
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
// ──────────────────────────────────
// 追加：読み取り専用キャンバス（おきにいりタブのサムネ用）
// ──────────────────────────────────
function renderNotebookCanvasReadonly(nb, theme) {
  const items = (nb.items || []).map(item => {
    const top  = Math.round(item.y);
    const left = Math.round(item.x);
    return `
      <div class="nb-placed-item" style="top:${top}px;left:${left}px">
        <span class="nb-placed-emoji">${esc(item.emoji)}</span>
        ${item.label ? `<div class="nb-placed-label">${esc(item.label)}</div>` : ''}
      </div>`;
  }).join('');
  const hint = (nb.items || []).length === 0
    ? `<div class="nb-canvas-hint">まだなにもないよ</div>`
    : '';
  return `
  <div class="nb-canvas nb-canvas--readonly" style="background:${theme.bg}">
    ${items}
    ${hint}
  </div>`;
}
/* ── ふせん選択UI（たから/ノート共通） ── */
function renderStickerPicker(trayType) {
  const stickers = NOTEBOOK_STICKERS;
  if (stickers.length === 0) {
    return `<div class="nb-tray-empty">ふせんがまだないよ</div>`;
  }
  return `
    <div class="nb-sticker-picker-wrap">
      <div class="nb-sticker-picker-label">どのふせんにする？</div>
      <div class="nb-sticker-picker-scroll">
        ${stickers.map(st => `
          <div class="nb-sticker-pick-item ${S.notebookStickerSelected === st.id ? 'selected' : ''}"
               onclick="App.pickSticker('${st.id}','${trayType}')">
            <img class="nb-sticker-pick-img" src="${esc(st.src)}" alt="${esc(st.name)}">
            <div class="nb-sticker-pick-name">${esc(st.name)}</div>
          </div>`).join('')}
      </div>
    </div>`;
}
function renderNotebookTray() {
  const tray   = S.notebookTray || 'badge';
  const tabs   = [
    { id:'badge',   label:'🏅', name:'バッヂ'   },
    { id:'sticker', label:'🎨', name:'シール'   },
    { id:'fav',     label:'⭐', name:'たから'   },
    { id:'note',    label:'📓', name:'ノート'   },
  ];
  const tabsHtml = tabs.map(t => `
    <div class="nb-tray-tab ${tray === t.id ? 'active' : ''}"
         onclick="App.switchNotebookTray('${t.id}')">
      ${t.label}<span class="nb-tray-tab-name">${t.name}</span>
    </div>`).join('');

  let itemsHtml = '';
  if (tray === 'badge') {
    const earned = BADGES.filter(b => b.check(S));
    itemsHtml = earned.length === 0
      ? `<div class="nb-tray-empty">まだバッヂがないよ</div>`
      : earned.map(b => `
          <div class="nb-tray-item ${_isPlacing('badge', b.id) ? 'selecting' : ''}"
               onclick="App.selectNotebookItem('badge','${b.id}','${b.icon}','${esc(b.name)}')">
            <div class="nb-tray-emoji">${b.icon}</div>
            <div class="nb-tray-name">${esc(b.name)}</div>
          </div>`).join('');
  } else if (tray === 'sticker') {
    itemsHtml = STICKERS.map(s => `
      <div class="nb-tray-item ${_isPlacing('sticker', s.id) ? 'selecting' : ''}"
           onclick="App.selectNotebookItem('sticker','${s.id}','${s.emoji}','')">
        <div class="nb-tray-emoji">${s.emoji}</div>
      </div>`).join('');
 } else if (tray === 'fav') {
    // ── ふせん選択中なら、たから一覧を表示 ──
    if (S.notebookStickerPick === 'fav') {
      const favs = S.records.filter(r => r.bookmarked);
      itemsHtml = favs.length === 0
        ? `<div class="nb-tray-empty">おきにいりがまだないよ</div>`
        : favs.map((r, i) => `
            <div class="nb-tray-item ${_isPlacing('fav', String(i)) ? 'selecting' : ''}"
                 onclick="App.selectFavWithSticker(${i})">
              <div class="nb-tray-emoji">${r.odai.emoji}</div>
              <div class="nb-tray-name">${esc(r.odai.name)}</div>
            </div>`).join('');
    } else {
      // ふせん画像選択UI
      itemsHtml = renderStickerPicker('fav');
    }
  } else if (tray === 'note') {
    // ── ふせん選択中なら、ノート一覧を表示 ──
    if (S.notebookStickerPick === 'note') {
      const notes = S.records.filter(r => r.note && r.note.trim());
      itemsHtml = notes.length === 0
        ? `<div class="nb-tray-empty">ノートがまだないよ</div>`
        : notes.map((r, i) => `
            <div class="nb-tray-item nb-tray-item-note ${_isPlacing('note', String(i)) ? 'selecting' : ''}"
                 onclick="App.selectNoteWithSticker(${i})">
              <div class="nb-tray-emoji">📓</div>
              <div class="nb-tray-name">${esc(r.odai.name)}</div>
              <div class="nb-tray-note-preview">${esc(r.note.slice(0, 15))}</div>
          </div>`).join('');
  }

  return `
    <div class="nb-tray">
      <div class="nb-tray-tabs">${tabsHtml}</div>
      <div class="nb-tray-items">${itemsHtml}</div>
    </div>`;
}

function renderNotebookPlacingBanner() {
  if (!S.notebookPlacing) return '';
  return `
    <div class="nb-placing-banner">
      <span class="nb-placing-emoji">${S.notebookPlacing.emoji}</span>
      <span class="nb-placing-msg">おきたいところをタップしてね！</span>
      <button class="nb-placing-cancel" onclick="App.cancelPlacing()">とりけし</button>
    </div>`;
}

// 配置待ち判定ヘルパー（view内専用）
function _isPlacing(type, id) {
  return S.notebookPlacing?.type === type && S.notebookPlacing?.id === String(id);
}

/* ══════════════════════════
   たからカード（共通パーツ）
   ══════════════════════════ */
function renderTakaraCard(r, showFavBtn) {
  const lens     = LENSES.find(l => l.id === r.lens);
  const colors   = ['#e8860a','#0a9396','#e76f51','#52b788','#9b89c4','#ffd166'];
  const idx      = S.records.lastIndexOf(r);
  const odaiJson = JSON.stringify(r.odai).replace(/'/g, '&#39;');
  return `
    <div class="takara-item" onclick="App.goToLens(${odaiJson})" style="cursor:pointer">
      <div class="takara-item-header">
        <span class="takara-item-emoji">${r.odai.emoji}</span>
        <span class="takara-item-name">${esc(r.odai.name)}</span>
        ${lens ? `<span class="takara-item-lens">${lens.icon} ${esc(lens.name)}</span>` : ''}
      </div>
      <div class="takara-findings">
        ${(r.findings || []).map((f, i) => `
          <div class="takara-finding">
            <div class="finding-dot" style="background:${colors[i % colors.length]};width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px"></div>
            ${esc(f)}
          </div>`).join('')}
      </div>
      ${r.note ? `<div class="takara-note">📓 ${esc(r.note)}</div>` : ''}
      <div class="takara-item-date">${fmtDate(r.date)}</div>
      ${showFavBtn ? `
        <div class="takara-action-row">
          <button class="takara-fav-btn ${r.bookmarked ? 'active' : ''}"
                  data-idx="${idx}"
                  onclick="event.stopPropagation();App.toggleRecordFav(${idx})">🔖</button>
          <button class="takara-delete-btn"
                  onclick="event.stopPropagation();App.deleteRecord(${idx})">🗑️</button>
        </div>` : ''}
    </div>`;
}

/* ══════════════════════════
   せってい
   ══════════════════════════ */
function renderSettings() {
  const u   = S.user;
  const fs  = S.fontSize || 'medium';
  const tab = S.settingsTab || 'kid';   // 'kid' or 'adult'

  const adultLinksHtml = ADULT_LINKS.map(l => `
    <div class="adult-link-row" onclick="App.openExternalLink('${l.id}')">
      <span>${l.emoji}</span>
      <span>${l.label}</span>
      <span class="adult-link-arrow">›</span>
    </div>`).join('');

  const kidHtml = `
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
          ${renderAgeIconRow(u.ageGroup, "App.toggleSettingsAge()", S.settingsAgeOpen)}
        </div>
        <div class="settings-field settings-field-half">
          <div class="settings-field-label">まなびのタイプ</div>
          ${renderTypeIconRow(u.type, "App.toggleSettingsType()", S.settingsTypeOpen)}
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
      <div style="font-size:var(--fs-xs);color:rgba(45,27,0,0.45);margin-bottom:10px;line-height:1.6">
        パパ・ママといっしょにえらんでね
      </div>
      <div class="color-theme-grid">
        ${COLOR_THEMES.map(t => `
          <div class="color-theme-chip ${S.theme === t.id ? 'selected' : ''}"
               onclick="App.setTheme('${t.id}')"
               style="background:${t.amber}">
            <span class="color-theme-check">${S.theme === t.id ? '✓' : ''}</span>
            <span class="color-theme-name">${t.name}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-ttl">📌 カードのふせん</div>
      <div class="sticky-color-grid">
        ${STICKY_COLORS.map(c => `
          <button
            class="sticky-color-btn ${S.stickyColor === c.id ? 'selected' : ''}"
            onclick="App.setStickyColor('${c.id}', '${c.value}')"
            style="background:${c.value}">
            ${c.label}
          </button>`).join('')}
      </div>
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

  const adultHtml = `
    <div class="settings-section-adult">
      <div class="settings-ttl-adult">ウィークリーレポート</div>
      <div style="font-size:11px;color:rgba(45,27,0,0.45);margin-bottom:10px;line-height:1.6">
        今週の学びをAIがまとめるよ（${u.parentName}向け）
      </div>
      ${S.weeklyReport ? `
        <div class="report-card">
          <div class="report-label">📊 ウィークリーレポート</div>
          <div class="report-body">${aiText(S.weeklyReport)}</div>
        </div>
        <button class="btn-secondary" onclick="App.generateReport()">
          ${S.reportLoading ? '<span class="spinner"></span>' : '🔄 もう一度生成'}
        </button>` : `
        <button class="btn-primary" onclick="App.generateReport()">
          ${S.reportLoading ? '<span class="spinner"></span> せいせいちゅう…' : '📊 レポートをつくる'}
        </button>`}
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
      <div style="font-size:var(--fs-sm);color:rgba(45,27,0,0.5);margin-bottom:10px;line-height:1.6">
        アプリをよりよくするために、きいてね！
      </div>
      <button class="btn-primary" style="margin-bottom:0" onclick="App.sendFeedback()">📨 フォームをひらく</button>
    </div>

    <div class="settings-section-adult">
      <div class="settings-ttl-adult">その他</div>
      ${adultLinksHtml}
    </div>`;

  return `
    <div class="content">
      <div class="settings-subtabs">
        <div class="settings-subtab ${tab === 'kid'   ? 'active' : ''}" onclick="App.switchSettingsTab('kid')">こどもよう</div>
        <div class="settings-subtab ${tab === 'adult' ? 'active' : ''}" onclick="App.switchSettingsTab('adult')">おとなよう</div>
      </div>
      ${tab === 'kid' ? kidHtml : adultHtml}
    </div>`;
}
