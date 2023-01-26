import sword from "./sword.png";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const context = canvas.getContext("2d")!;

let imageLoaded = false;

const image = new Image();
image.src = sword;
image.onload = () => {
  imageLoaded = true;
};

interface Vector {
  x: number;
  y: number;
}

function vec(x: number, y?: number): Vector {
  return { x, y: y ?? x };
}

function mul(a: Vector, b: Vector): Vector {
  return { x: a.x * b.x, y: a.y * b.y };
}

function add(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y };
}

const imageOffset = { x: -300, y: -15 };
let mousePosition: Vector | null = null;
let velocity: Vector = { x: 0, y: 0 };
let acceleration: Vector = { x: 0, y: 0 };
let angularVelocity = 0;
let angle = 0;
let streakPosition: Vector[] = [];

canvas.addEventListener("mousemove", (event) => {
  mousePosition = { x: event.clientX, y: event.clientY };

  acceleration.x = event.movementX;
  acceleration.y = event.movementY;
});

function draw() {
  velocity = add(velocity, acceleration);

  // air resistance
  velocity = mul(velocity, vec(0.9));

  // calculate angular velocity from the velocity vector
  angularVelocity = (velocity.x + velocity.y) * 0.003;

  // dampen acceleration (air resistance)
  acceleration = mul(acceleration, vec(0.9));

  angle += angularVelocity;

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a streak of the tip of the sword
  if (mousePosition) {
    const endOfSword = {
      x: 0,
      y: 580,
    };

    // Matrix multiplication to rotate the end of the sword
    streakPosition.push({
      x: mousePosition.x + endOfSword.x * Math.cos(angle) - endOfSword.y * Math.sin(angle),
      y: mousePosition.y + endOfSword.x * Math.sin(angle) + endOfSword.y * Math.cos(angle),
    });

    if (streakPosition.length > 20) {
      streakPosition.shift();
    }

    context.strokeStyle = "gold"
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = "gold";
    context.shadowBlur = 10;

    for (let i = 0; i < streakPosition.length; i++) {
      const position = streakPosition[i];

      if (i === 0) {
        continue;
      }

      const previousPosition = streakPosition[i - 1];

      // progressively make the line thinner (this sometimes causes holes in the gaps between lines)
      context.lineWidth = i;
      context.beginPath();
      context.moveTo(previousPosition.x, previousPosition.y);
      context.lineTo(position.x, position.y);
      context.stroke();

    }
  }

  if (imageLoaded && mousePosition) {
    // Offset the image so that the center of the image is at the mouse position
    context.save();
    context.translate(mousePosition.x, mousePosition.y);
    context.rotate(angle);
    context.drawImage(image, imageOffset.x, imageOffset.y);
    context.restore();
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
  });

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
