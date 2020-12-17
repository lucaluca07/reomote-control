const { BrowserWindow } = require("electron");
const path = require("path");

let controlWin;

function create() {
  controlWin = new BrowserWindow({
    width: 1080,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  controlWin.loadFile(path.resolve(__dirname, "../../renderer/pages/control/index.html"));
}

function send(channel, ...rest) {
  if (!controlWin) {
    throw new Error("Please Create MainWindow");
  }
  controlWin.webContents.send(channel, ...rest);
}

module.exports = { create, send };
