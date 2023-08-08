import path from 'path'
import { app, BrowserWindow, Menu, type MenuItem, shell } from 'electron'
import * as log from 'electron-log'
import { conf } from './appConfig'
import { appMenuTemplate, setMenuBarVisibility } from './menu'
// import { createAboutWindow } from './aboutWindow'

const currentVersion = app.getVersion()
export const createMainWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
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
    win.maximize()
  } else if (typeof conf.get('windowBounds') !== 'undefined') {
    win.setBounds(conf.get('windowBounds'))
  } else {
    win.setSize(conf.get('width'), conf.get('height'))
    win.center()
  }
  // open app link (last visited/homepage)
  if (typeof conf.get('lastLink') === 'undefined') {
    void win.loadURL(conf.get('homepage'))
  } else {
    void win.loadURL(conf.get('lastLink'))
  }
  /* ****************************************************************** */
  // main window lifecycle hooks
  // window size and location
  win.on('resize', () => {
    conf.set('windowBounds', win.getBounds())
  })
  win.on('moved', () => {
    conf.set('windowBounds', win.getBounds())
  })
  win.on('maximize', () => {
    conf.set('wasMaximized', true)
  })
  win.on('unmaximize', () => {
    conf.set('wasMaximized', false)
  })

  // emitted when window is minimized
  win.on('minimize', (event: Event) => {
    if (conf.get('minimizeToTray')) {
      event.preventDefault()
      win.hide()
    }
  })
  // emitted when the window is about to be closed
  win.on('close', () => {
    conf.set('windowBounds', win.getBounds())
    conf.set('lastLink', win.webContents.getURL())
    conf.set('lastVersion', currentVersion)
  })

  // enable/disable nav menu items (forward/back)
  win.webContents.on('did-finish-load', () => {
    const backItem = Menu.getApplicationMenu()?.getMenuItemById('back') as MenuItem
    backItem.enabled = win.webContents.canGoBack()

    const forwardItem = Menu.getApplicationMenu()?.getMenuItemById('forward') as MenuItem
    forwardItem.enabled = win.webContents.canGoForward()
  })
  // handle external links in the main window
  win.webContents.setWindowOpenHandler(({ url }) => {
    log.info('Requesting url', url)
    if (url.startsWith('https://onedrive.live.com') ||
      url.startsWith('https://d.docs.live.net') ||
      url.startsWith('https://www.onenote.com')
    ) {
      log.info('Opening', url, 'inside the OneNote app browser window')
      void win.loadURL(url)
    } else {
      log.info('Opening', url, 'in external browser')
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  /* ******************************************************************** */
  // create app menu
  const menuTemplate = appMenuTemplate(conf)
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  // modify menu bar
  setMenuBarVisibility(win, !conf.get('autoHideMenuBar'))
  // register global shortcuts
  // globalShortcut.register('F1', () => {
  //   createAboutWindow(win) // show about window on F1 keypress
  // })
  // set menu checkbox values
  setMenuCheckbox(menu, 'autoHideMenuBar')
  setMenuCheckbox(menu, 'minimizeToTray')
  setMenuCheckbox(menu, 'closeToTray')
  setMenuCheckbox(menu, 'enableGPUAcceleration')

  return win
}

// menu checkbox helper function
const setMenuCheckbox = (menu: Menu, menuItemId: string): void => {
  const menuItem = menu.getMenuItemById(menuItemId) as MenuItem
  menuItem.checked = conf.get(menuItemId)
}
