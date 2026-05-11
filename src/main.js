const { app, BrowserWindow, ipcMain, Menu } = require("electron");

const path = require("path");

const db = require("../database/Database");

app.commandLine.appendSwitch("enable-transparent-visuals");
app.commandLine.appendSwitch("disable-gpu-sandbox");

const Store = require("electron-store").default;

const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    frame: false,
    transparent: true,

    backgroundColor: "#09091f",

    hasShadow: false,

    webPreferences: {
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:5173");

  // FORCE rounded clipping on Windows/Linux
  win.setResizable(true);

  // Context menu
  win.webContents.on("context-menu", (e, props) => {
    const menu = Menu.buildFromTemplate([
      {
        label: "Inspect Element",
        click: () => win.webContents.inspectElement(props.x, props.y),
      },
      { type: "separator" },
      { label: "Reload Browser", role: "reload" },
    ]);

    menu.popup();
  });
}
// --- APP LIFECYCLE ---
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- IPC STORE HANDLERS ---
ipcMain.handle("store-get", (event, key) => {
  return store.get(key);
});

ipcMain.handle("store-set", (event, key, value) => {
  store.set(key, value);
});

// --- WINDOW CONTROL HANDLERS ---
ipcMain.on("window-minimize", () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on("window-maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on("window-close", () => {
  BrowserWindow.getFocusedWindow()?.close();
});

// Database ipc listeners

ipcMain.handle("tabs-load", () => {
  return db
    .prepare(
      `
    SELECT * FROM tabs
  `,
    )
    .all();
});

ipcMain.handle("tabs-save", (event, tabs, activeTabId) => {
  db.prepare(`DELETE FROM tabs`).run();

  const stmt = db.prepare(`
    INSERT INTO tabs (
      id,
      profile_id,
      url,
      title,
      favicon,
      partition_name,
      is_active,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tab of tabs) {
    stmt.run(
      tab.id,
      tab.profileId || 1,
      tab.url,
      tab.title,
      tab.favicon,
      tab.partition,
      tab.id === activeTabId ? 1 : 0,
      tab.createdAt,
    );
  }

  return true;
});

ipcMain.handle("profile-save", (event, profile) => {
  const stmt = db.prepare(`
      INSERT OR REPLACE INTO profiles
      (
        id,
        name,
        partition,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `);

  stmt.run(profile.id, profile.name, profile.partition, profile.createdAt);

  return true;
});

ipcMain.handle("profiles-load", () => {
  return db
    .prepare(
      `
      SELECT * FROM profiles
    `,
    )
    .all();
});

ipcMain.handle("history-save", (event, entry) => {
  const stmt = db.prepare(`
      INSERT INTO history
      (
        url,
        title,
        visited_at
      )
      VALUES (?, ?, ?)
    `);

  stmt.run(entry.url, entry.title, Date.now());

  return true;
});

ipcMain.handle("history-load", () => {
  return db
    .prepare(
      `
      SELECT * FROM history
      ORDER BY visited_at DESC
    `,
    )
    .all();
});

ipcMain.handle("permission-save", (event, permission) => {
  const stmt = db.prepare(`
      INSERT INTO permissions
      (
        domain,
        permission,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `);

  stmt.run(
    permission.domain,
    permission.permission,
    permission.status,
    Date.now(),
  );

  return true;
});

ipcMain.handle("permissions-load", () => {
  return db
    .prepare(
      `
      SELECT * FROM permissions
    `,
    )
    .all();
});
