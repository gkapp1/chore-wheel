// ===== Google Sheet CSV loading & parsing =====

/**
 * Parses CSV text into an array of row objects keyed by header.
 * Handles quoted fields containing commas.
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && next === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const filtered = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (filtered.length === 0) return [];

  const headers = filtered[0].map((h) => h.trim().toLowerCase());
  return filtered.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] || "").trim();
    });
    return obj;
  });
}

/**
 * Loads chore data from the configured Apps Script web app or published CSV
 * URL, or falls back to CONFIG.FALLBACK_DATA if neither is set / the fetch
 * fails.
 *
 * Returns { choresByKid, themes }:
 *   - choresByKid: map of kid name -> array of { chore, icon }
 *   - themes: map of kid name -> saved theme key (only populated when using
 *     APPS_SCRIPT_URL with a "Theme" column; otherwise empty)
 */
/**
 * Appends a cache-busting timestamp param to a URL so neither the browser
 * nor Google's "publish to web" CDN serve a stale cached response.
 */
function _cacheBust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_=${Date.now()}`;
}

async function loadChoreData() {
  let rows = null;
  let themes = {};

  if (CONFIG.APPS_SCRIPT_URL && CONFIG.APPS_SCRIPT_URL.trim() !== "") {
    try {
      const res = await fetch(_cacheBust(CONFIG.APPS_SCRIPT_URL), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json.rows) && json.rows.length > 0) {
        rows = json.rows;
        themes = json.themes || {};
      }
    } catch (err) {
      console.warn("Failed to load data from Apps Script, falling back.", err);
    }
  }

  if (!rows && CONFIG.SHEET_CSV_URL && CONFIG.SHEET_CSV_URL.trim() !== "") {
    try {
      const res = await fetch(_cacheBust(CONFIG.SHEET_CSV_URL), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        rows = parsed.map((r) => ({
          kid: r.kid || r.name || "",
          chore: r.chore || r.task || "",
          icon: r.icon || "",
        }));
      }
    } catch (err) {
      console.warn("Failed to load Google Sheet CSV, using fallback data.", err);
    }
  }

  if (!rows) {
    rows = CONFIG.FALLBACK_DATA;
  }

  const choresByKid = {};
  rows.forEach(({ kid, chore, icon }) => {
    if (!kid || !chore) return;
    if (!choresByKid[kid]) choresByKid[kid] = [];
    choresByKid[kid].push({ chore, icon: icon || "" });
  });

  return { choresByKid, themes };
}

/**
 * Saves a kid's theme choice back to the sheet via the Apps Script web app
 * (if configured). Fire-and-forget: failures are logged but don't disrupt
 * the UI, since the choice is also saved to localStorage as a fallback.
 */
function saveThemeChoice(kid, themeKey) {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.trim() === "") return;

  fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ kid, theme: themeKey }),
  }).catch((err) => {
    console.warn("Failed to save theme choice to sheet.", err);
  });
}
