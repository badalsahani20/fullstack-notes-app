const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  auth: {
    onOAuthCallback: (callback) => {
      ipcRenderer.on('oauth-callback', (event, code) => callback(code));
    },
    getRefreshToken: () => ipcRenderer.invoke('get-refresh-token'),
    setRefreshToken: (token) => ipcRenderer.invoke('set-refresh-token', token),
    clearRefreshToken: () => ipcRenderer.invoke('clear-refresh-token'),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
  }
});
