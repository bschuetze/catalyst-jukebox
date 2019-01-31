// Webserver test, initial code will be used from: 
// https://www.w3schools.com/nodejs/nodejs_raspberrypi_webserver_websocket.asp

const http = require('http').createServer(handler); //require http server, and create server with function handler()
const fs = require('fs'); //require filesystem module
const url = require('url');
const path = require('path');
const ip = require('ip');
const crypto = require('crypto');
const qs = require('querystring');
const fetch = require('node-fetch');
const servefav = require('serve-favicon');
// import util
// import {toWebLink, webResponse} from "./example-web/assets/util.js";
const util = require("./example-web/assets/utilNode.js");

// Server variables
var port = 6474;
var _favicon = servefav(path.join(__dirname, "public", "favicon.ico"));

// Auth variables
const authorizeURL = "https://accounts.spotify.com/authorize";
var clientID = ""; // Located at: https://developer.spotify.com/dashboard/applications/
var clientSecret = "";
const refreshURL = "https://accounts.spotify.com/api/token"
var clientDataLoaded = false;
var refreshDataLoaded = false;
var authToken = "";
var refreshToken = "";
var authCodeLoaded = false;
var authorized = false;
var authCode = "";
var redirectURI = "redirect_uri=http://" + ip.address() + ":" + port + "/login";
var scope = "scope=user-read-playback-state user-modify-playback-state playlist-read-private user-read-recently-played user-read-currently-playing";
var responseType = "code";
const state = "state=" + crypto.randomBytes(8).toString("hex"); // Generate random 16 char hex string
var authTimeOut;
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
            clientDataLoaded = true;
            completeAuth();
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
            authCodeLoaded = true;
            completeAuth();
        } else {
            console.log("Code data not present in file");
        }
    }
});

fs.readFile("refresh-token.txt", "utf8", function (error, data) {
    if (error) {
        console.log("Unable to read from refresh token file");
    } else {
        if (data != null && data.length > 0) {
            refreshToken = data;
            console.log("Loaded refresh token");
        } else {
            console.log("Refresh not present in file");
        }
    }
    // Need this to be true to progress, even if not in file as it will only be there once an authorization
    // has taken place.
    refreshDataLoaded = true;
    completeAuth();
});

function completeAuth() {
    if (!refreshDataLoaded || !authCodeLoaded || !clientDataLoaded || authorized) {
        // Loading hasn't finished yet.
        console.log("Not ready to authorize");
        return;
    }
    if (refreshToken == null || refreshToken == "") {
        console.log("No refresh token, using client ID and Secret")
        util.webRequest(refreshURL, "POST", { "Content-Type": "application/x-www-form-urlencoded" },
            "grant_type=authorization_code" + "&" + "code=" + authCode + "&" +
            redirectURI + "&" + "client_id=" + clientID + "&" + "client_secret=" + clientSecret, authCallback);
        console.log("grant_type=authorization_code" + "&" + "code=" + authCode + "&" +
            redirectURI + "&" + "client_id=" + clientID + "&" + "client_secret=" + clientSecret);
    } else {
        console.log("Refresh token found, attempting to authorize");
        util.webRequest(refreshURL, "POST", { "Content-Type": "application/x-www-form-urlencoded" },
            "grant_type=refresh_token" + "&" + "refresh_token=" + refreshToken + "&" + 
            "client_id=" + clientID + "&" + "client_secret=" + clientSecret, authCallback);
    }
    
}

function refreshAuth() {
    if (authTimeOut == null) {
        console.log("Auth timeout not defined");
        return;
    }
    console.log("Time running out on current token, refreshing...");
    authorized = false;
    clearTimeout(authTimeOut);
    authTimeOut = null;
    completeAuth();
}

// Auth check function
function authCallback(data) {
    if (data == null || data == {}) {
        console.log("No return data provided");
        return;
    }
    let callAuth = false;
    if (data.hasOwnProperty("error")) {
        console.log("Auth error: " + data["error"]);
        if (data.hasOwnProperty("error_description")) {
            if (data["error_description"] == "Authorization code expired") {
                console.log("Auth code has expired, please renew at: http://" + ip.address() + "/login")
            } else if (data["error_description"] == "Invalid refresh token") {
                console.log("Invalid refresh token, removing");
                refreshToken = "";
                callAuth = true;
            } else {
                console.log("Auth error description: " + data["error_description"]);
            }
        }
    } else {
        console.log("No Auth error detected");
        if (data.hasOwnProperty("access_token")) {
            console.log("Setting access token");
            authToken = data["access_token"];
            if (data.hasOwnProperty("refresh_token")) {
                console.log("Setting refresh token");
                refreshToken = data["refresh_token"];
                fs.writeFile("refresh-token.txt", refreshToken, function (error) {
                    if (error) {
                        console.log("ERROR, refresh token file not written");
                    } else {
                        console.log("Successfully written refresh token details");
                    }
                });
                refreshDataLoaded = true;
            }
            // start auth timeout
            if (data.hasOwnProperty("expires_in")) {
                console.log("Setting refresh timer for: " + (((data["expires_in"] - (5 * 60)) * 1000)) + " milliseconds"); // 5 minute window
                // Set timeout (time in ms, with 5 minute window)
                authTimeOut = setTimeout(refreshAuth, (((data["expires_in"] - (5 * 60)) * 1000)));
            } else {
                // console.log(data);
                console.log("No timeout data provided, setting timeout for " + (3600 - (5 * 60)));
                authTimeOut = setTimeout(refreshAuth, (3600 - (5 * 60) * 1000));
                // authTimeOut = setTimeout(refreshAuth, 10000); // Testing purposes only
            }
            authorized = true;
        } else {
            console.log("No access token found");
            console.log(data);
        }
    }
    if (callAuth) {
        completeAuth();
    }
}

http.listen(port); //listen to port 6474
console.log("NodeJS server at '" + ip.address() + "' listening on port '" + port + "'");

function handler(req, res) { //create server (request, response)
    // console.log(req.headers);

    // Get the location of the request
    var loc = url.parse(req.url, true);

    console.log("Request from: " + loc.href);

    _favicon(req, res, function cont(favError) {
        if (favError) return done(favError);
        // Check if POST request
        if (req.method == "POST") {
            console.log("POST Request");
            if (loc.pathname == "/usbUpdate") {
                console.log(req.headers)
                if (req.headers.origin == "http://" + ip.address() + ":6474") {
                    // Code originally from: https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
                    // BEGIN SNIPPET
                    let body = "";
                    let bodyJSON = {};
                    req.on("data", function (data) {
                        if (body.length > 1e6) {
                            // Request is coming with large amounts of data, not a good idea to continue to parse it
                            request.connection.destroy();
                        }
                        body += data;
                    }); // END SNIPPET
                    req.on("end", function () {
                        bodyJSON = JSON.parse(body);
                        console.log(bodyJSON);

                        if (bodyJSON.hasOwnProperty("tracks") && bodyJSON["tracks"].length > 0) {
                            console.log("Tracks present in POST");
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            return res.end("Tracks added to queue");
                        } else {
                            console.log("Tracks field must exist and not be empty");
                            res.writeHead(400, { 'Content-Type': 'text/html' });
                            return res.end("Tracks field must exist and not be empty");
                        }
                    });
                } else {
                    console.log("USB update does not match expected source");
                    res.writeHead(401, { 'Content-Type': 'text/html' });
                    return res.end("Unauthorized Origin");
                }
            } else if (loc.pathname == "/submitTrackID") {
                // Code originally from: https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
                // BEGIN SNIPPET
                let body = "";
                let bodyJSON = {};
                req.on("data", function (data) {
                    if (body.length > 1e6) {
                        // Request is coming with large amounts of data, not a good idea to continue to parse it
                        request.connection.destroy();
                    }
                    body += data;
                }); // END SNIPPET
                req.on("end", function () {
                    bodyJSON = JSON.parse(body);
                    // console.log(bodyJSON);
                    // console.log(bodyJSON["tracks"]);
                    // console.log(bodyJSON["tracks"].length);
                    // console.log(bodyJSON.hasOwnProperty("tracks"));

                    if (bodyJSON.hasOwnProperty("tracks") && bodyJSON["tracks"].length > 0) {
                        console.log("Tracks present in POST");
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        return res.end("Tracks added to queue");
                    } else {
                        console.log("Tracks field must exist and not be empty");
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        return res.end("Tracks field must exist and not be empty");
                    }
                });
            } else if (loc.pathname == "/submitClientID") {
                if (req.headers.origin == "http://" + ip.address() + ":6474") {
                    // Update client ID
                    // Code originally from: https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
                    // BEGIN SNIPPET
                    let body = "";
                    let bodyJSON = {};
                    req.on("data", function (data) {
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
                            res.writeHead(400, { 'Content-Type': 'text/html' });
                            return res.end("No Client ID found in data");
                        }

                        if (!bodyJSON.hasOwnProperty("secret")) {
                            console.log("Client Secret field not found in JSON data");
                            res.writeHead(400, { 'Content-Type': 'text/html' });
                            return res.end("No Client Secret found in data");
                        }

                        // Save values
                        let tempcid = bodyJSON["cid"];
                        let tempsecret = bodyJSON["secret"];
                        clientSecret = bodyJSON["secret"];
                        clientDataLoaded = true;
                        fs.writeFile("client-data.txt", tempcid + ";" + tempsecret, function (error) {
                            if (error) {
                                console.log("ERROR, client file not written");
                            } else {
                                console.log("Successfully written Client details");
                                completeAuth();
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
                    res.writeHead(401, { 'Content-Type': 'text/html' });
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
                                    authCodeLoaded = true;
                                    fs.writeFile("auth-code.txt", authCode, function (error) {
                                        if (error) {
                                            console.log("ERROR, auth code file not written");
                                        } else {
                                            console.log("Successfully written auth details");
                                            completeAuth();
                                        }
                                    });
                                    res.writeHead(200, { 'Content-Type': 'text/html' });
                                    return res.end("Okay");
                                } else {
                                    console.log("Incorrect 'state' field found in JSON data, expected:\n" +
                                        state + "\nbut found:\m" + "state=" + bodyJSON["state"]);
                                    res.writeHead(400, { 'Content-Type': 'text/html' });
                                    return res.end("Incorrect state provided");
                                }
                            } else {
                                console.log("No 'state' field found in JSON data");
                                res.writeHead(400, { 'Content-Type': 'text/html' });
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
        } else if (loc.pathname == "/request") {
            filename = "." + "/example-web/" + "request.html";
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
    });
}