// replace with your GitHub username to pull real activity
const GITHUB_USERNAME = "sadqma";

const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
});

const techs = ["Python","SQL","Pandas","NumPy","scikit-learn","Power BI","Tableau","Excel","Git","Jupyter","Matplotlib","Statistics"];
const track = document.getElementById('marqueeTrack');
const buildPills = () => techs.map(t => `<div class="pill">${t}</div>`).join('');
track.innerHTML = buildPills() + buildPills();

const gallery = document.getElementById('gallery');
const cards = gallery.querySelectorAll('.gallery-card');
let idx = 0;
gallery.addEventListener('click', () => {
  cards[idx].classList.remove('active');
  idx = (idx + 1) % cards.length;
  cards[idx].classList.add('active');
});

document.getElementById('visitCount').textContent = 'Visits: ' + (1000 + Math.floor(Math.random() * 500));

// ---- GitHub activity ----
const ghGrid = document.getElementById('ghGrid');
const ghMonths = document.getElementById('ghMonths');
const ghCount = document.getElementById('ghCount');
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
months.forEach(m => {
  const s = document.createElement('span');
  s.textContent = m;
  s.style.width = '30px';
  ghMonths.appendChild(s);
});

const levelColor = ['var(--green-0)','var(--green-1)','var(--green-2)','var(--green-3)','var(--green-4)'];

function renderGrid(days) {
  // days: array of {date, count, level(0-4)}
  ghGrid.innerHTML = '';
  days.forEach(d => {
    const cell = document.createElement('div');
    cell.className = 'gh-cell';
    cell.title = `${d.date}: ${d.count}`;
    cell.style.background = levelColor[d.level] || levelColor[0];
    ghGrid.appendChild(cell);
  });
}

function renderFallbackRandom() {
  const days = [];
  for (let i = 0; i < 52 * 7; i++) {
    const r = Math.random();
    const level = r < 0.35 ? 0 : r < 0.55 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4;
    days.push({ date: '', count: level, level });
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

