import { contextBridge, ipcRenderer } from 'electron'

const appVersion: string = ipcRenderer.sendSync('get-app-version', 'getting-app-version')

ipcRenderer.send('app-ver', appVersion)

contextBridge.exposeInMainWorld(
  'electron', {
    writeVer: () => {
      document.write('v' + appVersion)
    },
    closeAbout: (): void => {
      ipcRenderer.send('close-about-window', 'closing-about-window')
    },
    toggleAboutWindowState: (): void => {
      const aboutToggle = document.getElementById('aboutToggle') as HTMLInputElement
      ipcRenderer.send('change-about-window-state', aboutToggle.checked)
    },
    setAboutWindowState: (): void => {
      ipcRenderer.send('get-about-toggle-state')
      ipcRenderer.on('about-toggle-state-reply', (_event, value) => {
        const aboutToggle = document.getElementById('aboutToggle') as HTMLInputElement
        aboutToggle.checked = value
      })
    },
    openExternal: (url: string): void => {
      console.log(url)
      ipcRenderer.send('open-external', url)
    }
  })
