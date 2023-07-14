import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  Menu,
  type MenuItem,
  shell
} from 'electron'
import * as log from 'electron-log'
import * as path from 'path'
import { appMenuTemplate, setMenuBarVisibility } from './menu'
import { conf } from './appConfig'
import { createAboutWindow } from './aboutWindow'
import { createTrayItem } from './trayItem'
// TODO: Implement tray item, tray context menu, open from tray, etc

// global reference for main window object
let mainWindow: BrowserWindow

const currentVersion = app.getVersion()
conf.set('currentVersion', currentVersion)

const createAppMainWindow = (): void => {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../assets/icon.png'),
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
    mainWindow.setSize(conf.get('width'), conf.get('height'))
    mainWindow.center()
  }
  // open app link (last visited/homepage)
  if (typeof conf.get('lastLink') === 'undefined') {
    void mainWindow.loadURL(conf.get('homepage'))
  } else {
    void mainWindow.loadURL(conf.get('lastLink'))
  }
  /* ****************************************************************** */
  // main window lifecycle hooks
  // window size and location
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
  })

  // emitted when window is minimized
  // mainWindow.on('minimize', (event: Event) => {
  // if (conf.get('minimizeToTray')) {
  // event.preventDefault()
  // mainWindow.hide()
  // }
  // })
  // mainWindow.on('restore', () => {
  //   mainWindow.show()
  // })

  // emitted when the window is about to be closed
  mainWindow.on('close', () => {
    conf.set('windowBounds', mainWindow.getBounds())
    conf.set('lastLink', mainWindow.webContents.getURL())
    conf.set('lastVersion', currentVersion)
  })

  // enable/disable nav menu items (forward/back)
  mainWindow.webContents.on('did-finish-load', () => {
    const backItem = Menu.getApplicationMenu()?.getMenuItemById('back') as MenuItem
    backItem.enabled = mainWindow.webContents.canGoBack()

    const forwardItem = Menu.getApplicationMenu()?.getMenuItemById('forward') as MenuItem
    forwardItem.enabled = mainWindow.webContents.canGoForward()
  })
  // handle external links in the main window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    log.info('Requesting url', url)
    if (url.startsWith('https://onedrive.live.com') ||
      url.startsWith('https://d.docs.live.net') ||
      url.startsWith('https://www.onenote.com')
    ) {
      log.info('Opening', url, 'inside the OneNote app browser window')
      void mainWindow.loadURL(url)
    } else {
      log.info('Opening', url, 'in external browser')
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

/* ******************************************************************** */
// disable GPU acceleration if disabled in config, default is off
if (!conf.get('enableGPUAcceleration')) {
  app.commandLine.appendSwitch('ignore-gpu-blacklist')
  app.commandLine.appendSwitch('disable-gpu')
  app.commandLine.appendSwitch('disable-gpu-compositing')
}
// app lifecycle hooks
// emitted when app is ready
app.whenReady()
  .then(() => {
    log.info('app starting')

    createAppMainWindow()
    // create tray item
    createTrayItem(mainWindow)

    if (conf.get('autoShowAboutWindow') || conf.get('lastVersion') !== currentVersion) {
      createAboutWindow(mainWindow) // show about window on first run or version change
    }
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createAppMainWindow()
      } else {
        mainWindow.show()
      }
    })

    /* ******************************************************************** */
    // create menu
    const menuTemplate = appMenuTemplate(conf)
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    // modify menu bar
    setMenuBarVisibility(mainWindow, !conf.get('autoHideMenuBar'))
    // register global shortcuts
    globalShortcut.register('F1', () => {
      createAboutWindow(mainWindow) // show about window on F1 keypress
    })
    // set menu checkbox values
    setMenuCheckbox(menu, 'autoHideMenuBar')
    setMenuCheckbox(menu, 'minimizeToTray')
    setMenuCheckbox(menu, 'closeToTray')
    setMenuCheckbox(menu, 'enableGPUAcceleration')
  })
  .catch((err) => {
    log.error(err)
    dialog.showErrorBox('Error', err.message)
    app.quit()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !conf.get('closeToTray')) {
    log.info('app closing')
    app.quit()
  }
})
/* ******************************************************************** */
// menu checkbox functions
// app menu generic helper functions
const setMenuCheckbox = (menu: Menu, menuItemId: string): void => {
  const menuItem = menu.getMenuItemById(menuItemId) as MenuItem
  menuItem.checked = conf.get(menuItemId)
}
