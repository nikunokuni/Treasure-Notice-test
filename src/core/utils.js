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

/** JSONレスポンスのMarkdownフェンスを除去してパース */
function parseJSON(str) {
  return JSON.parse(str.replace(/```json|```/g, '').trim());
}

/** 会話履歴を「[話者] テキスト」形式の文字列に変換 */
function formatConversation(messages) {
  return messages.map(m => {
    const who = m.role === 'ai' ? 'たからちゃん' : S.user.name || 'こども';
    return `[${who}] ${m.text}`;
  }).join('\n');
}

// 開始時の問いかけバリエーション（お題を組み込む）
const OPENING_TEMPLATES = [
  name => `${name}をどこでみつけたの？`,
  name => `${name}をみつけたのはいつ？`,
  name => `${name}って、さわったことある？`,
  name => `${name}はどんなところにあった？`,
  name => `${name}はいつもみるもの？`,
];
