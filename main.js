// 用于像浏览器一样开发的时候刷新 20250707kos
require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
});

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
    });

    win.maximize(); 
    win.loadFile(path.join(__dirname, 'renderer', 'html', 'mainPage.html'));
}

app.whenReady().then(createWindow);
