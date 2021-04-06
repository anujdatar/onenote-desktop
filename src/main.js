const { app, BrowserWindow, Menu, shell, dialog } = require('electron')
const path = require('path')
const ConfigStore = require('@anujdatar/appconfig')

// define app defaults
const appDefaults = {
  homepage: 'https://www.onenote.com/notebooks',
  autoHideMenuBar: false,
  minimizeToTray: false,
  closeToTray: false
}

// global reference of the window object
let mainWindow
// persistent app configs
const conf = new ConfigStore({ defaults: appDefaults })

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

  // set window bounds based on stored config
  if (typeof conf.get('windowBounds') !== 'undefined') {
    mainWindow.setBounds(conf.get('windowBounds'))
  }

  // open app link (last visited/homepage)
  if (typeof conf.get('lastLink') === 'undefined') {
    mainWindow.loadURL(conf.get('homepage'))
  } else {
    mainWindow.loadURL(conf.get('lastLink'))
    // mainWindow.loadURL('https://www.google.com')
    // mainWindow.loadURL('https://www.onenote.com/notebooks')
  }

  // Emitted when the window is going to be closed
  mainWindow.on('close', function () {
    conf.set('windowBounds', mainWindow.getBounds())
    conf.set('lastLink', mainWindow.webContents.getURL())
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // delete component
    mainWindow = null
  })

  mainWindow.on('resize', function () {
    conf.set('windowBounds', mainWindow.getBounds())
  })

  mainWindow.webContents.on('did-finish-load', () => {
    // enable/disable menu items once page is loaded
    // webcontents are undefined before this
    toggleForwardMenuItem()
    toggleBackMenuItem()
  })
}

// create browser window when app ready
app.on('ready', function () {
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // handle macOS close and quit functionality
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // create new window only if none exist
  if (mainWindow === null) createWindow()
})

// Limit/disable the creation of additional windows
// mainWindow.webContents.setWindowOpenHandler doesn't yet work on OneNote
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault()
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
        label: 'Report Issue/Bug',
        click () {
          shell.openExternal(
            'https://github.com/anujdatar/onenote-desktop/issues/new/choose'
          )
        }
      },
      {
        label: 'Reset App',
        click: showAppResetConfirmation
      }
    ]
  }
]

// build application menubar
const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)
