// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require("electron")

var amountImages = 0;

var amountImagesPara = document.getElementById("amountImagesPara");

document.addEventListener('DOMContentLoaded', function () {

    let uploadBtn = document.getElementById("uploadBtn");
    uploadBtn.addEventListener("click", () => {
        ipcRenderer.send("upload-click");
    });

    let clearBtn = document.getElementById("clearBtn");
    clearBtn.addEventListener("click", () => {
        ipcRenderer.send("clear-click");
    });

    let startBtn = document.getElementById("startBtn");
    startBtn.addEventListener("click", () => {
        ipcRenderer.send("start-click");
    });

    let audioBtn = document.getElementById("audioBtn");
    audioBtn.addEventListener("click", () => {
        if(document.getElementById("audioPlayer").paused)
        {
           // document.getElementById("audioIcon").classList.remove('fa-solid fa-volume-off');
           // document.getElementById("audioIcon").classList.add('fa-solid fa-volume-high');
            document.getElementById("audioIcon").className = "fa-solid fa-volume-high";
            document.getElementById("audioPlayer").play();
        }
        else{
            //document.getElementById("audioIcon").classList.remove('fa-solid fa-volume-high');
            document.getElementById("audioIcon").className = "fa-solid fa-volume-off";
            document.getElementById("audioPlayer").pause();
        }
    });

});

ipcRenderer.on('file-amounts', (event, message) => {
    amountImages += message;
    console.log(amountImages)
    amountImagesPara.innerText = `Uploaded ${amountImages} files.`
})

ipcRenderer.on('files-cleared', (event, message) => {
    amountImages = 0;
    console.log("Files cleared.")
    amountImagesPara.innerText = `${message}`
})

function lowerVolume(){
    document.getElementById("audioPlayer").volume = 0.3;
}

lowerVolume();