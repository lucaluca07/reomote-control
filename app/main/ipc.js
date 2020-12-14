const { ipcMain } = require("electron");
const { send: sendMainWindow } = require("./windows/main");
const { create: createControlWindow } = require("./windows/control");
function handleIPC() {
  ipcMain.handle("login", async () => {
    const code = Math.random().toFixed(6).slice(-6);
    return code;
  });

  ipcMain.on("control", async (e, remoteCode) => {
    sendMainWindow("control-state-change", remoteCode, 1);
    createControlWindow();
  });
}

module.exports = handleIPC;
