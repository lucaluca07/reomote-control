const { ipcMain } = require("electron");
const { send: sendMainWindow } = require("./windows/main");
const {
  create: createControlWindow,
  send: sendControlWindow,
} = require("./windows/control");
const signal = require("./signal");

function handleIPC() {
  ipcMain.handle("login", async () => {
    console.log("11111")
    const { code } = await signal.invoke("login", null, "login");
    return code;
  });

  ipcMain.on("control", async (e, remote) => {
    signal.send("control", { remote });
  });

  signal.on("controlled", (data) => {
    sendMainWindow("control-state-change", data.remote, 1);
    createControlWindow();
  });

  signal.on("be-controlled", (data) => {
    sendMainWindow("control-state-change", data.remote, 2);
  });

  ipcMain.on("forward", (e, event, data) => {
    signal.send("forward", { event, data });
  });

  signal.on("offer", (data) => {
    sendMainWindow("offer", data);
  });

  signal.on("answer", (data) => {
    sendControlWindow("answer", data);
  });

  // 收到control证书，puppet响应
  signal.on("puppet-candidate", (data) => {
    sendControlWindow("candidate", data);
  });

  // 收到puppet证书，control响应
  signal.on("control-candidate", (data) => {
    sendMainWindow("candidate", data);
  });
}

module.exports = handleIPC;
