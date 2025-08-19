const base64 = {
    encode: function() {
        const input = document.getElementById('input').value;
        const output = btoa(input);
        document.getElementById('output').value = output;
    },
    decode: function() {
        const input = document.getElementById('input').value;
        try {
            const output = atob(input);
            document.getElementById('output').value = output;
        } catch (e) {
            document.getElementById('output').value = 'Invalid Base64 string';
        }
    },
    copyOutput: function() {
        const outputField = document.getElementById('output');
        outputField.select();
        outputField.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification();
        } catch (err) {
            console.error('Failed to copy output');
        }
    },
    showNotification: function() {
        const notification = document.getElementById('copy-notification');
        notification.classList.remove('hidden', 'opacity-0');
        notification.classList.add('opacity-100');
        setTimeout(() => {
            notification.classList.remove('opacity-100');
            notification.classList.add('opacity-0');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300); // Match the duration of the transition
        }, 2000);
    }
};

/* Base64 two-column behaviour: left = input/options, right = single reply */
/* Enter = send, Shift/Cmd/Ctrl+Enter = newline */
(function () {
  const input = document.getElementById('base-input');
  const sendBtn = document.getElementById('send-btn');
  const chat = document.getElementById('chat-area');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const copyResultBtn = document.getElementById('copy-result');
  const inputWarningEl = document.getElementById('input-warning');

  const MAX_INPUT = 5000;           // hard limit and processing limit
  let mode = 'encode';
  let urlSafe = false;

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

  function updateModeUI() {
    modeButtons.forEach(b => {
      const isActive = b.getAttribute('data-mode') === mode;
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

  function showError(msg='Error') {
    showOnlyReply(msg, true);
    setTimeout(() => {
      // keep error visible briefly then clear (optional)
    }, 1400);
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

  // safer encode/decode using TextEncoder/Decoder (handles larger & unicode)
  function uint8ArrayToBase64(bytes) {
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }
  function base64ToUint8Array(b64) {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  function tryEncode(src) {
    try {
      if (typeof TextEncoder !== 'undefined') {
        const bytes = new TextEncoder().encode(src);
        const b64 = uint8ArrayToBase64(bytes);
        return urlSafe ? toUrlSafe(b64) : b64;
      }
      const b = btoa(unescape(encodeURIComponent(src)));
      return urlSafe ? toUrlSafe(b) : b;
    } catch (e) {
      try { const b = btoa(src); return urlSafe ? toUrlSafe(b) : b; } catch (_) { return null; }
    }
  }
  function tryDecode(src) {
    try {
      const inputValue = urlSafe ? fromUrlSafe(src) : src;
      if (typeof TextDecoder !== 'undefined') {
        const bytes = base64ToUint8Array(inputValue);
        return new TextDecoder().decode(bytes);
      }
      return decodeURIComponent(escape(atob(inputValue)));
    } catch (e) {
      try { const inputValue = urlSafe ? fromUrlSafe(src) : src; return atob(inputValue); } catch (_) { return null; }
    }
  }
  function toUrlSafe(b64) { return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  function fromUrlSafe(str) { let s = str.replace(/-/g,'+').replace(/_/g,'/'); while (s.length % 4) s += '='; return s; }

  function getReplyText() {
    const el = chat ? chat.querySelector('.chat-bubble.reply .reply-message') : null;
    return el ? el.textContent : '';
  }

  // processing wrapper to show disabled/processing UI
  async function withProcessing(fn) {
    if (!sendBtn) return await fn();
    const prevInner = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.classList.add('disabled');
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing';
    try { await fn(); } finally {
      sendBtn.innerHTML = prevInner;
      sendBtn.disabled = false;
      sendBtn.classList.remove('disabled');
    }
  }

  async function doSend() {
    if (!input) return;
    const raw = input.value || '';
    if (raw.length > MAX_INPUT) {
      // show reply-level error and keep input highlighted
      setInputWarning(`Input too long (max ${MAX_INPUT} chars).`);
      showOnlyReply(`Input too long — cannot process more than ${MAX_INPUT} chars.`, true);
      return;
    }
    const text = raw.trim();
    if (!text) { showError('Please enter text'); return; }

    await withProcessing(() => new Promise((resolve) => {
      setTimeout(() => {
        if (mode === 'encode') {
          const out = tryEncode(text);
          if (out === null) { showError('Encoding failed'); resolve(); return; }
          showOnlyReply(out);
        } else {
          const out = tryDecode(text);
          if (out === null) { showError('Decoding failed — invalid Base64'); resolve(); return; }
          showOnlyReply(out);
        }
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

  // input handlers: prevent exceeding MAX_INPUT and show red highlight
  function handleInputEvent() {
    if (!input) return;
    const len = input.value.length;
    if (len === 0) { setInputWarning(''); return; }
    if (len > MAX_INPUT) {
      // trim to MAX_INPUT and warn
      input.value = input.value.slice(0, MAX_INPUT);
      setInputWarning(`Input truncated to maximum ${MAX_INPUT} characters.`);
      return;
    }
    // clear warning when within limit
    setInputWarning('');
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
      // allow truncated paste
      e.preventDefault();
      const toInsert = pasted.slice(0, allowed);
      const start = input.selectionStart || current.length;
      const end = input.selectionEnd || start;
      input.value = current.slice(0, start) + toInsert + current.slice(end);
      setInputWarning(`Pasted content truncated to fit ${MAX_INPUT} character limit.`);
      // move caret
      const pos = start + toInsert.length;
      input.setSelectionRange(pos, pos);
    }
  }

  // escape HTML helper (kept for completeness)
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // events
  document.addEventListener('DOMContentLoaded', () => {
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        mode = btn.getAttribute('data-mode') || 'encode';
        updateModeUI();
      });
    });

    if (sendBtn) sendBtn.addEventListener('click', () => { doSend(); });

    if (input) {
      input.addEventListener('input', handleInputEvent);
      input.addEventListener('paste', handlePasteEvent);
      input.addEventListener('keydown', (e) => {
        // Enter = send; Shift/Ctrl/Cmd+Enter = newline
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          doSend();
        }
      });
    }

    if (copyResultBtn) {
      copyResultBtn.addEventListener('click', () => {
        const text = getReplyText();
        if (!text) { showTransient('Nothing to copy'); return; }
        copyToClipboard(text);
        showTransient('Copied');
      });
    }

    updateModeUI();
    scrollChat();
    window.addEventListener('resize', scrollChat);
  });
})();