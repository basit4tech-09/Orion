// ── Loader ──
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hide');
  setTimeout(() => loader.remove(), 400);
});
// ── Guard ──
const user = localStorage.getItem('activeUser');
if (!user) window.location.href = 'login.html';
// ── Theme toggle ──
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  document.body.classList.add('light');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// ── Setup ──
document.getElementById('nav-username').textContent = user;
const key = `user_${user}`;

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();
document.getElementById('activity-date').textContent =
  `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;

// ── Load data ──
function getData() {
  return JSON.parse(localStorage.getItem(key) || '{}');
}

function saveData(data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Category icons ──
const catIcons = {
  general: '📌',
  anime: '🎌',
  work: '💼',
  fitness: '💪',
  personal: '👤'
};

// ── Render activities ──
let currentFilter = 'all';

function render() {
  const data = getData();
  const activities = data.activities || [];

  // Progress
  const done = activities.filter(a => a.done).length;
  const total = activities.length;
  document.getElementById('progress-text').textContent = `${done} of ${total} done`;
  document.getElementById('progress-fill').style.width =
    total > 0 ? `${(done / total) * 100}%` : '0%';

  // Filter
  const filtered = activities.filter(a => {
    if (currentFilter === 'done') return a.done;
    if (currentFilter === 'pending') return !a.done;
    return true;
  });

  const list = document.getElementById('activity-list');

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-activities">
        <span>📭</span>
        <p>No activities here yet. Add one above!</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map((a, i) => `
    <div class="activity-item ${a.done ? 'done' : ''}" data-id="${a.id}">
      <button class="activity-check ${a.done ? 'checked' : ''}"
        onclick="toggleDone('${a.id}')">
        ${a.done ? '✓' : ''}
      </button>
      <div class="activity-info">
        <span class="activity-name">${a.name}</span>
        <div class="activity-meta">
          <span class="activity-category">${catIcons[a.category]} ${a.category}</span>
          <span class="activity-time">${a.time}</span>
        </div>
      </div>
      <button class="activity-delete" onclick="deleteActivity('${a.id}')">🗑️</button>
    </div>
  `).join('');
}

// ── Add activity ──
document.getElementById('add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('activity-input').value.trim();
  const category = document.getElementById('activity-category').value;
  if (!name) return;

  const data = getData();
  if (!data.activities) data.activities = [];

  data.activities.push({
    id: Date.now().toString(),
    name,
    category,
    done: false,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveData(data);
  document.getElementById('activity-input').value = '';
  render();
});

// ── Toggle done ──
function toggleDone(id) {
  const data = getData();
  const activity = data.activities.find(a => a.id === id);
  if (activity) {
    activity.done = !activity.done;
    saveData(data);
    render();
  }
}

// ── Delete ──
function deleteActivity(id) {
  const data = getData();
  data.activities = data.activities.filter(a => a.id !== id);
  saveData(data);
  render();
}

// ── Filter tabs ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    render();
  });
});

// ── Logout ──
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('activeUser');
  window.location.href = 'login.html';
});

// ── Hamburger ──
document.getElementById('hamburger').addEventListener('click', () => {
  document.querySelector('.dash-links').classList.toggle('open');
});

// ── Init ──
render();