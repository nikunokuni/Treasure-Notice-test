/* ═══════════════════════════════
   たからさがし — constants.js
   全ての「定数データ」をここに集約
   ═══════════════════════════════ */

const PARENT_OPTS = ['パパ','ママ','きょうだい','ともだち','ひとり','その他'];

// ── カラーテーマ（12色相環） ──
const COLOR_THEMES = [
  { id:'amber',   name:'あんばー',   emoji:'🟡',
    amber:'#e8860a', amberLight:'#ffd166', amberPale:'#fff3cd',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#2d1b00',  paper:'#fdf6e3', paper2:'#fef9f0',
    lavender:'#9b89c4' },
  { id:'red',     name:'あか',       emoji:'🔴',
    amber:'#d62828', amberLight:'#f77f7f', amberPale:'#fde8e8',
    teal:'#457b9d',  tealLight:'#a8dadc',
    coral:'#e63946', coralLight:'#f4a261',
    mint:'#2a9d8f',  mintLight:'#a8dadc',
    deep:'#1d0000',  paper:'#fff5f5', paper2:'#fff0f0',
    lavender:'#9b89c4' },
  { id:'orange',  name:'おれんじ',   emoji:'🟠',
    amber:'#f4631e', amberLight:'#ffb347', amberPale:'#fff0e0',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#2d1100',  paper:'#fff8f2', paper2:'#fff4ec',
    lavender:'#9b89c4' },
  { id:'yellow',  name:'きいろ',     emoji:'🟡',
    amber:'#c9a800', amberLight:'#ffe066', amberPale:'#fffbe0',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#2d2400',  paper:'#fffef0', paper2:'#fffde8',
    lavender:'#9b89c4' },
  { id:'lime',    name:'きみどり',   emoji:'🟢',
    amber:'#6db33f', amberLight:'#b8e07a', amberPale:'#edfade',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#0d2200',  paper:'#f6fef0', paper2:'#f0fce6',
    lavender:'#9b89c4' },
  { id:'green',   name:'みどり',     emoji:'🟢',
    amber:'#2d9e6b', amberLight:'#7fe0b0', amberPale:'#e0f7ee',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#002d1a',  paper:'#f0fdf6', paper2:'#e8fdf0',
    lavender:'#9b89c4' },
  { id:'teal',    name:'みずいろ',   emoji:'🔵',
    amber:'#0a9396', amberLight:'#94d2bd', amberPale:'#e0f4f5',
    teal:'#2d9e6b',  tealLight:'#7fe0b0',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#457b9d',  mintLight:'#a8dadc',
    deep:'#002d2d',  paper:'#f0fdfd', paper2:'#e6fafa',
    lavender:'#9b89c4' },
  { id:'blue',    name:'あお',       emoji:'🔵',
    amber:'#1d6fa4', amberLight:'#74b3e8', amberPale:'#e0f0ff',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#001a2d',  paper:'#f0f6ff', paper2:'#e8f2ff',
    lavender:'#9b89c4' },
  { id:'indigo',  name:'あいいろ',   emoji:'🟣',
    amber:'#3d52a0', amberLight:'#8fa3e8', amberPale:'#eaecff',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#0d0a2d',  paper:'#f4f0ff', paper2:'#ede8ff',
    lavender:'#c4b5f4' },
  { id:'purple',  name:'むらさき',   emoji:'🟣',
    amber:'#7b2d8b', amberLight:'#c97edd', amberPale:'#f8e8ff',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#1a002d',  paper:'#fdf0ff', paper2:'#fae8ff',
    lavender:'#c4b5f4' },
  { id:'pink',    name:'ぴんく',     emoji:'🩷',
    amber:'#c2456a', amberLight:'#f0a0bd', amberPale:'#ffe8f0',
    teal:'#0a9396',  tealLight:'#94d2bd',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#2d001a',  paper:'#fff0f6', paper2:'#ffe8f2',
    lavender:'#9b89c4' },
  { id:'rose',    name:'ばら',       emoji:'🌹',
    amber:'#e0365a', amberLight:'#ff8fa3', amberPale:'#ffe8ed',
    teal:'#457b9d',  tealLight:'#a8dadc',
    coral:'#e76f51', coralLight:'#f4a261',
    mint:'#52b788',  mintLight:'#b7e4c7',
    deep:'#2d0010',  paper:'#fff5f7', paper2:'#ffecf0',
    lavender:'#9b89c4' },
];

const TYPES = [
  { id:'A', icon:'👀', name:'はっけん',
    desc:'じっくりかんさつする。「あ、これみて！」' },
  { id:'B', icon:'📚', name:'しらべる',
    desc:'ただしいちしきがすき。「ほんとうはなに？」' },
  { id:'C', icon:'🔭', name:'そうぞう',
    desc:'みえないぶぶんをすいりする。「もしかして〜かな？」' },
];

const AGE_PROMPTS = [
  { id:'young',  label:'3〜5さい',  icon:'🐣', desc:'ひらがなメイン・みじかいぶん・ごかんちゅうしん' },
  { id:'middle', label:'6〜8さい',  icon:'🌱', desc:'すこしふくざつなといかけもたのしめる' },
  { id:'older',  label:'9〜12さい', icon:'🌳', desc:'ろんりてきなしこう・ふかいこうさつもできる' },
];

// ── バッヂ定義（20個・進化型） ──
// levels: 各レベルの定義。最高レベルが現在の状態として表示される
// check(s, level): そのlevelを達成しているか判定する関数
const BADGE_DEFS = [

  // ── 回数系（進化型：たからさがし全体） ──
  { id:'takarasagashi', levels:[
    { count:1,  icon:'🗺️',  name:'はじめてのたからさがし', cond:'たからさがしを1かいやった',    rarity:'normal', check: s=>s.records.length>=1  },
    { count:10, icon:'🗺️✨', name:'たからさがし10かい！',   cond:'たからさがしを10かいやった',   rarity:'rare',   check: s=>s.records.length>=10 },
    { count:50, icon:'🏆',  name:'たからさがし50かい！',   cond:'たからさがしを50かいやった',   rarity:'epic',   check: s=>s.records.length>=50 },
  ]},

  // ── カテゴリ別（進化型） ──
  { id:'kotoba', levels:[
    { count:1,  icon:'📖',   name:'ことばたんけんか',    cond:'ことばレンズで1かいたんけんした',  rarity:'normal', check: s=>s.records.filter(r=>r.lens==='ことば').length>=1  },
    { count:10, icon:'📖✨', name:'ことば10かい！',      cond:'ことばレンズで10かいたんけんした', rarity:'rare',   check: s=>s.records.filter(r=>r.lens==='ことば').length>=10 },
    { count:50, icon:'📚',  name:'ことばのたつじん！',   cond:'ことばレンズで50かいたんけんした', rarity:'epic',   check: s=>s.records.filter(r=>r.lens==='ことば').length>=50 },
  ]},
  { id:'kazu', levels:[
    { count:1,  icon:'🔢',   name:'かずたんけんか',      cond:'かずレンズで1かいたんけんした',   rarity:'normal', check: s=>s.records.filter(r=>r.lens==='かず').length>=1  },
    { count:10, icon:'🔢✨', name:'かず10かい！',        cond:'かずレンズで10かいたんけんした',  rarity:'rare',   check: s=>s.records.filter(r=>r.lens==='かず').length>=10 },
    { count:50, icon:'🧮',  name:'かずのたつじん！',     cond:'かずレンズで50かいたんけんした',  rarity:'epic',   check: s=>s.records.filter(r=>r.lens==='かず').length>=50 },
  ]},
  { id:'kagaku', levels:[
    { count:1,  icon:'🔬',   name:'かがくたんけんか',    cond:'かがくレンズで1かいたんけんした', rarity:'normal', check: s=>s.records.filter(r=>r.lens==='かがく').length>=1  },
    { count:10, icon:'🔬✨', name:'かがく10かい！',      cond:'かがくレンズで10かいたんけんした',rarity:'rare',   check: s=>s.records.filter(r=>r.lens==='かがく').length>=10 },
    { count:50, icon:'⚗️',  name:'かがくのたつじん！',   cond:'かがくレンズで50かいたんけんした',rarity:'epic',   check: s=>s.records.filter(r=>r.lens==='かがく').length>=50 },
  ]},
  { id:'shakai', levels:[
    { count:1,  icon:'🗺',   name:'しゃかいたんけんか',  cond:'しゃかいレンズで1かいたんけんした',rarity:'normal', check: s=>s.records.filter(r=>r.lens==='しゃかい').length>=1  },
    { count:10, icon:'🗺✨', name:'しゃかい10かい！',    cond:'しゃかいレンズで10かいたんけんした',rarity:'rare',  check: s=>s.records.filter(r=>r.lens==='しゃかい').length>=10 },
    { count:50, icon:'🌍',  name:'しゃかいのたつじん！', cond:'しゃかいレンズで50かいたんけんした',rarity:'epic',  check: s=>s.records.filter(r=>r.lens==='しゃかい').length>=50 },
  ]},
  { id:'jibun', levels:[
    { count:1,  icon:'💛',   name:'じぶんたんけんか',    cond:'じぶんレンズで1かいたんけんした', rarity:'normal', check: s=>s.records.filter(r=>r.lens==='じぶん').length>=1  },
    { count:10, icon:'💛✨', name:'じぶん10かい！',      cond:'じぶんレンズで10かいたんけんした',rarity:'rare',   check: s=>s.records.filter(r=>r.lens==='じぶん').length>=10 },
    { count:50, icon:'🌟',  name:'じぶんのたつじん！',   cond:'じぶんレンズで50かいたんけんした',rarity:'epic',   check: s=>s.records.filter(r=>r.lens==='じぶん').length>=50 },
  ]},

  // ── 通算日数（進化型） ──
  { id:'totaldays', levels:[
    { count:1,  icon:'📅',   name:'はじめてのたんけんび', cond:'1にちたんけんした',    rarity:'normal', check: s=>{ const d=new Set(s.records.map(r=>new Date(r.date).toDateString())); return d.size>=1;  } },
    { count:7,  icon:'📅✨', name:'7にちたんけんした！',  cond:'7にちたんけんした',    rarity:'rare',   check: s=>{ const d=new Set(s.records.map(r=>new Date(r.date).toDateString())); return d.size>=7;  } },
    { count:30, icon:'🗓️',  name:'30にちたんけんした！', cond:'30にちたんけんした',   rarity:'epic',   check: s=>{ const d=new Set(s.records.map(r=>new Date(r.date).toDateString())); return d.size>=30; } },
  ]},

  // ── おきにいり（進化型） ──
  { id:'bookmark', levels:[
    { count:1,  icon:'🔖',   name:'はじめてのおきにいり', cond:'おきにいりを1こあつめた',   rarity:'normal', check: s=>s.records.filter(r=>r.bookmarked).length>=1  },
    { count:10, icon:'🔖✨', name:'おきにいり10こ！',    cond:'おきにいりを10こあつめた',  rarity:'rare',   check: s=>s.records.filter(r=>r.bookmarked).length>=10 },
    { count:50, icon:'💎',  name:'おきにいり50こ！',    cond:'おきにいりを50こあつめた',  rarity:'epic',   check: s=>s.records.filter(r=>r.bookmarked).length>=50 },
  ]},

  // ── ノート（進化型） ──
  { id:'note', levels:[
    { count:1,  icon:'📓',   name:'はじめてのノート',     cond:'ノートを1こかいた',    rarity:'normal', check: s=>s.records.filter(r=>r.note&&r.note.trim()).length>=1  },
    { count:10, icon:'📓✨', name:'ノート10こ！',         cond:'ノートを10こかいた',   rarity:'rare',   check: s=>s.records.filter(r=>r.note&&r.note.trim()).length>=10 },
    { count:50, icon:'📔',  name:'ノートのたつじん！',    cond:'ノートを50こかいた',   rarity:'epic',   check: s=>s.records.filter(r=>r.note&&r.note.trim()).length>=50 },
  ]},

  // ── X投稿（進化型） ──
  { id:'xpost', levels:[
    { count:1,  icon:'𝕏',    name:'はじめてのとうこう',   cond:'Xにとうこうした',      rarity:'normal', check: s=>(s.xPostCount||0)>=1  },
    { count:10, icon:'𝕏✨',  name:'とうこう10かい！',     cond:'Xに10かいとうこうした', rarity:'rare',   check: s=>(s.xPostCount||0)>=10 },
    { count:50, icon:'📣',  name:'とうこう50かい！',     cond:'Xに50かいとうこうした', rarity:'epic',   check: s=>(s.xPostCount||0)>=50 },
  ]},

  // ── 写真でお題（進化型） ──
  { id:'photo', levels:[
    { count:1,  icon:'📷',   name:'カメラたんけんか',     cond:'しゃしんでたからをみつけた',      rarity:'normal', check: s=>s.records.filter(r=>r.odai&&r.odai.fromPhoto).length>=1  },
    { count:10, icon:'📷✨', name:'カメラ10かい！',       cond:'しゃしんで10かいたからをみつけた', rarity:'rare',   check: s=>s.records.filter(r=>r.odai&&r.odai.fromPhoto).length>=10 },
    { count:50, icon:'🎥',  name:'カメラのたつじん！',   cond:'しゃしんで50かいたからをみつけた', rarity:'epic',   check: s=>s.records.filter(r=>r.odai&&r.odai.fromPhoto).length>=50 },
  ]},

  // ── 同じお題を違うレンズで（進化型） ──
  { id:'multilens', levels:[
    { count:2,  icon:'🌈',   name:'2つのレンズでたんけん',cond:'おなじおだいをちがうレンズで2かいたんけんした',rarity:'normal', check: s=>_checkMultiLens(s,2) },
    { count:5,  icon:'🌈✨', name:'5つのレンズでたんけん',cond:'おなじおだいをちがうレンズで5かいたんけんした',rarity:'epic',   check: s=>_checkMultiLens(s,5) },
  ]},

  // ── 連続日数（進化型） ──
  { id:'streak', levels:[
    { count:1,  icon:'🔥',   name:'はじめてのれんぞく',   cond:'1にちれんぞくでたからさがしをした',  rarity:'normal', check: s=>s.streak>=1  },
    { count:7,  icon:'🔥✨', name:'1しゅうかんれんぞく！', cond:'7にちれんぞくでたからさがしをした',  rarity:'rare',   check: s=>s.streak>=7  },
    { count:30, icon:'🌟',  name:'1かげつれんぞく！',    cond:'30にちれんぞくでたからさがしをした', rarity:'epic',   check: s=>s.streak>=30 },
  ]},

  // ── 1回完了系（シンプル・levelsが1つ） ──
  { id:'homescreen', levels:[
    { count:1, icon:'📱',  name:'ホームについか',       cond:'ホーム画面についかした',       rarity:'normal', check: s=>!!(s.addedToHomeScreen) },
  ]},
  { id:'changedcolor', levels:[
    { count:1, icon:'🎨',  name:'いろをかえた',         cond:'アプリのいろをかえた',         rarity:'normal', check: s=>!!(s.changedColor) },
  ]},
  { id:'changedtype', levels:[
    { count:1, icon:'🔄',  name:'タイプをかえた',       cond:'まなびタイプをかえた',         rarity:'normal', check: s=>!!(s.changedType) },
  ]},
  { id:'weeklyreport', levels:[
    { count:1, icon:'📊',  name:'レポートをつくった',   cond:'ウィークリーレポートをつくった', rarity:'normal', check: s=>!!(s.weeklyReport&&s.weeklyReport.trim()) },
  ]},
  { id:'feedback', levels:[
    { count:1, icon:'📨',  name:'アンケートにこたえた', cond:'アンケートにこたえた',          rarity:'normal', check: s=>!!(s.sentFeedback) },
  ]},

  // ── 未定2枠（将来用のプレースホルダー） ──
  { id:'secret1', levels:[
    { count:1, icon:'❓',  name:'？？？',              cond:'ひみつのじょうけん',            rarity:'normal', check: _=>false },
  ]},
  { id:'secret2', levels:[
    { count:1, icon:'❓',  name:'？？？',              cond:'ひみつのじょうけん',            rarity:'normal', check: _=>false },
  ]},
];

// ── 同じお題を複数レンズで探索したか判定（ヘルパー） ──
function _checkMultiLens(s, minLenses) {
  const odaiLensMap = {};
  s.records.forEach(r => {
    const key = r.odai?.name || '';
    if (!key || !r.lens) return;
    if (!odaiLensMap[key]) odaiLensMap[key] = new Set();
    odaiLensMap[key].add(r.lens);
  });
  return Object.values(odaiLensMap).some(lensSet => lensSet.size >= minLenses);
}

// ── 後方互換：既存コードが BADGES.find/forEach で動くようにフラット化 ──
// 各バッジの「現在達成中の最高レベル」を返すオブジェクトとして機能させる
const BADGES = BADGE_DEFS.map(def => {
  // check: 最初のlevel（level[0]）を達成しているか = バッジ自体を持っているか
  const baseCheck = def.levels[0].check;
  return {
    id:   def.id,
    // icon/name/cond は「現在の最高レベル」を動的に返すゲッター
    get icon() { return _getCurrentLevel(def, S).icon;  },
    get name() { return _getCurrentLevel(def, S).name;  },
    get cond() { return _getCurrentLevel(def, S).cond;  },
    get rarity() { return _getCurrentLevel(def, S).rarity; },
    // check は「1つ目のlevelを達成=バッジ所持」として扱う
    check: baseCheck,
    // 進化判定用（view.jsから呼ぶ）
    def,
  };
});

/** バッジ定義から、現在のStateで達成している最高レベルを返す */
function _getCurrentLevel(def, s) {
  // levelsを逆順にチェックして、達成済みの最高レベルを返す
  const achieved = [...def.levels].reverse().find(lv => lv.check(s));
  return achieved || def.levels[0];
}

/** バッジの「次のレベル」を返す（未達成なら次の目標、全達成ならnull） */
function _getNextLevel(def, s) {
  return def.levels.find(lv => !lv.check(s)) || null;
}

const ODAI_ALL = [
  {emoji:'☁️',name:'くも',         label:'そら'},
  {emoji:'💧',name:'みず',         label:'自然'},
  {emoji:'🌙',name:'つき',         label:'そら'},
  {emoji:'🌈',name:'にじ',         label:'そら'},
  {emoji:'🌧',name:'あめ',         label:'おてんき'},
  {emoji:'🌬',name:'かぜ',         label:'自然'},
  {emoji:'☀️',name:'たいよう',     label:'そら'},
  {emoji:'⛅',name:'くもりそら',   label:'そら'},
  {emoji:'❄️',name:'ゆき',         label:'おてんき'},
  {emoji:'🌫',name:'きり',         label:'おてんき'},
  {emoji:'🚗',name:'くるま',       label:'のりもの'},
  {emoji:'🚂',name:'でんしゃ',     label:'のりもの'},
  {emoji:'🚌',name:'バス',         label:'のりもの'},
  {emoji:'🚲',name:'じてんしゃ',   label:'のりもの'},
  {emoji:'✈️',name:'ひこうき',     label:'のりもの'},
  {emoji:'🚑',name:'きゅうきゅうしゃ',label:'のりもの'},
  {emoji:'🚒',name:'しょうぼうしゃ',label:'のりもの'},
  {emoji:'🏗',name:'クレーン',     label:'まち'},
  {emoji:'🚦',name:'しんごう',     label:'まち'},
  {emoji:'🏪',name:'コンビニ',     label:'まち'},
  {emoji:'📮',name:'ポスト',       label:'まち'},
  {emoji:'🕳',name:'マンホール',   label:'まち'},
  {emoji:'🌳',name:'き',           label:'自然'},
  {emoji:'🌸',name:'さくら',       label:'自然'},
  {emoji:'🍂',name:'おちば',       label:'自然'},
  {emoji:'🌿',name:'くさ',         label:'自然'},
  {emoji:'🐝',name:'みつばち',     label:'いきもの'},
  {emoji:'🐛',name:'いもむし',     label:'いきもの'},
  {emoji:'🐜',name:'あり',         label:'いきもの'},
  {emoji:'🐦',name:'とり',         label:'いきもの'},
  {emoji:'🐟',name:'さかな',       label:'いきもの'},
  {emoji:'🦋',name:'ちょうちょ',   label:'いきもの'},
  {emoji:'🐌',name:'かたつむり',   label:'いきもの'},
  {emoji:'🌻',name:'ひまわり',     label:'自然'},
  {emoji:'🍄',name:'きのこ',       label:'自然'},
  {emoji:'🍚',name:'ごはん',       label:'たべもの'},
  {emoji:'🍞',name:'パン',         label:'たべもの'},
  {emoji:'🥚',name:'たまご',       label:'たべもの'},
  {emoji:'🥛',name:'ぎゅうにゅう', label:'たべもの'},
  {emoji:'🧅',name:'たまねぎ',     label:'たべもの'},
  {emoji:'🍎',name:'りんご',       label:'たべもの'},
  {emoji:'🥦',name:'ブロッコリー', label:'たべもの'},
  {emoji:'🥕',name:'にんじん',     label:'たべもの'},
  {emoji:'🪞',name:'かがみ',       label:'いえのなか'},
  {emoji:'💡',name:'でんきゅう',   label:'いえのなか'},
  {emoji:'🚿',name:'シャワー',     label:'いえのなか'},
  {emoji:'🪥',name:'はぶらし',     label:'いえのなか'},
  {emoji:'📺',name:'テレビ',       label:'いえのなか'},
  {emoji:'🧲',name:'じしゃく',     label:'いえのなか'},
  {emoji:'🔦',name:'かいちゅうでんとう',label:'いえのなか'},
  {emoji:'🤲',name:'て',           label:'からだ'},
  {emoji:'👣',name:'あしあと',     label:'からだ'},
  {emoji:'💨',name:'いき',         label:'からだ'},
  {emoji:'❤️',name:'しんぞう',     label:'からだ'},
  {emoji:'📏',name:'ものさし',     label:'がっこう'},
  {emoji:'✏️',name:'えんぴつ',     label:'がっこう'},
  {emoji:'📚',name:'ほん',         label:'がっこう'},
  {emoji:'🎒',name:'ランドセル',   label:'がっこう'},
  {emoji:'🛝',name:'すべりだい',   label:'こうえん'},
  {emoji:'🌰',name:'どんぐり',     label:'こうえん'},
  {emoji:'🪨',name:'いし',         label:'こうえん'},
];

const LENSES = [
  { id:'ことば',   icon:'📖', name:'ことば',
    kidDesc:'どんなことばでいえるかな？ ことばあそびもしよう！',
    cls:'lens-ことば' },
  { id:'かず',     icon:'🔢', name:'かず',
    kidDesc:'かずや かたち・おおきさを くらべてみよう！',
    cls:'lens-かず' },
  { id:'かがく',   icon:'🔬', name:'かがく',
    kidDesc:'なんで？どうして？を いっしょに かんがえよう！',
    cls:'lens-かがく' },
  { id:'しゃかい', icon:'🗺', name:'しゃかい',
    kidDesc:'だれが つくったの？どこから きたの？',
    cls:'lens-しゃかい' },
  { id:'じぶん',   icon:'💛', name:'じぶん',
    kidDesc:'きみはどう おもった？ すき？きらい？なんで？',
    cls:'lens-じぶん' },
];
