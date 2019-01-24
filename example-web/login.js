var input;
var button;

function setup() {
    createCanvas(windowWidth, windowHeight);

    background(230);

    // Text input
    input = createElement("textarea");
    input.size(width * 0.8, height * 0.3);
    input.position(width * 0.1, height * 0.3);
    input.style("font-size: 24px; padding: 10px");

    // Button
    button = createButton("Submit");
    button.size(input.width, height * 0.15);
    button.position(input.x, height * 0.7);
    button.style("border: none; background-color: #1ED761; color: black; font-size: 10vmin; font-family: Verdana, Arial");
    button.mouseClicked(buttonPress);
    button.mouseOver(buttonHover);
    button.mouseOut(buttonOut);
    button.mousePressed(buttonDown);
    button.mouseReleased(buttonUp);

    // Text
    textSize(width * 0.070);
    textAlign(CENTER);
    text("Enter Spotify Client ID", input.x, height * 0.15, input.width, max(height * 0.15, width * 0.080));
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
    let clientIDInput = input.value();
    console.log("Raw Client ID: " + clientIDInput);
    let sanitizedInput = sanitizeAlphaNumeric(clientIDInput);
    console.log("Sanitized ID: " + sanitizedInput);
    
    // Make HTTP request to server with info
    let destinationURL = window.location.origin + "/submitClientID";
    fetch(destinationURL, {
        headers: { "Content-Type": "application/json"},
        method: "POST",
        body: JSON.stringify({
            cid: sanitizedInput
        })
    })
}

function sanitizeAlphaNumeric(str) {
    let sanitizedString = "";
    for (let i = 0; i < str.length; i++) {
        if (isAlphaNumeric(str[i])) {
            sanitizedString = sanitizedString + str[i];
        }
    }
    return sanitizedString;
}

function isAlphaNumeric(char) {
    if (char == null) {
        // Null value is not a character
        return false;
    }
    if (char.length != 1) {
        // Not a single character string
        return false;
    }
    if (char.match(/[A-Z]/ig) != null) {
        // i -> ignore case, g -> global
        // Method: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
        // Character is in the alphabet
        return true;
    }
    if (char.match(/[0-9]/g) != null) {
        // Character is a number
        return true;
    }
    // Not character or number so false
    return false;
}

function buttonDown() {
    button.style("color: #333333");
}

function buttonUp() {
    button.style("color: black");
}