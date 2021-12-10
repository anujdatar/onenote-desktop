const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const ConfigStore = require('@anujdatar/appconfig')

const packageData = require('../package.json')

// custom windows
const showAboutWindow = require('./about')
const showMessageBox = require('./messagebox')

// app version
const appVersion = packageData.version

// app defaults
const appDefaults = {
  homepage: 'https://www.onenote.com/notebooks',
  autoHideMenuBar: false,
  minimizeToTray: false,
  closeToTray: false,
  showWelcomePage: true
}

// persistent app config
const conf = new ConfigStore({ defaults: appDefaults })

// global reference for the window objects
let mainWindow
let aboutWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: path.join(__dirname, './images/icon.png'),
    title: 'OneNote',
    autoHideMenuBar: conf.get('autoHideMenuBar'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // set window bounds on launch
  if (typeof conf.get('windowBounds') !== 'undefined') {
    mainWindow.setBounds(conf.get('windowBounds'))
  }

  /* ****************************************************************** */
  // open app link (last visited/homepage)
  if (typeof conf.get('lastLink') === 'undefined') {
    mainWindow.loadURL(conf.get('homepage'))
  } else {
    mainWindow.loadURL(conf.get('lastLink'))
    // mainWindow.loadURL('https://www.google.com')
    // mainWindow.loadURL('https://www.onenote.com/notebooks')
  }

  /* ****************************************************************** */
  settingsCheckboxStatus()

  /* ****************************************************************** */
  // emitted when the window is about to be closed
  mainWindow.on('close', () => {
    conf.set('windowBounds', mainWindow.getBounds())
    conf.set('lastLink', mainWindow.webContents.getURL())
  })

  // emitted when the window is closed
  mainWindow.on('closed', () => {
    // delete main window object
    mainWindow = null
  })

  // emitted when the window is resized
  mainWindow.on('resize', () => {
    const newBounds = mainWindow.getBounds()
    conf.set('windowBounds', newBounds)
  })

  // emitted when page is loaded, webContents are undefined till this
  mainWindow.webContents.on('did-finish-load', () => {
    // placeholder for now, till functions are loaded
    toggleForwardMenuItem()
    toggleBackMenuItem()
  })
}

/* ****************************************************************** */
// app hooks
// emitted when ready, create browser window and show webview
app.on('ready', () => {
  createWindow()
  if (conf.get('showWelcomePage')) {
    aboutWindow = showAboutWindow(mainWindow)
  }
})

// emitted when all windows closed, quit app
app.on('window-all-closed', () => {
  // handle MacOS close and quit functionality
  if (process.platform !== 'darwin') app.quit()
})

// emitted when app is activated, icon click in dock or something similar
app.on('activated', () => {
  // create new window only if none exist
  if (mainWindow === null) createWindow()
})

// emitted once web contents are created
app.on('web-contents-created', (event, contents) => {
  // emitted when external links are clicked
  // limit/disable creation of additional windows
  contents.on('new-window', (event, url) => {
    event.preventDefault()
    console.log(url)
    if (url.startsWith('https://onedrive.live.com')) {
      // open onedrive / onenote links in main window
      mainWindow.loadURL(url)
    } else {
      // open non onenote links in system default browser
      shell.openExternal(url)
    }
  })
})

/* ****************************************************************** */
// helper functions
const toggleBooleanConf = function (setting) {
  const current_conf_value = conf.get(setting)
  conf.set(setting, !current_conf_value)
  return !current_conf_value
}
// menu item status checks
const toggleForwardMenuItem = function () {
  const forwardItem = menu.getMenuItemById('go-forward')
  forwardItem.enabled = mainWindow.webContents.canGoForward()
}
const toggleBackMenuItem = function () {
  const backItem = menu.getMenuItemById('go-back')
  backItem.enabled = mainWindow.webContents.canGoBack()
}
const settingsCheckboxStatus = function () {
  menu.getMenuItemById('auto-hide-menubar').checked = conf.get(
    'autoHideMenuBar'
  )
  menu.getMenuItemById('minimize-to-tray').checked = conf.get('minimizeToTray')
  menu.getMenuItemById('close-to-tray').checked = conf.get('closeToTray')
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
  aboutWindow = showAboutWindow(mainWindow)
}
const reportBug = function () {
  shell.openExternal(
    'https://github.com/anujdatar/onenote-desktop/issues/new/choose'
  )
}
const doAppReset = function () {
  console.log('doing app reset')
}
const showAppResetConfirmation = function () {
  console.log('message box')
  doAppReset()
  showMessageBox(mainWindow, { title: 'aaaaaa' })
}

const menuFunctions = {
  goForward,
  goBack,
  goHome,
  toggleMenuVisibility,
  toggleMinimizeToTray,
  toggleCloseToTray,
  launchAboutWindow,
  reportBug,
  showAppResetConfirmation
}
module.exports = menuFunctions

/* ****************************************************************** */
// update welcome page toggle state from renderer
ipcMain.on('toggle-welcome-page-state', (event, value) => {
  conf.set('showWelcomePage', value)
})

// send welcome page toggle state on startup
ipcMain.on('welcome-toggle-state', event => {
  event.reply('welcome-toggle-state-reply', conf.get('showWelcomePage'))
})

// send app version to about page
ipcMain.on('get-app-version', (event, message) => {
  event.returnValue = appVersion
})

// close about window
ipcMain.on('close-about-page', () => {
  aboutWindow.close()
})

// build application menubar
const menuTemplate = require('./menu')
const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)
