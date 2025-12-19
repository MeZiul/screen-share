const { app, BrowserWindow, ipcMain } = require('electron')
const { v4: uuidv4 } = require('uuid');
const { Monitor } = require('node-screenshots');
const path = require('path');
const socket = require('socket.io-client')('localhost:5000');

const preloadPath = path.join(__dirname, 'preload.js');

var interval = null;

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 150,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false
        }
    })
    win.removeMenu();
    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on("start-share", function (event, arg) {

    const uuid = uuidv4();
    socket.emit("join-message", uuid);
    event.reply("uuid", uuid);

    clearInterval(interval);

    interval = setInterval(function () {
        const monitors = Monitor.all();

        let primaryMonitor = monitors.find(monitor => monitor.isPrimary || monitors[0]);
        if (!primaryMonitor) return console.error("No monitors found");

        primaryMonitor.captureImageSync((err, img) => {
            if (err || !img) return console.error(err);
            img.toJpeg(80, (err, jpegBuffer) => {
                if (err) return console.error(err);

                const imgStr = jpegBuffer.toString('base64');
                const obj = { room: uuid, image: imgStr };
                socket.emit("screen-data", obj);
            });
        });
    }, 100)
})

ipcMain.on("stop-share", function (event, arg) {
    if (interval){
    clearInterval(interval);
    interval = null;
    }
})
socket.on('connect', () => console.log('Conectado ao servidor'));
socket.on('disconnect', () => console.log('Desconectado'));
socket.on('connect_error', (err) => console.error('Erro de conexão:', err));
