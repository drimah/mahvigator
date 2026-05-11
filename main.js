const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1540, height: 940, minWidth: 1180, minHeight: 720,
    backgroundColor: '#00000000',
    title: 'MAHVEGATOR',
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    hasShadow: true,
    webPreferences: {
      preload: __dirname + '/preload.js',
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
  });
  mainWindow.loadFile('index.html');
}

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());

ipcMain.handle('bookmarks:importHtml', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Importar favoritos HTML',
    filters: [{ name: 'Arquivo HTML de favoritos', extensions: ['html', 'htm'] }],
    properties: ['openFile']
  });
  if (result.canceled || !result.filePaths?.[0]) return { canceled: true };
  const html = fs.readFileSync(result.filePaths[0], 'utf8');
  return { canceled: false, html };
});

ipcMain.handle('bookmarks:exportHtml', async (_event, favorites) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar favoritos HTML',
    defaultPath: 'mahvegator-favoritos.html',
    filters: [{ name: 'Arquivo HTML', extensions: ['html'] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  const now = Math.floor(Date.now() / 1000);
  const safe = s => String(s || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const links = (favorites || []).map(f => `        <DT><A HREF="${safe(f.url)}" ADD_DATE="${now}">${safe(f.name || f.url)}</A>`).join('\n');
  const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>MAHVEGATOR Favoritos</TITLE>
<H1>MAHVEGATOR Favoritos</H1>
<DL><p>
    <DT><H3 ADD_DATE="${now}" LAST_MODIFIED="${now}">Favoritos MAHVEGATOR</H3>
    <DL><p>
${links}
    </DL><p>
</DL><p>
`;
  fs.writeFileSync(result.filePath, html, 'utf8');
  return { canceled: false, filePath: result.filePath };
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
