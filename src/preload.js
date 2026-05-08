const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "electronAPI",
  {
    minimize: () =>
      ipcRenderer.send(
        "window-minimize"
      ),

    maximize: () =>
      ipcRenderer.send(
        "window-maximize"
      ),

    close: () =>
      ipcRenderer.send(
        "window-close"
      ),

    saveData: (key, value) =>
      ipcRenderer.invoke(
        "store-set",
        key,
        value
      ),

    getData: (key) =>
      ipcRenderer.invoke(
        "store-get",
        key
      ),

    loadTabs: () =>
      ipcRenderer.invoke(
        "tabs-load"
      ),

    saveTabs: (
      tabs,
      activeTabId
    ) =>
      ipcRenderer.invoke(
        "tabs-save",
        tabs,
        activeTabId
      ),

    saveProfile: (profile) =>
      ipcRenderer.invoke(
        "profile-save",
        profile
      ),

    getProfiles: () =>
      ipcRenderer.invoke(
        "profiles-load"
      ),

    saveHistory: (entry) =>
      ipcRenderer.invoke(
        "history-save",
        entry
      ),

    getHistory: () =>
      ipcRenderer.invoke(
        "history-load"
      ),

    savePermission: (
      permission
    ) =>
      ipcRenderer.invoke(
        "permission-save",
        permission
      ),

    getPermissions: () =>
      ipcRenderer.invoke(
        "permissions-load"
      ),
  }
);