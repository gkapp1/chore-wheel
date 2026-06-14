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
      background:
        "radial-gradient(circle at 12% 105%, #ffd6e8 0%, transparent 45%), " +
        "radial-gradient(circle at 88% 110%, #c9f0ff 0%, transparent 45%), " +
        "linear-gradient(180deg, #fff7fb 0%, #ffe9f4 55%, #ffd9ed 100%)",
      accent: "#ff6fa5",
      decor: [
        { emoji: "🍭", style: "left:-3vw; bottom:-5vh; font-size:clamp(70px,18vw,160px); transform:rotate(-15deg); opacity:0.95;" },
        { emoji: "🍬", style: "right:-2vw; bottom:-3vh; font-size:clamp(60px,15vw,130px); transform:rotate(20deg); opacity:0.9;" },
        { emoji: "🧁", style: "left:4vw; top:5vh; font-size:clamp(36px,8vw,64px); opacity:0.85;" },
        { emoji: "🍩", style: "right:5vw; top:9vh; font-size:clamp(32px,7vw,56px); opacity:0.85;" },
        { emoji: "🍫", style: "left:48%; bottom:-3vh; font-size:clamp(50px,12vw,100px); transform:translateX(-50%) rotate(5deg); opacity:0.8;" },
        { emoji: "🍡", style: "right:10vw; bottom:10vh; font-size:clamp(28px,6vw,48px); opacity:0.8;" },
      ],
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
      background:
        "radial-gradient(circle at 80% 8%, rgba(255,255,255,0.10) 0%, transparent 35%), " +
        "radial-gradient(circle at 15% 85%, rgba(114,9,182,0.5) 0%, transparent 50%), " +
        "linear-gradient(180deg, #0b0033 0%, #1b0057 50%, #2d0a6e 100%)",
      accent: "#7209b7",
      decor: [
        { emoji: "🪐", style: "right:-4vw; top:5vh; font-size:clamp(70px,18vw,170px); transform:rotate(15deg); opacity:0.9;" },
        { emoji: "🌙", style: "left:4vw; top:5vh; font-size:clamp(40px,9vw,72px); opacity:0.9;" },
        { emoji: "⭐", style: "left:12vw; top:32vh; font-size:clamp(18px,4vw,28px); opacity:0.8;" },
        { emoji: "✨", style: "right:16vw; top:22vh; font-size:clamp(20px,4vw,30px); opacity:0.8;" },
        { emoji: "🌟", style: "left:8vw; bottom:20vh; font-size:clamp(20px,4vw,32px); opacity:0.8;" },
        { emoji: "☄️", style: "right:6vw; bottom:32vh; font-size:clamp(36px,7vw,56px); transform:rotate(-25deg); opacity:0.85;" },
        { emoji: "🚀", style: "left:-3vw; bottom:-3vh; font-size:clamp(70px,16vw,140px); transform:rotate(-20deg); opacity:0.9;" },
      ],
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
      background:
        "radial-gradient(circle at 50% 115%, #74c69d 0%, transparent 50%), " +
        "linear-gradient(180deg, #d8f3dc 0%, #b7e4c7 50%, #95d5b2 100%)",
      accent: "#2d6a4f",
      decor: [
        { emoji: "🌴", style: "left:-3vw; bottom:-5vh; font-size:clamp(80px,20vw,180px); opacity:0.95;" },
        { emoji: "🌴", style: "right:-3vw; bottom:-6vh; font-size:clamp(70px,18vw,160px); transform:scaleX(-1); opacity:0.9;" },
        { emoji: "🌿", style: "left:6vw; top:-3vh; font-size:clamp(50px,12vw,100px); transform:rotate(180deg); opacity:0.85;" },
        { emoji: "🌿", style: "right:8vw; top:-3vh; font-size:clamp(46px,11vw,90px); transform:rotate(160deg) scaleX(-1); opacity:0.85;" },
        { emoji: "🦜", style: "right:10vw; top:14vh; font-size:clamp(32px,7vw,48px); opacity:0.9;" },
        { emoji: "🍃", style: "left:18vw; top:20vh; font-size:clamp(24px,5vw,36px); opacity:0.8;" },
      ],
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
      background:
        "radial-gradient(circle at 50% 0%, #ffe3f6 0%, transparent 50%), " +
        "linear-gradient(180deg, #fdf0ff 0%, #e0f7ff 50%, #fff8e1 100%)",
      accent: "#6a4c93",
      decor: [
        { emoji: "🌈", style: "left:50%; top:-8vh; font-size:clamp(120px,30vw,260px); transform:translateX(-50%); opacity:0.9;" },
        { emoji: "☁️", style: "left:2vw; top:18vh; font-size:clamp(40px,9vw,72px); opacity:0.9;" },
        { emoji: "☁️", style: "right:4vw; top:10vh; font-size:clamp(50px,11vw,88px); opacity:0.9;" },
        { emoji: "✨", style: "left:14vw; bottom:16vh; font-size:clamp(20px,4vw,30px); opacity:0.85;" },
        { emoji: "🦄", style: "right:-3vw; bottom:-3vh; font-size:clamp(70px,17vw,150px); opacity:0.95;" },
        { emoji: "🎀", style: "left:-3vw; bottom:-1vh; font-size:clamp(50px,12vw,100px); opacity:0.85;" },
      ],
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
      background:
        "radial-gradient(circle at 85% 105%, #f4a259 0%, transparent 45%), " +
        "linear-gradient(180deg, #fefae0 0%, #faedcd 50%, #e9edc9 100%)",
      accent: "#bc6c25",
      decor: [
        { emoji: "🌋", style: "right:-5vw; bottom:-6vh; font-size:clamp(100px,24vw,220px); opacity:0.9;" },
        { emoji: "🌴", style: "left:-3vw; bottom:-5vh; font-size:clamp(70px,17vw,150px); opacity:0.9;" },
        { emoji: "🌿", style: "left:10vw; top:-2vh; font-size:clamp(50px,11vw,90px); transform:rotate(170deg); opacity:0.8;" },
        { emoji: "🥚", style: "right:14vw; bottom:12vh; font-size:clamp(28px,6vw,42px); opacity:0.85;" },
        { emoji: "🪨", style: "left:16vw; bottom:8vh; font-size:clamp(32px,7vw,50px); opacity:0.8;" },
        { emoji: "🦴", style: "right:6vw; top:16vh; font-size:clamp(24px,5vw,38px); transform:rotate(-30deg); opacity:0.8;" },
      ],
    },
  },
};
