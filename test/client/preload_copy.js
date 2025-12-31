const { contextBridge, desktopCapturer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    captureSources: () => desktopCapturer.getSources({ types: ['screen'] })
});
