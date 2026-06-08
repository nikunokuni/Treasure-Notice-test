/* ═══════════════════════════════════════════════════════════
   たからさがし — notebook.controller.js
   App コントローラ — てちょう（付箋・シール）操作
   ═══════════════════════════════════════════════════════════ */

Object.assign(App, {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 手帳ゲーム
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /** 新しい手帳を作成してエディタを開く */
  startNewNotebook() {
    const owned = S.ownedPageThemes || ['plain'];
    if (owned.length === 0) return;

    S.notebookEditing = {
      id:        'nb_' + Date.now(),
      themeId:   owned[0],
      createdAt: new Date().toISOString(),
      items:     [],
    };
    S.notebookTray    = 'badge';
    S.notebookPlacing = null;
    render();
  },

  /** 既存手帳をディープコピーしてエディタを開く */
  openNotebook(idx) {
    const nb = (S.notebooks || [])[idx];
    if (!nb) return;
    S.notebookEditing           = JSON.parse(JSON.stringify(nb));
    S.notebookEditing._originalIdx = idx;
    S.notebookTray              = 'badge';
    S.notebookPlacing           = null;
    render();
  },

  switchNotebookTray(tray) {
    S.notebookTray    = tray;
    S.notebookPlacing = null;
    render();
  },

  /** アイテムを選択 → 配置待ち状態にする（同じアイテムを再タップでキャンセル） */
  selectNotebookItem(type, id, emoji, label) {
    S.notebookPlacing = _isPlacing(type, id)
      ? null
      : { type, id, emoji, label };
    render();
  },

  /** キャンバスをタップしてアイテムを配置 */
  placeItem(event) {
    if (!S.notebookPlacing || !S.notebookEditing) return;

    const canvas = document.getElementById('nb-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const p    = S.notebookPlacing;

    S.notebookEditing.items.push({
      type:       p.type,
      id:         p.id,
      emoji:      p.emoji,
      label:      p.label,
      stickerSrc: p.stickerSrc || null,
      record:     p.record     || null,
      x:          Math.max(0, Math.round(event.clientX - rect.left - 20)),
      y:          Math.max(0, Math.round(event.clientY - rect.top  - 20)),
    });
    S.notebookPlacing = null;
    render();
  },

  removePlacedItem(idx) {
    if (!S.notebookEditing) return;
    S.notebookEditing.items.splice(idx, 1);
    render();
  },

  cancelPlacing() { S.notebookPlacing = null; render(); },

  /** 手帳を保存して fav タブへ戻る */
  saveNotebook() {
    if (!S.notebookEditing) return;
    const nb      = S.notebookEditing;
    const origIdx = nb._originalIdx;
    delete nb._originalIdx;

    if (!S.notebooks) S.notebooks = [];
    origIdx !== undefined
      ? (S.notebooks[origIdx] = nb)
      : S.notebooks.push(nb);

    S.notebookEditing = null;
    S.notebookPlacing = null;
    persistSave();
    S.tab = 'fav';
    render();
  },

  deleteNotebook() {
    if (!confirm('このてちょうをさくじょしますか？\nさくじょすると、もとにもどせません。')) return;
    try {
      const nb      = S.notebookEditing;
      if (!nb) return;
      const origIdx = nb._originalIdx;
      if (!S.notebooks) S.notebooks = [];
      if (origIdx !== undefined) S.notebooks.splice(origIdx, 1);
      S.notebookEditing = null;
      S.notebookPlacing = null;
      persistSave();
      S.tab = 'fav';
      render();
    } catch (e) {
      console.error('deleteNotebook失敗:', e);
      alert('さくじょに失敗しました。もう一度お試しください。');
    }
  },

  cancelNotebook() {
    S.notebookEditing = null;
    S.notebookPlacing = null;
    S.tab = 'fav';
    render();
  },

  /** ふせん画像を選択し、次のステップ（内容一覧）を表示 */
  pickSticker(stickerId, trayType) {
    S.notebookStickerSelected = stickerId;
    S.notebookStickerPick     = trayType;
    render();
  },

  /** お気に入り記録＋ふせんを選んで配置待ち状態へ */
  selectFavWithSticker(favIdx) {
    const sticker = NOTEBOOK_STICKERS.find(s => s.id === S.notebookStickerSelected);
    const record  = S.records.filter(r => r.bookmarked)[favIdx];
    if (!sticker || !record) return;

    S.notebookPlacing = {
      type:       'fav-sticker',
      id:         `fav_${favIdx}_${S.notebookStickerSelected}`,
      emoji:      record.odai.emoji,
      label:      record.odai.name,
      stickerSrc: sticker.src,
      record,
    };
    S.notebookStickerPick     = null;
    S.notebookStickerSelected = null;
    render();
  },

  /** ノート記録＋ふせんを選んで配置待ち状態へ */
  selectNoteWithSticker(noteIdx) {
    const sticker = NOTEBOOK_STICKERS.find(s => s.id === S.notebookStickerSelected);
    const record  = S.records.filter(r => r.note?.trim())[noteIdx];
    if (!sticker || !record) return;

    S.notebookPlacing = {
      type:       'note-sticker',
      id:         `note_${noteIdx}_${S.notebookStickerSelected}`,
      emoji:      record.odai.emoji,
      label:      record.odai.name,
      stickerSrc: sticker.src,
      record,
    };
    S.notebookStickerPick     = null;
    S.notebookStickerSelected = null;
    render();
  },
});
