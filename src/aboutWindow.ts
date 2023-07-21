import path from 'path'
import { conf } from './appConfig'

let aboutWindow: BrowserWindow
export const createAboutWindow = (parent: BrowserWindow): void => {
  aboutWindow = new BrowserWindow({
    parent,
    modal: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'aboutPreload.js')
    }
  })

  void aboutWindow.loadFile('src/about.html')
  aboutWindow.removeMenu()

  aboutWindow.on('closed', (): void => {
    aboutWindow.destroy()
  })
}

/* ******************************************************************** */
// handle ipc events
// close about window
ipcMain.on('close-about-window', () => {
  aboutWindow.close()
})

// send app version to about window
ipcMain.on('get-app-version', (event, _message) => {
  event.returnValue = conf.get('currentVersion')
})

// send about window toggle state on startup
ipcMain.on('get-about-toggle-state', event => {
  event.reply('about-toggle-state-reply', conf.get('autoShowAboutWindow'))
})

// update about window toggle state from renderer
ipcMain.on('change-about-window-state', (_event, value) => {
  conf.set('autoShowAboutWindow', value)
})
