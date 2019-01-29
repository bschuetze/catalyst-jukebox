var cidInput;
var secretInput;
var button;

function setup() {
    createCanvas(windowWidth, windowHeight);

    background(230);

    // Text input
    cidInput = createElement("textarea");
    cidInput.elt.placeholder = "Enter your Client ID";
    cidInput.size(width * 0.8, height * 0.1);
    cidInput.position(width * 0.1, height * 0.3);
    cidInput.style("font-size: 24px; padding: 10px");

    // Text input
    secretInput = createElement("textarea");
    secretInput.elt.placeholder = "Enter your Client Secret";
    secretInput.size(width * 0.8, height * 0.1);
    secretInput.position(width * 0.1, (height * 0.3) + height * 0.2);
    secretInput.style("font-size: 24px; padding: 10px");

    // Button
    button = createButton("Submit");
    button.size(cidInput.width, height * 0.15);
    button.position(cidInput.x, height * 0.7);
    button.style("border: none; background-color: #1ED761; color: black; font-size: 10vmin; font-family: Verdana, Arial");
    button.mouseClicked(buttonPress);
    button.mouseOver(buttonHover);
    button.mouseOut(buttonOut);
    button.mousePressed(buttonDown);
    button.mouseReleased(buttonUp);

    // Text
    textSize(width * 0.060);
    textAlign(CENTER);
    text("Enter Spotify Client Details", cidInput.x, height * 0.15, cidInput.width, max(height * 0.15, width * 0.080));
}

function draw() {
    checkAuthURL(window.location);
    noLoop();
}

function buttonHover() {
    button.style("background-color: #16bf54");
}

function buttonOut() {
    button.style("background-color: #1ED761");
}

function buttonPress() {
    let clientIDInput = cidInput.value();
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
    webRequest(destinationURL, "POST", {"Content-Type": "application/json"}, {cid: sanitizedClientID, secret: sanitizedClientSecret}, authRedirect);
    // fetch(destinationURL, {
    //     headers: { "Content-Type": "application/json"},
    //     method: "POST",
    //     body: JSON.stringify({
    //         cid: sanitizedClientID
    //     })
    // })
    // .then(response => webResponse(response, authRedirect));
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

function emptyObject(o) {
    if (o == null) {
        // If null value is present then no object
        return true;
    }
    if (o.constructor == Object && Object.entries(o).length == 0) {
        // If is of type object and has no entries
        return true;
    }
    return false;
}

// Assumes body will be JSON format or string
function webRequest(dest, method, header, body, respFunc) {
    let opts = {};

    // Add method if present
    if (method != null && method.length > 0) {
        opts["method"] = method;
    }

    // Add header if present
    if (!emptyObject(header)) {
        opts["headers"] = header;
    }

    // Add body if present
    if (!emptyObject(body)) {
        if (typeof body == "object") {
            // JSON format
            opts["body"] = JSON.stringify(body);
        }
        if (typeof body == "string") {
            opts["body"] = body;
        }
    }

    fetch(dest, opts).then(response => util.webResponse(response, respFunc));

    // fetch(dest, {
    //     headers: { "Content-Type": "application/json" },
    //     method: "POST",
    //     body: JSON.stringify({
    //         cid: sanitizedClientID
    //     })
    // }).then(response => webResponse(response, authRedirect));
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
    return {code: c, state: s};
}

function authRedirect(link) {
    if (link == null || !link.hasOwnProperty("Auth-URL")) {
        console.log("Link not provided");
        return;
    }
    console.log("" + link["Auth-URL"])
    window.location.href = "" + link["Auth-URL"];
}

function webResponse(response, respFunc) {
    // Response method originally found from here: https://stackoverflow.com/questions/37121301/how-to-check-if-the-response-of-a-fetch-is-a-json-object-in-javascript
    let contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        console.log("JSON Response");
        // console.log(response);
        return response.json().then(data => {
            // process your JSON data further
            if (respFunc !== undefined) {
                respFunc(data);
            } else {
                console.log("Data:")
                console.log(data);
            }
        });
    } else {
        return response.text().then(text => {
            // this is text, do something with it
            console.log("Other Response");
            // console.log("Content: " + text + "\nResponse header: " + response.headers.get("content-type"));
            // console.log(response.headers);
            if (respFunc !== undefined) {
                respFunc(text);
            } else {
                console.log(text);
            }
        });
    }
}

function buttonDown() {
    button.style("color: #333333");
}

function buttonUp() {
    button.style("color: black");
}