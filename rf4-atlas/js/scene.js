// Холст в шапке: небо, лес, вода, поплавок, рыба и линейка глубины. Цвета читаются из CSS-переменных.
import { $ } from './dom.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

export function initScene() {
  const canvas = $('#scene');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { redraw() {} };
  const css = getComputedStyle(document.documentElement);
  let W = 0, H = 0, colors = {}, raf = 0, ripples = [], lastBite = -1e9;

  const readColors = () => {
    const g = (n) => css.getPropertyValue(n).trim();
    colors = { sky1: g('--sky1'), sky2: g('--sky2'), glow: g('--glow'), w1: g('--w1'), w2: g('--w2'), w3: g('--w3'),
      tree1: g('--tree1'), tree2: g('--tree2'), accent: g('--accent'), ink: g('--ink') };
  };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function trees(base, amp, color, seed) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, base);
    for (let x = 0; x <= W; x += 14) {
      const h = amp * (0.55 + 0.45 * Math.abs(Math.sin(x * 0.045 + seed) * Math.cos(x * 0.013 + seed * 2)));
      ctx.lineTo(x, base - h); ctx.lineTo(x + 7, base - h * 0.55);
    }
    ctx.lineTo(W, base); ctx.closePath(); ctx.fill();
  }

  function draw(t) {
    const waterY = H * 0.62;
    const sky = ctx.createLinearGradient(0, 0, 0, waterY);
    sky.addColorStop(0, colors.sky1); sky.addColorStop(1, colors.sky2);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = colors.glow; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.arc(W * 0.8, waterY - H * 0.22, Math.min(W, H) * 0.07, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    trees(waterY, H * 0.2, colors.tree2, 1.3);
    trees(waterY + 2, H * 0.14, colors.tree1, 4.1);

    const water = ctx.createLinearGradient(0, waterY, 0, H);
    water.addColorStop(0, colors.w1); water.addColorStop(0.45, colors.w2); water.addColorStop(1, colors.w3);
    ctx.fillStyle = water; ctx.fillRect(0, waterY, W, H - waterY);

    ctx.strokeStyle = colors.glow; ctx.globalAlpha = 0.18; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = waterY + 10 + i * ((H - waterY) / 6.5);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.03 + t / 900 + i) * 1.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // линейка глубины справа
    ctx.fillStyle = colors.ink; ctx.globalAlpha = 0.5; ctx.font = '10px IBM Plex Mono, monospace';
    for (let i = 0; i < 5; i++) {
      const y = waterY + 14 + i * ((H - waterY - 20) / 5);
      ctx.fillRect(W - 24, y, 10, 1); ctx.fillText(`${i + 1} м`, W - 52, y + 3);
    }
    ctx.globalAlpha = 1;

    // поплавок и поклёвка: цикл 9 секунд
    const phase = (t % 9000) / 9000;
    const bite = phase > 0.78 && phase < 0.9;
    if (bite && t - lastBite > 8000) { lastBite = t; ripples.push({ t0: t }); }
    const bx = W * 0.62, dip = bite ? Math.sin((phase - 0.78) / 0.12 * Math.PI) * 9 : Math.sin(t / 700) * 1.2;
    const by = waterY + 14 + dip;
    ctx.strokeStyle = colors.ink; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, -4); ctx.quadraticCurveTo(bx + 6, by * 0.45, bx, by - 12); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = colors.accent; ctx.beginPath(); ctx.ellipse(bx, by - 5, 4, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = colors.glow; ctx.fillRect(bx - 4, by - 7, 8, 2);

    ripples = ripples.filter((r) => t - r.t0 < 2600);
    ctx.strokeStyle = colors.glow;
    for (const r of ripples) {
      const k = (t - r.t0) / 2600;
      ctx.globalAlpha = 0.6 * (1 - k);
      ctx.beginPath(); ctx.ellipse(bx, waterY + 14, 8 + k * 60, 2 + k * 10, 0, 0, 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // рыба под водой
    const fx = ((t / 40) % (W + 120)) - 60;
    ctx.fillStyle = colors.w3; ctx.globalAlpha = 0.75;
    const fy = waterY + (H - waterY) * 0.55 + Math.sin(t / 600) * 3;
    ctx.beginPath(); ctx.ellipse(fx, fy, 16, 5, 0, 0, 7); ctx.moveTo(fx - 14, fy);
    ctx.lineTo(fx - 26, fy - 6); ctx.lineTo(fx - 26, fy + 6); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }

  function frame(t) {
    draw(t);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    cancelAnimationFrame(raf);
    resize(); readColors();
    if (reduce.matches) draw(7200); else raf = requestAnimationFrame(frame);
  }

  new ResizeObserver(start).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else start();
  });
  reduce.addEventListener('change', start);
  start();
  return { redraw: start };
}
