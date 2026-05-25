/* ═══════════════════════════════
   たからさがし — render  v7_mod
   ═══════════════════════════════ */

function esc(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function aiText(str) {
  return esc(str).replace(/\n/g,'<br>');
}

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
        <div class="tab ${t.cls} ${S.tab === t.id ? 'active' : ''}"
             onclick="App.switchTab('${t.id}')">
          <span class="tab-icon">${t.icon}</span>
          <span class="tab-label">${t.label}</span>
        </div>`).join('')}
    </div>
    <div class="tab-line"></div>`;
}

function renderChatHeader() {
  const lens = LENSES.find(l => l.id === S.lens);
  const isContinue = !!S.prevRecord;
  return `
    <div class="chat-header">
      <div class="chat-header-info">
        <span class="chat-header-emoji">${esc(S.odai?.emoji || '')}</span>
        <span class="chat-header-name">${esc(S.odai?.name || '')}</span>
        ${lens ? `<span class="chat-header-lens">${lens.icon} ${esc(lens.name)}</span>` : ''}
        ${isContinue ? `<span class="chat-header-continue">🔭 つづき</span>` : ''}
      </div>
      <button class="back-btn" onclick="App.closeChatFlow()">◀ ホームにもどる</button>
    </div>`;
}

// ── オンボーディング ──
function renderOnboard() {
  const s = S.step;
  const u = S.user;
  const dots = [0,1,2,3].map(i =>
    `<div class="step-dot ${i < s ? 'done' : i === s ? 'active' : ''}"></div>`
  ).join('');

  let body = '';
  if (s === 0) {
    body = `
      <div class="form-block">
        <div class="form-label">お子さんの <em>呼び方</em></div>
        <input class="form-input" id="ob-name" placeholder="例：はるくん" value="${esc(u.name)}">
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
      </div>
      <div class="form-block">
        <div class="form-label">とくいなこと</div>
        <input class="form-input" id="ob-str" placeholder="えをかくこと…" value="${esc(u.strengths)}">
      </div>`;
  } else {
    body = `
      <div class="form-block">
        <div class="form-label"><em>いっしょにするひと</em>のよびかた</div>
        <div class="parent-chips">${renderParentChips(u.parentName)}</div>
      </div>
      <p style="font-size:11px;color:rgba(45,27,0,0.4);line-height:1.7;text-align:center;padding:0 8px;margin-top:4px">
        ⚙️ せってい からいつでも変えられます
      </p>`;
  }

  return `
    <div class="onboard-wrap">
      <div class="onboard-hero">
        <span class="onboard-emoji">🔍</span>
        <div class="onboard-ttl">たから<em>さがし</em></div>
        <div class="onboard-sub">毎日のふとした気づきが、<br>学びのたからになる</div>
      </div>
      <div class="step-dots">${dots}</div>
      ${body}
      <div style="padding-top:18px">
        <button class="btn-primary" onclick="App.obNext()">
          ${s < 3 ? 'つぎへ ›' : 'はじめる 🔍'}
        </button>
        ${s > 0 ? `<button class="btn-secondary" onclick="App.obBack()">← もどる</button>` : ''}
      </div>
    </div>`;
}


function renderAgeIconRow(current, toggleFn, isOpen) {
  return `
    <div class="icon-row-select" onclick="${toggleFn}">
      ${agePrompts.map(a => `
        <div class="icon-sel-item ${current === a.id ? 'icon-sel-active' : ''}">
          <div class="icon-sel-badge ${current === a.id ? 'icon-sel-badge-on' : ''}">${a.icon}</div>
          ${current === a.id ? `<div class="icon-sel-current-lbl">${a.label}</div>` : ''}
        </div>`).join('')}
      <span class="icon-row-chevron ${isOpen ? 'open' : ''}">▾</span>
    </div>
    ${isOpen ? `
      <div class="icon-row-detail">
        ${renderAgeCards(current)}
      </div>` : ''}`;
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
    ${isOpen ? `
      <div class="icon-row-detail">
        ${renderTypeCards(current)}
      </div>` : ''}`;
}

function renderAgeCards(current) {
  return agePrompts.map(a => `
    <div class="type-card ${current === a.id ? 'sel-age' : ''}"
         onclick="App.setAge('${a.id}')">
      <div class="type-badge type-badge-age">${a.icon}</div>
      <div class="type-info">
        <div class="type-name">${a.label}</div>
        <div class="type-desc">${a.desc}</div>
      </div>
    </div>`).join('');
}

function renderTypeCards(current) {
  return TYPES.map(t => `
    <div class="type-card ${current === t.id ? 'sel-' + t.id : ''}"
         onclick="App.setType('${t.id}')">
      <div class="type-badge type-badge-${t.id}">${t.icon}</div>
      <div class="type-info">
        <div class="type-name">${t.name}</div>
        <div class="type-desc">${t.desc}</div>
      </div>
    </div>`).join('');
}

function renderParentChips(current) {
  return PARENT_OPTS.map(p => `
    <div class="parent-chip ${current === p ? 'sel' : ''}"
         onclick="App.setParent('${esc(p)}')">${esc(p)}</div>`).join('');
}

// ── ホーム ──
function renderHome() {
  const u    = S.user;
  const type = TYPES.find(t => t.id === u.type) || TYPES[0];
  const age  = agePrompts.find(a => a.id === (u.ageGroup||'young')) || agePrompts[0];
  const rec  = S.records.slice(-3).reverse();
  const r    = S.randOdai || pickRand();
  if (!S.randOdai) S.randOdai = r;

  const totalDays   = calcTotalDays();
  const totalTakara = S.records.length;

  const openRec = S.records.slice().reverse().find(r => r.status === 'open');
  const openIdx = openRec ? S.records.lastIndexOf(openRec) : -1;

  const wt = S.weeklyTakara;
  const wtIdx = wt ? S.records.lastIndexOf(wt) : -1;

  const brokenPop = S.streakBrokenPop ? `
    <div class="streak-broken-pop" id="streak-broken-pop">
      <div class="streak-broken-inner">
        <div class="streak-broken-emoji">😢</div>
        <div>
          <div class="streak-broken-ttl">れんぞくがきれたよ</div>
          <div class="streak-broken-sub">${S.streakBrokenCount}にちも つづけたのはすごい！また今日からいこう🔥</div>
        </div>
        <button class="streak-broken-close" onclick="App.dismissStreakPop()">✕</button>
      </div>
    </div>` : '';

  return `
    ${brokenPop}
    <div class="content">
      <!-- 統計ボックス（一列横並びにコンパクト化） -->
      <div class="home-stats-row">
        <div class="home-stat-box">
          <span class="home-stat-emoji">🔥</span>
          <span class="home-stat-lbl">れんぞく:</span>
          <span class="home-stat-num">${S.streak}にち</span>
        </div>
        <div class="home-stat-box">
          <span class="home-stat-emoji">📅</span>
          <span class="home-stat-lbl">つうさん:</span>
          <span class="home-stat-num">${totalDays}にち</span>
        </div>
        <div class="home-stat-box">
          <span class="home-stat-emoji">📦</span>
          <span class="home-stat-lbl">たから:</span>
          <span class="home-stat-num">${totalTakara}こ</span>
        </div>
      </div>

      <div class="home-greeting">
        <span class="home-greeting-emoji">🔍</span>
        <div>
          <div class="home-greeting-name">${esc(u.name)}さん、きょうもさがしにいこう！</div>
        </div>
      </div>

      <div style="display:flex;gap:6px;align-items:center;margin-bottom:14px">
        <div class="home-type-badge htb-${type.id}" onclick="App.switchTab('set')" style="margin-bottom:0">
          ${type.icon} ${esc(type.name)} ›
        </div>
        <div class="home-type-badge htb-age" onclick="App.switchTab('set')" style="margin-bottom:0">
          ${age.icon} ${esc(age.label)} ›
        </div>
      </div>

      <!-- いまきになること（自由入力欄） -->
      <div class="free-section">
        <div class="free-label">✏️ いまきになること</div>
        <div class="free-row">
          <input class="free-input" id="free-in" placeholder="なにか にゅうりょく してね…">
          <button class="free-go" id="free-go-btn">➤</button>
        </div>
      </div>

      <!-- しゃしんでおだいをつくる -->
      <div class="photo-row">
        <input type="file" accept="image/*" id="photo-input">
        <span class="photo-row-icon">📷</span>
        <div>
          <div class="photo-row-ttl">しゃしんで おだいをつくる</div>
          <div class="photo-row-sub">しゃしんを AIが よみとるよ</div>
        </div>
        <span style="font-size:17px;color:rgba(10,147,150,0.4)">›</span>
      </div>

      <!-- つづきのたから -->
      ${openRec ? `
        <div class="continue-card" onclick="App.continueRecord(${openIdx})">
          <div class="continue-card-label">🔭 つづきの たから</div>
          <div class="continue-card-body">
            <span class="continue-card-emoji">${openRec.odai.emoji}</span>
            <div>
              <div class="continue-card-name">${esc(openRec.odai.name)}</div>
              <div class="continue-card-sub">${fmtDate(openRec.date)} · ${esc(openRec.lens)}レンズ</div>
            </div>
            <span class="continue-card-arrow">›</span>
          </div>
        </div>` : ''}

      <!-- せんしゅうのたから -->
      ${wt ? `
        <div class="weekly-card" onclick="App.continueRecord(${wtIdx})">
          <div class="weekly-card-label">🗓 せんしゅうの たから</div>
          <div class="weekly-card-body">
            <span class="weekly-card-emoji">${wt.odai.emoji}</span>
            <div style="flex:1">
              <div class="weekly-card-name">${esc(wt.odai.name)}</div>
              <div class="weekly-card-sub">${fmtDate(wt.date)} · ${esc(wt.lens)}レンズ</div>
            </div>
            <span style="font-size:16px;color:rgba(155,137,196,0.5)">›</span>
          </div>
        </div>` : ''}

      <!-- ランダムおだい -->
      ${S.odaiGenerating ? `
        <div class="odai-generating">
          <span class="spinner"></span>
          <div style="font-size:13px;color:rgba(45,27,0,0.5)">おだいをつくっているよ…</div>
        </div>` : `
        <div class="odai-random" id="rand-card">
          <span class="odai-random-icon">${r.emoji}</span>
          <div>
            <div class="odai-random-label">🎲 ランダムおだい</div>
            <div class="odai-random-name">${esc(r.name)}</div>
          </div>
          <span class="odai-random-arrow">›</span>
          <button class="reroll-btn" id="reroll-btn">チェンジ</button>
        </div>`}

      <!-- さいきんのたから（履歴） -->
      ${rec.length > 0 ? `
        <div class="section-ttl" style="margin-top:16px">さいきんの たから</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${rec.map(r => `
            <div style="padding:6px 12px;border-radius:20px;background:var(--amber-pale);color:var(--amber);font-size:11px;font-weight:700;cursor:pointer"
                 onclick='App.replayOdai(${JSON.stringify(r.odai)})'>
              ${r.odai.emoji} ${esc(r.odai.name)}
            </div>`).join('')}
        </div>` : ''}
    </div>`;
}


// ── レンズ選択 ──
function renderLens() {
  const isContinue = !!S.prevRecord;
  return `
    <div class="content">
      <div style="margin-bottom:12px">
        <div class="odai-pill">
          <span class="odai-pill-emoji">${esc(S.odai.emoji)}</span>
          <span class="odai-pill-name">${esc(S.odai.name)}</span>
        </div>
      </div>
      ${isContinue ? `
        <div class="continue-banner">
          🔭 つづき — ${esc(S.prevRecord.lens)}レンズで さらにしらべるよ
        </div>` : `
        <div class="lens-hint">どのレンズで みてみる？<br>ひとつだけ えらんでね 🔍</div>`}
      <div class="lens-grid">
        ${LENSES.map(l => `
          <div class="lens-card ${l.cls} ${S.lens === l.id ? 'selected' : ''} ${isContinue && l.id !== S.lens ? 'lens-locked' : ''}"
               onclick="App.selectLens('${l.id}')">
            <div style="display:flex;align-items:center;gap:8px">
              <span class="lens-icon">${l.icon}</span>
              <div class="lens-name">${esc(l.name)}</div>
            </div>
            <div class="lens-desc">${esc(l.kidDesc)}</div>
          </div>`).join('')}
      </div>
      <button class="btn-dark" onclick="App.startChat()" ${!S.lens ? 'disabled' : ''}>
        ${!S.lens ? 'レンズを えらんでね' : `${LENSES.find(l=>l.id===S.lens)?.icon} ${esc(S.lens)}レンズで はじめる ›`}
      </button>
      <button class="btn-secondary" onclick="App.closeChatFlow()">← おだいにもどる</button>
    </div>`;
}

// ── チャット ──
function renderChat() {
  const u = S.user;
  const isPhase4 = S.chatPhase >= 4;

  const phases = [
    { n:1, label:'いまどこ？' },
    { n:2, label:'よくみると？' },
    { n:3, label:'どうおもう？' },
    { n:4, label:'まとめ' },
  ];
  const phaseBar = phases.map(p => `
    <div class="phase-dot ${S.chatPhase >= p.n ? 'phase-done' : ''} ${S.chatPhase === p.n ? 'phase-active' : ''}">
      <div class="phase-dot-circle">${S.chatPhase > p.n ? '✓' : p.n}</div>
      <div class="phase-dot-label">${p.label}</div>
    </div>`).join('<div class="phase-line"></div>');

  return `
    <div class="phase-bar-wrap">
      <div class="phase-bar">${phaseBar}</div>
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
            <button class="retry-btn" onclick="App.retryLastSend()">もういちど</button>
          </div>` : ''}
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="chat-in"
          placeholder="${S.speaker === 'child' ? 'かんがえてみよう…' : esc(u.parentName) + 'も かんがえてみよう…'}"
          ${S.isLoading ? 'disabled' : ''}>
        <button class="chat-send" onclick="App.sendChat()"
          ${S.isLoading ? 'disabled' : ''}>➤</button>
      </div>
      <button class="finish-btn ${isPhase4 ? 'finish-btn-ready' : ''}"
              onclick="App.goSummary()">
        📦 たからを しまう
      </button>
    </div>`;
}

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

// ── サマリー ──
function renderSummary() {
  const items = S.summaryItems;
  const paras = S.summaryOpinion.split(/\n/).filter(Boolean);
  const colors = ['#e8860a','#0a9396','#e76f51','#52b788','#9b89c4','#ffd166'];
  const savedNote = S.currentNote || '';
  const lastRec = S.records[S.records.length - 1];
  const activeStatus = lastRec ? lastRec.status : null;

  return `
    <div class="content">
      <div id="summary-capture-area">
        <div class="summary-hero">
          <span class="summary-hero-emoji">${esc(S.odai?.emoji || '🔍')}</span>
          <div class="summary-hero-ttl">たからみつかった！</div>
        </div>

        <div class="findings-card">
          <button class="bookmark-btn ${S.bookmarked ? 'active' : ''}"
                  onclick="App.toggleBookmark()">🔖</button>
          <div class="findings-label">✨ きょうみつけたたから</div>
          ${items.length === 0
            ? `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(45,27,0,0.4)">
                 <span class="spinner"></span>まとめているよ…
               </div>`
            : items.map((f,i) => `
                <div class="finding-item finding-item-anim"
                     style="animation-delay:${0.1 + i * 0.18}s">
                  <div class="finding-dot" style="background:${colors[i % colors.length]}"></div>
                  <div class="finding-text">${esc(f)}</div>
                </div>`).join('')}
        </div>

        <!-- AIの意見は設定に関わらずアコーディオンとして常に設置 -->
        <div class="ai-opinion-card">
          <div class="ai-opinion-toggle" onclick="App.toggleOpinion()">
            <div class="ai-opinion-label">💡 AIのかんがえ（おとな向け）</div>
            <div class="ai-opinion-chevron ${S.opinionOpen ? 'open' : ''}">▾</div>
          </div>
          ${S.opinionOpen && paras.length > 0 ? `
            <div class="ai-opinion-body">
              ${paras.map(p => `<div class="ai-opinion-para">${esc(p)}</div>`).join('')}
            </div>` : ''}
        </div>
      </div>

      <!-- きろくノート -->
      <div class="note-card">
        <div class="note-label">📓 じぶんの きろくノート</div>
        <div style="font-size:10px;color:rgba(45,27,0,0.45);margin-bottom:6px">きょうきづいたこと、おもったことを かいてみよう</div>
        <textarea class="note-textarea" id="note-input" placeholder="（じゆうに かいてね）">${esc(savedNote)}</textarea>
        <button class="note-save-btn" onclick="App.saveNote()">💾 ほぞんする</button>
      </div>

      <!-- ステータス選択（もっとしらべる・これでおしまい）を常時配置 -->
      <div class="status-choice">
        <div class="status-choice-label">この たから、どうする？</div>
        <div class="status-choice-row">
          <button class="status-btn status-btn-open ${activeStatus === 'open' ? 'active-status' : ''}" onclick="App.setRecordStatus('open')">
            🔭 もっと しらべる！
          </button>
          <button class="status-btn status-btn-closed ${activeStatus === 'closed' ? 'active-status' : ''}" onclick="App.setRecordStatus('closed')">
            ✅ これでおしまい！
          </button>
        </div>
      </div>

      <!-- アクションボタン（別のレンズ・つぎのおだい・がぞうでほぞん）も同時に配置 -->
      <div class="summary-actions">
        <button class="btn-again"     onclick="App.doAgain()">🔄 べつのレンズで</button>
        <button class="btn-next-odai" onclick="App.nextOdai()">つぎのおだい ›</button>
        <button class="summary-save-btn" onclick="App.saveSummaryImage()" title="がぞうとしてほぞん">📸</button>
      </div>
    </div>`;
}

function triggerFindingAnim() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.finding-item-anim').forEach(el => {
      el.classList.add('finding-item-visible');
    });
  });
}

// ── カレンダー ──
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
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const monthName   = `${year}年${month+1}月`;
  const dows        = ['日','月','火','水','木','金','土'];

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday   = isThisMonth && d === now.getDate();
    const isStamped = !!dayMap[d];
    const stamp     = isStamped ? (dayMap[d][0].odai?.emoji || '🔍') : '';
    const onclick   = isStamped ? `onclick="App.showDayTakara(${year},${month},${d})"` : '';
    cells += `
      <div class="cal-day ${isToday?'today':''} ${isStamped?'stamped':''}" ${onclick}>
        ${isStamped ? `<div class="cal-stamp">${stamp}</div>` : ''}
        <div style="font-size:${isStamped?'9':'11'}px;opacity:${isStamped?'.5':'1'}">${d}</div>
      </div>`;
  }

  return `
    <div class="content">
      <div class="cal-header">
        <button class="cal-nav" onclick="App.calPrev()">‹</button>
        <div class="cal-month">${monthName}</div>
        <button class="cal-nav" onclick="App.calNext()">›</button>
      </div>
      <div class="cal-grid">
        ${dows.map((d,i) => `<div class="cal-dow ${i===0?'sun':i===6?'sat':''}">${d}</div>`).join('')}
        ${cells}
      </div>
      <div class="section-ttl">こんげつの はっけん ${Object.keys(dayMap).length}にち</div>
    </div>
    ${S.dayModal ? renderDayModal() : ''}`;
}

function renderDayModal() {
  const m = S.dayModal;
  const records = S.records.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear()===m.year && d.getMonth()===m.month && d.getDate()===m.day;
  });
  return `
    <div class="modal-overlay" onclick="App.closeDayModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="App.closeDayModal()">✕</button>
        <div class="modal-ttl">${m.month+1}月${m.day}日のたから</div>
        ${records.map(r => renderTakaraCard(r, false)).join('')}
      </div>
    </div>`;
}

// ── たからばこ ──
function renderBox() {
  const recs = S.records.slice().reverse();

  // openの記録を全件取得
  const openRecs = S.records.map((r,i) => ({r,i})).filter(({r}) => r.status === 'open').reverse();

  // フィルター処理
  const showFilter = S.records.length >= 50;
  const labelTags = [...new Set(S.records.map(r=>r.odai?.label).filter(Boolean))].sort();
  const allTags = [...labelTags, ...S.customTags.filter(t=>!labelTags.includes(t))];
  const lensTagIds = LENSES.map(l=>l.id);

  let filteredRecs = recs;
  if (S.boxFilterTag) {
    if (lensTagIds.includes(S.boxFilterTag)) {
      filteredRecs = recs.filter(r => r.lens === S.boxFilterTag);
    } else {
      filteredRecs = recs.filter(r => r.odai?.label === S.boxFilterTag || (r.odai?.customTags||[]).includes(S.boxFilterTag));
    }
  }

  const filterBar = showFilter ? `
    <div class="box-filter-bar">
      <div class="box-filter-scroll">
        <div class="box-filter-chip ${!S.boxFilterTag?'active':''}" onclick="App.setBoxFilter(null)">すべて</div>
        ${allTags.map(t => `<div class="box-filter-chip ${S.boxFilterTag===t?'active':''}" onclick="App.setBoxFilter('${esc(t)}')">${esc(t)}</div>`).join('')}
        <div class="box-filter-sep"></div>
        ${LENSES.map(l => `<div class="box-filter-chip box-filter-lens ${S.boxFilterTag===l.id?'active':''}" onclick="App.setBoxFilter('${l.id}')">${l.icon} ${esc(l.name)}</div>`).join('')}
      </div>
      <div class="box-filter-addtag">
        <input class="box-filter-taginput" id="custom-tag-input" placeholder="タグをつくる…">
        <button class="box-filter-tagbtn" onclick="App.addCustomTag()">＋</button>
      </div>
    </div>` : '';

  return `
    <div class="content">
      ${openRecs.length > 0 ? `
        <div class="section-ttl">🔭 つづきの たから</div>
        ${openRecs.map(({r, i}) => `
          <div class="takara-item takara-item-open">
            <div class="takara-item-header">
              <span class="takara-item-emoji">${r.odai.emoji}</span>
              <span class="takara-item-name">${esc(r.odai.name)}</span>
              <span class="takara-status-badge status-open">🔭 つづき</span>
            </div>
            <div style="font-size:var(--fs-xs);color:rgba(45,27,0,0.4);margin-bottom:8px">${fmtDate(r.date)} · ${esc(r.lens)}レンズ</div>
            <div class="takara-continue-row">
              <button class="btn-continue" onclick="App.continueRecord(${i})">つづきをさがす ›</button>
              <button class="btn-close-status" onclick="App.setRecordStatusByIdx(${i},'closed')">✅ おしまい</button>
            </div>
          </div>`).join('')}` : ''}

      ${filterBar}

      ${filteredRecs.length === 0
        ? `<div class="empty-msg">📦<br>${S.boxFilterTag ? 'このタグの たからは まだないよ' : 'まだ たからが ないよ<br>さがしにいこう！'}</div>`
        : `<div class="section-ttl">すべての たから ${S.boxFilterTag?`（${esc(S.boxFilterTag)}）`:''}</div>` + filteredRecs.map(r => renderTakaraCard(r, true)).join('')}
    </div>`;
}


// ── おきにいり・きろくノート統合タブ ──
function renderFav() {
  if (S.favLimit === undefined) S.favLimit = 20;
  if (S.noteLimit === undefined) S.noteLimit = 20;

  const favsAll = S.records.filter(r=>r.bookmarked).slice().reverse();
  const favs    = favsAll.slice(0, S.favLimit);

  const notesAll = S.records.filter(r => r.note && r.note.trim()).slice().reverse();
  const notes    = notesAll.slice(0, S.noteLimit);

  const badgeResults = BADGES.map(b => ({ ...b, earned: b.check(S) }));

  const badgeModalHtml = S.badgeModal ? `
    <div class="modal-overlay" onclick="App.closeBadge()">
      <div class="modal-box" onclick="event.stopPropagation()" style="text-align:center">
        <button class="modal-close" onclick="App.closeBadge()">✕</button>
        <div style="font-size:52px;margin:8px 0">${S.badgeModal.icon}</div>
        <div style="font-family:'Kaisei Decol',serif;font-size:var(--fs-xl);color:var(--deep);margin-bottom:6px">${esc(S.badgeModal.name)}</div>
        <div style="font-size:var(--fs-sm);color:rgba(45,27,0,0.5);line-height:1.7;margin-bottom:8px">${esc(S.badgeModal.cond)}</div>
        <div class="badge-modal-status ${badgeResults.find(b=>b.id===S.badgeModal.id)?.earned ? 'earned' : 'not-earned'}">
          ${badgeResults.find(b=>b.id===S.badgeModal.id)?.earned ? '✅ かくとくずみ！' : '🔒 まだだよ'}
        </div>
      </div>
    </div>` : '';

  return `
    <div class="content">
      <div style="font-family:'Kaisei Decol',serif;font-size:16px;color:var(--deep);margin-bottom:14px">
        ⭐ おきにいりの たから
      </div>
      <div class="badge-section-top">
        <div class="badge-section-ttl">🏅 かくとくしたバッヂ</div>
        <div class="badge-grid-large">
          ${badgeResults.map(b => `
            <div class="badge-large ${b.earned ? 'badge-large-on' : 'badge-large-off'}"
                 onclick="App.openBadge('${b.id}')">
              <div class="badge-large-icon">${b.earned ? b.icon : '○'}</div>
              <div class="badge-large-name">${esc(b.name)}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- お気に入りリスト（最大20件＋追加表示） -->
      ${favs.length === 0
        ? `<div class="empty-msg">⭐<br>おきにいりは まだないよ<br>🔖を おしてみてね！</div>`
        : favs.map(r => renderTakaraCard(r, true)).join('')}

      ${favsAll.length > S.favLimit ? `
        <button class="btn-secondary" style="margin-top:8px" onclick="App.loadMoreFav()">次の20件</button>
      ` : ''}

      <!-- きろくノートセクション（最下部へ移動） -->
      <div style="font-family:'Kaisei Decol',serif;font-size:16px;color:var(--deep);margin:28px 0 10px">
        📓 じぶんの きろくノート
      </div>
      ${notes.length === 0
        ? `<div class="empty-msg">📓<br>ノートは まだないよ<br>たからさがしのあとに<br>きもちを かいてみてね！</div>`
        : notes.map(r => `
          <div class="note-tab-section">
            <div class="note-entry-header">
              <span class="note-entry-emoji">${r.odai.emoji}</span>
              <span class="note-entry-name">${esc(r.odai.name)}</span>
              <span style="font-size:9px;color:rgba(45,27,0,0.35);margin-left:auto">${fmtDate(r.date)}</span>
            </div>
            <div class="note-entry-text">${esc(r.note)}</div>
          </div>`).join('')}

      ${notesAll.length > S.noteLimit ? `
        <button class="btn-secondary" style="margin-top:8px" onclick="App.loadMoreNotes()">次の20件</button>
      ` : ''}
    </div>
    ${badgeModalHtml}`;
}


// ── たからカード（共通：レンズとバッジを名前に並置） ──
function renderTakaraCard(r, showFavBtn) {
  const lens   = LENSES.find(l=>l.id===r.lens);
  const colors = ['#e8860a','#0a9396','#e76f51','#52b788','#9b89c4','#ffd166'];
  const idx    = S.records.lastIndexOf(r);
  const statusBadge = r.status === 'open'
    ? `<span class="takara-status-badge status-open">🔭 つづき</span>`
    : r.status === 'closed'
    ? `<span class="takara-status-badge status-closed">✅ おしまい</span>`
    : '';
  return `
    <div class="takara-item">
      <div class="takara-item-header">
        <span class="takara-item-emoji">${r.odai.emoji}</span>
        <span class="takara-item-name">${esc(r.odai.name)}</span>
        ${lens ? `<span class="takara-item-lens">${lens.icon} ${esc(lens.name)}</span>` : ''}
        ${statusBadge}
      </div>
      <div class="takara-findings">
        ${(r.findings||[]).map((f,i)=>`
          <div class="takara-finding">
            <div class="finding-dot" style="background:${colors[i%colors.length]};width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px"></div>
            ${esc(f)}
          </div>`).join('')}
      </div>
      ${r.note ? `<div class="takara-note">📓 ${esc(r.note)}</div>` : ''}
      <div class="takara-item-date">${fmtDate(r.date)}</div>
      ${showFavBtn ? `
        <button class="takara-fav-btn ${r.bookmarked?'active':''}"
                onclick="App.toggleRecordFav(${idx})">🔖</button>` : ''}
    </div>`;
}

// ── せってい ──
function renderSettings() {
  const u = S.user;
  const fs = S.fontSize || 'medium';
  return `
    <div class="content">
      <div class="settings-section">
        <div class="settings-ttl">こどもの情報</div>
        <div class="settings-field">
          <div class="settings-field-label">呼び方</div>
          <input class="form-input" id="s-name" value="${esc(u.name)}" placeholder="ニックネーム">
          <div class="form-error" id="s-name-err">なまえをいれてください</div>
        </div>
        <div class="settings-field">
          <div class="settings-field-label">ねんれい</div>
          ${renderAgeIconRow(u.ageGroup, "App.toggleSettingsAge()", S.settingsAgeOpen)}
        </div>
        <div class="settings-field">
          <div class="settings-field-label">まなびのタイプ</div>
          ${renderTypeIconRow(u.type, "App.toggleSettingsType()", S.settingsTypeOpen)}
        </div>
        <div class="settings-field">
          <div class="settings-field-label">すきなもの</div>
          <input class="form-input" id="s-likes" value="${esc(u.likes)}" placeholder="ポケモン・サッカーなど">
        </div>
        <div class="settings-field">
          <div class="settings-field-label">とくいなこと</div>
          <input class="form-input" id="s-str" value="${esc(u.strengths)}">
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
        <div class="settings-ttl">表示設定</div>
        <div class="settings-field">
          <div class="settings-field-label">文字サイズ（全体）</div>
          <div class="font-size-chips">
            <div class="font-size-chip ${fs==='small'?'sel':''}" onclick="App.setFontSize('small')">ちいさい（14px）</div>
            <div class="font-size-chip ${fs==='medium'?'sel':''}" onclick="App.setFontSize('medium')">ふつう（20px）</div>
            <div class="font-size-chip ${fs==='large'?'sel':''}" onclick="App.setFontSize('large')">おおきい（30px）</div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-ttl">ウィークリーレポート</div>
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

      <div class="settings-section">
        <div class="settings-ttl">データ管理</div>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <button class="btn-secondary" style="flex:1;padding:9px;font-size:var(--fs-sm)"
                  onclick="App.exportCSV()">📤 エクスポート</button>
          <button class="btn-secondary" style="flex:1;padding:9px;font-size:var(--fs-sm)"
                  onclick="App.triggerImport()">📥 インポート</button>
        </div>
        <input type="file" id="csv-import-input" accept=".csv"
               style="display:none" onchange="App.importCSV(event)">
      </div>

      <div class="settings-section">
        <div class="settings-ttl">意見・要望をおくる</div>
        <div style="font-size:var(--fs-sm);color:rgba(45,27,0,0.5);margin-bottom:10px;line-height:1.6">
          アプリをよりよくするために、きいてね！
        </div>
        <button class="btn-primary" style="margin-bottom:0"
                onclick="App.sendFeedback()">📨 フォームをひらく</button>
      </div>

      <button class="btn-primary" onclick="App.saveSettings()">ほぞんする ✓</button>
    </div>`;
}
