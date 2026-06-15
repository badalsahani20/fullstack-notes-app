import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

const isDev = !app.isPackaged;
const PRODUCTION_URL = 'https://app.notesify.in';

const THIN_SCROLLBAR_CSS = `
  ::-webkit-scrollbar { width: 4px !important; height: 4px !important; }
  ::-webkit-scrollbar-track { background: transparent !important; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15) !important; border-radius: 999px !important; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.28) !important; }
  ::-webkit-scrollbar-corner { background: transparent !important; }
`;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1280, width),
    height: Math.min(800, height),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: "Notesify - AI Powered Notes & Learning",
    backgroundColor: '#0f0f11',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#ffffff',
      height: 35
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(PRODUCTION_URL);
  }

  // Inject thin scrollbars after every page load (dev + prod)
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(THIN_SCROLLBAR_CSS);
  });

  // Handle loading failures (offline fallback)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (!isDev && validatedURL.startsWith(PRODUCTION_URL)) {
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
