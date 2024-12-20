const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path'); 
const { SerialPort } = require('serialport'); 

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: "NeuronSpark | GLASS",
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });
    mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();
});


ipcMain.on('connect_request', (event, data) => {
    if (data) {
        const port = new SerialPort({
            path: 'COM' + data,
            baudRate: 115200
        });
        port.on('open', () => {
            console.log('Serial port opened at COM' + data);
            if (mainWindow) {
                mainWindow.webContents.send('connect_request', 'success');
            }
        
            port.on('data', (data) => {
                if (mainWindow) {
                    mainWindow.webContents.send('serial-data', data.toString());
                }
            });
        
            port.on('error', (err) => {
                console.error('Error:', err.message);
            });
        });

        if (port && port.isOpen) {
            port.write('2,0,0,0,3,0', (err) => { // 1/2(control/pid), p, i, d, 1/2/3(forward, right, left), speed why 3?
              if (err) {
                console.error('Error on write: ', err.message);
              } else {
                console.log('Data sent');
              }
            });
        }

        ipcMain.on('send_data', (event, data) => {
            if (port && port.isOpen) {
                port.write(data, (err) => {
                  if (err) {
                    console.error('Error on write: ', err.message);
                  } else {
                    console.log('Data sent: ', data);
                  }
                });
            }
        });
    }
});



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
