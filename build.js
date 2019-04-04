"use strict"

const builder = require('electron-builder')
const Platform = builder.Platform

builder.build({
  targets: Platform.LINUX.createTarget(),
  config: {
    appId: 'onenote.linux',
    target: ['AppImage', 'deb'],
    icon: './src/images/512x512.png',
    productName: 'OneNote',
    linux: {
      maintainer: 'Anuj Datar <anuj.datar@gmail.com',
      description: 'OneNote desktop app for Linux',
      category: 'Office'
    }
  }
})