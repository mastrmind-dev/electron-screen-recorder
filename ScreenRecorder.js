const { ipcRenderer } = require("electron");
const fs = require("fs");
const notify = require('electron-notification');

let recordedBlob, video;



ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  try {
    console.log("executed");

    

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
        },
      },
    });
    handleStream(stream);
  } catch (e) {
    handleError(e);
  }
});

ipcRenderer.on("save-dialog-result", async (event, filePath) => {
  // convert the blob into a buffer array
  const bufferArray = await convertBlobToBuffer();
  // write the blob data to selected path
  fs.writeFile(filePath, bufferArray, (err) => {
    err
      ? console.error("Error when saving file:", err)
      : console.info("File saved successfully!", filePath);
  });
});

const handleStream = (stream) => {
  let recordedChunks = [];
  video = document.querySelector("video");

  video.onloadedmetadata = (e) => video.play();

  // create a media recorder instance to record the stream that we created
  const mediaRecorder = new MediaRecorder(stream);

  // add event listeners for saving recorded chunks
  onDataAvailable(mediaRecorder, recordedChunks);
  onRecordingStop(mediaRecorder, recordedChunks);

  // initiate record controllers
  initiateRecordControllers(mediaRecorder);
};

const handleError = (e) => {
  console.log(e);
};

const onDataAvailable = (mediaRecorder, recordedChunks) => {
  mediaRecorder.ondataavailable = (e) => {
    recordedChunks.push(e.data);
  };
};

const onRecordingStop = (mediaRecorder, recordedChunks) => {
  mediaRecorder.onstop = () => {
    // create a blob
    recordedBlob = new Blob(recordedChunks, { type: "video/mp4" });
    // generate tempory url for recorded video
    const url = URL.createObjectURL(recordedBlob);
    // set temp url to the video element
    video.src = url;
    // initiate save button
    initiateSaveButton();
  };
};

const initiateRecordControllers = (mediaRecorder) => {
  document.getElementById("start-record").addEventListener("click", () => {
    mediaRecorder.start();
    notify('Screen recording', {
      body: 'Recording the Screen'
    }, () => {
      console.log('Notification was clicked!')
    })
    
    document.getElementById("start-record").disabled = true;
    document.getElementById("stop-record").disabled = false;
  });
  document.getElementById("stop-record").addEventListener("click", () => {
    mediaRecorder.stop();
    document.getElementById("stop-record").disabled = true;
    document.getElementById("start-record").disabled = false;
  });
};

const initiateSaveButton = () => {
  document.getElementById("save-record").addEventListener("click", () => {
    openSaveDialog();
  });
};

const openSaveDialog = () => {
  ipcRenderer.send("open-save-dialog");
};

const convertBlobToBuffer = () => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(Buffer.from(reader.result));
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(recordedBlob);
  });
};
