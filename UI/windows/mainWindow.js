const { ipcRenderer } = require('electron');
import { showMessageUI, timerControl, openORcloseWindow } from '../animations.modules.js';
import {Pdivider, Idivider, Ddivider} from '../inputs.js';

// DOM elements
export const p_value_input = document.querySelector('.p_value');
export const i_value_input = document.querySelector('.i_value');
export const d_value_input = document.querySelector('.d_value');
export const p_slider = document.querySelector('.p_slider');
export const i_slider = document.querySelector('.i_slider');
export const d_slider = document.querySelector('.d_slider');
export const max_p_impact_input = document.querySelector('.p_impact');
export const max_i_impact_input = document.querySelector('.i_impact');
export const max_d_impact_input = document.querySelector('.d_impact');
export const max_left_input = document.querySelector('.max_left');
export const max_right_input = document.querySelector('.max_right');
export const base_speed_input = document.querySelector('.base_speed');
export const black_stop_duration_input = document.querySelector('.black_stop_duration');
export const turning_speed_input = document.querySelector('.turning_speed');
export const hard_break_time_input = document.querySelector('.hard_break_time');
export const hard_break_speed_input = document.querySelector('.hard_break_speed');
export const highlighter_div = document.querySelector('.highlighter');
export const pid_mode_div = document.querySelector('.pid_mode');
export const ctrl_mode_div = document.querySelector('.ctrl_mode');
const com_select = document.querySelector('.com');
const voltage_div = document.querySelector('.voltage');
const timer_div = document.querySelector(".timer");
const message_container_dv = document.querySelector(".message_container");
const message_div = document.querySelector(".message");

// elements with event listeners
const ctrl_button = document.querySelector(".ctrl");
const dataPush_button = document.querySelector(".data_push");
const connect_button = document.querySelector('.connect');
const play_pause_button = document.querySelector('.play_pause');
const start_follow_button = document.querySelector('.start_follow');
const historyButton = document.querySelector(".historyButton");
// UI event listeners
ctrl_button.addEventListener("click", () =>{control();});
dataPush_button.addEventListener("click", () =>{push_data_f();});
connect_button.addEventListener("click", () =>{connect_f();});
play_pause_button.addEventListener("click", () =>{play_pause_f();});
start_follow_button.addEventListener("click", () =>{startStop_follow_f(1);});
historyButton.addEventListener("click", () => {openORcloseWindow(document.querySelector('.historyWindow'), true);});

const graphUpdateInterval = 100; // determines how often the error graph will be updated in ms

// internal variables of the robot
const maxBatteryVoltage = 8.4;   
const cutOffVoltage = 6.0; // cut-off voltage of battery
export const maxError = 3500;    // maximum error possible by the IR sensors
let followStatusGlobal = 2;

let IR_state_values = []; // stores the values of the sensors
let got_data = 0;   // bool to store if initial data is shown or not

export let mode_selected = 'pid';  // modes are: pid and ctrl

// function to get proper formatted data to send to the robot
export function formatDataForSending(mode, ctrlLeft, ctrlRight, Pconst, Iconst, Dconst, turningSpeed, maxLeft, maxRight, baseSpeed, blackStop, hardBreakTime, hardBreakMagnitude){
    return `${mode},${ctrlLeft},${ctrlRight},${Pconst},${Iconst},${Dconst},${turningSpeed},${maxLeft},${maxRight},${baseSpeed},${blackStop},${hardBreakTime},${hardBreakMagnitude},$$##\n`;
}

// show all available COM ports as option in DOM
ipcRenderer.send("availableCOMports", "give");
ipcRenderer.on("availableCOMports", (event, data) => {
    let comSelect_div = document.querySelector(".com");
    let option = document.createElement('option');
    option.value = data;
    option.textContent = data;
    comSelect_div.appendChild(option);
});

// function to switch to control mode
function control(){
    highlighter_div.style.right = '92px';

    pid_mode_div.style.opacity = '0';
    ctrl_mode_div.style.display = 'flex';
    setTimeout(() => {
        pid_mode_div.style.display = 'none';

        ctrl_mode_div.style.opacity = '1';
    }, 300);
    mode_selected = 'ctrl';
}


// function to send necessery data (P constant, I constant, D constant, max left speed, max right speed, base speed) to the robot
function push_data_f(){
    // fetch values of UI elements
    let p_value_numeric = parseFloat(p_value_input.value); 
    let p_value_formatted = p_value_numeric.toFixed(5);
    let i_value_numeric = parseFloat(i_value_input.value); 
    let i_value_formatted = i_value_numeric.toFixed(5);
    let d_value_numeric = parseFloat(d_value_input.value); 
    let d_value_formatted = d_value_numeric.toFixed(5);

    let max_left_speed = parseInt(max_left_input.value);
    let max_right_speed = parseInt(max_right_input.value);
    let base_speed = parseInt(base_speed_input.value);
    let black_stop_duration = parseInt(black_stop_duration_input.value);
    let hard_break_time = parseInt(hard_break_time_input.value);
    let hard_break_magnitude = parseInt(hard_break_speed_input.value);
    let turning_speed = parseInt(turning_speed_input.value);

    // save the PID values to the PIDhistory.json file
    let dataObjectSaving = {
        P: p_value_formatted,
        I: i_value_formatted,
        D: d_value_formatted,
        baseSpeed: base_speed,
        maxLeftSpeed: max_left_speed,
        maxRightSpeed: max_right_speed,
        turningSpeed: turning_speed,
        hardBreakTime: hard_break_time,
        hardBreakMagnitude: hard_break_magnitude,
        blackStopDuration: black_stop_duration
    };
    ipcRenderer.send("saveESPconf", dataObjectSaving);

    // format data for sending to bot
    let pid_value_to_send = formatDataForSending(1, 0, 0, p_value_formatted, i_value_formatted, d_value_formatted, turning_speed, max_left_speed, max_right_speed, base_speed, black_stop_duration, hard_break_time, hard_break_magnitude);
    ipcRenderer.send("send_data", pid_value_to_send);// send the data
    got_data = 0;
    showMessageUI(message_container_dv, message_div, "Data sent!", "normal");
}


let followClicked = false; // bool to store if the button is clicked or not
// sends data to robots to start or stop following the track
function startStop_follow_f(send_data){
    followClicked = !followClicked;
    // stop following track
    if (!followClicked){
        if(send_data == 1) ipcRenderer.send("send_data", formatDataForSending(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
    }else{
        if(send_data == 1) ipcRenderer.send("send_data", formatDataForSending(2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
    }
}

let play_pause_count = 0;   // stores how many times play_pause_f() is called
// starts or pauses graph
function play_pause_f(){
    play_pause_count += 1;
    if (play_pause_count != 0){
        if (play_pause_count % 2 == 0){
            play();
        }
        if (play_pause_count % 2 != 0){
            pause();
        }
    }
}
let should_play = true; // bool to play or stop the graph
// starts teh graph
function play(){
    play_pause_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
    should_play = true;
}
// pauses teh graph
function pause(){
    play_pause_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
    should_play = false;
}

// creates the error graph using chart.js
const ctx = document.getElementById('err_graph').getContext('2d');
const errorGraph = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: false,
    }]
  },
  options: {
    aspectRatio: 3.3 / 1,
    responsive: true,
    scales: {
      y: {
        min: -3500,
        max: 3500,
        ticks: {
            autoSkip: false,  
            stepSize: 500,  
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
                size: 9
            }
        },
        grid: {
          color: 'rgb(88, 147, 255, 0.17)'
        }
      },
      x: {
        display: true,
        ticks: {
            autoSkip: false,    
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
                size: 9
            }
        },
        grid: {
          color: 'rgb(88, 147, 255, 0.17)'
        }
      }
    },
    plugins: {
      title: {
        display: false
      },
      legend: {
        display: false
      }
    }
  }
});

let dataArray = []; // stores the track error data received from the robots
let lastUpdate = 0; // stores the last error graph updated time
// updates the graph
function throttleUpdate(newData) {
  const now = Date.now();   // time of now
  // updates graph in every 100ms
  if (now - lastUpdate > graphUpdateInterval) { 
    dataArray.push(newData);
    // shifts data of dataArray[] when excedding 50 elements
    if (dataArray.length > 50) { 
      dataArray.shift();
    }
    // puts the error values and labels in the graph UI
    const labels = dataArray.map(data => new Date(data.timestamp).toLocaleTimeString([], { second: '2-digit', fractionalSecondDigits: 2 }));
    const values = dataArray.map(data => data.value);
    errorGraph.data.labels = labels;
    errorGraph.data.datasets[0].data = values;
    errorGraph.update();

    lastUpdate = now;
  }
}

let connected = false;  // stores teh status of connection with teh robot
// connects to the robot
function connect_f() {
    if (!connected){
        ipcRenderer.send("connect_request", com_select.value);
    }else{
        ipcRenderer.send("disconnect_request");
    }
}

let batteryVoltage;
ipcRenderer.on('connect_request', (event, data) => {
    if (data === 'success') {
        connected = true;
        connect_button.innerHTML = connect_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="m770-302-60-62q40-11 65-42.5t25-73.5q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 57-29.5 105T770-302ZM634-440l-80-80h86v80h-6ZM792-56 56-792l56-56 736 736-56 56ZM440-280H280q-83 0-141.5-58.5T80-480q0-69 42-123t108-71l74 74h-24q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h65l79 80H320Z"/></svg>DISCONNECT';

        // acts when data is received from the robot
        ipcRenderer.on('serial-data', (event, data_parts) => {
            // update the values of the sensors in the UI;
            for (let i = 4; i < 12; i++) {
                IR_state_values[i] = data_parts[i-4];
                const element = document.querySelector('.IR' + (i));
                if (IR_state_values[i] > 500) {
                    element.style.backgroundColor = '#555555';
                } else {
                    element.style.backgroundColor = 'white';
                }
            }
            // initialize rest of the data received from the robot
            let error = parseFloat(data_parts[8]);
            let Pconstant = parseFloat(data_parts[9]);
            let Iconstant = parseFloat(data_parts[10]);
            let Dconstant = parseFloat(data_parts[11]);
            let turningSpeed = parseFloat(data_parts[12]);
            let maxLeftSpeed = parseInt(data_parts[13]);
            let maxRightSpeed = parseInt(data_parts[14]);
            let baseSpeed = parseInt(data_parts[15]);
            batteryVoltage = parseInt(data_parts[16]);
            let followStatus = parseInt(data_parts[17]);
            let blackStopDuration = parseInt(data_parts[18]);
            let hardBreakTime = parseInt(data_parts[19]);
            let hardBreakMagnitude = parseInt(data_parts[20]);

            // acts on change in track following state
            if (followStatusGlobal != followStatus){
                if(followStatus == 1){
                    timerControl(timer_div, 2); // reset timer
                    timerControl(timer_div, 0); // start timer
                    start_follow_button.innerHTML = "STOP FOLLOWING";
                } else {
                    timerControl(timer_div, 1); // stop timer
                    start_follow_button.innerHTML = "START FOLLOWING";
                }
                followStatusGlobal = followStatus;
            }

            // show initial values
            if(got_data == 2){
                max_left_input.value = maxLeftSpeed;
                max_right_input.value = maxRightSpeed;
                base_speed_input.value = baseSpeed;
                black_stop_duration_input.value = blackStopDuration;
                hard_break_time_input.value = hardBreakTime;
                hard_break_speed_input.value = hardBreakMagnitude;
                turning_speed_input.value = turningSpeed;
                p_value_input.value = Pconstant;
                i_value_input.value = Iconstant;
                d_value_input.value = Dconstant;
                p_slider.value = (p_value_input.value)*Pdivider;
                i_slider.value = (i_value_input.value)*Idivider;
                d_slider.value = (d_value_input.value)*Ddivider;
                max_p_impact_input.value  = parseInt(((p_value_input.value))*maxError);
                max_i_impact_input.value  = parseInt(((i_value_input.value))*maxError);
                max_d_impact_input.value  = parseInt(((d_value_input.value))*maxError);
            }
            
            // json storing current time and error data
            const newData = {
                timestamp: Date.now(),
                value: error
            };
            // updates the graph
            if (should_play) {
                throttleUpdate(newData);
            }
            got_data += got_data > 2 ? 0 : 1; 
        });
    }
    // updates battery voltage in every 500ms
    setInterval(() => {
        voltage_div.innerHTML = batteryVoltage + 'V';
        let batteryPercentage = (batteryVoltage - cutOffVoltage) / (maxBatteryVoltage - cutOffVoltage) * 100;
        if(batteryPercentage >= 70){
            voltage_div.style.color = "rgba(148, 255, 180, 0.8)";
        } else if(batteryPercentage >= 20){
            voltage_div.style.color = "rgba(255, 255, 180, 0.8)";
        } else {
            voltage_div.style.color = "rgba(255, 180, 180, 0.8)";
        }
    }, 500);
});

// disconnect the robot
ipcRenderer.on('disconnect_request', (event, data) => {
    if (data === 'success') {
        got_data = 0;
        connected = false;
        connect_button.innerHTML = connect_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/></svg>CONNECT';
    }
});