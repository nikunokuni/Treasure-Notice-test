/* ═══════════════════════════════════════════════════════════
   たからさがし — decorations.js
   集めて飾る要素：手帳テーマ・シール・付箋カラー・付箋画像
   ═══════════════════════════════════════════════════════════ */

// ── 手帳ページテーマ（報酬で解放） ──
const NOTEBOOK_THEMES = [
  { id:'plain',  name:'シンプル',  bg:'#fffef7', pattern:'none',        emoji:'📄' },
  { id:'pink',   name:'ピンク',    bg:'#fff0f5', pattern:'polka-pink',  emoji:'🌸' },
  { id:'blue',   name:'あお',      bg:'#f0f6ff', pattern:'polka-blue',  emoji:'☁️' },
  { id:'nature', name:'みどり',    bg:'#f0fdf6', pattern:'polka-green', emoji:'🌿' },
  { id:'star',   name:'きいろ',      bg:'#fffbe0', pattern:'polka-star',  emoji:'⭐' },
];

// ── シール素材（絵文字ベース） ──
const STICKERS = [
  { id:'st1', emoji:'⭐' }, { id:'st2', emoji:'🌟' }, { id:'st3', emoji:'✨' },
  { id:'st4', emoji:'🌸' }, { id:'st5', emoji:'🌈' }, { id:'st6', emoji:'🎀' },
  { id:'st7', emoji:'🍀' }, { id:'st8', emoji:'🌙' }, { id:'st9', emoji:'☀️' },
  { id:'st10',emoji:'❤️' }, { id:'st11',emoji:'🎵' }, { id:'st12',emoji:'🦋' },
  { id:'st13',emoji:'🌺' }, { id:'st14',emoji:'🍭' }, { id:'st15',emoji:'🎈' },
  { id:'st16',emoji:'🐝' }, { id:'st17',emoji:'🌻' }, { id:'st18',emoji:'🍄' },
  { id:'st19',emoji:'🐶' }, { id:'st20',emoji:'🐱' }, { id:'st21',emoji:'🐰' },
  { id:'st22',emoji:'🐻' }, { id:'st23',emoji:'🐼' }, { id:'st24',emoji:'🐯' },
  { id:'st25',emoji:'🦁' }, { id:'st26',emoji:'🐨' }, { id:'st27',emoji:'🐸' },
  { id:'st28',emoji:'🐢' }, { id:'st29',emoji:'🐠' }, { id:'st30',emoji:'🐬' },
  { id:'st31',emoji:'🦄' }, { id:'st32',emoji:'🐧' }, { id:'st33',emoji:'🐤' },
  { id:'st34',emoji:'🌷' }, { id:'st35',emoji:'🌼' }, { id:'st36',emoji:'🍎' },
  { id:'st37',emoji:'🍓' }, { id:'st38',emoji:'🍉' }, { id:'st39',emoji:'🍕' },
  { id:'st40',emoji:'🍩' }, { id:'st41',emoji:'🍰' }, { id:'st42',emoji:'🎂' },
  { id:'st43',emoji:'🚀' }, { id:'st44',emoji:'🚗' }, { id:'st45',emoji:'🚂' },
  { id:'st46',emoji:'✈️' }, { id:'st47',emoji:'🎁' }, { id:'st48',emoji:'🎉' },
  { id:'st49',emoji:'🔥' }, { id:'st50',emoji:'💎' },
];

// 付箋カラー選択肢（設定画面で使用）
// =============================================
const STICKY_COLORS = [
  { id: 'yellow', label: 'きいろ 🌟',  value: '#FFF9C4' },
  { id: 'green',  label: 'みどり 🌿',  value: '#C8E6C9' },
  { id: 'orange', label: 'オレンジ 🍊', value: '#FFE0B2' },
  { id: 'pink',   label: 'ピンク 🌸',  value: '#F8BBD9' },
  { id: 'purple', label: 'むらさき 🔮', value: '#D1C4E9' },
  { id: 'blue',   label: 'みずいろ 💙', value: '#B3E5FC' },
];

// ── 手帳ふせん画像（stickersフォルダのPNGを定義） ──
// ふせんを増やしたいときはここに追加するだけ
const NOTEBOOK_STICKERS = [
  { id: 'rocket', name: 'ロケット', src: 'src/assets/stickers/rochet.png' },
  // 例: { id: 'star', name: 'ほし', src: 'src/assets/stickers/star.png' },
];
