import { app, BrowserWindow } from 'electron'

let win: BrowserWindow | null

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile(__dirname + '/../index.html')
  win.setMenuBarVisibility(false)
  
  if (process.env.NODE_ENV === 'development'){
    win.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  win.on('closed', () => { win = null })
}


app.on('ready', createWindow)
