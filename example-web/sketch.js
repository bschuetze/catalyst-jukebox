var currentWindow;
const requestURL = "/request";
const ipReq = "/getIPs"
var localIP = "";
var publicIP = "";


function setup() {
    createCanvas(windowWidth, windowHeight);
    currentWindow = window.location;
    console.log(currentWindow);
    let destinationURL = window.location.origin + ipReq;
    webRequest(destinationURL, "POST", {}, {}, getIPCallback);
}

function draw() {
    fill(255, 0, 0);
    rect(100, 100, 100, 200);
}

function getIPCallback(data) {
    console.log(data);
    localIP = data["localip"];
    publicIP = data["publicip"];
    console.log("Local IP: " + localIP);
    console.log("Public IP: " + publicIP);
}