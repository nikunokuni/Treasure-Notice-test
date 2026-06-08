/* ═══════════════════════════════════════════════════════════
   たからさがし — api.js
   チャット/写真解析の API 通信（現在はテスト用にスタブ化）
   ═══════════════════════════════════════════════════════════ */

// ── API通信 ──

/** チャットAPI呼び出し */
async function callAI(messages, system) {
  // ── API未接続時はスタブを返す（テスト用） ──
  throw new Error('チャット機能はテスト環境では使えません');
  /*
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data.text;
  */
}

/** 写真解析API呼び出し */
async function analyzePhoto(b64, mime) {
  // ── API未接続時はスタブを返す（テスト用） ──
  throw new Error('写真解析機能はテスト環境では使えません');
  /*
  const res = await fetch('/api/photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ b64, mime }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
  */
}
