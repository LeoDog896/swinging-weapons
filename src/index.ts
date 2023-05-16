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
  d: { x: 0, y: 0 },
  angularVelocity: 0,
  angularAcceleration: 0,
  angle: 0,
  streakPosition: type<Vector[]>([]),
  color: "#FFC935"
};
pane.addInput(params, "color", { view: "color" });
pane.addSeparator()
pane.addMonitor(params, "angularAcceleration", {
  label: "Angular Acceleration",
});
pane.addMonitor(params, "angularVelocity", { label: "Angular Velocity" });
pane.addMonitor(params, "angle", { label: "Angle" });

canvas.addEventListener("mousemove", (event) => {
  params.mousePosition = { x: event.clientX, y: event.clientY };

  params.d.x = event.movementX;
  params.d.y = event.movementY;
});

function draw() {
  {
    // handle physics
    const { x: dx, y: dy } = params.d;

    // handle movement as an "impulse" in the angular impulse-momentum thereom
    // therefore, torque * t = I * w, solving for w, w = r * f * sin theta * t / I
    // simplifying it, w = F * t * sin theta / m * r ( w = Ft / I )
    const currentRotation = params.angle % (2 * Math.PI);
    const rad = Math.atan2(dy, dx) - currentRotation;
    const distance = Math.sqrt(dx * dx + dy * dy);
    params.angularVelocity = (distance * Math.sin(rad)) / (100);
    params.angularVelocity = params.angularVelocity * 0.9;

    params.angle += params.angularVelocity;
  }

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

    context.strokeStyle = params.color;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = params.color;
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
