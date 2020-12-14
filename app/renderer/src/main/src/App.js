import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import "./App.css";

function App() {
  const [localCode, setLocalCode] = useState("");
  const [remoteCode, setRemoteCode] = useState("");
  const [controlText, setControlText] = useState("");

  const login = async () => {
    const code = await ipcRenderer.invoke("login");
    setLocalCode(code);
  };

  const handleControlState = (e, name, type) => {
    let text = "";
    if (type === 1) {
      text = `正在远程控制${name}`;
    } else if (type === 2) {
      text = `被${name}控制中`;
    }
    setControlText(text);
  };

  const startControl = () => {
    ipcRenderer.send("control", remoteCode);
  };

  useEffect(() => {
    login();
    ipcRenderer.on("control-state-change", handleControlState);
    return () =>
      ipcRenderer.removeListener("control-state-change", handleControlState);
  }, []);

  return (
    <div className="App">
      <div>你的控制码: {localCode}</div>
      <div>
        {controlText === "" ? (
          <>
            <input
              onChange={(e) => setRemoteCode(e.target.value)}
              value={remoteCode}
            />
            <button onClick={startControl} disabled={!remoteCode}>
              确 定
            </button>
          </>
        ) : (
          <span>{controlText}</span>
        )}
      </div>
    </div>
  );
}

export default App;
