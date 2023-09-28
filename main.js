const { app, BrowserWindow, desktopCapturer } = require("electron");
const { Menu } = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "ScreenRecorder.js"),
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

app.whenReady().then(() => {
  createWindow();
});
