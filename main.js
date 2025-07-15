const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let backendProcess = null;
let windowCreated = false;

function createWindow() {
    windowCreated = true;
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
    resourceDir = process.resourcesPath; // 直接指到 Resources
    } else {
    resourceDir = path.join(__dirname, 'Resources');
    }

    // 拼接内置 JRE 和 Jar 路径
    // 根據自己的電腦環境調整 JAR 路徑
    javaCmd = path.join(resourceDir, 'jdk-17.0.11.jdk', 'Contents', 'Home', 'bin', 'java');
    jarPath = path.join(resourceDir, 'Lotto_brightstar-0.0.1-SNAPSHOT.jar');

    // 调试输出
    console.log('javaCmd:', javaCmd);
    console.log('jarPath:', jarPath);
    console.log('java exists:', fs.existsSync(javaCmd));
    console.log('jar exists:', fs.existsSync(jarPath));

    // 启动 Java 后台服务
    backendProcess = spawn(javaCmd, ['-jar', jarPath], { cwd: resourceDir });

    backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[backend] ${output}`);
        // Check for a specific message from the backend that indicates it's ready
        if (output.includes('Started') && !windowCreated) {
            createWindow();
        }
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`[backend-err] ${data}`);
    });

    backendProcess.on('close', (code) => {
        if (!windowCreated) {
            dialog.showErrorBox('Backend Error', `The backend process exited prematurely with code ${code}. The application will now close.`);
            app.quit();
        }
    });
});

app.on('before-quit', () => {
    if (backendProcess) backendProcess.kill('SIGTERM');
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill('SIGTERM');
    app.quit();
});