const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    uploadPrize: (prizeData) => ipcRenderer.send('upload-prize', prizeData),
    deletePrize: (prizeName) => ipcRenderer.send('delete-prize', prizeName),
    getPrizes: () => ipcRenderer.send('get-prizes'),
    onUpdatePrizesReply: (callback) => ipcRenderer.on('update-prizes-reply', callback),
    onUploadError: (callback) => ipcRenderer.on('upload-error', callback),
    minimize: () => ipcRenderer.send('window-minimize'),
    close: () => ipcRenderer.send('window-close')
});
