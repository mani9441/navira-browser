const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // Persistence methods
  saveData: (key, value) => ipcRenderer.invoke('store-set', key, value),
  getData: (key) => ipcRenderer.invoke('store-get', key)
});