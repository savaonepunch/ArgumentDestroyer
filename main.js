// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const Jimp = require('jimp');
const fs = require('fs');
const { BitmapImage, GifFrame, GifUtil } = require('gifwrap');
const { mas } = require('process');
const { exec, execSync } = require('child_process');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 596,
    height: 275,
    resizable: false,
    autoHideMenuBar: true,
    icon: 'flag-round-250.png',
    webPreferences: {
      devTools: false,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.on("upload-click", () => {
    console.log("upload")

    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] } // add gif when supported
      ]
    }).then(result => {
      console.log(result.canceled)
      console.log(result.filePaths)
      if (!result.canceled) {
        BrowserWindow.getFocusedWindow().webContents.send('file-amounts', result.filePaths.length)
        ipcMain.on("start-click", () => {

          console.log("start")

          var folder = './ArgumentDestroyers';

          if (!fs.existsSync(folder) && result.filePaths.length) {
            fs.mkdirSync(folder);
          }

          result.filePaths.forEach(async (file, i) => {

            var re = /(?:\.([^.]+))?$/;

            // If file is gif
            if (re.exec(file)[1] === "gif") {
              console.log(`${file} is a GIF!`);




              os.execCommand(`"./gifsicle.exe" --colors 256 "${file}" -o "ArgumentDestroyers/bubbled_${file.replace(/^.*[\\\/]/, '')}."`, function (returnvalue) {
                os.execCommand(`"./gifsicle.exe" -U "ArgumentDestroyers/bubbled_${file.replace(/^.*[\\\/]/, '')}" -o "ArgumentDestroyers/bubbled_${file.replace(/^.*[\\\/]/, '')}."`, function (returnvalue) {
                  // Here you can get the return value
                  const frames = [];
                  var maskP = Jimp.read("maskGifs.png");


                  GifUtil.read(`ArgumentDestroyers/bubbled_${file.replace(/^.*[\\\/]/, '')}`).then(inputGif => {
                    Promise.all([maskP]).then(function (images) {
                      var lenna = images[0];
                      lenna
                        .resize(inputGif.width, inputGif.height)
                        .write(`.maskGifs.png`);

                    });
                    inputGif.frames.forEach((frame, i) => {
                      // create a Jimp containing a clone of the frame bitmap
                      jimpCopied = GifUtil.copyAsJimp(Jimp, frame);

                      Promise.all([jimpCopied, maskP]).then(function (images) {
                        var lenna = images[0];
                        var mask = images[1];

                        lenna
                          //.greyscale()
                          //.resize(1920 / 2, 1080 / 2)
                          .mask(mask, 0, 0);
                        const fCopied = new GifFrame(new BitmapImage(lenna.bitmap))
                        //GifUtil.quantizeDekker(fCopied);
                        frames.push(fCopied);
                        GifUtil.write(`./ArgumentDestroyers/bubbled_${file.replace(/^.*[\\\/]/, '')}`, frames, { loops: 0 }).then(gif => {
                          console.log("written");
                        });

                      });

                    })

                  })
                })
              })

              //exec(`"./gifsicle.exe" -U "${file}" -o "${file.replace(/^.*[\\\/]/, '')}."`);






            }

            // If its not gif dont do gif stuff
            else {
              var p1 = await Jimp.read(file);
              var p2 = await Jimp.read("mask2.png");

              Promise.all([p1, p2]).then(function (images) {
                var lenna = images[0];
                var mask = images[1];
                lenna
                  .resize(1920 / 2, 1080 / 2)
                  .mask(mask, 0, 0)
                  .write(`./ArgumentDestroyers/bubbled_${file.replace(/^.*[\\\/]/, '')}.png`);

              });

            }

          });

        })

        ipcMain.on("clear-click", () => {
          console.log("clear")
          result.filePaths = [];
          console.log(result.filePaths)
          BrowserWindow.getFocusedWindow().webContents.send('files-cleared', "Uploaded 0 files.")
        })

      }
    }).catch(err => {
      console.log(err)
    })


  })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


function os_func() {
  this.execCommand = function (cmd, callback) {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      callback(stdout);
    });
  }
}
var os = new os_func();