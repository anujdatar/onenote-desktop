import { app, BrowserWindow, shell, Menu, MenuItemConstructorOptions } from 'electron'
import ConfigStore from 'electron-store'

// const packageData = require('../package.json')
// const appVersion = packageData.version

// global reference for window objects
let mainWindow: BrowserWindow

const appDefaults = {
  homepage: 'https://www.google.com',
  autoHideMenuBar: false,
  minimizeToTray: false,
  closeToTray: false,
  showWelcomePage: true,
  width: 800,
  height: 600
}
const conf = new ConfigStore({ defaults: appDefaults })

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: app.name,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  /* ****************************************************************** */
  // set window bounds on launch
  if (typeof conf.get('windowBounds') !== 'undefined') {
    mainWindow.setBounds(conf.get('windowBounds'))
  } else {
    mainWindow.setSize(800, 600)
    mainWindow.center()
  }
  // open app link (last visited/homepage)
  if (typeof conf.get('lastLink') === 'undefined') {
    mainWindow.loadURL(conf.get('homepage'))
  } else {
    mainWindow.loadURL(conf.get('lastLink'))
    // mainWindow.loadURL('https://www.google.com')
    // mainWindow.loadURL('https://www.onenote.com/notebooks')
  }
  settingsCheckboxStatus()
  /* ****************************************************************** */
  // main window lifecycle hooks
  // emitted when the window is resized
  mainWindow.on('resize', () => {
    const newBounds = mainWindow.getBounds()
    conf.set('windowBounds', newBounds)
  })
  mainWindow.on('moved', () => {
    const newBounds = mainWindow.getBounds()
    conf.set('windowBounds', newBounds)
  })
  mainWindow.on('maximize', () => {
    const newBounds = mainWindow.getBounds()
    conf.set('windowBounds', newBounds)
  })
  mainWindow.on('unmaximize', () => {
    const newBounds = mainWindow.getBounds()
    conf.set('windowBounds', newBounds)
  })
  // emitted when page is loaded, webContents are undefined till this
  mainWindow.webContents.on('did-finish-load', () => {
    // placeholder for now, till functions are loaded
    toggleForwardMenuItem()
    toggleBackMenuItem()
  })
  // emitted when the window is about to be closed
  mainWindow.on('close', () => {
    conf.set('windowBounds', mainWindow.getBounds())
    conf.set('lastLink', mainWindow.webContents.getURL())
  })
  // emitted when the window is closed
  // mainWindow.on('closed', () => {
  //   // delete main window object
  //   mainWindow = null
  // })
}

/* ******************************************************************** */
// app hooks
// emitted when app is ready
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// emitted when all windows closed, quit app
app.on('window-all-closed', () => {
  // handle MacOS close and quit functionality
  if (process.platform !== 'darwin') app.quit()
})
// emitted once web contents are created
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault()
    console.log(url)
    if (url.startsWith('https://onedrive.live.com')) {
      mainWindow.loadURL(url)
    } else {
      shell.openExternal(url)
    }
  })
})
/* ******************************************************************** */
// helper functions
const toggleBooleanConf = function (setting: string) {
  const currentConfValue = conf.get(setting)
  conf.set(setting, !currentConfValue)
  return !currentConfValue
}
// menu item status checks
const toggleForwardMenuItem = function () {
  const forwardItem = menu.getMenuItemById('go-forward')!
  forwardItem.enabled = mainWindow.webContents.canGoForward()
}
const toggleBackMenuItem = function () {
  const backItem = menu.getMenuItemById('go-back')!
  backItem.enabled = mainWindow.webContents.canGoBack()
}
const settingsCheckboxStatus = function () {
  menu.getMenuItemById('auto-hide-menubar')!.checked = conf.get(
    'autoHideMenuBar'
  )
  menu.getMenuItemById('minimize-to-tray')!.checked = conf.get('minimizeToTray')
  menu.getMenuItemById('close-to-tray')!.checked = conf.get('closeToTray')
}
// navigation menu functions
const goForward = function () {
  mainWindow.webContents.goForward()
}
const goBack = function () {
  mainWindow.webContents.goBack()
}
const goHome = function () {
  mainWindow.webContents.loadURL(conf.get('homepage'))
}
// settings menu functions
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
// help menu functions
const launchAboutWindow = function () {
  // TODO: make about window and implement about window launch function
  console.log('opening about window')
}
const reportBug = function () {
  // shell.openExternal(
  //   'https://github.com/anujdatar/onenote-desktop/issues/new/choose'
  // )
  console.log('reporting error/bugs')
}
const doAppReset = function () {
  // TODO: implement soft and hard reset functions
  console.log('doing app reset')
}
const showAppResetConfirmation = function () {
  // TODO: show popup message box for app reset confirmation
  console.log('message box')
  console.log('confirm app reset here')
  doAppReset()
}
/* ******************************************************************** */
// app menu
const menuTemplate: MenuItemConstructorOptions[] = [
  {
    label: 'Navigate',
    submenu: [
      {
        label: 'Forward',
        id: 'go-forward',
        click () {
          goForward()
        }
      },
      {
        label: 'Back',
        id: 'go-back',
        click () {
          goBack()
        }
      },
      { type: 'separator' },
      {
        label: 'OneNote Home',
        click () {
          goHome()
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
        role: 'zoomIn'
      },
      {
        role: 'zoomOut'
      },
      {
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      },
      {
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Auto-hide MenuBar',
        type: 'checkbox',
        id: 'auto-hide-menubar',
        click () {
          toggleMenuVisibility()
        }
      },
      {
        label: 'Minimize to tray',
        type: 'checkbox',
        id: 'minimize-to-tray',
        click () {
          toggleMinimizeToTray()
        }
      },
      {
        label: 'Close to tray',
        type: 'checkbox',
        id: 'close-to-tray',
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
          launchAboutWindow()
        }
      },
      { type: 'separator' },
      {
        label: 'Report Issue/Bug',
        click () {
          reportBug()
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
