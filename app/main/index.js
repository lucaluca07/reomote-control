const { app } = require("electron");
const robot = require("./robot.js");
const ipcHandle = require("./ipc");
const { create: createMainWindow } = require("./windows/main");
// const { create: createControlWindow } = require("./windows/control");

app.on("ready", () => {
  createMainWindow();
  // createControlWindow();
  ipcHandle();
  robot();
});
