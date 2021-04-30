const { BrowserWindow } = require('electron')

function showAboutWindow (parent) {
  let aboutWindow = new BrowserWindow({
    parent: parent,
    title: 'Welcome to OneNote',
    modal: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  aboutWindow.loadURL(`file://${__dirname}/../src/pages/about.html`)
  aboutWindow.removeMenu()

  aboutWindow.on('closed', () => {
    aboutWindow = null
  })

  return aboutWindow
}

module.exports = showAboutWindow
