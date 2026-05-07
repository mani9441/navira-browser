const { app, BrowserWindow, ipcMain, Menu } = require("electron");

const path = require("path");

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

  backgroundColor: "#00ffffff",

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
        click: () =>
          win.webContents.inspectElement(props.x, props.y),
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
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
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