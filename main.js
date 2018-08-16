// Modules to control application life and create native browser window
const {app, BrowserWindow, shell,Menu} = require('electron')
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const os = require("os");
const fs = require("fs");
const path = require("path");
const html2docx = require('html2docx');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let workerWindow
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600,titleBarStyle: 'hidden'})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
//mainWindow.setMenu(null)
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  workerWindow = new BrowserWindow();
workerWindow.loadURL("file://" + __dirname + "/worker.html");
workerWindow.hide();
workerWindow.webContents.openDevTools();
workerWindow.on("closed", () => {
    workerWindow = undefined;
});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

ipc.on("printPDF", (event, content) => {
    workerWindow.webContents.send("printPDF", content);
});
ipc.on("printDOC", (event, content) => {
    workerWindow.webContents.send("printDOC", content);
});
ipc.on("readyToPrintDOC", (event, content) => {
  html2docx.create(content)
.then(buffer => {
  const options = {
      title: 'Save to Docx',
      filters: [
        { name: 'Word document', extensions: ['docx'] }
      ]
    }
    dialog.showSaveDialog(options, function (docpath) {
        if(!docpath){
  fs.writeFile(docpath, buffer, function (error) {
    if (error) {
      throw error
    }
  })
  event.sender.send('wrote-doc', pdfPath)
}
})
})
});
// when worker window is ready


ipc.on("readyToPrintPDF", (event) => {
    //const pdfPath = path.join(os.tmpdir(), 'print.pdf');
    // Use default printing options
    const options = {
        title: 'Save to PDF',
        filters: [
          { name: 'PDF', extensions: ['pdf'] }
        ]
      }
      dialog.showSaveDialog(options, function (pdfPath) {
          if(pdfPath){
        workerWindow.webContents.printToPDF({printBackground: true,landscape: true}, function (error, data) {
            if (error) throw error
            fs.writeFile(pdfPath, data, function (error) {
              if (error) {
                throw error
              }
            })
          //  shell.openItem(pdfPath)
            event.sender.send('wrote-pdf', pdfPath)
        })
      }
    })
});
ipc.on("saveAsMd", (event,content) => {
    //const pdfPath = path.join(os.tmpdir(), 'print.pdf');
    // Use default printing options
    const options = {
        title: 'Save to Mardown',
        filters: [
          { name: 'Markdown file', extensions: ['md'] }
        ]
      }
      dialog.showSaveDialog(options, function (mdPath) {
          if(mdPath){
            fs.writeFile(mdPath, content, function (error) {
              if (error) {
                throw error
              }
            })
              event.sender.send('wrote-md', mdPath)
            }
        })

});
ipc.on("saveMd", (event,content,mdPath) => {
            fs.writeFile(mdPath, content, function (error) {
              if (error) {
                throw error
              }
            })
            event.sender.send('wrote-md', mdPath)


});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
