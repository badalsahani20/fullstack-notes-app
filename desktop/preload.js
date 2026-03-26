import { contextBridge, ipcRenderer } from 'electron';

// Example: Expose some native APIs safely to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  }
});
