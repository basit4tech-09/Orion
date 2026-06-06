// ── Guard ──
const user = localStorage.getItem('activeUser');
if (!user) window.location.href = 'login.html';

document.getElementById('nav-username').textContent = user;
const key = `user_${user}`;

function getData() {
  return JSON.parse(localStorage.getItem(key) || '{}');
}
function saveData(data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── TABS ──
document.querySelectorAll('.timer-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.timer-tabs .tab-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.timer-panel')
      .forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${btn.dataset.tab}`)
      .classList.remove('hidden');
  });
});

// ══════════════════════════════
// ── COUNTDOWN ──
// ══════════════════════════════
let cdInterval = null;
let cdRemaining = 0;
let cdRunning = false;

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateCdDisplay() {
  document.getElementById('countdown-display').textContent =
    formatTime(cdRemaining);
}

document.getElementById('cd-start').addEventListener('click', () => {
  if (cdRunning) return;

  if (cdRemaining === 0) {
    const h = parseInt(document.getElementById('cd-hours').value) || 0;
    const m = parseInt(document.getElementById('cd-minutes').value) || 0;
    const s = parseInt(document.getElementById('cd-seconds').value) || 0;
    cdRemaining = h * 3600 + m * 60 + s;
  }

  if (cdRemaining === 0) return;

  // Save timer count
  const data = getData();
  data.timersSet = (data.timersSet || 0) + 1;
  saveData(data);

  cdRunning = true;
  document.getElementById('cd-note').textContent = '⏳ Countdown running...';

  cdInterval = setInterval(() => {
    cdRemaining--;
    updateCdDisplay();
    if (cdRemaining <= 0) {
      clearInterval(cdInterval);
      cdRunning = false;
      document.getElementById('cd-note').textContent = '✅ Time is up!';
      document.getElementById('countdown-display').textContent = '00:00:00';
      alert('⏰ Time is up!');
    }
  }, 1000);
});

document.getElementById('cd-pause').addEventListener('click', () => {
  clearInterval(cdInterval);
  cdRunning = false;
  document.getElementById('cd-note').textContent = '⏸ Paused';
});

document.getElementById('cd-reset').addEventListener('click', () => {
  clearInterval(cdInterval);
  cdRunning = false;
  cdRemaining = 0;
  document.getElementById('countdown-display').textContent = '00:00:00';
  document.getElementById('cd-note').textContent = '';
});

// ══════════════════════════════
// ── STOPWATCH ──
// ══════════════════════════════
let swInterval = null;
let swRunning = false;
let swElapsed = 0;
let lapCount = 0;

function updateSwDisplay() {
  document.getElementById('sw-display').textContent = formatTime(swElapsed);
}

document.getElementById('sw-start').addEventListener('click', () => {
  if (swRunning) return;
  swRunning = true;
  swInterval = setInterval(() => {
    swElapsed++;
    updateSwDisplay();
  }, 1000);
});

document.getElementById('sw-pause').addEventListener('click', () => {
  clearInterval(swInterval);
  swRunning = false;
});

document.getElementById('sw-reset').addEventListener('click', () => {
  clearInterval(swInterval);
  swRunning = false;
  swElapsed = 0;
  lapCount = 0;
  updateSwDisplay();
  document.getElementById('lap-list').innerHTML = '';
});

document.getElementById('sw-lap').addEventListener('click', () => {
  if (!swRunning) return;
  lapCount++;
  const lapList = document.getElementById('lap-list');
  const div = document.createElement('div');
  div.className = 'lap-item';
  div.innerHTML = `<span>Lap ${lapCount}</span> ${formatTime(swElapsed)}`;
  lapList.prepend(div);
});

// ══════════════════════════════
// ── ALARM ──
// ══════════════════════════════
function renderAlarms() {
  const data = getData();
  const alarms = data.alarms || [];
  const list = document.getElementById('alarm-list');

  if (alarms.length === 0) {
    list.innerHTML = `
      <div class="empty-activities">
        <span>🔔</span>
        <p>No alarms set yet.</p>
      </div>`;
    return;
  }

  list.innerHTML = alarms.map(a => `
    <div class="alarm-item ${a.fired ? 'fired' : ''}">
      <div class="alarm-info">
        <div class="alarm-time-text">${a.time}</div>
        <div class="alarm-label-text">${a.label || 'No label'}</div>
      </div>
      <button class="alarm-delete" onclick="deleteAlarm('${a.id}')">🗑️</button>
    </div>
  `).join('');
}

document.getElementById('add-alarm').addEventListener('click', () => {
  const time = document.getElementById('alarm-time').value;
  const label = document.getElementById('alarm-label').value.trim();
  if (!time) return;

  const data = getData();
  if (!data.alarms) data.alarms = [];
  data.alarms.push({ id: Date.now().toString(), time, label, fired: false });
  saveData(data);
  renderAlarms();

  document.getElementById('alarm-time').value = '';
  document.getElementById('alarm-label').value = '';
});

function deleteAlarm(id) {
  const data = getData();
  data.alarms = data.alarms.filter(a => a.id !== id);
  saveData(data);
  renderAlarms();
}

// ── Check alarms every 30 seconds ──
function checkAlarms() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const data = getData();
  const alarms = data.alarms || [];
  let updated = false;

  alarms.forEach(a => {
    if (a.time === currentTime && !a.fired) {
      alert(`🔔 Alarm: ${a.label || 'Time is up!'}`);
      a.fired = true;
      updated = true;
    }
  });

  if (updated) {
    saveData(data);
    renderAlarms();
  }
}

setInterval(checkAlarms, 30000);

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
renderAlarms();