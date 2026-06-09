/* ═══════════════════════════════════════════════════════════
   たからさがし — box.view.js
   たからばこ画面
   ═══════════════════════════════════════════════════════════ */

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
    ことば:   'var(--coral)',
    かず:     'var(--teal)',
    もしも:   'var(--mint)',
    つながり: 'var(--amber)',
    じぶん:   '#ffd166',
  };

  const lensTagIds   = LENSES.map(l => l.id);
  const filteredRecs = (S.boxFilterTag && lensTagIds.includes(S.boxFilterTag))
    ? recs.filter(r => r.lens === S.boxFilterTag)
    : recs;

  const totalTakara = S.records.length;
  const totalDays   = calcTotalDays();
  const bestStreak  = calcBestStreak();

  return `
    <div class="content">
      ${S.records.length > 0 ? `
        <div class="box-total-stats">
          <span class="stats-box-ttl">ぜんぶのぼうけん</span>
          <div class="box-total-stat">
            <span class="box-total-icon">📦</span>
            <div class="box-total-row"><span class="box-total-num">${totalTakara}</span><span class="box-total-lbl">こ</span></div>
          </div>
          <div class="box-total-div"></div>
          <div class="box-total-stat">
            <span class="box-total-icon">📅</span>
            <div class="box-total-row"><span class="box-total-num">${totalDays}</span><span class="box-total-lbl">にち</span></div>
          </div>
          <div class="box-total-div"></div>
          <div class="box-total-stat">
            <span class="box-total-icon">🔥</span>
            <div class="box-total-row"><span class="box-total-num">${bestStreak}</span></div>
          </div>
        </div>
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
