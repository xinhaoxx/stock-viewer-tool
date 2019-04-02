'use strict'

import {app, BrowserWindow, ipcMain, Tray, Menu, MenuItem} from 'electron'
import path from 'path'

// 静态路径 __static
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
// 关闭安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// 入口路径（根据开发环境）
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

// 初始化应用
function init () {
  createWindow()
}

let mainWindow // 主窗体

/**
 * 创建主窗体
 */
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 663,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    maximizable: false,
    resizable: false,
    skipTaskbar: true,
    focusable: true,
    webPreferences: {webSecurity: false},
    useContentSize: true
  })
  mainWindow.loadURL(winURL) // 默认加载根路径
  mainWindow.on('closed', () => {
    app.quit()
  })
  createMainTray() // 创建系统托盘
  createMainIPCListener() // 监听渲染端事件
}

/**
 * app 事件监听
 */
app.on('ready', init)
app.on('activate', () => {
  if (mainWindow === null) {
    init()
  }
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * 注册主窗体 IPC 事件
 */
const createMainIPCListener = function () {
  // 缩小&关闭主窗体
  ipcMain.on('main-window-min', () => {
    mainWindow.minimize()
  })
  ipcMain.on('main-window-close', () => {
    app.quit()
  })
  // 主窗体贴顶缩起展开功能
  ipcMain.on('main-mouse-enter', mainMouseEnter)
  ipcMain.on('main-mouse-leave', mainMouseLeave)
  // 个股&指数右键菜单
  ipcMain.on('main-right-click', (event, code) => {
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
        label: '快速置顶',
        click: () => {
          event.sender.send('place-top', code)
        }
      }))
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
  // 更新系统托盘 Tooltips
  ipcMain.on('main-tray-update', (event, arg) => {
    tray.setToolTip('自选小工具：\n' + arg)
  })
  // 开启开发者工具
  ipcMain.on('open-devtools', () => {
    mainWindow.openDevTools()
  })
  ipcMain.on('create', () => {
    let child = new BrowserWindow({
      alwaysOnTop: true
    })
    child.loadURL(winURL + '#/stock')
    child.show()
  })
}

/**
 * 创建主窗体的系统托盘
 */
let tray // 系统托盘
const createMainTray = function () {
  // 创建系统托盘
  tray = new Tray(path.join(__static, '/stock.ico'))
  // 点击系统托盘显示or隐藏主窗体
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      // 判断是否在顶部，在顶部则执行展开
      if (mainWindow.getPosition()[1] < -10) {
        mainMouseEnter()
      } else {
        mainWindow.hide()
      }
    } else {
      mainWindow.show()
    }
  })
  // 系统托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出程序',
      click: () => {
        mainWindow.close()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
}

/**
 * 主窗体展开&缩起
 */
let timeout = null // 定时器
let isAnimating = false // 是否动画中标识
const mainMouseEnter = function () {
  clearTimeout(timeout)
  if (isAnimating) return false
  let pos = mainWindow.getPosition()
  if (pos[1] < -10) {
    isAnimating = true
    for (let i = pos[1]; i <= -10; i += 2) {
      mainWindow.setPosition(pos[0], i)
    }
    isAnimating = false
    mainWindow.focus()
  }
}
const mainMouseLeave = function () {
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
}
