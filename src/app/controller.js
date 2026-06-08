/* ═══════════════════════════════════════════════════════════
   たからさがし — controller.js
   App コントローラ — 公開メソッド（ナビ/チャット/サマリー/設定 ほか）
   ═══════════════════════════════════════════════════════════ */

const App = {};

Object.assign(App, {
  // ── ナビゲーション ─────────────────────────

  switchTab(tab) {
    const prev = S.tab;
    S.tab  = tab;
    S.flow = 'home';
    // お気に入りタブを開いたとき、未表示バッヂがあれば順番に表示
    if (tab === 'fav' && S.newBadges.length > 0) {
      S.shownBadgeModal = S.newBadges.shift();
    }
    render();
    if (tab === 'cal' && prev !== 'cal') setTimeout(triggerCalBurst, 100);
  },

  closeChatFlow() {
    S.flow = 'home';
    S.tab  = 'home';
    render();
  },


  // ── オンボーディング ───────────────────────

  obNext() {
    if (S.step === 0) {
      const name = $id('ob-name')?.value?.trim();
      if (!name) {
        $id('ob-name-err')?.classList.add('show');
        $id('ob-name')?.classList.add('error');
        return;
      }
      S.user.name = name;
    } else if (S.step === 1) {
      S.user.likes = $id('ob-likes')?.value?.trim() || '';
    } else if (S.step === 3) {
      S.onboarded = true;
      S.tab  = 'home';
      S.flow = 'home';
      applyTheme();
      persistSave();
      render();
      return;
    }
    S.step++;
    render();
  },

  obBack() {
    if (S.step > 0) { S.step--; render(); }
  },

  // ── ユーザー設定セッター ───────────────────
  // 1メソッド1プロパティ変更 → render() のシンプルな繰り返しを許容
  setAge(a)        { S.user.ageGroup   = a; persistSave(); render(); },
  setParent(p)     { S.user.parentName = p;     render(); },
  setTheme(id)     { S.theme = id; S.changedColor = true; applyTheme(); persistSave(); render(); },
  setStickyColor(id, value) {
    S.stickyColor = id;
    document.documentElement.style.setProperty('--sticky-main-bg', value);
    persistSave();
    render();
  },
  toggleObColor()      { S.obColorOpen      = !S.obColorOpen;      render(); },
  toggleObAge()        { S.obAgeOpen        = !S.obAgeOpen;        render(); },
  toggleSettingsAge()  { S.settingsAgeOpen  = !S.settingsAgeOpen;  render(); },


  // ── AI お題生成 ────────────────────────────

  /** ホーム画面のランダムお題をAIで生成する */
  async _generateAiOdai() {
    try {
      const res = await callAI(
        [{ role: 'user', content: '日本の子ども（3〜9歳）が日常生活で目にしそうな具体的なものを1つ提案してください。JSONのみ: {"name":"ひらがな短い単語","emoji":"絵文字1つ","label":"カテゴリ"}' }],
        'JSONのみ返してください（Markdownなし）。具体的な身近なものを。'
      );
      S.randOdai = JSON.parse(res.replace(/```json|```/g, '').trim());
    } catch {
      S.randOdai = pickRand();
    }
    S.odaiGenerating = false;
    render();
  },

  goToLens(odai) {
    S.odai              = odai;
    S.lens              = S.lastLens || null;
    S.flow              = 'lens';
    S._savedThisSession = false;
    render();
  },

  replayOdai(odai) { App.goToLens(odai); },

  /** フリーテキスト入力をお題に変換してレンズ画面へ */
  async submitFree() {
    const txt = $id('free-in')?.value?.trim();
    if (!txt) return;
    try {
      const res = await callAI(
        [{ role: 'user', content: `子どもが「${txt}」と言いました。JSONのみ: {"name":"ひらがな短い単語","emoji":"絵文字","label":"カテゴリ"}` }],
        'JSONのみ返してください（Markdownなし）。'
      );
      App.goToLens(JSON.parse(res.replace(/```json|```/g, '').trim()));
    } catch {
      App.goToLens({ emoji: '✨', name: txt.slice(0, 10), label: 'きになること' });
    }
  },

  selectLens(id) {
    if (S.prevRecord) return;
    S.lens = S.lens === id ? null : id;
    render();
  },


  // ── チャット ───────────────────────────────

  /** チャットを開始し、AIから最初の問いかけを取得 */
  async startChat() {
    if (!S.lens) return;
    S.messages  = [];
    S.flow      = 'chat';
    S.isLoading = true;
    S.lastError = false;
    S.chatPhase = 1;
    S.lastLens  = S.lens;
    persistSave();
    render();

    const hour      = new Date().getHours();
    const timeOfDay = hour < 11 ? 'あさ' : hour < 17 ? 'ひるま' : 'よる';

    try {
      const text = await callAI(
        [{ role: 'user', content: `${timeOfDay}です。フェーズ1から始めてください。最初の問いかけを1つだけ。` }],
        chatSystem()
      );
      S.messages.push({ role: 'ai', text });
    } catch (err) {
      console.error('chat start error:', err);
      S.messages.push({ role: 'ai', text: `${S.odai?.name}、どこでみつけたの？🔍` });
    }

    S.isLoading = false;
    render();
    scrollChat();
  },

  setSpeaker(sp) { S.speaker = sp; render(); },

  /** チャット入力を送信してAI返答を取得 */
  async sendChat() {
    const inp = $id('chat-in');
    const txt = inp?.value?.trim();
    if (!txt || S.isLoading) return;

    S.messages.push({ role: S.speaker, text: txt });
    S.speaker   = 'child';
    S.isLoading = true;
    S.lastError = false;
    if (inp) inp.value = '';
    render();
    scrollChat();

    const payload = App._buildApiMsgs();
    S.lastSendPayload = payload;

    try {
      const text = await callAI(payload, chatSystem());
      S.messages.push({ role: 'ai', text });
      S.lastError = false;
      App._advanceChatPhase(text);
    } catch (err) {
      console.error('chat error:', err);
      S.lastError = true;
    }

    S.isLoading = false;
    render();
    scrollChat();
  },

  /** 直前の送信を再試行 */
  async retryLastSend() {
    if (!S.lastSendPayload || S.isLoading) return;
    S.isLoading = true;
    S.lastError = false;
    render();
    scrollChat();

    try {
      const text = await callAI(S.lastSendPayload, chatSystem());
      S.messages.push({ role: 'ai', text });
      S.lastError = false;
    } catch {
      S.lastError = true;
    }

    S.isLoading = false;
    render();
    scrollChat();
  },

  /**
   * AIの返答テキストと会話数からフェーズを進める。
   * sendChat の責務を分離するために切り出した内部メソッド。
   */
  _advanceChatPhase(aiText) {
    const userMsgCount = S.messages.filter(m => m.role !== 'ai').length;
    const detected     = detectPhaseFromAI(aiText, userMsgCount);
    if (detected && detected > S.chatPhase) {
      S.chatPhase = detected;
    } else if (!detected) {
      if (userMsgCount >= 1 && S.chatPhase < 2) S.chatPhase = 2;
      if (userMsgCount >= 3 && S.chatPhase < 3) S.chatPhase = 3;
    }
  },

  /** S.messages を API 送信用フォーマットに変換 */
  _buildApiMsgs() {
    const apiMsgs = [];
    for (const m of S.messages) {
      if (m.role === 'ai') {
        apiMsgs.push({ role: 'assistant', content: m.text });
      } else {
        const label = m.role === 'child'
          ? (S.user.name || 'こども')
          : S.user.parentName;
        apiMsgs.push({ role: 'user', content: `[${label}] ${m.text}` });
      }
    }
    // APIは assistant ロールで会話を始められないため先頭を補完
    if (apiMsgs[0]?.role === 'assistant') {
      apiMsgs.unshift({ role: 'user', content: 'はじめてください' });
    }
    return apiMsgs;
  },


  // ── サマリー ───────────────────────────────

  /** サマリー画面へ遷移し、AI まとめを生成して保存 */
  async goSummary() {
    Object.assign(S, {
      flow:          'summary',
      summaryItems:  [],
      summaryOpinion: '',
      opinionOpen:   false,
      bookmarked:    false,
      currentNote:   '',
      tomorrowHint:  '',
    });
    render();

    try {
      const res  = await callAI([{ role: 'user', content: 'まとめてください。' }], summarySystem());
      const data = JSON.parse(res.replace(/```json|```/g, '').trim());
      S.summaryItems   = data.findings || [];
      S.summaryOpinion = data.opinion  || '';
    } catch (err) {
      console.error('summary error:', err);
      S.summaryItems   = ['いっぱいかんがえた！'];
      S.summaryOpinion = 'ふたりとも、すごいはっけんだったね！';
    }

    App._saveRecord();
    persistSave();
    render();
    setTimeout(triggerFindingAnim, 50);

    // 「あしたやってみよう！」は描画をブロックしないよう非同期で生成
    App._generateTomorrowHint();
  },

  /** 「あしたやってみよう！」を1文生成してキャッシュ */
  async _generateTomorrowHint() {
    if (S.tomorrowHint) return;   // 生成済みならスキップ
    const odaiName    = S.odai?.name || '';
    const lensName    = S.lens       || '';
    const findingsTxt = (S.summaryItems || []).join('、');
    const prompt      = `子ども向けアプリで、お題「${odaiName}」をレンズ「${lensName}」で探索し、「${findingsTxt}」を発見しました。明日の日常で意識できることを、子ども（3〜9歳）向けに1文でやさしく提案してください。JSONのみ: {"hint":"ひらがな・ことばあそびで1文"}`;

    try {
      const res  = await callAI(
        [{ role: 'user', content: prompt }],
        'JSONのみ返してください（Markdownなし）。子どもが実践できる具体的な行動を1文で。'
      );
      const data = JSON.parse(res.replace(/```json|```/g, '').trim());
      S.tomorrowHint = data.hint || '';
    } catch (err) {
      console.error('tomorrowHint error:', err);
      S.tomorrowHint = 'あしたも、まわりのものをじっくりみてみよう！';
    }
    render();
  },

  saveNote() {
    const txt = $id('note-input')?.value?.trim() || '';
    S.currentNote = txt;
    const last = S.records[S.records.length - 1];
    if (last) last.note = txt;
    persistSave();

    const btn = document.querySelector('.note-save-btn');
    if (btn) {
      btn.textContent = '✓ ほぞんしたよ！';
      setTimeout(() => { btn.textContent = '💾 ほぞんする'; }, 1500);
    }
  },

  /** 現在のセッションを records に1度だけ追加し、バッヂを判定 */
  _saveRecord() {
    if (S._savedThisSession) return;
    S._savedThisSession = true;

    // 保存前のバッヂ状態をスナップショット
    const prevEarned = new Set(BADGES.filter(b => b.check(S)).map(b => b.id));

    const entry = {
      odai:      { ...S.odai },
      lens:      S.lens,
      date:      new Date().toISOString(),
      findings:  [...S.summaryItems],
      bookmarked: false,
      note:      '',
      status:    'closed',
      hadParent: S.messages.some(m => m.role === 'parent'),
    };
    S.records.push(entry);

    // ストリーク更新
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (S._lastPlayDate !== today) {
      S.streak        = S._lastPlayDate === yesterday ? S.streak + 1 : 1;
      S._lastPlayDate = today;
    }

    // 新規取得バッヂを検出して通知キューへ
    BADGES.forEach(b => {
      if (!prevEarned.has(b.id) && b.check(S)) S.newBadges.push(b.id);
    });
  },


  // ── サマリー後アクション ───────────────────

  doAgain() {
    S.lens              = null;
    S.flow              = 'lens';
    S._savedThisSession = false;
    S.prevRecord        = null;
    render();
  },

  nextOdai() {
    S.flow     = 'home';
    S.tab      = 'home';
    S.randOdai = null;
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

  toggleOpinion() {
    S.opinionOpen = !S.opinionOpen;
    // 全再描画を避けて DOM を直接操作（パフォーマンス配慮）
    document.querySelector('.ai-opinion-body')
      ?.style.setProperty('display', S.opinionOpen ? 'block' : 'none');
    document.querySelector('.ai-opinion-chevron')
      ?.classList.toggle('open', S.opinionOpen);
  },


  // ── きろく操作 ────────────────────────────

  toggleRecordFav(idx) {
    if (!S.records[idx]) return;
    S.records[idx].bookmarked = !S.records[idx].bookmarked;
    persistSave();
    // ボタンが DOM にあればクラス操作のみ、なければ全再描画
    const btn = document.querySelector(`.takara-fav-btn[data-idx="${idx}"]`);
    btn
      ? btn.classList.toggle('active', S.records[idx].bookmarked)
      : render();
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
    if (!S.records[idx]) return;
    S.records[idx].status = status;
    persistSave();
    render();
  },


  // ── カレンダー ─────────────────────────────

  showDayTakara(year, month, day) { S.dayModal = { year, month, day }; render(); },
  closeDayModal()                  { S.dayModal = null;                 render(); },

  calPrev() {
    const now = new Date();
    let y = S.calYear  ?? now.getFullYear();
    let m = S.calMonth ?? now.getMonth();
    if (--m < 0) { m = 11; y--; }
    S.calYear = y; S.calMonth = m;
    render();
  },

  calNext() {
    const now = new Date();
    let y = S.calYear  ?? now.getFullYear();
    let m = S.calMonth ?? now.getMonth();
    if (++m > 11) { m = 0; y++; }
    S.calYear = y; S.calMonth = m;
    render();
  },


  // ── 設定 ──────────────────────────────────

  setFontSize(size) {
    S.fontSize = size;
    applyFontSize();
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

  switchSettingsTab(tab) { S.settingsTab = tab; render(); },


  // ── 週次レポート ───────────────────────────

  async generateReport() {
    const sys = weeklyReportSystem();
    if (!sys) {
      alert('こんしゅうのきろくがまだないよ！たからさがしをしてからためしてね🔍');
      return;
    }
    S.reportLoading = true;
    render();

    try {
      const res  = await callAI([{ role: 'user', content: 'レポートをつくってください。' }], sys);
      const data = JSON.parse(res.replace(/```json|```/g, '').trim());
      S.weeklyReport = `✨ ハイライト\n${data.highlight}\n\n📈 のびている力\n${data.growth}\n\n💡 来週のヒント\n${data.next}`;
    } catch (err) {
      console.error('report error:', err);
      S.weeklyReport = 'せいせいにしっぱいしました。もう一どためしてみてください。';
    }

    S.reportLoading = false;
    persistSave();
    render();
  },


  // ── CSV エクスポート／インポート ──────────

  exportCSV() {
    if (S.records.length === 0) {
      alert('まだきろくがないよ！たからさがしをしてからためしてね🔍');
      return;
    }

    const header = ['日付','お題','絵文字','カテゴリ','レンズ','発見1','発見2','発見3','ノート','お気に入り','ステータス'];
    const rows   = S.records.map(r => [
      r.date ? new Date(r.date).toLocaleDateString('ja-JP') : '',
      r.odai?.name  || '', r.odai?.emoji || '', r.odai?.label || '',
      r.lens        || '',
      r.findings?.[0] || '', r.findings?.[1] || '', r.findings?.[2] || '',
      r.note        || '',
      r.bookmarked  ? '★' : '',
      r.status      || '',
    ]);

    const csvContent = [header, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    _downloadBlob('\uFEFF' + csvContent, 'text/csv;charset=utf-8;', `takarasagashi_${new Date().toISOString().slice(0, 10)}.csv`);
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
          const alreadyExists = S.records.some(r =>
            r.odai?.name === name &&
            r.date &&
            new Date(r.date).toLocaleDateString('ja-JP') === dateStr
          );
          if (!alreadyExists) {
            S.records.push({
              odai:      { name, emoji, label },
              lens:      lens || '',
              date:      dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
              findings:  [f1, f2, f3].filter(Boolean),
              note:      note || '',
              bookmarked: fav === '★',
              status:    status || null,
            });
            imported++;
          }
        }
        persistSave();
        alert(`${imported}けんのきろくをインポートしたよ！`);
        render();
      } catch (err) {
        console.error('import error:', err);
        alert('インポートにしっぱいしたよ。CSVファイルをたしかめてね。');
      }
      event.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  },


  // ── シェア・外部リンク ─────────────────────

  openExternalLink(id) {
    const link = ADULT_LINKS.find(l => l.id === id);
    if (!link?.url) { alert('このページはまだじゅんびちゅうです'); return; }
    window.open(link.url, '_blank', 'noopener,noreferrer');
  },

  sendFeedback() {
    S.sentFeedback = true;
    persistSave();
    window.open('https://x.gd/Jp9px', '_blank', 'noopener,noreferrer');
  },

  async saveSummaryImage() {
    const el = document.getElementById('summary-capture-area');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { backgroundColor: '#fdf6e3', scale: 2 });
      _downloadBlob(canvas.toDataURL('image/png'), null, `たからもの_${S.odai?.name || 'きろく'}.png`, true);
    } catch (err) {
      console.error('saveSummaryImage error:', err);
    }
  },

  shareToX() {
    const name     = S.odai?.name || '';
    const findings = (S.summaryItems || []).join('、');
    const text     = `「${name}」のたから：${findings} #たからさがし`;
    S.xPostCount   = (S.xPostCount || 0) + 1;
    persistSave();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  },


  // ── バッヂ・フィルター ─────────────────────

  setBoxFilter(tag)    { S.boxFilterTag = S.boxFilterTag === tag ? null : tag; render(); },
  openBadge(id) {
    const found = BADGE_DEFS.find(d => d.id === id);
    S.badgeModal = found ? { id, def: found } : null;
    render();
  },
  closeBadge()         { S.badgeModal = null; S.shownBadgeModal = null; render(); },
  dismissStreakPop()   { S.streakBrokenPop = false; render(); },

  addCustomTag() {
    const inp = document.getElementById('custom-tag-input');
    const val = inp?.value?.trim();
    if (!val) return;
    if (!S.customTags.includes(val)) { S.customTags.push(val); persistSave(); }
    if (inp) inp.value = '';
    render();
  },

  loadMoreFav()  { S.favPage  = (S.favPage  || 0) + 1; render(); },
  loadMoreNote() { S.notePage = (S.notePage || 0) + 1; render(); },


  // ── SW アップデート ────────────────────────

  applyUpdate() {
    App._waitingSW
      ? App._waitingSW.postMessage('skipWaiting')
      : window.location.reload();
  },

  _waitingSW: null,

});
