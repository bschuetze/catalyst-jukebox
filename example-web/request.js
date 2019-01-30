var trackURI;
var button;
const trackLimit = 3;

function setup() {
    createCanvas(windowWidth, windowHeight);

    background(230);

    // Text input
    trackURI = createElement("textarea");
    trackURI.elt.placeholder = "Enter up to " + trackLimit + " track URIs (space separated)";
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
    let trackInput = trackURI.value();
    let tracks = trackInput.split(" ");


    if (tracks.length == 0) {
        console.log("You haven't entered anything!");
        return;
    }


    // Make HTTP request to server with info
    let destinationURL = window.location.origin + "/submitTrackID";
    let trackJSON = {};
    let correctTracks = [];

    for (let i = 0; i < tracks.length; i++) {
        if (checkSpotifyURI(tracks[i])) {
            correctTracks.push(tracks[i]);
            if (correctTracks.length >= trackLimit) {
                console.log("Max tracks reached");
                break;
            }
        }
    }

    if (correctTracks.length > 0) {
        // make request if track data exists and is valid
        trackJSON["tracks"] = correctTracks;
        webRequest(destinationURL, "POST", { "Content-Type": "application/json" }, trackJSON);
    }
}

// Ensures a track URI is properly formed
function checkSpotifyURI(s) {
    if (s == null || s.length == 0) {
        console.log("Spotify URI must not be empty");
        return false;
    }

    let uri = s.split(":");
    
    if (uri.length != 3) {
        console.log("Spotify URI must consist of 3 parts, 'spotify:track:xxxxxxx'");
        return false;
    }
    if (uri[0] != "spotify") {
        console.log("Spotify URI is malformed");
        return false;
    }
    if (uri[1] != "track") {
        console.log("Request must be a track");
        return false;
    }
    if (uri[2] != sanitizeAlphaNumeric(uri[2])) {
        console.log("Spotify URI track id is malformed");
        return false;
    }

    return true;
}

function buttonDown() {
    button.style("color: #333333");
}

function buttonUp() {
    button.style("color: black");
}