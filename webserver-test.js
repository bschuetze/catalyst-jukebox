// Webserver test, initial code will be used from: 
// https://www.w3schools.com/nodejs/nodejs_raspberrypi_webserver_websocket.asp

var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var url = require('url');
var path = require('path');
var ip = require('ip');
var crypto = require('crypto');
var qs = require('querystring');

// Server variables
var port = 6474;

// Auth variables
const authorizeURL = "https://accounts.spotify.com/authorize";
var clientID = ""; // Located at: https://developer.spotify.com/dashboard/applications/
var clientSecret = "";
var authCode = "";
var redirectURI = "redirect_uri=http://" + ip.address() + ":" + port + "/login";
var scope = "scope=user-read-playback-state user-modify-playback-state playlist-read-private user-read-recently-played user-read-currently-playing";
var responseType = "code";
const state = "state=" + crypto.randomBytes(8).toString("hex"); // Generate random 16 char hex string
console.log("state: " + state); // REMOVE AFTER TESTING
// Above line found here: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript/8084248#8084248
// Load client id and secret 
fs.readFile("client-data.txt", "utf8", function (error, data) {
    if (error) {
        console.log("Unable to read from client data file");
    } else {
        let split = data.split(";");
        if (split.length == 2) {
            clientID = split[0];
            clientSecret = split[1];
            console.log("Loaded client data");
        } else {
            console.log("Incorrect amount of data present, expected 2 but got " + split.length)
        }
    }
});

fs.readFile("auth-code.txt", "utf8", function (error, data) {
    if (error) {
        console.log("Unable to read from auth code file");
    } else {
        if (data != null && data.length > 0) {
            authCode = data;
            console.log("Loaded authorization code");
        } else {
            console.log("Code data not present in file");
        }
    }
});

// function spotifyAuth() {

//     if (clientID == "") {
//         console.log("Client ID is required");
//     } else {
//         console.log(authorizeURL + "?" + clientID + "&response_type=" + responseType + "&" + redirectURI + "&" + scope + "&" + state);
//         fetch(toWebLink(authorizeURL + "?" + clientID + "&response_type=code&" + redirectURI + "&" + scope + "&" + state), {
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



http.listen(port); //listen to port 6474
console.log("NodeJS server at '" + ip.address() + "' listening on port '" + port + "'");

function handler(req, res) { //create server (request, response)
    console.log(req.headers);

    // Get the location of the request
    var loc = url.parse(req.url, true);

    // Check if POST request
    if (req.method == "POST") {
        console.log("POST Request");
        if (loc.pathname == "/submitClientID") {
            if (req.headers.origin == "http://" + ip.address() + ":6474") {
                // Update client ID
                // Code originally from: https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
                // BEGIN SNIPPET
                let body = "";
                let bodyJSON = {};
                req.on('data', function (data) {
                    if (body.length > 1e6) {
                        // Request is coming with large amounts of data, not a good idea to continue to parse it
                        request.connection.destroy();
                    }
                    body += data;
                }); // END SNIPPET
                req.on("end", function () {
                    console.log("Parsed body result:");
                    console.log(body);
                    // console.log(typeof body);
                    bodyJSON = JSON.parse(body);

                    if (!bodyJSON.hasOwnProperty("cid")) {
                        console.log("Client ID field not found in JSON data");
                        res.writeHead(400, { 'Content-Type': 'text/html' }); //display 404 on error
                        return res.end("No Client ID found in data");
                    }

                    if (!bodyJSON.hasOwnProperty("secret")) {
                        console.log("Client Secret field not found in JSON data");
                        res.writeHead(400, { 'Content-Type': 'text/html' }); //display 404 on error
                        return res.end("No Client Secret found in data");
                    }

                    // Save values
                    let tempcid = bodyJSON["cid"];
                    let tempsecret = bodyJSON["secret"];
                    fs.writeFile("client-data.txt", tempcid + ";" + tempsecret, function (error) {
                        if (error) {
                            console.log("ERROR, client file not written");
                        } else {
                            console.log("Successfully written Client details");
                        }
                    });

                    clientID = bodyJSON["cid"];
                    
                    let retURL = "" + toWebLink(authorizeURL + "?client_id=" + clientID + "&response_type=code&" + redirectURI + "&" + scope + "&" + state);
                    console.log(retURL);
                    // Return auth URL
                    res.writeHead(200, { "Content-Type": "application/json" }); //write HTML
                    res.write("{\"Auth-URL\": \"" + retURL + "\"}");
                    return res.end();

                })
            } else {
                console.log("ClientID request does not match expected source");
                res.writeHead(401, { 'Content-Type': 'text/html' }); //display 404 on error
                return res.end("Unauthorized Origin");
            }
        } else if (loc.pathname == "/submitCode") {
            if (req.headers.origin == "http://" + ip.address() + ":6474") {
                // Code received
                // Code originally from: https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
                // BEGIN SNIPPET
                let body = "";
                let bodyJSON = {};
                req.on('data', function (data) {
                    if (body.length > 1e6) {
                        // Request is coming with large amounts of data, not a good idea to continue to parse it
                        request.connection.destroy();
                    }
                    body += data;
                }); // // END SNIPPET
                req.on("end", function () {
                    console.log("Parsed body result:");
                    console.log(body);
                    // console.log(typeof body);
                    bodyJSON = JSON.parse(body);
                    if (bodyJSON.hasOwnProperty("code")) {
                        // code exists in the response
                        if (bodyJSON.hasOwnProperty("state")) {
                            if ("state=" + bodyJSON["state"] == state) {
                                authCode = bodyJSON["code"];
                                fs.writeFile("auth-code.txt", authCode, function (error) {
                                    if (error) {
                                        console.log("ERROR, auth code file not written");
                                    } else {
                                        console.log("Successfully written auth details");
                                    }
                                });
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                return res.end("Okay");
                            } else {
                                console.log("Incorrect 'state' field found in JSON data, expected:\n" + 
                                            state + "\nbut found:\m" + "state=" + bodyJSON["state"]);
                                res.writeHead(400, { 'Content-Type': 'text/html' }); //display 404 on error
                                return res.end("Incorrect state provided");
                            }
                        } else {
                            console.log("No 'state' field found in JSON data");
                            res.writeHead(400, { 'Content-Type': 'text/html' }); //display 404 on error
                            return res.end("No state provided");
                        }
                    } else {
                        console.log("No 'code' field found in JSON data");
                        res.writeHead(400, { 'Content-Type': 'text/html' }); //display 404 on error
                        return res.end("No code provided");
                    }
                })
            } else {
                console.log("Code submission request does not match expected source");
                res.writeHead(401, { 'Content-Type': 'text/html' }); //display 404 on error
                return res.end("Unauthorized Origin");
            }
        }
        else {
            return res.end();
        }
    }

    // View a page
    var filename;
    if (loc.pathname == "/") {
        // index page
        filename = "." + "/example-web/" + "index.html";
    } else if (loc.pathname == "/login") {
        filename = "." + "/example-web/" + "login.html";
    // } else if (loc.pathname == "/login") {
    } else {
        filename = "." + "/example-web/" + loc.pathname;
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
        res.write(data); //write data from page
        return res.end();
    });
}

function toWebLink(link) {
    let subLink = link.split(" ");
    let newLink = subLink[0];
    for (let i = 1; i < subLink.length; i++) {
        newLink = newLink + "%20" + subLink[i];
    }
    return newLink;
}