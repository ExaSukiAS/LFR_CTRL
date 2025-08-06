const { ipcRenderer } = require('electron');
import { showMessageUI, timerControl } from '../animations.modules.js';

// DOM elements
const p_value_input = document.querySelector('.p_value');
const i_value_input = document.querySelector('.i_value');
const d_value_input = document.querySelector('.d_value');
const p_slider = document.querySelector('.p_slider');
const i_slider = document.querySelector('.i_slider');
const d_slider = document.querySelector('.d_slider');
const max_p_impact_input = document.querySelector('.p_impact');
const max_i_impact_input = document.querySelector('.i_impact');
const max_d_impact_input = document.querySelector('.d_impact');
const max_left_input = document.querySelector('.max_left');
const max_right_input = document.querySelector('.max_right');
const base_speed_input = document.querySelector('.base_speed');
const black_stop_duration_input = document.querySelector('.black_stop_duration');
const turning_speed_input = document.querySelector('.turning_speed');
const turning_delay_input = document.querySelector('.turning_delay');
const history_div = document.querySelector('.history');
export const highlighter_div = document.querySelector('.highlighter');
export const pid_mode_div = document.querySelector('.pid_mode');
export const ctrl_mode_div = document.querySelector('.ctrl_mode');
const com_select = document.querySelector('.com');
const voltage_div = document.querySelector('.voltage');
const fill_battery_div = document.querySelector('.fill_battery');
const timer_div = document.querySelector(".timer");
const message_container_dv = document.querySelector(".message_container");
const message_div = document.querySelector(".message");

// elements with event listeners
const ctrl_button = document.querySelector(".ctrl");
const dataPush_button = document.querySelector(".data_push");
const connect_button = document.querySelector('.connect');
const play_pause_button = document.querySelector('.play_pause');
const start_follow_button = document.querySelector('.start_follow');
// UI event listeners
ctrl_button.addEventListener("click", () =>{control();});
dataPush_button.addEventListener("click", () =>{push_data_f();});
connect_button.addEventListener("click", () =>{connect_f();});
play_pause_button.addEventListener("click", () =>{play_pause_f();});
start_follow_button.addEventListener("click", () =>{startStop_follow_f(1);});


// internal variables of the robot
const maxBatteryVoltage = 12.35;   
const cutOffVoltage = 7.5; // cut-off voltage of battery
const maxError = 8;    // maximum error possible by the IR sensors
let followStatusGlobal = 2;

let IR_state_values = []; // stores the values of the sensors
let got_data = 0;   // bool to store if initial data is shown or not

export let mode_selected = 'pid';  // modes are: pid and ctrl

// function to get proper formatted data to send to the robot
export function getDataForSending(mode, ctrlLeft, ctrlRight, Pconst, Iconst, Dconst, turningSpeed, maxLeft, maxRight, baseSpeed, blackStop, turningDelay){
    return `${mode},${ctrlLeft},${ctrlRight},${Pconst},${Iconst},${Dconst},${turningSpeed},${maxLeft},${maxRight},${baseSpeed},${blackStop},${turningDelay},$$##\n`;
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
    highlighter_div.style.right = '134px';
    highlighter_div.style.width = '80px';

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
    let turning_delay = parseInt(turning_delay_input.value);
    let turning_speed = parseInt(turning_speed_input.value);

    // save the PID values to the PIDhistory.json file
    let data_string = `${p_value_formatted},${i_value_formatted},${d_value_formatted}`;
    let data_stringSaving = `P: ${p_value_formatted}, I: ${i_value_formatted}, D: ${d_value_formatted}, baseSpeed: ${base_speed}, maxLeftSpeed: ${max_left_speed}, maxRightSpeed: ${max_right_speed}`;
    ipcRenderer.send("savePID", data_stringSaving);

    // format data for sending to bot
    let pid_value_to_send = getDataForSending(1, 0, 0, p_value_formatted, i_value_formatted, d_value_formatted, turning_speed, max_left_speed, max_right_speed, base_speed, black_stop_duration, turning_delay);

    // store in UI history
    let history_pid = document.createElement('span');
    history_pid.className = 'history_pid';
    history_pid.innerHTML = data_string;
    history_div.appendChild(history_pid);

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
        if(send_data == 1) ipcRenderer.send("send_data", getDataForSending(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
    }else{
        if(send_data == 1) ipcRenderer.send("send_data", getDataForSending(2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
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
const myChart = new Chart(ctx, {
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
    aspectRatio: 3 / 1,
    responsive: true,
    scales: {
      y: {
        min: -8,
        max: 8,
        ticks: {
            stepSize: 0.5,  
            color: 'rgba(255, 255, 255, 0.7)' 
        },
        grid: {
          color: 'rgb(88, 147, 255, 0.17)'
        }
      },
      x: {
        //display: false,
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
function throttleUpdate(chart, newData) {
  const now = Date.now();   // time of now
  // updates graph in every 100ms
  if (now - lastUpdate > 100) { 
    dataArray.push(newData);
    // shifts data of dataArray[] when excedding 50 elements
    if (dataArray.length > 50) { 
      dataArray.shift();
    }
    // puts the error values and labels in the graph UI
    const labels = dataArray.map(data => new Date(data.timestamp).toLocaleTimeString());
    const values = dataArray.map(data => data.value);
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();

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
            for (let i = 0; i < 16; i++) {
                IR_state_values[i] = data_parts[i];
                element = document.querySelector('.IR' + (i));
                if (IR_state_values[i] == 1) {
                    element.style.backgroundColor = 'white';
                } else {
                    element.style.backgroundColor = '#555555';
                }
            }
            // initialize rest of the data received from the robot
            let error = data_parts[16];
            let Pconstant = parseFloat(data_parts[17]);
            let Iconstant = parseFloat(data_parts[18]);
            let Dconstant = parseFloat(data_parts[19]);
            let turningSpeed = parseFloat(data_parts[20]);
            let maxLeftSpeed = parseInt(data_parts[21]);
            let maxRightSpeed = parseInt(data_parts[22]);
            let baseSpeed = parseInt(data_parts[23]);
            batteryVoltage = data_parts[24];
            let followStatus = parseInt(data_parts[25]);
            let blackStopDuration = parseInt(data_parts[26]);
            let turningDelay = parseInt(data_parts[27]);

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
                turning_delay_input.value = turningDelay;
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
                throttleUpdate(myChart, newData);
            }
            got_data += got_data > 2 ? 0 : 1; 
        });
    }
    // updates battery voltage in every 500ms
    setInterval(() => {
        voltage_div.innerHTML = batteryVoltage + 'V';
        let batteryPercentage = (batteryVoltage - cutOffVoltage) / (maxBatteryVoltage - cutOffVoltage) * 100;
        fill_battery_div.style.width = batteryPercentage + '%';
        if(batteryPercentage >= 70){
            fill_battery_div.style.backgroundColor = "rgba(148, 255, 180, 0.8)";
        } else if(batteryPercentage >= 20){
            fill_battery_div.style.backgroundColor = "rgba(255, 255, 180, 0.8)";
        } else {
            fill_battery_div.style.backgroundColor = "rgba(255, 180, 180, 0.8)";
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