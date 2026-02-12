import './style.css';
import bgmUrl from './static/new_year.mp3';
import { tripPlan } from './plan.js';
import { createJourneyModel } from './journey/model.js';
import { createStore } from './journey/state.js';
import { createJourneyEngine } from './journey/engine.js';
import { createStageCanvas } from './journey/stage-canvas.js';
import { createPanelRenderer } from './journey/panel.js';

const app = document.querySelector('#app');
const quickItemsHtml = tripPlan.days
  .map((day) => {
    const highlights = day.schedule.slice(0, 3).map((item) => `<li>${item}</li>`).join('');
    return `
      <article class="quick-item" data-day="${day.id}">
        <button class="quick-jump" data-day-jump="${day.id}" type="button">DAY ${day.id}</button>
        <div>
          <h4>${day.title}</h4>
          <p>${day.date} · ${day.festival}</p>
          <ul>${highlights}</ul>
        </div>
      </article>
    `;
  })
  .join('');

app.innerHTML = `
  <canvas id="bgFireworks" class="bg-fireworks" aria-hidden="true"></canvas>
  <div class="arcade-shell">
    <header class="top-band">
      <div>
        <h1>${tripPlan.title}</h1>
      </div>
      <div class="chip-row">
        <span class="chip" id="hudDay">DAY 1</span>
        <span class="chip" id="hudKm">0 km</span>
        <span class="chip" id="hudWeather">晴</span>
        <span class="chip">春节 ${tripPlan.springFestivalDate}</span>
      </div>
    </header>

    <main class="main-grid">
      <section class="drive-stage">
        <canvas id="driveCanvas" aria-label="Journey driving stage"></canvas>
        <button id="mobilePlayBtn" class="mobile-play-btn" type="button">播放旅程</button>
        <div class="stage-overlay">
          <span class="badge" id="cityBadge">下一站 --</span>
          <div class="route-progress"><i id="routeProgressFill"></i></div>
          <span class="route-pct" id="routeProgressText">0%</span>
        </div>
      </section>

      <aside class="mission-panel">
        <section class="paper intro-card">
          <p class="panel-kicker">PLAN VIEW</p>
          <h2 id="missionTitle">加载中...</h2>
          <p class="mission-sub" id="missionSub"></p>
        </section>

        <section class="paper map-card">
          <p class="panel-kicker">MAP OVERVIEW</p>
          <div class="map-shell" id="miniMap" role="img" aria-label="高德地图行程总览"></div>
          <p class="map-note" id="mapHint"></p>
        </section>

        <section class="paper crew-timeline">
          <article>
            <h3>发福小队</h3>
            <div class="cabin-scene" aria-label="车内四人座位动画平面视图">
              <div class="dash-top"></div>
              <div class="cabin-seat seat-driver">
                <div class="chibi yawn">
                  <i class="head"></i>
                  <i class="body"></i>
                  <i class="arm arm-l"></i>
                  <i class="arm arm-r"></i>
                  <i class="bubble"></i>
                </div>
                <p>青菜</p>
              </div>
              <div class="cabin-seat seat-passenger">
                <div class="chibi map">
                  <i class="head"></i>
                  <i class="body"></i>
                  <i class="prop"></i>
                </div>
                <p>小居</p>
              </div>
              <div class="cabin-seat seat-rear-left">
                <div class="chibi camera">
                  <i class="head"></i>
                  <i class="body"></i>
                  <i class="prop"></i>
                </div>
                <p>静静</p>
              </div>
              <div class="cabin-seat seat-rear-right">
                <div class="chibi wave">
                  <i class="head"></i>
                  <i class="body"></i>
                  <i class="arm arm-r"></i>
                </div>
                <p>Zander</p>
              </div>
            </div>
          </article>
          <article>
            <h3>当日时间线</h3>
            <ol class="timeline" id="timeline"></ol>
          </article>
        </section>

        <section class="paper dual">
          <article>
            <h3>吃啥</h3>
            <ul id="foodList"></ul>
            <div class="split-line" aria-hidden="true"></div>
            <h3>住哪</h3>
            <div class="hotel-row">
              <a id="hotelLink" class="hotel-link" href="#" target="_blank" rel="noopener noreferrer"></a>
            </div>
          </article>
          <article>
            <h3>今日策略</h3>
            <p id="focusText"></p>
            <p class="muted" id="backupText"></p>
          </article>
        </section>
      </aside>
    </main>

    <footer class="controls">
      <button id="autoBtn" class="ctl is-active">连续播放</button>
      <button id="pauseBtn" class="ctl">暂停</button>
      <button id="speedBtn" class="ctl">x1.0</button>
      <button id="quickBtn" class="ctl">快速查看</button>
      <button id="musicBtn" class="ctl music-btn">音乐: 启动中</button>
      <span class="hint">Space 播放/暂停 · 数字键 1-9 直达天数 · Q 快速查看</span>
      <span class="copyright">
        © 2026
        <a href="https://xuezenghui.com" target="_blank" rel="noopener noreferrer">Zander Xue</a>
      </span>
    </footer>
  </div>

  <aside class="quick-panel" id="quickPanel" aria-hidden="true">
    <header>
      <h3>每日活动速览</h3>
      <button id="quickCloseBtn" class="quick-close" type="button">关闭</button>
    </header>
    <div class="quick-list">
      ${quickItemsHtml}
    </div>
  </aside>
`;

function toLngLat([lat, lng]) {
  return [lng, lat];
}

function initCrewCatchphrases() {
  const phrases = {
    'seat-driver': ['不用不用，我还能开', '你放屁'],
    'seat-passenger': ['不知丢走不走线', '哈哈哈'],
    'seat-rear-left': ['你们看，我都行', '打麻将打麻将！'],
    'seat-rear-right': ['This is fucking 福建', '雀氏！']
  };

  const seats = [...document.querySelectorAll('.cabin-seat')];

  seats.forEach((seat) => {
    const key = Object.keys(phrases).find((cls) => seat.classList.contains(cls));
    if (!key) return;
    const options = phrases[key];
    seat.dataset.catchphrase = options[Math.floor(Math.random() * options.length)];
    seat.classList.remove('is-open');
  });

  function speakRandomly(seat) {
    const nextDelay = 2200 + Math.random() * 4800;
    window.setTimeout(() => {
      const key = Object.keys(phrases).find((cls) => seat.classList.contains(cls));
      if (key) {
        const options = phrases[key];
        seat.dataset.catchphrase = options[Math.floor(Math.random() * options.length)];
      }
      seat.classList.add('is-speaking');
      window.setTimeout(() => {
        seat.classList.remove('is-speaking');
      }, 1800 + Math.random() * 1400);
      speakRandomly(seat);
    }, nextDelay);
  }

  seats.forEach((seat, idx) => {
    window.setTimeout(() => speakRandomly(seat), 500 + idx * 460);
  });
}

function initAmbientMusic() {
  const musicBtn = document.getElementById('musicBtn');
  const audio = new Audio(bgmUrl);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.38;
  audio.playsInline = true;

  let enabled = true;
  let isPlaying = false;

  function setMusicButton(status) {
    if (!musicBtn) return;
    musicBtn.textContent = status;
    musicBtn.classList.toggle('is-active', enabled && isPlaying);
  }

  async function tryStart(removeListenersOnSuccess = false) {
    try {
      if (!enabled) return false;
      await audio.play();
      isPlaying = true;
      setMusicButton('音乐: 播放中');
      if (removeListenersOnSuccess) {
        detachResumeListeners();
      }
      return true;
    } catch (_error) {
      isPlaying = false;
      setMusicButton('音乐: 点击启用');
      return false;
    }
  }

  function detachResumeListeners() {
    window.removeEventListener('pointerdown', resumeOnGesture);
    window.removeEventListener('keydown', resumeOnGesture);
    window.removeEventListener('touchstart', resumeOnGesture);
    window.removeEventListener('visibilitychange', resumeOnVisible);
    window.removeEventListener('pageshow', resumeOnVisible);
  }

  const resumeOnGesture = () => {
    tryStart(true);
  };
  const resumeOnVisible = () => {
    if (document.visibilityState === 'visible') {
      tryStart();
    }
  };

  if (musicBtn) {
    musicBtn.addEventListener('click', async () => {
      if (!enabled) {
        enabled = true;
        setMusicButton('音乐: 启用中');
        await tryStart();
        return;
      }

      if (!isPlaying) {
        await tryStart();
        return;
      }

      enabled = false;
      audio.pause();
      isPlaying = false;
      setMusicButton('音乐: 已关闭');
    });
  }

  audio.addEventListener('playing', () => {
    isPlaying = true;
    if (enabled) setMusicButton('音乐: 播放中');
  });
  audio.addEventListener('pause', () => {
    if (!enabled) return;
    isPlaying = false;
    setMusicButton('音乐: 点击启用');
  });

  setMusicButton('音乐: 启用中');
  tryStart();
  window.addEventListener('pointerdown', resumeOnGesture, { passive: true });
  window.addEventListener('keydown', resumeOnGesture);
  window.addEventListener('touchstart', resumeOnGesture, { passive: true });
  window.addEventListener('visibilitychange', resumeOnVisible);
  window.addEventListener('pageshow', resumeOnVisible);
}

function getRoutePosition(route, t) {
  const safeT = Math.max(0, Math.min(1, t));
  const maxIndex = route.length - 1;
  const scaled = safeT * maxIndex;
  const i = Math.floor(scaled);
  const frac = scaled - i;

  if (i >= maxIndex) return route[maxIndex];
  const a = route[i];
  const b = route[i + 1];
  return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
}

function initAutoPlayGuard(engine, store) {
  let lastKm = store.getState().km;

  const timer = window.setInterval(() => {
    const state = store.getState();
    const kmDelta = Math.abs(state.km - lastKm);

    if (state.mode === 'driving' && kmDelta < 0.08) {
      engine.setAuto(true);
    }

    lastKm = state.km;
  }, 2200);

  const resumeOnVisible = () => {
    if (document.visibilityState === 'visible') {
      engine.setAuto(true);
    }
  };

  window.addEventListener('visibilitychange', resumeOnVisible);
  window.addEventListener('pageshow', () => engine.setAuto(true));

  return () => {
    clearInterval(timer);
    window.removeEventListener('visibilitychange', resumeOnVisible);
  };
}

function initMobilePlayButton(engine, store) {
  const playBtn = document.getElementById('mobilePlayBtn');
  if (!playBtn) return;

  function sync() {
    const state = store.getState();
    const shouldShow = window.innerWidth <= 760 && state.mode === 'driving' && !state.auto;
    playBtn.classList.toggle('is-visible', shouldShow);
  }

  playBtn.addEventListener('click', () => {
    engine.setAuto(true);
    sync();
  });

  window.addEventListener('resize', sync);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'visible') {
        engine.setAuto(true);
      }
      sync();
    },
    { passive: true }
  );

  store.subscribe(sync);
  sync();
}

async function loadAmap() {
  if (window.AMap) return window.AMap;

  const key = window.__AMAP_KEY__ || '';
  if (!key) {
    throw new Error('missing-amap-key');
  }

  if (window.__AMAP_SECURITY_JS_CODE__) {
    window._AMapSecurityConfig = { securityJsCode: window.__AMAP_SECURITY_JS_CODE__ };
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });

  return window.AMap;
}

async function initMiniMap(store) {
  const mapEl = document.getElementById('miniMap');
  const hintEl = document.getElementById('mapHint');
  if (!mapEl || !hintEl) return;

  try {
    const AMap = await loadAmap();
    const routePath = tripPlan.routeGeo.map(toLngLat);

    const map = new AMap.Map('miniMap', {
      zoom: 5.8,
      center: routePath[0],
      viewMode: '2D',
      resizeEnable: true,
      dragEnable: true,
      zoomEnable: true,
      scrollWheel: true
    });

    const polyline = new AMap.Polyline({
      path: routePath,
      strokeColor: '#d64b3d',
      strokeWeight: 5,
      strokeOpacity: 0.95,
      lineJoin: 'round'
    });
    map.add(polyline);

    const start = new AMap.Marker({
      position: routePath[0],
      title: '起点 上海'
    });
    const end = new AMap.Marker({
      position: routePath[routePath.length - 1],
      title: '终点 上海'
    });
    map.add([start, end]);

    const cityOverlays = [];
    const cityMarkers = new Map();
    const cityCoords = new Map();
    tripPlan.stops.forEach((stop, idx) => {
      const point = [stop.lng, stop.lat];
      if (!cityCoords.has(stop.name)) cityCoords.set(stop.name, point);
      const marker = new AMap.CircleMarker({
        center: point,
        radius: idx === 0 || idx === tripPlan.stops.length - 1 ? 5.5 : 4.5,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        fillColor: idx === 0 || idx === tripPlan.stops.length - 1 ? '#f4b47b' : '#d85a4c',
        fillOpacity: 0.95
      });
      cityOverlays.push(marker);
      if (!cityMarkers.has(stop.name)) cityMarkers.set(stop.name, marker);
      cityOverlays.push(
        new AMap.Text({
          text: stop.name,
          position: point,
          offset: new AMap.Pixel(8, -9),
          style: {
            color: '#4a2d20',
            fontSize: '12px',
            fontWeight: '700',
            background: 'rgba(255,244,226,0.92)',
            border: '1px solid rgba(188,124,82,0.45)',
            padding: '2px 5px',
            borderRadius: '8px'
          }
        })
      );
    });
    map.add(cityOverlays);

    const dayCityByIndex = [];
    let currentCity = tripPlan.stops[0]?.name || '上海';
    tripPlan.days.forEach((day) => {
      const routePair = day.title.split('-').map((name) => name.trim());
      if (routePair.length === 2 && cityMarkers.has(routePair[1])) {
        currentCity = routePair[1];
      } else if (cityMarkers.has(day.title.trim())) {
        currentCity = day.title.trim();
      }
      dayCityByIndex.push(currentCity);
    });

    let activeCityName = '';
    function setActiveCity(cityName) {
      if (!cityName || !cityMarkers.has(cityName)) return;
      if (activeCityName && cityMarkers.has(activeCityName)) {
        cityMarkers.get(activeCityName).setOptions({
          radius: activeCityName === '上海' ? 5.5 : 4.5,
          fillColor: activeCityName === '上海' ? '#f4b47b' : '#d85a4c',
          fillOpacity: 0.95
        });
      }

      activeCityName = cityName;
      cityMarkers.get(cityName).setOptions({
        radius: 7.8,
        fillColor: '#6ce6cb',
        fillOpacity: 1
      });

      const point = cityCoords.get(cityName);
      if (point) {
        map.setCenter(point);
      }
    }

    const dayLabels = [];
    tripPlan.days.forEach((day) => {
      const routePair = day.title.split('-').map((name) => name.trim());
      if (routePair.length !== 2) return;

      const from = cityCoords.get(routePair[0]);
      const to = cityCoords.get(routePair[1]);
      if (!from || !to) return;

      const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
      dayLabels.push(
        new AMap.Text({
          text: `Day${day.id}`,
          position: mid,
          offset: new AMap.Pixel(0, -4),
          style: {
            color: '#fff8ec',
            fontSize: '11px',
            fontWeight: '700',
            background: 'rgba(29,21,25,0.82)',
            border: '1px solid rgba(255,188,118,0.7)',
            padding: '1px 6px',
            borderRadius: '999px'
          }
        })
      );
    });
    if (dayLabels.length) map.add(dayLabels);

    await new Promise((resolve) => {
      AMap.plugin('AMap.DistrictSearch', () => resolve());
    });

    const boundaryOverlays = [];
    const district = new AMap.DistrictSearch({
      extensions: 'all',
      subdistrict: 0
    });
    const stopNames = [...new Set(tripPlan.stops.map((s) => s.name))];

    for (const name of stopNames) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        district.search(name, (status, result) => {
          if (status === 'complete') {
            const boundaries = result?.districtList?.[0]?.boundaries || [];
            boundaries.forEach((path) => {
              boundaryOverlays.push(
                new AMap.Polygon({
                  path,
                  strokeWeight: 1.2,
                  strokeColor: '#b57249',
                  strokeOpacity: 0.65,
                  fillColor: '#f2c59a',
                  fillOpacity: 0.05
                })
              );
            });
          }
          resolve();
        });
      });
    }
    if (boundaryOverlays.length) {
      map.add(boundaryOverlays);
    }

    const cursor = new AMap.CircleMarker({
      center: routePath[0],
      radius: 6,
      strokeColor: '#fff',
      strokeWeight: 2,
      fillColor: '#6ce6cb',
      fillOpacity: 1
    });
    map.add(cursor);

    map.setFitView([polyline], false, [18, 18, 18, 18]);
    hintEl.textContent = '高德地图总览（城市边界 + 城市标签 + 轨迹 + 实时进度点）';

    store.subscribe((state) => {
      const pos = getRoutePosition(routePath, state.progress);
      cursor.setCenter(pos);
      setActiveCity(dayCityByIndex[state.dayIndex] || dayCityByIndex[0]);
    });

    setActiveCity(dayCityByIndex[0]);
  } catch (_error) {
    mapEl.classList.add('is-fallback');
    mapEl.innerHTML = `
      <div class="map-fallback-content">
        <strong>高德地图未启用</strong>
        <p>请在页面注入 window.__AMAP_KEY__ 后刷新。</p>
      </div>
    `;
    hintEl.textContent = `路线总览：${tripPlan.stops.map((s) => s.name).join(' → ')}`;
  }
}

function initBackgroundFireworks() {
  const canvas = document.getElementById('bgFireworks');
  const shell = document.querySelector('.arcade-shell');
  if (!canvas || !shell) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = [];
  let lastSpawn = 0;
  let nextAutoBurstAt = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function spawnBurst(x, y, intensity = 1) {
    const base = Math.floor(36 * intensity);
    const primaryHue = 8 + Math.random() * 130;
    const secondaryHue = 160 + Math.random() * 80;

    for (let ring = 0; ring < 2; ring += 1) {
      const count = base + ring * 12;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.08;
        const speed = 0.9 + Math.random() * 2.6 + ring * 0.6;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: 1.1 + Math.random() * 3.1,
          hue: ring === 0 ? primaryHue : secondaryHue
        });
      }
    }

    const glitterCount = Math.floor(26 * intensity);
    for (let i = 0; i < glitterCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.75 + Math.random() * 0.4,
        size: 0.9 + Math.random() * 1.4,
        hue: 35 + Math.random() * 40
      });
    }
  }

  function randomBlankPoint() {
    const rect = shell.getBoundingClientRect();
    const pad = 36;
    for (let i = 0; i < 20; i += 1) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const inMain =
        x >= rect.left - pad &&
        x <= rect.right + pad &&
        y >= rect.top - pad &&
        y <= rect.bottom + pad;
      if (!inMain) return { x, y };
    }

    // Fallback: corners when blank area is tight
    const corners = [
      { x: window.innerWidth * 0.08, y: window.innerHeight * 0.12 },
      { x: window.innerWidth * 0.92, y: window.innerHeight * 0.15 },
      { x: window.innerWidth * 0.12, y: window.innerHeight * 0.88 },
      { x: window.innerWidth * 0.9, y: window.innerHeight * 0.84 }
    ];
    return corners[Math.floor(Math.random() * corners.length)];
  }

  function burstOnBlankAreas() {
    const rect = shell.getBoundingClientRect();
    const points = [];
    const pad = 36;

    if (rect.top > pad) {
      points.push({ x: rect.left + rect.width * 0.2, y: rect.top * 0.45 });
      points.push({ x: rect.left + rect.width * 0.8, y: rect.top * 0.55 });
    }
    if (window.innerHeight - rect.bottom > pad) {
      const bottomGap = window.innerHeight - rect.bottom;
      points.push({ x: rect.left + rect.width * 0.25, y: rect.bottom + bottomGap * 0.45 });
      points.push({ x: rect.left + rect.width * 0.75, y: rect.bottom + bottomGap * 0.55 });
    }
    if (rect.left > pad) {
      points.push({ x: rect.left * 0.5, y: rect.top + rect.height * 0.3 });
      points.push({ x: rect.left * 0.55, y: rect.top + rect.height * 0.7 });
    }
    if (window.innerWidth - rect.right > pad) {
      const rightGap = window.innerWidth - rect.right;
      points.push({ x: rect.right + rightGap * 0.45, y: rect.top + rect.height * 0.35 });
      points.push({ x: rect.right + rightGap * 0.55, y: rect.top + rect.height * 0.72 });
    }

    // Randomized scatter in blank areas to avoid a grid-like look.
    const targetCount = 42;
    let attempts = 0;
    while (points.length < targetCount && attempts < targetCount * 14) {
      attempts += 1;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const inMain =
        x >= rect.left - pad &&
        x <= rect.right + pad &&
        y >= rect.top - pad &&
        y <= rect.bottom + pad;
      if (!inMain) {
        points.push({ x, y });
      }
    }

    if (!points.length) {
      points.push(
        { x: window.innerWidth * 0.08, y: window.innerHeight * 0.12 },
        { x: window.innerWidth * 0.24, y: window.innerHeight * 0.18 },
        { x: window.innerWidth * 0.41, y: window.innerHeight * 0.14 },
        { x: window.innerWidth * 0.58, y: window.innerHeight * 0.2 },
        { x: window.innerWidth * 0.76, y: window.innerHeight * 0.16 },
        { x: window.innerWidth * 0.92, y: window.innerHeight * 0.12 },
        { x: window.innerWidth * 0.1, y: window.innerHeight * 0.88 },
        { x: window.innerWidth * 0.28, y: window.innerHeight * 0.82 },
        { x: window.innerWidth * 0.44, y: window.innerHeight * 0.9 },
        { x: window.innerWidth * 0.62, y: window.innerHeight * 0.84 },
        { x: window.innerWidth * 0.79, y: window.innerHeight * 0.9 },
        { x: window.innerWidth * 0.93, y: window.innerHeight * 0.86 }
      );
    }

    points.forEach((point, idx) => {
      const mainPower = 0.9 + Math.random() * 1.35;
      const subPowerA = 0.6 + Math.random() * 0.85;
      const subPowerB = 0.45 + Math.random() * 0.7;
      window.setTimeout(() => spawnBurst(point.x, point.y, mainPower), 60 + idx * 22 + Math.random() * 40);
      window.setTimeout(
        () => spawnBurst(point.x + (Math.random() * 52 - 26), point.y + (Math.random() * 52 - 26), subPowerA),
        210 + idx * 22 + Math.random() * 40
      );
      window.setTimeout(
        () => spawnBurst(point.x + (Math.random() * 40 - 20), point.y + (Math.random() * 40 - 20), subPowerB),
        390 + idx * 22 + Math.random() * 40
      );
    });
  }

  document.addEventListener(
    'pointermove',
    (event) => {
      const rect = shell.getBoundingClientRect();
      const inMain =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (inMain) return;

      const now = performance.now();
      if (now - lastSpawn < 45) return;
      lastSpawn = now;
      spawnBurst(event.clientX, event.clientY, 1.05);
    },
    { passive: true }
  );

  function animate() {
    const now = performance.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.018;
      p.life -= 0.014;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 95%, 66%, ${p.life})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (now >= nextAutoBurstAt) {
      const point = randomBlankPoint();
      const power = 0.55 + Math.random() * 1.55;
      spawnBurst(point.x, point.y, power);
      nextAutoBurstAt = now + 2200 + Math.random() * 4200;
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
  burstOnBlankAreas();
  nextAutoBurstAt = performance.now() + 2600 + Math.random() * 2600;
}

const model = createJourneyModel(tripPlan);
const initialState = {
  mode: 'driving',
  auto: true,
  km: 0,
  progress: 0,
  dayIndex: 0,
  segmentProgress: 0,
  speedMultiplier: 1,
  speedModifier: 0,
  fuel: 100,
  fatigue: 10
};

const store = createStore(initialState);
const stageFx = createStageCanvas(document.getElementById('driveCanvas'), model, store);

const engine = createJourneyEngine({
  model,
  store,
  onEvent(event) {
    if (event.type === 'festival_fx') {
      stageFx.burst(30);
      return;
    }

    if (event.type === 'arrival') {
      stageFx.burst(16);
    }
  }
});

createPanelRenderer({ model, store, engine });
initCrewCatchphrases();
initMiniMap(store);
initAmbientMusic();
initBackgroundFireworks();
engine.setAuto(true);
initAutoPlayGuard(engine, store);
initMobilePlayButton(engine, store);
engine.start();
