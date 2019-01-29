var trackURI;
var button;
const songLimit = 3;

function setup() {
    createCanvas(windowWidth, windowHeight);

    background(230);

    // Text input
    trackURI = createElement("textarea");
    trackURI.elt.placeholder = "Enter up to " + songLimit + " track URIs (space separated)";
    trackURI.size(width * 0.8, height * 0.3);
    trackURI.position(width * 0.1, height * 0.3);
    trackURI.style("font-size: 24px; padding: 10px");

    // Button
    button = createButton("Submit");
    button.size(trackURI.width, height * 0.15);
    button.position(trackURI.x, height * 0.7);
    button.style("border: none; background-color: #1ED761; color: black; font-size: 10vmin; font-family: Verdana, Arial");
    button.mouseClicked(buttonPress);
    button.mouseOver(buttonHover);
    button.mouseOut(buttonOut);
    button.mousePressed(buttonDown);
    button.mouseReleased(buttonUp);

    // Text
    textSize(width * 0.060);
    textAlign(CENTER);
    text("Request Jukebox Songs", trackURI.x, height * 0.15, trackURI.width, max(height * 0.15, width * 0.080));
}

function draw() {
    noLoop();
}

function buttonHover() {
    button.style("background-color: #16bf54");
}

function buttonOut() {
    button.style("background-color: #1ED761");
}

function buttonPress() {



    let clientIDInput = trackURI.value();
    let clientSecretInput = secretInput.value();

    let sanitizedClientID = sanitizeAlphaNumeric(clientIDInput);
    let sanitizedClientSecret = sanitizeAlphaNumeric(clientSecretInput);

    if (sanitizedClientID.length == 0) {
        console.log("Client ID cannot be empty");
        return;
    }

    if (sanitizedClientSecret.length == 0) {
        console.log("Client Secret cannot be empty");
        return;
    }

    // Make HTTP request to server with info
    let destinationURL = window.location.origin + "/submitClientID";
    webRequest(destinationURL, "POST", { "Content-Type": "application/json" }, { cid: sanitizedClientID, secret: sanitizedClientSecret }, authRedirect);
}

function checkAuthURL(url) {
    // url should be window.location object
    if (url == null) {
        console.log("Null URL passed to auth check function, aborting");
        return;
    }
    if (url.search.substr(1, 4) == "code") {
        // Code auth present in URL, pass data to server.
        console.log("Code auth data present in URL, passing to server");
        let destinationURL = window.location.origin + "/submitCode";
        let body = parseCode(url.search);
        webRequest(destinationURL, "POST", { "Content-Type": "application/json" }, body);
    }
}

function parseCode(search) {
    // Search has the form "?code=jkxd&state=lksdgjh"
    let temp = search.split("&");
    let c = "";
    let s = "";
    if (temp[0].substr(0, 1) == "?") {
        // Remove ?code= from the search input
        c = temp[0].substr(6);
        console.log(c); // REMOVE TESTING
    }
    if (temp.length > 1) {
        // Remove state= from search input
        s = temp[1].substr(6);
        console.log(s); // REMOVE TESTING
    }
    return { code: c, state: s };
}

function authRedirect(link) {
    if (link == null || !link.hasOwnProperty("Auth-URL")) {
        console.log("Link not provided");
        return;
    }
    console.log("" + link["Auth-URL"])
    window.location.href = "" + link["Auth-URL"];
}

function buttonDown() {
    button.style("color: #333333");
}

function buttonUp() {
    button.style("color: black");
}