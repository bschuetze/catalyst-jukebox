var currentWindow;
const requestURL = "/request";


function setup() {
    createCanvas(windowWidth, windowHeight);
    currentWindow = window.location;
    console.log(currentWindow);
    
}

function draw() {
    fill(255, 0, 0);
    rect(100, 100, 100, 200);
}