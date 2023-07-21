import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  Menu,
  type MenuItem
} from 'electron'
import * as log from 'electron-log'
import { appMenuTemplate, setMenuBarVisibility } from './menu'
import { conf } from './appConfig'
import { createMainWindow } from './mainWindow'
import { createAboutWindow } from './aboutWindow'
import { createTrayItem } from './trayItem'
// TODO: Implement tray item, tray context menu, open from tray, etc

// global reference for main window object

const currentVersion = app.getVersion()
conf.set('currentVersion', currentVersion)

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

    const mainWindow = createMainWindow()
    // create tray item
    createTrayItem(mainWindow)

    if (conf.get('autoShowAboutWindow') || conf.get('lastVersion') !== currentVersion) {
      createAboutWindow(mainWindow) // show about window on first run or version change
    }
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
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
