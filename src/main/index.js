'use strict'

import {app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut} from 'electron'

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
    height: 435,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    maximizable: false,
    resizable: false,
    skipTaskbar: true
  })

  mainWindow.loadURL(winURL)

  /**
   * 系统托盘图标
   */
  const tray = new Tray('static/stock.ico')
  tray.setToolTip('自选小工具')
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出程序',
      click: () => {
        mainWindow.close()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
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

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
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
  ipcMain.on('minimize', () => {
    mainWindow.minimize()
  })
}
