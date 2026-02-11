import './style.css';
import { tripPlan } from './plan.js';

const app = document.querySelector('#app');
const totalSlides = 2 + tripPlan.days.length;

function getFestivalGlyph(day) {
  const text = `${day.festival} ${day.element}`;
  if (text.includes('除夕')) return '年夜';
  if (text.includes('初一')) return '拜年';
  if (text.includes('财神')) return '纳福';
  if (text.includes('回门')) return '回门';
  return '新春';
}

function renderDaySlide(day) {
  const progress = Math.round((day.id / tripPlan.days.length) * 100);
  const glyph = getFestivalGlyph(day);

  return `
    <section class="slide day-slide" data-slide-type="day" data-mood="${day.mood}" data-festival="${day.festival}">
      <div class="slide-inner">
        <div class="day-top row-reveal">
          <p class="tag">DAY ${day.id} | ${day.date}</p>
          <h2>${day.title}</h2>
          <p class="lead">${day.drive} | 睡眠地: ${day.sleep}</p>
        </div>

        <div class="lunar-ribbon row-reveal">
          <span class="lunar-date">${day.lunar}</span>
          <span class="festival">${day.festival}</span>
          <span class="element">${day.element}</span>
          <span class="glyph">${glyph}</span>
        </div>

        <div class="progress-wrap row-reveal">
          <span>旅程进度</span>
          <div class="progress-track"><i style="width:${progress}%"></i></div>
          <strong>${progress}%</strong>
        </div>

        <p class="focus row-reveal">今日重点: ${day.focus}</p>

        <div class="day-grid row-reveal">
          <article class="glass-card">
            <h3>时间安排</h3>
            <ol>
              ${day.schedule.map((item) => `<li>${item}</li>`).join('')}
            </ol>
          </article>

          <article class="glass-card">
            <h3>吃什么</h3>
            <ul>${day.food.map((item) => `<li>${item}</li>`).join('')}</ul>
            <h3>备选计划</h3>
            <p>${day.backup}</p>
            <div class="rhythm" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </article>
        </div>

        <div class="day-nav row-reveal">
          ${tripPlan.days
            .map(
              (d) =>
                `<button class="jump-btn ${d.id === day.id ? 'is-active' : ''}" data-jump="${d.id + 1}">DAY ${d.id}</button>`
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

app.innerHTML = `
  <canvas id="festivalCanvas" class="festival-canvas" aria-hidden="true"></canvas>
  <div class="cursor-glow" id="cursorGlow" aria-hidden="true"></div>
  <div class="flash" id="flash" aria-hidden="true"></div>

  <div class="fx-bg" aria-hidden="true">
    <div class="mesh"></div>
    <div class="noise"></div>
    <div class="halo halo-a"></div>
    <div class="halo halo-b"></div>
  </div>

  <main class="viewport">
    <div class="slides" id="slides">
      <section class="slide hero-slide" data-slide-type="hero">
        <div class="hero-bg" style="background-image: linear-gradient(120deg, rgba(6,16,30,0.66), rgba(6,16,30,0.28)), url('${tripPlan.visuals.heroBackground}')"></div>

        <div class="lanterns" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>

        <div class="slide-inner hero-inner parallax-layer">
          <p class="tag row-reveal">2026 CNY SELF-DRIVE</p>
          <h1 class="row-reveal">上海 → 福建 沿海线</h1>
          <p class="lead row-reveal">不是 PPT，而是带呼吸感的旅行舞台。</p>

          <div class="hero-meta row-reveal">
            <span>${tripPlan.travelWindow}</span>
            <span>${tripPlan.totalDistanceKm} km</span>
            <span>预算 ¥${tripPlan.estFuelAndRoadToll}</span>
          </div>

          <div class="car-stage row-reveal parallax-layer-soft">
            <img
              src="${tripPlan.visuals.ct4Image}"
              alt="Cadillac CT4"
              referrerpolicy="no-referrer"
              loading="eager"
            />
          </div>

          <p class="hint row-reveal">按 ↓ 进入总览</p>
        </div>
      </section>

      <section class="slide overview-slide" data-slide-type="overview">
        <div class="slide-inner">
          <header class="row-reveal">
            <p class="tag">总览</p>
            <h2>${tripPlan.title}</h2>
            <p class="lead">真实地理底图 + 沿海路线动态绘制 + 车点巡航</p>
          </header>

          <div class="overview-grid row-reveal">
            <article class="glass-card map-card">
              <h3>上海到福建沿海路线地图</h3>
              <div id="routeMap" class="route-map" role="img" aria-label="上海到福建沿海路线真实地图"></div>
            </article>

            <article class="glass-card accent-card">
              <h3>春节关键日期</h3>
              <ul>
                <li>除夕: 2026-02-16</li>
                <li>大年初一: 2026-02-17</li>
                <li>最后返程: 2026-02-22</li>
              </ul>
            </article>

            <article class="glass-card">
              <h3>全程清单</h3>
              <ul>
                ${tripPlan.packingChecklist.map((item) => `<li>${item}</li>`).join('')}
              </ul>
              <h3>团队配置</h3>
              <ul>
                ${tripPlan.members.map((m) => `<li>${m}</li>`).join('')}
              </ul>
            </article>
          </div>
        </div>
      </section>

      ${tripPlan.days.map((day) => renderDaySlide(day)).join('')}
    </div>
  </main>

  <aside class="dock" id="dock">
    <button class="dock-item is-active" data-slide="0">首页</button>
    <button class="dock-item" data-slide="1">总览</button>
    ${tripPlan.days.map((d) => `<button class="dock-item" data-slide="${d.id + 1}">D${d.id}</button>`).join('')}
  </aside>

  <footer class="pager" id="pager">1 / ${totalSlides}</footer>
`;

const slidesEl = document.getElementById('slides');
const pagerEl = document.getElementById('pager');
const dockEl = document.getElementById('dock');
const flashEl = document.getElementById('flash');
const cursorGlowEl = document.getElementById('cursorGlow');

let currentSlide = 0;
let lock = false;
let touchStartY = 0;
let routeMap = null;

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function refreshUI() {
  slidesEl.style.transform = `translate3d(0, -${currentSlide * 100}svh, 0)`;
  pagerEl.textContent = `${currentSlide + 1} / ${totalSlides}`;

  dockEl.querySelectorAll('.dock-item').forEach((btn) => {
    btn.classList.toggle('is-active', Number(btn.dataset.slide) === currentSlide);
  });

  document.querySelectorAll('.slide').forEach((slide, index) => {
    slide.classList.toggle('is-active', index === currentSlide);
    if (index === currentSlide) {
      document.body.dataset.mood = slide.dataset.mood || slide.dataset.slideType || 'hero';
    }
  });

  if (routeMap && currentSlide === 1) {
    setTimeout(() => routeMap.invalidateSize(), 60);
  }
}

function burstFlash() {
  flashEl.classList.remove('is-on');
  void flashEl.offsetWidth;
  flashEl.classList.add('is-on');
}

function goTo(index) {
  if (lock) return;
  const next = clamp(index, 0, totalSlides - 1);
  if (next === currentSlide) return;
  lock = true;
  currentSlide = next;
  refreshUI();
  burstFlash();
  triggerFestivalBurst();
  setTimeout(() => {
    lock = false;
  }, 620);
}

function step(delta) {
  goTo(currentSlide + delta);
}

document.addEventListener(
  'wheel',
  (event) => {
    if (Math.abs(event.deltaY) < 12) return;
    step(event.deltaY > 0 ? 1 : -1);
  },
  { passive: true }
);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault();
    step(1);
  }

  if (event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault();
    step(-1);
  }

  if (event.key === 'Home') {
    event.preventDefault();
    goTo(0);
  }

  if (event.key === 'End') {
    event.preventDefault();
    goTo(totalSlides - 1);
  }
});

document.addEventListener(
  'touchstart',
  (event) => {
    touchStartY = event.changedTouches[0].clientY;
  },
  { passive: true }
);

document.addEventListener(
  'touchend',
  (event) => {
    const delta = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(delta) < 36) return;
    step(delta < 0 ? 1 : -1);
  },
  { passive: true }
);

dockEl.addEventListener('click', (event) => {
  const btn = event.target.closest('.dock-item');
  if (!btn) return;
  goTo(Number(btn.dataset.slide));
});

document.addEventListener('click', (event) => {
  const btn = event.target.closest('.jump-btn');
  if (!btn) return;
  goTo(Number(btn.dataset.jump));
});

function initParallax() {
  document.addEventListener(
    'pointermove',
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--mx', x.toFixed(3));
      document.documentElement.style.setProperty('--my', y.toFixed(3));

      cursorGlowEl.style.transform = `translate(${event.clientX - 140}px, ${event.clientY - 140}px)`;
      cursorGlowEl.style.opacity = '1';
    },
    { passive: true }
  );

  document.addEventListener('pointerleave', () => {
    cursorGlowEl.style.opacity = '0';
  });
}

function ensureLeafletAssets() {
  if (!document.querySelector('link[data-leaflet]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.dataset.leaflet = 'true';
    document.head.append(link);
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Leaflet load failed'));
    document.body.append(script);
  });
}

function interpolateRoute(route, t) {
  const maxIndex = route.length - 1;
  const scaled = t * maxIndex;
  const i = Math.floor(scaled);
  const frac = scaled - i;

  if (i >= maxIndex) return route[maxIndex];

  const a = route[i];
  const b = route[i + 1];
  return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
}

async function initMap() {
  const mapEl = document.getElementById('routeMap');
  if (!mapEl) return;

  try {
    const L = await ensureLeafletAssets();
    routeMap = L.map(mapEl, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true
    }).setView([27.5, 119.6], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(routeMap);

    const fullRoute = L.polyline(tripPlan.routeGeo, {
      color: '#ffc089',
      weight: 2,
      opacity: 0.5,
      lineJoin: 'round'
    }).addTo(routeMap);

    const animatedRoute = L.polyline([], {
      color: '#ff7b4f',
      weight: 6,
      opacity: 0.95,
      lineJoin: 'round'
    }).addTo(routeMap);

    const carDot = L.circleMarker(tripPlan.routeGeo[0], {
      radius: 6.8,
      color: '#ffffff',
      weight: 1,
      fillColor: '#57e9d8',
      fillOpacity: 0.95
    }).addTo(routeMap);

    tripPlan.stops.forEach((stop, idx) => {
      L.circleMarker([stop.lat, stop.lng], {
        radius: idx === 0 || idx === tripPlan.stops.length - 1 ? 6 : 4.7,
        color: '#ffe7c4',
        weight: 1,
        fillColor: idx === 0 ? '#58e6d6' : '#ff8f68',
        fillOpacity: 0.9
      })
        .addTo(routeMap)
        .bindTooltip(stop.name, { direction: 'top', offset: [0, -7] });
    });

    let drawIndex = 0;
    const drawTimer = setInterval(() => {
      if (drawIndex >= tripPlan.routeGeo.length) {
        clearInterval(drawTimer);
        return;
      }
      animatedRoute.addLatLng(tripPlan.routeGeo[drawIndex]);
      drawIndex += 1;
    }, 220);

    let t = 0;
    function runCar() {
      t += 0.0018;
      if (t > 1) t = 0;
      carDot.setLatLng(interpolateRoute(tripPlan.routeGeo, t));
      requestAnimationFrame(runCar);
    }
    requestAnimationFrame(runCar);

    routeMap.fitBounds(fullRoute.getBounds(), { padding: [18, 18] });

    setTimeout(() => routeMap.invalidateSize(), 120);
    window.addEventListener('resize', () => routeMap?.invalidateSize());
  } catch (_error) {
    mapEl.innerHTML = '<p class="map-fallback">地图加载失败，请检查网络后刷新页面。</p>';
  }
}

function initFestivalCanvas() {
  const canvas = document.getElementById('festivalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function addBurst(x, y, count, hue) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 0.8 + Math.random() * 2.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 1 + Math.random() * 2.8,
        hue
      });
    }
  }

  let autoTick = 0;
  function animate() {
    ctx.fillStyle = 'rgba(2, 8, 20, 0.14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    autoTick += 1;
    const day = tripPlan.days[currentSlide - 2];
    const festive = currentSlide === 0 || day?.festival?.includes('除夕') || day?.festival?.includes('初一');

    if (festive && autoTick % 48 === 0) {
      addBurst(Math.random() * canvas.width, canvas.height * (0.12 + Math.random() * 0.45), 14, 20 + Math.random() * 160);
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.life -= 0.015;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 90%, 66%, ${p.life})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  window.triggerFestivalBurst = () => {
    const baseHue = 8 + Math.random() * 170;
    addBurst(window.innerWidth * (0.36 + Math.random() * 0.3), window.innerHeight * (0.26 + Math.random() * 0.25), 22, baseHue);
  };

  requestAnimationFrame(animate);
}

function triggerFestivalBurst() {
  if (typeof window.triggerFestivalBurst === 'function') {
    window.triggerFestivalBurst();
  }
}

refreshUI();
initParallax();
initFestivalCanvas();
initMap();
triggerFestivalBurst();
