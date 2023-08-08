import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  type MenuItemConstructorOptions,
  type MessageBoxOptions,
  type MessageBoxReturnValue,
  shell
} from 'electron'
import * as log from 'electron-log'
import { type conf } from './appConfig'
import { createAboutWindow } from './aboutWindow'

// app menu
export const appMenuTemplate = (config: typeof conf): MenuItemConstructorOptions[] => {
  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Forward',
          id: 'forward',
          click () {
            const win = BrowserWindow.getFocusedWindow() as BrowserWindow
            if (win.webContents.canGoForward()) {
              win.webContents.goForward()
            }
          }
        },
        {
          label: 'Back',
          id: 'back',
          click () {
            const win = BrowserWindow.getFocusedWindow() as BrowserWindow
            if (win.webContents.canGoBack()) {
              win.webContents.goBack()
            }
          }
        },
        { type: 'separator' },
        {
          role: 'reload'
        },
        {
          label: 'OneNote Home',
          click () {
            const win = BrowserWindow.getFocusedWindow() as BrowserWindow
            void win.webContents.loadURL(config.get('homepage'))
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
          id: 'autoHideMenuBar',
          click () {
            toggleMenuVisibility(config)
          }
        },
        {
          label: 'Minimize to tray',
          type: 'checkbox',
          id: 'minimizeToTray',
          click () {
            showInfoMessageBox('Minimize to tray',
              'Feature still experimental, works on Ubuntu 22.04 but not on Fedora 38. Please quit from tray and relaunch if open from tray does not work')
            config.set('minimizeToTray', !config.get('minimizeToTray'))
          }
        },
        {
          label: 'Close to tray',
          type: 'checkbox',
          id: 'closeToTray',
          click () {
            // config.set('closeToTray', !config.get('closeToTray'))
            // setMenuCheckbox(menu, 'closeToTray')
            showInfoMessageBox('Close to tray', 'Feature not implemented yet')
            const item = Menu.getApplicationMenu()?.getMenuItemById('closeToTray')
            if (item != null) {
              item.checked = false
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Enable GPU Acceleration',
          type: 'checkbox',
          id: 'enableGPUAcceleration',
          click () {
            toggleGPUAcceleration(config)
          }
        }
      ]
    },
    {
      label: 'Help',
      id: 'help',
      submenu: [
        {
          label: 'About',
          id: 'about',
          // accelerator: 'F1',
          click () {
            const win = BrowserWindow.getFocusedWindow() as BrowserWindow
            createAboutWindow(win)
          }
        },
        {
          label: 'Report Issue/Bug',
          click () {
            void shell.openExternal(
              'https://github.com/anujdatar/onenote-desktop/issues/new/choose'
            )
          }
        },
        {
          label: 'Reset App Defaults',
          id: 'softReset',
          click () {
            doSoftReset(config)
          }
        },
        {
          label: 'Reset App - Everything',
          id: 'hardReset',
          click () {
            doHardReset(config)
          }

        }
      ]
    }
  ]
  return menuTemplate
}

export const setMenuBarVisibility = (win: BrowserWindow, visible: boolean): void => {
  win.setAutoHideMenuBar(!visible)
  win.setMenuBarVisibility(visible)
}
const toggleMenuVisibility = (config: typeof conf): void => {
  const win = BrowserWindow.getFocusedWindow() as BrowserWindow
  if (win.isMenuBarVisible()) {
    setMenuBarVisibility(win, false)
    config.set('autoHideMenuBar', true)
  } else {
    setMenuBarVisibility(win, true)
    config.set('autoHideMenuBar', false)
  }
}

const showInfoMessageBox = (title: string, message: string): void => {
  const win = BrowserWindow.getFocusedWindow() as BrowserWindow
  const options: MessageBoxOptions = {
    type: 'info',
    title,
    message,
    buttons: ['OK'],
    defaultId: 0
  }
  dialog.showMessageBox(win, options)
    .then(() => {
      log.info(`${title} feature not implemented yet`)
    })
    .catch(err => {
      log.error(err)
      dialog.showErrorBox('Error', err.message)
    })
}

const showCustomMessageBox = (options: MessageBoxOptions, callback: CallableFunction): void => {
  const win = BrowserWindow.getFocusedWindow() as BrowserWindow
  dialog.showMessageBox(win, options)
    .then(res => {
      callback(res)
    })
    .catch(err => {
      log.error(err)
      dialog.showErrorBox('Error', err.message)
    })
}
const toggleGPUAcceleration = (config: typeof conf): void => {
  const isGPUAccelerationEnabled = config.get('enableGPUAcceleration')
  const toggle = isGPUAccelerationEnabled ? 'Disable' : 'Enable'
  const options: MessageBoxOptions = {
    type: 'question',
    title: `${toggle} GPU Acceleration`,
    message: 'GPU acceleration setting will take effect after restarting the app',
    checkboxLabel: 'Restart app now?',
    checkboxChecked: false,
    buttons: ['Cancel', 'OK'],
    defaultId: 0,
    cancelId: 0
  }
  showCustomMessageBox(options, (res: MessageBoxReturnValue) => {
    if (res.response === 1) {
      config.set('enableGPUAcceleration', !isGPUAccelerationEnabled)
      if (res.checkboxChecked) {
        app.relaunch()
        app.quit()
      }
    } else {
      const item = Menu.getApplicationMenu()?.getMenuItemById('enableGPUAcceleration')
      if (item != null) {
        item.checked = isGPUAccelerationEnabled
      }
    }
  })
}
const appResetMessageBoxDefaultOptions = (): MessageBoxOptions => {
  const options: MessageBoxOptions = {
    type: 'warning',
    title: 'App reset confirmation',
    message: 'This will reset all app settings to default values',
    checkboxLabel: 'Are you sure?',
    checkboxChecked: false,
    buttons: ['Cancel', 'Yes'],
    defaultId: 0,
    cancelId: 0
  }

  return options
}

const doSoftReset = (config: typeof conf): void => {
  const options = appResetMessageBoxDefaultOptions()
  options.detail = 'This will reset app settings to default values, but leave history/login data intact'
  showCustomMessageBox(options, (res: MessageBoxReturnValue) => {
    if (res.response === 1 && res.checkboxChecked) {
      log.info('Performing Soft Reset')
      const win = BrowserWindow.getFocusedWindow() as BrowserWindow

      config.clear()
      void win.loadURL(config.get('homepage'))
      win.setSize(config.get('width'), config.get('height'))
      win.center()
    }
  })
}

const doHardReset = (config: typeof conf): void => {
  const options = appResetMessageBoxDefaultOptions()
  options.detail = 'This will reset all app settings, wipe history/login data and restart app'
  showCustomMessageBox(options, (res: MessageBoxReturnValue) => {
    if (res.response === 1 && res.checkboxChecked) {
      log.info('Performing Hard Reset')
      const win = BrowserWindow.getFocusedWindow() as BrowserWindow

      void win.webContents.session.clearStorageData()
      void win.webContents.session.clearCache()
      void win.webContents.session.clearAuthCache()
      void win.webContents.session.clearHostResolverCache()
      void win.webContents.session.clearCodeCaches({})

      config.clear()
      app.relaunch()
      app.quit()
    }
  })
}
