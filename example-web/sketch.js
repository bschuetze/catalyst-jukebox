var currentWindow;
const requestURL = "/request";


function setup() {
    createCanvas(windowWidth, windowHeight);
    currentWindow = window.location;
    console.log(currentWindow);
    let destinationURL = window.location.origin + requestURL;
    webRequest(destinationURL, "POST", {}, {}, getIPCallback);
}

function draw() {
    fill(255, 0, 0);
    rect(100, 100, 100, 200);
}

function getIPCallback(data) {
    console.log(data);
}