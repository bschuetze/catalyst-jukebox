// Webserver test, initial code will be used from: 
// https://www.w3schools.com/nodejs/nodejs_raspberrypi_webserver_websocket.asp

var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var url = require('url');

http.listen(8080); //listen to port 8080

function handler(req, res) { //create server (request, response)
    var loc = url.parse(req.url, true);
    var filename = "." + "/example-web/" + loc.pathname;
    // fs.readFile(__dirname + '/example-web/index.html', function (err, data) { //read file index.html in public folder
    fs.readFile(filename, function (err, data) { //read file index.html in public folder
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' }); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' }); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}