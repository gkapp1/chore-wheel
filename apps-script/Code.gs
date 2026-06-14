// ===== Chore Wheel - Google Apps Script backend =====
//
// Deploy this as a Web App bound to your chores Google Sheet so the site
// can read chores + each kid's saved theme, AND write back a kid's theme
// choice when they pick one from the dropdown (so it's remembered across
// browsers/devices).
//
// Setup:
//   1. Open your Google Sheet.
//   2. Extensions -> Apps Script.
//   3. Delete any starter code and paste this file's contents in.
//   4. Update SHEET_NAME below if your tab isn't named "Sheet1".
//   5. Deploy -> New deployment -> type "Web app".
//      - Execute as: Me
//      - Who has access: Anyone
//   6. Authorize when prompted, then copy the Web App URL.
//   7. Paste that URL into APPS_SCRIPT_URL in js/config.js.
//
// Sheet columns expected (header row, any order):
//   Kid, Chore, Icon, Theme
// The "Theme" column is optional - this script creates it automatically
// the first time a kid picks a theme on the site.

const SHEET_NAME = "Sheet1";

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h) => String(h).trim().toLowerCase());

  const kidIdx = headers.indexOf("kid");
  const choreIdx = headers.indexOf("chore");
  const iconIdx = headers.indexOf("icon");
  const themeIdx = headers.indexOf("theme");

  const rows = [];
  const themes = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const kid = String(row[kidIdx] || "").trim();
    const chore = String(row[choreIdx] || "").trim();
    if (!kid || !chore) continue;

    rows.push({
      kid: kid,
      chore: chore,
      icon: iconIdx >= 0 ? String(row[iconIdx] || "").trim() : "",
    });

    if (themeIdx >= 0) {
      const theme = String(row[themeIdx] || "").trim();
      if (theme && !themes[kid]) themes[kid] = theme;
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ rows, themes })).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const kid = String(params.kid || "").trim();
  const theme = String(params.theme || "").trim();

  if (!kid || !theme) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: "kid and theme are required" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h) => String(h).trim().toLowerCase());

  const kidIdx = headers.indexOf("kid");
  let themeIdx = headers.indexOf("theme");

  if (themeIdx === -1) {
    themeIdx = headers.length;
    sheet.getRange(1, themeIdx + 1).setValue("Theme");
  }

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][kidIdx] || "").trim() === kid) {
      sheet.getRange(i + 1, themeIdx + 1).setValue(theme);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}
