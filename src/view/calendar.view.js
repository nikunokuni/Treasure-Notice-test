/* ═══════════════════════════════════════════════════════════
   たからさがし — calendar.view.js
   カレンダー画面
   ═══════════════════════════════════════════════════════════ */

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
