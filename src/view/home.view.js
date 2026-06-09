/* ═══════════════════════════════════════════════════════════
   たからさがし — home.view.js
   ホーム画面
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
   4. ホーム
   ══════════════════════════════════ */

/** ホーム画面を返す */
function renderHome() {
  const u    = S.user;
  const age  = AGE_PROMPTS.find(a => a.id === (u.ageGroup || 'young')) || AGE_PROMPTS[0];
  const r    = S.randOdai || pickRand();
  if (!S.randOdai) S.randOdai = r;

  return `
    ${_renderStreakBrokenPop()}
    <div class="content">
      ${_renderHomeStats(age)}
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
function _renderHomeStats(age) {
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

  // 今週（月曜〜今日）のたから数
  const monday = _getMondayOf(today);
  const weekTakara = S.records.filter(r => {
    const d = new Date(r.date);
    return d >= monday && d <= today;
  }).length;

  return `
    <div class="home-week-row">
      <span class="home-age-icon">${age.icon}</span>
      <div class="home-week-dots">${weekDots}</div>
      <div class="home-stat-chip hsc-week">
        <span class="hsc-lbl">こんしゅうのたから</span>
        <span class="hsc-val">
          <span class="hsc-icon">📦</span>
          <span class="hsc-num">${weekTakara}</span><span class="hsc-unit">こ</span>
        </span>
      </div>
    </div>`;
}

/** メインアクションブロックを返す（内部ヘルパー） */
function _renderMainActions() {
  const stickyColor  = STICKY_COLORS.find(c => c.id === (S.stickyColor || 'yellow')) || STICKY_COLORS[0];
  const stickyEmoji  = stickyColor.label.split(' ').pop();
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
               <div class="main-action-sub">とったしゃしんをAIがよみとるよ</div>
            </div>
            <span class="main-photo-arrow">›</span>
          </div>
        </div>
      </div>
      <span class="main-block-sticky-emoji">${stickyEmoji}</span>
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
