/* ═══════════════════════════════════════════════════════════
   たからさがし — utils.js
   汎用ユーティリティ（esc, aiText, fmtDate, pickRand, $id）
   ═══════════════════════════════════════════════════════════ */

/** HTMLエスケープ */
function esc(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/** AI返答テキスト（改行→<br>） */
function aiText(str) {
  return esc(str).replace(/\n/g,'<br>');
}

/** 日付フォーマット（ISO→「○がつ○にち」） */
function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth()+1}がつ${d.getDate()}にち`;
}

/** ODAI_ALL からランダム1件を返す */
function pickRand() {
  return ODAI_ALL[Math.floor(Math.random() * ODAI_ALL.length)];
}

/** id でDOM要素を取得するショートハンド */
const $id = id => document.getElementById(id);
