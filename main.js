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
    mainWindow.loadFile("UI/index.html");
}

app.whenReady().then(() => {
    createWindow();

    // get all the COM ports as return to renderer to put it as a HTML option element
    ipcMain.on('availableCOMports', (event, data) => {
        SerialPort.list()
        .then(ports => {
            if (ports.length === 0) {
                console.log("No COM ports found.");
            } else {
            ports.forEach(port => {
                mainWindow.webContents.send('availableCOMports', port.path);
            });
            }
        })
        .catch(err => console.error("Error:", err));
    });

    let port;
    ipcMain.on('connect_request', (event, data) => {
        if (data) {
            port = new SerialPort({
                path: data,
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

    // saves PID data in PIDhistory.json
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

        // returns teh current time for json key
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
    });

    // connects to a serial port and reads data from it
    let MLdaaStreamStarted = false; // flag to check if the ML data stream has started
    let MLdata = "\n"; // variable to store the ML data
    function connectToPortAndReadData(portNumber){
        port.on('open', () => {
            console.log('Serial port opened at COM' + portNumber);
            if (mainWindow) {
                mainWindow.webContents.send('connect_request', 'success');
            }
        
            port.on('data', (data) => {
                if (mainWindow) {
                    data = data.toString();
                    if(MLdaaStreamStarted){
                        data = data.replace(/(\r\n|\n|\r)/gm, ""); // remove new line characters
                        MLdata += data;
                    } else {
                        let data_parts = data.split("\r\n0");
                        data_parts = data_parts[0].split(",");
                        if(data_parts.length == 21){
                            mainWindow.webContents.send('serial-data', data_parts);
                        }
                    }
                }
            });
        
            port.on('error', (err) => {
                console.error('Error: DGDFJGFS%S^%S*&^%SFSGF');
            });
        });
    }

    // send data via serial port
    function sendData(data){
        if (port && port.isOpen) {
            port.write(data, (err) => {
                if (err) {
                    console.error('Error on write: ', err.message);
                    disconnectPort();
                } 
            });
        }
    }

    // disconnects a serial port
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

});
