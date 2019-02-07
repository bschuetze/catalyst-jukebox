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

// Spotify API variables
const apiURL = "https://api.spotify.com/v1/"
var spotifyHandler = new SpotifyPlaylist();
const publicPlaylist = true;
const deviceName = "raspotify (catalyst-jukebox)";
const defaultSong = "spotify:track:2Z8WuEywRWYTKe1NybPQEW";
var getDeviceTimeout;

// Auth variables
const authorizeURL = "https://accounts.spotify.com/authorize";
var clientID = ""; // Located at: https://developer.spotify.com/dashboard/applications/
var clientSecret = "";
var userID = "";
const refreshURL = "https://accounts.spotify.com/api/token"
var clientDataLoaded = false;
var refreshDataLoaded = false;
var authToken = "";
var refreshToken = "";
var authCodeLoaded = false;
var authorized = false;
var authCode = "";
var redirectURI = "redirect_uri=http://" + ip.address() + ":" + port + "/login";
var scope = "scope=user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private playlist-read-private user-read-recently-played user-read-currently-playing";
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
    if (util.emptyObject(data)) {
        console.log("No return data provided");
        return;
    }
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
            // Get user ID
            if (!spotifyHandler.configured) {
                spotifyHandler.setup();
            }

        } else {
            console.log("No access token found");
            console.log(data);
        }
    }
}

function usbUpdateCheck(obj) {
    if (obj.hasOwnProperty("model") && obj.hasOwnProperty("location") && obj.hasOwnProperty("action")) {
        return (obj["location"].length > 0 && obj["action"].length > 0);
    } else {
        return false;
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
            if (loc.pathname == "/spotifyControl") {
                console.log("Spotify Request");
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
                    if (!util.emptyObject(bodyJSON) && bodyJSON.hasOwnProperty("method")) {
                        switch(bodyJSON["method"]) {
                            case "currently_playing":
                                spotifyHandler.currentlyPlaying();
                                break;
                            case "init_playlist":
                                spotifyHandler.initPlaylist();
                                break;
                            case "get_playlist":
                                spotifyHandler.getPlaylists();
                                break;
                            case "playlist_length":
                                spotifyHandler.playlistLength();
                                break;
                        }
                    }
                });

                res.writeHead(200, { 'Content-Type': 'text/html' });
                return res.end("Request successful");
            } else if (loc.pathname == "/usbUpdate") {
                if (req.headers.host == ip.address() + ":" + port) {
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
                        if (usbUpdateCheck(bodyJSON)) {
                            console.log("USB update: " + bodyJSON["model"] + " " + bodyJSON["action"] + " " + 
                                        bodyJSON["location"]);
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            return res.end("USB data updated");
                        } else {
                            console.log("USB update does not match expected format");
                            res.writeHead(400, { 'Content-Type': 'text/html' });
                            return res.end("USB update does not match expected format");
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
                if (req.headers.host == ip.address() + ":" + port) {
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
                                // New details provided, reset auth
                                authorized = false;
                                completeAuth();
                            }
                        });

                        clientID = bodyJSON["cid"];

                        let retURL = "" + util.toWebLink(authorizeURL + "?client_id=" + clientID + "&response_type=code&" + redirectURI + "&" + scope + "&" + state);
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
                if (req.headers.host == ip.address() + ":" + port) {
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
                                            // New details provided, reset auth
                                            authorized = false;
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

function UsbDevice() {
    this.port = "";
    this.model = "";
    this.state = "uninitialized";

    this.update = function (port, model, state) {
        this.port = port;
        this.model = model;
        this.state = state;
    }
}

function User() {
    this.id = crypto.randomBytes(8).toString("hex"); // Generate random 16 char hex string for user ID
    this.requests = [];
    this.usb = new UsbDevice();
    
}

function Song(user, uri) {
    this.owner = user;
    this.uri = uri;
}

// Yes these next 2 functions are weird but due to scoping it needs to be outside of the 
// spotify object to work
function setSpotifyTimeout(duration) {
    getDeviceTimeout = setTimeout(callSpotifyDevice, duration);
}

function callSpotifyDevice() {
    spotifyHandler.getDeviceID();
}

function SpotifyPlaylist() {

    // General vars
    this.configured = false;
    this.playedSongs = [];
    this.songsBeforeRepeat = 10;
    this.queuedSongs = [];
    this.playlistURI = "";
    this.deviceID = "";

    // this.getDeviceTimeout;

    this.repeat = "off";       // track | context | off.
    this.shuffle = false; // true | false

    // .getPlaylist() vars
    this.playlists = [];
    this.playlistLimit = 50;
    this.playlistOffset = 0;
    this.parsedPlaylists = 0;
    this.totalPlaylists = 0;
    

    this.setup = function() {
        console.log("Setting up playlist handling");
        this.getUserID();
        this.getDeviceID();
        this.initPlaylist();
        this.configured = true;
    }

    this.getUserID = function() {
        this.spotifyRequest(apiURL + "me", "GET", {}, {}, function(data) {
            if (!util.emptyObject(data) && data.hasOwnProperty("id")) {
                console.log("Setting user ID: " + data["id"]);
                userID = data["id"];
            }
        });
    }

    this.getDeviceID = function() {
        console.log("Locating Catalyst Jukebox device...");

        // Require to store 'this' as it changes inside the fetch call
        let self = this;

        this.spotifyRequest(apiURL + "me/player/devices", "GET", {}, {}, function(data) {
            if (!util.emptyObject(data)) {
                if (data.hasOwnProperty("devices")) {
                    for (let i = 0; i < data["devices"].length; i++) {
                        if (data["devices"][i]["name"] == deviceName) {
                            console.log("Found " + data["devices"][i]["name"] + " with ID: " + data["devices"][i]["id"]);
                            self.deviceID = data["devices"][i]["id"];
                            break;
                        }
                    }
                    if (self.deviceID == "") {
                        console.log("Unable to find device with name: " + deviceName);
                        setSpotifyTimeout(5000);
                    } else {
                        clearTimeout(getDeviceTimeout);
                        self.setDevice();
                    }
                } else {
                    console.log("No devices appearing");
                    console.log(data);
                }
            }
        });
    }    

    
    
    this.setDevice = function() {
        console.log("Setting playback device to: " + deviceName);
        // Require to store 'this' as it changes inside the fetch call
        let self = this;
        this.spotifyRequest(apiURL + "me/player", "PUT", {}, {"device_ids": [this.deviceID]}, function() {
            self.setRepeat();
            self.setShuffle();
        });
    }

    this.songRequest = function() {

    }

    this.setRepeat = function() {
        console.log("Setting repeat to " + this.repeat);
        this.spotifyRequest(apiURL + "me/player/repeat?state=" + this.repeat, "PUT");
    }

    this.setShuffle = function() {
        console.log("Setting shuffle to " + this.shuffle);
        this.spotifyRequest(apiURL + "me/player/shuffle?state=" + this.shuffle, "PUT");
    }

    // Takes a list of song URIs
    // Input: ["xxx:xxx:xxx", ...]
    this.addSongs = function (songURIs) {
        this.spotifyRequest(apiURL + "playlists/" + this.playlistURI + "/tracks", "POST",
                            {"Content-Type": "application/json" }, {"uris": songs}, 
                            function (data) {
            if (!util.emptyObject(data)) {
                if (data.hasOwnProperty("error")) {
                    console.log("Something went wrong adding: " + songs + " to playlist");
                    console.log(data);
                } else {
                    console.log("Successfully added: " + songs + " to playlist");
                }
            }
        });
    }

    // Takes in a list of song objects:
    // [{"uri": "xxxx:xxx:xxx"}, ...]
    // This currently deleted all occurences of a song, may need to edit?
    this.removeSongs = function(songs) {
        this.spotifyRequest(apiURL + "playlists/" + this.playlistURI + "/tracks", "DELETE", 
        {"Content-Type": "application/json"}, {"tracks": songs}, function(data) {
            if (!util.emptyObject(data)) {
                if (data.hasOwnProperty("error")) {
                    console.log("Something went wrong removing: " + songs + " from playlist");
                    console.log(data);
                } else {
                    console.log("Successfully removed: " + songs + " from playlist");
                }
            }
        });
    }

    this.currentlyPlaying = function() {
        this.spotifyRequest(apiURL + "me/player/currently-playing", "GET", {}, {}, function(data) {
            if (data["is_playing"]) {
                console.log("Currently Playing:");
            } else {
                console.log("Currently Paused:");
            }
            console.log("  Song: " + data["item"]["name"]);
            let songArtists = "";
            for (let i = 0; i < data["item"]["artists"].length; i++) {
                songArtists = songArtists + data["item"]["artists"][i]["name"];
                if (i == data["item"]["artists"].length - 2) {
                    songArtists = songArtists + " & ";
                } else if (i < data["item"]["artists"].length - 2) {
                    songArtists = songArtists + ", ";
                }
            }
            console.log("  Artist(s): " + songArtists)
            console.log("  Album: " + data["item"]["album"]["name"]);
            console.log("  Track URI: " + data["item"]["uri"]);
        });
    }

    this.setupPlaylist = function() {
        // Check if playlist is empty
        // if not, empty it
        // add default song
        // play it
    }

    this.playlistLength = function() {
        this.spotifyRequest(apiURL + "playlists/" + this.playlistURI + "/tracks?fields=total&limit=0", "GET", {}, {}, function(data) {
            console.log(data);
        });
    }

    this.emptyPlaylist = function() {
        if (!this.configured) {
            console.log("Spotify playlist has not yet been configured, aborting clear");
            return;
        }

        // Require to store 'this' as it changes inside the fetch call
        let self = this;

        this.spotifyRequest(apiURL + "playlists/" + this.playlistURI + "/tracks", "GET", {}, {}, function(data) {

        });
    }

    this.initPlaylist = function() {
        // Get playlists
        this.getPlaylists(true);
    }

    this.initPlaylistCallback = function() {
        let found = false;
        for (let i = 0; i < this.playlists.length; i++) {
            if (this.playlists[i]["name"] == "Catalyst Jukebox Playlist") {
                console.log("Found playlist");
                this.playlistURI = this.playlists[i]["uri"];
                found = true;
                break;
            }
        }
        if (found) {
            // Found playlist, no need to make
            console.log("Found existing Catalyst Jukebox playlist, uri: " + this.playlistURI);
        } else {
            console.log("Catalyst Jukebox playlist doesn't exist, creating...");
            // Need to make playlist
            let makePlaylistBody = {}
            makePlaylistBody["name"] = "Catalyst Jukebox Playlist";
            makePlaylistBody["description"] = "Playlist for the Catalyst Jukebox application";
            makePlaylistBody["public"] = publicPlaylist;

            // Require to store 'this' as it changes inside the fetch call
            let self = this;

            this.spotifyRequest(apiURL + "users/" + userID + "/playlists", "POST", {"Content-Type": "application/json"}, makePlaylistBody, function(data) {
                if (!util.emptyObject(data)) {
                    if (data.hasOwnProperty("error")) {
                        console.log("Error when trying to create new playlist:");
                        console.log(data);
                    } else {
                        if (data.hasOwnProperty("uri")) {
                            self.playlistURI = data["uri"];
                            console.log("Catalyst Jukebox playlist created, uri: " + self.playlistURI);
                        } else {
                            console.log("No error, but playlist data is not present")
                            console.log(data);
                        }
                    }
                }
            });
        }
    }

    this.getPlaylists = function(callback) {
        // Get the total number of playlists a user has
        // Require to store 'this' as it changes inside the fetch call
        let self = this;

        this.spotifyRequest(apiURL + "me/playlists?limit=0", "GET", {}, {}, function (data) {
            if (!util.emptyObject(data) && data.hasOwnProperty("total")) {
                self.totalPlaylists = data["total"];
                self.playlistOffset = data["total"] - self.playlists.length;
                self.loadPlaylists(callback);
            }
        });
    }

    this.loadPlaylists = function (callback) {

        if (this.totalPlaylists > this.playlists.length) {

            // Set up playlist offset
            this.playlistOffset = Math.max(this.playlistOffset - this.playlistLimit, 0);

            // Require to store 'this' as it changes inside the fetch call
            let self = this;

            this.spotifyRequest(apiURL + "me/playlists?limit=" + this.playlistLimit + "&offset=" + this.playlistOffset, "GET", {}, {}, function (data) {
                if (!util.emptyObject(data) && data.hasOwnProperty("items")) {
                    for (let i = 0; i < data["items"].length; i++) {
                        if (self.parsedPlaylists >= self.totalPlaylists) {
                            break;
                        }
                        self.playlists.push(data["items"][i]);
                        self.parsedPlaylists = self.parsedPlaylists + 1;
                    }

                    // Recursively call function
                    self.loadPlaylists(callback);
                }
            });
        } else {
            if (this.playlistOffset != 0 || this.playlists.length != this.totalPlaylists) {
                // A playlist has been deleted, rebuild list
                console.log("A playlist has been deleted, rebuilding list...")
                this.playlists = [];
                this.playlistOffset = 0;
                this.parsedPlaylists = 0;
                this.getPlaylists(callback);
            } else {
                console.log("All playlists parsed, total: " + this.playlists.length);
                if (callback != null && callback) {
                    this.initPlaylistCallback();
                }
            }
        }
    }

    this.spotifyRequest = function(dest, reqMethod, reqHeader, reqBody, respFunc) {
        let completeHeader;
        if (!util.emptyObject(reqHeader)) {
            completeHeader = reqHeader;
        } else {
            completeHeader = {};
        }
        completeHeader["Authorization"] = "Bearer " + authToken;

        let completeBody;

        if (!util.emptyObject(reqBody)) {
            completeBody = JSON.stringify(reqBody);
        } 
    
        util.webRequest(dest, reqMethod, completeHeader, completeBody, respFunc);
    }
}

// function spotifyPlayerRequest(reqMethod, reqFunc, reqHeader, respFunc) {
//     let completeHeader = reqHeader;
//     completeHeader["Authorization"] = token;
//     console.log(completeHeader);
//     // {
//     //     "Content-Type": "application/json",
//     //         "Authorization": token
//     // }
//     fetch("https://api.spotify.com/v1/" + userID + "/player/" + reqFunc, {
//         headers: completeHeader,
//         method: reqMethod
//         // body: JSON.stringify({
//         //     username: 'Elon Musk',
//         //     email: 'elonmusk@gmail.com',
//         // })
//     }).then(response => {
//         // Response method originally found from here: https://stackoverflow.com/questions/37121301/how-to-check-if-the-response-of-a-fetch-is-a-json-object-in-javascript
//         let contentType = response.headers.get("content-type");
//         if (contentType && contentType.indexOf("application/json") !== -1) {
//             return response.json().then(data => {
//                 // process your JSON data further
//                 console.log("JSON Response");
//                 if (data.hasOwnProperty("error")) {
//                     requestError(data);
//                 }
//                 if (respFunc !== undefined) {
//                     respFunc(data);
//                 } else {
//                     console.log(data);
//                 }
//             });
//         } else {
//             return response.text().then(text => {
//                 // this is text, do something with it
//                 console.log("Other Response");
//                 // console.log("Content: " + text + "\nResponse header: " + response.headers.get("content-type"));
//                 // console.log(response.headers);
//                 if (respFunc !== undefined) {
//                     respFunc(text);
//                 } else {
//                     console.log(text);
//                 }
//             });
//         }
//     }); // end response method
// }
