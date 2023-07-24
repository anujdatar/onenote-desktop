import ConfigStore from 'electron-store'

// homepage: 'https://www.onenote.com/notebooks',
const appDefaults = {
  homepage: 'https://www.google.com',
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
