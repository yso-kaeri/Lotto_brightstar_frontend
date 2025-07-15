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
    const isPackaged = app.isPackaged;
    let resourceDir, javaCmd, jarPath;

    if (isPackaged) {
        const os = require('os');
        resourceDir = process.resourcesPath;
        if (process.platform === 'darwin') {
            // macOS 上的 Java 路徑
            javaCmd = path.join(resourceDir, 'jdk-17.0.11.jdk', 'Contents', 'Home', 'bin', 'java');
        } else if (process.platform === 'win32') {
            // Windows 上的 Java 路徑
            javaCmd = path.join(resourceDir, 'jre', 'bin', 'java.exe');
        }
        jarPath = path.join(resourceDir, 'Lotto_brightstar-0.0.1-SNAPSHOT.jar');

        // 調試輸出
        console.log('javaCmd:', javaCmd);
        console.log('jarPath:', jarPath);
        console.log('java exists:', fs.existsSync(javaCmd));
        console.log('jar exists:', fs.existsSync(jarPath));

        // 僅打包後才啟動 Java backend
        backendProcess = spawn(javaCmd, ['-jar', jarPath], { cwd: resourceDir });

        backendProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[backend] ${output}`);
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
    } else {
        // 開發模式下，只啟動前端
        createWindow();
    }
});

app.on('before-quit', () => {
    if (backendProcess) backendProcess.kill('SIGTERM');
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill('SIGTERM');
    app.quit();
});