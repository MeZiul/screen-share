const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startShare: () => ipcRenderer.send('start-share'),
    stopShare: () => ipcRenderer.send('stop-share'),
    onUuid: (callback) => ipcRenderer.on('uuid', (event, data) => callback(data))
});