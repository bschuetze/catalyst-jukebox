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


function setup() {
    createCanvas(windowWidth, windowHeight);
    currentWindow = window.location;
    let destinationURL = window.location.origin + ipReq;
    webRequest(destinationURL, "POST", {}, {}, getIPCallback);

    // qrLocalDiv = createDiv();
    // qrPublicDiv = createDiv();
}

function draw() {
    if (localIP != "" && qrLocal == null) {
        // qrLocal = new QRCode(qrLocalDiv, {
        //     text: localIP,
        //     width: 128,
        //     height: 128,
        //     colorDark: "#000000",
        //     colorLight: "#ffffff"
        // });
        qrLocal = createImage(qrAPI + "?data=http://" + localIP + requestURL + "&size=" + qrSize);
    } else {
        image(qrLocal, 0, 0);
    }

    if (publicIP != "" && qrPublic == null) {
        // qrPublic = new QRCode(qrPublicDiv, {
        //     text: publicIP,
        //     width: 128,
        //     height: 128,
        //     colorDark: "#000000",
        //     colorLight: "#ffffff"
        // });
        qrPublic = createImage(qrAPI + "?data=http://" + publicIP + requestURL + "&size=" + qrSize);
    } else {
        image(qrPublic, 300, 0);
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