import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import isDev from 'electron-is-dev';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess;
let mainWindow;

function startBackend() {
  // Path to backend/server.js
  const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
  
  serverProcess = fork(serverPath, [], {
    cwd: path.join(__dirname, '..', 'backend'),
    env: { ...process.env, NODE_ENV: isDev ? 'development' : 'production' },
    stdio: 'inherit'
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log(`Backend server exited with code ${code}`);
  });
}

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
    title: "Notesify",
    backgroundColor: '#000000',
    show: false, // Don't show until ready
    autoHideMenuBar: true, // Hide the default menu bar
    titleBarStyle: 'hidden', // Modern title bar
    titleBarOverlay: { // Integrated window controls
      color: '#00000000', // Transparent
      symbolColor: '#000000', // Black icons
      height: 35
    },
  });

  // Remove the default menu entirely
  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, the backend server (on 5500) will serve the frontend as static files.
    // Give the backend a moment to start up.
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5500');
    }, 1000);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
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

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
