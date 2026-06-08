/* ═══════════════════════════════════════════════════════════
   たからさがし — persistence.js
   localStorage への保存・読み込み（マイグレーション含む）
   ═══════════════════════════════════════════════════════════ */

// ── localStorage キー ──
const STORAGE_KEY     = 'tks_v8_state';
const STORAGE_KEY_OLD = 'tks_v7_state';

/** 永続化：保存 */
function persistSave() {
  try {
    const toSave = {
      onboarded:     S.onboarded,
      user:          S.user,
      records:       S.records,
      streak:        S.streak,
      _lastPlayDate: S._lastPlayDate,
      fontSize:      S.fontSize,
      weeklyReport:  S.weeklyReport,
      customTags:    S.customTags,
      lastLens:      S.lastLens,
      theme:         S.theme,
      xPostCount:       S.xPostCount       ?? 0,
      childChatCount:   S.childChatCount   ?? 0,
      sentFeedback:     S.sentFeedback      ?? false,
      changedColor:     S.changedColor      ?? false,
      addedToHomeScreen:S.addedToHomeScreen ?? false,
      ownedPageThemes: S.ownedPageThemes ?? ['plain'],
      grantedPointThemes:    S.grantedPointThemes    ?? 0,
      grantedDaysBonusTheme: S.grantedDaysBonusTheme ?? false,
      notebooks:       S.notebooks       ?? [],
      notebookUnlocked: S.notebookUnlocked ?? false,
      ownedStickers:       S.ownedStickers       ?? [],
      grantedChatStickers: S.grantedChatStickers ?? 0,
      shownFirstSticker:   S.shownFirstSticker   ?? false,
      tabStickers:         S.tabStickers         ?? { home:[], cal:[], box:[], fav:[], set:[] },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch(e) { console.warn('save failed:', e); }
}

/** 永続化：読み込み（v7→v8 マイグレーション含む） */
function persistLoad() {
  try {
    // v7→v8 マイグレーション
    const oldRaw = localStorage.getItem(STORAGE_KEY_OLD);
    if (oldRaw && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, oldRaw);
      localStorage.removeItem(STORAGE_KEY_OLD);
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw);
    Object.assign(S, {
      onboarded:     saved.onboarded     ?? false,
      user:          { ...S.user, ...(saved.user || {}) },
      records:       saved.records       ?? [],
      streak:        saved.streak        ?? 0,
      _lastPlayDate: saved._lastPlayDate ?? null,
      fontSize:      saved.fontSize      ?? 'medium',
      weeklyReport:  saved.weeklyReport  ?? '',
      customTags:    saved.customTags    ?? [],
      lastLens:      saved.lastLens      ?? null,
      theme:         saved.theme         ?? 'amber',
      xPostCount:        saved.xPostCount        ?? 0,
      childChatCount:    saved.childChatCount    ?? 0,
      sentFeedback:      saved.sentFeedback       ?? false,
      changedColor:      saved.changedColor       ?? false,
      addedToHomeScreen: saved.addedToHomeScreen  ?? false,
      ownedPageThemes: saved.ownedPageThemes ?? ['plain'],
      grantedPointThemes:    saved.grantedPointThemes    ?? 0,
      grantedDaysBonusTheme: saved.grantedDaysBonusTheme ?? false,
      notebooks:       saved.notebooks       ?? [],
      // てちょうを既に作成済みのユーザーは解放済み扱い（移行措置）
      notebookUnlocked: saved.notebookUnlocked ?? ((saved.notebooks || []).length > 0),
      ownedStickers:       saved.ownedStickers       ?? [],
      grantedChatStickers: saved.grantedChatStickers ?? 0,
      shownFirstSticker:   saved.shownFirstSticker   ?? false,
      // homeStickers からの移行（旧データ互換）
      tabStickers: saved.tabStickers ?? (saved.homeStickers
        ? { home: saved.homeStickers, cal:[], box:[], fav:[], set:[] }
        : { home:[], cal:[], box:[], fav:[], set:[] }),
    });

    // ストリーク途切れチェック
    const _today     = new Date().toDateString();
    const _yesterday = new Date(Date.now() - 86400000).toDateString();
    if (S._lastPlayDate && S._lastPlayDate !== _today && S._lastPlayDate !== _yesterday && S.streak > 0) {
      S.streakBrokenPop   = true;
      S.streakBrokenCount = S.streak;
      S.streak            = 0;
    }
  } catch(e) { console.warn('load failed:', e); }
}
