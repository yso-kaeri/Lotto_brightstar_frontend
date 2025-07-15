// const { spawn } = require('child_process');
// // // 用于像浏览器一样开发的时候刷新 20250707kos
// // require('electron-reload')(__dirname, {
// //     electron: require(`${__dirname}/node_modules/electron`)
// // });

// // const { app, BrowserWindow } = require('electron');
// // const path = require('path');
// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');

// let backendProcess = null;

// function createWindow() {
//     const win = new BrowserWindow({
//         frame: false,
//         webPreferences: {
//             contextIsolation: true,
//             nodeIntegration: false, 
//             preload: path.join(__dirname, 'renderer/js/preload.js')
//         }
//     });

//     win.maximize();
//     win.loadFile(path.join(__dirname, 'renderer', 'html', 'mainPage.html'));

//     // 监听窗口控制事件
//     ipcMain.on('window-minimize', () => win.minimize());
//     ipcMain.on('window-close', () => win.close());
// }

// app.whenReady().then(() => {
//     backendProcess = spawn(javaCmd, ['-jar', jarPath], { cwd: __dirname });
//     // 啟動 jar，存下 process 物件
//     backendProcess = spawn('java', ['-jar', './Lotto_brightstar-0.0.1-SNAPSHOT.jar'], { cwd: __dirname });
    
//     // 印出後台訊息（方便 debug）
//     backendProcess.stdout.on('data', (data) => console.log(`[backend] ${data}`));
//     backendProcess.stderr.on('data', (data) => console.error(`[backend-err] ${data}`));

//     createWindow();
// });

// app.on('before-quit', () => {
//     if (backendProcess) {
//         backendProcess.kill('SIGTERM');
//     }
// });

// app.on('window-all-closed', () => {
//     if (backendProcess) backendProcess.kill('SIGTERM');
//     app.quit();
// });













const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

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

    ipcMain.on('window-minimize', () => win.minimize());
    ipcMain.on('window-close', () => win.close());
}

app.whenReady().then(() => {
    // 兼容开发环境和打包后环境
    const isPackaged = app.isPackaged;
    let resourceDir, javaCmd, jarPath;

    if (isPackaged) {
        // 打包后用 process.resourcesPath
        // resourceDir = path.join(process.resourcesPath, 'resources');

         resourceDir = process.resourcesPath;
    } else {
        // 开发阶段本地调试用
        resourceDir = path.join(__dirname, 'resources');
    }

    // 拼接内置 JRE 和 Jar 路径
    javaCmd = path.join(resourceDir, 'jre', 'bin', 'java.exe');
    jarPath = path.join(resourceDir, 'Lotto_brightstar-0.0.1-SNAPSHOT.jar');

    // 调试输出
    console.log('javaCmd:', javaCmd);
    console.log('jarPath:', jarPath);
    console.log('java exists:', fs.existsSync(javaCmd));
    console.log('jar exists:', fs.existsSync(jarPath));

    // 启动 Java 后台服务
    backendProcess = spawn(javaCmd, ['-jar', jarPath], { cwd: resourceDir });

    backendProcess.stdout.on('data', (data) => console.log(`[backend] ${data}`));
    backendProcess.stderr.on('data', (data) => console.error(`[backend-err] ${data}`));

    createWindow();
});

app.on('before-quit', () => {
    if (backendProcess) backendProcess.kill('SIGTERM');
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill('SIGTERM');
    app.quit();
});
