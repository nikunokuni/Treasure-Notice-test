/* ═══════════════════════════════════════════════════════════
   たからさがし — dev-server.js
   ローカル開発用サーバー
   ・静的ファイル配信
   ・/api/chat, /api/photo を Gemini に中継（本番の Vercel Edge 関数を再現）
   ═══════════════════════════════════════════════════════════ */
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = 8731;
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.ico':'image/x-icon' };

// ── Gemini APIキーの読み込み（環境変数 or gemini.key ファイル） ──
function loadApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  try { return fs.readFileSync(path.join(root, 'gemini.key'), 'utf8').trim(); }
  catch { return ''; }
}
const GEMINI_API_KEY = loadApiKey();

// ── リクエストボディを JSON として読む ──
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 20 * 1024 * 1024) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

// ── /api/chat：会話を Gemini に中継 ──
async function handleChat(req, res) {
  const { messages, system } = await readJsonBody(req);
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: { maxOutputTokens: 1000 },
      }),
    }
  );
  const data = await r.json();
  if (!r.ok) return sendJson(res, 500, { error: data.error?.message || 'Gemini error' });
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  sendJson(res, 200, { text });
}

// ── /api/photo：画像を Gemini に中継 ──
async function handlePhoto(req, res) {
  const { b64, mime } = await readJsonBody(req);
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: 'JSONのみ返してください（Markdownなし）: {"name":"ひらがな短い単語","emoji":"絵文字1つ","label":"カテゴリ"}' }] },
        contents: [{
          role: 'user',
          parts: [
            { inline_data: { mime_type: mime, data: b64 } },
            { text: 'この写真の主な物を教えてください。' },
          ],
        }],
        generationConfig: { maxOutputTokens: 200 },
      }),
    }
  );
  const data = await r.json();
  if (!r.ok) return sendJson(res, 500, { error: data.error?.message || 'Gemini error' });
  const txt = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```json|```/g, '').trim();
  sendJson(res, 200, JSON.parse(txt));
}

http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(req.url.split('?')[0]);

  // ── API ルート ──
  if (pathname.startsWith('/api/')) {
    if (!GEMINI_API_KEY) {
      return sendJson(res, 500, { error: 'GEMINI_API_KEY が未設定です（gemini.key ファイル or 環境変数を確認）' });
    }
    try {
      if (pathname === '/api/chat'  && req.method === 'POST') return await handleChat(req, res);
      if (pathname === '/api/photo' && req.method === 'POST') return await handlePhoto(req, res);
      return sendJson(res, 404, { error: 'not found' });
    } catch (e) {
      console.error('API error:', e);
      return sendJson(res, 500, { error: String(e.message || e) });
    }
  }

  // ── 静的ファイル ──
  let p = pathname; if (p === '/') p = '/index.html';
  const f = path.join(root, p);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(port, () => console.log('serving on', port, GEMINI_API_KEY ? '(API key loaded)' : '(NO API key — set gemini.key)'));
