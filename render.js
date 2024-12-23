const { ipcRenderer } = require('electron');

let p_value = document.querySelector('.p_value');
let i_value = document.querySelector('.i_value');
let d_value = document.querySelector('.d_value');
let real_value = document.querySelector('.real_value');
let percentage_value = document.querySelector('.percentage_value');

let p_slider = document.querySelector('.p_slider');
let i_slider = document.querySelector('.i_slider');
let d_slider = document.querySelector('.d_slider');
let speed_slider = document.querySelector('.speed_slider');

let history = document.querySelector('.history');

let highlighter = document.querySelector('.highlighter');
let pid_mode = document.querySelector('.pid_mode');
let ctrl_mode = document.querySelector('.ctrl_mode');
let top_arrow = document.querySelector('.top_arrow');
let bottom_arrow = document.querySelector('.bottom_arrow');
let left_arrow = document.querySelector('.left_arrow');
let right_arrow = document.querySelector('.right_arrow');



let com = document.querySelector('.com');
let connectbtn = document.querySelector('.connect');
let connectSVG = document.querySelector('.connect svg');



let play_pause_span = document.querySelector('.play_pause span');

p_slider.oninput = function() {
    p_value.value = (p_slider.value)/100000;
}
i_slider.oninput = function() {
    i_value.value = (i_slider.value)/100000;
}
d_slider.oninput = function() {
    d_value.value = (d_slider.value)/100000;
}
speed_slider.oninput = function() {
    real_value.value = speed_slider.value;
    percentage_value.value = (speed_slider.value)/40.96;
}

p_value.oninput = function() {
    p_slider.value = (p_value.value)*100000;
}
i_value.oninput = function() {
    i_slider.value = (i_value.value)*100000;
}
d_value.oninput = function() {
    d_slider.value = (d_value.value)*100000;
}
real_value.oninput = function() {
    speed_slider.value = real_value.value;
    percentage_value.value = (real_value.value)/40.96;
}

percentage_value.oninput = function() {
    speed_slider.value = (percentage_value.value) * 40.96;
    real_value.value = (percentage_value.value) * 40.96;
}

function p_sub_f(input_element) {
    let difference = parseFloat(document.querySelector(input_element).value);
    p_slider.value = parseFloat(p_slider.value) - difference*100000;
    p_value.value = parseFloat(p_value.value) - difference;
}
function p_add_f(input_element) {
    let difference = parseFloat(document.querySelector(input_element).value);
    p_slider.value = parseFloat(p_slider.value) + difference*100000;
    p_value.value = parseFloat(p_value.value) + difference;
}

function i_sub_f(input_element) {
    let difference = parseFloat(document.querySelector(input_element).value);
    i_slider.value = parseFloat(i_slider.value) - difference*100000;
    i_value.value = parseFloat(i_value.value) - difference;
}
function i_add_f(input_element) {
    let difference = parseFloat(document.querySelector(input_element).value);
    i_slider.value = parseFloat(i_slider.value) + difference*100000;
    i_value.value = parseFloat(i_value.value) + difference;
}

function d_sub_f(input_element) {
    let difference = parseFloat(document.querySelector(input_element).value);
    d_slider.value = parseFloat(d_slider.value) - difference*100000;
    d_value.value = parseFloat(d_value.value) - difference;
}
function d_add_f(input_element) {
    let difference = parseFloat(document.querySelector(input_element).value);
    d_slider.value = parseFloat(d_slider.value) + difference*100000;
    d_value.value = parseFloat(d_value.value) + difference;
}


function push_data_f(){
    let p_value_numeric = parseFloat(p_value.value); 
    let p_value_formatted = p_value_numeric.toFixed(5);
    let i_value_numeric = parseFloat(i_value.value); 
    let i_value_formatted = i_value_numeric.toFixed(5);
    let d_value_numeric = parseFloat(d_value.value); 
    let d_value_formatted = d_value_numeric.toFixed(5);

    let data_string = `${p_value_formatted},${i_value_formatted},${d_value_formatted}`;
    let pid_value_to_send = `2,${p_value_formatted},${i_value_formatted},${d_value_formatted},3,0`;
    let history_pid = document.createElement('span');
    history_pid.className = 'history_pid';
    history_pid.innerHTML = data_string;
    history.appendChild(history_pid);

    ipcRenderer.send("send_data", pid_value_to_send);
}

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

let keyPressed = false;
document.addEventListener("keydown", function(event) {
    var keyCode = event.keyCode;
    if(!keyPressed){
        if (keyCode == 38){
            keyPressed = true;
            ipcRenderer.send("send_data", `1,0,0,0,1,${real_value.value}`);
        }

        else if (keyCode == 39){
            keyPressed = true;
            ipcRenderer.send("send_data", `1,0,0,0,2,${real_value.value}`);
        }

        else if (keyCode == 37){
            keyPressed = true;
            ipcRenderer.send("send_data", `1,0,0,0,3,${real_value.value}`);
        }

        else if (keyCode == 40){
            keyPressed = true;
            ipcRenderer.send("send_data", `1,0,0,0,3,0`);
        }
    }
});
document.addEventListener("keyup", function(event) {
    var keyCode = event.keyCode;
    if (keyCode){
        keyPressed = false;
        ipcRenderer.send("send_data", `1,0,0,0,3,0`);
    }
});

let should_play = true;

function play(){
    play_pause_span.innerHTML = 'stop_circle';
    should_play = true;
}

function pause(){
    play_pause_span.innerHTML = 'play_circle';
    should_play = false;
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
        grid: {
          color: 'rgba(0, 249, 255, 0.1)'
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

ipcRenderer.on('connect_request', (event, data) => {
    if (data === 'success') {
        connected = true;
        connectbtn.innerHTML = connectbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="m770-302-60-62q40-11 65-42.5t25-73.5q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 57-29.5 105T770-302ZM634-440l-80-80h86v80h-6ZM792-56 56-792l56-56 736 736-56 56ZM440-280H280q-83 0-141.5-58.5T80-480q0-69 42-123t108-71l74 74h-24q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h65l79 80H320Z"/></svg>DISCONNECT';

        ipcRenderer.on('serial-data', (event, data) => {
            console.log(data);
            let data_parts = data.split(",");
            let pid_data = parseFloat(data_parts[3]);// data consists of 3 values, last value is the error
            if (!isNaN(pid_data)) {
                const newData = {
                    timestamp: Date.now(),
                    value: pid_data
                };
                if (should_play) {
                    throttleUpdate(myChart, newData);
                }
            }
        });
    }
});
ipcRenderer.on('disconnect_request', (event, data) => {
    if (data === 'success') {
        connected = false;
        connectbtn.innerHTML = connectbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#e8eaed"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/></svg>CONNECT';
    }
});



  


  
  

