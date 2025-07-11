// 用于像浏览器一样开发的时候刷新 20250707kos
require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
});

// const { app, BrowserWindow } = require('electron');
// const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// function createWindow() {
//     const win = new BrowserWindow({
        
//         webPreferences: {
//             contextIsolation: false,
//             nodeIntegration: true,
//         }
//     });

//     win.maximize(); 
//     win.loadFile(path.join(__dirname, 'renderer', 'html', 'mainPage.html'));
// }
// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        frame: false,
        webPreferences: {
            contextIsolation: true, // 推荐true
            nodeIntegration: false, // 推荐false
            preload: path.join(__dirname, 'renderer/js/preload.js')
        }
    });

    win.maximize();
    win.loadFile(path.join(__dirname, 'renderer', 'html', 'mainPage.html'));

    // 监听窗口控制事件
    ipcMain.on('window-minimize', () => win.minimize());
    ipcMain.on('window-close', () => win.close());
}

app.whenReady().then(createWindow);
