/* ═══════════════════════════════════════════════════════════
   たからさがし — decorations.js
   集めて飾る要素：手帳テーマ・シール・付箋カラー・付箋画像
   ═══════════════════════════════════════════════════════════ */

// ── 手帳ページテーマ（報酬で解放） ──
const NOTEBOOK_THEMES = [
  { id:'plain',  name:'シンプル',  bg:'#fffef7', pattern:'none',        emoji:'📄' },
  { id:'pink',   name:'ピンク',    bg:'#fff0f5', pattern:'polka-pink',  emoji:'🌸' },
  { id:'blue',   name:'そら',      bg:'#f0f6ff', pattern:'polka-blue',  emoji:'☁️' },
  { id:'nature', name:'しぜん',    bg:'#f0fdf6', pattern:'polka-green', emoji:'🌿' },
  { id:'star',   name:'ほし',      bg:'#fffbe0', pattern:'polka-star',  emoji:'⭐' },
];

// ── シール素材（絵文字ベース） ──
const STICKERS = [
  { id:'st1', emoji:'⭐' }, { id:'st2', emoji:'🌟' }, { id:'st3', emoji:'✨' },
  { id:'st4', emoji:'🌸' }, { id:'st5', emoji:'🌈' }, { id:'st6', emoji:'🎀' },
  { id:'st7', emoji:'🍀' }, { id:'st8', emoji:'🌙' }, { id:'st9', emoji:'☀️' },
  { id:'st10',emoji:'❤️' }, { id:'st11',emoji:'🎵' }, { id:'st12',emoji:'🦋' },
  { id:'st13',emoji:'🌺' }, { id:'st14',emoji:'🍭' }, { id:'st15',emoji:'🎈' },
  { id:'st16',emoji:'🐝' }, { id:'st17',emoji:'🌻' }, { id:'st18',emoji:'🍄' },
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
