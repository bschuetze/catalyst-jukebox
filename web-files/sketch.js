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
        textSize(28);
        fill(0);
        text("Local (if on same WiFi)", width * 0.07, height * 0.06);
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
        textSize(28);
        fill(0);
        text("Public (if not on same WiFi)", width * 0.55, height * 0.06);
        image(qrPublic, width * 0.6, height * 0.1, width * 0.3, width * 0.3);
    }

    fill("#1ED761");
    stroke(0);
    strokeWeight(3);
    textSize(28);
    text("Catalyst Jukebox", width * 0.07, height * 0.65);
    fill(0);
    strokeWeight(1);
    textSize(20);
    text("- Scan one of the QR codes to visit the request page\n" + 
         "- Paste a list of Spotify song URIs in the box and submit the request\n" +
         "- Connect your phone via USB to the Jukebox\n" + 
         "- Take the indicated Pager\n" +
         "- Leave your phone connected and keep your pager until your songs have played\n" + 
         "- Press the blue button to locate the current songs requester", width * 0.07, height * 0.7);
}

function getIPCallback(data) {
    console.log(data);
    localIP = data["localip"];
    publicIP = data["publicip"];
    console.log("Local IP: " + localIP);
    console.log("Public IP: " + publicIP);
}