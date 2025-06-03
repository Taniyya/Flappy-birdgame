const bird = document.getElementById("bird");
const pipeContainer = document.getElementById("pipe-container");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");

let birdY = 250;
let gravity = 2;
let jumpHeight = 40;
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
let gameInterval, pipeInterval, gameOver = false;

highScoreDisplay.textContent = highScore;

document.getElementById("start-btn").onclick = () => {
  document.getElementById("start-screen").style.display = "none";
  document.querySelector(".game-container").style.display = "block";
  startGame();
};

document.getElementById("restart-btn").onclick = () => location.reload();

function flap() {
  if (!gameOver) {
    birdY -= jumpHeight;
    if (birdY < 0) birdY = 0;
    bird.style.top = birdY + "px";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") flap();
});
document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

function updateBird() {
  birdY += gravity;
  if (birdY > 560) endGame(); // ground collision
  bird.style.top = birdY + "px";
}

const pipes = [];

function spawnPipe() {
  const gap = 150;
  const topHeight = Math.floor(Math.random() * 200) + 50;
  const bottomHeight = 600 - gap - topHeight;

  const top = document.createElement("div");
  top.classList.add("pipe", "top");
  top.style.height = topHeight + "px";
  top.style.left = "400px";

  const bottom = document.createElement("div");
  bottom.classList.add("pipe", "bottom");
  bottom.style.height = bottomHeight + "px";
  bottom.style.left = "400px";

  pipeContainer.appendChild(top);
  pipeContainer.appendChild(bottom);

  pipes.push({ top, bottom, passed: false });
}

function updatePipes() {
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    let topLeft = parseInt(pipe.top.style.left);
    let bottomLeft = parseInt(pipe.bottom.style.left);

    topLeft -= 3;
    bottomLeft -= 3;

    pipe.top.style.left = topLeft + "px";
    pipe.bottom.style.left = bottomLeft + "px";

    // Remove pipes out of screen
    if (topLeft < -60) {
      pipe.top.remove();
      pipe.bottom.remove();
      pipes.splice(i, 1);
      continue;
    }

    // Check collision with bird
    if (collision(bird, pipe.top) || collision(bird, pipe.bottom)) {
      endGame();
    }

    // Check if bird passed pipe for scoring
    if (!pipe.passed && topLeft + 60 < 80) {
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      pipe.passed = true;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyHighScore", highScore);
        highScoreDisplay.textContent = highScore;
      }
    }
  }
}

function collision(bird, pipe) {
  const birdRect = bird.getBoundingClientRect();
  const pipeRect = pipe.getBoundingClientRect();

  return !(
    birdRect.top > pipeRect.bottom ||
    birdRect.bottom < pipeRect.top ||
    birdRect.right < pipeRect.left ||
    birdRect.left > pipeRect.right
  );
}

function startGame() {
  gameOver = false;
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  birdY = 250;
  bird.style.top = birdY + "px";
  pipeContainer.innerHTML = "";
  pipes.length = 0;

  gameInterval = setInterval(() => {
    updateBird();
    updatePipes();
  }, 20);

  pipeInterval = setInterval(spawnPipe, 2000);

  document.getElementById("restart-btn").style.display = "none";
}

function endGame() {
  if (!gameOver) {
    gameOver = true;
    clearInterval(gameInterval);
    clearInterval(pipeInterval);
    document.getElementById("restart-btn").style.display = "block";
  }
}
