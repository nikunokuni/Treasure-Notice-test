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
    // お気に入りタブを開いたとき、てちょう解放演出 → 未表示バッヂの順で表示
    if (tab === 'fav') {
      if (S.notebookUnlockPending) {
        S.notebookUnlockPending = false;
        S.notebookUnlocked      = true;
        S.shownNotebookUnlock   = true;
        persistSave();
      } else if (S.newBadges.length > 0) {
        S.shownBadgeModal = S.newBadges.shift();
      }
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
  setTheme(id)     { S.theme = id; S.changedColor = true; applyTheme(); persistSave(); const _y = document.querySelector('.content')?.scrollTop || 0; render(); requestAnimationFrame(() => { const _r = document.querySelector('.content'); if (_r) _r.scrollTop = _y; }); },
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

    App.loadTakaraMemory();

    Object.assign(S, {
      messages:             [],
      flow:                 'chat',
      isLoading:            true,
      lastError:            false,
      chatPhase:            1,
      lastLens:             S.lens,
      speaker:              'child',
      currentSummary:       '',
      situationContext:     '',
      observationContext:   '',
      parentBridgeDone:     false,
      phase3Turns:          0,
      phase3DecisionAsked:  false,
      phase3OpinionDone:    false,
      phase3CompareDone:    false,
      showDecisionButtons:  false,
    });
    persistSave();
    render();

    // ランダムな開始文を選ぶ
    const template = OPENING_TEMPLATES[Math.floor(Math.random() * OPENING_TEMPLATES.length)];
    const opening  = template(S.odai?.name);
    const memCtx   = App._buildMemoryContext?.() || '';

    // 2/7 の確率で、前回のミッションをさりげなく振り返ってから始める
    const prevMission = S.takaraMemory?.missionLog?.[0];
    const doReview    = prevMission && Math.random() < 2 / 7;
    const startMsg    = doReview
      ? PROMPT_USER_opening_review(prevMission, opening, memCtx)
      : PROMPT_USER_opening(opening, memCtx);

    try {
      const text = await callAI([{ role: 'user', content: startMsg }], chatSystem());
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

  /** フェーズ3完了後：「たからをしまう」を選択 */
  chooseSaveNow() {
    S.chatPhase = 4;
    S.showDecisionButtons = false;
    render();
    App._triggerPhaseMessage();
  },

  /** フェーズ3完了後：「もっとたんけんする」を選択 */
  chooseKeepExploring() {
    S.chatPhase = 5;
    S.showDecisionButtons = false;
    render();
    App._triggerPhaseMessage();
  },

  /** フェーズ移行時にAIから次の問いかけを生成 */
  async _triggerPhaseMessage() {
    if (S.isLoading) return;
    S.isLoading = true;
    render();
    try {
      const label = S.chatPhase === 4 ? 'たからをしまう準備をしてください。' : 'もっとたんけんを続けてください。';
      const text  = await callAI(App._buildMinimalMsg(label), chatSystem());
      S.messages.push({ role: 'ai', text });
    } catch (err) {
      console.error('_triggerPhaseMessage error:', err);
    }
    S.isLoading = false;
    render();
    scrollChat();
  },

  /** チャット入力を送信してAI返答を取得 */
  async sendChat() {
    const inp = $id('chat-in');
    const txt = inp?.value?.trim();
    if (!txt || S.isLoading) return;

    S.messages.push({ role: S.speaker, text: txt });
    if (S.speaker === 'child') {
      S.childChatCount = (S.childChatCount || 0) + 1;
      grantChatStickers();
      persistSave();
    }
    S.speaker   = 'child';
    S.isLoading = true;
    S.lastError = false;
    if (inp) inp.value = '';
    render();
    scrollChat();

    try {
      // 興味判定
      const interest     = await App._checkInterest(txt);
      const isInterested = interest?.is_interested !== false;

      // 文体・トーン変化の検出（前回の平均文字数と比較）
      const kidAvgLen        = S.takaraMemory?.kidStyle?.avgLen || 0;
      const showStyleConcern = kidAvgLen > 5 && txt.length < kidAvgLen * 0.35;
      const showStylePraise  = kidAvgLen > 5 && txt.length > kidAvgLen * 2.8;

      // フェーズ3のターン管理
      let showPhase3Decision = false;
      let showPhase3Likes    = false;
      let showPhase3Compare  = false;
      let showAiOpinion      = false;
      let showAiEmotion      = false;
      let showParentOnly     = false;
      if (S.chatPhase === 3) {
        S.phase3Turns = (S.phase3Turns || 0) + 1;

        if (S.phase3Turns === 3 && !S.phase3DecisionAsked) {
          // ターン3: リアクション＋決断質問のみ
          showPhase3Decision    = true;
          S.phase3DecisionAsked = true;
          S.showDecisionButtons = true;
        } else {
          // それ以外: 基本（深掘り）+ ランダムで1つだけ追加
          const canParent  = S.phase3Turns >= 2 && !S.parentBridgeDone && S.user.parentName && S.user.parentName !== 'ひとり';
          const canOpinion = !S.phase3OpinionDone;
          const canCompare = !S.phase3CompareDone;
          const rand = Math.random();
          let cum = 0;

          if      (canParent  && rand < (cum += 1/10))  { showParentOnly = true; S.parentBridgeDone = true; }
          else if (canOpinion && rand < (cum += 1/10))  { showAiOpinion  = true; S.phase3OpinionDone = true; }
          else if (canCompare && rand < (cum += 1/4))   { showPhase3Compare = true; S.phase3CompareDone = true; }
          else if (S.user.likes && rand < (cum += 1/6)) { showPhase3Likes = true; }
          else if (rand < (cum += 1/3))                 { showAiEmotion  = true; }
          // else: 基本の深掘りのみ
        }
      }

      // AI返答を取得
      let text = await callAI(
        App._buildApiMsgs(),
        chatSystem({ isInterested, showParentOnly, showPhase3Decision, showPhase3Likes, showPhase3Compare, showAiOpinion, showAiEmotion, showStyleConcern, showStylePraise })
      );

      // Phase 1 → 2: 🔷 シグナルを検出
      if (S.chatPhase === 1 && text.includes('🔷')) {
        text = text.replace('🔷', '').trimEnd();
        const lastChild = [...S.messages].reverse().find(m => m.role === 'child' || m.role === 'parent');
        S.situationContext = lastChild?.text || '';
        S.chatPhase = 2;
      }

      // Phase 2 → 3: 🔶 シグナルを検出
      if (S.chatPhase === 2 && text.includes('🔶')) {
        text = text.replace('🔶', '').trimEnd();
        const lastChild = [...S.messages].reverse().find(m => m.role === 'child' || m.role === 'parent');
        S.observationContext = lastChild?.text || '';
        S.chatPhase = 3;
        S.phase3Turns = 0;
      }

      S.messages.push({ role: 'ai', text });
      S.lastError = false;

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
    if (S.isLoading) return;
    const lastUserMsg = [...S.messages].reverse().find(m => m.role !== 'ai');
    if (!lastUserMsg) return;

    S.isLoading = true;
    S.lastError = false;
    render();
    scrollChat();

    try {
      const text = await callAI(App._buildApiMsgs(), chatSystem());
      S.messages.push({ role: 'ai', text });
      S.lastError = false;
    } catch {
      S.lastError = true;
    }

    S.isLoading = false;
    render();
    scrollChat();
  },

  /** 興味判定 */
  async _checkInterest(childText) {
    try {
      const recent = formatConversation(S.messages.slice(-4));
      const res    = await callAI(
        [{ role: 'user', content: PROMPT_USER_interest(recent, childText) }],
        PROMPT_SYS_interest
      );
      return parseJSON(res);
    } catch (err) {
      console.warn('_checkInterest error:', err);
      return { is_interested: true, reason: '判定失敗のためデフォルトtrue' };
    }
  },

  /** APIメッセージ組み立て（子ども1発言分） */
  _buildMinimalMsg(childText) {
    return [{ role: 'user', content: `[${S.user.name || 'こども'}] ${childText}` }];
  },

  /** S.messages を API 送信用フォーマットに変換 */
  _buildApiMsgs() {
    const msgs = S.messages.map(m => {
      if (m.role === 'ai') return { role: 'assistant', content: m.text };
      const label = m.role === 'child' ? S.user.name || 'こども' : S.user.parentName;
      return { role: 'user', content: `[${label}] ${m.text}` };
    });
    // assistantメッセージが先頭に来ないよう保証
    if (msgs[0]?.role === 'assistant') msgs.unshift({ role: 'user', content: 'はじめてください' });
    return msgs;
  },


  // ── たから記憶（takaraMemory：localStorage 別キー） ──

  /** 起動時に記憶を読み込む */
  loadTakaraMemory() {
    try {
      const raw = localStorage.getItem('takaraMemory_' + (S.user?.name || 'default'));
      S.takaraMemory = raw ? JSON.parse(raw) : null;
    } catch {
      S.takaraMemory = null;
    }
  },

  /** 記憶をchatSystemに渡す用テキストを生成 */
  _buildMemoryContext() {
    const mem = S.takaraMemory;
    if (!mem || mem.sessions === 0) return '';
    return [
      mem.lastTopic
        ? `前回「${mem.lastTopic}」を一緒に探検したよ。もし話の流れに合うなら軽く触れてみて。`
        : '',
      mem.kidStyle?.avgLen > 5
        ? `この子はふだん${mem.kidStyle.avgLen}文字くらいで話すよ。たからちゃんの返答もそのテンポに合わせて。`
        : '',
      mem.kidOriginals?.length
        ? `この子のオリジナル表現：「${mem.kidOriginals.slice(0, 3).join('」「')}」。話の流れで自然に使ってみて。`
        : '',
    ].filter(Boolean).join('\n');
  },

  /** セッション終了時に記憶を更新して保存 */
  _updateTakaraMemory() {
    const mem = S.takaraMemory || {
      sessions:       0,
      lastTopic:      '',
      topicLog:       [],
      lensLog:        [],
      kidKeywords:    [],
      kidOriginals:   [],
      kidStyle:       { avgLen: 0, samples: 0 },
      sharedEmotions: [],
      missionLog:     [],
      opinionLog:     [],
    };
    if (!mem.kidOriginals) mem.kidOriginals = [];
    if (!mem.kidStyle)     mem.kidStyle     = { avgLen: 0, samples: 0 };

    mem.sessions += 1;
    mem.lastTopic = S.odai?.name || '';

    if (S.odai?.name)     mem.topicLog   = [S.odai.name, ...(mem.topicLog || [])].slice(0, 1);
    if (S.lens)           mem.lensLog    = [S.lens,       ...(mem.lensLog  || [])].slice(0, 10);
    if (S.summaryMission) mem.missionLog = [S.summaryMission, ...(mem.missionLog || [])].slice(0, 5);

    // AIの所感（opinion）はあとで活用するため、たからと一緒に保存しておく
    if (S.summaryOpinion?.length) {
      mem.opinionLog = [
        { topic: S.odai?.name || '', lens: S.lens || '', opinion: S.summaryOpinion },
        ...(mem.opinionLog || []),
      ].slice(0, 10);
    }

    const childMsgs = S.messages.filter(m => m.role === 'child');

    // 文体・トーン：平均文字数を累積更新
    if (childMsgs.length > 0) {
      const sessionAvg = childMsgs.reduce((s, m) => s + m.text.length, 0) / childMsgs.length;
      const prev = mem.kidStyle;
      const total = prev.samples + childMsgs.length;
      mem.kidStyle = {
        avgLen:  Math.round((prev.avgLen * prev.samples + sessionAvg * childMsgs.length) / total),
        samples: total,
      };
    }

    // キーワード（2〜8文字）
    const childWords = childMsgs.map(m => m.text).join(' ')
      .split(/[、。！？\s]+/).filter(w => w.length >= 2 && w.length <= 8);
    mem.kidKeywords = [...new Set([...childWords, ...(mem.kidKeywords || [])])].slice(0, 20);

    // オリジナルオノマトペ・ニックネーム：純粋かな4文字以上 or 繰り返しパターン
    const kanaOnly = /^[ぁ-んァ-ン]+$/;
    const repeated = /([ぁ-んァ-ン]{2,3})\1/;
    const originals = childMsgs.map(m => m.text).join(' ')
      .split(/[、。！？\s「」『』]+/)
      .filter(w => w.length >= 4 && (kanaOnly.test(w) || repeated.test(w)));
    mem.kidOriginals = [...new Set([...originals, ...(mem.kidOriginals || [])])].slice(0, 15);

    S.takaraMemory = mem;

    try {
      localStorage.setItem('takaraMemory_' + (S.user?.name || 'default'), JSON.stringify(mem));
    } catch (e) {
      console.warn('memory save error:', e);
    }
  },


  // ── サマリー ───────────────────────────────

  /**
   * サマリー画面へ遷移し、AI まとめを生成して保存。
   * findings / opinion / mission / tomorrow を1回のAI呼び出しで取得する。
   */
  async goSummary() {
    Object.assign(S, {
      flow:           'summary',
      summaryItems:   [],
      summaryOpinion: [],
      summaryMission: '',
      opinionOpen:    false,
      bookmarked:     false,
      currentNote:    '',
      noteStamps:     [],
      tomorrowHint:   '',
    });
    render();

    try {
      const res  = await callAI([{ role: 'user', content: 'まとめてください。' }], summarySystem());
      const data = parseJSON(res);
      S.summaryItems   = data.findings || [];
      S.summaryOpinion = Array.isArray(data.opinion) ? data.opinion : (data.opinion ? [data.opinion] : []);
      S.summaryMission = data.mission  || '';
      S.tomorrowHint   = data.tomorrow || '';
    } catch (err) {
      console.error('summary error:', err);
      S.summaryItems   = ['いっぱいかんがえた！'];
      S.summaryOpinion = ['ふたりとも、すごいはっけんだったね！'];
      S.summaryMission = 'あしたそとで、なにかみつけてきてね！';
      S.tomorrowHint   = 'あしたも、まわりのものをじっくりみてみよう！';
    }

    App._saveRecord();
    App._updateTakaraMemory();
    persistSave();
    // 全体を再描画せず、非同期で埋まる箇所だけ部分更新（ノート入力中のカーソル飛びを防ぐ）
    App._fillSummary();
    setTimeout(triggerFindingAnim, 50);
  },

  /** サマリーの非同期結果を部分DOM更新で反映 */
  _fillSummary() {
    const findingsBody = $id('findings-body');
    if (findingsBody) findingsBody.innerHTML = summaryFindingsHTML();

    const opinionBody = $id('opinion-body');
    if (opinionBody) opinionBody.innerHTML = summaryOpinionHTML();

    const tomorrowBody = $id('tomorrow-body');
    if (tomorrowBody) tomorrowBody.innerHTML = summaryTomorrowHTML();
  },

  /** ノート：気持ちスタンプの選択切り替え */
  toggleStamp(id) {
    S.noteStamps = S.noteStamps.includes(id)
      ? S.noteStamps.filter(s => s !== id)
      : [...S.noteStamps, id];
    const row = document.querySelector('.note-stamp-row');
    if (row) row.innerHTML = noteStampsHTML();
  },

  /** ノート：書き出しヒントを入力欄にいれる */
  useNoteHint(i) {
    const hint = NOTE_HINTS[i];
    const el = $id('note-input');
    if (!el || !hint) return;
    el.value = el.value.trim() ? el.value : hint + ' ';
    S.currentNote = el.value;
    el.focus();
  },

  /** ノート：入力をstateに同期（再描画はしない） */
  onNoteInput(v) { S.currentNote = v; },

  saveNote() {
    S.currentNote = $id('note-input')?.value?.trim() || '';

    // 最新の record にノートを保存
    const last = S.records[S.records.length - 1];
    if (last) last.note = S.currentNote;

    // スタンプ＋ノートを takaraMemory にも保存（あとで活用）
    if ((S.currentNote || S.noteStamps.length) && S.takaraMemory) {
      const mem = S.takaraMemory;
      mem.noteLog = [
        { topic: S.odai?.name || '', stamps: [...S.noteStamps], note: S.currentNote },
        ...(mem.noteLog || []),
      ].slice(0, 10);
      try {
        localStorage.setItem('takaraMemory_' + (S.user?.name || 'default'), JSON.stringify(mem));
      } catch (e) {
        console.warn('note save error:', e);
      }
    }
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

    // てちょう解放を検出（0さつ → 1さつ以上になった瞬間に演出をキュー）
    if (!S.notebookUnlocked && !S.notebookUnlockPending && calcNotebookLimit() >= 1) {
      S.notebookUnlockPending = true;
    }

    // 新規てちょう枠ぶんのテーマを付与（10日ボーナス＝plain固定／バッヂ枠＝ランダム）
    grantNotebookThemes();
  },


  // ── サマリー後アクション ───────────────────

  doAgain() {
    S.lens              = null;
    S.flow              = 'lens';
    S._savedThisSession = false;
    S.prevRecord        = null;
    S.noteStamps        = [];
    S.currentNote       = '';
    render();
  },

  nextOdai() {
    S.flow       = 'home';
    S.tab        = 'home';
    S.randOdai   = null;
    S.prevRecord = null;
    S.noteStamps = [];
    S.currentNote = '';
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
  closeNotebookUnlock(){ S.shownNotebookUnlock = false; render(); },
  dismissStreakPop()   { S.streakBrokenPop = false; render(); },

  // ── シール（チャット報酬・ホーム貼り付け） ──
  closeFirstStickerModal() {
    S.firstStickerPending = false;
    S.shownFirstSticker   = true;
    persistSave();
    render();
  },

  /** 「シールをはる」モードを開始（ホーム画面に切り替えてオーバーレイ表示） */
  openStickerPlaceMode() {
    S.stickerPlaceMode = true;
    S.stickerPlacing   = null;
    App.switchTab('home');
  },

  closeStickerPlaceMode() {
    S.stickerPlaceMode = false;
    S.stickerPlacing   = null;
    render();
  },

  /** トレイのシールを選択 → 配置待ち状態にする（同じシール再タップでキャンセル） */
  pickHomeSticker(idx) {
    const id = S.ownedStickers[idx];
    if (!id) return;
    const st = STICKERS.find(s => s.id === id);
    if (!st) return;
    S.stickerPlacing = (S.stickerPlacing && S.stickerPlacing.ownedIndex === idx)
      ? null
      : { ownedIndex: idx, id, emoji: st.emoji };
    render();
  },

  /** 画面をタップしてシールを配置（所持シールを1枚消費・バッヂ検出あり） */
  placeHomeSticker(event) {
    if (!S.stickerPlacing) return;
    const canvas = document.getElementById('home-sticker-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const p    = S.stickerPlacing;

    // バッヂ検出：push 前に「達成済みセット」を記録
    const prevEarned = new Set(BADGES.filter(b => b.check(S)).map(b => b.id));

    // 現在タブのシール配列に追加
    if (!S.tabStickers[S.tab]) S.tabStickers[S.tab] = [];
    S.tabStickers[S.tab].push({
      id:    p.id,
      emoji: p.emoji,
      x: Math.max(0, Math.round(event.clientX - rect.left - 20)),
      y: Math.max(0, Math.round(event.clientY - rect.top  - 20)),
    });
    S.ownedStickers.splice(p.ownedIndex, 1);
    S.stickerPlacing = null;

    // push 後に新規達成バッヂをキューへ
    BADGES.forEach(b => {
      if (!prevEarned.has(b.id) && b.check(S)) S.newBadges.push(b.id);
    });

    persistSave();
    render();
  },

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
