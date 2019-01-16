var token;
var authorized;
var authorizeURL;
var clientID; // Located at: https://developer.spotify.com/dashboard/applications/
var redirectURI;
var scope;
var currentWindow;
var responseType;
var userID;

// Helpful links: 
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

// Parse URL, if no info present then present with link to click to get validation credentials

function setup() {
    createCanvas(windowWidth, windowHeight);
    // any additional setup code goes here
    authorized = false;
    authorizeURL = "https://accounts.spotify.com/authorize";
    clientID = "";
    userID = "me";
    // Response type varies based on what you want to use
    // Implicit Grant Flow = token
    // Authorization Code Flow = code
    // more info: https://developer.spotify.com/documentation/general/guides/authorization-guide/
    responseType = "token";
    // redirectURI = "redirect_uri=http://127.0.0.1:5500/example-web/";
    redirectURI = "redirect_uri=http://192.168.0.5:6474/";
    scope = "scope=user-read-playback-state user-modify-playback-state playlist-read-private user-read-recently-played user-read-currently-playing";
    currentWindow = window.location;
    console.log(currentWindow);
    if (currentWindow.search.substr(1, 4) == "code") {
        // Authentication has taken place
        authorized = true;
        console.log("Authorized - code");
    } else if (currentWindow.hash.substr(1, 12) == "access_token") {
        authorized = true;
        console.log("Authorized - token");
        // Access token has the form #access_token=XXXXXX&token_type=Bearer&expires_in=3600
        let authResponse = currentWindow.hash.split("&");
        console.log(authResponse);
        console.log(authResponse[0]);
        let tempToken = authResponse[0].split("=");
        // token = "Bearer " + authResponse[0];
        token = "Bearer " + tempToken[1];
        console.log(token);
    } else {
        authorized = false;
    }

    if (!authorized) {
        // get current url for redirecting
        redirectURI = "redirect_uri=";
        redirectURI = redirectURI + currentWindow.protocol + "//" + currentWindow.hostname + ":" + currentWindow.port + "/";
        console.log(redirectURI);
    }
}

function draw() {
    fill(255, 0, 0);
    rect(100, 100, 100, 200);
}

function updateClientID(cid) {
    clientID = "client_id=" + cid;
}

function updateUserID(uid) {
    userID = uid;
}

function mouseClicked() {
    if (!authorized) {
        console.log(authorizeURL + "?" + clientID + "&response_type=" + responseType + "&" + redirectURI + "&" + scope);
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
        // Currently this will only work if authorized with a token, there are more steps if wanting 
        // to use a code based auth
        // fetch("https://api.spotify.com/v1/" + userID + "/player/currently-playing", {
        //     headers: { "Content-Type": "application/json",
        //                "Authorization": token},
        //     method: "GET"
        //     // body: JSON.stringify({
        //     //     username: 'Elon Musk',
        //     //     email: 'elonmusk@gmail.com',
        //     // })
        // })
        // .then(response => response.json())
        // .then(data => console.log(data));
        spotifyPlayerRequest("GET", "currently-playing", {"Content-Type": "application/json"}, currentlyPlaying);
        spotifyPlayerRequest("PUT", "pause", { "Content-Type": "application/json", "Accept": "application/ json" });
        // spotifyPlayerRequest("PUT", "play", { "Content-Type": "application/json", "Accept": "application/ json"});
    }
    // Get all users
    // fetch("https://api.spotify.com/v1/me/player/recently-played")
    //     .then(response => response.json())
    //     .then(data => console.log(data));
}

function currentlyPlaying(data) {
    console.log("Current Song:");
    console.log(data);
}

function logData(data) {
    console.log("Logging Data:");
    console.log(data);
}

function spotifyPlayerRequest(reqMethod, reqFunc, reqHeader, respFunc) {
    let completeHeader = reqHeader;
    completeHeader["Authorization"] = token;
    console.log(completeHeader);
    // {
    //     "Content-Type": "application/json",
    //         "Authorization": token
    // }
    fetch("https://api.spotify.com/v1/" + userID + "/player/" + reqFunc, {
        headers: completeHeader,
        method: reqMethod
        // body: JSON.stringify({
        //     username: 'Elon Musk',
        //     email: 'elonmusk@gmail.com',
        // })
    }).then(response => {
        // Response method originally found from here: https://stackoverflow.com/questions/37121301/how-to-check-if-the-response-of-a-fetch-is-a-json-object-in-javascript
        let contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(data => {
                // process your JSON data further
                console.log("JSON Response");
                if (data.hasOwnProperty("error")) {
                    requestError(data);
                }
                if (respFunc !== undefined) {
                    respFunc(data);
                } else {
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
    }); // end response method



        // .then(response => {if (true) {response.json()}})
        // .then(data => console.log(data));
}

// There was an error with the request, handle it here
function requestError(data) {
    console.log("ERROR");
    if (data["error"].hasOwnProperty("status")) {
        console.log("  status: " + data["error"]["status"]);
        if (data["error"]["status"] == 401) {
            authorized = false;
        }
    }
    if (data["error"].hasOwnProperty("message")) {
        console.log("  message: " + data["error"]["message"]);
    }
}