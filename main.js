let canvas = document.getElementById("game_canvas");
let ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);

let ballRadius = 10;
let ballOffset = ballRadius / 2;

let keys = {
  a: false,
  d: false,
}

let ball = {
  x: 10,
  y: 10,
  velX: 5,
  velY: 5,
  width: 10,
  height: 10,
  radius: 10,
};

let paddle = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  width: 100,
  height: 10,
};

function drawBall() {
  
  ctx.beginPath();
  ctx.arc(ball.x, ball.y , ball.radius, 0, 2*Math.PI);
  ctx.fillStyle = "Red";
  ctx.fill();
  //ctx.stroke();
}

function start() {
  //drawBall();
  update();
}

function update() {
  clearCanvas();
  updateBall();
  updatePaddle();
  requestAnimationFrame(update);
}

function keyHandler(event) {
  let key = event.key;
  if(event.type == "keydown") {
    keyDown(key);
  } else if(event.type == "keyup") {
    keyUp(key);
  }
}

function keyDown(key) {
  if(key == "d") {
    keys.d = true;
  } else if(key == "a") {
    keys.a = true;
  }
}

function keyUp(key) {
  if(key == "d") {
    keys.d = false;
  } else if(key == "a") {
    keys.a = false;
  }
}

function updateBall() {
  let isCollision = checkCollision();
  
  if(!isCollision) {
    moveBall();
  }
  
  drawBall();
}

function updatePaddle() {
  movePaddle();
  drawPaddle();
}

function movePaddle() {
  if(keys.a) {
    paddle.x -= 5;
  }
  
  if(keys.d) {
    paddle.x += 5;
  }
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = "Red";
  ctx.fill();
}

function moveBall() {
  ball.x += ball.velX;
  ball.y += ball.velY;
}

function checkCollision() {
  checkBounds();
  checkPaddleCollision();
  
  return false;
}

function checkPaddleCollision() {

  if (ball.x < paddle.x + paddle.width &&
   ball.x + ball.width > paddle.x &&
   ball.y < paddle.y + paddle.height &&
   ball.y + ball.height > paddle.y) {
    ballHitPaddle();
  }
}

function ballHitPaddle() {
  ball.velY = -ball.velY;
}

function checkBounds() {
  let hitBounds = false;
  
  if(ball.x - ballOffset <= 0 || ball.x + ballOffset >= canvas.width) {
    ball.velX = -ball.velX;
  }
  
  if(ball.y - ballOffset < 0 || ball.y + ballOffset > canvas.height) {
    ball.velY = -ball.velY;
  }
 
}

function clearCanvas() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
}

start();