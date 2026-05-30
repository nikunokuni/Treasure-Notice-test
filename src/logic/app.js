/* ═══════════════════════════════
   たからさがし — app.js
   「ロジック・メソッド」(App オブジェクト, sendChat 等)
   ═══════════════════════════════ */

// ── テーマ適用 ──
function applyTheme() {
  const t    = COLOR_THEMES.find(c => c.id === S.theme) || COLOR_THEMES[0];
  const root = document.documentElement;
  root.style.setProperty('--amber',       t.amber);
  root.style.setProperty('--amber-light', t.amberLight);
  root.style.setProperty('--amber-pale',  t.amberPale);
  root.style.setProperty('--teal',        t.teal);
  root.style.setProperty('--teal-light',  t.tealLight);
  root.style.setProperty('--coral',       t.coral);
  root.style.setProperty('--coral-light', t.coralLight);
  root.style.setProperty('--mint',        t.mint);
  root.style.setProperty('--mint-light',  t.mintLight);
  root.style.setProperty('--deep',        t.deep);
  root.style.setProperty('--paper',       t.paper);
  root.style.setProperty('--paper2',      t.paper2);
  root.style.setProperty('--lavender',    t.lavender);
}

function applyFontSize() {
  document.body.classList.remove('fs-small', 'fs-medium', 'fs-large');
  document.body.classList.add('fs-' + (S.fontSize || 'medium'));
}

// ── 統計ヘルパー ──
function calcTotalDays() {
  const days = new Set(S.records.map(r => new Date(r.date).toDateString()));
  return days.size;
}

function getYesterdayRecord() {
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return S.records.slice().reverse().find(r => new Date(r.date).toDateString() === yesterday) || null;
}

function _refreshWeeklyTakara() {
  const now     = new Date();
  const day     = now.getDay();
  const monday  = new Date(now); monday.setDate(now.getDate() - ((day + 6) % 7)); monday.setHours(0,0,0,0);
  const lastMonday = new Date(monday); lastMonday.setDate(monday.getDate() - 7);
  const lastWeekRecs = S.records.filter(r => {
    const d = new Date(r.date);
    return d >= lastMonday && d < monday;
  });
  S.weeklyTakara = lastWeekRecs.length > 0
    ? lastWeekRecs[Math.floor(Math.random() * lastWeekRecs.length)]
    : null;
}

// ── UI エフェクト ──
function scrollChat() {
  setTimeout(() => {
    const el = $id('chat-area');
    if (el) el.scrollTop = el.scrollHeight;
  }, 80);
}

function triggerCalBurst() {
  const emojis = S.records.map(r => r.odai?.emoji).filter(Boolean);
  if (emojis.length === 0) return;
  const frame = document.getElementById('app') || document.body;
  const rect  = frame.getBoundingClientRect();
  const cx    = rect.left + rect.width  / 2;
  const cy    = rect.top  + rect.height / 2;
  document.querySelectorAll('.cal-burst-wrap').forEach(el => el.remove());
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
    el.style.cssText = `left:${cx}px;top:${cy}px;--tx:${tx}px;--ty:${ty}px;animation-delay:${i * 0.045}s;`;
    el.textContent   = emojis[i % emojis.length];
    layer.appendChild(el);
  }
  setTimeout(() => layer.remove(), 1800);
}

// ── メイン描画 ──
function render() {
  const root = $id('screen-root');
  const tw   = $id('tabs-wrap');

  if (!S.onboarded) {
    tw.style.display  = 'none';
    root.innerHTML    = renderOnboard();
    bindEvents();
    return;
  }

  // 手帳編集中は専用画面を表示
  if (S.notebookEditing) {
    tw.style.display = 'none';
    root.innerHTML   = renderNotebookEditor();
    bindEvents();
    return;
  }

  const inFlow = ['lens','chat','summary'].includes(S.flow);
  if (inFlow) {
    tw.style.display = 'none';
    let content = '';
    if (S.flow === 'lens')    content = renderLens();
    if (S.flow === 'chat')    content = renderChat();
    if (S.flow === 'summary') content = renderSummary();
    root.innerHTML = renderChatHeader() + content;
  } else {
    tw.style.display = 'block';
    tw.innerHTML     = renderTabs();
    const map = { home: renderHome, cal: renderCal, box: renderBox, fav: renderFav, set: renderSettings };
    root.innerHTML   = (map[S.tab] || renderHome)();
  }
  bindEvents();
}

// ── イベントバインド ──
function bindEvents() {
  const root = $id('screen-root');

  const ci = $id('chat-in');
  if (ci) ci.addEventListener('keydown', e => { if (e.key === 'Enter') App.sendChat(); });

  const fi = $id('free-in');
  if (fi) fi.addEventListener('keydown', e => { if (e.key === 'Enter') App.submitFree(); });

  const fg = $id('free-go-btn');
  if (fg) fg.addEventListener('click', () => App.submitFree());

  const rr = $id('reroll-btn');
  if (rr) rr.addEventListener('click', e => {
    e.stopPropagation();
    S.odaiGenerating = true;
    render();
    App._generateAiOdai();
  });

  const rc = $id('rand-card');
  if (rc) rc.addEventListener('click', () => App.goToLens(S.randOdai));

  const pi = $id('photo-input');
  if (pi) {
    pi.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async ev => {
        const b64      = ev.target.result.split(',')[1];
        const safeType = /^image\/(jpeg|png|gif|webp)$/.test(file.type) ? file.type : 'image/jpeg';

        // ローディングUI
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:32px';
        const img = document.createElement('img');
        img.src = `data:${safeType};base64,${b64}`;
        img.style.cssText = 'width:100%;max-height:200px;object-fit:cover;border-radius:16px';
        const sp = document.createElement('div'); sp.className = 'spinner';
        const tx = document.createElement('div');
        tx.style.cssText = 'font-size:13px;color:rgba(45,27,0,0.5)';
        tx.textContent   = 'しゃしんをよんでいるよ…';
        loadingDiv.append(img, sp, tx);
        root.innerHTML = '';
        root.appendChild(loadingDiv);

        try {
          const result = await analyzePhoto(b64, file.type);
          App.goToLens(result);
        } catch(err) {
          console.error('photo error:', err);
          root.innerHTML = `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:32px;text-align:center">
              <div style="font-size:36px">📷</div>
              <div style="font-size:13px;color:rgba(45,27,0,0.5)">よみとりにしっぱいしたよ<br>もう一どためしてみてね</div>
              <button class="btn-secondary" onclick="App.closeChatFlow()" style="width:auto;padding:8px 20px">もどる</button>
            </div>`;
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

// ── App ──
const App = {

  switchTab(tab) {
    const prev = S.tab;
    S.tab  = tab;
    S.flow = 'home';
    // おきにいりタブ開時：新規バッヂがあれば表示
    if (tab === 'fav' && S.newBadges.length > 0) {
      S.shownBadgeModal = S.newBadges[0];
      S.newBadges       = S.newBadges.slice(1);
    }
    render();
    if (tab === 'cal' && prev !== 'cal') setTimeout(triggerCalBurst, 100);
  },

  closeChatFlow() { S.flow = 'home'; S.tab = 'home'; render(); },

  // ── オンボーディング ──
  obNext() {
    if (S.step === 0) {
      const name = $id('ob-name')?.value?.trim();
      if (!name) {
        $id('ob-name-err')?.classList.add('show');
        $id('ob-name')?.classList.add('error');
        return;
      }
      S.user.name = name;
    } else if (S.step === 2) {
      S.user.likes = $id('ob-likes')?.value?.trim() || '';
    } else if (S.step === 4) {
      // カラー選択完了
      S.onboarded = true; S.tab = 'home'; S.flow = 'home';
      applyTheme();
      persistSave(); render(); return;
    }
    S.step++;
    render();
  },
  obBack() { if (S.step > 0) { S.step--; render(); } },
  setType(t) { S.user.type = t; render(); },
  setAge(a)  { S.user.ageGroup = a; persistSave(); render(); },
  setParent(p) { S.user.parentName = p; render(); },
  setTheme(id) { S.theme = id; S.changedColor = true; applyTheme(); persistSave(); render(); },
  setStickyColor(id, value) { S.stickyColor = id; document.documentElement.style.setProperty('--sticky-main-bg', value); persistSave(); render(); },
  toggleObColor() { S.obColorOpen = !S.obColorOpen; render(); },

  // ── AI お題生成 ──
  async _generateAiOdai() {
    try {
      const res = await callAI(
        [{ role:'user', content:'日本の子ども（3〜9歳）が日常生活で目にしそうな具体的なものを1つ提案してください。JSONのみ: {"name":"ひらがな短い単語","emoji":"絵文字1つ","label":"カテゴリ"}' }],
        'JSONのみ返してください（Markdownなし）。具体的な身近なものを。'
      );
      S.randOdai = JSON.parse(res.replace(/```json|```/g, '').trim());
    } catch {
      S.randOdai = pickRand();
    }
    S.odaiGenerating = false;
    render();
  },

  goToLens(o) {
    S.odai             = o;
    S.lens             = S.lastLens || null;
    S.flow             = 'lens';
    S._savedThisSession = false;
    render();
  },
  replayOdai(o) { App.goToLens(o); },

  async submitFree() {
    const txt = $id('free-in')?.value?.trim();
    if (!txt) return;
    try {
      const res = await callAI(
        [{ role:'user', content:`子どもが「${txt}」と言いました。JSONのみ: {"name":"ひらがな短い単語","emoji":"絵文字","label":"カテゴリ"}` }],
        'JSONのみ返してください（Markdownなし）。'
      );
      App.goToLens(JSON.parse(res.replace(/```json|```/g, '').trim()));
    } catch {
      App.goToLens({ emoji:'✨', name: txt.slice(0, 10), label:'きになること' });
    }
  },

  selectLens(id) {
    if (S.prevRecord) return;
    S.lens = S.lens === id ? null : id;
    render();
  },

  // ── チャット開始 ──
  async startChat() {
    if (!S.lens) return;
    S.messages   = [];
    S.flow       = 'chat';
    S.isLoading  = true;
    S.lastError  = false;
    S.chatPhase  = 1;
    S.lastLens   = S.lens;
    persistSave();
    render();

    const hour      = new Date().getHours();
    const timeOfDay = hour < 11 ? 'あさ' : hour < 17 ? 'ひるま' : 'よる';
    const startMsg  = `${timeOfDay}です。フェーズ1から始めてください。最初の問いかけを1つだけ。`;

    try {
      const text = await callAI([{ role:'user', content: startMsg }], chatSystem());
      S.messages.push({ role:'ai', text });
      S.chatPhase = 1;
    } catch(err) {
      console.error('chat start error:', err);
      S.messages.push({ role:'ai', text:`${S.odai?.name}、どこでみつけたの？🔍` });
    }
    S.isLoading = false;
    render();
    scrollChat();
  },

  setSpeaker(sp) { S.speaker = sp; render(); },

  // ── メッセージ送信 ──
  async sendChat() {
    const inp = $id('chat-in');
    const txt = inp?.value?.trim();
    if (!txt || S.isLoading) return;

    const sentAs = S.speaker;
    S.messages.push({ role: sentAs, text: txt });
    S.speaker   = 'child';
    S.isLoading = true;
    S.lastError = false;
    if (inp) inp.value = '';
    render();
    scrollChat();

    const payload      = App._buildApiMsgs();
    S.lastSendPayload  = payload;
    const userMsgCount = S.messages.filter(m => m.role !== 'ai').length;

    try {
      const text = await callAI(payload, chatSystem());
      S.messages.push({ role:'ai', text });
      S.lastError = false;

      // フェーズ進行：AIの返答＋会話数から判定
      const detected = detectPhaseFromAI(text, userMsgCount);
      if (detected && detected > S.chatPhase) {
        S.chatPhase = detected;
      } else if (!detected) {
        if (userMsgCount >= 1 && S.chatPhase < 2) S.chatPhase = 2;
        if (userMsgCount >= 3 && S.chatPhase < 3) S.chatPhase = 3;
      }
    } catch(err) {
      console.error('chat error:', err);
      S.lastError = true;
    }
    S.isLoading = false;
    render();
    scrollChat();
  },

  async retryLastSend() {
    if (!S.lastSendPayload || S.isLoading) return;
    S.isLoading = true; S.lastError = false;
    render(); scrollChat();
    try {
      const text = await callAI(S.lastSendPayload, chatSystem());
      S.messages.push({ role:'ai', text });
      S.lastError = false;
    } catch {
      S.lastError = true;
    }
    S.isLoading = false;
    render();
    scrollChat();
  },

  _buildApiMsgs() {
    const apiMsgs = [];
    for (const m of S.messages) {
      if (m.role === 'ai') {
        apiMsgs.push({ role:'assistant', content: m.text });
      } else {
        const label = m.role === 'child' ? S.user.name || 'こども' : S.user.parentName;
        apiMsgs.push({ role:'user', content:`[${label}] ${m.text}` });
      }
    }
    if (apiMsgs[0]?.role === 'assistant') {
      apiMsgs.unshift({ role:'user', content:'はじめてください' });
    }
    return apiMsgs;
  },

  // ── サマリー生成 ──
  async goSummary() {
    S.flow           = 'summary';
    S.summaryItems   = [];
    S.summaryOpinion = '';
    S.opinionOpen    = false;
    S.bookmarked     = false;
    S.currentNote    = '';
    S.tomorrowHint   = '';        // ← 追加：リセット
    render();

    try {
      const res  = await callAI([{ role:'user', content:'まとめてください。' }], summarySystem());
      const data = JSON.parse(res.replace(/```json|```/g, '').trim());
      S.summaryItems   = data.findings || [];
      S.summaryOpinion = data.opinion  || '';
    } catch(err) {
      console.error('summary error:', err);
      S.summaryItems   = ['いっぱいかんがえた！'];
      S.summaryOpinion = 'ふたりとも、すごいはっけんだったね！';
    }

    App._saveRecord();
    persistSave();
    render();
    setTimeout(triggerFindingAnim, 50);

    // ── 「あしたやってみよう！」を非同期で生成（描画をブロックしない）──
    App._generateTomorrowHint();
  },

  // ── 「あしたやってみよう！」生成（1文・キャッシュあり） ──
  async _generateTomorrowHint() {
    if (S.tomorrowHint) return;   // すでに生成済みなら何もしない
    try {
      const odaiName  = S.odai?.name  || '';
      const lensName  = S.lens        || '';
      const findingsTxt = (S.summaryItems || []).join('、');
      const prompt = `子ども向けアプリで、お題「${odaiName}」をレンズ「${lensName}」で探索し、「${findingsTxt}」を発見しました。明日の日常で意識できることを、子ども（3〜9歳）向けに1文でやさしく提案してください。JSONのみ: {"hint":"ひらがな・ことばあそびで1文"}`;
      const res = await callAI(
        [{ role:'user', content: prompt }],
        'JSONのみ返してください（Markdownなし）。子どもが実践できる具体的な行動を1文で。'
      );
      const data = JSON.parse(res.replace(/```json|```/g, '').trim());
      S.tomorrowHint = data.hint || '';
    } catch(err) {
      console.error('tomorrowHint error:', err);
      S.tomorrowHint = 'あしたも、まわりのものをじっくりみてみよう！';
    }
    render();
  },

  saveNote() {
    const txt  = $id('note-input')?.value?.trim() || '';
    S.currentNote = txt;
    const last = S.records[S.records.length - 1];
    if (last) last.note = txt;
    persistSave();
    const btn = document.querySelector('.note-save-btn');
    if (btn) { btn.textContent = '✓ ほぞんしたよ！'; setTimeout(() => { btn.textContent = '💾 ほぞんする'; }, 1500); }
  },

  _saveRecord() {
    if (S._savedThisSession) return;
    S._savedThisSession = true;

    // 保存前のバッヂ状態を記録
    const prevEarned = new Set(BADGES.filter(b => b.check(S)).map(b => b.id));
    const entry = {
      odai:       { ...S.odai },
      lens:       S.lens,
      date:       new Date().toISOString(),
      findings:   [...S.summaryItems],
      bookmarked: false,
      note:       '',
      status:     'closed',
      hadParent:  S.messages.some(m => m.role === 'parent'),
    };
    S.records.push(entry);

    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (S._lastPlayDate !== today) {
      S.streak        = S._lastPlayDate === yesterday ? S.streak + 1 : 1;
      S._lastPlayDate = today;
    }

    // 新規取得バッヂを検出
    BADGES.forEach(b => {
      if (!prevEarned.has(b.id) && b.check(S)) {
        S.newBadges.push(b.id);
      }
    });
  },

  doAgain() {
    S.lens              = null;
    S.flow              = 'lens';
    S._savedThisSession = false;
    S.prevRecord        = null;
    render();
  },

  nextOdai() {
    S.flow       = 'home';
    S.tab        = 'home';
    S.randOdai   = null;
    S.prevRecord = null;
    render();
  },

  toggleBookmark() {
    S.bookmarked = !S.bookmarked;
    const last   = S.records[S.records.length - 1];
    if (last) last.bookmarked = S.bookmarked;
    persistSave();
    render();
    setTimeout(triggerFindingAnim, 50);
  },
   
  toggleRecordFav(idx) {
    if (S.records[idx]) {
      S.records[idx].bookmarked = !S.records[idx].bookmarked;
      persistSave();
      const btn = document.querySelector(`.takara-fav-btn[data-idx="${idx}"]`);
      if (btn) {
        btn.classList.toggle('active', S.records[idx].bookmarked);
      } else {
        render();
      }
    }
  },
   deleteRecord(idx) {
    if (!S.records[idx]) return;
    const name = S.records[idx].odai?.name || 'このたから';
    if (!confirm(`「${name}」をさくじょしますか？`)) return;
    S.records.splice(idx, 1);
    persistSave();
    render();
  },

  setRecordStatusByIdx(idx, status) {
    if (S.records[idx]) { S.records[idx].status = status; persistSave(); render(); }
  },

  toggleOpinion() {
    S.opinionOpen = !S.opinionOpen;
    // innerHTML 再描画を避け DOM を直接操作
    const body    = document.querySelector('.ai-opinion-body');
    const chevron = document.querySelector('.ai-opinion-chevron');
    if (body)    body.style.display = S.opinionOpen ? 'block' : 'none';
    if (chevron) chevron.classList.toggle('open', S.opinionOpen);
  },

  showDayTakara(year, month, day) { S.dayModal = { year, month, day }; render(); },
  closeDayModal() { S.dayModal = null; render(); },

  calPrev() {
    const now = new Date();
    let y = S.calYear ?? now.getFullYear(), m = S.calMonth ?? now.getMonth();
    if (--m < 0) { m = 11; y--; }
    S.calYear = y; S.calMonth = m; render();
  },
  calNext() {
    const now = new Date();
    let y = S.calYear ?? now.getFullYear(), m = S.calMonth ?? now.getMonth();
    if (++m > 11) { m = 0; y++; }
    S.calYear = y; S.calMonth = m; render();
  },

  setFontSize(size) {
    S.fontSize = size;
    applyFontSize();
    persistSave();
    render();
  },

  async generateReport() {
    const sys = weeklyReportSystem();
    if (!sys) {
      alert('こんしゅうのきろくがまだないよ！たからさがしをしてからためしてね🔍');
      return;
    }
    S.reportLoading = true; render();
    try {
      const res  = await callAI([{ role:'user', content:'レポートをつくってください。' }], sys);
      const data = JSON.parse(res.replace(/```json|```/g, '').trim());
      S.weeklyReport = `✨ ハイライト\n${data.highlight}\n\n📈 のびている力\n${data.growth}\n\n💡 来週のヒント\n${data.next}`;
    } catch(err) {
      console.error('report error:', err);
      S.weeklyReport = 'せいせいにしっぱいしました。もう一どためしてみてください。';
    }
    S.reportLoading = false;
    persistSave();
    render();
  },

  saveSettings() {
    const name = $id('s-name')?.value?.trim();
    if (!name) {
      $id('s-name-err')?.classList.add('show');
      $id('s-name')?.classList.add('error');
      return;
    }
    S.user.name  = name;
    S.user.likes = $id('s-likes')?.value?.trim() || '';
    persistSave();
    App.switchTab('home');
  },

  exportCSV() {
    if (S.records.length === 0) {
      alert('まだきろくがないよ！たからさがしをしてからためしてね🔍');
      return;
    }
    const header = ['日付','お題','絵文字','カテゴリ','レンズ','発見1','発見2','発見3','ノート','お気に入り','ステータス'];
    const rows   = S.records.map(r => [
      r.date ? new Date(r.date).toLocaleDateString('ja-JP') : '',
      r.odai?.name || '', r.odai?.emoji || '', r.odai?.label || '',
      r.lens || '',
      r.findings?.[0] || '', r.findings?.[1] || '', r.findings?.[2] || '',
      r.note || '',
      r.bookmarked ? '★' : '',
      r.status || '',
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type:'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `takarasagashi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  triggerImport() { $id('csv-import-input')?.click(); },

  importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text  = e.target.result.replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) throw new Error('データがないよ');
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i]
            .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
            .map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
          if (cols.length < 5) continue;
          const [dateStr, name, emoji, label, lens, f1, f2, f3, note, fav, status] = cols;
          const findings = [f1, f2, f3].filter(Boolean);
          const alreadyExists = S.records.some(r =>
            r.odai?.name === name && r.date && new Date(r.date).toLocaleDateString('ja-JP') === dateStr
          );
          if (!alreadyExists) {
            S.records.push({
              odai: { name, emoji, label },
              lens: lens || '',
              date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
              findings, note: note || '', bookmarked: fav === '★', status: status || null,
            });
            imported++;
          }
        }
        persistSave();
        alert(`${imported}けんのきろくをインポートしたよ！`);
        render();
      } catch(err) {
        console.error('import error:', err);
        alert('インポートにしっぱいしたよ。CSVファイルをたしかめてね。');
      }
      event.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  },
  openExternalLink(id) {
    const link = ADULT_LINKS.find(l => l.id === id);
    if (!link || !link.url) {
      alert('このページはまだじゅんびちゅうです');
      return;
    }
    window.open(link.url, '_blank', 'noopener,noreferrer');
  },
  sendFeedback() {
    const FORM_URL = 'https://x.gd/Jp9px';
     S.sentFeedback = true; persistSave();
    window.open(FORM_URL, '_blank', 'noopener,noreferrer');
  },

  async saveSummaryImage() {
    const el = document.getElementById('summary-capture-area');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { backgroundColor:'#fdf6e3', scale:2 });
      const a      = document.createElement('a');
      a.download   = 'たからもの_' + (S.odai?.name || 'きろく') + '.png';
      a.href       = canvas.toDataURL('image/png');
      a.click();
    } catch(err) { console.error('saveSummaryImage error:', err); }
  },

  shareToX() {
    const name     = S.odai?.name || '';
    const findings = (S.summaryItems || []).join('、');
    const text     = `「${name}」のたから：${findings} #たからさがし`;
    const url      = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    S.xPostCount = (S.xPostCount || 0) + 1; persistSave();
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  setBoxFilter(tag)  { S.boxFilterTag = S.boxFilterTag === tag ? null : tag; render(); },
  openBadge(id) {const found = BADGE_DEFS.find(d => d.id === id);
  S.badgeModal = found ? { id, def: found } : null;
  render();
},
  closeBadge()       { S.badgeModal = null; S.shownBadgeModal = null; render(); },
  dismissStreakPop() { S.streakBrokenPop = false; render(); },

  addCustomTag() {
    const inp = document.getElementById('custom-tag-input');
    const val = inp?.value?.trim();
    if (!val) return;
    if (!S.customTags.includes(val)) { S.customTags.push(val); persistSave(); }
    if (inp) inp.value = '';
    render();
  },
  switchSettingsTab(tab) { S.settingsTab = tab; render(); },
  toggleObAge()        { S.obAgeOpen        = !S.obAgeOpen;        render(); },
  toggleObType()       { S.obTypeOpen       = !S.obTypeOpen;       render(); },
  toggleSettingsAge()  { S.settingsAgeOpen  = !S.settingsAgeOpen;  render(); },
  toggleSettingsType() { S.settingsTypeOpen = !S.settingsTypeOpen; render(); },

  loadMoreFav()  { S.favPage  = (S.favPage  || 0) + 1; render(); },
  loadMoreNote() { S.notePage = (S.notePage || 0) + 1; render(); },

  applyUpdate() {
    if (App._waitingSW) { App._waitingSW.postMessage('skipWaiting'); }
    else { window.location.reload(); }
  },
   // ══════════════════════
  // 手帳ゲーム
  // ══════════════════════

  /** 新しい手帳の作成を開始（テーマ選択 → 編集画面へ） */
  startNewNotebook() {
    const owned = S.ownedPageThemes || ['plain'];
    if (owned.length === 0) return;

    // 所持テーマが1つならそのまま、複数なら先頭を選択（将来的に選択UIに拡張可能）
    const themeId = owned[0];
    S.notebookEditing = {
      id:        'nb_' + Date.now(),
      themeId:   themeId,
      createdAt: new Date().toISOString(),
      items:     [],
    };
    S.notebookTray    = 'badge';
    S.notebookPlacing = null;
    render();
  },

  /** 既存手帳を開いて編集 */
  openNotebook(idx) {
    const nb = (S.notebooks || [])[idx];
    if (!nb) return;
    // ディープコピーして編集（キャンセル時に元に戻せるよう）
    S.notebookEditing = JSON.parse(JSON.stringify(nb));
    S.notebookEditing._originalIdx = idx;
    S.notebookTray    = 'badge';
    S.notebookPlacing = null;
    render();
  },

  /** トレイのタブ切替 */
  switchNotebookTray(tray) {
    S.notebookTray    = tray;
    S.notebookPlacing = null;
    render();
  },

  /** アイテム選択 → 配置待ち状態にする */
  selectNotebookItem(type, id, emoji, label) {
    // 同じアイテムをもう一度タップしたらキャンセル
    if (_isPlacing(type, id)) {
      S.notebookPlacing = null;
    } else {
      S.notebookPlacing = { type, id, emoji, label };
    }
    render();
  },

  /** キャンバスをタップ → 配置実行 */
  placeItem(event) {
    if (!S.notebookPlacing || !S.notebookEditing) return;

    const canvas = document.getElementById('nb-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x    = Math.round(event.clientX - rect.left - 20);  // 中心補正
    const y    = Math.round(event.clientY - rect.top  - 20);

    S.notebookEditing.items.push({
      type:  S.notebookPlacing.type,
      id:    S.notebookPlacing.id,
      emoji: S.notebookPlacing.emoji,
      label: S.notebookPlacing.label,
      x:     Math.max(0, x),
      y:     Math.max(0, y),
    });
    S.notebookPlacing = null;
    render();
  },

  /** 配置済みアイテムを削除 */
  removePlacedItem(idx) {
    if (!S.notebookEditing) return;
    S.notebookEditing.items.splice(idx, 1);
    render();
  },

  /** 配置キャンセル */
  cancelPlacing() {
    S.notebookPlacing = null;
    render();
  },

  /** 手帳を保存して一覧に戻る */
  saveNotebook() {
    if (!S.notebookEditing) return;
    const nb = S.notebookEditing;

    if (!S.notebooks) S.notebooks = [];

    const origIdx = nb._originalIdx;
    delete nb._originalIdx;  // 保存前に内部プロパティを除去

    if (origIdx !== undefined) {
      // 既存手帳を上書き
      S.notebooks[origIdx] = nb;
    } else {
      // 新規追加
      S.notebooks.push(nb);
    }

    S.notebookEditing = null;
    S.notebookPlacing = null;
    persistSave();
    S.tab = 'fav';
    render();
  },
   deleteNotebook() {
  const ok = confirm('このてちょうをさくじょしますか？\nさくじょすると、もとにもどせません。');
  if (!ok) return;
  try {
    const nb = S.notebookEditing;
    if (!nb) return;
    if (!S.notebooks) S.notebooks = [];
    const origIdx = nb._originalIdx;
    if (origIdx !== undefined) {
      S.notebooks.splice(origIdx, 1);  // 既存手帳を配列から削除
    }
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

  /** 手帳編集をキャンセルして一覧に戻る */
  cancelNotebook() {
    S.notebookEditing = null;
    S.notebookPlacing = null;
    S.tab = 'fav';
    render();
  },
  _waitingSW: null,
};
// ===== てちょう ページ上限 =====

/** 獲得済みバッヂのレベル合計を返す */
function calcBadgePoints() {
  return BADGES.filter(b => b.check(S)).reduce((sum, b) => sum + (b.level ?? 1), 0);
}

/** てちょうの最大ページ数を返す */
function calcNotebookLimit() {
  const base        = 1;
  const fromBadge   = Math.floor(calcBadgePoints() / 15);
  const fromPurchase = S.extraNotebookPages ?? 0;
  return base + fromBadge + fromPurchase;
}

/** てちょうに空きがあるか */
function hasNotebookSlot() {
  const used = (S.notebooks || []).length;
  return used < calcNotebookLimit();
}
