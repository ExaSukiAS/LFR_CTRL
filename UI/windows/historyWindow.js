// This windows shows the history of data sent to the esp32. 
// This is a floating window
const { ipcRenderer } = require('electron');
import { openORcloseWindow } from '../animations.modules.js';
import { p_value_input, i_value_input, d_value_input, p_slider, i_slider, d_slider, max_p_impact_input, max_i_impact_input, max_d_impact_input, max_left_input, max_right_input, base_speed_input, black_stop_duration_input, turning_speed_input, hard_break_time_input, hard_break_speed_input, highlighter_div, pid_mode_div, ctrl_mode_div, maxError } from './mainWindow.js';
import {Pdivider, Idivider, Ddivider} from '../inputs.js';

// DOM elements
const historyTableBody = document.querySelector('.historyTableBody');
const closeHistoryButton = document.querySelector('.closeHistory');   

closeHistoryButton.addEventListener('click', () => {
    openORcloseWindow(document.querySelector('.historyWindow'), false);
});

ipcRenderer.send('getESPconfHistory', "1"); // request the main process to send the history data
ipcRenderer.on('ESPconfHistoryData', (event, data) => {
    // convert data object to array
    let dataArray = Object.values(data);
    let timestamps = Object.keys(data);
    let fullHTML = '';

    for (let i = 0; i < dataArray.length; i++) {
        let encodedData = JSON.stringify(dataArray[i]).replace(/"/g, '&quot;'); // encode data to be used in HTML attribute
        let tempHTML = 
        `<tr metadata="'${timestamps[i]}':${encodedData}">
            <td>${timestamps[i]}</td>
            <td>${dataArray[i].P}</td>
            <td>${dataArray[i].I}</td>
            <td>${dataArray[i].D}</td>
            <td>${dataArray[i].baseSpeed}</td>
            <td>${dataArray[i].maxLeftSpeed}</td>
            <td>${dataArray[i].maxRightSpeed}</td>
            <td>${dataArray[i].turningSpeed}</td>
            <td>${dataArray[i].hardBreakTime}</td>
            <td>${dataArray[i].hardBreakMagnitude}</td>
            <td>${dataArray[i].blackStopDuration}</td>
        </tr>`;
        fullHTML += tempHTML;
    }
    historyTableBody.innerHTML = fullHTML;
});

// get the metadat of a clicked row and send it to mainWindow
historyTableBody.addEventListener('click', (event) => {
    let target = event.target;
    while (target && target.nodeName !== 'TR') {
        target = target.parentElement;
    }
    if (target) {
        let metadata = target.getAttribute('metadata');
        metadata = metadata.replace(/&quot;/g, '"').replace(/'/g, '"'); // decode the metadata and replace ' characters with "
        metadata = `{${metadata}}`;// add { } around the metadata to make it a valid JSON object
        metadata = JSON.parse(metadata); // decode the metadata
        console.log("Selected history metadata:", metadata);

        const firstKey = Object.keys(metadata)[0];

        // set the mainWindow inputs to the selected history data
        max_left_input.value = metadata[firstKey].maxLeftSpeed;
        max_right_input.value = metadata[firstKey].maxRightSpeed;
        base_speed_input.value = metadata[firstKey].baseSpeed;
        black_stop_duration_input.value = metadata[firstKey].blackStopDuration;
        hard_break_time_input.value = metadata[firstKey].hardBreakTime;
        hard_break_speed_input.value = metadata[firstKey].hardBreakMagnitude;
        turning_speed_input.value = metadata[firstKey].turningSpeed;
        p_value_input.value = metadata[firstKey].P;
        i_value_input.value = metadata[firstKey].I;
        d_value_input.value = metadata[firstKey].D;
        p_slider.value = (p_value_input.value)*Pdivider;
        i_slider.value = (i_value_input.value)*Idivider;
        d_slider.value = (d_value_input.value)*Ddivider;
        max_p_impact_input.value  = parseInt(((p_value_input.value))*maxError);
        max_i_impact_input.value  = parseInt(((i_value_input.value))*maxError);
        max_d_impact_input.value  = parseInt(((d_value_input.value))*maxError);

        openORcloseWindow(document.querySelector('.historyWindow'), false);
    }
});