// ── Floating AI Button ──
const floatAI = document.getElementById('floatAI');
let offsetX, offsetY;

floatAI.addEventListener('mousedown', (e) => {
  e.preventDefault();
  offsetX = e.clientX - floatAI.getBoundingClientRect().left;
  offsetY = e.clientY - floatAI.getBoundingClientRect().top;

  const onMove = (e) => {
    floatAI.style.left = e.clientX - offsetX + 'px';
    floatAI.style.top = e.clientY - offsetY + 'px';
    floatAI.style.right = 'auto';
    floatAI.style.bottom = 'auto';
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', onMove);
  }, { once: true });
});

// ── Touch ──
floatAI.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  offsetX = touch.clientX - floatAI.getBoundingClientRect().left;
  offsetY = touch.clientY - floatAI.getBoundingClientRect().top;

  const onMove = (e) => {
    const t = e.touches[0];
    floatAI.style.left = t.clientX - offsetX + 'px';
    floatAI.style.top = t.clientY - offsetY + 'px';
    floatAI.style.right = 'auto';
    floatAI.style.bottom = 'auto';
  };

  floatAI.addEventListener('touchmove', onMove);
  floatAI.addEventListener('touchend', () => {
    floatAI.removeEventListener('touchmove', onMove);
  }, { once: true });
});