const {
  app,
  dialog,
  BrowserWindow,
  Tray,
  Menu,
  shell,
  session
} = require('electron')
const nativeImage = require('electron').nativeImage
const appVersion = require('./package.json').version
const path = require('path')
const baseIconPath = 'src/assets/icons/'
const iconPath = baseIconPath + 'icon.png'
const AutoLaunch = require('auto-launch')
const rootUrl = 'https://chat.zalo.me/'
const autoLaunchOptions = {
  name: 'Unofficial Zalo'
}
const config = require('./config');
const fs = require('fs');
const gotTheLock = app.requestSingleInstanceLock()

let mainWindow;
let isQuitting = false;
let currentURL = "";

if (process.platform === 'linux') {
  autoLaunchOptions.path = '/opt/Unofficial\\ Zalo/unofficial-zalo'
}
const appAutoLauncher = new AutoLaunch(autoLaunchOptions)

app.commandLine.appendSwitch('disable-vulkan');

var isAutoLaunchEnabled = false
var isAutoLaunchEnabled = false
const menuTemplate = [{
  label: 'Menu',
  submenu: [{
    label: 'About Unofficial Zalo',
    click() {
      dialog.showMessageBox({
        icon: nativeImage.createFromPath(baseIconPath + 'app-icon.png'),
        title: 'About Unofficial Zalo',
        message: 'Unoffical Zalo ',
        detail: `Built by avinh \nVersion: ${appVersion}\n`,
        buttons: ['OK']
      })
    }
  },
  {
    label: 'Hide window',
    accelerator: 'CmdOrCtrl+H',
    click() {
      if (win.isMinimized()) {
        win.focus()
      }
      if (win.isVisible()) {
        menuTemplate[0].submenu[1].label = 'Show window'
        win.hide()
      } else {
        menuTemplate[0].submenu[1].label = 'Hide window'
        win.show()
      }
      refreshTrayMenu()
      refreshAppMenu()
    }
  },
  {
    label: 'Auto start with OS',
    type: 'checkbox',
    checked: isAutoLaunchEnabled,
    click() {
      toogleAutoLaunch()
    }
  },
  {
    label: 'Close to tray',
    type: 'checkbox',
    checked: config.get('isCloseToTray'),
    click() {
      config.set('isCloseToTray', !config.get('isCloseToTray') ? true : false);
    }
  },
  {
    label: 'Quit',
    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
    click() {
      app.quit()
    }
  }]
},
{
  label: 'Edit',
  submenu: [
    {
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    },
    {
      label: 'Redo',
      accelerator: 'CmdOrCtrl+Shift+Z',
      role: 'redo'
    },
    {
      type: 'separator'
    },
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    },
    {
      type: 'separator'
    },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }
  ]
},
{
  label: 'View',
  submenu: [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click() {
        if (win) {
          win.webContents.reload();
        }
      }
    },
    {
      label: 'Force Reload',
      accelerator: 'CmdOrCtrl+Shift+R',
      click() {
        if (win) {
          win.webContents.reloadIgnoringCache();
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Actual Size',
      accelerator: 'CmdOrCtrl+0',
      click() {
        if (win) {
          win.webContents.setZoomLevel(0);
        }
      }
    },
    {
      label: 'Zoom In',
      accelerator: 'CmdOrCtrl+Plus',
      click() {
        if (win) {
          const currentZoom = win.webContents.getZoomLevel();
          win.webContents.setZoomLevel(currentZoom + 0.5);
        }
      }
    },
    {
      label: 'Zoom Out',
      accelerator: 'CmdOrCtrl+-',
      click() {
        if (win) {
          const currentZoom = win.webContents.getZoomLevel();
          win.webContents.setZoomLevel(currentZoom - 0.5);
        }
      }
    },
    //   type: 'separator'
    {
      type: 'separator'
    },
    // {
    //   label: 'Toggle Developer Tools',
    //   accelerator: 'F12',
    //   click() {
    //     if (win) {
    //       win.webContents.toggleDevTools();
    //     }
    //   }
    // }
    {
      label: 'Dark Mode',
      type: 'checkbox',
      checked: config.get('darkMode'),
      click() {
        config.set('darkMode', !config.get('darkMode'));
        if (win) {
          win.webContents.reload();
        }
      }
    }
  ]
}]

function toogleAutoLaunch() {
  appAutoLauncher.isEnabled()
    .then(function (isEnabled) {
      if (isEnabled) {
        appAutoLauncher.disable()
      } else {
        appAutoLauncher.enable()
      }
      isAutoLaunchEnabled = !isEnabled
      menuTemplate[0].submenu[2].checked = isAutoLaunchEnabled
      refreshAllMenus()
    })
    .catch(function (err) {
      console.log('Error occurred: ' + err.message)
    })
}


function refreshAutoLaunch(callback) {
  appAutoLauncher.isEnabled()
    .then(function (isEnabled) {
      isAutoLaunchEnabled = isEnabled
      menuTemplate[0].submenu[2].checked = isAutoLaunchEnabled
      if (typeof callback === 'function') {
        callback()
      }
      refreshAppMenu()
    })
    .catch(function (err) {
      console.log('Error occurred: ' + err.message)
    })
}
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let tray
let trayMenu

function refreshAppMenu() {
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

function refreshTrayMenu() {
  trayMenu = Menu.buildFromTemplate(menuTemplate[0].submenu.slice(1))
  if (process.platform === 'linux') {
    tray.setContextMenu(trayMenu)
  }
}

function refreshAllMenus() {
  refreshTrayMenu()
  refreshAppMenu()
}


function createWindow() {

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  process.env.XDG_CURRENT_DESKTOP = 'Unity'
  // Create the browser window.
  const lastWindowState = config.get('lastWindowState');
  win = new BrowserWindow({
    icon: path.join(__dirname, iconPath),
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      plugins: true,
      devTools: false
    },
  })
  // win.maximize()

  if (process.platform === 'darwin') {
    win.setSheetOffset(40);
  }

  // and load the index.html of the app.
  win.loadURL(rootUrl);

  // Create context menu for right-click
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C', 
      role: 'copy'
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    },
    {
      type: 'separator'
    },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    },
    {
      type: 'separator'
    },
    {
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    },
    {
      label: 'Redo',
      accelerator: 'CmdOrCtrl+Shift+Z',
      role: 'redo'
    }
  ]);

  // Show context menu on right-click
  win.webContents.on('context-menu', (e, params) => {
    contextMenu.popup(win, params.x, params.y);
  });

  win.on('close', e => {
    if (isQuitting) {
      if (win && !win.isDestroyed() && !win.isFullScreen()) {
        config.set('lastWindowState', win.getBounds());
      }
    } else {
      e.preventDefault();
      let closeToTray = config.get('isCloseToTray');
      if (closeToTray) {
        menuTemplate[0].submenu[1].label = 'Show window'
        win.hide()
      } else {
        app.quit();
      }
      refreshTrayMenu()
      refreshAppMenu()
    }
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    mainWindow = null
  })

  tray = new Tray(path.join(__dirname, iconPath))
  trayMenu = Menu.buildFromTemplate(menuTemplate[0].submenu.slice(1))
  if (process.platform === 'linux') {
    tray.setContextMenu(trayMenu)
  }
  tray.on('click', () => {
    refreshAutoLaunch(() => {
      trayMenu = Menu.buildFromTemplate(menuTemplate[0].submenu.slice(1))
      tray.popUpContextMenu(trayMenu)
    })
  })

  refreshAutoLaunch()
  refreshAppMenu()

  win.on('minimize', () => {
    menuTemplate[0].submenu[1].label = 'Show window'
    refreshAllMenus()
  })

  return win
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.


if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      
      if (win.isVisible()) {
        menuTemplate[0].submenu[1].label = 'Show window'
        win.hide()
      } else {
        menuTemplate[0].submenu[1].label = 'Hide window'
        win.show()
      }
      refreshTrayMenu()
      refreshAppMenu()
    }
  })
  // Create myWindow, load the rest of the app, etc...
  app.on('ready', () => {
    mainWindow = createWindow();
    const page = mainWindow.webContents;

    page.on('dom-ready', () => {
      page.insertCSS(fs.readFileSync(path.join(__dirname, 'browser.css'), 'utf8'));
      if (config.get('darkMode')) {
        page.insertCSS(fs.readFileSync(path.join(__dirname, 'darkmode.css'), 'utf8'));
      }
      mainWindow.show();
    });

    page.on('new-window', (e, url) => {
      e.preventDefault();
      // shell.openExternal(url);
    });

    mainWindow.webContents.session.on('will-download', (event, item) => {
      const totalBytes = item.getTotalBytes();

      item.on('updated', () => {
        mainWindow.setProgressBar(item.getReceivedBytes() / totalBytes);
      });

      item.on('done', (e, state) => {
        mainWindow.setProgressBar(-1);

        if (state === 'interrupted') {
          Dialog.showErrorBox('Download error', 'The download was interrupted');
        }
      });
    });
  });
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('before-quit', () => {
  isQuitting = true;
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      currentURL = mainWindow.webContents.getURL();
      config.set('currentURL', currentURL);
    } catch (error) {
      console.log('Could not get current URL:', error.message);
    }
  }
});
