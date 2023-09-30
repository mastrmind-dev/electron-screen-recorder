const {
  app,
  BrowserWindow,
  desktopCapturer,
  Menu,
  dialog,
  ipcMain,
} = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "ScreenRecorder.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  win.loadFile("index.html");

  desktopCapturer
    .getSources({ types: ["screen", "window"] })
    .then(async (sources) => {
      Menu.buildFromTemplate(
        sources.map((source) => {
          return {
            label: source.name,
            click: () => {
              win.webContents.send("SET_SOURCE", source.id);
            },
          };
        })
      ).popup();
    });
};

ipcMain.on("open-save-dialog", (event) => {
  dialog
    .showSaveDialog({
      title: "save recorded video",
      defaultPath: "recorded-video.mp4",
      filters: [{ name: "Video Files", extensions: "webm, mp4, mkv, avi" }],
    })
    .then((result) => {
      if (!result.canceled && result.filePath) {
        event.reply("save-dialog-result", `${result.filePath}.mp4`);
      }
    });
});

app.whenReady().then(() => {
  createWindow();
});
