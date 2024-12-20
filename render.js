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
let arrow_image = document.querySelector('.arrow_image');

let com = document.querySelector('.com');
let connect = document.querySelector('.connect span');
let connectbtn = document.querySelector('.connect');


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
    ctrl_mode.style.visibility = 'visible';
    setTimeout(() => {
        pid_mode.style.visibility = 'hidden';
        ctrl_mode.style.opacity = '1';
    }, 300);
    mode_selected = 'ctrl';
}

function pid(){
    highlighter.style.left = '102px';
    highlighter.style.width = '40px';

    ctrl_mode.style.opacity = '0';
    pid_mode.style.visibility = 'visible';
    setTimeout(() => {
        ctrl_mode.style.visibility = 'hidden';
        pid_mode.style.opacity = '1';
    }, 300);
    mode_selected = 'pid';
}

document.addEventListener("keydown", function(event) {
    var keyCode = event.keyCode;

    if (keyCode == 38){
        ipcRenderer.send("send_data", `1,0,0,0,1,${real_value.value}`);
        arrow_image.style.transform = "rotate(0deg)";
        arrow_image.style.left = "50px";
        arrow_image.style.bottom = "60px";
        arrow_image.style.opacity = 0.9;
        setTimeout(() => {
            arrow_image.style.opacity = 0;
        }, 100);
    }

    else if (keyCode == 39){
        ipcRenderer.send("send_data", `1,0,0,0,2,${real_value.value}`);
        arrow_image.style.transform = "rotate(90deg)"
        arrow_image.style.left = "120px";
        arrow_image.style.bottom = "0px";
        arrow_image.style.opacity = 1;
        setTimeout(() => {
            arrow_image.style.opacity = 0;
        }, 100);
    }

    else if (keyCode == 37){
        ipcRenderer.send("send_data", `1,0,0,0,3,${real_value.value}`);
        arrow_image.style.transform = "rotate(-90deg)"
        arrow_image.style.left = "-10px";
        arrow_image.style.bottom = "0px";
        arrow_image.style.opacity = 1;
        setTimeout(() => {
            arrow_image.style.opacity = 0;
        }, 100);
    }

    else if (keyCode == 40){
        ipcRenderer.send("send_data", `1,0,0,0,3,0`);
        arrow_image.style.transform = "rotate(-180deg)"
        arrow_image.style.left = "50px";
        arrow_image.style.bottom = "-60px";
        arrow_image.style.opacity = 1;
        setTimeout(() => {
            arrow_image.style.opacity = 0;
        }, 100);
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


function connect_f() {
    ipcRenderer.send("connect_request", com.value);
}

let connected = false;

ipcRenderer.on('connect_request', (event, data) => {
    if (data === 'success') {
        connected = true;
        connect.innerHTML = 'link'; 

        ipcRenderer.on('serial-data', (event, data) => {
            console.log(data);
            let data_parts = data.split(",");
            let pid_data = parseFloat(data_parts[3]);
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



  


  
  

