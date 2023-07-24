import path from 'path'
import { app, type BrowserWindow, Menu, Tray } from 'electron'

export const createTrayItem = (win: BrowserWindow): void => {
  const trayItem = new Tray(path.join(__dirname, '../assets/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        win.show()
      }
    },
    { label: 'Quit', click: () => { app.quit() } }
  ])
  trayItem.setToolTip(app.name)
  trayItem.setContextMenu(contextMenu)
}
