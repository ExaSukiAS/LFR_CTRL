import { getDataForSending, highlighter_div, pid_mode_div, ctrl_mode_div, mode_selected } from "./mainWindow.js";
const { ipcRenderer } = require('electron');

// DOM elements
const forwardButton = document.querySelector('.top_arrow');
const backwardButton = document.querySelector('.bottom_arrow');
const leftButton = document.querySelector('.left_arrow');
const rightButton = document.querySelector('.right_arrow');
const motor_speed_value_input = document.querySelector('.percentage_value');

// elements with event listeners
const pid_button = document.querySelector(".pid");
// UI event listeners
pid_button.addEventListener("click", () =>{pid();});

// function to switch to PID mode
function pid(){
    highlighter_div.style.right = '34px';

    ctrl_mode_div.style.opacity = '0';
    pid_mode_div.style.display = 'flex';
    setTimeout(() => {
        ctrl_mode_div.style.display = 'none';
        pid_mode_div.style.opacity = '1';
    }, 300);
    mode_selected = 'pid';
}

// function to send data for controlling the robot
function sendControlData(leftMotor, rightMotor) {
    let motorSpeed = motor_speed_value_input.value;
    if (mode_selected == 'ctrl') {
        ipcRenderer.send("send_data", getDataForSending(0, leftMotor * motorSpeed, rightMotor * motorSpeed, 0, 0, 0, 0, 0, 0, 0, 0, 0));
    }
}

let buttonPressed = false; // bool to store status of buttons
// Forward Button
forwardButton.addEventListener('mousedown', () => {
    if (!buttonPressed) {
        buttonPressed = true;
        sendControlData(1, 1); // Forward
    }
});

forwardButton.addEventListener('mouseup', () => {
    if (buttonPressed) {
        sendControlData(0, 0); // Stop
        buttonPressed = false;
    }
});

// Backward Button
backwardButton.addEventListener('mousedown', () => {
    if (!buttonPressed) {
        buttonPressed = true;
        sendControlData(-1, -1); // Backward
    }
});

backwardButton.addEventListener('mouseup', () => {
    if (buttonPressed) {
        sendControlData(0, 0); // Stop
        buttonPressed = false;
    }
});

// Left Button
leftButton.addEventListener('mousedown', () => {
    if (!buttonPressed) {
        buttonPressed = true;
        sendControlData(-1, 1); // Left
    }
});

leftButton.addEventListener('mouseup', () => {
    if (buttonPressed) {
        sendControlData(0, 0); // Stop
        buttonPressed = false;
    }
});


// Right Button
rightButton.addEventListener('mousedown', () => {
    if (!buttonPressed) {
        buttonPressed = true;
        sendControlData(1, -1); // Right
    }
});

rightButton.addEventListener('mouseup', () => {
    if (buttonPressed) {
        sendControlData(0, 0); // Stop
        buttonPressed = false;
    }
});


let keyPressed = false; // bool to store status of keyboard keys
// acts on key press and sends data to control th ebot in control mode
document.addEventListener("keydown", function(event) {
    var keyCode = event.keyCode;
    if(!keyPressed){
        if(mode_selected == 'ctrl'){
            if (keyCode == 38){
                keyPressed = true;
                sendControlData(1, 1);   //Forward

            }

            else if (keyCode == 39){
                keyPressed = true;
                sendControlData(1, -1);  // right
            }

            else if (keyCode == 37){
                keyPressed = true;
                sendControlData(-1, 1);  // left
            }

            else if (keyCode == 40){
                keyPressed = true;
                sendControlData(-1, -1); // backward
            }
        }   
    }
});
// acts when keyboard key in released(stops the bot)
document.addEventListener("keyup", function(event) {
    var keyCode = event.keyCode;
    if (keyCode){
        if(mode_selected == 'ctrl'){
            sendControlData(0, 0);   // stop
            keyPressed = false;
        }
    }
});