// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const ConfigStore = require('electron-store')
const { menuTemplate } = require('./menu')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
// new electron-store obj to store window config
const conf = new ConfigStore()

// build application menubar
const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, './images/icon.png'),
    title: "OneNote",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  
  // set window bounds based on stored config
  if (typeof conf.get('windowBounds') !== 'undefined') {
    mainWindow.setBounds(conf.get('windowBounds'))
  }

  // open web-app link in a browserWindow
  // check if last visited link is stored configStore
  // else load default link at startup
  if (typeof conf.get('lastLink') === 'undefined'){
    mainWindow.loadURL('https://www.onenote.com/notebooks')
  } else {
    mainWindow.loadURL(conf.get('lastLink'))
  }

  // Emitted when the window is going to be closed
  mainWindow.on('close', function() {
    conf.set('windowBounds', mainWindow.getBounds())
    conf.set("lastLink", mainWindow.webContents.getURL())
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // delete component
    mainWindow = null
  })

  mainWindow.on('resize', function () {
    conf.set("windowBounds", mainWindow.getBounds())
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// Limit/disable the creation of additional windows
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()

    // open url in the current Electron window
    mainWindow.loadURL(navigationUrl)
  })
})
