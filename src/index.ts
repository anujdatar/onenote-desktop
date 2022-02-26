import { app, BrowserWindow, shell, Menu, MenuItemConstructorOptions, ipcMain, dialog } from 'electron'
import ConfigStore from 'electron-store'
import * as log from 'electron-log'
import * as path from 'path'

// global reference for window objects
let mainWindow: BrowserWindow
let aboutWindow: BrowserWindow

const appDefaults = {
  homepage: 'https://www.google.com',
  autoHideMenuBar: false,
  minimizeToTray: false,
  closeToTray: false,
  showWelcomePage: true,
  wasMaximized: false,
  width: 800,
  height: 600
}
const conf = new ConfigStore({ defaults: appDefaults })

function createWindow () {
  mainWindow = new BrowserWindow({
    title: app.name,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  /* ****************************************************************** */
  // set window bounds on launch
  if (conf.get('wasMaximized')) {
    mainWindow.maximize()
  } else if (typeof conf.get('windowBounds') !== 'undefined') {
    mainWindow.setBounds(conf.get('windowBounds'))
  } else {
    mainWindow.setSize(appDefaults.width, appDefaults.height)
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
  mainWindow.on('resize', () => {
    conf.set('windowBounds', mainWindow.getBounds())
  })
  mainWindow.on('moved', () => {
    conf.set('windowBounds', mainWindow.getBounds())
  })
  mainWindow.on('maximize', () => {
    conf.set('wasMaximized', true)
  })
  mainWindow.on('unmaximize', () => {
    conf.set('wasMaximized', false)
    mainWindow.setBounds(conf.get('windowBounds'))
  })
  mainWindow.webContents.on('did-finish-load', () => {
  // emitted when page is loaded, webContents are undefined till this
    toggleForwardMenuItem()
    toggleBackMenuItem()
  })
  mainWindow.on('close', () => {
  // emitted when the window is about to be closed
    conf.set('windowBounds', mainWindow.getBounds())
    conf.set('lastLink', mainWindow.webContents.getURL())
  })
  // mainWindow.on('closed', () => {
  //   // emitted when the window is closed, delete main window object
  //   mainWindow = null
  // })
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://onedrive.live.com')) {
      mainWindow.loadURL(url)
    } else {
      log.info('opening', url, 'in external browser')
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

/* ******************************************************************** */
// app hooks
// emitted when app is ready
app.whenReady().then(() => {
  log.info('app starting')
  createWindow()
  if (conf.get('showWelcomePage')) {
    launchAboutWindow()
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// emitted when all windows closed, quit app
app.on('window-all-closed', () => {
  log.info('app closing')
  // handle MacOS close and quit functionality
  if (process.platform !== 'darwin') app.quit()
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
