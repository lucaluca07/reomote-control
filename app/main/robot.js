const robot = require("robotjs");
const { ipcMain } = require("electron");

function handleMouse(data) {
  console.log(data, "mouse");
  const { clientX, clientY, video, screen } = data;
  const x = (clientX * video.width) / screen.width;
  const y = (clientY * video.height) / screen.height;

  robot.moveMouse(x, y);
  robot.mouseClick();
}

function handleKey(data) {
  console.log(data, "key");
  const modifiers = [];
  if (data.meta) modifiers.push("meta");
  if (data.ctrl) modifiers.push("ctrl");
  if (data.shift) modifiers.push("shift");
  if (data.alt) modifiers.push("alt");
  robot.keyTap(data.key.toLowerCase(), modifiers);
}

module.exports = function () {
  ipcMain.on("robot", (e, type, data) => {
    if (type === "mouse") {
      handleMouse(data);
    } else if (type === "key") {
      handleKey(data);
    }
  });
};
