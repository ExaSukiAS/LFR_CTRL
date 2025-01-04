/*

Data format:

Send to esp32:
Mode: control=0 or PID=1,
Proportional(p) value,
Integral(I) value,
Derivetive(D) value, 
control direction: Forward=0 or Right=1 or Left=2,
Speed value(0.0% - 100.0%)

Receive from Esp32:
IR1, IR2, IR3, IR4, IR5, IR6, IR7, IR8, Battery voltage


*/

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path'); 
const fs = require('fs');
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

// save PID data history
ipcMain.on('savePID', (event, data) => {
    const filePath = 'PIDhistory.json';
    const jsonKey = getCurrentTime();

    // Read the existing file
    fs.readFile(filePath, 'utf8', (err, fileData) => {
        let jsonObject = {};

        if (err) {
            if (err.code === 'ENOENT') {
                console.log('File not found. Creating a new one.');
            } else {
                console.error('Error reading file:', err);
                return;
            }
        } else {
            try {
                jsonObject = JSON.parse(fileData);
            } catch (parseErr) {
                console.error('Error parsing JSON file:', parseErr);
                return;
            }
        }
        jsonObject[jsonKey] = data;

        // Write the updated JSON back to the file
        fs.writeFile(filePath, JSON.stringify(jsonObject, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to file:', writeErr);
            } else {
                console.log('Data added successfully!');
            }
        });
    });
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
        port.write('1,0,0,0,0,0', (err) => { // sending initial data, see data fromat at the top
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

function getCurrentTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; 
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const year = now.getFullYear();

    return `${hours}:${minutes}:${seconds} ${amPm}, ${day}/${month}/${year}`;
  }