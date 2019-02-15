const fetch = require('node-fetch');

module.exports = {
    toWebLink: toWebLink,
    webRequest: webRequest,
    webResponse: webResponse,
    emptyObject: emptyObject,
    sanitizeAlphaNumeric: sanitizeAlphaNumeric,
    isAlphaNumeric: isAlphaNumeric
};

function toWebLink (link) {
    let subLink = link.split(" ");
    let newLink = subLink[0];
    for (let i = 1; i < subLink.length; i++) {
        newLink = newLink + "%20" + subLink[i];
    }
    return newLink;
}

function webResponse (response, respFunc) {
    // Response method originally found from here: https://stackoverflow.com/questions/37121301/how-to-check-if-the-response-of-a-fetch-is-a-json-object-in-javascript
    let contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        // console.log(response);
        return response.json().then(data => {
            // process your JSON data further
            if (respFunc !== undefined) {
                respFunc(data, response.status);
            } else {
                console.log("Status: " + response.status + ", Data:")
                console.log(data);
            }
        });
    } else {
        return response.text().then(text => {
            // this is text, do something with it
            // console.log("Content: " + text + "\nResponse header: " + response.headers.get("content-type"));
            // console.log(response.headers);
            if (respFunc !== undefined) {
                respFunc(text, response.status);
            } else {
                console.log("Status: " + response.status + ", Text: " + text);
            }
        });
    }
}

// Assumes body will be JSON format or string
function webRequest (dest, method, header, body, respFunc) {
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

    fetch(dest, opts).then(response => webResponse(response, respFunc));
}

function emptyObject (o) {
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