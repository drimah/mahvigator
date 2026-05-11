const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mahWindow', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close')
});

contextBridge.exposeInMainWorld('mahBookmarks', {
  importHtml: () => ipcRenderer.invoke('bookmarks:importHtml'),
  exportHtml: (favorites) => ipcRenderer.invoke('bookmarks:exportHtml', favorites)
});
