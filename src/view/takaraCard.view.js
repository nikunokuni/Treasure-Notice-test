/* ═══════════════════════════════════════════════════════════
   たからさがし — takaraCard.view.js
   たからカード（共通パーツ）
   ═══════════════════════════════════════════════════════════ */

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
