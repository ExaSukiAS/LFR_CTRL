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

let port;
ipcMain.on('connect_request', (event, data) => {
    if (data) {
        port = new SerialPort({
            path: 'COM' + data,
            baudRate: 115200
        });
        connectToPortAndReadData(data);

        ipcMain.on('send_data', (event, data) => {
            sendData(data);
        });
    }
});
ipcMain.on('disconnect_request', (event, data) => {
    disconnectPort();
});


function connectToPortAndReadData(portNumber){
    port.on('open', () => {
        console.log('Serial port opened at COM' + portNumber);
        if (mainWindow) {
            mainWindow.webContents.send('connect_request', 'success');
        }
    
        port.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('serial-data', data.toString());
            }
        });
    
        port.on('error', (err) => {
            console.error('Error: DGDFJGFS%S^%S*&^%SFSGF');
        });
    });
    if (port && port.isOpen) {
        port.write('2,0,0,0,3,0', (err) => { // 1/2(control/pid), p, i, d, 1/2/3(forward, right, left), speed
          if (err) {
            console.error('Error on write: ', err.message);
          } else {
            console.log('Data sent');
          }
        });
    }
}

function sendData(data){
    if (port && port.isOpen) {
        port.write(data, (err) => {
          if (err) {
            console.error('Error on write: ', err.message);
          } else {
            console.log('Data sent: ', data);
          }
        });
    }
}

function disconnectPort() {
    if (port && port.isOpen) {
        port.close((err) => {
            if (err) {
                console.error('Error while closing the port:', err.message);
                if (mainWindow) {
                    mainWindow.webContents.send('disconnect_request', 'failed');
                }
            } else {
                console.log('Serial port closed successfully');
                if (mainWindow) {
                    mainWindow.webContents.send('disconnect_request', 'success');
                }
            }
        });
    } else {
        console.log('Port is not open');
        if (mainWindow) {
            mainWindow.webContents.send('disconnect_request', 'not_open');
        }
    }
}