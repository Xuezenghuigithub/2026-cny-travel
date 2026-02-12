import cadillacLogoUrl from '../static/Cadillac.png';

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

  const logoImg = new Image();
  let logoImgLoaded = false;
  logoImg.onload = () => {
    logoImgLoaded = true;
  };
  logoImg.src = cadillacLogoUrl;

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
    ctx.globalAlpha = 0.12;
    for (let x = 0; x < width; x += 6) {
      const h = 1 + ((x * 7) % 4);
      ctx.fillStyle = x % 12 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(x, (x * 13) % height, 1, h);
    }
    ctx.globalAlpha = 1;
  }

  function drawBackground(palette, km) {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, palette.sky);
    sky.addColorStop(1, '#17293d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const sunX = width * (0.18 + Math.sin(km * 0.002) * 0.04);
    const sunY = height * 0.2;
    ctx.fillStyle = palette.sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
    ctx.fill();

    const horizonY = height * 0.6;

    ctx.fillStyle = palette.hillA;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width * 0.14, horizonY - 140);
    ctx.lineTo(width * 0.26, horizonY - 66);
    ctx.lineTo(width * 0.41, horizonY - 170);
    ctx.lineTo(width * 0.56, horizonY - 74);
    ctx.lineTo(width * 0.74, horizonY - 156);
    ctx.lineTo(width * 0.86, horizonY - 82);
    ctx.lineTo(width, horizonY - 124);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Snow caps for distant mountain peaks.
    ctx.fillStyle = 'rgba(245, 250, 255, 0.92)';
    ctx.beginPath();
    ctx.moveTo(width * 0.1, horizonY - 118);
    ctx.lineTo(width * 0.14, horizonY - 140);
    ctx.lineTo(width * 0.18, horizonY - 112);
    ctx.lineTo(width * 0.15, horizonY - 108);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(width * 0.36, horizonY - 140);
    ctx.lineTo(width * 0.41, horizonY - 170);
    ctx.lineTo(width * 0.46, horizonY - 138);
    ctx.lineTo(width * 0.42, horizonY - 132);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(width * 0.69, horizonY - 132);
    ctx.lineTo(width * 0.74, horizonY - 156);
    ctx.lineTo(width * 0.79, horizonY - 129);
    ctx.lineTo(width * 0.75, horizonY - 124);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = palette.hillB;
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 0.09 * height);
    ctx.lineTo(width * 0.15, horizonY + 0.01 * height);
    ctx.lineTo(width * 0.39, horizonY + 0.11 * height);
    ctx.lineTo(width * 0.58, horizonY + 0.02 * height);
    ctx.lineTo(width * 0.8, horizonY + 0.15 * height);
    ctx.lineTo(width, horizonY + 0.06 * height);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    const coastTopX = width * 0.31;
    const coastMidX = width * 0.25;
    const coastBottomX = width * 0.2;

    const sea = ctx.createLinearGradient(0, horizonY - 42, 0, height);
    sea.addColorStop(0, 'rgba(88, 176, 204, 0.66)');
    sea.addColorStop(0.45, 'rgba(33, 108, 146, 0.82)');
    sea.addColorStop(1, 'rgba(9, 41, 67, 0.9)');
    ctx.fillStyle = sea;
    ctx.beginPath();
    ctx.moveTo(0, horizonY - 28);
    ctx.lineTo(coastTopX, horizonY + 10);
    ctx.lineTo(coastMidX, horizonY + height * 0.24);
    ctx.lineTo(coastBottomX, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(219, 241, 248, 0.42)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, horizonY - 20);
    ctx.quadraticCurveTo(width * 0.14, horizonY - 28, coastTopX + 8, horizonY + 4);
    ctx.stroke();

    for (let i = 0; i < 12; i += 1) {
      const t = i / 11;
      const y = horizonY + 6 + t * (height - horizonY - 18);
      const coastX = coastTopX + (coastBottomX - coastTopX) * t;
      const shift = (km * (0.28 + i * 0.015)) % 44;
      const waveLen = 8 + i * 1.6;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(165, 228, 241, 0.34)' : 'rgba(88, 180, 208, 0.26)';
      ctx.lineWidth = 0.9 + t * 1.2;
      ctx.beginPath();
      for (let x = 0; x <= coastX - 8; x += 6) {
        const wave = Math.sin((x + shift) / waveLen) * (0.6 + t * 1.2);
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(246, 215, 166, 0.62)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(coastTopX, horizonY + 10);
    ctx.lineTo(coastBottomX, height);
    ctx.stroke();
  }

  function drawRoad(palette, km, speed, drift) {
    const topY = height * 0.6;
    const bottomY = height * 1.02;
    const leftTopX = width * 0.34;
    const rightTopX = width * 0.66;
    const leftBottomX = width * 0.18;
    const rightBottomX = width * 0.82;

    ctx.fillStyle = palette.road;
    ctx.beginPath();
    ctx.moveTo(leftTopX, topY);
    ctx.lineTo(rightTopX, topY);
    ctx.lineTo(rightBottomX, bottomY);
    ctx.lineTo(leftBottomX, bottomY);
    ctx.closePath();
    ctx.fill();

    const roadShade = ctx.createLinearGradient(0, topY, 0, bottomY);
    roadShade.addColorStop(0, 'rgba(255,255,255,0.04)');
    roadShade.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = roadShade;
    ctx.beginPath();
    ctx.moveTo(leftTopX, topY);
    ctx.lineTo(rightTopX, topY);
    ctx.lineTo(rightBottomX, bottomY);
    ctx.lineTo(leftBottomX, bottomY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#f0b28a';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(leftTopX, topY);
    ctx.lineTo(leftBottomX, bottomY);
    ctx.moveTo(rightTopX, topY);
    ctx.lineTo(rightBottomX, bottomY);
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

  function drawCar(speed, drift) {
    const cx = width * 0.5 + drift * 0.8;
    const cy = height * 0.84 + Math.sin(performance.now() / 210) * (1 + speed * 0.42);
    const carW = clamp(width * 0.275, 210, 316);
    const carH = carW * 0.62;
    const tilt = ((-2 + drift * 0.11) * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);

    const slip = clamp(drift * 0.22, -12, 12);
    const skidY = carH * 0.36;
    const tireGap = carW * 0.26;
    for (let i = 0; i < 2; i += 1) {
      const x = i === 0 ? -tireGap : tireGap;
      const y0 = skidY + 6;
      const y1 = skidY + 90;
      const y2 = skidY + 206;
      const sway = slip * 0.25;

      const startX = x + 8;
      const midX = x + carW * 0.33 + sway;
      const endX = x + carW * 0.26 + sway * 0.7;

      ctx.strokeStyle = 'rgba(245, 246, 250, 0.62)';
      ctx.lineWidth = 3.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Two identical S lines (same geometry), only translated horizontally.
      ctx.moveTo(startX, y0);
      ctx.bezierCurveTo(
        x + carW * 0.18 + sway * 0.7,
        skidY + 26,
        x + carW * 0.38 + sway,
        skidY + 60,
        midX,
        y1
      );
      ctx.bezierCurveTo(
        x - carW * 0.06 + sway * 0.5,
        skidY + 132,
        x + carW * 0.16 + sway * 0.6,
        skidY + 168,
        endX,
        y2
      );
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
    ctx.beginPath();
    ctx.ellipse(0, carH * 0.38, carW * 0.40, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tires
    ctx.fillStyle = '#151922';
    ctx.beginPath();
    ctx.roundRect(-carW * 0.39, carH * 0.23, carW * 0.10, carH * 0.20, 5);
    ctx.roundRect(carW * 0.29, carH * 0.23, carW * 0.10, carH * 0.20, 5);
    ctx.fill();

    // Main body, poster-like rear view with flat trunk
    const bodyGrad = ctx.createLinearGradient(0, -carH * 0.5, 0, carH * 0.35);
    bodyGrad.addColorStop(0, '#4b5060');
    bodyGrad.addColorStop(0.34, '#2f3343');
    bodyGrad.addColorStop(1, '#252a38');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-carW * 0.44, carH * 0.14);
    ctx.lineTo(-carW * 0.44, -carH * 0.02);
    ctx.quadraticCurveTo(-carW * 0.43, -carH * 0.27, -carW * 0.27, -carH * 0.46);
    ctx.lineTo(carW * 0.27, -carH * 0.46);
    ctx.quadraticCurveTo(carW * 0.43, -carH * 0.27, carW * 0.44, -carH * 0.02);
    ctx.lineTo(carW * 0.44, carH * 0.14);
    ctx.quadraticCurveTo(carW * 0.36, carH * 0.28, carW * 0.2, carH * 0.31);
    ctx.lineTo(-carW * 0.2, carH * 0.31);
    ctx.quadraticCurveTo(-carW * 0.36, carH * 0.28, -carW * 0.44, carH * 0.14);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(12, 14, 21, 0.88)';
    ctx.lineWidth = 3.4;
    ctx.stroke();

    // Rear windshield
    const glassGrad = ctx.createLinearGradient(0, -carH * 0.48, 0, -carH * 0.07);
    glassGrad.addColorStop(0, '#e4e7eb');
    glassGrad.addColorStop(1, '#6f8195');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.moveTo(-carW * 0.265, -carH * 0.055);
    ctx.quadraticCurveTo(-carW * 0.24, -carH * 0.28, -carW * 0.155, -carH * 0.44);
    ctx.lineTo(carW * 0.155, -carH * 0.44);
    ctx.quadraticCurveTo(carW * 0.24, -carH * 0.28, carW * 0.265, -carH * 0.055);
    ctx.closePath();
    ctx.fill();

    // Windshield highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
    ctx.beginPath();
    ctx.moveTo(-carW * 0.23, -carH * 0.1);
    ctx.lineTo(-carW * 0.16, -carH * 0.41);
    ctx.lineTo(-carW * 0.1, -carH * 0.41);
    ctx.lineTo(-carW * 0.18, -carH * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(carW * 0.22, -carH * 0.1);
    ctx.lineTo(carW * 0.12, -carH * 0.41);
    ctx.lineTo(carW * 0.19, -carH * 0.41);
    ctx.lineTo(carW * 0.27, -carH * 0.1);
    ctx.closePath();
    ctx.fill();

    // Trunk break line + high mount brake light
    ctx.strokeStyle = 'rgba(24, 28, 38, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-carW * 0.42, carH * 0.02);
    ctx.lineTo(carW * 0.42, carH * 0.02);
    ctx.stroke();
    ctx.fillStyle = '#7f1225';
    ctx.beginPath();
    ctx.moveTo(-carW * 0.18, -carH * 0.015);
    ctx.quadraticCurveTo(0, -carH * 0.055, carW * 0.18, -carH * 0.015);
    ctx.quadraticCurveTo(0, 0, -carW * 0.18, -carH * 0.015);
    ctx.closePath();
    ctx.fill();

    // Vertical tail lights
    const tailGradL = ctx.createLinearGradient(-carW * 0.35, 0, -carW * 0.24, 0);
    tailGradL.addColorStop(0, '#6f1929');
    tailGradL.addColorStop(1, '#db3552');
    ctx.fillStyle = tailGradL;
    ctx.beginPath();
    ctx.moveTo(-carW * 0.37, carH * 0.2);
    ctx.lineTo(-carW * 0.37, carH * 0.01);
    ctx.quadraticCurveTo(-carW * 0.35, -carH * 0.03, -carW * 0.3, -carH * 0.03);
    ctx.quadraticCurveTo(-carW * 0.27, -carH * 0.02, -carW * 0.25, carH * 0.02);
    ctx.lineTo(-carW * 0.25, carH * 0.2);
    ctx.closePath();
    ctx.fill();

    const tailGradR = ctx.createLinearGradient(carW * 0.25, 0, carW * 0.37, 0);
    tailGradR.addColorStop(0, '#db3552');
    tailGradR.addColorStop(1, '#6f1929');
    ctx.fillStyle = tailGradR;
    ctx.beginPath();
    ctx.moveTo(carW * 0.37, carH * 0.2);
    ctx.lineTo(carW * 0.37, carH * 0.01);
    ctx.quadraticCurveTo(carW * 0.35, -carH * 0.03, carW * 0.3, -carH * 0.03);
    ctx.quadraticCurveTo(carW * 0.27, -carH * 0.02, carW * 0.25, carH * 0.02);
    ctx.lineTo(carW * 0.25, carH * 0.2);
    ctx.closePath();
    ctx.fill();

    // Rear badge core (no white outer ring)
    ctx.fillStyle = '#a91e31';
    ctx.beginPath();
    ctx.roundRect(-carW * 0.029, carH * 0.045, carW * 0.058, carH * 0.044, 4);
    ctx.fill();

    // Bumper
    const bumperGrad = ctx.createLinearGradient(0, carH * 0.22, 0, carH * 0.44);
    bumperGrad.addColorStop(0, '#2a2f3d');
    bumperGrad.addColorStop(1, '#1e2330');
    ctx.fillStyle = bumperGrad;
    ctx.beginPath();
    ctx.roundRect(-carW * 0.44, carH * 0.16, carW * 0.88, carH * 0.17, 9);
    ctx.fill();

    // Plate
    ctx.fillStyle = '#f0f1f2';
    ctx.strokeStyle = 'rgba(114, 122, 132, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-carW * 0.12, carH * 0.205, carW * 0.24, carH * 0.105, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#222831';
    ctx.font = `${Math.floor(carW * 0.037)}px "Noto Sans SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('苏U ZM245', 0, carH * 0.257);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    // Mirrors
    ctx.fillStyle = '#2e3342';
    ctx.strokeStyle = 'rgba(15, 18, 26, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-carW * 0.56, -carH * 0.12, carW * 0.11, carH * 0.07, 4);
    ctx.roundRect(carW * 0.45, -carH * 0.12, carW * 0.11, carH * 0.07, 4);
    ctx.fill();
    ctx.stroke();

    if (logoImgLoaded) {
      const logoW = carW * 0.08;
      const logoH = logoW * 0.95;
      ctx.drawImage(logoImg, -logoW * 0.5, carH * 0.028, logoW, logoH);
    }

    ctx.restore();
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
    const drift = Math.sin((performance.now() + latest.km * 22) * 0.0028) * (9 + speed * 6);

    drawBackground(palette, latest.km);
    drawCnyLanternBand(latest.km);
    drawRoad(palette, latest.km, speed, drift);
    drawCar(speed, drift);
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
