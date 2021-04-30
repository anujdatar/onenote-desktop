const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const ConfigStore = require('@anujdatar/appconfig')

const showAboutWindow = require('./about')

// app defaults
const appDefaults = {
  homepage: 'https://www.onenote.com/notebooks',
  autoHideMenuBar: false,
  minimizeToTray: false,
  closeToTray: false,
  showWelcomePage: true
}

// persistent app config
const conf = new ConfigStore({ defaults: appDefaults })

// global reference for the window objects
let mainWindow
let aboutWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, './images/icon.png'),
    title: 'OneNote',
    autoHideMenuBar: conf.get('autoHideMenuBar'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // set window bounds on launch
  if (typeof conf.get('windowBounds') !== 'undefined') {
    mainWindow.setBounds(conf.get('windowBounds'))
  }

  /* ****************************************************************** */
  // open app link (last visited/homepage)
  if (typeof conf.get('lastLink') === 'undefined') {
    mainWindow.loadURL(conf.get('homepage'))
  } else {
    mainWindow.loadURL(conf.get('lastLink'))
    // mainWindow.loadURL('https://www.google.com')
    // mainWindow.loadURL('https://www.onenote.com/notebooks')
  }

  /* ****************************************************************** */
  // emitted when the window is about to be closed
  mainWindow.on('close', () => {
    conf.set('windowBounds', mainWindow.getBounds())
    conf.set('lastLink', mainWindow.webContents.getURL())
  })

  // emitted when the window is closed
  mainWindow.on('closed', () => {
    // delete main window object
    mainWindow = null
  })

  // emitted when the window is resized
  mainWindow.on('resize', () => {
    const newBounds = mainWindow.getBounds()
    conf.set('windowBounds', newBounds)
  })

  // emitted when page is loaded, webContents are undefined till this
  mainWindow.webContents.on('did-finish-load', () => {
    // placeholder for now, till functions are loaded
    toggleForwardMenuItem()
    toggleBackMenuItem()
  })
}

/* ****************************************************************** */
// app hooks
// emitted when ready, create browser window and show webview
app.on('ready', () => {
  createWindow()
  if (conf.get('showWelcomePage')) {
    aboutWindow = showAboutWindow(mainWindow)
  }
})

// emitted when all windows closed, quit app
app.on('window-all-closed', () => {
  // handle MacOS close and quit functionality
  if (process.platform !== 'darwin') app.quit()
})

// emitted when app icon is activated
app.on('activated', () => {
  // create new window only if none exist
  if (mainWindow === null) createWindow()
})

// emitted once web contents are created
app.on('web-contents-created', (event, contents) => {
  // emitted when external links are clicked
  // limit/disable creation of additional windows
  contents.on('new-window', (event, url) => {
    event.preventDefault()
    console.log(url)
    if (url.startsWith('https://onedrive.live.com')) {
      // open onedrive / onenote links in main window
      mainWindow.loadURL(url)
    } else {
      // open non onenote links in system default browser
      shell.openExternal(url)
    }
  })
})

/* ******************** Menu Functions *********************** */
const doAppReset = function () {
  const fs = require('fs')
  const getAppPath = path.join(app.getPath('userData'))
  fs.rmdir(getAppPath, { recursive: true }, err => {
    if (err) console.log(err)
    else {
      console.log('Resetting app')
      app.relaunch()
      app.exit()
    }
  })
}

const showAppResetConfirmation = function () {
  const options = {
    type: 'question',
    buttons: ['Yes', 'No'],
    defaultId: 1,
    title: 'App Reset Confirmation',
    message: 'Are you sure you want to reset the application?'
  }
  dialog.showMessageBox(mainWindow, options).then(result => {
    if (result.response === 0) {
      doAppReset()
    }
  })
}

const toggleForwardMenuItem = function () {
  const forwardItem = menu.getMenuItemById('go-forward')
  forwardItem.enabled = mainWindow.webContents.canGoForward()
}
const toggleBackMenuItem = function () {
  const backItem = menu.getMenuItemById('go-back')
  backItem.enabled = mainWindow.webContents.canGoBack()
}

const toggleBooleanConf = function (setting) {
  const current_conf_value = conf.get(setting)
  conf.set(setting, !current_conf_value)
  return !current_conf_value
}

const toggleMenuVisibility = function () {
  const newValue = toggleBooleanConf('autoHideMenuBar')
  mainWindow.setAutoHideMenuBar(newValue)
  mainWindow.setMenuBarVisibility(!newValue)
}
const toggleMinimizeToTray = function () {
  toggleBooleanConf('minimizeToTray')
}
const toggleCloseToTray = function () {
  toggleBooleanConf('closeToTray')
}

/* ******************** Menu Template ************************ */
const menuTemplate = [
  {
    label: 'Navigate',
    submenu: [
      {
        label: 'Forward',
        id: 'go-forward',
        click () {
          mainWindow.webContents.goForward()
        }
      },
      {
        label: 'Back',
        id: 'go-back',
        click () {
          mainWindow.webContents.goBack()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'OneNote Home',
        click () {
          mainWindow.webContents.loadURL(conf.get('homepage'))
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'copy'
      },
      {
        role: 'cut'
      },
      {
        role: 'paste'
      },
      {
        type: 'separator'
      },
      {
        role: 'undo'
      },
      {
        role: 'redo'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'reload'
      },
      {
        type: 'separator'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        role: 'resetzoom'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      },
      {
        role: 'toggledevtools'
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Auto-hide Menu Bar',
        type: 'checkbox',
        checked: conf.get('autoHideMenuBar'),
        click () {
          toggleMenuVisibility()
        }
      },
      {
        label: 'Minimize to Tray',
        type: 'checkbox',
        checked: conf.get('minimizeToTray'),
        click () {
          toggleMinimizeToTray()
        }
      },
      {
        label: 'Close to Tray',
        type: 'checkbox',
        checked: conf.get('closeToTray'),
        click () {
          toggleCloseToTray()
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click () {
          aboutWindow = showAboutWindow(mainWindow)
        }
      },
      { type: 'separator' },
      {
        label: 'Report Issue/Bug',
        click () {
          shell.openExternal(
            'https://github.com/anujdatar/onenote-desktop/issues/new/choose'
          )
        }
      },
      {
        label: 'Reset App',
        click () {
          showAppResetConfirmation()
        }
      }
    ]
  }
]

// build application menubar
const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)

// update welcome page toggle state from renderer
ipcMain.on('toggle-welcome-page-state', (event, value) => {
  conf.set('showWelcomePage', value)
})

// send welcome page toggle state on startup
ipcMain.on('welcome-toggle-state', event => {
  event.reply('welcome-toggle-state-reply', conf.get('showWelcomePage'))
})

// close about window
ipcMain.on('close-about-page', () => {
  aboutWindow.close()
})
