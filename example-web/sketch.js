var currentWindow;
const requestURL = "/request";
const ipReq = "/getIPs"
var localIP = "";
var publicIP = "";
var qrPublic = null;
var qrLocal = null;
var qrLocalDiv;
var qrPublicDiv;


function setup() {
    createCanvas(windowWidth, windowHeight);
    currentWindow = window.location;
    let destinationURL = window.location.origin + ipReq;
    webRequest(destinationURL, "POST", {}, {}, getIPCallback);

    qrLocalDiv = createDiv();
    qrPublicDiv = createDiv();
}

function draw() {
    if (localIP != "" && qrLocal == null) {
        qrLocal = new QRCode(qrLocalDiv, {
            text: localIP,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff"
        });
    }

    if (publicIP != "" && qrPublic == null) {
        qrPublic = new QRCode(qrPublicDiv, {
            text: publicIP,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff"
        });
    }

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