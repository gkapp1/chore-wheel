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
 * Loads chore data either from the configured published CSV URL,
 * or falls back to CONFIG.FALLBACK_DATA if no URL is set / fetch fails.
 * Returns a map of kid name -> array of { chore, icon }.
 */
async function loadChoreData() {
  let rows = null;

  if (CONFIG.SHEET_CSV_URL && CONFIG.SHEET_CSV_URL.trim() !== "") {
    try {
      const res = await fetch(CONFIG.SHEET_CSV_URL, { cache: "no-store" });
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

  const byKid = {};
  rows.forEach(({ kid, chore, icon }) => {
    if (!kid || !chore) return;
    if (!byKid[kid]) byKid[kid] = [];
    byKid[kid].push({ chore, icon: icon || "" });
  });

  return byKid;
}
