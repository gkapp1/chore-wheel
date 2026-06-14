# Chore Wheel 🍬

A touch-friendly, spinnable chore wheel for kids. Drag it with your finger or
hit "SPIN!", and it picks a chore for the selected kid. The list of kids and
chores is controlled by a Google Sheet.

## 1. Set up your Google Sheet

Create a sheet with these column headers in row 1:

| Kid | Chore           | Icon |
|-----|-----------------|------|
| Ava | Make your bed   | 🛏️   |
| Ava | Feed the dog    | 🐶   |
| Sam | Empty the trash | 🗑️   |

- `Kid` — the child's name. Each unique name becomes a tab/button in the kid picker.
- `Chore` — the text shown on the wheel slice.
- `Icon` — optional emoji. If left blank, a Candy Land icon is used automatically.

Add as many rows as you like — each row is one slice on that kid's wheel.

## 2. Publish the sheet as CSV

1. In Google Sheets: **File → Share → Publish to web**.
2. Under "Link", choose the specific sheet/tab with your chores.
3. Set the format to **Comma-separated values (.csv)**.
4. Click **Publish** and copy the URL — it looks like:
   `https://docs.google.com/spreadsheets/d/e/2PACX-XXXXXXXX/pub?output=csv`

## 3. Connect the site to your sheet

Open [js/config.js](js/config.js) and paste the URL into `SHEET_CSV_URL`:

```js
SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-XXXXXXXX/pub?output=csv",
```

If this is left empty (or the fetch fails), the wheel uses the sample data in
`FALLBACK_DATA` so you can test it locally first.

## 4. Run it locally

This is a plain static site — no build step. Just serve the folder, e.g.:

```bash
npx serve .
```

or open `index.html` directly in a browser (note: some browsers block
`fetch` on `file://` URLs, so a local server is recommended when testing the
Google Sheet connection).

## 5. Deploy it for free

**GitHub Pages**
1. Push this repo to GitHub.
2. Repo Settings → Pages → Source: deploy from `main` branch, `/ (root)`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

**Netlify / Vercel**
- Drag-and-drop the project folder onto [netlify.com/drop](https://app.netlify.com/drop),
  or connect the GitHub repo for automatic deploys on every push.

## Editing chores

Just edit the Google Sheet — the live site refetches the CSV on every page
load, so changes show up the next time it's opened (or refreshed).

## Theme

Currently themed **Candy Land** (pastel colors, candy icons, sprinkle
confetti on result). Theme settings live in [js/config.js](js/config.js)
under `CONFIG.THEME` — colors, icons, fonts, and background can all be
swapped out to create new themes (Space, Jungle, Dinosaur, etc.).
