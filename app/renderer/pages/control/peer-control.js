const { ipcRenderer } = require("electron");
const EventEmitter = require("events");
const peer = new EventEmitter();
const { desktopCapturer } = require("electron");

async function getScreenStream() {
  const sources = await desktopCapturer.getSources({ types: ["screen"] });

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sources[0].id,
          maxWidth: window.screen.width,
          maxHeight: window.screen.height,
        },
      },
    });
    peer.emit("add-stream", stream);
  } catch (e) {
    console.log(e);
  }
}

getScreenStream();

peer.on("robot", (type, data) => {
  if (type === "mouse") {
    data.screen = {
      width: window.screen.width,
      height: window.screen.height,
    };
  }

  ipcRenderer.send("robot", type, data);
});

module.exports = peer;
