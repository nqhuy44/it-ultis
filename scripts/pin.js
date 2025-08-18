// PIN generator: numeric-only, same UI pattern as password.js

const pinGen = {
  setLength(n) {
    const el = document.getElementById('pin-length');
    if (el) el.value = String(n);
  },

  generate() {
    const lenEl = document.getElementById('pin-length');
    const length = lenEl ? parseInt(lenEl.value, 10) : 6;
    if (isNaN(length) || length < 4 || length > 16) {
      this.showError('Invalid PIN length (4–16).');
      return;
    }

    let pin = '';
    for (let i = 0; i < length; i++) {
      pin += Math.floor(Math.random() * 10).toString();
    }

    const hidden = document.getElementById('pin-value');
    if (hidden) hidden.value = pin;
    this.showPinBubble(pin);
  },

  copy() {
    const hidden = document.getElementById('pin-value');
    let text = hidden && hidden.value ? hidden.value.trim() : '';
    if (!text) {
      const left = document.querySelector('#chat-area .chat-bubble.tool .pw-message');
      if (left) text = left.textContent.trim();
    }
    if (!text) return;

    const success = () => this.showCopyBubble('PIN copied!');
    const fail = () => {
      this._fallbackCopy(text);
      this.showCopyBubble('PIN copied!');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(success).catch(fail);
    } else {
      this._fallbackCopy(text);
      this.showCopyBubble('PIN copied!');
    }
  },

  _fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    ta.remove();
  },

  showPinBubble(text) {
    const chat = document.getElementById('chat-area');
    if (!chat) return;
    chat.innerHTML = '';
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble tool';
    const span = document.createElement('span');
    span.className = 'pw-message';
    span.textContent = text;
    bubble.appendChild(span);
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
  },

  showCopyBubble(message = 'Copied') {
    const chat = document.getElementById('chat-area');
    if (!chat) return;
    chat.querySelectorAll('.chat-bubble.copy').forEach(n => n.remove());
    const b = document.createElement('div');
    b.className = 'chat-bubble copy';
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.innerHTML = '✔︎';
    b.appendChild(icon);
    const txt = document.createElement('span');
    txt.textContent = ' ' + message;
    b.appendChild(txt);
    chat.appendChild(b);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(() => b.classList.add('fade-out'), 1400);
    setTimeout(() => b.remove(), 2000);
  },

  showError(message = 'Error') {
    const chat = document.getElementById('chat-area');
    if (!chat) return;
    const err = document.createElement('div');
    err.className = 'chat-bubble error';
    err.textContent = message;
    chat.appendChild(err);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(() => err.classList.add('fade-out'), 1400);
    setTimeout(() => err.remove(), 2000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const lenEl = document.getElementById('pin-length');
  if (lenEl) lenEl.value = '6';

  document.querySelectorAll('.option-btn[data-length]').forEach(btn => {
    // apply to this page's preset buttons only (they share class names)
    if (!btn.closest('.pw-left')) return; // ignore index.html buttons
    btn.classList.remove('selected');
    if (btn.getAttribute('data-length') === '6') btn.classList.add('selected');
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-length');
      if (lenEl) lenEl.value = v;
      document.querySelectorAll('.pw-left .option-btn[data-length]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  const gen = document.getElementById('generate-pin');
  if (gen) gen.addEventListener('click', () => pinGen.generate());

  const copyBtn = document.getElementById('copy-pin');
  if (copyBtn) copyBtn.addEventListener('click', () => pinGen.copy());
});