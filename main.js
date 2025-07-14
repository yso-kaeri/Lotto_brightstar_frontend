const { spawn } = require('child_process');
// // 用于像浏览器一样开发的时候刷新 20250707kos
// require('electron-reload')(__dirname, {
//     electron: require(`${__dirname}/node_modules/electron`)
// });

// const { app, BrowserWindow } = require('electron');
// const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let backendProcess = null;

function createWindow() {
    const win = new BrowserWindow({
        frame: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false, 
            preload: path.join(__dirname, 'renderer/js/preload.js')
        }
    });

    win.maximize();
    win.loadFile(path.join(__dirname, 'renderer', 'html', 'mainPage.html'));

    // 监听窗口控制事件
    ipcMain.on('window-minimize', () => win.minimize());
    ipcMain.on('window-close', () => win.close());
}

app.whenReady().then(() => {
    // 啟動 jar，存下 process 物件
    backendProcess = spawn('java', ['-jar', './Lotto_brightstar-0.0.1-SNAPSHOT.jar'], { cwd: __dirname });

    // 印出後台訊息（方便 debug）
    backendProcess.stdout.on('data', (data) => console.log(`[backend] ${data}`));
    backendProcess.stderr.on('data', (data) => console.error(`[backend-err] ${data}`));

    createWindow();
});

app.on('before-quit', () => {
    if (backendProcess) {
        backendProcess.kill('SIGTERM');
    }
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill('SIGTERM');
    app.quit();
});
