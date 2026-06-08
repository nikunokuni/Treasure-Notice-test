/* ═══════════════════════════════════════════════════════════
   たからさがし — settings.view.js
   せってい画面
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
  13. せってい
   ══════════════════════════════════ */

/** せってい画面を返す */
function renderSettings() {
  const tab = S.settingsTab || 'kid';
  return `
    <div class="content">
      <div class="settings-subtabs">
        <div class="settings-subtab ${tab === 'kid'   ? 'active' : ''}" onclick="App.switchSettingsTab('kid')">こどもよう</div>
        <div class="settings-subtab ${tab === 'adult' ? 'active' : ''}" onclick="App.switchSettingsTab('adult')">おとなよう</div>
      </div>
      ${tab === 'kid' ? _renderSettingsKid() : _renderSettingsAdult()}
    </div>`;
}

/** こどもよう設定を返す（内部ヘルパー） */
function _renderSettingsKid() {
  const u  = S.user;
  const fs = S.fontSize || 'medium';

  const colorChips = COLOR_THEMES.map(t => `
    <div class="color-theme-chip ${S.theme === t.id ? 'selected' : ''}"
         onclick="App.setTheme('${t.id}')"
         style="background:${t.amber}">
      <span class="color-theme-check">${S.theme === t.id ? '✓' : ''}</span>
      <span class="color-theme-name">${t.name}</span>
    </div>`).join('');

  const stickyBtns = STICKY_COLORS.map(c => `
    <button class="sticky-color-btn ${S.stickyColor === c.id ? 'selected' : ''}"
            onclick="App.setStickyColor('${c.id}', '${c.value}')"
            style="background:${c.value}">
      ${c.label}
    </button>`).join('');

  return `
    <div class="settings-section">
      <div class="settings-ttl">こどものじょうほう</div>
      <div class="settings-row-2col">
        <div class="settings-field settings-field-half">
          <div class="settings-field-label">よびかた</div>
          <input class="form-input" id="s-name" value="${esc(u.name)}" placeholder="ニックネーム">
          <div class="form-error" id="s-name-err">なまえをいれてください</div>
        </div>
        <div class="settings-field settings-field-half">
          <div class="settings-field-label">すきなもの</div>
          <input class="form-input" id="s-likes" value="${esc(u.likes)}" placeholder="ポケモン・サッカーなど">
        </div>
      </div>
      <div class="settings-field settings-row-icon">
        <div class="settings-field-label">ねんれい</div>
        ${renderAgeIconRow(u.ageGroup, 'App.toggleSettingsAge()', S.settingsAgeOpen)}
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">いっしょにするひと</div>
      <div class="settings-field">
        <div class="parent-chips">${renderParentChips(u.parentName)}</div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">🎨 アプリのいろ</div>
      <div class="color-theme-grid">${colorChips}</div>
    </div>

    <div class="settings-section">
      <div class="settings-ttl">📌 ふせんのいろ</div>
      <div class="sticky-color-grid">${stickyBtns}</div>
    </div>

    <div class="settings-section">
      <div class="settings-field">
        <div class="settings-field-label">もじサイズ</div>
        <div class="font-size-chips">
          <div class="font-size-chip ${fs === 'small'  ? 'sel' : ''}" onclick="App.setFontSize('small')">ちいさい</div>
          <div class="font-size-chip ${fs === 'medium' ? 'sel' : ''}" onclick="App.setFontSize('medium')">ふつう</div>
          <div class="font-size-chip ${fs === 'large'  ? 'sel' : ''}" onclick="App.setFontSize('large')">おおきい</div>
        </div>
      </div>
    </div>

    ${S.shownFirstSticker ? `
    <div class="settings-section">
      <button class="btn-primary sticker-place-btn" onclick="App.openStickerPlaceMode()">🎀 シールをはる</button>
    </div>` : ''}`;
}

/** おとなよう設定を返す（内部ヘルパー） */
function _renderSettingsAdult() {
  const u            = S.user;
  const adultLinks   = ADULT_LINKS.map(l => `
    <div class="adult-link-row" onclick="App.openExternalLink('${l.id}')">
      <span>${l.emoji}</span>
      <span>${l.label}</span>
      <span class="adult-link-arrow">›</span>
    </div>`).join('');

  const reportSection = S.weeklyReport ? `
    <div class="report-card">
      <div class="report-label">📊 ウィークリーレポート</div>
      <div class="report-body">${aiText(S.weeklyReport)}</div>
    </div>
    <button class="btn-secondary" onclick="App.generateReport()">
      ${S.reportLoading ? renderSpinner() : '🔄 もう一度生成'}
    </button>` : `
    <button class="btn-primary" onclick="App.generateReport()">
      ${S.reportLoading ? `${renderSpinner()} せいせいちゅう…` : '📊 レポートをつくる'}
    </button>`;

  return `
    <div class="settings-section-adult">
      <div class="settings-ttl-adult">ウィークリーレポート</div>
      <div class="settings-field-hint">今週の学びをAIがまとめるよ</div>
      ${reportSection}
    </div>

    <div class="settings-section-adult">
      <div class="settings-ttl-adult">データ管理</div>
      <div class="adult-link-row" onclick="App.exportCSV()">
        <span>📤</span><span>データをエクスポート</span>
        <span class="adult-link-arrow">›</span>
      </div>
      <div class="adult-link-row" onclick="App.triggerImport()">
        <span>📥</span><span>データをインポート</span>
        <span class="adult-link-arrow">›</span>
      </div>
      <input type="file" id="csv-import-input" accept=".csv" style="display:none" onchange="App.importCSV(event)">
    </div>

    <div class="settings-section-adult">
      <div class="settings-ttl-adult">意見・要望</div>
      <div class="settings-field-hint">よりよいたからさがしのため、ぜひ皆様のご意見・ご要望をお聞かせください。</div>
      <button class="btn-primary settings-feedback-btn" onclick="App.sendFeedback()">📨 フォームをひらく</button>
    </div>

    <div class="settings-section-adult">
      <div class="settings-ttl-adult">その他</div>
      ${adultLinks}
    </div>`;
}
