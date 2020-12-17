const { ipcRenderer } = require("electron");
const EventEmitter = require("events");
const peer = new EventEmitter();

peer.on("robot", (type, data) => {
  if (type === "mouse") {
    data.screen = {
      width: window.screen.width,
      height: window.screen.height,
    };
  }

  // ipcRenderer.send("robot", type, data);
});

const pc = new window.RTCPeerConnection({});

pc.onicecandidate = (e) => {
  console.log("candidate", JSON.stringify(e.candidate));
  if(e.candidate) {
    ipcRenderer.send('forward', 'control-candidate', JSON.parse(JSON.stringify(e.candidate)))
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

ipcRenderer.on("candidate", (e, candidate) => {
  addIceCandidate(candidate);
});

async function createOffer() {
  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
  });
  await pc.setLocalDescription(offer);
  return pc.localDescription;
}

createOffer().then((offer) => {
  console.log("offer", JSON.stringify(offer));
  ipcRenderer.send("forward", "offer", { type: offer.type, sdp: offer.sdp });
});

async function setRemote(answer) {
  pc.setRemoteDescription(answer);
}

ipcRenderer.on("answer", (e, answer) => {
  setRemote(answer);
});

pc.onaddstream = function (e) {
  console.log("add");
  peer.emit("add-stream", e.stream);
};

module.exports = peer;
