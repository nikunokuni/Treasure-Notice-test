/* ═══════════════════════════════════════════════════════════
   たからさがし — onboard.view.js
   オンボーディング画面
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════
   3. オンボーディング
   ══════════════════════════════════ */

/** オンボーディング画面を返す */
function renderOnboard() {
  const s    = S.step;
  const u    = S.user;
  const dots = [0, 1, 2, 3].map(i =>
    `<div class="step-dot ${i < s ? 'done' : i === s ? 'active' : ''}"></div>`
  ).join('');

  return `
    <div class="onboard-wrap">
      <div class="onboard-hero">
        <span class="onboard-emoji">🔍</span>
        <div class="onboard-ttl">たから<em>さがし</em></div>
        <div class="onboard-sub">まいにちのふとした きづきが、<br>まなびのたからになる</div>
      </div>
      <div class="step-dots">${dots}</div>
      ${_renderOnboardStep(s, u)}
      <div class="onboard-actions">
        <button class="btn-primary" onclick="App.obNext()">
          ${s < 3 ? 'つぎへ ›' : 'はじめる 🔍'}
        </button>
        ${s > 0 ? `<button class="btn-secondary" onclick="App.obBack()">← もどる</button>` : ''}
      </div>
    </div>`;
}

/**
 * オンボーディングのステップごとのbody部分を返す（内部ヘルパー）
 * @param {number} s - ステップ番号
 * @param {Object} u - ユーザーオブジェクト
 */
function _renderOnboardStep(s, u) {
  if (s === 0) return `
    <div class="form-block">
      <div class="form-label">お子さんの <em>よびかた</em></div>
      <input class="form-input" id="ob-name" placeholder="れい：はるくん" value="${esc(u.name)}">
      <div class="form-error" id="ob-name-err">なまえをいれてください</div>
    </div>
    <div class="form-block">
      <div class="form-label"><em>ねんれい</em>をえらんでね</div>
      ${renderAgeIconRow(u.ageGroup, 'App.toggleObAge()', S.obAgeOpen)}
    </div>`;

  if (s === 1) return `
    <div class="form-block">
      <div class="form-label">すきなもの <em>（じゆうに）</em></div>
      <input class="form-input" id="ob-likes" placeholder="ポケモン・サッカー…" value="${esc(u.likes)}">
    </div>`;

  if (s === 2) return `
    <div class="form-block">
      <div class="form-label"><em>いっしょにするひと</em>のよびかた</div>
      <div class="parent-chips">${renderParentChips(u.parentName)}</div>
    </div>
    <p class="onboard-settings-note">⚙️ せってい からいつでも かえられます</p>`;

  // s === 3: カラー選択
  const colorChips = COLOR_THEMES.map(t => `
    <div class="color-theme-chip ${S.theme === t.id ? 'selected' : ''}"
         onclick="App.setTheme('${t.id}')"
         style="background:${t.amber}">
      <span class="color-theme-check">${S.theme === t.id ? '✓' : ''}</span>
      <span class="color-theme-name">${t.name}</span>
    </div>`).join('');
  return `
    <div class="form-block">
      <div class="form-label">🎨 すきな <em>いろ</em> をえらんでね</div>
      <div class="form-label form-label--sub">パパ・ママといっしょにえらぼう！</div>
      <div class="color-theme-grid">${colorChips}</div>
    </div>`;
}

/* ── 年齢 共通部品 ── */

/** 年齢アイコン行（選択UI）を返す */
function renderAgeIconRow(current, toggleFn, isOpen) {
  const icons = AGE_PROMPTS.map(a => `
    <div class="icon-sel-item ${current === a.id ? 'icon-sel-active' : ''}">
      <div class="icon-sel-badge ${current === a.id ? 'icon-sel-badge-on' : ''}">${a.icon}</div>
      ${current === a.id ? `<div class="icon-sel-current-lbl">${a.label}</div>` : ''}
    </div>`).join('');
  return `
    <div class="icon-row-select" onclick="${toggleFn}">
      ${icons}
      <span class="icon-row-chevron ${isOpen ? 'open' : ''}">▾</span>
    </div>
    ${isOpen ? `<div class="icon-row-detail">${renderAgeCards(current)}</div>` : ''}`;
}

/** 年齢カード一覧を返す */
function renderAgeCards(current) {
  return AGE_PROMPTS.map(a => `
    <div class="type-card ${current === a.id ? 'sel-age' : ''}" onclick="App.setAge('${a.id}')">
      <div class="type-badge type-badge-age">${a.icon}</div>
      <div class="type-info">
        <div class="type-name">${a.label}</div>
        <div class="type-desc">${a.desc}</div>
      </div>
    </div>`).join('');
}

/** 保護者よびかたチップ一覧を返す */
function renderParentChips(current) {
  return PARENT_OPTS.map(p => `
    <div class="parent-chip ${current === p ? 'sel' : ''}" onclick="App.setParent('${esc(p)}')">${esc(p)}</div>`
  ).join('');
}
