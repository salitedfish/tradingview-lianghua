/* jshint esversion: 6 */

const electron = require('electron');

const app = electron.app;

const BrowserWindow = electron.BrowserWindow;

// const newWindowBtn = document.getElementById('frameless-window')

const path = require('path');
const url = require('url');

let mainWindow;
function createWindow() {
  // 创建一个窗口，大小 800 * 600
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600
  });
 
  // 在窗口内要展示的内容为 ./dist/index.html，即打包生成的index.html
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './dist', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  // 自动打开调试台

  mainWindow.webContents.openDevTools({
    detach: true
  });

  mainWindow.on('closed', function () {
    // 回收BrowserWindow对象
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

