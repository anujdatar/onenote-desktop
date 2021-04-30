// const { goBack, goForward, goHome } = require('./main')
const menuFunctions = require('./main')

const menuTemplate = [
  {
    label: 'Navigate',
    submenu: [
      {
        label: 'Forward',
        id: 'go-forward',
        click () {
          menuFunctions.goForward()
        }
      },
      {
        label: 'Back',
        id: 'go-back',
        click () {
          menuFunctions.goBack()
        }
      },
      { type: 'separator' },
      {
        label: 'OneNote Home',
        click () {
          menuFunctions.goHome()
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
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        role: 'resetzoom'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      },
      {
        role: 'toggledevtools'
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Auto-hide MenuBar',
        type: 'checkbox',
        id: 'auto-hide-menubar',
        click () {
          menuFunctions.toggleMenuVisibility()
        }
      },
      {
        label: 'Minimize to tray',
        type: 'checkbox',
        id: 'minimize-to-tray',
        click () {
          menuFunctions.toggleMinimizeToTray()
        }
      },
      {
        label: 'Close to tray',
        type: 'checkbox',
        id: 'close-to-tray',
        click () {
          menuFunctions.toggleCloseToTray()
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click () {
          menuFunctions.launchAboutWindow()
        }
      },
      { type: 'separator' },
      {
        label: 'Report Issue/Bug',
        click () {
          menuFunctions.reportBug()
        }
      },
      {
        label: 'Reset App',
        click () {
          menuFunctions.showAppResetConfirmation()
        }
      }
    ]
  }
]

module.exports = menuTemplate
