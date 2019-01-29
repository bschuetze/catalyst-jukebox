function toWebLink(link) {
    let subLink = link.split(" ");
    let newLink = subLink[0];
    for (let i = 1; i < subLink.length; i++) {
        newLink = newLink + "%20" + subLink[i];
    }
    return newLink;
}

function webResponse(response, respFunc) {
    // Response method originally found from here: https://stackoverflow.com/questions/37121301/how-to-check-if-the-response-of-a-fetch-is-a-json-object-in-javascript
    let contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        console.log("JSON Response");
        // console.log(response);
        return response.json().then(data => {
            // process your JSON data further
            if (respFunc !== undefined) {
                respFunc(data);
            } else {
                console.log("Data:")
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
}

// Assumes body will be JSON format or string
function webRequest(dest, method, header, body, respFunc) {
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

    fetch(dest, opts).then(response => util.webResponse(response, respFunc));

    // fetch(dest, {
    //     headers: { "Content-Type": "application/json" },
    //     method: "POST",
    //     body: JSON.stringify({
    //         cid: sanitizedClientID
    //     })
    // }).then(response => webResponse(response, authRedirect));
}
