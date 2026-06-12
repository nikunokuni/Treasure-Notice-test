/* ═══════════════════════════════════════════════════════════
   たからさがし — badges.js
   バッヂ定義（進化型）と達成レベル判定ヘルパー
   ═══════════════════════════════════════════════════════════ */

// ── バッヂ定義（20個・進化型） ──
// levels: 各レベルの定義。最高レベルが現在の状態として表示される
// check(s, level): そのlevelを達成しているか判定する関数
const BADGE_DEFS = [

  // ── 回数系（進化型：たからさがし全体） ──
  { id:'takarasagashi', levels:[
    { count:1,  icon:'🗺️',  name:'はじめてのたからさがし', cond:'たからさがしを1かいやった',    rarity:'normal', check: s=>s.records.length>=1  },
    { count:10, icon:'🗺️', name:'たからさがし10かい！',   cond:'たからさがしを10かいやった',   rarity:'rare',   check: s=>s.records.length>=10 },
    { count:50, icon:'🏆',  name:'たからさがし50かい！',   cond:'たからさがしを50かいやった',   rarity:'epic',   check: s=>s.records.length>=50 },
  ]},

  // ── カテゴリ別（進化型） ──
  { id:'kotoba', levels:[
    { count:1,  icon:'📖',   name:'ことばたんけんか',    cond:'ことばレンズで1かいたんけんした',  rarity:'normal', check: s=>s.records.filter(r=>r.lens==='ことば').length>=1  },
    { count:10, icon:'📖', name:'ことば10かい！',      cond:'ことばレンズで10かいたんけんした', rarity:'rare',   check: s=>s.records.filter(r=>r.lens==='ことば').length>=10 },
    { count:50, icon:'📚',  name:'ことばのたつじん！',   cond:'ことばレンズで50かいたんけんした', rarity:'epic',   check: s=>s.records.filter(r=>r.lens==='ことば').length>=50 },
  ]},
  { id:'kazu', levels:[
    { count:1,  icon:'🔢',   name:'かずたんけんか',      cond:'かずレンズで1かいたんけんした',   rarity:'normal', check: s=>s.records.filter(r=>r.lens==='かず').length>=1  },
    { count:10, icon:'🔢', name:'かず10かい！',        cond:'かずレンズで10かいたんけんした',  rarity:'rare',   check: s=>s.records.filter(r=>r.lens==='かず').length>=10 },
    { count:50, icon:'🧮',  name:'かずのたつじん！',     cond:'かずレンズで50かいたんけんした',  rarity:'epic',   check: s=>s.records.filter(r=>r.lens==='かず').length>=50 },
  ]},
  { id:'moshimo', levels:[
    { count:1,  icon:'🔬',   name:'もしもたんけんか',    cond:'もしもレンズで1かいたんけんした', rarity:'normal', check: s=>s.records.filter(r=>r.lens==='もしも').length>=1  },
    { count:10, icon:'🔬', name:'もしも10かい！',      cond:'もしもレンズで10かいたんけんした',rarity:'rare',   check: s=>s.records.filter(r=>r.lens==='もしも').length>=10 },
    { count:50, icon:'⚗️',  name:'もしものたつじん！',   cond:'もしもレンズで50かいたんけんした',rarity:'epic',   check: s=>s.records.filter(r=>r.lens==='もしも').length>=50 },
  ]},
  { id:'tsunagari', levels:[
    { count:1,  icon:'🗺',   name:'つながりたんけんか',  cond:'つながりレンズで1かいたんけんした',rarity:'normal', check: s=>s.records.filter(r=>r.lens==='つながり').length>=1  },
    { count:10, icon:'🗺', name:'つながり10かい！',    cond:'つながりレンズで10かいたんけんした',rarity:'rare',  check: s=>s.records.filter(r=>r.lens==='つながり').length>=10 },
    { count:50, icon:'🌍',  name:'つながりのたつじん！', cond:'つながりレンズで50かいたんけんした',rarity:'epic',  check: s=>s.records.filter(r=>r.lens==='つながり').length>=50 },
  ]},
  { id:'jibun', levels:[
    { count:1,  icon:'💛',   name:'じぶんたんけんか',    cond:'じぶんレンズで1かいたんけんした', rarity:'normal', check: s=>s.records.filter(r=>r.lens==='じぶん').length>=1  },
    { count:10, icon:'💛', name:'じぶん10かい！',      cond:'じぶんレンズで10かいたんけんした',rarity:'rare',   check: s=>s.records.filter(r=>r.lens==='じぶん').length>=10 },
    { count:50, icon:'🌟',  name:'じぶんのたつじん！',   cond:'じぶんレンズで50かいたんけんした',rarity:'epic',   check: s=>s.records.filter(r=>r.lens==='じぶん').length>=50 },
  ]},

  // ── 通算日数（進化型） ──
  { id:'totaldays', levels:[
    { count:1,  icon:'📅',   name:'はじめてのたんけんび', cond:'1にちたんけんした',    rarity:'normal', check: s=>{ const d=new Set(s.records.map(r=>new Date(r.date).toDateString())); return d.size>=1;  } },
    { count:7,  icon:'📅', name:'7にちたんけんした！',  cond:'7にちたんけんした',    rarity:'rare',   check: s=>{ const d=new Set(s.records.map(r=>new Date(r.date).toDateString())); return d.size>=7;  } },
    { count:30, icon:'🗓️',  name:'30にちたんけんした！', cond:'30にちたんけんした',   rarity:'epic',   check: s=>{ const d=new Set(s.records.map(r=>new Date(r.date).toDateString())); return d.size>=30; } },
  ]},

  // ── おきにいり（進化型） ──
  { id:'bookmark', levels:[
    { count:1,  icon:'🔖',   name:'はじめてのおきにいり', cond:'おきにいりを1こあつめた',   rarity:'normal', check: s=>s.records.filter(r=>r.bookmarked).length>=1  },
    { count:10, icon:'🔖', name:'おきにいり10こ！',    cond:'おきにいりを10こあつめた',  rarity:'rare',   check: s=>s.records.filter(r=>r.bookmarked).length>=10 },
    { count:50, icon:'💎',  name:'おきにいり50こ！',    cond:'おきにいりを50こあつめた',  rarity:'epic',   check: s=>s.records.filter(r=>r.bookmarked).length>=50 },
  ]},

  // ── ノート（進化型） ──
  { id:'note', levels:[
    { count:1,  icon:'📓',   name:'はじめてのノート',     cond:'ノートを1こかいた',    rarity:'normal', check: s=>s.records.filter(r=>r.note&&r.note.trim()).length>=1  },
    { count:10, icon:'📓', name:'ノート10こ！',         cond:'ノートを10こかいた',   rarity:'rare',   check: s=>s.records.filter(r=>r.note&&r.note.trim()).length>=10 },
    { count:50, icon:'📔',  name:'ノートのたつじん！',    cond:'ノートを50こかいた',   rarity:'epic',   check: s=>s.records.filter(r=>r.note&&r.note.trim()).length>=50 },
  ]},

  // ── X投稿（進化型） ──
  { id:'xpost', levels:[
    { count:1,  icon:'𝕏',    name:'はじめてのとうこう',   cond:'Xにとうこうした',      rarity:'normal', check: s=>(s.xPostCount||0)>=1  },
    { count:10, icon:'𝕏',  name:'とうこう10かい！',     cond:'Xに10かいとうこうした', rarity:'rare',   check: s=>(s.xPostCount||0)>=10 },
    { count:50, icon:'📣',  name:'とうこう50かい！',     cond:'Xに50かいとうこうした', rarity:'epic',   check: s=>(s.xPostCount||0)>=50 },
  ]},

  // ── 写真でお題（進化型） ──
  { id:'photo', levels:[
    { count:1,  icon:'📷',   name:'カメラたんけんか',     cond:'しゃしんでたからをみつけた',      rarity:'normal', check: s=>s.records.filter(r=>r.odai&&r.odai.fromPhoto).length>=1  },
    { count:10, icon:'📷', name:'カメラ10かい！',       cond:'しゃしんで10かいたからをみつけた', rarity:'rare',   check: s=>s.records.filter(r=>r.odai&&r.odai.fromPhoto).length>=10 },
    { count:50, icon:'🎥',  name:'カメラのたつじん！',   cond:'しゃしんで50かいたからをみつけた', rarity:'epic',   check: s=>s.records.filter(r=>r.odai&&r.odai.fromPhoto).length>=50 },
  ]},

  // ── 同じお題を違うレンズで（進化型） ──
  { id:'multilens', levels:[
    { count:2,  icon:'🌈',   name:'2つのレンズでたんけん',cond:'おなじおだいをちがうレンズで2かいたんけんした',rarity:'normal', check: s=>_checkMultiLens(s,2) },
    { count:5,  icon:'🌈', name:'5つのレンズでたんけん',cond:'おなじおだいをちがうレンズで5かいたんけんした',rarity:'epic',   check: s=>_checkMultiLens(s,5) },
  ]},

  // ── 連続日数（進化型） ──
  { id:'streak', levels:[
    { count:3,  icon:'🔥',   name:'はじめてのれんぞく',   cond:'1にちれんぞくでたからさがしをした',  rarity:'normal', check: s=>s.streak>=1  },
    { count:10,  icon:'🔥', name:'1しゅうかんれんぞく！', cond:'7にちれんぞくでたからさがしをした',  rarity:'rare',   check: s=>s.streak>=7  },
    { count:30, icon:'🌟',  name:'1かげつれんぞく！',    cond:'30にちれんぞくでたからさがしをした', rarity:'epic',   check: s=>s.streak>=30 },
  ]},

  // ── 1回完了系（シンプル・levelsが1つ） ──
  { id:'homescreen', levels:[
    { count:1, icon:'📱',  name:'ホームについか',       cond:'ホーム画面についかした',       rarity:'normal', check: s=>!!(s.addedToHomeScreen) },
  ]},
  { id:'changedcolor', levels:[
    { count:1, icon:'🎨',  name:'いろをかえた',         cond:'アプリのいろをかえた',         rarity:'normal', check: s=>!!(s.changedColor) },
  ]},
  { id:'weeklyreport', levels:[
    { count:1, icon:'📊',  name:'レポートをつくった',   cond:'ウィークリーレポートをつくった', rarity:'normal', check: s=>!!(s.weeklyReport&&s.weeklyReport.trim()) },
  ]},
  { id:'feedback', levels:[
    { count:1, icon:'📨',  name:'アンケートにこたえた', cond:'アンケートにこたえた',          rarity:'normal', check: s=>!!(s.sentFeedback) },
  ]},

  // ── シールをはる（進化型） ──
  { id:'sticker', levels:[
    { count:1,  icon:'🎀',   name:'はじめてのシール',   cond:'シールを1まいはった',   rarity:'normal', check: s=>Object.values(s.tabStickers||{}).flat().length>=1  },
    { count:10, icon:'🎀', name:'シール10まい！',     cond:'シールを10まいはった',  rarity:'rare',   check: s=>Object.values(s.tabStickers||{}).flat().length>=10 },
    { count:30, icon:'🎖️',  name:'シールのたつじん！', cond:'シールを30まいはった',  rarity:'epic',   check: s=>Object.values(s.tabStickers||{}).flat().length>=30 },
  ]},

  // ── パーフェクト月間（進化型） ──
  { id:'perfectmonth', levels:[
    { count:1, icon:'📆',   name:'パーフェクト月間！',     cond:'1かげつ、まいにちたからさがしをした',     rarity:'normal', check: s=>_countPerfectMonths(s)>=1 },
    { count:2, icon:'📆', name:'パーフェクト月間2かい！', cond:'パーフェクト月間を2かいたっせいした',     rarity:'rare',   check: s=>_countPerfectMonths(s)>=2 },
    { count:4, icon:'🏅',   name:'パーフェクト月間4かい！', cond:'パーフェクト月間を4かいたっせいした',     rarity:'epic',   check: s=>_countPerfectMonths(s)>=4 },
  ]},

  // ── おかいもの（進化型） ──
  { id:'shopping', levels:[
    { count:1, icon:'🛍️', name:'はじめてのおかいもの', cond:'ショップでおかいものをした',     rarity:'normal', check: s=>(s.shopPurchaseCount||0)>=1 },
    { count:2, icon:'🛍️', name:'おかいもの2かい！',     cond:'ショップで2かいおかいものをした', rarity:'rare',   check: s=>(s.shopPurchaseCount||0)>=2 },
    { count:4, icon:'🎀',  name:'おかいもの4かい！',     cond:'ショップで4かいおかいものをした', rarity:'epic',   check: s=>(s.shopPurchaseCount||0)>=4 },
  ]},

  // ── 未定1枠（将来用のプレースホルダー） ──
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

// ── パーフェクト月間（その月の全日に1回以上記録があるか）の達成数を数える（ヘルパー） ──
function _countPerfectMonths(s) {
  const monthDays = {};
  s.records.forEach(r => {
    const d   = new Date(r.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthDays[key]) monthDays[key] = new Set();
    monthDays[key].add(d.getDate());
  });
  return Object.entries(monthDays).reduce((count, [key, days]) => {
    const [y, m] = key.split('-').map(Number);
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    return days.size >= daysInMonth ? count + 1 : count;
  }, 0);
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
