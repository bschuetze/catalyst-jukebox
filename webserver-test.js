// Webserver test, initial code will be used from: 
// https://www.w3schools.com/nodejs/nodejs_raspberrypi_webserver_websocket.asp

var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var url = require('url');
var path = require('path');
// Validation
// const { body,validationResult } = require('express-validator/check');
// const { sanitizeBody } = require('express-validator/filter');

// Auth variables
var authorizeURL;
var clientID; // Located at: https://developer.spotify.com/dashboard/applications/
var redirectURI;
var scope;
var responseType;

// function spotifyAuth() {



//     if (clientID == "") {
//         console.log("Client ID is required");
//     } else {
//         console.log(authorizeURL + "?" + clientID + "&response_type=" + responseType + "&" + redirectURI + "&" + scope);
//         fetch(authorizeURL + "?" + clientID + "&response_type=code&" + redirectURI + "&" + scope, {
//             // headers: { "Content-Type": "application/json; charset=utf-8"},
//             method: "GET"
//             // body: JSON.stringify({
//             //     username: 'Elon Musk',
//             //     email: 'elonmusk@gmail.com',
//             // })
//         })
//         // .then(response => response.json())
//         // .then(data => console.log(data));
//     }
// }

http.listen(6474); //listen to port 6474

function handler(req, res) { //create server (request, response)
    console.log(req.headers);

    // Get the location of the request
    var loc = url.parse(req.url, true);

    // Check if POST request
    if (req.method == "POST") {
        if (loc.pathname == "/submitClientID") {
            console.log(req.body);
        }
    }

    // View a page
    if (req.method == "GET") {
        if (loc.pathname == "/") {
            // index page
            var filename = "." + "/example-web/" + "index.html";
        } else if (loc.pathname == "/login") {
            var filename = "." + "/example-web/" + "login.html";
        // } else if (loc.pathname == "/login") {
        } else {
            var filename = "." + "/example-web/" + loc.pathname;
        }
    }

    // Content type
    var type;
    switch (path.extname(filename)) {
        case ".html":
            type = "text/html";
            break;
        case ".js":
            type = "text/javascript";
            break;
        case ".jpg":
            type = "image/jpg";
            break;
        case ".png":
            type = "image/png";
            break;
        case ".json":
            type = "application/json";
            break;
    }

    // fs.readFile(__dirname + '/example-web/index.html', function (err, data) { //read file index.html in public folder
    fs.readFile(filename, function (err, data) { //read file index.html in public folder
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' }); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': type }); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}