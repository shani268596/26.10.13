/**
 * MemoryQ - 시험 암기 마스터 웹 어플리케이션
 * 5지선다 & OX 퀴즈 풀이, 스마트 파서, 오답노트, 통계, Web Audio 효과음
 */

(function () {
  'use strict';

  // ==========================================
  // 1. Audio Engine (Web Audio API Synthesizer)
  // ==========================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'correct') {
      // 밝고 상쾌한 아르페지오 (도-미-솔)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } else if (type === 'wrong') {
      // 묵직하고 부드러운 오답 톤
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(650, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    }
  }

  // ==========================================
  // 2. Confetti Canvas Particle System
  // ==========================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiAnimId = null;

  if (confettiCanvas) {
    confettiCtx = confettiCanvas.getContext('2d');
    function resizeConfetti() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();
  }

  function launchConfetti(count = 70) {
    if (!confettiCtx) return;
    confettiParticles = [];
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#f43f5e'];

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 200,
        y: confettiCanvas.height / 2,
        w: Math.random() * 9 + 5,
        h: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 6,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let activeCount = 0;
    for (let p of confettiParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rot += p.vRot;
      p.opacity -= 0.008;

      if (p.opacity > 0 && p.y < confettiCanvas.height) {
        activeCount++;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rot * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
      }
    }

    if (activeCount > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // ==========================================
  // 3. Application State & Storage
  // ==========================================
  const STORAGE_KEYS = {
    DECKS: 'memoryq_decks_v1',
    ACTIVE_DECK: 'memoryq_active_deck_v1',
    WRONGS: 'memoryq_wrongs_v1',
    STARRED: 'memoryq_starred_v1',
    STATS: 'memoryq_stats_v1',
    THEME: 'memoryq_theme_v1',
    SOUND: 'memoryq_sound_v1',
    INSTANT_FEEDBACK: 'memoryq_instant_feedback_v1'
  };

  const state = {
    decks: [],
    currentDeckId: null,
    currentFilter: 'all', // 'all' | 'choice5' | 'ox' | 'starred'
    currentMode: 'standard', // 'standard' | 'flashcard' | 'exam'
    filteredQuestions: [],
    currentIndex: 0,
    userAnswers: {}, // questionId => { selected, isCorrect }
    wrongAnswers: [], // Array of { questionId, deckId, question, wrongCount, lastWrongAt }
    starredIds: new Set(),
    currentStreak: 0,
    soundEnabled: true,
    instantFeedback: true,
    stats: {
      totalSolved: 0,
      totalCorrect: 0,
      maxStreak: 0,
      choice5Solved: 0,
      choice5Correct: 0,
      oxSolved: 0,
      oxCorrect: 0
    },
    exam: {
      timerSeconds: 0,
      intervalId: null
    }
  };

  // ==========================================
  // 4. Persistence & Initialization
  // ==========================================
  function loadFromStorage() {
    // 1. Decks
    const defaultPresets = (typeof PRESET_DECKS !== 'undefined' ? PRESET_DECKS : (typeof window !== 'undefined' && window.PRESET_DECKS ? window.PRESET_DECKS : []));
    try {
      const storedDecks = localStorage.getItem(STORAGE_KEYS.DECKS);
      if (storedDecks) {
        const parsed = JSON.parse(storedDecks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.decks = parsed;
        } else {
          state.decks = JSON.parse(JSON.stringify(defaultPresets));
          saveDecks();
        }
      } else {
        state.decks = JSON.parse(JSON.stringify(defaultPresets));
        saveDecks();
      }
    } catch (e) {
      state.decks = JSON.parse(JSON.stringify(defaultPresets));
    }

    // 2. Active Deck
    const activeDeckId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DECK);
    if (activeDeckId && state.decks.some(d => d.id === activeDeckId)) {
      state.currentDeckId = activeDeckId;
    } else if (state.decks.length > 0) {
      state.currentDeckId = state.decks[0].id;
    }

    // 3. Wrong Answers
    try {
      const storedWrongs = localStorage.getItem(STORAGE_KEYS.WRONGS);
      if (storedWrongs) state.wrongAnswers = JSON.parse(storedWrongs);
    } catch (e) {
      state.wrongAnswers = [];
    }

    // 4. Starred
    try {
      const storedStars = localStorage.getItem(STORAGE_KEYS.STARRED);
      if (storedStars) state.starredIds = new Set(JSON.parse(storedStars));
    } catch (e) {
      state.starredIds = new Set();
    }

    // 5. Stats
    try {
      const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      if (storedStats) state.stats = Object.assign(state.stats, JSON.parse(storedStats));
    } catch (e) {}

    // 6. Preferences
    state.soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false';
    state.instantFeedback = localStorage.getItem(STORAGE_KEYS.INSTANT_FEEDBACK) !== 'false';
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    setTheme(savedTheme);
  }

  function saveDecks() {
    try {
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(state.decks));
    } catch (e) {
      console.error('Failed to save decks', e);
    }
  }

  function saveWrongs() {
    try {
      localStorage.setItem(STORAGE_KEYS.WRONGS, JSON.stringify(state.wrongAnswers));
    } catch (e) {}
    updateWrongBadge();
  }

  function saveStarred() {
    try {
      localStorage.setItem(STORAGE_KEYS.STARRED, JSON.stringify(Array.from(state.starredIds)));
    } catch (e) {}
  }

  function saveStats() {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(state.stats));
    } catch (e) {}
  }

  function setTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      document.getElementById('theme-icon').textContent = '☀️';
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      document.getElementById('theme-icon').textContent = '🌙';
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  // ==========================================
  // 5. Toast Notifications
  // ==========================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3200);
  }

  // ==========================================
  // 6. Navigation & View Switching
  // ==========================================
  function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetSection = document.getElementById(viewId);
    if (targetSection) targetSection.classList.remove('hidden');

    const activeNavBtn = document.querySelector(`.nav-btn[data-view="${viewId}"]`);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    // 각 뷰 진입 시 갱신 작업
    if (viewId === 'quiz-view') {
      applyFilterAndRenderQuiz();
    } else if (viewId === 'wrong-view') {
      renderWrongAnswersList();
    } else if (viewId === 'decks-view') {
      renderDecksGrid();
    } else if (viewId === 'stats-view') {
      renderStatsView();
    } else if (viewId === 'creator-view') {
      populateCreatorDeckSelect();
    }

    playSound('click');
  }

  // ==========================================
  // 7. Active Deck Management & Filtering
  // ==========================================
  function getCurrentDeck() {
    return state.decks.find(d => d.id === state.currentDeckId) || state.decks[0] || null;
  }

  function updateDeckStatusBar() {
    const deck = getCurrentDeck();
    if (!deck) return;

    const titleEl = document.getElementById('current-deck-title');
    const countEl = document.getElementById('current-deck-count');

    if (titleEl) titleEl.textContent = deck.title;
    if (countEl) {
      const c5 = deck.questions.filter(q => q.type === 'choice5').length;
      const ox = deck.questions.filter(q => q.type === 'ox').length;
      countEl.textContent = `총 ${deck.questions.length}문제 (5지선다 ${c5} / OX ${ox})`;
    }
  }

  function updateWrongBadge() {
    const badge = document.getElementById('wrong-count-badge');
    if (badge) {
      badge.textContent = state.wrongAnswers.length;
    }
    const filterCount = document.getElementById('wrong-total-filter-count');
    if (filterCount) {
      filterCount.textContent = state.wrongAnswers.length;
    }
  }

  function applyFilterAndRenderQuiz() {
    const deck = getCurrentDeck();
    if (!deck || !deck.questions || deck.questions.length === 0) {
      state.filteredQuestions = [];
      renderEmptyQuizState();
      return;
    }

    // 필터링 적용
    if (state.currentFilter === 'choice5') {
      state.filteredQuestions = deck.questions.filter(q => q.type === 'choice5');
    } else if (state.currentFilter === 'ox') {
      state.filteredQuestions = deck.questions.filter(q => q.type === 'ox');
    } else if (state.currentFilter === 'starred') {
      state.filteredQuestions = deck.questions.filter(q => state.starredIds.has(q.id));
    } else {
      state.filteredQuestions = [...deck.questions];
    }

    if (state.filteredQuestions.length === 0) {
      renderEmptyFilterState();
      return;
    }

    if (state.currentIndex >= state.filteredQuestions.length) {
      state.currentIndex = 0;
    }

    updateDeckStatusBar();
    renderCurrentQuestion();
  }

  function renderEmptyQuizState() {
    const qText = document.getElementById('q-question-text');
    if (qText) {
      qText.innerHTML = `⚠️ 현재 문제집에 등록된 문제가 없습니다.<br><br><button class="btn-primary" id="btn-quick-create-from-empty">✨ 문제 생성기로 이동</button>`;
      document.getElementById('btn-quick-create-from-empty')?.addEventListener('click', () => switchView('creator-view'));
    }
    document.getElementById('choice5-container').innerHTML = '';
    document.getElementById('ox-container').classList.add('hidden');
    document.getElementById('explanation-box').classList.add('hidden');
  }

  function renderEmptyFilterState() {
    const qText = document.getElementById('q-question-text');
    if (qText) {
      const msg = state.currentFilter === 'starred'
        ? '⭐ 즐겨찾기(북마크)한 문제가 아직 없습니다.<br>문제 우측 상단의 별 아이콘을 눌러 북마크해보세요!'
        : '해당 유형의 문제가 현재 문제집에 존재하지 않습니다.';
      qText.innerHTML = `⚠️ ${msg}`;
    }
    document.getElementById('choice5-container').innerHTML = '';
    document.getElementById('ox-container').classList.add('hidden');
    document.getElementById('explanation-box').classList.add('hidden');
  }

  // ==========================================
  // 8. Quiz Question Rendering & Solving Logic
  // ==========================================
  function renderCurrentQuestion() {
    const q = state.filteredQuestions[state.currentIndex];
    if (!q) return;

    // 모달 숨기기
    document.getElementById('quiz-summary-modal').classList.add('hidden');

    // 모드에 따라 컨테이너 토글
    if (state.currentMode === 'flashcard') {
      document.getElementById('standard-quiz-container').classList.add('hidden');
      document.getElementById('flashcard-container').classList.remove('hidden');
      renderFlashcard(q);
      return;
    } else {
      document.getElementById('paper-view-container')?.classList.add('hidden');
      document.getElementById('standard-quiz-container').classList.remove('hidden');
      document.getElementById('flashcard-container').classList.add('hidden');
    }

    renderOMRChips();

    // 진행 상태 업데이트
    const total = state.filteredQuestions.length;
    const currentNum = state.currentIndex + 1;
    document.getElementById('progress-indicator').textContent = `문제 ${currentNum} / ${total}`;
    document.getElementById('q-index-pill').textContent = `Q${currentNum}`;
    
    const progressPercent = (currentNum / total) * 100;
    document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;

    // 북마크 상태 표시
    const starBtn = document.getElementById('btn-toggle-star');
    const isStarred = state.starredIds.has(q.id);
    if (starBtn) {
      starBtn.classList.toggle('starred', isStarred);
      document.getElementById('star-icon').textContent = isStarred ? '★' : '☆';
    }

    // 유형 배지 및 메타
    const typeBadge = document.getElementById('q-type-badge');
    if (typeBadge) {
      if (q.type === 'ox') {
        typeBadge.textContent = 'OX 퀴즈';
        typeBadge.className = 'q-type-badge ox';
      } else {
        typeBadge.textContent = '5지선다';
        typeBadge.className = 'q-type-badge';
      }
    }

    const currentDeck = getCurrentDeck();
    document.getElementById('q-category-badge').textContent = currentDeck?.category || '일반';

    // 태그 렌더링
    const tagsContainer = document.getElementById('q-tags-container');
    tagsContainer.innerHTML = '';
    if (q.tags && q.tags.length > 0) {
      q.tags.forEach(t => {
        const pill = document.createElement('span');
        pill.className = 'tag-pill';
        pill.textContent = `#${t}`;
        tagsContainer.appendChild(pill);
      });
    }

    // 질문 텍스트
    document.getElementById('q-question-text').textContent = q.question;

    // 이전/다음 버튼 비활성화 상태
    const prevBtn = document.getElementById('btn-prev-q');
    const nextBtn = document.getElementById('btn-next-q');
    if (prevBtn) prevBtn.disabled = state.currentIndex === 0;
    if (nextBtn) {
      nextBtn.textContent = state.currentIndex === total - 1 ? '결과 확인 🏆' : '다음 문제 ▶';
    }

    // 기응답 데이터 확인
    const answered = state.userAnswers[q.id];

    // 해설 상자 기본 숨김
    const expBox = document.getElementById('explanation-box');
    expBox.classList.add('hidden');

    // 단축키 힌트 갱신
    const shortcutTip = document.getElementById('shortcut-tip');
    if (shortcutTip) {
      shortcutTip.textContent = q.type === 'ox'
        ? '💡 단축키: O(또는 1) / X(또는 2) 키로 빠르게 풀 수 있습니다'
        : '💡 단축키: 숫자키 1 ~ 5 로 보기를 선택할 수 있습니다';
    }

    // 5지선다 vs OX 뷰 분기
    if (q.type === 'choice5') {
      document.getElementById('choice5-container').classList.remove('hidden');
      document.getElementById('ox-container').classList.add('hidden');
      renderChoice5Options(q, answered);
    } else {
      document.getElementById('choice5-container').classList.add('hidden');
      document.getElementById('ox-container').classList.remove('hidden');
      renderOXOptions(q, answered);
    }

    // 이미 답변한 상태라면 해설 표시 (즉시 확인 모드이거나 결과 보기 시)
    if (answered && state.instantFeedback) {
      showExplanation(q, answered.selected, answered.isCorrect);
    }
  }

  function renderOMRChips() {
    const list = document.getElementById('omr-chips-list');
    if (!list) return;
    list.innerHTML = '';

    state.filteredQuestions.forEach((q, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'omr-chip';
      chip.textContent = idx + 1;

      if (idx === state.currentIndex) {
        chip.classList.add('active');
      }

      const ans = state.userAnswers[q.id];
      if (ans) {
        if (ans.isCorrect) chip.classList.add('correct');
        else chip.classList.add('wrong');
      }

      chip.addEventListener('click', () => {
        state.currentIndex = idx;
        renderCurrentQuestion();
        playSound('click');
      });

      list.appendChild(chip);
    });
  }

  function renderPaperView() {
    const container = document.getElementById('paper-sheet-content');
    const deck = getCurrentDeck();
    if (!container || !deck) return;

    document.getElementById('paper-deck-title').textContent = `📄 ${deck.title}`;
    document.getElementById('paper-deck-subtitle').textContent = `총 ${state.filteredQuestions.length}문항 · ${deck.category || '일반'}`;

    container.innerHTML = '';
    const numberSymbols = ['①', '②', '③', '④', '⑤'];

    state.filteredQuestions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'paper-q-card';

      let optionsHtml = '';
      if (q.type === 'choice5') {
        optionsHtml = `<div class="paper-q-options">` +
          q.options.map((opt, i) => `<div>${numberSymbols[i]} ${escapeHtml(opt)}</div>`).join('') +
          `</div>`;
      } else {
        optionsHtml = `<div class="paper-q-options"><div>[ &nbsp; ] ⭕ 옳음 (O) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] ❌ 틀림 (X)</div></div>`;
      }

      let ansText = '';
      if (q.type === 'choice5') {
        ansText = `정답: ${numberSymbols[q.answerIndex]} ${q.options[q.answerIndex]}`;
      } else {
        ansText = `정답: ${q.answer.toUpperCase() === 'O' ? '⭕ 옳음' : '❌ 틀림'}`;
      }

      card.innerHTML = `
        <div class="paper-q-head">
          <span class="paper-q-num">Q${idx + 1}.</span>
          <span>${escapeHtml(q.question)}</span>
        </div>
        ${optionsHtml}
        <div class="paper-answer-box hidden">
          <strong>${ansText}</strong>
          <div>💡 ${escapeHtml(q.explanation || '해설 없음')}</div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function renderChoice5Options(question, answered) {
    const container = document.getElementById('choice5-container');
    container.innerHTML = '';
    const numberSymbols = ['①', '②', '③', '④', '⑤'];

    question.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice5-option-btn';
      btn.setAttribute('data-index', index);

      btn.innerHTML = `
        <span class="choice-index-circle">${numberSymbols[index] || index + 1}</span>
        <span class="choice-text-content">${escapeHtml(optText)}</span>
      `;

      if (answered) {
        btn.disabled = true;
        if (index === question.answerIndex) {
          btn.classList.add('correct');
        }
        if (answered.selected === index && !answered.isCorrect) {
          btn.classList.add('wrong');
        }
      } else {
        btn.addEventListener('click', () => handleChoiceSelect(question, index));
      }

      container.appendChild(btn);
    });
  }

  function renderOXOptions(question, answered) {
    const btnO = document.getElementById('btn-ox-o');
    const btnX = document.getElementById('btn-ox-x');

    btnO.className = 'ox-btn ox-btn-o';
    btnX.className = 'ox-btn ox-btn-x';
    btnO.disabled = false;
    btnX.disabled = false;

    if (answered) {
      btnO.disabled = true;
      btnX.disabled = true;

      const correctVal = question.answer.toUpperCase();
      if (correctVal === 'O') btnO.classList.add('correct');
      if (correctVal === 'X') btnX.classList.add('correct');

      if (answered.selected === 'O' && !answered.isCorrect) btnO.classList.add('wrong');
      if (answered.selected === 'X' && !answered.isCorrect) btnX.classList.add('wrong');
    }
  }

  // 보기 선택 처리 (5지선다)
  function handleChoiceSelect(question, selectedIndex) {
    const isCorrect = selectedIndex === question.answerIndex;
    recordAnswer(question, selectedIndex, isCorrect);
  }

  // OX 선택 처리
  function handleOXSelect(selectedVal) {
    const q = state.filteredQuestions[state.currentIndex];
    if (!q || q.type !== 'ox') return;
    if (state.userAnswers[q.id]) return; // 이미 풀었음

    const isCorrect = selectedVal.toUpperCase() === q.answer.toUpperCase();
    recordAnswer(q, selectedVal, isCorrect);
  }

  function recordAnswer(question, selectedVal, isCorrect) {
    state.userAnswers[question.id] = {
      selected: selectedVal,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    // 통계 누적
    state.stats.totalSolved++;
    if (question.type === 'choice5') {
      state.stats.choice5Solved++;
      if (isCorrect) state.stats.choice5Correct++;
    } else {
      state.stats.oxSolved++;
      if (isCorrect) state.stats.oxCorrect++;
    }

    if (isCorrect) {
      state.stats.totalCorrect++;
      state.currentStreak++;
      if (state.currentStreak > state.stats.maxStreak) {
        state.stats.maxStreak = state.currentStreak;
      }
      playSound('correct');

      // 3연타 이상일 시 컨페티 축하
      if (state.currentStreak >= 3 && state.currentStreak % 3 === 0) {
        launchConfetti(45);
      }
    } else {
      state.currentStreak = 0;
      playSound('wrong');
      addToWrongAnswers(question);
    }

    saveStats();
    updateStreakDisplay();

    // 뷰 갱신
    renderCurrentQuestion();
  }

  function addToWrongAnswers(question) {
    const existing = state.wrongAnswers.find(w => w.questionId === question.id);
    if (existing) {
      existing.wrongCount++;
      existing.lastWrongAt = Date.now();
    } else {
      state.wrongAnswers.push({
        questionId: question.id,
        deckId: state.currentDeckId,
        question: question,
        wrongCount: 1,
        lastWrongAt: Date.now()
      });
    }
    saveWrongs();
  }

  function updateStreakDisplay() {
    const streakCountEl = document.getElementById('streak-count');
    if (streakCountEl) streakCountEl.textContent = state.currentStreak;
  }

  function showExplanation(question, selectedVal, isCorrect) {
    const expBox = document.getElementById('explanation-box');
    const header = document.getElementById('result-status-header');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const ansVal = document.getElementById('correct-answer-text');
    const expText = document.getElementById('explanation-text');

    expBox.classList.remove('hidden');

    if (isCorrect) {
      header.className = 'result-header correct';
      icon.textContent = '🎉';
      title.textContent = '정답입니다! 완벽하게 이해하셨네요!';
    } else {
      header.className = 'result-header wrong';
      icon.textContent = '💡';
      title.textContent = '아쉽네요! 오답입니다. 오답노트에 자동 저장되었습니다.';
    }

    if (question.type === 'choice5') {
      const numSymbol = ['①', '②', '③', '④', '⑤'][question.answerIndex] || (question.answerIndex + 1);
      const optText = question.options[question.answerIndex];
      ansVal.textContent = `${numSymbol} ${optText}`;
    } else {
      ansVal.textContent = question.answer.toUpperCase() === 'O' ? '⭕ 옳음 (O)' : '❌ 틀림 (X)';
    }

    expText.textContent = question.explanation || '등록된 상세 해설이 없습니다.';
  }

  // ==========================================
  // 9. Flashcard Mode Logic
  // ==========================================
  function renderFlashcard(question) {
    const card3d = document.getElementById('flashcard-3d');
    card3d.classList.remove('flipped'); // 앞면으로 초기화

    const typeBadge = document.getElementById('fc-type-badge');
    typeBadge.textContent = question.type === 'ox' ? 'OX 퀴즈' : '5지선다';

    document.getElementById('fc-question-text').textContent = question.question;

    const optPreview = document.getElementById('fc-options-preview');
    optPreview.innerHTML = '';
    if (question.type === 'choice5') {
      const numbers = ['①', '②', '③', '④', '⑤'];
      question.options.forEach((opt, idx) => {
        const item = document.createElement('div');
        item.textContent = `${numbers[idx]} ${opt}`;
        optPreview.appendChild(item);
      });
    }

    const ansHighlight = document.getElementById('fc-answer-highlight');
    if (question.type === 'choice5') {
      const num = ['①', '②', '③', '④', '⑤'][question.answerIndex] || question.answerIndex + 1;
      ansHighlight.textContent = `정답: ${num} ${question.options[question.answerIndex]}`;
    } else {
      ansHighlight.textContent = `정답: ${question.answer.toUpperCase() === 'O' ? '⭕ 옳음 (O)' : '❌ 틀림 (X)'}`;
    }

    document.getElementById('fc-explanation-text').textContent = question.explanation || '등록된 해설이 없습니다.';
    document.getElementById('fc-counter').textContent = `${state.currentIndex + 1} / ${state.filteredQuestions.length}`;
  }

  function toggleFlashcardFlip() {
    const card3d = document.getElementById('flashcard-3d');
    card3d.classList.toggle('flipped');
    playSound('flip');
  }

  // ==========================================
  // 10. Summary & Test Completion Screen
  // ==========================================
  function showQuizSummary() {
    document.getElementById('standard-quiz-container').classList.add('hidden');
    document.getElementById('flashcard-container').classList.add('hidden');
    document.getElementById('exam-timer-bar').classList.add('hidden');

    const modal = document.getElementById('quiz-summary-modal');
    modal.classList.remove('hidden');

    const total = state.filteredQuestions.length;
    let correctCount = 0;
    let wrongList = [];

    state.filteredQuestions.forEach(q => {
      const ans = state.userAnswers[q.id];
      if (ans && ans.isCorrect) {
        correctCount++;
      } else {
        wrongList.push(q);
      }
    });

    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    document.getElementById('summary-score-percent').textContent = percent;
    document.getElementById('summary-total-q').textContent = total;
    document.getElementById('summary-correct-q').textContent = correctCount;
    document.getElementById('summary-wrong-q').textContent = wrongList.length;

    // 타이틀
    const titleEl = document.getElementById('summary-title');
    if (percent === 100) {
      titleEl.textContent = '🌟 100점 만점! 완벽하게 암기하셨습니다!';
      launchConfetti(90);
    } else if (percent >= 80) {
      titleEl.textContent = '👏 훌륭합니다! 합격 안정권입니다!';
      launchConfetti(50);
    } else {
      titleEl.textContent = '💪 수고하셨습니다! 오답노트로 복습해보세요.';
    }

    // 틀린 문제 목록 렌더링
    const wrongSection = document.getElementById('summary-wrong-section');
    const wrongContainer = document.getElementById('summary-wrong-items');
    wrongContainer.innerHTML = '';

    if (wrongList.length > 0) {
      wrongSection.classList.remove('hidden');
      document.getElementById('summary-wrong-count').textContent = wrongList.length;
      wrongList.forEach(q => {
        const item = document.createElement('div');
        item.className = 'wrong-item-row';
        const typeBadge = q.type === 'ox' ? '[OX]' : '[5지선다]';
        item.innerHTML = `
          <div class="q-title">${typeBadge} ${escapeHtml(q.question)}</div>
          <div class="q-reason">💡 ${escapeHtml(q.explanation || '해설 확인')}</div>
        `;
        wrongContainer.appendChild(item);
      });
    } else {
      wrongSection.classList.add('hidden');
    }
  }

  // ==========================================
  // 11. Smart Text Parser (스마트 텍스트 변환기)
  // ==========================================
  function runSmartTextParser() {
    const rawText = document.getElementById('parser-input-text').value.trim();
    const deckTitle = document.getElementById('parser-deck-title').value.trim() || '스마트 생성 문제집';

    if (!rawText) {
      showToast('변환할 텍스트를 입력해주세요.', 'warning');
      return;
    }

    const parsedQuestions = parseRawTextToQuestions(rawText);

    if (parsedQuestions.length === 0) {
      showToast('인식 가능한 문제를 찾지 못했습니다. 양식을 확인해주세요.', 'warning');
      return;
    }

    // 새 문제집 생성 및 저장
    const newDeck = {
      id: 'deck-' + Date.now(),
      title: deckTitle,
      category: '사용자 정의',
      description: `스마트 파서로 생성됨 (${parsedQuestions.length}문항)`,
      createdAt: new Date().toISOString().slice(0, 10),
      questions: parsedQuestions
    };

    state.decks.unshift(newDeck);
    state.currentDeckId = newDeck.id;
    saveDecks();

    showToast(`총 ${parsedQuestions.length}문항이 성공적으로 생성되었습니다!`, 'success');
    launchConfetti(40);

    // 퀴즈 화면으로 이동하여 즉시 학습 시작
    state.currentIndex = 0;
    state.userAnswers = {};
    switchView('quiz-view');
  }

  function parseRawTextToQuestions(text) {
    const questions = [];
    const lines = text.split(/\r?\n/);
    
    // 블록별 분할: 빈 줄 또는 번호로 시작하는 줄을 감지
    let currentBlock = [];
    const blocks = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
      } else {
        currentBlock.push(trimmed);
      }
    });
    if (currentBlock.length > 0) blocks.push(currentBlock);

    blocks.forEach((block, bIdx) => {
      const fullBlockText = block.join('\n');

      // 1. OX 퀴즈 판별 패턴
      // (O) 또는 (X) 또는 [O] 또는 [X]가 포함되어 있는지 확인
      const oxMatch = fullBlockText.match(/\((O|X)\)|\[(O|X)\]|\b정답\s*:\s*(O|X)\b/i);
      const is5Choice = /(?:①|1[\.\)]|보기\s*1)/.test(fullBlockText) && /(?:⑤|5[\.\)]|보기\s*5)/.test(fullBlockText);

      if (is5Choice) {
        // 5지선다 파싱
        const qParsed = parse5ChoiceBlock(block, bIdx);
        if (qParsed) questions.push(qParsed);
      } else if (oxMatch) {
        // OX 퀴즈 파싱
        const qParsed = parseOXBlock(block, oxMatch, bIdx);
        if (qParsed) questions.push(qParsed);
      }
    });

    return questions;
  }

  function parseOXBlock(lines, oxMatch, index) {
    let questionText = '';
    let explanation = '';
    let answer = (oxMatch[1] || oxMatch[2] || oxMatch[3]).toUpperCase();

    lines.forEach(line => {
      if (/^해설\s*:/i.test(line) || /^설명\s*:/i.test(line)) {
        explanation = line.replace(/^해설\s*:\s*|^설명\s*:\s*/i, '').trim();
      } else if (!/^\[OX\]/i.test(line) && !/정답\s*:/i.test(line)) {
        // 질문 문장에서 (O)/(X) 제거
        let cleaned = line.replace(/\((?:O|X)\)|\[(?:O|X)\]/gi, '').replace(/^\d+[\.\)]\s*/, '').trim();
        if (cleaned) {
          questionText += (questionText ? ' ' : '') + cleaned;
        }
      }
    });

    if (!questionText) return null;

    return {
      id: `smart-ox-${Date.now()}-${index}`,
      type: 'ox',
      question: questionText,
      answer: answer,
      explanation: explanation || '해설이 제공되지 않은 문제입니다.',
      tags: ['스마트생성', 'OX']
    };
  }

  function parse5ChoiceBlock(lines, index) {
    let questionText = '';
    let options = [];
    let answerIndex = 0;
    let explanation = '';

    const optionRegex = /^(?:[①②③④⑤]|\d+[\.\)])\s*(.*)$/;

    lines.forEach(line => {
      if (/^\[5지선다\]/i.test(line)) return;

      if (/^정답\s*:/i.test(line) || /^답\s*:/i.test(line)) {
        const ansMatch = line.match(/(?:정답|답)\s*:\s*([1-5|①②③④⑤])/);
        if (ansMatch) {
          const val = ansMatch[1];
          const map = { '①': 0, '②': 1, '③': 2, '④': 3, '⑤': 4, '1': 0, '2': 1, '3': 2, '4': 3, '5': 4 };
          answerIndex = map[val] !== undefined ? map[val] : 0;
        }
      } else if (/^해설\s*:/i.test(line) || /^설명\s*:/i.test(line)) {
        explanation = line.replace(/^(?:해설|설명)\s*:\s*/i, '').trim();
      } else {
        const optMatch = line.match(optionRegex);
        if (optMatch && options.length < 5) {
          options.push(optMatch[1].trim());
        } else if (options.length === 0) {
          let cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
          if (cleaned) questionText += (questionText ? ' ' : '') + cleaned;
        }
      }
    });

    // 5개가 안 채워졌을 경우 보충
    while (options.length < 5) {
      options.push(`선택지 ${options.length + 1}`);
    }

    if (!questionText) return null;

    return {
      id: `smart-5c-${Date.now()}-${index}`,
      type: 'choice5',
      question: questionText,
      options: options.slice(0, 5),
      answerIndex: answerIndex,
      explanation: explanation || '해설이 제공되지 않은 문제입니다.',
      tags: ['스마트생성', '5지선다']
    };
  }

  // ==========================================
  // 12. Manual Question Builder
  // ==========================================
  function saveManualQuestion() {
    const targetDeckId = document.getElementById('builder-target-deck').value;
    const type = document.querySelector('#builder-type-selector .seg-btn.active').dataset.type;
    const qText = document.getElementById('builder-q-text').value.trim();
    const explanation = document.getElementById('builder-explanation').value.trim();
    const tagsRaw = document.getElementById('builder-tags').value.trim();
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : ['사용자추가'];

    if (!qText) {
      showToast('문제 지문을 입력해주세요.', 'warning');
      return;
    }

    const deck = state.decks.find(d => d.id === targetDeckId);
    if (!deck) {
      showToast('대상 문제집을 찾을 수 없습니다.', 'warning');
      return;
    }

    let newQuestion = {
      id: `custom-q-${Date.now()}`,
      type: type,
      question: qText,
      explanation: explanation,
      tags: tags
    };

    if (type === 'ox') {
      const selectedOX = document.querySelector('#builder-ox-val-selector .seg-btn.active').dataset.val;
      newQuestion.answer = selectedOX;
    } else {
      const options = [];
      for (let i = 0; i < 5; i++) {
        const optVal = document.getElementById(`b-opt-${i}`).value.trim() || `선택지 ${i + 1}`;
        options.push(optVal);
      }
      const checkedRadio = document.querySelector('input[name="builder-correct-radio"]:checked');
      const answerIndex = checkedRadio ? parseInt(checkedRadio.value, 10) : 0;

      newQuestion.options = options;
      newQuestion.answerIndex = answerIndex;
    }

    deck.questions.push(newQuestion);
    saveDecks();
    showToast('문제가 문제집에 성공적으로 추가되었습니다!', 'success');

    // 입력 폼 리셋
    document.getElementById('builder-q-text').value = '';
    document.getElementById('builder-explanation').value = '';
    for (let i = 0; i < 5; i++) {
      document.getElementById(`b-opt-${i}`).value = '';
    }

    updateDeckStatusBar();
  }

  function populateCreatorDeckSelect() {
    const select = document.getElementById('builder-target-deck');
    if (!select) return;
    select.innerHTML = '';
    state.decks.forEach(deck => {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = deck.title;
      if (deck.id === state.currentDeckId) opt.selected = true;
      select.appendChild(opt);
    });
  }

  // ==========================================
  // 13. Wrong Answers View
  // ==========================================
  function renderWrongAnswersList(filterType = 'all') {
    const container = document.getElementById('wrong-cards-list');
    if (!container) return;
    container.innerHTML = '';

    let list = state.wrongAnswers;
    if (filterType === 'choice5') {
      list = list.filter(item => item.question.type === 'choice5');
    } else if (filterType === 'ox') {
      list = list.filter(item => item.question.type === 'ox');
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color: var(--text-dim);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
          <h3>오답노트가 비어있습니다!</h3>
          <p>틀린 문제가 없거나 모든 오답을 마스터하셨습니다.</p>
        </div>
      `;
      return;
    }

    list.forEach(item => {
      const q = item.question;
      const card = document.createElement('div');
      card.className = 'wrong-card-item';

      const typeLabel = q.type === 'ox' ? 'OX 퀴즈' : '5지선다';
      let correctDisplay = '';
      if (q.type === 'choice5') {
        const num = ['①', '②', '③', '④', '⑤'][q.answerIndex] || q.answerIndex + 1;
        correctDisplay = `정답: ${num} ${escapeHtml(q.options[q.answerIndex])}`;
      } else {
        correctDisplay = `정답: ${q.answer.toUpperCase() === 'O' ? '⭕ 옳음 (O)' : '❌ 틀림 (X)'}`;
      }

      card.innerHTML = `
        <div class="wrong-item-body">
          <div class="wrong-item-header">
            <span class="q-type-badge ${q.type === 'ox' ? 'ox' : ''}">${typeLabel}</span>
            <span style="font-size:0.8rem; color:var(--text-dim);">${item.wrongCount}회 오답</span>
          </div>
          <div class="wrong-question-text">${escapeHtml(q.question)}</div>
          <div class="wrong-answer-badge">${correctDisplay}</div>
          <div class="wrong-exp-text">💡 ${escapeHtml(q.explanation || '해설 없음')}</div>
        </div>
        <div class="wrong-item-actions">
          <button type="button" class="btn-icon-danger" data-id="${item.questionId}" title="오답노트에서 제거">
            암기 완료 ✓
          </button>
        </div>
      `;

      card.querySelector('.btn-icon-danger').addEventListener('click', (e) => {
        const qId = e.currentTarget.dataset.id;
        state.wrongAnswers = state.wrongAnswers.filter(w => w.questionId !== qId);
        saveWrongs();
        renderWrongAnswersList(filterType);
        showToast('오답노트에서 삭제되었습니다.', 'info');
      });

      container.appendChild(card);
    });
  }

  function startWrongsOnlyPractice() {
    if (state.wrongAnswers.length === 0) {
      showToast('오답노트에 문제가 없습니다.', 'warning');
      return;
    }

    // 오답노트 전용 임시 덱 구성
    const wrongDeck = {
      id: 'deck-temp-wrong',
      title: '❌ 오답노트 완전 정복 훈련',
      category: '오답집중',
      description: '틀린 문제들만 모아 100% 암기될 때까지 반복하는 훈련 팩',
      createdAt: new Date().toISOString().slice(0, 10),
      questions: state.wrongAnswers.map(w => w.question)
    };

    // 덱 추가 또는 덮어쓰기
    state.decks = state.decks.filter(d => d.id !== 'deck-temp-wrong');
    state.decks.unshift(wrongDeck);
    state.currentDeckId = wrongDeck.id;
    state.currentIndex = 0;
    state.userAnswers = {};
    saveDecks();

    showToast('오답노트 문제 풀이를 시작합니다!', 'success');
    switchView('quiz-view');
  }

  // ==========================================
  // 14. Decks Grid & Management
  // ==========================================
  function renderDecksGrid() {
    const grid = document.getElementById('decks-grid');
    if (!grid) return;
    grid.innerHTML = '';

    state.decks.forEach(deck => {
      const card = document.createElement('div');
      card.className = `deck-card ${deck.id === state.currentDeckId ? 'active' : ''}`;

      const c5Count = deck.questions.filter(q => q.type === 'choice5').length;
      const oxCount = deck.questions.filter(q => q.type === 'ox').length;

      card.innerHTML = `
        <div class="deck-card-top">
          <span class="deck-category-tag">${escapeHtml(deck.category || '기본')}</span>
          <h3 class="deck-card-title">${escapeHtml(deck.title)}</h3>
          <p class="deck-card-desc">${escapeHtml(deck.description || '')}</p>
        </div>
        <div class="deck-card-bottom">
          <span class="deck-counts-text">총 ${deck.questions.length}문항 (5지선다 ${c5Count} / OX ${oxCount})</span>
          <button type="button" class="btn-primary" data-deck-id="${deck.id}">
            ${deck.id === state.currentDeckId ? '학습 중 🎯' : '선택하기'}
          </button>
        </div>
      `;

      card.querySelector('button').addEventListener('click', () => {
        state.currentDeckId = deck.id;
        state.currentIndex = 0;
        state.userAnswers = {};
        localStorage.setItem(STORAGE_KEYS.ACTIVE_DECK, deck.id);
        updateDeckStatusBar();
        switchView('quiz-view');
        showToast(`'${deck.title}' 문제집이 선택되었습니다.`, 'info');
      });

      grid.appendChild(card);
    });
  }

  function renderDeckSelectModal() {
    const listContainer = document.getElementById('select-deck-modal-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    state.decks.forEach(deck => {
      const item = document.createElement('div');
      item.className = `select-deck-item ${deck.id === state.currentDeckId ? 'selected' : ''}`;
      item.innerHTML = `
        <div>
          <div style="font-weight:700;">${escapeHtml(deck.title)}</div>
          <div style="font-size:0.8rem; color:var(--text-dim);">총 ${deck.questions.length}문항 · ${escapeHtml(deck.category || '')}</div>
        </div>
        <span>${deck.id === state.currentDeckId ? '✓ 선택됨' : '선택'}</span>
      `;

      item.addEventListener('click', () => {
        state.currentDeckId = deck.id;
        state.currentIndex = 0;
        state.userAnswers = {};
        localStorage.setItem(STORAGE_KEYS.ACTIVE_DECK, deck.id);
        updateDeckStatusBar();
        document.getElementById('modal-select-deck').classList.add('hidden');
        applyFilterAndRenderQuiz();
      });

      listContainer.appendChild(item);
    });
  }

  // ==========================================
  // 15. Stats Dashboard View
  // ==========================================
  function renderStatsView() {
    const total = state.stats.totalSolved;
    const correct = state.stats.totalCorrect;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    document.getElementById('kpi-total-solved').textContent = `${total}회`;
    document.getElementById('kpi-accuracy').textContent = `${accuracy}%`;
    document.getElementById('kpi-max-streak').textContent = `${state.stats.maxStreak}연속`;
    document.getElementById('kpi-wrong-count').textContent = `${state.wrongAnswers.length}개`;

    // 5지선다 통계
    const c5Solved = state.stats.choice5Solved;
    const c5Correct = state.stats.choice5Correct;
    const c5Acc = c5Solved > 0 ? Math.round((c5Correct / c5Solved) * 100) : 0;
    document.getElementById('stat-choice5-text').textContent = `${c5Correct} / ${c5Solved} (${c5Acc}%)`;
    document.getElementById('stat-choice5-bar').style.width = `${c5Acc}%`;

    // OX 통계
    const oxSolved = state.stats.oxSolved;
    const oxCorrect = state.stats.oxCorrect;
    const oxAcc = oxSolved > 0 ? Math.round((oxCorrect / oxSolved) * 100) : 0;
    document.getElementById('stat-ox-text').textContent = `${oxCorrect} / ${oxSolved} (${oxAcc}%)`;
    document.getElementById('stat-ox-bar').style.width = `${oxAcc}%`;
  }

  // ==========================================
  // 16. JSON Export / Import
  // ==========================================
  function exportDecksToJSON() {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      decks: state.decks
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MemoryQ_Decks_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('문제집 파일이 다운로드되었습니다.', 'success');
  }

  function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const importedDecks = parsed.decks || (Array.isArray(parsed) ? parsed : null);
        if (!importedDecks || !Array.isArray(importedDecks)) {
          throw new Error('올바르지 않은 문제집 JSON 파일입니다.');
        }

        // 기존 덱과 병합 (ID 중복 처리)
        importedDecks.forEach(newD => {
          if (!newD.id) newD.id = 'imported-' + Date.now() + Math.random().toString(36).substr(2, 4);
          state.decks.push(newD);
        });

        saveDecks();
        renderDecksGrid();
        showToast(`${importedDecks.length}개 문제집을 성공적으로 가져왔습니다!`, 'success');
      } catch (err) {
        showToast('파일을 가져오는 중 오류가 발생했습니다: ' + err.message, 'warning');
      }
    };
    reader.readAsText(file);
  }

  // ==========================================
  // 17. Exam Timer Logic
  // ==========================================
  function startExamMode() {
    state.currentMode = 'exam';
    const timerBar = document.getElementById('exam-timer-bar');
    timerBar.classList.remove('hidden');

    const total = state.filteredQuestions.length;
    // 문항당 1분 배정 (기본 최소 5분)
    state.exam.timerSeconds = Math.max(300, total * 60);

    clearInterval(state.exam.intervalId);
    state.exam.intervalId = setInterval(updateExamTimer, 1000);
    updateExamTimer();

    document.getElementById('exam-total-count').textContent = total;
    updateExamAnsweredCount();
  }

  function stopExamMode() {
    clearInterval(state.exam.intervalId);
    document.getElementById('exam-timer-bar').classList.add('hidden');
  }

  function updateExamTimer() {
    if (state.exam.timerSeconds <= 0) {
      clearInterval(state.exam.intervalId);
      showToast('시험 시간이 종료되었습니다! 답안을 채점합니다.', 'warning');
      showQuizSummary();
      return;
    }
    state.exam.timerSeconds--;
    const mins = Math.floor(state.exam.timerSeconds / 60);
    const secs = state.exam.timerSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('timer-text').textContent = formatted;
  }

  function updateExamAnsweredCount() {
    const answeredCount = Object.keys(state.userAnswers).length;
    document.getElementById('exam-answered-count').textContent = answeredCount;
  }

  // ==========================================
  // 18. Helper Utilities
  // ==========================================
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ==========================================
  // 19. Event Listeners Setup
  // ==========================================
  function initEventListeners() {
    // 1. Navigation Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const viewId = e.currentTarget.dataset.view;
        switchView(viewId);
      });
    });

    document.getElementById('btn-logo-home')?.addEventListener('click', () => switchView('quiz-view'));

    // 2. Sound & Theme Toggle
    document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem(STORAGE_KEYS.SOUND, state.soundEnabled);
      document.getElementById('sound-icon').textContent = state.soundEnabled ? '🔊' : '🔇';
      showToast(`효과음: ${state.soundEnabled ? '켜짐' : '꺼짐'}`);
    });

    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
      const isDark = document.body.classList.contains('theme-dark');
      setTheme(isDark ? 'light' : 'dark');
    });

    // 3. Instant Feedback Toggle
    document.getElementById('chk-instant-feedback')?.addEventListener('change', (e) => {
      state.instantFeedback = e.target.checked;
      localStorage.setItem(STORAGE_KEYS.INSTANT_FEEDBACK, state.instantFeedback);
      renderCurrentQuestion();
    });

    // 4. Deck Selection Modal
    document.getElementById('btn-open-deck-modal')?.addEventListener('click', () => {
      renderDeckSelectModal();
      document.getElementById('modal-select-deck').classList.remove('hidden');
    });
    document.getElementById('btn-close-select-deck-modal')?.addEventListener('click', () => {
      document.getElementById('modal-select-deck').classList.add('hidden');
    });

    // 5. Quiz Filter (전체 / 5지 / OX / 북마크)
    document.querySelectorAll('#quiz-type-filter .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#quiz-type-filter .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.currentFilter = e.currentTarget.dataset.filter;
        state.currentIndex = 0;
        applyFilterAndRenderQuiz();
      });
    });

    // 6. Study Modes (연습 / 플래시카드 / 실전 시험)
    document.getElementById('btn-mode-standard')?.addEventListener('click', (e) => {
      document.querySelectorAll('.study-mode-group .mode-pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      stopExamMode();
      state.currentMode = 'standard';
      renderCurrentQuestion();
    });

    document.getElementById('btn-mode-flashcard')?.addEventListener('click', (e) => {
      document.querySelectorAll('.study-mode-group .mode-pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      stopExamMode();
      state.currentMode = 'flashcard';
      renderCurrentQuestion();
    });

    document.getElementById('btn-mode-exam')?.addEventListener('click', (e) => {
      document.querySelectorAll('.study-mode-group .mode-pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      startExamMode();
      renderCurrentQuestion();
    });

    document.getElementById('btn-mode-paper')?.addEventListener('click', (e) => {
      document.querySelectorAll('.study-mode-group .mode-pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      stopExamMode();
      state.currentMode = 'paper';
      document.getElementById('standard-quiz-container').classList.add('hidden');
      document.getElementById('flashcard-container').classList.add('hidden');
      document.getElementById('paper-view-container').classList.remove('hidden');
      renderPaperView();
      playSound('flip');
    });

    document.getElementById('btn-close-paper-mode')?.addEventListener('click', () => {
      document.getElementById('btn-mode-standard')?.click();
    });

    document.getElementById('btn-print-paper')?.addEventListener('click', () => {
      window.print();
    });

    let answersShown = false;
    document.getElementById('btn-toggle-paper-answers')?.addEventListener('click', (e) => {
      answersShown = !answersShown;
      document.querySelectorAll('.paper-answer-box').forEach(box => {
        box.classList.toggle('hidden', !answersShown);
      });
      e.currentTarget.textContent = answersShown ? '🔒 정답/해설 숨기기' : '🔑 정답/해설 보이기';
    });

    document.getElementById('btn-finish-exam')?.addEventListener('click', () => {
      stopExamMode();
      showQuizSummary();
    });

    // 7. Navigation Controls (Next / Prev / Shuffle / Star)
    document.getElementById('btn-prev-q')?.addEventListener('click', () => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
        renderCurrentQuestion();
        playSound('click');
      }
    });

    document.getElementById('btn-next-q')?.addEventListener('click', () => {
      if (state.currentIndex < state.filteredQuestions.length - 1) {
        state.currentIndex++;
        renderCurrentQuestion();
        playSound('click');
      } else {
        showQuizSummary();
      }
    });

    document.getElementById('btn-shuffle-questions')?.addEventListener('click', () => {
      shuffleArray(state.filteredQuestions);
      state.currentIndex = 0;
      renderCurrentQuestion();
      showToast('문제가 무작위로 섞였습니다! 🔀', 'info');
      playSound('flip');
    });

    document.getElementById('btn-toggle-star')?.addEventListener('click', () => {
      const q = state.filteredQuestions[state.currentIndex];
      if (!q) return;

      if (state.starredIds.has(q.id)) {
        state.starredIds.delete(q.id);
        showToast('북마크가 해제되었습니다.', 'info');
      } else {
        state.starredIds.add(q.id);
        showToast('중요 문제로 북마크되었습니다! ⭐', 'success');
        playSound('click');
      }
      saveStarred();
      renderCurrentQuestion();
    });

    // 8. OX Buttons
    document.getElementById('btn-ox-o')?.addEventListener('click', () => handleOXSelect('O'));
    document.getElementById('btn-ox-x')?.addEventListener('click', () => handleOXSelect('X'));

    // 9. Flashcard Interactions
    document.getElementById('flashcard-3d')?.addEventListener('click', toggleFlashcardFlip);
    document.getElementById('btn-flip-card')?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFlashcardFlip();
    });

    document.getElementById('btn-fc-prev')?.addEventListener('click', () => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
        renderCurrentQuestion();
      }
    });
    document.getElementById('btn-fc-next')?.addEventListener('click', () => {
      if (state.currentIndex < state.filteredQuestions.length - 1) {
        state.currentIndex++;
        renderCurrentQuestion();
      } else {
        showQuizSummary();
      }
    });

    document.getElementById('btn-rate-hard')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = state.filteredQuestions[state.currentIndex];
      addToWrongAnswers(q);
      showToast('오답노트에 등록되었습니다. 복습이 필요합니다!', 'warning');
      if (state.currentIndex < state.filteredQuestions.length - 1) {
        state.currentIndex++;
        renderCurrentQuestion();
      }
    });

    document.getElementById('btn-rate-easy')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('완벽 암기 체크 완료! ✨', 'success');
      launchConfetti(25);
      if (state.currentIndex < state.filteredQuestions.length - 1) {
        state.currentIndex++;
        renderCurrentQuestion();
      } else {
        showQuizSummary();
      }
    });

    // 10. Summary Modal Buttons
    document.getElementById('btn-restart-quiz')?.addEventListener('click', () => {
      state.currentIndex = 0;
      state.userAnswers = {};
      applyFilterAndRenderQuiz();
    });

    document.getElementById('btn-review-wrongs-only')?.addEventListener('click', () => {
      startWrongsOnlyPractice();
    });

    document.getElementById('btn-go-to-decks')?.addEventListener('click', () => {
      switchView('decks-view');
    });

    // 11. Creator Tabs
    document.querySelectorAll('#creator-tab-pills .tab-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#creator-tab-pills .tab-pill-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.creator-tab-panel').forEach(p => p.classList.add('hidden'));

        e.currentTarget.classList.add('active');
        const targetPanel = document.getElementById(e.currentTarget.dataset.tab);
        if (targetPanel) targetPanel.classList.remove('hidden');
      });
    });

    // 12. Smart Parser Actions
    document.getElementById('btn-run-smart-parser')?.addEventListener('click', runSmartTextParser);
    document.getElementById('btn-insert-sample-text')?.addEventListener('click', () => {
      document.getElementById('parser-input-text').value = `[OX]
1. 세종대왕은 1443년에 훈민정음을 창제했다. (O)
해설: 1443년 창제하고 1446년에 훈민정음 해례본과 함께 반포하였습니다.

2. 대한민국의 수도는 부산광역시이다. (X)
해설: 헌법상 관습헌법 및 수도는 서울특별시입니다.

3. 빛의 속도는 진공 상태에서 대략 초속 30만 km이다. (O)
해설: 진공 중 빛의 속도는 약 299,792,458 m/s 입니다.

[5지선다]
1. 다음 중 조선의 4대 사화에 해당하지 않는 것은?
① 무오사화
② 갑자사화
③ 기묘사화
④ 을사사화
⑤ 정묘사화
정답: 5
해설: 조선 4대 사화는 연산군~명종 연간의 무오, 갑자, 기묘, 을사사화입니다. 정묘호란과 혼동하지 마세요!

2. 태양계 행성 중 태양에서 가장 가까운 행성은?
① 금성
② 수성
③ 지구
④ 화성
⑤ 목성
정답: 2
해설: 태양계 행성 순서는 수성 - 금성 - 지구 - 화성 - 목성 - 토성 - 천왕성 - 해왕성 순입니다.`;
      showToast('예시 양식이 입력창에 채워졌습니다.', 'info');
    });
    document.getElementById('btn-clear-parser-text')?.addEventListener('click', () => {
      document.getElementById('parser-input-text').value = '';
    });

    // 13. Manual Builder Question Type Toggle
    document.querySelectorAll('#builder-type-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#builder-type-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const type = e.currentTarget.dataset.type;

        if (type === 'ox') {
          document.getElementById('builder-ox-section').classList.remove('hidden');
          document.getElementById('builder-choice5-section').classList.add('hidden');
        } else {
          document.getElementById('builder-ox-section').classList.add('hidden');
          document.getElementById('builder-choice5-section').classList.remove('hidden');
        }
      });
    });

    document.querySelectorAll('#builder-ox-val-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#builder-ox-val-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    document.getElementById('btn-save-manual-question')?.addEventListener('click', saveManualQuestion);

    // 14. AI Prompt Copy
    document.getElementById('btn-copy-ai-prompt')?.addEventListener('click', () => {
      const text = document.getElementById('ai-prompt-content').textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('AI 프롬프트가 클립보드에 복사되었습니다! 📋', 'success');
      });
    });

    // 15. Wrong Answers Page Controls
    document.getElementById('btn-practice-wrongs')?.addEventListener('click', startWrongsOnlyPractice);
    document.getElementById('btn-clear-wrongs')?.addEventListener('click', () => {
      if (confirm('오답노트 기록을 전부 비우시겠습니까?')) {
        state.wrongAnswers = [];
        saveWrongs();
        renderWrongAnswersList();
        showToast('오답노트가 초기화되었습니다.', 'info');
      }
    });

    document.querySelectorAll('#wrong-type-filter .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#wrong-type-filter .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderWrongAnswersList(e.currentTarget.dataset.filter);
      });
    });

    // 16. JSON Export / Import
    document.getElementById('btn-export-decks')?.addEventListener('click', exportDecksToJSON);
    document.getElementById('btn-import-decks-trigger')?.addEventListener('click', () => {
      document.getElementById('file-import-decks').click();
    });
    document.getElementById('file-import-decks')?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImportFile(e.target.files[0]);
      }
    });

    // 17. New Deck Modal
    const modalNewDeck = document.getElementById('modal-new-deck');
    const openNewDeckModal = () => {
      document.getElementById('new-deck-title-input').value = '';
      document.getElementById('new-deck-category-input').value = '';
      document.getElementById('new-deck-desc-input').value = '';
      modalNewDeck.classList.remove('hidden');
    };
    document.getElementById('btn-quick-new-deck')?.addEventListener('click', openNewDeckModal);
    document.getElementById('btn-create-deck-modal')?.addEventListener('click', openNewDeckModal);
    document.getElementById('btn-close-deck-modal')?.addEventListener('click', () => modalNewDeck.classList.add('hidden'));
    document.getElementById('btn-cancel-new-deck')?.addEventListener('click', () => modalNewDeck.classList.add('hidden'));

    document.getElementById('btn-confirm-new-deck')?.addEventListener('click', () => {
      const title = document.getElementById('new-deck-title-input').value.trim();
      const cat = document.getElementById('new-deck-category-input').value.trim() || '일반';
      const desc = document.getElementById('new-deck-desc-input').value.trim();

      if (!title) {
        showToast('문제집 이름을 입력해주세요.', 'warning');
        return;
      }

      const newDeck = {
        id: 'deck-' + Date.now(),
        title: title,
        category: cat,
        description: desc,
        createdAt: new Date().toISOString().slice(0, 10),
        questions: []
      };

      state.decks.unshift(newDeck);
      state.currentDeckId = newDeck.id;
      saveDecks();
      modalNewDeck.classList.add('hidden');
      updateDeckStatusBar();
      switchView('creator-view');
      showToast(`'${title}' 문제집이 생성되었습니다! 문제를 추가해보세요.`, 'success');
    });

    // 18. Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // 입력 폼에 포커스가 있는 경우 키 이벤트 무시
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      const q = state.filteredQuestions[state.currentIndex];
      if (!q) return;

      if (state.currentMode === 'flashcard') {
        if (e.code === 'Space') {
          e.preventDefault();
          toggleFlashcardFlip();
        } else if (e.code === 'ArrowRight') {
          document.getElementById('btn-fc-next')?.click();
        } else if (e.code === 'ArrowLeft') {
          document.getElementById('btn-fc-prev')?.click();
        }
        return;
      }

      // 5지선다 숫자키 (1 ~ 5)
      if (q.type === 'choice5') {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= 5) {
          const btn = document.querySelector(`.choice5-option-btn[data-index="${keyNum - 1}"]`);
          if (btn && !btn.disabled) {
            btn.click();
          }
        }
      }

      // OX 키 (O, X, 1, 2)
      if (q.type === 'ox') {
        if (e.key === 'o' || e.key === 'O' || e.key === '1') {
          document.getElementById('btn-ox-o')?.click();
        } else if (e.key === 'x' || e.key === 'X' || e.key === '2') {
          document.getElementById('btn-ox-x')?.click();
        }
      }

      // 다음/이전 문제 이동 단축키
      if (e.key === 'Enter') {
        document.getElementById('btn-next-q')?.click();
      } else if (e.key === 'ArrowRight') {
        document.getElementById('btn-next-q')?.click();
      } else if (e.key === 'ArrowLeft') {
        document.getElementById('btn-prev-q')?.click();
      }
    });
  }

  // ==========================================
  // 20. Application Bootstrap
  // ==========================================
  function init() {
    loadFromStorage();
    initEventListeners();
    updateDeckStatusBar();
    updateWrongBadge();
    applyFilterAndRenderQuiz();
  }

  // DOM 로드 완료 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
