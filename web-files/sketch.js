var currentWindow;
const requestURL = "/request";
const ipReq = "/getIPs"
var localIP = "";
var publicIP = "";
var qrPublic = null;
var qrLocal = null;
// var qrLocalDiv;
// var qrPublicDiv;

const qrAPI = "http://api.qrserver.com/v1/create-qr-code/"
// ?data=text&size=0x0"
const qrSize = "256x256";

var qrLocalLoaded;
var qrPublicLoaded;


function setup() {
    createCanvas(windowWidth, windowHeight);
    currentWindow = window.location;
    let destinationURL = window.location.origin + ipReq;
    webRequest(destinationURL, "POST", {}, {}, getIPCallback);

    // qrLocalDiv = createDiv();
    // qrPublicDiv = createDiv();
    qrLocalLoaded = false;
    qrPublicLoaded = false;
}

function draw() {
    background(255);

    if (localIP != "" && qrLocal == null) {
        // qrLocal = new QRCode(qrLocalDiv, {
        //     text: localIP,
        //     width: 128,
        //     height: 128,
        //     colorDark: "#000000",
        //     colorLight: "#ffffff"
        // });
        // let dest = qrAPI + "?data=http://" + localIP + requestURL + "&size=" + qrSize;
        // qrLocal = loadImage(qrAPI + "?data=http://" + localIP + requestURL + "&size=" + qrSize, function() {
        //     qrLocalLoaded = true;
        // });
        qrLocal = loadImage("assets/local-qr.png", function() {
            qrLocalLoaded = true;
        });
        // webRequest(dest, "POST", {"mode": "no-cors"}, {});
    } 
    if (qrLocalLoaded) {
        image(qrLocal, width * 0.1, height * 0.1, width * 0.3, width * 0.3);
    }

    if (publicIP != "" && qrPublic == null) {
        // qrPublic = new QRCode(qrPublicDiv, {
        //     text: publicIP,
        //     width: 128,
        //     height: 128,
        //     colorDark: "#000000",
        //     colorLight: "#ffffff"
        // });
        // let dest = qrAPI + "?data=http://" + publicIP + requestURL + "&size=" + qrSize;
        // qrPublic = loadImage(qrAPI + "?data=http://" + publicIP + requestURL + "&size=" + qrSize, function() {
        //     qrPublicLoaded = true;
        // });
        qrPublic = loadImage("assets/public-qr.png", function () {
            qrPublicLoaded = true;
        });
        // webRequest(dest, "POST", {"mode": "no-cors" }, {});
    } 
    if (qrPublicLoaded) {
        image(qrPublic, width * 0.6, height * 0.1, width * 0.3, width * 0.3);
    }
}

function getIPCallback(data) {
    console.log(data);
    localIP = data["localip"];
    publicIP = data["publicip"];
    console.log("Local IP: " + localIP);
    console.log("Public IP: " + publicIP);
}