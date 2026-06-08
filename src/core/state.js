/* ═══════════════════════════════════════════════════════════
   たからさがし — state.js
   アプリ全体の状態オブジェクト S
   ═══════════════════════════════════════════════════════════ */

// ── アプリ全体の状態（S） ──
const S = {
  onboarded: false,
  step: 0,
  user: { name:'', ageGroup:'young', likes:'', strengths:'', parentName:'ママ' },
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
  // ── チャット進行（chattest 由来の5フェーズ制御） ──
  situationContext: '',
  observationContext: '',
  currentSummary: '',
  parentBridgeDone: false,
  phase3Turns: 0,
  phase3DecisionAsked: false,
  phase3OpinionDone: false,
  phase3CompareDone: false,
  showDecisionButtons: false,
  takaraMemory: null,
  summaryItems: [],
  summaryOpinion: [],
  summaryMission: '',
  tomorrowHint: '',
  noteStamps: [],
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
  obAgeOpen: false,
  favPage: 0,
  notePage: 0,
  theme: 'amber',
  obColorOpen: false,
  newBadges: [],
   // ── 手帳ゲーム ──
  ownedPageThemes: ['plain'],   // 所持している手帳テーマID一覧
  notebooks: [],                // 作成済み手帳リスト
  notebookEditing: null,        // 編集中の手帳オブジェクト（null = 非編集中）
  notebookTray: 'badge',        // トレイの選択タブ ('badge'|'sticker'|'fav'|'note')
  notebookPlacing: null,        // 配置待ちアイテム { type, id, emoji, label }
  notebookStickerPick: null,    // ふせん選択中のトレイ種別 ('fav'|'note'|null)
  notebookStickerSelected: null,// 選択中のふせん画像ID
  shownBadgeModal: null,
};
