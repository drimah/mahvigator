const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({

        width: Math.min(1400, width),
        height: Math.min(900, height),

        minWidth: 1200,
        minHeight: 700,

        frame: false,
        transparent: true,              // ESSENCIAL para cantos redondos!
        backgroundColor: '#00000000',   // Fundo completamente transparente

        hasShadow: false,

        resizable: true,
        maximizable: true,
        minimizable: true,
        fullscreenable: false,

        show: false,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
            webviewTag: true            // ADICIONADO para suporte a webview
        }
    });

    mainWindow.loadFile('index.html');

    // MOSTRAR SOMENTE QUANDO CARREGAR
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // REMOVER FUNDO BRANCO AO REDIMENSIONAR
    mainWindow.setBackgroundColor('#00000000');

    // IPC BOTÕES DA JANELA (CORRIGIDO os nomes)
    ipcMain.on('window-minimize', () => {
        mainWindow.minimize();
    });

    ipcMain.on('window-maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('window-close', () => {
        mainWindow.close();
    });

    // ABRIR DEVTOOLS (OPCIONAL - descomente se precisar)
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {

    createWindow();

    app.on('activate', () => {

        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }
});