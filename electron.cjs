const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')

app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=256')
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer')

let mainWindow
let downloadWindow = null

function createSplash() {
  const splash = new BrowserWindow({
    width: 420,
    height: 280,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true,
    skipTaskbar: true,
    webPreferences: { nodeIntegration: false }
  })
  splash.loadURL(`data:text/html,
    <html>
    <body style="margin:0;background:#0d0f14;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;border-radius:16px;overflow:hidden;">
      <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#f5a623,#e8920a);display:flex;align-items:center;justify-content:center;margin-bottom:18px;box-shadow:0 8px 32px rgba(245,166,35,0.5);">
        <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%230d0f14' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
          <path d='M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z'/>
          <path d='M9 17H5V6a2 2 0 012-2h10l4 4v5h-1.586a2 2 0 00-1.414.586L16.414 15A2 2 0 0115 15H9z'/>
        </svg>
      </div>
      <div style="color:#f0f2f8;font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:6px;">VPM Tracker</div>
      <div style="color:#4f5869;font-size:13px;margin-bottom:28px;">Vehicle Parts Management</div>
      <div style="width:180px;height:3px;background:#1f2332;border-radius:10px;overflow:hidden;">
        <div id="bar" style="height:100%;width:0%;background:linear-gradient(90deg,#f5a623,#e8920a);border-radius:10px;transition:width 0.1s;"></div>
      </div>
      <div id="txt" style="color:#4f5869;font-size:11px;margin-top:10px;">Starting...</div>
      <script>
        let w=0;
        const bar=document.getElementById('bar');
        const txt=document.getElementById('txt');
        const msgs=['Loading modules...','Preparing data...','Almost ready...','Launching...'];
        let mi=0;
        const iv=setInterval(()=>{
          w+=Math.random()*18+8;
          if(w>95)w=95;
          bar.style.width=w+'%';
          if(mi<msgs.length) txt.textContent=msgs[mi++];
        },300);
      </script>
    </body>
    </html>
  `)
  return splash
}

function createWindow(splash) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor: '#0d0f14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
    title: 'VPM Tracker',
  })
  const indexPath = path.join(__dirname, 'dist', 'index.html')
  mainWindow.loadURL(`file:///${indexPath.replace(/\\/g, '/')}`)
  mainWindow.setMenuBarVisibility(false)
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splash && !splash.isDestroyed()) splash.destroy()
      mainWindow.show()
      mainWindow.focus()
    }, 300)
  })
  return mainWindow
}

const downloadHTML = `
  <html>
  <body style="margin:0;background:#0d0f14;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#f0f2f8;">
    <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#f5a623,#e8920a);display:flex;align-items:center;justify-content:center;margin-bottom:16px;box-shadow:0 8px 24px rgba(245,166,35,0.4);">
      <svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='%230d0f14' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'/>
      </svg>
    </div>
    <div style="font-size:16px;font-weight:800;margin-bottom:6px;">Downloading Update</div>
    <div id="pct" style="font-size:13px;color:#f5a623;font-weight:700;margin-bottom:16px;">0%</div>
    <div style="width:280px;height:6px;background:#1f2332;border-radius:10px;overflow:hidden;">
      <div id="bar" style="height:100%;width:0%;background:linear-gradient(90deg,#f5a623,#e8920a);border-radius:10px;transition:width 0.3s ease;"></div>
    </div>
    <div id="speed" style="font-size:11px;color:#4f5869;margin-top:10px;">Preparing download...</div>
    <script>
      let progress = 0;
      const bar = document.getElementById('bar');
      const pct = document.getElementById('pct');
      const speed = document.getElementById('speed');
      setInterval(() => {
        if(progress < 95) {
          progress += Math.random() * 3;
          bar.style.width = Math.min(progress, 95) + '%';
          pct.textContent = Math.round(Math.min(progress, 95)) + '%';
          speed.textContent = 'Downloading update, please wait...';
        }
      }, 400);
    </script>
  </body>
  </html>
`

app.whenReady().then(() => {
  const splash = createSplash()
  createWindow(splash)
  autoUpdater.autoDownload = false
  autoUpdater.checkForUpdates()
})

autoUpdater.on('update-available', (info) => {
  const { dialog } = require('electron')
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `Version ${info.version} is available!`,
    detail: 'Click Download Now to get the latest update.',
    buttons: ['Download Now', 'Later'],
    defaultId: 0,
  }).then(result => {
    if (result.response === 0) {
      downloadWindow = new BrowserWindow({
        width: 420,
        height: 220,
        resizable: false,
        frame: false,
        alwaysOnTop: true,
        center: true,
        skipTaskbar: false,
        backgroundColor: '#0d0f14',
        webPreferences: { nodeIntegration: false, contextIsolation: true }
      })
      downloadWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(downloadHTML))
      autoUpdater.downloadUpdate()
    }
  })
})

autoUpdater.on('update-downloaded', () => {
  if (downloadWindow && !downloadWindow.isDestroyed()) {
    downloadWindow.close()
    downloadWindow = null
  }
  const { dialog } = require('electron')
  dialog.showMessageBox({
    type: 'question',
    title: 'Update Ready',
    message: 'Update downloaded and ready to install.',
    detail: 'The application will restart to apply the update. Please save your work before continuing.',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0,
    icon: null
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})

autoUpdater.on('error', (err) => {
  if (downloadWindow && !downloadWindow.isDestroyed()) {
    downloadWindow.close()
    downloadWindow = null
  }
  console.error('Update error:', err)
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(null) })