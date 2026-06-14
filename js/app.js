// ===== App wiring =====

(async function () {
  const statusEl = document.getElementById("status");
  const kidPicker = document.getElementById("kidPicker");
  const spinBtn = document.getElementById("spinBtn");
  const canvas = document.getElementById("wheel");
  const resultOverlay = document.getElementById("resultOverlay");
  const resultEmoji = document.getElementById("resultEmoji");
  const resultText = document.getElementById("resultText");
  const closeResult = document.getElementById("closeResult");
  const themeSelect = document.getElementById("themeSelect");
  const appTitle = document.getElementById("appTitle");

  const THEME_STORAGE_PREFIX = "chorewheel-theme-";

  function themeKeyForKid(kid) {
    return THEME_STORAGE_PREFIX + kid;
  }

  function getThemeForKid(kid) {
    const serverTheme = serverThemes[kid];
    if (serverTheme && CONFIG.THEMES[serverTheme]) return serverTheme;

    const saved = localStorage.getItem(themeKeyForKid(kid));
    if (saved && CONFIG.THEMES[saved]) return saved;

    return CONFIG.DEFAULT_THEME;
  }

  function buildThemePicker() {
    themeSelect.innerHTML = "";
    Object.entries(CONFIG.THEMES).forEach(([key, theme]) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = `${theme.emoji} ${theme.name}`;
      themeSelect.appendChild(opt);
    });
  }

  function applyTheme(themeKey) {
    const theme = CONFIG.THEMES[themeKey] || CONFIG.THEMES[CONFIG.DEFAULT_THEME];
    document.body.style.background = theme.background;
    appTitle.textContent = `${theme.emoji} Chore Wheel ${theme.emoji}`;
    appTitle.style.color = theme.accent;
    statusEl.style.color = theme.sliceTextColor;
    themeSelect.value = themeKey;
    wheel.setTheme(theme);
  }

  const wheel = new ChoreWheel(canvas, CONFIG.THEMES[CONFIG.DEFAULT_THEME]);
  wheel.onStop = (winner) => showResult(winner);

  let choresByKid = {};
  let serverThemes = {};
  let currentKid = null;

  function fitCanvas() {
    const size = Math.min(canvas.parentElement.clientWidth, 600);
    canvas.width = size;
    canvas.height = size;
    wheel.draw();
  }
  window.addEventListener("resize", fitCanvas);

  function buildKidPicker() {
    kidPicker.innerHTML = "";
    const kids = Object.keys(choresByKid);
    if (kids.length === 0) {
      statusEl.textContent = "No chores found. Check your Google Sheet setup.";
      return;
    }
    kids.forEach((kid) => {
      const btn = document.createElement("button");
      btn.className = "kid-btn";
      btn.textContent = kid;
      btn.addEventListener("click", () => selectKid(kid));
      kidPicker.appendChild(btn);
    });
    selectKid(kids[0]);
  }

  function selectKid(kid) {
    currentKid = kid;
    [...kidPicker.children].forEach((btn) => {
      btn.classList.toggle("active", btn.textContent === kid);
    });
    const slices = choresByKid[kid].map((c) => ({ chore: c.chore, icon: c.icon }));
    wheel.setSlices(slices);
    applyTheme(getThemeForKid(kid));
    statusEl.textContent = `${kid}'s wheel — ${slices.length} chores. Spin or drag the wheel!`;
  }

  themeSelect.addEventListener("change", () => {
    if (!currentKid) return;
    const themeKey = themeSelect.value;
    localStorage.setItem(themeKeyForKid(currentKid), themeKey);
    serverThemes[currentKid] = themeKey;
    saveThemeChoice(currentKid, themeKey);
    applyTheme(themeKey);
  });

  function showResult(winner) {
    if (!winner) return;
    resultEmoji.textContent = winner.icon || wheel.theme.icons[0];
    resultText.textContent = winner.chore;
    resultOverlay.classList.add("visible");
    launchConfetti();
  }

  closeResult.addEventListener("click", () => {
    resultOverlay.classList.remove("visible");
  });

  spinBtn.addEventListener("click", () => {
    resultOverlay.classList.remove("visible");
    wheel.spinRandom();
  });

  // ---- Load data ----
  statusEl.textContent = "Loading chores...";
  buildThemePicker();
  const data = await loadChoreData();
  choresByKid = data.choresByKid;
  serverThemes = data.themes;
  fitCanvas();
  buildKidPicker();

  // ---- Confetti ----
  const confettiCanvas = document.getElementById("confetti");
  const confettiCtx = confettiCanvas.getContext("2d");
  let confettiParticles = [];
  let confettiRunning = false;

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeConfetti);
  resizeConfetti();

  function launchConfetti() {
    const colors = wheel.theme.colors;
    for (let i = 0; i < 120; i++) {
      confettiParticles.push({
        x: confettiCanvas.width / 2,
        y: confettiCanvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        life: 0,
      });
    }
    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(confettiLoop);
    }
  }

  function confettiLoop() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p) => {
      p.vy += 0.35; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      p.life++;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      confettiCtx.restore();
    });

    confettiParticles = confettiParticles.filter(
      (p) => p.y < confettiCanvas.height + 50 && p.life < 240
    );

    if (confettiParticles.length > 0) {
      requestAnimationFrame(confettiLoop);
    } else {
      confettiRunning = false;
    }
  }
})();
