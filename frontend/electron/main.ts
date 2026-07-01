import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Ristorante POS',
    backgroundColor: '#020617', // slate-950
    show: false, // Prevent flash of white before content loads
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Show window once content is ready (prevents white flash)
  win.on('ready-to-show', () => {
    win.show();
  });

  // Open external links in the default browser, not in-app
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Development: load from Vite dev server with HMR
  // Production: load the built index.html from disk
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // macOS: re-create window when dock icon is clicked and no windows exist
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
