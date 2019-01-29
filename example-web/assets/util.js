module.exports = {
    toWebLink: function (link) {
        let subLink = link.split(" ");
        let newLink = subLink[0];
        for (let i = 1; i < subLink.length; i++) {
            newLink = newLink + "%20" + subLink[i];
        }
        return newLink;
    }
};