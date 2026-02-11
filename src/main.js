import './style.css';
import bgmUrl from './static/new_year.mp3';
import { tripPlan } from './plan.js';
import { createJourneyModel } from './journey/model.js';
import { createStore } from './journey/state.js';
import { createJourneyEngine } from './journey/engine.js';
import { createStageCanvas } from './journey/stage-canvas.js';
import { createPanelRenderer } from './journey/panel.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="arcade-shell">
    <header class="top-band">
      <div>
        <p class="brand">沪闪沪闪 · 来到福建</p>
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

        <section class="paper crew-card">
          <div class="crew-head">
            <span id="hudFuel">油量 100%</span>
            <span id="hudFatigue">疲劳 10%</span>
          </div>
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
        </section>

        <section class="paper">
          <h3>当日时间线</h3>
          <ol class="timeline" id="timeline"></ol>
        </section>

        <section class="paper dual">
          <article>
            <h3>福建味道</h3>
            <ul id="foodList"></ul>
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
      <button id="leftBtn" class="ctl">回看 25km</button>
      <button id="rightBtn" class="ctl">前进 25km</button>
      <button id="musicBtn" class="ctl music-btn">音乐: 启动中</button>
      <span class="hint">Space 播放/暂停 · ← → 调整进度</span>
    </footer>
  </div>
`;

function toLngLat([lat, lng]) {
  return [lng, lat];
}

function initCrewCatchphrases() {
  const phrases = {
    'seat-driver': '不用不用，我还能开',
    'seat-passenger': '哈哈哈',
    'seat-rear-left': '你们看，我都行',
    'seat-rear-right': 'This is fucking 福建.'
  };

  const seats = [...document.querySelectorAll('.cabin-seat')];

  seats.forEach((seat) => {
    const key = Object.keys(phrases).find((cls) => seat.classList.contains(cls));
    if (!key) return;
    seat.dataset.catchphrase = phrases[key];
    seat.classList.remove('is-open');
  });

  function speakRandomly(seat) {
    const nextDelay = 2200 + Math.random() * 4800;
    window.setTimeout(() => {
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
      scrollWheel: false
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
    tripPlan.stops.forEach((stop, idx) => {
      const point = [stop.lng, stop.lat];
      cityOverlays.push(
        new AMap.CircleMarker({
          center: point,
          radius: idx === 0 || idx === tripPlan.stops.length - 1 ? 5.5 : 4.5,
          strokeColor: '#ffffff',
          strokeWeight: 1,
          fillColor: idx === 0 || idx === tripPlan.stops.length - 1 ? '#f4b47b' : '#d85a4c',
          fillOpacity: 0.95
        })
      );
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
    });
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
engine.setAuto(true);
initAutoPlayGuard(engine, store);
initMobilePlayButton(engine, store);
engine.start();
