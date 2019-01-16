var input;
var button;

function setup() {
    createCanvas(windowWidth, windowHeight);

    background(230);

    // Text input
    input = createElement("textarea");
    input.size(width * 0.8, height * 0.3);
    input.position(width * 0.1, height * 0.3);
    input.style("font-size: 24px; padding: 10px");

    // Button
    button = createButton("Submit");
    button.size(input.width, height * 0.15);
    button.position(input.x, height * 0.7);
    button.style("border: none; background-color: #1ED761; color: black; font-size: 10vmin; font-family: Verdana, Arial");
    button.mouseClicked(buttonPress);
    button.mouseOver(buttonHover);
    button.mouseOut(buttonOut);
    button.mousePressed(buttonDown);
    button.mouseReleased(buttonUp);

    // Text
    textSize(width * 0.075);
    textAlign(CENTER);
    text("Enter Spotify Client ID", input.x, height * 0.15, input.width, height * 0.15);
}

function draw() {
    noLoop();
}

function buttonHover() {
    button.style("background-color: #16bf54");
}

function buttonOut() {
    button.style("background-color: #1ED761");
}

function buttonPress() {
}

function buttonDown() {
    button.style("color: #333333");
}

function buttonUp() {
    button.style("color: black")
}