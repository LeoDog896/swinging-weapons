import sword from "./sword.png?width=300&height=300";
import { Pane } from "tweakpane";
import { mul, add, vec, type Vector } from "./vec";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const context = canvas.getContext("2d")!;

let imageLoaded = false;

const image = new Image();
image.src = sword;
image.onload = () => {
  imageLoaded = true;
};

function type<T>(value: T): T {
  return value;
}

const pane = new Pane();
const imageOffset = { x: -150, y: -15 };
const params = {
  mousePosition: type<Vector | null>(null),
  velocity: { x: 0, y: 0 },
  acceleration: { x: 0, y: 0 },
  angularVelocity: 0,
  angularAcceleration: 0,
  angle: 0,
  streakPosition: type<Vector[]>([]),
};

pane.addMonitor(params, "angularAcceleration", {
  label: "Angular Acceleration",
});
pane.addMonitor(params, "angularVelocity", { label: "Angular Velocity" });
pane.addMonitor(params, "angle", { label: "Angle" });

canvas.addEventListener("mousemove", (event) => {
  params.mousePosition = { x: event.clientX, y: event.clientY };

  params.acceleration.x = event.movementX;
  params.acceleration.y = event.movementY;
});

function draw() {
  params.velocity = add(params.velocity, params.acceleration);

  // air resistance
  params.velocity = mul(params.velocity, vec(0.9));
  params.angularAcceleration *= 0.9;

  // convert our mouse movement into angular velocity

  params.angularVelocity = (params.velocity.x + params.velocity.y) / 1000;

  // we are applying gravity to the end of the sword, so we need to rotate the acceleration vector
  // (and add PI/4 because the sword is rotated 45 degrees)
  const gravity = vec(0, 0.02);
  const rotatedGravity = {
    x:
      gravity.x * Math.cos(params.angle + Math.PI / 4) -
      gravity.y * Math.sin(params.angle + Math.PI / 4),
    y:
      gravity.x * Math.sin(params.angle + Math.PI / 4) +
      gravity.y * Math.cos(params.angle + Math.PI / 4),
  };
  params.angularAcceleration += rotatedGravity.x + rotatedGravity.y;

  params.angularVelocity += params.angularAcceleration;

  // dampen acceleration (air resistance)
  params.acceleration = mul(params.acceleration, vec(0.9));

  params.angle += params.angularVelocity;

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a streak of the tip of the sword
  if (params.mousePosition) {
    const endOfSword = {
      x: 0,
      y: 290,
    };

    // Matrix multiplication to rotate the end of the sword
    params.streakPosition.push({
      x:
        params.mousePosition.x +
        endOfSword.x * Math.cos(params.angle) -
        endOfSword.y * Math.sin(params.angle),
      y:
        params.mousePosition.y +
        endOfSword.x * Math.sin(params.angle) +
        endOfSword.y * Math.cos(params.angle),
    });

    if (params.streakPosition.length > 20) {
      params.streakPosition.shift();
    }

    context.strokeStyle = "gold";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = "gold";
    context.shadowBlur = 10;

    for (let i = 0; i < params.streakPosition.length; i++) {
      const position = params.streakPosition[i];

      if (i === 0) {
        continue;
      }

      const previousPosition = params.streakPosition[i - 1];

      // progressively make the line thinner (this sometimes causes holes in the gaps between lines)
      context.lineWidth = i / 2;
      context.beginPath();
      context.moveTo(previousPosition.x, previousPosition.y);
      context.lineTo(position.x, position.y);
      context.stroke();
    }
  }

  if (imageLoaded && params.mousePosition) {
    // Offset the image so that the center of the image is at the mouse position
    context.save();
    context.translate(params.mousePosition.x, params.mousePosition.y);
    context.rotate(params.angle);
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
