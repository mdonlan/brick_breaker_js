let canvas = document.getElementById("game_canvas");
let ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let ball = {
  x: 10,
  y: 10,
  velX: 5,
  velY: 5,
  width: 50,
  height: 50,
  radius: 10,
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
  //updateBall();
  requestAnimationFrame(update);
}

function updateBall() {
  let isCollision = checkCollision();
  
  if(!isCollision) {
    moveBall();
  }
  
  drawBall();
}

function moveBall() {
  ball.x += ball.velX;
  ball.y += ball.velY;
}

function checkCollision() {
  return false;
}

function clearCanvas() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
}

start();

