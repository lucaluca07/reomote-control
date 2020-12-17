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

ipcRenderer.on("offer", async (e, offer) => {
  const pc = new window.RTCPeerConnection({});

  async function createAnswer(offer) {
    let stream = await getScreenStream();
    pc.addStream(stream);

    await pc.setRemoteDescription(offer);
    await pc.setLocalDescription(await pc.createAnswer());

    console.log("answer", JSON.stringify(pc.localDescription));

    return pc.localDescription;
  }

  pc.ondatachannel = (e) => {
    console.log("data", e);
    e.channel.onmessage = (e) => {
      console.log("onmessage", e, JSON.parse(e.data));
      let { type, data } = JSON.parse(e.data);
      console.log("robot", type, data);
      if (type === "mouse") {
        data.screen = {
          width: window.screen.width,
          height: window.screen.height,
        };
      }
      ipcRenderer.send("robot", type, data);
    };
  };

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

  window.addIceCandidate = addIceCandidate;
  // ipcRenderer.on("puppet-candidate", (e, candidate) => {
  //   addIceCandidate(candidate);
  // });

  const answer = await createAnswer(offer);
  ipcRenderer.send("forward", "answer", { type: answer.type, sdp: answer.sdp });
});
