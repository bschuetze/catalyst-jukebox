var token;
var authorized;
var authorizeURL;

function setup() {
    createCanvas(windowWidth, windowHeight);
    // any additional setup code goes here
    authorized = false;
}

function draw() {
    fill(255, 0, 0);
    rect(100, 100, 100, 200);
}

function mouseClicked() {
    if (!authorized) {
        fetch("https://accounts.spotify.com/authorize", {
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
