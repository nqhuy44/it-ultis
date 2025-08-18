const passwd = {
  setLength(length) {
    const el = document.getElementById("length");
    if (el) el.value = String(length);
  },

  generate() {
    const lenEl = document.getElementById("length");
    const includeSpecialBtn = document.getElementById("include-special");
    const length = lenEl ? parseInt(lenEl.value, 10) : 32;
    const includeSpecial = includeSpecialBtn ? includeSpecialBtn.classList.contains("selected") : false;

    if (isNaN(length) || length < 1 || length > 128) {
      this.showError("Invalid length (1–128).");
      return;
    }

    const base = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const charset = includeSpecial ? base + special : base;

    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const pwField = document.getElementById("password");
    if (pwField) pwField.value = password;

    this.showPasswordBubble(password);
  },

  copy() {
    // Prefer hidden field, fallback to visible bubble
    const pwField = document.getElementById("password");
    let text = pwField && pwField.value ? pwField.value.trim() : "";
    if (!text) {
      const left = document.querySelector("#chat-area .chat-bubble.tool .pw-message");
      if (left) text = left.textContent.trim();
    }
    if (!text) return;

    // copy to clipboard with fallback
    const onSuccess = () => this.showCopyBubble("Password copied!");
    const onFail = () => {
      this._fallbackCopy(text);
      this.showCopyBubble("Password copied!");
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(onFail);
    } else {
      this._fallbackCopy(text);
      this.showCopyBubble("Password copied!");
    }
  },

  _fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) { /* ignore */ }
    ta.remove();
  },

  showPasswordBubble(text) {
    const chat = document.getElementById("chat-area");
    if (!chat) return;
    chat.innerHTML = "";
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble tool";
    const span = document.createElement("span");
    span.className = "pw-message";
    span.textContent = text;
    bubble.appendChild(span);
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
  },

  showCopyBubble(message = "Copied") {
    const chat = document.getElementById("chat-area");
    if (!chat) return;

    // Remove existing copy bubbles so only one answer is visible
    chat.querySelectorAll(".chat-bubble.copy").forEach(n => n.remove());

    const b = document.createElement("div");
    b.className = "chat-bubble copy";
    // optional icon
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.innerHTML = "✔︎"; // simple checkmark (can replace with SVG)
    b.appendChild(icon);

    const txt = document.createElement("span");
    txt.textContent = " " + message;
    b.appendChild(txt);

    chat.appendChild(b);
    chat.scrollTop = chat.scrollHeight;

    // fade-out and remove after a short delay
    setTimeout(() => b.classList.add("fade-out"), 1400);
    setTimeout(() => b.remove(), 2000);
  },

  showError(message = "Error") {
    const chat = document.getElementById("chat-area");
    if (!chat) return;
    const err = document.createElement("div");
    err.className = "chat-bubble error";
    err.textContent = message;
    chat.appendChild(err);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(() => err.classList.add("fade-out"), 1400);
    setTimeout(() => err.remove(), 2000);
  }
};

// UI wiring
document.addEventListener("DOMContentLoaded", () => {
  const lenEl = document.getElementById("length");
  if (lenEl) lenEl.value = "32";

  document.querySelectorAll(".option-btn[data-length]").forEach(btn => {
    btn.classList.remove("selected");
    if (btn.getAttribute("data-length") === "32") btn.classList.add("selected");
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-length");
      if (lenEl) lenEl.value = v;
      document.querySelectorAll(".option-btn[data-length]").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  const specialBtn = document.getElementById("include-special");
  if (specialBtn) {
    specialBtn.addEventListener("click", () => specialBtn.classList.toggle("selected"));
  }

  const gen = document.getElementById("generate-btn");
  if (gen) gen.addEventListener("click", () => passwd.generate());

  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) copyBtn.addEventListener("click", () => passwd.copy());
});