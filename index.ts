import sword from "./sword.png"

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const context = canvas.getContext("2d")!;

let imageLoaded = false;

const image = new Image();
image.src = sword;
image.onload = () => {
    imageLoaded = true;
}

interface Vector {
    x: number;
    y: number;
}

const imageOffset = { x: -300, y: -15 };
let mousePosition: Vector | null = null;
let velocity: Vector = { x: 0, y: 0 };
let acceleration: Vector = { x: 0, y: 0}
let angularVelocity = 0;
let angle = 0;

canvas.addEventListener("mousemove", (event) => {
    mousePosition = { x: event.clientX, y: event.clientY };

    acceleration.x = event.movementX;
    acceleration.y = event.movementY;
});

function draw() {
    velocity.x += acceleration.x;
    velocity.y += acceleration.y;

    // air resistance
    velocity.x *= 0.9;
    velocity.y *= 0.9;

    angularVelocity = (velocity.y - velocity.x) * 0.004;

    // dampen angular velocity
    angularVelocity *= 0.9;

    // encourage downward rotation
    angularVelocity += (Math.PI - (angle % Math.PI)) * 0.01;
    
    angle += angularVelocity;

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (imageLoaded && mousePosition) {
        // Offset the image so that the center of the image is at the mouse position
        context.save();
        context.translate(mousePosition.x, mousePosition.y);
        context.rotate(angle);
        context.drawImage(image, imageOffset.x, imageOffset.y);
        context.restore();

    }

    if (mousePosition) {
        // velocity line
        context.beginPath();
        context.moveTo(mousePosition.x, mousePosition.y);
        context.lineTo(mousePosition.x + (acceleration.x * 5), mousePosition.y + (acceleration.y * 5));
        context.stroke();

        // acceleration line
        context.beginPath();
        context.moveTo(mousePosition.x, mousePosition.y);
        context.lineTo(mousePosition.x + (velocity.x * 5), mousePosition.y + (velocity.y * 5));
        context.stroke();
    }

    requestAnimationFrame(draw);
}

draw();

// Resize handles
{
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.drawImage(image, 0, 0);
    })

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}