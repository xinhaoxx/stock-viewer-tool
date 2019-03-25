'use strict'

import {app, BrowserWindow, ipcMain, globalShortcut} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    width: 340,
    height: 425,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    maximizable: false,
    resizable: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  registerIPC()
  // 打开开发者工具快捷键 ctrl+alt+shift+d
  globalShortcut.register('CommandOrControl+Alt+Shift+d', () => {
    mainWindow.openDevTools()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * 注册 IPC 事件
 */
const registerIPC = function () {
  // 关闭窗口
  ipcMain.on('close', () => {
    mainWindow.close()
  })
  ipcMain.on('stick', () => {
    mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop())
  })
}
