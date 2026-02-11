import './style.css';
import { tripPlan } from './plan.js';

const app = document.querySelector('#app');
const totalSlides = 2 + tripPlan.days.length;

function renderDaySlide(day) {
  return `
    <section class="slide day-slide" data-slide-type="day" data-mood="${day.mood}">
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
        <div class="slide-inner hero-inner">
          <p class="tag row-reveal">2026 CNY SELF-DRIVE</p>
          <h1 class="row-reveal">上海 → 福建 沿海线</h1>
          <p class="lead row-reveal">新年氛围 + 福建海岸 + CT4 自驾主线</p>

          <div class="hero-meta row-reveal">
            <span>${tripPlan.travelWindow}</span>
            <span>${tripPlan.totalDistanceKm} km</span>
            <span>预算 ¥${tripPlan.estFuelAndRoadToll}</span>
          </div>

          <div class="car-stage row-reveal">
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
            <p class="lead">真实地理底图 + 沿海路线（上海-台州-霞浦-福州-泉州-厦门-漳州-北返）</p>
          </header>

          <div class="overview-grid row-reveal">
            <article class="glass-card map-card">
              <h3>上海到福建沿海路线地图</h3>
              <div id="routeMap" class="route-map" role="img" aria-label="上海到福建沿海路线真实地图"></div>
            </article>

            <article class="glass-card">
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

let currentSlide = 0;
let lock = false;
let touchStartY = 0;

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
}

function goTo(index) {
  if (lock) return;
  const next = clamp(index, 0, totalSlides - 1);
  if (next === currentSlide) return;
  lock = true;
  currentSlide = next;
  refreshUI();
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

async function initMap() {
  const mapEl = document.getElementById('routeMap');
  if (!mapEl) return;

  try {
    const L = await ensureLeafletAssets();
    const map = L.map(mapEl, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true
    }).setView([27.5, 119.6], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const route = L.polyline(tripPlan.routeGeo, {
      color: '#ff9f63',
      weight: 5,
      opacity: 0.92,
      lineJoin: 'round'
    }).addTo(map);

    tripPlan.stops.forEach((stop, idx) => {
      const marker = L.circleMarker([stop.lat, stop.lng], {
        radius: idx === 0 || idx === tripPlan.stops.length - 1 ? 6.5 : 5.2,
        color: '#ffe7c1',
        weight: 1,
        fillColor: idx === 0 ? '#56e6d4' : '#ff8358',
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindTooltip(stop.name, {
        direction: 'top',
        offset: [0, -8]
      });
    });

    map.fitBounds(route.getBounds(), {
      padding: [18, 18]
    });

    setTimeout(() => map.invalidateSize(), 120);
    window.addEventListener('resize', () => map.invalidateSize());
  } catch (_error) {
    mapEl.innerHTML = '<p class="map-fallback">地图加载失败，请检查网络后刷新页面。</p>';
  }
}

refreshUI();
initMap();
