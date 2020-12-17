const { ipcRenderer, desktopCapturer } = require("electron");

async function getScreenStream() {
  const sources = await desktopCapturer.getSources({ types: ["screen"] });
  return new Promise(async (resolve, reject) => {
    navigator.webkitGetUserMedia(
      {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sources[0].id,
            maxWidth: window.screen.width,
            maxHeight: window.screen.height,
          },
        },
      },
      (stream) => {
        console.log("add-stream", stream);
        resolve(stream);
      },
      reject
    );
  });
}

const pc = new window.RTCPeerConnection({});

async function createAnswer(offer) {
  let stream = await getScreenStream();
  pc.addStream(stream);

  await pc.setRemoteDescription(offer);
  await pc.setLocalDescription(await pc.createAnswer());

  console.log("answer", JSON.stringify(pc.localDescription));

  return pc.localDescription;
}

ipcRenderer.on("offer", async (e, offer) => {
  const answer = await createAnswer(offer);
  ipcRenderer.send("forward", "answer", { type: answer.type, sdp: answer.sdp });
});

pc.onicecandidate = (e) => {
  console.log("candidate", typeof e.candidate, JSON.stringify(e.candidate));
  if (e.candidate) {
    ipcRenderer.send(
      "forward",
      "puppet-candidate",
      JSON.parse(JSON.stringify(e.candidate))
    );
  }
};

let candidates = [];
async function addIceCandidate(candidate) {
  if (candidate) {
    candidates.push(candidate);
  }
  if (pc.remoteDescription && pc.remoteDescription.type) {
    candidates.forEach(async (candidate) => {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });
    candidates = [];
  }
}

ipcRenderer.on("puppet-candidate", (e, candidate) => {
  addIceCandidate(candidate);
});

window.addIceCandidate = addIceCandidate;
