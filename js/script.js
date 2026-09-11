// ---- always land at the top on a fresh visit (not wherever the browser last scrolled to) ----
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);
window.addEventListener('pageshow', () => { if (!location.hash) window.scrollTo(0, 0); });

// replace with your GitHub username to pull real activity
const GITHUB_USERNAME = "sadqma";

// ---- theme toggle ----
const themeBtn = document.getElementById('themeBtn');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');
function applyThemeIcons() {
  const isDark = document.documentElement.classList.contains('dark');
  sunIcon.style.opacity = isDark ? '0' : '1';
  sunIcon.style.transform = isDark ? 'rotate(90deg) scale(.5)' : 'rotate(0) scale(1)';
  moonIcon.style.opacity = isDark ? '1' : '0';
  moonIcon.style.transform = isDark ? 'rotate(0) scale(1)' : 'rotate(-90deg) scale(.5)';
  themeBtn.title = isDark ? 'Switch to light' : 'Switch to dark';
}
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
themeBtn.addEventListener('click', () => {
  const goingDark = !document.documentElement.classList.contains('dark');
  const toggle = () => {
    document.documentElement.classList.toggle('dark');
    applyThemeIcons();
  };
  if (prefersReducedMotion) { toggle(); return; }

  const pulse = document.createElement('span');
  pulse.className = `theme-pulse ${goingDark ? 'bg-indigo-300/40' : 'bg-amber-300/50'}`;
  themeBtn.appendChild(pulse);
  setTimeout(() => pulse.remove(), 600);

  const glint = document.createElement('div');
  glint.className = 'theme-glint slicing';
  document.body.appendChild(glint);
  setTimeout(() => glint.remove(), 900);

  if (document.startViewTransition) {
    document.startViewTransition(toggle);
  } else {
    toggle();
  }
});
applyThemeIcons();

// ---- avatar pixel dissolve (hover swaps photo via a sampled-color pixel grid) ----
(function initPixelAvatar() {
  const wrap = document.querySelector('.avatar');
  const front = wrap.querySelector('.front');
  const back = wrap.querySelector('.back');
  const GRID = 8;

  const layer = document.createElement('div');
  layer.className = 'pixel-layer';
  wrap.appendChild(layer);
  const tiles = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const t = document.createElement('div');
      t.className = 'pixel-tile';
      t.style.left = (c * 100 / GRID) + '%';
      t.style.top = (r * 100 / GRID) + '%';
      t.style.width = (100 / GRID) + '%';
      t.style.height = (100 / GRID) + '%';
      layer.appendChild(t);
      tiles.push(t);
    }
  }

  const ready = img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; });
  const canvas = document.createElement('canvas');
  canvas.width = GRID; canvas.height = GRID;
  const ctx = canvas.getContext('2d');
  function sampleColors(img) {
    ctx.clearRect(0, 0, GRID, GRID);
    ctx.drawImage(img, 0, 0, GRID, GRID);
    const data = ctx.getImageData(0, 0, GRID, GRID).data; // throws if canvas is tainted (e.g. opened via file://)
    const colors = [];
    for (let i = 0; i < GRID * GRID; i++) {
      const o = i * 4;
      colors.push(`rgb(${data[o]},${data[o + 1]},${data[o + 2]})`);
    }
    return colors;
  }

  let pending;
  function dissolve(colors, showTarget, hideTarget) {
    clearTimeout(pending);
    const order = tiles.map((_, i) => i).sort(() => Math.random() - 0.5);
    tiles.forEach((t, i) => {
      t.style.transitionDelay = (order.indexOf(i) / tiles.length * 260) + 'ms';
      t.style.background = colors[i];
      t.style.opacity = '1';
    });
    pending = setTimeout(() => {
      showTarget.style.opacity = '1';
      hideTarget.style.opacity = '0';
      tiles.forEach(t => { t.style.transitionDelay = '0ms'; t.style.opacity = '0'; });
    }, 260 + 220);
  }

  // devices with a real mouse get hover; touch devices (no hover) get tap-to-toggle instead —
  // mouseenter/mouseleave don't reliably pair up on tap, which left the photo stuck on touch
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let showingBack = false;
  function bindInteraction(showBack, showFront) {
    if (supportsHover) {
      wrap.addEventListener('mouseenter', showBack);
      wrap.addEventListener('mouseleave', showFront);
    } else {
      wrap.addEventListener('click', () => {
        showingBack = !showingBack;
        (showingBack ? showBack : showFront)();
      });
    }
  }

  let frontColors, backColors;
  Promise.all([ready(front), ready(back)]).then(() => {
    try {
      frontColors = sampleColors(front);
      backColors = sampleColors(back);
    } catch (e) {
      // canvas pixel read blocked (e.g. file:// origin) — fall back to a plain crossfade
      bindInteraction(
        () => { back.style.opacity = '1'; front.style.opacity = '0'; },
        () => { front.style.opacity = '1'; back.style.opacity = '0'; }
      );
      return;
    }
    bindInteraction(
      () => dissolve(backColors, back, front),
      () => dissolve(frontColors, front, back)
    );
  });
})();

// ---- technologies marquee ----
const techs = [
  { name: "Python", icon: "fab fa-python", color: "#3776AB" },
  { name: "SQL", icon: "fas fa-database", color: "#336791" },
  { name: "Pandas", icon: null },
  { name: "NumPy", icon: null },
  { name: "scikit-learn", icon: null },
  { name: "Power BI", icon: "fas fa-chart-column", color: "#F2C811" },
  { name: "Tableau", icon: null },
  { name: "Excel", icon: "fas fa-file-excel", color: "#1D6F42" },
  { name: "Git", icon: "fab fa-git-alt", color: "#F05032" },
  { name: "Jupyter", icon: null },
  { name: "Matplotlib", icon: null },
  { name: "Statistics", icon: "fas fa-chart-line", color: "#9ca3af" },
];
const track = document.getElementById('marqueeTrack');
const pillClass = "bg-white dark:bg-ink shrink-0 inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-3.5 py-1.75 text-[0.95rem] leading-none text-gray-800 dark:text-gray-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600";
const buildPills = () => techs.map(t => `
  <span class="${pillClass}">${t.icon ? `<i class="${t.icon}" style="color:${t.color}"></i>` : ''}${t.name}</span>
`).join('');
track.innerHTML = buildPills() + buildPills();

// ---- project card spotlight (mouse-tracked glow) ----
document.querySelectorAll('.card-spotlight').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});

// ---- outside the IDE fanned card stack ----
const gallery = document.getElementById('gallery');
let order = Array.from(gallery.querySelectorAll('.gallery-card'));
function layoutGallery() {
  order.forEach((card, i) => {
    card.classList.remove('pos-0', 'pos-1', 'pos-2', 'pos-3');
    card.classList.add(`pos-${i}`);
  });
}
layoutGallery();

const DRAG_THRESHOLD = 60; // raw px dragged before the card cycles to the back
const TAP_THRESHOLD = 8;   // raw px of movement still counted as a plain tap
const ELASTIC = 0.5;       // rubber-band resistance while actively dragging
let drag = null;

gallery.addEventListener('pointerdown', e => {
  const card = order[0];
  if (!card.contains(e.target)) return;
  try { card.setPointerCapture(e.pointerId); } catch (err) { /* no active pointer to capture — drag still works via bubbling */ }
  card.classList.add('dragging');
  drag = { card, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, dx: 0, dy: 0 };
});

// listen on window (not just the card/gallery) so the drag still tracks correctly
// even if the pointer ends up outside the card's bounds mid-gesture
window.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.pointerId) return;
  drag.dx = e.clientX - drag.startX;
  drag.dy = e.clientY - drag.startY;
  const x = drag.dx * ELASTIC, y = drag.dy * ELASTIC;
  drag.card.style.transform = `translate(${x}px, ${y}px) rotate(${x / 14}deg)`;
});

function endDrag(e) {
  if (!drag || (e && e.pointerId !== drag.pointerId)) return;
  const { card, dx, dy } = drag;
  drag = null;
  card.classList.remove('dragging'); // re-enables the card's own transform transition
  card.style.transform = ''; // let that transition carry it from the drag offset to its resting spot

  const dist = Math.hypot(dx, dy);
  if (dist <= TAP_THRESHOLD || dist >= DRAG_THRESHOLD) {
    // tap, or dragged far enough — cycle it to the back of the stack
    order.push(order.shift());
    layoutGallery();
  }
  // otherwise: dragged a bit but not far enough — it just springs back to the front
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);

// ---- real visit counter (abacus.jasoncameron.dev, free hit-counter API) ----
const visitEl = document.getElementById('visitCount');
fetch('https://abacus.jasoncameron.dev/hit/sadqma-portfolio/visits')
  .then(res => res.json())
  .then(data => { visitEl.textContent = `Visited by ${data.value} people`; })
  .catch(() => {
    // offline/blocked fallback: real per-browser count, honestly labeled (not a global figure)
    const count = parseInt(localStorage.getItem('localVisitCount') || '0', 10) + 1;
    localStorage.setItem('localVisitCount', count);
    visitEl.textContent = `Visited ${count}× from this browser`;
  });

// ---- GitHub activity ----
const ghGrid = document.getElementById('ghGrid');
const ghMonths = document.getElementById('ghMonths');
const ghCount = document.getElementById('ghCount');
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// level -> tailwind-equivalent colors (light / dark), matching GitHub-style 5-step scale
const levelColors = [
  { light: '#f3f4f6', dark: '#1f2937' }, // 0 gray-100 / gray-800
  { light: '#a7f3d0', dark: '#064e3b' }, // 1 emerald-200 / emerald-900
  { light: '#34d399', dark: '#047857' }, // 2 emerald-400 / emerald-700
  { light: '#10b981', dark: '#10b981' }, // 3 emerald-500 / emerald-500
  { light: '#047857', dark: '#6ee7b7' }, // 4 emerald-700 / emerald-300
];
function cellColor(level) {
  const isDark = document.documentElement.classList.contains('dark');
  const c = levelColors[level] || levelColors[0];
  return isDark ? c.dark : c.light;
}

function renderGrid(days) {
  // days: array of {date, count, level(0-4)}, oldest first, ~371 entries starting on a Sunday
  ghGrid.innerHTML = '';
  ghMonths.innerHTML = '';

  // shrink cells on narrow screens so the whole year fits without horizontal scrolling
  const isMobile = window.innerWidth < 640;
  const cellClass = isMobile ? 'w-1 h-1' : 'w-2.5 h-2.5';
  const gapClass = isMobile ? 'gap-px' : 'gap-0.75';
  const labelWidth = isMobile ? 'w-1' : 'w-2.5';
  ghGrid.parentElement.classList.remove('min-w-150');
  ghMonths.className = `flex ${gapClass} pl-0 text-[10px] text-gray-400 dark:text-gray-500`;
  ghGrid.className = `flex ${gapClass}`;

  // build week columns
  const weeks = [];
  let week = [];
  days.forEach(d => {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length) weeks.push(week);

  let lastMonth = -1;
  weeks.forEach(w => {
    const label = document.createElement('div');
    label.className = `${labelWidth} shrink-0`;
    const firstDay = w.find(d => d.date);
    if (firstDay) {
      const m = new Date(firstDay.date).getMonth();
      if (m !== lastMonth) { label.textContent = isMobile ? '' : monthNames[m]; lastMonth = m; }
    }
    ghMonths.appendChild(label);

    const col = document.createElement('div');
    col.className = `flex flex-col ${gapClass}`;
    w.forEach(d => {
      const cell = document.createElement('div');
      cell.className = `${cellClass} rounded-sm`;
      cell.title = d.date ? `${d.count} contributions on ${d.date}` : '';
      cell.style.background = cellColor(d.level);
      col.appendChild(cell);
    });
    ghGrid.appendChild(col);
  });
}

function renderFallbackRandom() {
  const days = [];
  const start = new Date();
  start.setDate(start.getDate() - 52 * 7);
  for (let i = 0; i < 52 * 7; i++) {
    const r = Math.random();
    const level = r < 0.35 ? 0 : r < 0.55 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4;
    const d = new Date(start); d.setDate(d.getDate() + i);
    days.push({ date: d.toISOString().slice(0,10), count: level, level });
  }
  renderGrid(days);
  ghCount.textContent = 'Demo data (could not load real contributions)';
}

// Public unofficial API, returns the real GitHub contribution calendar without a token:
// https://github-contributions-api.jogruber.de/v4/USERNAME
// Note: opening this file directly (file://) can block this request in some browsers.
// Serve it locally instead, e.g. run `python -m http.server` in this folder and open
// http://localhost:8000/index.html
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 8000);

fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}`, { signal: controller.signal })
  .then(res => {
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
    return res.json();
  })
  .then(data => {
    if (data.error) throw new Error(data.error);
    const days = (data.contributions || []).map(c => ({ date: c.date, count: c.count, level: c.level }));
    renderGrid(days);
    const total = data.total && data.total.lastYear != null ? data.total.lastYear : days.reduce((s, d) => s + d.count, 0);
    ghCount.textContent = `${total} contributions in the last year (@${GITHUB_USERNAME})`;
  })
  .catch(err => {
    console.error('GitHub activity fetch failed:', err);
    renderFallbackRandom();
  });
