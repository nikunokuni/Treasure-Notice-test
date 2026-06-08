/* ═══════════════════════════════════════════════════════════
   たからさがし — theme.js
   テーマ・フォントサイズの適用
   ═══════════════════════════════════════════════════════════ */

/** CSSカスタムプロパティにカラーテーマを一括適用 */
function applyTheme() {
  const theme = COLOR_THEMES.find(c => c.id === S.theme) || COLOR_THEMES[0];
  const root  = document.documentElement;
  const props = [
    ['--amber',       theme.amber],
    ['--amber-light', theme.amberLight],
    ['--amber-pale',  theme.amberPale],
    ['--teal',        theme.teal],
    ['--teal-light',  theme.tealLight],
    ['--coral',       theme.coral],
    ['--coral-light', theme.coralLight],
    ['--mint',        theme.mint],
    ['--mint-light',  theme.mintLight],
    ['--deep',        theme.deep],
    ['--paper',       theme.paper],
    ['--paper2',      theme.paper2],
    ['--lavender',    theme.lavender],
  ];
  props.forEach(([key, val]) => root.style.setProperty(key, val));
}

/** body クラスでフォントサイズを切り替え */
function applyFontSize() {
  document.body.classList.remove('fs-small', 'fs-medium', 'fs-large');
  document.body.classList.add('fs-' + (S.fontSize || 'medium'));
}
