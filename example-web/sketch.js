var token;
var authorized;
var authorizeURL;
var clientID; // Located at: https://developer.spotify.com/dashboard/applications/
var redirectURI;
var scope;
var currentWindow;

// Parse URL, if no info present then present with link to click to get validation credentials

function setup() {
    createCanvas(windowWidth, windowHeight);
    // any additional setup code goes here
    authorized = false;
    authorizeURL = "https://accounts.spotify.com/authorize";
    clientID = "";
    redirectURI = "redirect_uri=http://127.0.0.1:5500/example-web/";
    scope = "scope=user-modify-playback-state playlist-read-private user-read-recently-played user-read-currently-playing";
    currentWindow = window.location;
    console.log(currentWindow);
}

function draw() {
    fill(255, 0, 0);
    rect(100, 100, 100, 200);
}

function updateClientID(cid) {
    clientID = "client_id=" + cid;
}

function mouseClicked() {
    if (!authorized) {
        console.log(authorizeURL + "?" + clientID + "&response_type=code&" + redirectURI + "&" + scope)
        fetch(authorizeURL + "?" + clientID + "&response_type=code&" + redirectURI + "&" + scope, {
            // headers: { "Content-Type": "application/json; charset=utf-8"},
            method: "GET"
            // body: JSON.stringify({
            //     username: 'Elon Musk',
            //     email: 'elonmusk@gmail.com',
            // })
        })
        // .then(response => response.json())
        // .then(data => console.log(data));
    } else {
        fetch("https://api.spotify.com/v1/me/player/recently-played", {
            headers: { "Content-Type": "application/json; charset=utf-8",
                       "Authorization": token},
            method: "GET"
            // body: JSON.stringify({
            //     username: 'Elon Musk',
            //     email: 'elonmusk@gmail.com',
            // })
        })
        .then(response => response.json())
        .then(data => console.log(data));
    }
    // Get all users
    // fetch("https://api.spotify.com/v1/me/player/recently-played")
    //     .then(response => response.json())
    //     .then(data => console.log(data));
}
