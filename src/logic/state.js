/* ═══════════════════════════════
   たからさがし — state.js
   「状態管理」と「永続化」(S オブジェクト, load/save)
   ═══════════════════════════════ */

// ── アプリ全体の状態（S） ──
const S = {
  onboarded: false,
  step: 0,
  user: { name:'', type:'A', ageGroup:'young', likes:'', strengths:'', parentName:'ママ' },
  tab:  'home',
  flow: 'home',
  odai: null,
  lens: null,
  randOdai: null,
  odaiGenerating: false,
  messages: [],
  speaker: 'child',
  isLoading: false,
  lastError: false,
  lastSendPayload: null,
  summaryItems: [],
  summaryOpinion: '',
  opinionOpen: false,
  bookmarked: false,
  currentNote: '',
  calYear:  null,
  calMonth: null,
  dayModal: null,
  records: [],
  streak: 0,
  _lastPlayDate: null,
  _savedThisSession: false,
  fontSize: 'medium',
  weeklyReport: '',
  reportLoading: false,
  lastLens: null,
  chatPhase: 1,
  boxFilterTag: null,
  badgeModal: null,
  streakBrokenPop: false,
  streakBrokenCount: 0,
  weeklyTakara: null,
  customTags: [],
  settingsAgeOpen: false,
  settingsTypeOpen: false,
  obAgeOpen: false,
  obTypeOpen: false,
  favPage: 0,
  notePage: 0,
  theme: 'amber',
  obColorOpen: false,
  newBadges: [],
  shownBadgeModal: null,
};

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
      sentFeedback:     S.sentFeedback      ?? false,
      changedColor:     S.changedColor      ?? false,
      changedType:      S.changedType       ?? false,
      addedToHomeScreen:S.addedToHomeScreen ?? false,
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
      sentFeedback:      saved.sentFeedback       ?? false,
      changedColor:      saved.changedColor       ?? false,
      changedType:       saved.changedType        ?? false,
      addedToHomeScreen: saved.addedToHomeScreen  ?? false,
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
