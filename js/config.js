// ===== Chore Wheel Configuration =====

const CONFIG = {
  // Paste the "Publish to web" CSV link for your Google Sheet here.
  // File > Share > Publish to web > select the chores tab > CSV > Publish
  // It looks like:
  // https://docs.google.com/spreadsheets/d/e/2PACX-XXXXXXXX/pub?output=csv
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmCDvUePbSyuyc8rH98idFdG08SaixC77od178Hnf_3xf5oPvEuzCX0YCoqoULzI7Q9d11I6ds-bQb/pub?gid=1572088753&single=true&output=csv",

  // Optional: URL of the deployed Apps Script web app (see apps-script/Code.gs).
  // When set, this is used INSTEAD of SHEET_CSV_URL for loading chores, and
  // also enables saving each kid's theme choice back to the sheet so it's
  // remembered across browsers/devices. Leave empty to use SHEET_CSV_URL
  // (themes then only persist on this browser via localStorage).
  APPS_SCRIPT_URL: "",

  // Expected sheet columns (header row), in any order:
  //   Kid   - the child's name (used to build the kid picker)
  //   Chore - the chore text shown on the wheel slice
  //   Icon  - (optional) an emoji to show on the slice, e.g. 🧹
  //   Theme - (optional, only used with APPS_SCRIPT_URL) the kid's saved theme key

  // Used when neither APPS_SCRIPT_URL nor SHEET_CSV_URL is set, or the fetch
  // fails, so the wheel still works for local testing / first run.
  FALLBACK_DATA: [
    { kid: "Ava", chore: "Make your bed", icon: "🛏️" },
    { kid: "Ava", chore: "Feed the dog", icon: "🐶" },
    { kid: "Ava", chore: "Set the table", icon: "🍽️" },
    { kid: "Ava", chore: "Tidy your room", icon: "🧸" },
    { kid: "Ava", chore: "Brush teeth", icon: "🪥" },
    { kid: "Ava", chore: "Water the plants", icon: "🪴" },
    { kid: "Sam", chore: "Empty the trash", icon: "🗑️" },
    { kid: "Sam", chore: "Wash the dishes", icon: "🍽️" },
    { kid: "Sam", chore: "Sweep the floor", icon: "🧹" },
    { kid: "Sam", chore: "Fold laundry", icon: "🧺" },
    { kid: "Sam", chore: "Walk the dog", icon: "🐕" },
    { kid: "Sam", chore: "Vacuum living room", icon: "🧽" },
  ],

  // Default theme used the first time a kid is selected (no saved choice yet).
  DEFAULT_THEME: "candy",

  // Available themes. Each kid's choice is saved in the browser (localStorage)
  // so it's remembered next time that kid's wheel is opened on this device.
  THEMES: {
    candy: {
      name: "Candy Land",
      emoji: "🍭",
      colors: [
        "#FF8FAB", // bubblegum pink
        "#FFD6A5", // sherbet orange
        "#FDFFB6", // lemon
        "#CAFFBF", // mint
        "#9BF6FF", // sky candy
        "#BDB2FF", // grape
        "#FFC6FF", // cotton candy
        "#FFADAD", // strawberry
      ],
      icons: ["🍬", "🍭", "🍫", "🍩", "🧁", "🍪", "🍰", "🍡"],
      sliceTextColor: "#5b3a29",
      background: "linear-gradient(180deg, #fff0f6 0%, #ffe5f1 50%, #fff7e0 100%)",
      accent: "#ff6fa5",
    },

    space: {
      name: "Space Explorer",
      emoji: "🚀",
      colors: [
        "#3a0ca3",
        "#480ca8",
        "#560bad",
        "#7209b7",
        "#3f37c9",
        "#4361ee",
        "#4895ef",
        "#560bad",
      ],
      icons: ["🚀", "🪐", "⭐", "🌙", "👽", "🛰️", "☄️", "🌟"],
      sliceTextColor: "#ffffff",
      background: "linear-gradient(180deg, #0b0033 0%, #1b0057 50%, #2d0a6e 100%)",
      accent: "#7209b7",
    },

    jungle: {
      name: "Jungle Safari",
      emoji: "🦁",
      colors: [
        "#2d6a4f",
        "#40916c",
        "#52b788",
        "#74c69d",
        "#95d5b2",
        "#1b4332",
        "#588157",
        "#a3b18a",
      ],
      icons: ["🦁", "🐵", "🐘", "🦒", "🐍", "🦜", "🐯", "🌴"],
      sliceTextColor: "#1b4332",
      background: "linear-gradient(180deg, #d8f3dc 0%, #b7e4c7 50%, #95d5b2 100%)",
      accent: "#2d6a4f",
    },

    rainbow: {
      name: "Rainbow Unicorn",
      emoji: "🦄",
      colors: [
        "#ff595e",
        "#ffca3a",
        "#8ac926",
        "#1982c4",
        "#6a4c93",
        "#ff924c",
        "#52a675",
        "#c5d86d",
      ],
      icons: ["🦄", "🌈", "⭐", "✨", "☁️", "💖", "🌟", "🎀"],
      sliceTextColor: "#3d2c5b",
      background: "linear-gradient(180deg, #fdf0ff 0%, #e0f7ff 50%, #fff8e1 100%)",
      accent: "#6a4c93",
    },

    dino: {
      name: "Dinosaur World",
      emoji: "🦖",
      colors: [
        "#606c38",
        "#283618",
        "#bc6c25",
        "#dda15e",
        "#a3b18a",
        "#588157",
        "#3a5a40",
        "#d4a373",
      ],
      icons: ["🦖", "🦕", "🌋", "🌿", "🥚", "🦴", "🌴", "🪨"],
      sliceTextColor: "#283618",
      background: "linear-gradient(180deg, #fefae0 0%, #faedcd 50%, #e9edc9 100%)",
      accent: "#bc6c25",
    },
  },
};
