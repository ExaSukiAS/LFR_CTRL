import { maxError } from './windows/mainWindow.js'

// DOM elements
const p_value_input = document.querySelector('.p_value');
const i_value_input = document.querySelector('.i_value');
const d_value_input = document.querySelector('.d_value');
const motor_speed_value_input = document.querySelector('.percentage_value');
const p_slider = document.querySelector('.p_slider');
const i_slider = document.querySelector('.i_slider');
const d_slider = document.querySelector('.d_slider');
const max_p_impact_input = document.querySelector('.p_impact');
const max_i_impact_input = document.querySelector('.i_impact');
const max_d_impact_input = document.querySelector('.d_impact');
const speed_slider = document.querySelector('.speed_slider');

// dividers for the P, I and D constants
export const Pdivider = 6000;
export const Idivider = 6000;
export const Ddivider = 3000;

// Act on the change of P, I and D sliders' value
p_slider.oninput = function() {
    p_value_input.value = (p_slider.value)/Pdivider;
    max_p_impact_input.value = parseInt(((p_slider.value)/Pdivider)*maxError);
}
i_slider.oninput = function() {
    i_value_input.value = (i_slider.value)/Idivider;
    max_i_impact_input.value  = parseInt(((i_slider.value)/Idivider)*maxError);
}
d_slider.oninput = function() {
    d_value_input.value = (d_slider.value)/Ddivider;
    max_d_impact_input.value  = parseInt(((d_slider.value)/Ddivider)*maxError);
}
// Act on the change of P, I and D input fields' value
p_value_input.oninput = function() {
    p_slider.value = (p_value_input.value)*Pdivider;
    max_p_impact_input.value  = parseInt(((p_value_input.value))*maxError);
}
i_value_input.oninput = function() {
    i_slider.value = (i_value_input.value)*Idivider;
    max_i_impact_input.value  = parseInt(((i_value_input.value))*maxError);
}
d_value_input.oninput = function() {
    d_slider.value = (d_value_input.value)*Ddivider;
    max_d_impact_input.value  = parseInt(((d_value_input.value))*maxError);
}
//  Act on teh change of P, I, D max impact input fields' value
max_p_impact_input.oninput = function() {
    p_value_input.value = (max_p_impact_input.value)/(maxError);
    p_slider.value = (p_value_input.value)*Pdivider;
}
max_i_impact_input.oninput = function() {
    i_value_input.value = (max_i_impact_input.value)/(maxError);
    i_slider.value = (i_value_input.value)*Idivider;
}
max_d_impact_input.oninput = function() {
    d_value_input.value = (max_d_impact_input.value)/(maxError);
    d_slider.value = (d_value_input.value)*Ddivider;
}

// Act on the change of speed slider's value in control mode
speed_slider.oninput = function() {
    motor_speed_value_input.value = speed_slider.value;
}
// Act on the change of speed input field's value in control mode
motor_speed_value_input.oninput = function() {
    speed_slider.value = motor_speed_value_input.value;
}