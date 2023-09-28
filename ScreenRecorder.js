const { ipcRenderer } = require("electron");

ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  try {
    console.log('executed')
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
        //   minWidth: 1280,
        //   minHeight: 720,
        //   maxWidth: 1280,
        //   maxHeight: 720,
        },
      },
    });
    handleStream(stream);
  } catch (e) {
    handleError(e);
  }
});

const handleStream = (stream) => {
  const video = document.querySelector("video");
  video.srcObject = stream;
  video.onloadedmetadata = (e) => video.play();
};

const handleError = (e) => {
  console.log(e);
};
