function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const posterPalette = {
  city: { sky: '#1a3550', sun: '#f4b27d', hillA: '#355b6d', hillB: '#1d3441', road: '#3f3a37', line: '#f7d08a' },
  coast: { sky: '#1f4a63', sun: '#f5be86', hillA: '#47706e', hillB: '#284e53', road: '#45403b', line: '#f6d69a' },
  culture: { sky: '#4d2d41', sun: '#f0ba87', hillA: '#7a4f54', hillB: '#4a3437', road: '#4a3e3c', line: '#f6ce94' },
  heritage: { sky: '#5b3e34', sun: '#f1c18f', hillA: '#8a6543', hillB: '#5a4534', road: '#4e433f', line: '#f7d79d' },
  'urban-sea': { sky: '#315e6d', sun: '#f7c68c', hillA: '#4f7c7a', hillB: '#305962', road: '#47423d', line: '#f6d398' },
  mountain: { sky: '#325544', sun: '#f4c48f', hillA: '#51775a', hillB: '#355741', road: '#454039', line: '#f2d091' },
  wind: { sky: '#3b4f69', sun: '#f4c38e', hillA: '#5f7382', hillB: '#41576a', road: '#454140', line: '#f5d59d' },
  return: { sky: '#5b465d', sun: '#efbf90', hillA: '#7e6472', hillB: '#544759', road: '#4a4448', line: '#f6d59f' }
};

function shortStopText(dayTitle) {
  return String(dayTitle).replace(/（.*?）/g, '').replace(/\s+/g, '').slice(0, 16);
}

export function createStageCanvas(canvas, model, store) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { destroy() {}, burst() {} };

  const particles = [];
  let width = 0;
  let height = 0;
  let rafId = 0;
  let latest = store.getState();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(strength = 24) {
    for (let i = 0; i < strength; i += 1) {
      const angle = (Math.PI * 2 * i) / strength;
      const speed = 0.8 + Math.random() * 1.8;
      particles.push({
        x: width * (0.36 + Math.random() * 0.28),
        y: height * (0.18 + Math.random() * 0.2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 2 + Math.random() * 2.4,
        hue: 20 + Math.random() * 120
      });
    }
  }

  function drawPaperTexture() {
    ctx.globalAlpha = 0.18;
    for (let x = 0; x < width; x += 6) {
      const h = 2 + ((x * 7) % 5);
      ctx.fillStyle = x % 12 === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
      ctx.fillRect(x, (x * 13) % height, 1, h);
    }
    ctx.globalAlpha = 1;
  }

  function drawBackground(palette, km) {
    ctx.fillStyle = palette.sky;
    ctx.fillRect(0, 0, width, height);

    const sunX = width * (0.18 + Math.sin(km * 0.002) * 0.04);
    const sunY = height * 0.2;
    ctx.fillStyle = palette.sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.hillA;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.54);
    ctx.lineTo(width * 0.16, height * 0.42);
    ctx.lineTo(width * 0.3, height * 0.5);
    ctx.lineTo(width * 0.48, height * 0.4);
    ctx.lineTo(width * 0.7, height * 0.52);
    ctx.lineTo(width * 0.88, height * 0.45);
    ctx.lineTo(width, height * 0.54);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = palette.hillB;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.64);
    ctx.lineTo(width * 0.13, height * 0.56);
    ctx.lineTo(width * 0.3, height * 0.64);
    ctx.lineTo(width * 0.5, height * 0.56);
    ctx.lineTo(width * 0.72, height * 0.66);
    ctx.lineTo(width * 0.89, height * 0.58);
    ctx.lineTo(width, height * 0.64);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(66, 133, 139, 0.32)';
    for (let i = 0; i < 8; i += 1) {
      const y = height * (0.67 + i * 0.022);
      const shift = (km * (0.22 + i * 0.02)) % 30;
      ctx.fillRect(-30 + shift, y, width + 60, 2);
    }

    // Fujian tulou icon
    const tx = width * 0.78;
    const ty = height * 0.63;
    ctx.fillStyle = '#ad7a52';
    ctx.beginPath();
    ctx.ellipse(tx, ty, 34, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f2c20';
    ctx.beginPath();
    ctx.ellipse(tx, ty, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRoad(palette, km, speed) {
    const topY = height * 0.52;
    const bottomY = height * 1.02;

    ctx.fillStyle = palette.road;
    ctx.beginPath();
    ctx.moveTo(width * 0.43, topY);
    ctx.lineTo(width * 0.57, topY);
    ctx.lineTo(width * 0.78, bottomY);
    ctx.lineTo(width * 0.22, bottomY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#df8a58';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width * 0.43, topY);
    ctx.lineTo(width * 0.22, bottomY);
    ctx.moveTo(width * 0.57, topY);
    ctx.lineTo(width * 0.78, bottomY);
    ctx.stroke();

    const pulse = (performance.now() * (0.0014 + speed * 0.0007) + km * 0.01) % 1;
    ctx.fillStyle = palette.line;
    for (let i = 0; i < 9; i += 1) {
      const t = (i / 9 + pulse) % 1;
      const y = bottomY - (bottomY - topY) * t;
      const w = clamp(8 + (1 - t) * 26, 8, 34);
      ctx.fillRect(width * 0.5 - w / 2, y, w, 5);
    }
  }

  function drawCar(speed) {
    const cx = width * 0.5;
    const cy = height * 0.85 + Math.sin(performance.now() / 210) * (1 + speed * 0.5);
    const w = clamp(width * 0.17, 116, 196);
    const h = w * 0.38;

    ctx.fillStyle = 'rgba(20, 16, 20, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + h * 0.65, w * 0.46, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#de6248';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy + h * 0.1);
    ctx.lineTo(cx - w * 0.34, cy - h * 0.25);
    ctx.lineTo(cx + w * 0.34, cy - h * 0.25);
    ctx.lineTo(cx + w * 0.5, cy + h * 0.1);
    ctx.lineTo(cx + w * 0.42, cy + h * 0.44);
    ctx.lineTo(cx - w * 0.42, cy + h * 0.44);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f1f1ea';
    ctx.fillRect(cx - w * 0.23, cy - h * 0.18, w * 0.46, h * 0.18);

    ctx.fillStyle = '#202030';
    ctx.fillRect(cx - w * 0.36, cy + h * 0.28, w * 0.18, h * 0.17);
    ctx.fillRect(cx + w * 0.18, cy + h * 0.28, w * 0.18, h * 0.17);
  }

  function drawCnyLanternBand(km) {
    ctx.strokeStyle = 'rgba(255, 233, 202, 0.72)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, 20);
    ctx.quadraticCurveTo(width * 0.5, 2 + Math.sin(km * 0.004) * 4, width + 10, 20);
    ctx.stroke();

    for (let i = 0; i < 6; i += 1) {
      const x = width * (0.12 + i * 0.15);
      const y = 18 + Math.sin(km * 0.012 + i) * 3;
      ctx.fillStyle = '#ea5837';
      ctx.fillRect(x - 8, y, 16, 22);
      ctx.fillStyle = '#ffd391';
      ctx.fillRect(x - 5, y + 9, 10, 3);
    }
  }

  function drawPosterLabel(day) {
    const x = 16;
    const y = height - 62;
    ctx.fillStyle = 'rgba(17, 22, 35, 0.78)';
    ctx.fillRect(x, y, 244, 42);
    ctx.strokeStyle = 'rgba(247, 205, 141, 0.9)';
    ctx.strokeRect(x, y, 244, 42);

    ctx.fillStyle = '#ffda9f';
    ctx.font = '700 14px "Rajdhani", "Noto Sans SC", sans-serif';
    ctx.fillText(`${day.festival} · 福建沿海路书`, x + 10, y + 17);
    ctx.font = '600 12px "Noto Sans SC", sans-serif';
    ctx.fillText(shortStopText(day.title), x + 10, y + 33);

  }

  function drawParticles() {
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
      ctx.fillStyle = `hsla(${p.hue}, 85%, 68%, ${p.life})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  function render() {
    const day = model.tripPlan.days[latest.dayIndex] || model.tripPlan.days[0];
    const palette = posterPalette[day?.mood] || posterPalette.city;
    const speed = latest.speedMultiplier + latest.speedModifier;

    drawBackground(palette, latest.km);
    drawCnyLanternBand(latest.km);
    drawRoad(palette, latest.km, speed);
    drawCar(speed);
    drawPosterLabel(day);
    drawParticles();
    drawPaperTexture();

    rafId = requestAnimationFrame(render);
  }

  const unsubscribe = store.subscribe((state) => {
    latest = state;
  });

  resize();
  window.addEventListener('resize', resize);
  rafId = requestAnimationFrame(render);

  return {
    burst,
    destroy() {
      unsubscribe();
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    }
  };
}
