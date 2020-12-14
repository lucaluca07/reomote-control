const peer = require("./peer-control");

peer.on("add-stream", play);

const video = document.getElementById("screen-video");
function play(stream) {
  console.log("play stream");
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
  };
}

window.addEventListener("mouseup", (e) => {
  // { clientX, clientY, video: { width, height } }
  peer.emit("robot", "mouse", {
    clientX: e.clientX,
    clientY: e.clientY,
    video: {
      width: video.getBoundingClientRect().width,
      height: video.getBoundingClientRect().height,
    },
  });
});

window.addEventListener("keydown", (e) => {
  peer.emit("robot", "key", {
    key: e.key,
    shift: e.shiftKey,
    meta: e.metaKey,
    control: e.ctrlKey,
    alt: e.altKey,
  });
});
