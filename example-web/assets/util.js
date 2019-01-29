module.exports = {
    toWebLink: function (link) {
        let subLink = link.split(" ");
        let newLink = subLink[0];
        for (let i = 1; i < subLink.length; i++) {
            newLink = newLink + "%20" + subLink[i];
        }
        return newLink;
    },

    webResponse: function (response, respFunc) {
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
};