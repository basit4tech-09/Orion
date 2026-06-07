// ── Loader ──
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hide');
  setTimeout(() => loader.remove(), 400);
});
// ── Guard ──
const user = localStorage.getItem('activeUser');
if (!user) window.location.href = 'index.html';

document.getElementById('nav-username').textContent = user;
document.getElementById('chat-username').textContent = user;
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

// 🟢 Netlify Secure Endpoint (API Key is hidden safely on the backend)
const NETLIFY_API_URL = '/.netlify/functions/chat';

const key = `user_${user}`;

function getData() {
  return JSON.parse(localStorage.getItem(key) || '{}');
}
function saveData(data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function trackChat() {
  const data = getData();
  data.aiChats = (data.aiChats || 0) + 1;
  saveData(data);
}

// ── TABS ──
document.querySelectorAll('.timer-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.timer-tabs .tab-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.ai-panel')
      .forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${btn.dataset.tab}`)
      .classList.remove('hidden');
  });
});

// ══════════════════════════════
// ── CALL AI (CENTRAL ROUTER) ──
// ══════════════════════════════
async function callAI(prompt, systemMsg = '') {
  const messages = [];
  if (systemMsg) messages.push({ role: 'system', content: systemMsg });
  messages.push({ role: 'user', content: prompt });

  // Sends the payload to your backend Netlify Function
  const response = await fetch(NETLIFY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages: messages })
  });

  if (!response.ok) {
    throw new Error(`Netlify function error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ══════════════════════════════
// ── CHATBOX ──
// ══════════════════════════════
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatHistory = [
  {
    role: 'system',
    content: `You are a friendly personal assistant for ${user}. Keep responses concise, warm and helpful.`
  }
];

function addMsg(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role === 'user' ? 'user-msg' : 'ai-msg'}`;
 div.innerHTML = `
  <span class="msg-avatar">${role === 'user' ? '👤' : '🤖'}</span>
  <div class="msg-bubble">${role === 'user' ? text : parseMarkdown(text)}</div>
`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg ai-msg';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <span class="msg-avatar">🤖</span>
    <div class="typing">
      <span></span><span></span><span></span>
    </div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typing-indicator');
  if (t) t.remove();
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (!msg) return;

  addMsg(msg, 'user');
  chatInput.value = '';
  chatHistory.push({ role: 'user', content: msg });
  showTyping();

  try {
    // Routes the current text prompt straight through the global callAI system
    const reply = await callAI(msg);
    
    chatHistory.push({ role: 'assistant', content: reply });
    removeTyping();
    addMsg(reply, 'ai');
    trackChat();

  } catch (err) {
    console.error("Chat Error:", err);
    removeTyping();
    addMsg('Sorry something went wrong. Try again! 😅', 'ai');
  }
});

// ══════════════════════════════
// ── ANIME RATER ──
// ══════════════════════════════
document.getElementById('rater-btn').addEventListener('click', async () => {
  const anime = document.getElementById('rater-anime').value.trim();
  const chapter = document.getElementById('rater-chapter').value.trim();
  const platform = document.getElementById('rater-platform').value;
  const result = document.getElementById('rater-result');

  if (!anime || !chapter || !platform) {
    alert('Please fill in all fields!');
    return;
  }

  result.classList.remove('hidden');
  result.innerHTML = '<p class="ai-loading">🎌 Rating chapter... please wait</p>';

  try {
    const reply = await callAI(
      `Rate the anime chapter with the following details:
      - Anime: ${anime}
      - Chapter: ${chapter}
      - Publishing Platform: ${platform}
      
      Give a rating out of 10, explain the rating with 3-4 sentences covering:
      plot progression, art quality, character development, and overall impact.
      Format it clearly with the rating first, then the review.`
    );
    result.innerHTML = renderStars(parseMarkdown(reply));
    trackChat();
  } catch (err) {
    console.error("Rater Error:", err);
    result.textContent = 'Something went wrong. Try again!';
  }
});

// ══════════════════════════════
// ── TOP 10 ──
// ══════════════════════════════
document.getElementById('top10-btn').addEventListener('click', async () => {
  const genre = document.getElementById('top10-genre').value;
  const result = document.getElementById('top10-result');

  if (!genre) {
    alert('Please select a genre!');
    return;
  }

  result.classList.remove('hidden');
  result.innerHTML = '<p class="ai-loading">🏆 Building your top 10... please wait</p>';

  try {
    const reply = await callAI(
      `Give me the top 10 anime of all time in the ${genre} genre.
      For each anime include:
      - Rank number
      - Anime name
      - One sentence about why it's on the list
      - A rating out of 10
      Format it as a clean numbered list.`
    );
    result.innerHTML = parseMarkdown(reply);

    trackChat();
  } catch (err) {
    console.error("Top 10 Error:", err);
    result.textContent = 'Something went wrong. Try again!';
  }
});
function renderStars(text) {
  // Find rating pattern like 8/10 or 7.5/10
  return text.replace(/(\d+(\.\d+)?)\/10/g, (match, num) => {
    const rating = Math.round(parseFloat(num));
    const filled = '⭐'.repeat(rating);
    const empty = '★'.repeat(10 - rating);
    return `
      <div class="star-rating">
        <span class="stars">${filled}${empty}</span>
        <span class="rating-num">${num}/10</span>
      </div>
    `;
  });
}
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ── Logout ──
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('activeUser');
  window.location.href = 'index.html';
});

// ── Hamburger ──
document.getElementById('hamburger').addEventListener('click', () => {
  document.querySelector('.dash-links').classList.toggle('open');
});