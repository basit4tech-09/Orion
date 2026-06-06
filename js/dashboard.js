// ── Guard — redirect if no user ──
const user = localStorage.getItem('activeUser');
if (!user) window.location.href = 'login.html';

// ── Show username ──
document.getElementById('nav-username').textContent = user;
document.getElementById('welcome-msg').textContent = `Welcome back, ${user} 👋`;

// ── Show date ──
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();
document.getElementById('welcome-date').textContent =
  `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

// ── Load stats ──
const key = `user_${user}`;
const data = JSON.parse(localStorage.getItem(key) || '{}');

const activities = data.activities || [];
const doneTasks = activities.filter(a => a.done).length;
document.getElementById('stat-activities').textContent = doneTasks;
document.getElementById('stat-timers').textContent = data.timersSet || 0;
document.getElementById('stat-ai').textContent = data.aiChats || 0;
document.getElementById('stat-streak').textContent = data.streak || 0;

// ── Recent activities ──
const recentList = document.getElementById('recent-list');
if (activities.length > 0) {
  const recent = activities.slice(-4).reverse();
  recentList.innerHTML = recent.map(a => `
    <div class="recent-item">
      <span class="recent-item-name">${a.name}</span>
      <span class="recent-item-status ${a.done ? 'status-done' : 'status-pending'}">
        ${a.done ? '✅ Done' : '⏳ Pending'}
      </span>
    </div>
  `).join('');
} 
// ── Orbs ──
['orb-1', 'orb-2', 'orb-3','orb-4','orb-5'].forEach(cls => {
  const orb = document.createElement('div');
  orb.classList.add('orb', cls);
  document.body.appendChild(orb);
});

// ── Logout ──
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('activeUser');
  window.location.href = 'login.html';
});

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const dashLinks = document.querySelector('.dash-links');
hamburger.addEventListener('click', () => {
  dashLinks.classList.toggle('open');
});