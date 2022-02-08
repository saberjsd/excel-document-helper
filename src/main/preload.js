const { contextBridge, ipcRenderer } = require('electron');
const validChannels = ['ipc-example', 'SET_JSON_STORAGE', 'GET_JSON_STORAGE'];

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    emit(channel, ...args) {
      ipcRenderer.send(channel, ...args);
    },
  },
});
