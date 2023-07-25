import ConfigStore from 'electron-store'

// homepage: 'https://www.onenote.com/notebooks',
// homepage: 'https://www.google.com',
const appDefaults = {
  homepage: 'https://www.onenote.com/notebooks',
  autoHideMenuBar: false,
  minimizeToTray: false,
  closeToTray: false,
  autoShowAboutWindow: true,
  enableGPUAcceleration: false,
  wasMaximized: false,
  width: 800,
  height: 600
}
export const conf = new ConfigStore({ defaults: appDefaults })
