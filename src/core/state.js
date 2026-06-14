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
  odaiGenerating: false,
  messages: [],
  speaker: 'child',
  childChatCount: 0,            // 子どもが送ったチャットメッセージの累計数
  lastIsInterested: true,        // 直近の興味判定結果（3回に1回だけ判定し、それ以外は前回値を流用）
  isLoading: false,
  lastError: false,
  lastSendPayload: null,
  // ── チャット進行（chattest 由来の5フェーズ制御） ──
  situationContext: '',
  observationContext: '',
  deepDiveGoal: '',
  parentBridgeDone: false,
  phase3Turns: 0,
  phase3DecisionAsked: false,
  phase3OpinionDone: false,
  showDecisionButtons: false,
  phase4ConfirmDone: false,
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
  favPage: 0,
  notePage: 0,
  theme: 'amber',
  obColorOpen: false,
  newBadges: [],
   // ── 手帳ゲーム ──
  ownedPageThemes: ['plain'],   // 所持している手帳テーマID一覧（重複あり＝獲得回数ぶん積み上がる）
  grantedPointThemes: 0,        // バッヂポイント枠で付与済みのテーマ数（ランダム付与の進捗カウンタ）
  grantedDaysBonusTheme: false, // 10日ボーナス枠のテーマ（plain固定）を付与済みか
  notebooks: [],                // 作成済み手帳リスト
  notebookEditing: null,        // 編集中の手帳オブジェクト（null = 非編集中）
  notebookTray: 'badge',        // トレイの選択タブ ('badge'|'sticker'|'fav'|'note')
  notebookPlacing: null,        // 配置待ちアイテム { type, id, emoji, label }
  notebookStickerPick: null,    // ふせん選択中のトレイ種別 ('fav'|'note'|null)
  notebookStickerSelected: null,// 選択中のふせん画像ID
  shownBadgeModal: null,
  notebookUnlocked: false,      // てちょう欄を解放したか（一度解放したら表示しつづける）
  notebookUnlockPending: false, // 解放演出の表示待ち
  shownNotebookUnlock: false,   // 解放演出モーダルの表示中フラグ

  // ── シール（チャット回数報酬・ホーム貼り付け） ──
  ownedStickers: [],            // 所持シール一覧（STICKERS の id、重複あり＝獲得回数ぶん積み上がる）
  grantedChatStickers: 0,       // チャット回数枠（50回ごと）で付与済みのシール数
  firstStickerPending: false,   // 初回シール取得演出の表示待ち
  shownFirstSticker: false,     // 初回演出を見せ終えたか（true で「シールをはる」ボタンが出現）
  stickerPlaceMode: false,      // 「シールをはる」モード中か
  stickerPlacing: null,         // 配置待ちシール { ownedIndex, id, emoji }
  stickerRemoveMode: false,     // 「シールをはずす」モード中か
  tabStickers: { home:[], cal:[], box:[], fav:[], set:[] }, // タブごとに貼られたシール [{ id, emoji, x, y }]

  // ── ショップ（たからさがしアイテムショップ） ──
  shopModal: false,           // ショップモーダルの開閉状態
  purchaseCompleteAlert: false, // 「かいものかんりょうしました」アラームの表示状態
  ownedStickyColors: [],       // 購入で獲得したふせんの色id一覧
  shopPurchaseCount: 0,        // ショップでの購入回数（バッヂ用）
  devSupportActive: false,     // 開発支援サブスク登録済みか
  claimedShopBadge: false,     // 無料バッヂを受け取り済みか
};
