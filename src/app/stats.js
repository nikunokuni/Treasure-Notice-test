/* ═══════════════════════════════════════════════════════════
   たからさがし — stats.js
   統計ヘルパー（日数・連続・バッヂポイント・手帳枠など）
   ═══════════════════════════════════════════════════════════ */

/** 記録のある日数（ユニーク日付数）を返す */
function calcTotalDays() {
  const days = new Set(S.records.map(r => new Date(r.date).toDateString()));
  return days.size;
}

/** 昨日の記録を1件返す（なければ null） */
function getYesterdayRecord() {
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return S.records.slice().reverse()
    .find(r => new Date(r.date).toDateString() === yesterday) || null;
}

/** 先週の記録からランダムに1件を S.weeklyTakara にセット */
function _refreshWeeklyTakara() {
  const now      = new Date();
  const monday   = _getMondayOf(now);
  const lastMonday = new Date(monday);
  lastMonday.setDate(monday.getDate() - 7);

  const lastWeekRecs = S.records.filter(r => {
    const d = new Date(r.date);
    return d >= lastMonday && d < monday;
  });

  S.weeklyTakara = lastWeekRecs.length > 0
    ? lastWeekRecs[Math.floor(Math.random() * lastWeekRecs.length)]
    : null;
}

/** バッヂポイントの合計を計算（ページ上限算出に使用） */
function calcBadgePoints() {
  const rarityScore = { normal: 1, rare: 2, epic: 3 };
  return BADGES.reduce((sum, b) => {
    if (!b.def?.levels) return sum;
    const earned = b.def.levels.filter(lv => lv.check(S));
    if (earned.length === 0) return sum;
    const top = earned[earned.length - 1];
    return sum + (rarityScore[top.rarity] ?? 1);
  }, 0);
}

/** てちょうの最大ページ数を返す */
function calcNotebookLimit() {
  const points     = calcBadgePoints();
  // 通算たんけん日数が10日に達したら +1（日数は減らないため自然と「初回のみ」になる）
  const daysBonus  = calcTotalDays() >= 10 ? 1 : 0;
  return Math.floor(points / 15) + daysBonus + (S.extraNotebookPages ?? 0);
}

/**
 * てちょう新規枠ぶんのテーマを ownedPageThemes に付与する
 * ・10日ボーナス枠 → plain固定（1回だけ）
 * ・バッヂポイント枠 → 全5種からランダム（重複あり）
 */
function grantNotebookThemes() {
  const pointSlots = Math.floor(calcBadgePoints() / 15);
  const daysBonus  = calcTotalDays() >= 10 ? 1 : 0;

  if (daysBonus === 1 && !S.grantedDaysBonusTheme) {
    S.ownedPageThemes.push('plain');
    S.grantedDaysBonusTheme = true;
  }

  while ((S.grantedPointThemes ?? 0) < pointSlots) {
    const theme = NOTEBOOK_THEMES[Math.floor(Math.random() * NOTEBOOK_THEMES.length)];
    S.ownedPageThemes.push(theme.id);
    S.grantedPointThemes = (S.grantedPointThemes ?? 0) + 1;
  }
}

/** チャット回数（50回ごと）に応じてシールを付与する（永続・全種類からランダム・重複あり） */
function grantChatStickers() {
  const slots = Math.floor((S.childChatCount || 0) / 50);
  while ((S.grantedChatStickers ?? 0) < slots) {
    const sticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];
    S.ownedStickers.push(sticker.id);
    S.grantedChatStickers = (S.grantedChatStickers ?? 0) + 1;
    if (S.ownedStickers.length === 1 && !S.shownFirstSticker) {
      S.firstStickerPending = true;
    }
  }
}

/** てちょうに空きがあるか */
function hasNotebookSlot() {
  return (S.notebooks || []).length < calcNotebookLimit();
}

// ── 日付ユーティリティ（内部用） ──

/** 指定日が属する週の月曜日（00:00:00）を返す */
function _getMondayOf(date) {
  const d   = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}
