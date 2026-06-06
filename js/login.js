// ── Loader ──
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hide');
  setTimeout(() => loader.remove(), 400);
});
// ── On form submit ──
const form = document.getElementById('login-form');
const input = document.getElementById('name-input');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = input.value.trim();
  if (!name) return;

  // Save current user as active
  localStorage.setItem('activeUser', name);

  // Save to users list if not already there
  let users = JSON.parse(localStorage.getItem('allUsers') || '[]');
  if (!users.includes(name)) {
    users.push(name);
    localStorage.setItem('allUsers', JSON.stringify(users));
  }

  // Go to dashboard
  window.location.href = 'dashboard.html';
});

// ── Show saved users ──
const savedUsers = document.getElementById('saved-users');
let users = JSON.parse(localStorage.getItem('allUsers') || '[]');

if (users.length > 0) {
  savedUsers.innerHTML = `
    <p class="saved-users-title">Welcome back —</p>
    <div class="saved-users-list">
      ${users.map(u => `
        <button class="saved-user-btn" onclick="loginAs('${u}')">${u}</button>
      `).join('')}
    </div>
  `;
}
// ── Orbs ──
['orb-1', 'orb-2', 'orb-3','orb-4','orb-5'].forEach(cls => {
  const orb = document.createElement('div');
  orb.classList.add('orb', cls);
  document.body.appendChild(orb);
});

// ── Quick login as saved user ──
function loginAs(name) {
  localStorage.setItem('activeUser', name);
  window.location.href = 'dashboard.html';
}