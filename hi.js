const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let frames = 0;
let score = 0;
let gameRunning = true;
let gravity = 0.35;

const birdImg = new Image();
birdImg.src = "bird.png";

const bird = {
  x: 80,
  y: 50, // Bird starts near the top
  w: 40,
  h: 30,
  velocity: 0,
  jump: -8,
  draw() {
    ctx.drawImage(birdImg, this.x, this.y, this.w, this.h);
  },
  update() {
    this.velocity += gravity;
    this.y += this.velocity;

    if (this.y + this.h >= canvas.height || this.y < 0) {
      gameOver();
    }
  },
  flap() {
    this.velocity = this.jump;
  }
};

const pipes = [];
const pipeWidth = 60;
let baseGap = 250;
let minGap = 120;

function getCurrentPipeGap() {
  // Shrinks gap as score increases
  return Math.max(minGap, baseGap - score * 5);
}

function createPipe() {
  const gap = getCurrentPipeGap();
  const topHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 50;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + gap,
    scored: false
  });
}

function drawPipes() {
  ctx.fillStyle = "#228B22";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
  });
}

let pipeSpeed = 2;
const maxPipeSpeed = 8; // Cap the speed
function updatePipes() {
  if (frames % 100 === 0) createPipe();

  // Increase speed based on score
  pipeSpeed = Math.min(maxPipeSpeed, 2 + score * 0.1); // Slowly ramps up

  pipes.forEach((pipe, index) => {
    pipe.x -= pipeSpeed;

    // Collision
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.w > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.h > pipe.bottom)
    ) {
      gameOver();
    }

    // Score
    if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
      score++;
      pipe.scored = true;
    }

    // Remove off-screen
    if (pipe.x + pipeWidth < 0) {
      pipes.splice(index, 1);
    }
  });
}


function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

function gameOver() {
  gameRunning = false;
  document.getElementById("retryBtn").style.display = "block";
}

function resetGame() {
  score = 0;
  frames = 0;
  bird.y = 50;
  bird.velocity = 0;
  pipes.length = 0;
  gameRunning = true;
  document.getElementById("retryBtn").style.display = "none";
  loop();
}

function loop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bird.update();
  bird.draw();
  updatePipes();
  drawPipes();
  drawScore();
  frames++;
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") bird.flap();
});
document.addEventListener("touchstart", () => bird.flap());

document.getElementById("retryBtn").addEventListener("click", resetGame);

birdImg.onload = () => loop();
