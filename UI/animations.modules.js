// function to show any message to the user
export function showMessageUI(container_dv, message_div, textToShow, type){
    if(type == "error"){
        message_div.style.backgroundColor ="rgb(255, 12, 65)";
        message_div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>'+textToShow;
    } else if (type == "normal") {
        message_div.style.backgroundColor = "#5893ff";
        message_div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>'+textToShow;
    }
    container_dv.style.top = "10px";
    setTimeout(() => {
        container_dv.style.top = "-70px";
    }, 2000);
}

let timerInterval;
// mode = 0: start, mode = 1: stop, mode = 2: reset
export function timerControl(timer_div, mode) {
    if (mode === 0) {
        timer_div.style.border = "2px solid #5893ff";
        const startTime = performance.now();
        function updateTimer() {
            const elapsedTime = performance.now() - startTime;
            const milliseconds = Math.floor(elapsedTime % 1000).toString().padStart(3, '0');
            const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, '0');
            const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60).toString().padStart(2, '0');
            timer_div.innerHTML = `${minutes}:${seconds}:${milliseconds}`;
            timerInterval = requestAnimationFrame(updateTimer);
        }
        timerInterval = requestAnimationFrame(updateTimer);
    } else if (mode === 1) {
        timer_div.style.border = "none";
        cancelAnimationFrame(timerInterval);
    } else if (mode === 2) {
        cancelAnimationFrame(timerInterval);
        timer_div.innerHTML = "00:00:000";
    }
}