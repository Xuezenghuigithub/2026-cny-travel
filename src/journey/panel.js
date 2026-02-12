function formatKm(value) {
  return `${Math.round(value)} km`;
}

function weatherByMood(mood) {
  if (mood === 'coast' || mood === 'urban-sea') return '海风微潮';
  if (mood === 'mountain') return '山风微凉';
  if (mood === 'wind') return '沿海阵风';
  if (mood === 'return') return '返程晴间阴';
  return '晴朗';
}

function findCurrentStop(model, dayIndex) {
  return model.tripPlan.stops[Math.min(dayIndex + 1, model.tripPlan.stops.length - 1)]?.name || '--';
}

export function createPanelRenderer({ model, store, engine }) {
  const hudDay = document.getElementById('hudDay');
  const hudKm = document.getElementById('hudKm');
  const hudWeather = document.getElementById('hudWeather');

  const missionTitle = document.getElementById('missionTitle');
  const missionSub = document.getElementById('missionSub');
  const routeProgressFill = document.getElementById('routeProgressFill');
  const routeProgressText = document.getElementById('routeProgressText');

  const timeline = document.getElementById('timeline');
  const focus = document.getElementById('focusText');
  const food = document.getElementById('foodList');
  const hotelName = document.getElementById('hotelName');
  const hotelLink = document.getElementById('hotelLink');
  const backup = document.getElementById('backupText');
  const cityBadge = document.getElementById('cityBadge');

  const autoBtn = document.getElementById('autoBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const speedBtn = document.getElementById('speedBtn');
  const quickBtn = document.getElementById('quickBtn');
  const quickPanel = document.getElementById('quickPanel');
  const quickCloseBtn = document.getElementById('quickCloseBtn');

  function jumpToDay(dayId) {
    const segment = model.segments.find((item) => item.dayId === dayId);
    if (!segment) return;
    engine.resetToKm(segment.endKm);
    if (quickPanel) {
      quickPanel.classList.remove('is-open');
      quickPanel.setAttribute('aria-hidden', 'true');
    }
  }

  function toggleQuickPanel(open) {
    if (!quickPanel) return;
    const willOpen = typeof open === 'boolean' ? open : !quickPanel.classList.contains('is-open');
    quickPanel.classList.toggle('is-open', willOpen);
    quickPanel.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
  }

  function renderTimeline(dayIndex, segmentProgress) {
    const rows = model.getTimeline(dayIndex, segmentProgress);
    timeline.innerHTML = rows
      .map(
        (row) => `
      <li class="timeline-item is-${row.status}">
        <span class="time">${row.time}</span>
        <span class="label">${row.label}</span>
      </li>
    `
      )
      .join('');
  }

  autoBtn.addEventListener('click', () => engine.setAuto(true));
  pauseBtn.addEventListener('click', () => engine.setAuto(false));
  speedBtn.addEventListener('click', () => {
    const current = store.getState().speedMultiplier;
    const next = current >= 2 ? 1 : current + 0.5;
    engine.setSpeedMultiplier(next);
  });
  if (quickBtn) {
    quickBtn.addEventListener('click', () => toggleQuickPanel());
  }
  if (quickCloseBtn) {
    quickCloseBtn.addEventListener('click', () => toggleQuickPanel(false));
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-day-jump]');
    if (!trigger) return;
    jumpToDay(Number(trigger.dataset.dayJump));
  });

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      engine.toggleAuto();
    }
    if (event.code === 'ArrowLeft') engine.nudgeKm(-15);
    if (event.code === 'ArrowRight') engine.nudgeKm(15);
    if (event.code === 'ArrowUp') engine.setSpeedMultiplier(Math.min(store.getState().speedMultiplier + 0.5, 3));
    if (event.code === 'ArrowDown') engine.setSpeedMultiplier(Math.max(store.getState().speedMultiplier - 0.5, 0.5));
    if (event.code === 'KeyQ') {
      event.preventDefault();
      toggleQuickPanel();
    }
    if (event.code === 'Escape') {
      toggleQuickPanel(false);
    }
    if (/^Digit[1-9]$/.test(event.code)) {
      const dayId = Number(event.code.slice(-1));
      if (dayId <= model.tripPlan.days.length) {
        event.preventDefault();
        jumpToDay(dayId);
      }
    }
  });

  const unsubscribe = store.subscribe((state) => {
    const day = model.tripPlan.days[state.dayIndex] || model.tripPlan.days[0];
    const segment = model.getSegmentByKm(state.km);

    hudDay.textContent = `DAY ${day.id} · ${day.festival}`;
    hudKm.textContent = formatKm(state.km);
    hudWeather.textContent = weatherByMood(day.mood);

    missionTitle.textContent = day.title;
    missionSub.textContent = `${day.date} | ${day.lunar} | ${day.element}`;
    routeProgressFill.style.width = `${Math.round(state.progress * 100)}%`;
    routeProgressText.textContent = `${Math.round(state.progress * 100)}%`;

    renderTimeline(state.dayIndex, state.segmentProgress);

    focus.textContent = day.focus;
    food.innerHTML = day.food.map((item) => `<li>${item}</li>`).join('');
    if (hotelName) hotelName.textContent = day.sleep;
    if (hotelLink) {
      const keyword = encodeURIComponent(`${day.sleep} 酒店`);
      hotelLink.href = `https://uri.amap.com/search?keyword=${keyword}`;
    }
    backup.textContent = `备选: ${day.backup}`;
    cityBadge.textContent = `${findCurrentStop(model, state.dayIndex)} · 本段 ${segment.distanceKm}km`;

    autoBtn.classList.toggle('is-active', state.auto && state.mode !== 'arrived');
    pauseBtn.classList.toggle('is-active', !state.auto && state.mode !== 'arrived');
    speedBtn.textContent = `x${state.speedMultiplier.toFixed(1)}`;

    document.body.dataset.mood = day.mood;

    if (state.mode === 'arrived') {
      missionTitle.textContent = '平安返沪 · 计划回放完成';
      missionSub.textContent = '你的一次春节沿海线规划演示已完成。';
      cityBadge.textContent = '终点：上海';
    }
  });

  return {
    destroy() {
      unsubscribe();
    }
  };
}
