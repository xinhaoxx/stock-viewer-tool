'use strict'

import {app, BrowserWindow, ipcMain, Menu, MenuItem, Tray, globalShortcut} from 'electron'
import path from 'path'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
// 关闭安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
let tray

let timeout = null // 定时器
let isAnimating = false // 是否动画中标识

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    webPreferences: {webSecurity: false},
    useContentSize: true,
    width: 415,
    height: 663,
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
  tray = new Tray(path.join(__static, '/stock.ico')) // 系统托盘
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
  /**
   * 点击关闭
   */
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  /**
   * 注册监听事件
   */
  registerIPC()
  /**
   * 打开开发者工具快捷键 ctrl+alt+shift+d
   */
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
  // 最小化到系统托盘
  ipcMain.on('minimize', () => {
    mainWindow.minimize()
  })
  // 更新系统托盘 Tooltips
  ipcMain.on('update', (event, arg) => {
    tray.setToolTip('自选小工具：\n' + arg)
  })
  // 应用贴顶缩起展开功能
  ipcMain.on('mouseenter', () => {
    clearTimeout(timeout)
    if (isAnimating) return false
    let pos = mainWindow.getPosition()
    if (pos[1] < -10) {
      isAnimating = true
      for (let i = pos[1]; i <= -10; i += 2) {
        mainWindow.setPosition(pos[0], i)
      }
      isAnimating = false
    }
  })
  ipcMain.on('mouseleave', () => {
    if (isAnimating) return false
    let pos = mainWindow.getPosition()
    if (pos[1] <= -10) {
      timeout = setTimeout(() => {
        isAnimating = true
        const height = mainWindow.getSize()[1] - 10
        for (let i = -10; i > (-1 * height + 1); i -= 2) {
          mainWindow.setPosition(pos[0], i)
        }
        isAnimating = false
      }, 300)
    }
  })

  // 右键菜单
  ipcMain.on('rightClick', (event, code) => {
    const menu = new Menu()
    menu.append(new MenuItem({
      label: '在雪球中查看',
      click: () => {
        event.sender.send('show-xueqiu', code)
      }
    }))
    menu.append(new MenuItem({
      label: '在股吧中查看',
      click: () => {
        event.sender.send('show-guba', code)
      }
    }))
    const stocksIndex = ['sh000001', 'sz399001', 'sz399006']
    if (stocksIndex.indexOf(code.toLowerCase()) === -1) {
      menu.append(new MenuItem({type: 'separator'}))
      menu.append(new MenuItem({
        label: '删除自选',
        click: () => {
          event.sender.send('delete-stock', code)
        }
      }))
    }
    menu.popup(mainWindow)
  })
}
