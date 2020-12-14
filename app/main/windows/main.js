const { BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let win;

function create() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    win.loadFile(path.resolve(__dirname, "../renderer/pages/main/index.html"));
  }
}

function send(channel, ...rest) {
  if (!win) {
    throw new Error("Please Create MainWindow");
  }
  win.webContents.send(channel, ...rest);
}

module.exports = { create, send };
