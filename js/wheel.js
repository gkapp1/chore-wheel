// ===== Canvas wheel rendering + drag/spin physics =====

// Radius (px) the slice font sizes/positions are tuned for; other radii scale
// proportionally so labels keep fitting within their slice.
const REFERENCE_RADIUS = 292;

class ChoreWheel {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} theme - CONFIG.THEME
   */
  constructor(canvas, theme) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.theme = theme;
    this.slices = []; // [{ chore, icon }]
    this.rotation = 0; // radians
    this.velocity = 0; // radians / frame
    this.dragging = false;
    this.lastAngle = 0;
    this.lastTime = 0;
    this.spinning = false;
    this.onStop = null;

    this._bindPointerEvents();
    this._raf = this._raf.bind(this);
  }

  setSlices(slices) {
    this.slices = slices;
    this.rotation = 0;
    this.velocity = 0;
    this.draw();
  }

  setTheme(theme) {
    this.theme = theme;
    this.draw();
  }

  // ---- Drawing ----

  draw() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 8;
    const n = this.slices.length;

    ctx.clearRect(0, 0, width, height);

    if (n === 0) return;

    const sliceAngle = (2 * Math.PI) / n;

    ctx.save();
    ctx.translate(cx, cy);

    // Clip everything (slices, icons, labels) to the wheel's circle so
    // large emoji glyphs can't visually spill outside it.
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.clip();

    ctx.rotate(this.rotation);

    for (let i = 0; i < n; i++) {
      const start = i * sliceAngle;
      const end = start + sliceAngle;
      const color = this.theme.colors[i % this.theme.colors.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Slice label
      const mid = start + sliceAngle / 2;
      // Flip text on the left half of the wheel so it reads upright
      // instead of upside-down.
      const flip = mid > Math.PI / 2 && mid < (3 * Math.PI) / 2;

      // Scale font sizes, text position, and max length relative to the
      // wheel's radius so labels fit within their slice on small screens.
      const scale = radius / REFERENCE_RADIUS;
      const iconSize = Math.max(16, Math.round(32 * scale));
      const textSize = Math.max(11, Math.round(18 * scale));
      const maxChars = Math.max(8, Math.round(22 * scale));

      ctx.save();
      ctx.rotate(mid + (flip ? Math.PI : 0));
      ctx.textAlign = flip ? "left" : "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = this._contrastColor(color);

      const item = this.slices[i];
      const icon = item.icon || this.theme.icons[i % this.theme.icons.length];
      const iconX = flip ? -(radius * 0.86) : radius * 0.86;
      const textX = flip ? -(radius * 0.74) : radius * 0.74;

      ctx.font = `${iconSize}px sans-serif`;
      ctx.fillText(icon, iconX, 12 * scale);

      ctx.font = `bold ${textSize}px 'Baloo 2', sans-serif`;
      const lines = this._wrapText(item.chore, maxChars, 2);
      const lineHeight = textSize * 1.2;
      const startY = 12 * scale - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, lineIdx) => {
        ctx.fillText(line, textX, startY + lineIdx * lineHeight);
      });
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = this.theme.accent;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  }

  _truncate(text, max) {
    return text.length > max ? text.slice(0, max - 1) + "…" : text;
  }

  /**
   * Word-wraps text into up to maxLines lines of at most maxChars each,
   * truncating the last line with an ellipsis if words remain unplaced.
   */
  _wrapText(text, maxChars, maxLines) {
    const words = text.split(" ");
    const lines = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxChars) {
        current = candidate;
        continue;
      }
      lines.push(current || this._truncate(word, maxChars));
      current = current ? word : "";
      if (lines.length === maxLines) break;
    }

    if (lines.length < maxLines && current) {
      lines.push(current);
      current = "";
    }

    const placed = lines.join(" ").split(" ").length;
    if (current || placed < words.length) {
      const last = lines.length - 1;
      lines[last] = this._truncate(lines[last] + "…", maxChars);
    }

    return lines;
  }

  /**
   * Picks black or white text depending on which gives better contrast
   * against the given background color, so labels stay readable on both
   * light and dark slices within the same theme.
   */
  _contrastColor(hexColor) {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Relative luminance (perceptual weighting).
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "#2b2b2b" : "#ffffff";
  }

  // ---- Pointer / touch drag-to-spin ----

  _bindPointerEvents() {
    const canvas = this.canvas;

    canvas.addEventListener("pointerdown", (e) => {
      if (this.slices.length === 0) return;
      this.dragging = true;
      this.spinning = false;
      cancelAnimationFrame(this._animFrame);
      this.lastAngle = this._pointerAngle(e);
      this.lastTime = performance.now();
      this.velocity = 0;
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      const angle = this._pointerAngle(e);
      const now = performance.now();
      let delta = angle - this.lastAngle;

      // Normalize delta to shortest path (-PI, PI)
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;

      this.rotation += delta;
      const dt = Math.max(now - this.lastTime, 1);
      this.velocity = delta / (dt / 16.6667); // normalize to ~60fps frame units

      this.lastAngle = angle;
      this.lastTime = now;
      this.draw();
    });

    const endDrag = (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      // Kick off momentum spin using last drag velocity
      this._startMomentum();
    };

    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", (e) => {
      if (this.dragging && e.buttons === 0) endDrag(e);
    });
  }

  _pointerAngle(e) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  }

  // ---- Programmatic spin (button) ----

  spinRandom(minTurns = 4, maxTurns = 7) {
    if (this.slices.length === 0 || this.spinning) return;
    const turns = minTurns + Math.random() * (maxTurns - minTurns);
    this.velocity = (turns * 2 * Math.PI) / 90; // initial angular velocity per frame
    this._startMomentum();
  }

  _startMomentum() {
    if (this.slices.length === 0) return;
    this.spinning = true;
    this._animFrame = requestAnimationFrame(this._raf);
  }

  _raf() {
    const FRICTION = 0.985;
    const MIN_VELOCITY = 0.0015;

    this.rotation += this.velocity;
    this.velocity *= FRICTION;

    this.draw();

    if (Math.abs(this.velocity) > MIN_VELOCITY) {
      this._animFrame = requestAnimationFrame(this._raf);
    } else {
      this.spinning = false;
      this.velocity = 0;
      const winner = this._winningSlice();
      if (this.onStop) this.onStop(winner);
    }
  }

  _winningSlice() {
    const n = this.slices.length;
    if (n === 0) return null;
    const sliceAngle = (2 * Math.PI) / n;

    // Pointer is fixed at the top of the wheel (canvas angle -PI/2).
    // Find which slice currently sits under that point.
    let pointerAngle = -Math.PI / 2 - this.rotation;
    pointerAngle = ((pointerAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const index = Math.floor(pointerAngle / sliceAngle);
    return this.slices[index];
  }
}
