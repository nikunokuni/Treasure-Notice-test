/* ═══════════════════════════════════════════════════════════
   たからさがし — dom.js
   DOM 操作と描画パイプライン（render, bindEvents, スクロール等）
   ═══════════════════════════════════════════════════════════ */

function scrollChat() {
  const el = $id('chat-area');
  if (!el) return;
  el.scrollTop = el.scrollHeight;
  setTimeout(() => { el.scrollTop = el.scrollHeight; }, 80);
  // ソフトウェアキーボードの開閉アニメーション分を待って再スクロール
  setTimeout(() => { el.scrollTop = el.scrollHeight; }, 320);
}

/** カレンダー画面を開いたとき、記録絵文字を爆発させるアニメ */
function triggerCalBurst() {
  const emojis = S.records.map(r => r.odai?.emoji).filter(Boolean);
  if (emojis.length === 0) return;

  // 既存レイヤーを消去して再生成
  document.querySelectorAll('.cal-burst-wrap').forEach(el => el.remove());

  const frame = document.getElementById('app') || document.body;
  const rect  = frame.getBoundingClientRect();
  const cx    = rect.left + rect.width  / 2;
  const cy    = rect.top  + rect.height / 2;

  const layer = document.createElement('div');
  layer.className = 'cal-burst-wrap';
  document.body.appendChild(layer);

  const count = Math.min(emojis.length, 20);
  for (let i = 0; i < count; i++) {
    const el    = document.createElement('div');
    el.className = 'cal-burst-item';
    const angle = (i / count) * Math.PI * 2;
    const dist  = 90 + Math.random() * 120;
    const tx    = Math.round(Math.cos(angle) * dist);
    const ty    = Math.round(Math.sin(angle) * dist);
    el.style.cssText  = `left:${cx}px;top:${cy}px;--tx:${tx}px;--ty:${ty}px;animation-delay:${i * 0.045}s;`;
    el.textContent    = emojis[i % emojis.length];
    layer.appendChild(el);
  }
  setTimeout(() => layer.remove(), 1800);
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メイン描画
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * アプリ全体の描画エントリーポイント。
 * 状態（S）を参照してどの画面を表示するかを決定し、innerHTML にセットする。
 * ロジック計算は行わず「どの render 関数を呼ぶか」だけを担う。
 */
function render() {
  const root = $id('screen-root');
  const tabs = $id('tabs-wrap');

  // スクロール位置を保存
  const scrollEl = root.querySelector('.content');
  const savedScrollTop = scrollEl ? scrollEl.scrollTop : 0;

  // オンボーディング未完了
  if (!S.onboarded) {
    _setTabsVisible(tabs, false);
    root.innerHTML = renderOnboard();
    bindEvents();
    return;
  }

  // 手帳編集中
  if (S.notebookEditing) {
    _setTabsVisible(tabs, false);
    root.innerHTML = renderNotebookEditor();
    bindEvents();
    return;
  }

  // チャットフロー（lens / chat / summary）
  const FLOW_RENDERERS = { lens: renderLens, chat: renderChat, summary: renderSummary };
  if (FLOW_RENDERERS[S.flow]) {
    _setTabsVisible(tabs, false);
    root.innerHTML = renderChatHeader() + FLOW_RENDERERS[S.flow]();
    bindEvents();
    return;
  }

  // タブ画面
  const TAB_RENDERERS = { home: renderHome, cal: renderCal, box: renderBox, fav: renderFav, set: renderSettings };
  _setTabsVisible(tabs, true);
  tabs.innerHTML  = renderTabs();
  root.innerHTML  = wrapWithStickerLayer((TAB_RENDERERS[S.tab] || renderHome)());
  bindEvents();

  // スクロール位置を復元
  if (savedScrollTop > 0) {
    const newScrollEl = root.querySelector('.content');
    if (newScrollEl) newScrollEl.scrollTop = savedScrollTop;
  }
}

/** タブバーの表示・非表示を切り替える（render 内の共通処理） */
function _setTabsVisible(tabsEl, visible) {
  tabsEl.style.display = visible ? 'block' : 'none';
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// イベントバインド
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * render() 後に毎回呼ばれる。
 * DOM 要素の存在チェックをしてからリスナーを付けること（null 安全）。
 */
function bindEvents() {
  // チャット送信（Enter キー）
  const chatInput = $id('chat-in');
  if (chatInput) {
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') App.sendChat(); });
    // 入力欄フォーカス時（キーボード表示時）にチャット欄を最下部へスクロール
    chatInput.addEventListener('focus', () => scrollChat());
  }

  // フリー入力（Enter キー＋ボタン）
  const freeInput = $id('free-in');
  if (freeInput) freeInput.addEventListener('keydown', e => { if (e.key === 'Enter') App.submitFree(); });

  const freeBtn = $id('free-go-btn');
  if (freeBtn) freeBtn.addEventListener('click', () => App.submitFree());

  // ランダムお題カードタップ（AIでお題を生成してレンズ画面へ）
  const randCard = $id('rand-card');
  if (randCard) randCard.addEventListener('click', () => App.pickRandomOdai());

  // 写真アップロード
  const photoInput = $id('photo-input');
  if (photoInput) photoInput.addEventListener('change', _handlePhotoUpload);
}

/**
 * 写真アップロードの change イベントハンドラ。
 * bindEvents から切り出して見通しを良くした。
 */
async function _handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async ev => {
    const b64      = ev.target.result.split(',')[1];
    const safeType = /^image\/(jpeg|png|gif|webp)$/.test(file.type) ? file.type : 'image/jpeg';

    _showPhotoLoading(b64, safeType);

    try {
      const result = await analyzePhoto(b64, file.type);
      App.goToLens(result);
    } catch (err) {
      console.error('photo error:', err);
      _showPhotoError();
    }
  };
  reader.readAsDataURL(file);
}

/** 写真解析中のローディング UI を表示 */
function _showPhotoLoading(b64, safeType) {
  const root = $id('screen-root');
  root.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'photo-loading-wrap';

  const img = document.createElement('img');
  img.src = `data:${safeType};base64,${b64}`;
  img.className = 'photo-loading-img';

  const spinner = document.createElement('div');
  spinner.className = 'spinner';

  const text = document.createElement('div');
  text.className = 'photo-loading-text';
  text.textContent = 'しゃしんをよんでいるよ…';

  wrap.append(img, spinner, text);
  root.appendChild(wrap);
}

/** 写真解析エラー時の UI を表示 */
function _showPhotoError() {
  const root = $id('screen-root');
  root.innerHTML = `
    <div class="photo-error-wrap">
      <div class="photo-error-icon">📷</div>
      <div class="photo-error-text">よみとりにしっぱいしたよ<br>もう一どためしてみてね</div>
      <button class="btn-secondary photo-error-btn" onclick="App.closeChatFlow()">もどる</button>
    </div>`;
}
