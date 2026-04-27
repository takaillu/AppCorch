const Storage = {
  get(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

const App = (() => {
  let selectedMaxShots = Storage.get('maxShots', 20);

  let state = {
    levelKey: null,
    currentYard: null,
    shots: 0,
    maxShots: 20,
    history: [],
    practiceYards: new Set(),
    practiceStart: null,
    paused: false,
    timerSec: 30
  };

  const el = {
    screens: {
      level: document.getElementById('screen-level'),
      practice: document.getElementById('screen-practice'),
      summary: document.getElementById('screen-summary')
    },
    levelBtns: document.querySelectorAll('.level-btn'),
    shotsBtns: document.querySelectorAll('.shots-btn'),
    levelBadge: document.getElementById('level-badge'),
    shotCount: document.getElementById('shot-count'),
    yardNumber: document.getElementById('yard-number'),
    yardDisplay: document.getElementById('yard-display'),
    progressBar: document.getElementById('progress-bar'),
    timerDuration: document.getElementById('timer-duration'),
    timerMinus: document.getElementById('timer-minus'),
    timerPlus: document.getElementById('timer-plus'),
    historyList: document.getElementById('history-list'),
    btnPause: document.getElementById('btn-pause'),
    btnNext: document.getElementById('btn-next'),
    btnEnd: document.getElementById('btn-end'),
    summaryShots: document.getElementById('summary-shots'),
    summaryTime: document.getElementById('summary-time'),
    summaryYards: document.getElementById('summary-yards'),
    btnRestart: document.getElementById('btn-restart')
  };

  const timer = new Timer({
    onTick(progress) {
      el.progressBar.style.transform = `scaleX(${progress})`;
    },
    onComplete() {
      Beep.playLong();
      advance();
    },
    onCountdown() {
      Beep.play();
    }
  });

  function showScreen(name) {
    Object.entries(el.screens).forEach(([k, s]) => {
      s.classList.toggle('active', k === name);
    });
  }

  function pickYard() {
    const level = LEVELS[state.levelKey];
    const yards = level.yards;
    if (yards.length === 1) return yards[0];
    let next;
    do {
      next = yards[Math.floor(Math.random() * yards.length)];
    } while (next === state.currentYard);
    return next;
  }

  function flashYard(newYard) {
    el.yardDisplay.classList.add('flash-out');
    setTimeout(() => {
      el.yardNumber.textContent = newYard;
      el.yardDisplay.classList.remove('flash-out');
    }, 75);
  }

  function setYard(yard, announce = true) {
    state.currentYard = yard;
    state.practiceYards.add(yard);
    flashYard(yard);
    if (announce) Speech.speak(`${yard}ヤード`);
  }

  function advance() {
    state.shots++;
    state.history.unshift(state.currentYard);
    if (state.history.length > 10) state.history.pop();
    updateShotCount();
    updateHistory();

    if (state.maxShots > 0 && state.shots >= state.maxShots) {
      endPractice();
      return;
    }

    const yard = pickYard();
    setYard(yard);
    timer.reset();
    if (!state.paused) timer.start();
  }

  function updateShotCount() {
    el.shotCount.textContent = `${state.shots}ショット`;
  }

  function updateHistory() {
    el.historyList.innerHTML = state.history
      .map(y => `<li class="history-item">${y}<span class="history-unit">Y</span></li>`)
      .join('');
  }

  function updateTimerLabel() {
    el.timerDuration.textContent = `${state.timerSec}秒`;
  }

  function updateLevelStyle() {
    const level = LEVELS[state.levelKey];
    const color = level.color;
    document.documentElement.style.setProperty('--level-color', color);
    el.levelBadge.textContent = level.name;
    el.levelBadge.style.background = color;
  }

  function startPractice(levelKey) {
    state = {
      levelKey,
      currentYard: null,
      shots: 0,
      maxShots: selectedMaxShots,
      history: [],
      practiceYards: new Set(),
      practiceStart: Date.now(),
      paused: false,
      timerSec: Storage.get('timerSec', 30)
    };

    timer.setDuration(state.timerSec);
    updateTimerLabel();
    updateLevelStyle();
    updateShotCount();
    updateHistory();
    setPauseLabel(false);

    showScreen('practice');

    const yard = pickYard();
    setYard(yard);
    timer.reset();
    timer.start();
  }

  function setPauseLabel(paused) {
    el.btnPause.textContent = paused ? '▶ 再開' : '⏸ ポーズ';
  }

  function endPractice() {
    timer.reset();
    const elapsed = Math.round((Date.now() - state.practiceStart) / 60000);
    el.summaryShots.textContent = state.shots;
    el.summaryTime.textContent = elapsed < 1 ? '1未満' : elapsed;

    const sorted = [...state.practiceYards].sort((a, b) => a - b);
    el.summaryYards.innerHTML = sorted
      .map(y => `<span class="yard-chip">${y}Y</span>`)
      .join('');

    showScreen('summary');
  }

  function updateShotsBtns() {
    el.shotsBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.shots, 10) === selectedMaxShots);
    });
  }

  function bindEvents() {
    el.levelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        Speech.unlock();
        Beep.unlock();
        startPractice(btn.dataset.level);
      });
    });

    el.shotsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedMaxShots = parseInt(btn.dataset.shots, 10);
        Storage.set('maxShots', selectedMaxShots);
        updateShotsBtns();
      });
    });

    el.btnPause.addEventListener('click', () => {
      if (!state.paused) {
        timer.pause();
        state.paused = true;
        setPauseLabel(true);
      } else {
        timer.resume();
        state.paused = false;
        setPauseLabel(false);
      }
    });

    el.btnNext.addEventListener('click', () => {
      if (state.paused) {
        state.paused = false;
        setPauseLabel(false);
      }
      advance();
    });

    el.btnEnd.addEventListener('click', () => {
      endPractice();
    });

    el.timerMinus.addEventListener('click', () => {
      if (state.timerSec <= 10) return;
      state.timerSec -= 5;
      Storage.set('timerSec', state.timerSec);
      timer.setDuration(state.timerSec);
      updateTimerLabel();
      if (!state.paused) {
        timer.reset();
        timer.start();
      }
    });

    el.timerPlus.addEventListener('click', () => {
      if (state.timerSec >= 60) return;
      state.timerSec += 5;
      Storage.set('timerSec', state.timerSec);
      timer.setDuration(state.timerSec);
      updateTimerLabel();
      if (!state.paused) {
        timer.reset();
        timer.start();
      }
    });

    el.btnRestart.addEventListener('click', () => {
      showScreen('level');
    });
  }

  function init() {
    bindEvents();
    updateShotsBtns();
    showScreen('level');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
