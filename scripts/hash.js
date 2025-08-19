/* Hash UI behaviour (matches base64 layout): single result, copy at bottom, 5000 char hard limit */
(function () {
  const input = document.getElementById('hash-input');
  const sendBtn = document.getElementById('send-btn');
  const chat = document.getElementById('chat-area');
  const algButtons = document.querySelectorAll('.alg-btn');
  const copyResultBtn = document.getElementById('copy-result');
  const inputWarningEl = document.getElementById('input-warning');

  const MAX_INPUT = 5000;
  let algo = 'MD5';

  function setInputWarning(msg) {
    if (!inputWarningEl) return;
    if (!msg) {
      inputWarningEl.hidden = true;
      inputWarningEl.textContent = '';
      input.classList.remove('input-error');
      return;
    }
    inputWarningEl.hidden = false;
    inputWarningEl.textContent = msg;
    input.classList.add('input-error');
  }

  function updateAlgUI() {
    algButtons.forEach(b => {
      const isActive = b.getAttribute('data-algo') === algo;
      b.classList.toggle('selected', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });
  }

  function clearTransient() {
    if (!chat) return;
    const existing = chat.querySelectorAll('.chat-bubble.copy');
    existing.forEach(n => n.remove());
  }

  function showOnlyReply(replyText, isError = false) {
    if (!chat) return;
    clearTransient();
    chat.innerHTML = '';
    const replyEl = document.createElement('div');
    replyEl.className = 'chat-bubble reply' + (isError ? ' reply-error' : '');
    const span = document.createElement('div');
    span.className = 'reply-message';
    span.textContent = replyText;
    replyEl.appendChild(span);
    chat.appendChild(replyEl);
    scrollChat();
  }

  function showTransient(msg='Copied') {
    if (!chat) return;
    clearTransient();
    const t = document.createElement('div');
    t.className = 'chat-bubble copy';
    t.textContent = msg;
    chat.appendChild(t);
    scrollChat();
    setTimeout(() => t.classList.add('fade-out'), 900);
    setTimeout(() => t.remove(), 1400);
  }

  function copyToClipboard(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return fallbackCopy(text);
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly','');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e){}
    ta.remove();
  }

  function computeHash(algoName, value) {
    if (typeof CryptoJS === 'undefined') return null;
    switch (algoName) {
      case 'MD5': return CryptoJS.MD5(value).toString(CryptoJS.enc.Hex);
      case 'SHA1': return CryptoJS.SHA1(value).toString(CryptoJS.enc.Hex);
      case 'SHA256': return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
      default: return null;
    }
  }

  // safer processing spinner: use inline span and guard prevInner
  async function withProcessing(fn) {
    if (!sendBtn) return await fn();
    const prevInner = (typeof sendBtn.innerHTML === 'string') ? sendBtn.innerHTML : '';
    sendBtn.disabled = true;
    sendBtn.classList.add('disabled');

    // Inline spinner (no FA dependency)
    sendBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Processing';

    try {
      await fn();
    } finally {
      // restore safely
      sendBtn.innerHTML = prevInner;
      sendBtn.disabled = false;
      sendBtn.classList.remove('disabled');
    }
  }

  // remove any stray spinner / transient elements on init
  function cleanupStraySpinners() {
    // remove FA spinner icons, inline spinners, or copy transient bubbles left behind
    document.querySelectorAll('.fa-spinner, .btn-spinner, .chat-bubble.copy').forEach(n => n.remove());
    // also remove any empty chat-bubble nodes
    document.querySelectorAll('.chat-bubble').forEach(b => {
      if (!b.textContent.trim() && b.children.length === 0) b.remove();
    });
  }

  async function doSend() {
    if (!input) return;
    const raw = input.value || '';
    if (raw.length > MAX_INPUT) {
      setInputWarning(`Input too long (max ${MAX_INPUT} chars).`);
      showOnlyReply(`Input too long — cannot process more than ${MAX_INPUT} chars.`, true);
      return;
    }
    const text = raw.trim();
    if (!text) { showOnlyReply('Please enter text', true); return; }

    await withProcessing(() => new Promise((resolve) => {
      setTimeout(() => {
        const out = computeHash(algo, text);
        if (out === null) { showOnlyReply('Hash failed', true); resolve(); return; }
        showOnlyReply(out);
        resolve();
      }, 20);
    }));

    input.focus();
    input.selectionStart = input.selectionEnd = input.value.length;
  }

  function scrollChat() {
    if (!chat) return;
    chat.scrollTop = chat.scrollHeight;
  }

  // input handlers: enforce MAX_INPUT and show warning
  function handleInputEvent() {
    if (!input) return;
    const len = input.value.length;
    if (len === 0) { setInputWarning(''); toggleAlgoButtons(false); return; }
    if (len > MAX_INPUT) {
      input.value = input.value.slice(0, MAX_INPUT);
      setInputWarning(`Input truncated to maximum ${MAX_INPUT} characters.`);
      toggleAlgoButtons(true);
      return;
    }
    setInputWarning('');
    toggleAlgoButtons(true);
  }

  function handlePasteEvent(e) {
    if (!input) return;
    const pasted = (e.clipboardData && e.clipboardData.getData) ? e.clipboardData.getData('text') : '';
    if (!pasted) return;
    const current = input.value || '';
    const allowed = MAX_INPUT - current.length;
    if (allowed <= 0) {
      e.preventDefault();
      setInputWarning(`Input is at maximum ${MAX_INPUT} characters.`);
      return;
    }
    if (pasted.length > allowed) {
      e.preventDefault();
      const toInsert = pasted.slice(0, allowed);
      const start = input.selectionStart || current.length;
      const end = input.selectionEnd || start;
      input.value = current.slice(0, start) + toInsert + current.slice(end);
      setInputWarning(`Pasted content truncated to fit ${MAX_INPUT} character limit.`);
      const pos = start + toInsert.length;
      input.setSelectionRange(pos, pos);
      toggleAlgoButtons(true);
    }
  }

  function getReplyText() {
    const el = chat ? chat.querySelector('.chat-bubble.reply .reply-message') : null;
    return el ? el.textContent : '';
  }

  function toggleAlgoButtons(enable) {
    algButtons.forEach(b => {
      if (enable) {
        b.removeAttribute('disabled');
        b.classList.remove('opacity-50','cursor-not-allowed');
      } else {
        b.setAttribute('disabled','true');
        b.classList.add('opacity-50','cursor-not-allowed');
      }
    });
    sendBtn.disabled = !enable;
    if (enable) sendBtn.classList.remove('disabled'); else sendBtn.classList.add('disabled');
  }

  // events
  document.addEventListener('DOMContentLoaded', () => {
    // initial cleanup to avoid showing spinner on load
    cleanupStraySpinners();

    algButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        algo = btn.getAttribute('data-algo') || 'MD5';
        updateAlgUI();
      });
    });

    if (sendBtn) sendBtn.addEventListener('click', () => { doSend(); });

    if (input) {
      input.addEventListener('input', handleInputEvent);
      input.addEventListener('paste', handlePasteEvent);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          doSend();
        }
      });
    }

    copyResultBtn.addEventListener('click', () => {
      const text = getReplyText();
      copyToClipboard(text);
      showTransient();
    });
  });
})();