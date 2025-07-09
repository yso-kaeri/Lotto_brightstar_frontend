const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    uploadPrize: (prizeData) => ipcRenderer.send('upload-prize', prizeData),
    deletePrize: (prizeName) => ipcRenderer.send('delete-prize', prizeName),
    getPrizes: () => ipcRenderer.send('get-prizes'),
    onUpdatePrizesReply: (callback) => ipcRenderer.on('update-prizes-reply', callback),
    onUploadError: (callback) => ipcRenderer.on('upload-error', callback)
});
