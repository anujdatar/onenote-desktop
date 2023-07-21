import {
  app,
  BrowserWindow,
  dialog
} from 'electron'
import * as log from 'electron-log'
import { conf } from './appConfig'
import { createMainWindow } from './mainWindow'
import { createAboutWindow } from './aboutWindow'
import { createTrayItem } from './trayItem'
// TODO: Implement tray item, tray context menu, open from tray, etc

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
