/* ═══════════════════════════════════════════════════════════
   たからさがし — internals.js
   モジュール内ユーティリティ（外部非公開）
   ═══════════════════════════════════════════════════════════ */

/**
 * Blob を a タグ経由でダウンロードする共通処理。
 * exportCSV と saveSummaryImage で重複していた処理を統合。
 * @param {string}      data     - Blob に渡すコンテンツ（文字列 or DataURL）
 * @param {string|null} mimeType - MIME タイプ（DataURL の場合は null）
 * @param {string}      filename - ダウンロードファイル名
 * @param {boolean}     isDataUrl - true のとき data を href に直接使用
 */
function _downloadBlob(data, mimeType, filename, isDataUrl = false) {
  const a = document.createElement('a');
  if (isDataUrl) {
    a.href = data;
  } else {
    const blob = new Blob([data], { type: mimeType });
    a.href     = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  a.download = filename;
  a.click();
}

/** 手帳の配置待ちアイテムと一致するか判定（selectNotebookItem から使用） */
function _isPlacing(type, id) {
  return S.notebookPlacing?.type === type && S.notebookPlacing?.id === id;
}
