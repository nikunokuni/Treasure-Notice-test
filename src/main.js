/* ═══════════════════════════════
   たからさがし — main.js
   「エントリーポイント」(起動、SW登録)
   ※ このファイルは必ず全ファイルの最後に読み込む
   ═══════════════════════════════ */

// ── Service Worker 登録 ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            App._waitingSW = newSW;
            const banner = document.getElementById('update-banner');
            if (banner) banner.style.display = 'flex';
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
    } catch(err) { console.warn('SW registration failed:', err); }
  });
}

// ── ストリーク途切れポップを5秒後に自動で閉じる ──
setTimeout(() => {
  if (S.streakBrokenPop) { S.streakBrokenPop = false; render(); }
}, 5000);

// ── ホーム画面に追加されたかを検知 ──
function _markAddedToHomeScreen() {
  if (S.addedToHomeScreen) return;
  S.addedToHomeScreen = true;
  persistSave();
  render();
}
window.addEventListener('appinstalled', _markAddedToHomeScreen);

// ── ショップ（iframe）からの購入完了通知を受け取る ──
window.addEventListener('message', (event) => {
  if (event.origin !== SHOP_ORIGIN) return;
  if (event.data?.type !== 'takara-purchase') return;
  App.handleShopPurchase(event.data);
});

// ── 起動シーケンス ──
persistLoad();
applyFontSize();
applyTheme();
if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
  _markAddedToHomeScreen();
}
render();
