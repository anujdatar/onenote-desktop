const { BrowserWindow } = require('electron')

function showMessageBox (parent, options) {
  let messageBox = new BrowserWindow({
    parent: parent,
    title: options.title,
    modal: true,
    width: 500,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  messageBox.loadURL(`file://${__dirname}/../src/pages/messagebox.html`)
  messageBox.removeMenu()

  // messageBox.webContents.openDevTools()

  messageBox.on('closed', () => {
    messageBox = null
  })

  // return messageBox
}

module.exports = showMessageBox
