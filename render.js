const { ipcRenderer } = require('electron');

let max_left_speed;
let max_right_speed;
let base_speed;
let max_PID_speed;

let p_value = document.querySelector('.p_value');
let i_value = document.querySelector('.i_value');
let d_value = document.querySelector('.d_value');
let percentage_value = document.querySelector('.percentage_value');
let p_slider = document.querySelector('.p_slider');
let i_slider = document.querySelector('.i_slider');
let d_slider = document.querySelector('.d_slider');
let speed_slider = document.querySelector('.speed_slider');
let start_follow = document.querySelector('.start_follow');

let max_left = document.querySelector('.max_left');
let max_right = document.querySelector('.max_right');
let base_speed_input = document.querySelector('.base_speed');

let current_left_speed = document.querySelector('.current_left_speed');
let current_right_speed = document.querySelector('.current_right_speed');
let PID_impact_speed = document.querySelector('.PID_impact_speed');
let current_left_speed_num = document.querySelector('.current_left_speed h5');
let current_right_speed_num = document.querySelector('.current_right_speed h5');
let PID_impact_speed_num = document.querySelector('.PID_impact_speed h5');

let maxP = 1;
let maxI = 1;
let maxD = 1;

let Pdivider = 1000000/maxP;
let Idivider = 1000000/maxI;
let Ddivider = 1000000/maxD;

p_slider.oninput = function() {
    p_value.value = (p_slider.value)/Pdivider;
}
i_slider.oninput = function() {
    i_value.value = (i_slider.value)/Idivider;
}
d_slider.oninput = function() {
    d_value.value = (d_slider.value)/Ddivider;
}
speed_slider.oninput = function() {
    percentage_value.value = (speed_slider.value)/40.96;
}

p_value.oninput = function() {
    p_slider.value = (p_value.value)*Pdivider;
}
i_value.oninput = function() {
    i_slider.value = (i_value.value)*Idivider;
}
d_value.oninput = function() {
    d_slider.value = (d_value.value)*Ddivider;
}

percentage_value.oninput = function() {
    speed_slider.value = (percentage_value.value) * 40.96;
}


max_left.oninput = function() {
    max_left_speed = max_left.value;
}
max_right.oninput = function() {
    max_right_speed = max_right.value;
}
base_speed_input.oninput = function() {
    base_speed = base_speed_input.value;
}

let history = document.querySelector('.history');

let highlighter = document.querySelector('.highlighter');
let pid_mode = document.querySelector('.pid_mode');
let ctrl_mode = document.querySelector('.ctrl_mode');

let com = document.querySelector('.com');
let connectbtn = document.querySelector('.connect');

let voltage = document.querySelector('.voltage');
let fill_battery = document.querySelector('.fill_battery');

let play_pause = document.querySelector('.play_pause');

let mode_selected = 'pid';

function control(){
    highlighter.style.left = '7px';
    highlighter.style.width = '80px';

    pid_mode.style.opacity = '0';
    ctrl_mode.style.display = 'flex';
    setTimeout(() => {
        pid_mode.style.display = 'none';
        ctrl_mode.style.opacity = '1';
    }, 300);
    mode_selected = 'ctrl';
}

function pid(){
    highlighter.style.left = '102px';
    highlighter.style.width = '40px';

    ctrl_mode.style.opacity = '0';
    pid_mode.style.display = 'flex';
    setTimeout(() => {
        ctrl_mode.style.display = 'none';
        pid_mode.style.opacity = '1';
    }, 300);
    mode_selected = 'pid';
}

function push_data_f(){
    let p_value_numeric = parseFloat(p_value.value); 
    let p_value_formatted = p_value_numeric.toFixed(5);
    let i_value_numeric = parseFloat(i_value.value); 
    let i_value_formatted = i_value_numeric.toFixed(5);
    let d_value_numeric = parseFloat(d_value.value); 
    let d_value_formatted = d_value_numeric.toFixed(5);

    let data_string = `${p_value_formatted},${i_value_formatted},${d_value_formatted}`;
    let data_stringSaving = `P: ${p_value_formatted}, I: ${i_value_formatted}, D: ${d_value_formatted}, baseSpeed: ${base_speed}, maxLeftSpeed: ${max_left_speed}, maxRightSpeed: ${max_right_speed}`;
    ipcRenderer.send("savePID", data_stringSaving);
    let pid_value_to_send = `1,${p_value_formatted},${i_value_formatted},${d_value_formatted},${max_left_speed},${max_right_speed},${base_speed},0,0`;
    let history_pid = document.createElement('span');
    history_pid.className = 'history_pid';
    history_pid.innerHTML = data_string;
    history.appendChild(history_pid);

    ipcRenderer.send("send_data", pid_value_to_send);
}


let keyPressed = false;
document.addEventListener("keydown", function(event) {
    var keyCode = event.keyCode;
    if(!keyPressed){
        if(mode_selected == 'ctrl'){
            if (keyCode == 38){
                keyPressed = true;
                ipcRenderer.send("send_data", `0,0,0,0,0,0,0,0,${percentage_value.value}`);
            }

            else if (keyCode == 39){
                keyPressed = true;
                ipcRenderer.send("send_data", `0,0,0,0,0,0,0,1,${percentage_value.value}`);
            }

            else if (keyCode == 37){
                keyPressed = true;
                ipcRenderer.send("send_data", `0,0,0,0,0,0,0,2,${percentage_value.value}`);
            }

            else if (keyCode == 40){
                keyPressed = true;
                ipcRenderer.send("send_data", `0,0,0,0,0,0,0,0,0`);
            }
        }   
    }
});
document.addEventListener("keyup", function(event) {
    var keyCode = event.keyCode;
    if (keyCode){
        if(mode_selected == 'ctrl'){
            keyPressed = false;
            ipcRenderer.send("send_data", `0,0,0,0,0,0,0,0,0`);
        }
    }
});

let should_play = true;
function play(){
    play_pause.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
    should_play = true;
}
function pause(){
    play_pause.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
    should_play = false;
}
let followCount = 0;
function startStop_follow_f(){
    followCount += 1;
    if (followCount != 0){
        if (followCount % 2 == 0){
            start_follow.innerHTML = "START FOLLOWING";
            ipcRenderer.send("send_data", `0,0,0,0,0,0,0,0,0`);
        }
        if (followCount % 2 != 0){
            start_follow.innerHTML = "STOP FOLLOWING";
            ipcRenderer.send("send_data", `2,0,0,0,0,0,0,0,0`);
        }
    }
}
let play_pause_count = 0;
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
        min: -3000,
        max: 4000,
        ticks: {
            stepSize: 500,  
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

let dataArray = [];
let lastUpdate = 0;

function updateDataArray(newData) {
  dataArray.push(newData);
  if (dataArray.length > 50) { //50
    dataArray.shift();
  }
}

function updateChart(chart) {
  const labels = dataArray.map(data => new Date(data.timestamp).toLocaleTimeString());
  const values = dataArray.map(data => data.value);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
}

function throttleUpdate(chart, newData) {
  const now = Date.now();
  if (now - lastUpdate > 100) { //time 100
    updateDataArray(newData);
    updateChart(chart);
    lastUpdate = now;
  }
}

let connected = false;
function connect_f() {
    if (!connected){
        ipcRenderer.send("connect_request", com.value);
    }else{
        ipcRenderer.send("disconnect_request");
    }
}

let IR_state_values = [0, 0, 0, 0, 0, 0, 0, 0];
let maxBatteryVoltage = 4.12;
let batteryVoltage = 0;
let batteryPercentage = 100;

let PID_speed;

let error;
let got_data = false;
ipcRenderer.on('connect_request', (event, data) => {
    if (data === 'success') {
        connected = true;
        connectbtn.innerHTML = connectbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="m770-302-60-62q40-11 65-42.5t25-73.5q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 57-29.5 105T770-302ZM634-440l-80-80h86v80h-6ZM792-56 56-792l56-56 736 736-56 56ZM440-280H280q-83 0-141.5-58.5T80-480q0-69 42-123t108-71l74 74h-24q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h65l79 80H320Z"/></svg>DISCONNECT';

        ipcRenderer.on('serial-data', (event, data_parts) => {
            for (let i = 0; i <= 7; i++){
                IR_state_values[i] = data_parts[i];
                element = document.querySelector('.IR' + (i+1));
                if (IR_state_values[i] > 500){
                    element.style.backgroundColor = 'white';
                } else {
                    element.style.backgroundColor = '#555555';
                }
            }
            error = data_parts[8];

            PID_speed = data_parts[12];

            if(!got_data){
                max_left_speed = data_parts[13];
                max_left.value = max_left_speed;
                max_right_speed = data_parts[14];
                max_right.value = max_right_speed;
                base_speed = data_parts[15];
                base_speed_input.value = base_speed;
            }

            if(base_speed >= 50){
                max_PID_speed = base_speed;
            } else {
                max_PID_speed = max_left_speed - base_speed;
            }

            PID_impact_speed.height = PID_speed/max_PID_speed * 100 + '%';
            PID_impact_speed_num.innerHTML = PID_speed;

            current_left_speed.height = data_parts[16] + '%';
            current_right_speed.height = data_parts[17] + '%';
            current_left_speed_num.innerHTML = data_parts[16];
            current_right_speed_num.innerHTML = data_parts[17];

            batteryVoltage = data_parts[18];
            voltage.innerHTML = batteryVoltage + 'V';
            batteryPercentage = (batteryVoltage / maxBatteryVoltage) * 100;
            fill_battery.style.width = batteryPercentage + '%';
            
            const newData = {
                timestamp: Date.now(),
                value: error
            };
            if (should_play) {
                throttleUpdate(myChart, newData);
            }
            got_data = true;
        });
    }
});
ipcRenderer.on('disconnect_request', (event, data) => {
    if (data === 'success') {
        got_data = false;
        connected = false;
        connectbtn.innerHTML = connectbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/></svg>CONNECT';
    }
});



  


  
  

