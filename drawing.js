
const BACKGROUND_COLOR = '#000000';
const LINE_COLOR = '#FFFFFF'
const LINE_WIDTH = 15;
const LINE_JOIN = 'round';

let isDrawing = false;

let currentX = 0;
let currentY = 0;
let previousX = 0;
let previousY = 0;

let canvas;
let context;

function prepareCanvas() {

    console.log('Preparing Canvas ...');

    // Gets ahold of the canvas
    canvas = document.getElementById('my-canvas');

    // Manipulate the canvas using the context of the canvas
    context = canvas.getContext("2d")

    // Styling the canvas
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    context.strokeStyle = LINE_COLOR;
    context.lineWidth = LINE_WIDTH;
    context.lineJoin = LINE_JOIN;

    document.addEventListener('mousedown', event => {
        isDrawing = true;

        currentX = event.clientX - canvas.offsetLeft;
        currentY = event.clientY - canvas.offsetTop;
    });

    // Track the mouse
    document.addEventListener('mousemove', function (event) {

        if (isDrawing) {

            // offset changes the origin from the top left of the page to the top left of the canvas
            previousX = currentX;
            currentX = event.clientX - canvas.offsetLeft;

            previousY = currentY;
            currentY = event.clientY - canvas.offsetTop;

            // Draws the stroke
            draw();
        }

    });

    document.addEventListener('mouseup', event => {
        isDrawing = false;
    });

    canvas.addEventListener('mouseleave', event => {
        isDrawing = false;
    });

    // Touch Events

    canvas.addEventListener('touchstart', event => {
        isDrawing = true;
        console.log('TouchDown!');
        currentX = event.touches[0].clientX - canvas.offsetLeft;
        currentY = event.touches[0].clientY - canvas.offsetTop;
    });

    canvas.addEventListener('touchend', event => {
        isDrawing = false;
    });

    canvas.addEventListener('touchcancel', event => {
        isDrawing = false;
    });

    canvas.addEventListener('touchmove', function (event) {

        if (isDrawing) {

            // offset changes the origin from the top left of the page to the top left of the canvas
            previousX = currentX;
            currentX = event.touches[0].clientX - canvas.offsetLeft;

            previousY = currentY;
            currentY = event.touches[0].clientY - canvas.offsetTop;

            // Draws the stroke
            draw();
        }

    });


}

function draw() {
    context.beginPath();
    context.moveTo(previousX, previousY);
    context.lineTo(currentX, currentY);
    context.closePath();
    context.stroke();
}

function clearCanvas() {
    currentX = 0;
    currentY = 0;
    previousX = 0;
    previousY = 0;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}