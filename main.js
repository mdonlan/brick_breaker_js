let canvas = document.getElementById("game_canvas");
let ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);

let ballRadius = 10;
let ballOffset = ballRadius / 2;

let boxesPerRow = 15;
let boxMargin = 2;
let boxSpacing = boxesPerRow * boxMargin; 
console.log(boxSpacing)
let boxWidthByCanvasSize = (canvas.width - boxSpacing) / boxesPerRow;
console.log(boxWidthByCanvasSize)

let boxHeight = 30;

let boxes = [];

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
  ctx.fillStyle = "Blue";
  ctx.fill();
  //ctx.stroke();
}

function start() {
  //drawBall();
  createBoxes();
  update();
}

function drawBoxes() {
  boxes.forEach((box) => {
    drawBox(box);   
  });
}

function drawBox(box) {
  ctx.beginPath();
  //ctx.rect(x, y, box.width, box.height);
  ctx.fillStyle = "Red";
  ctx.fillRect(box.x, box.y, box.width, box.height);
}

function createBoxes() {
  let totalBoxes = 200;
  let numBoxes = 0;
  let totalRows = 15;
  let numRows = 0;
  let x = 0;
  let y = boxHeight;
  while(numRows < totalRows) {
    x = 0;
    for(let i = 0; i < boxesPerRow; i++) {
      createBox(x, y);
      x += boxWidthByCanvasSize + 2;      
    }
    numRows++;
    y += boxHeight + 2;
  }
  
  /*
  while(numBoxes < totalBoxes) {
    drawBox(x, y);
    x += box.width + 2;
    if(x + box.width >= canvas.width) {
      y += box.height + 2;
      x = box.width;
    }
    
    numBoxes++;
  }
  */
}

function createBox(x, y) {
  let newBox = {
    x: x,
    y: y,
    height: boxHeight,
    width: boxWidthByCanvasSize,
  }
  boxes.push(newBox)
}

function update() {
  clearCanvas();
  
  drawBoxes();
  updateBall();
  updatePaddle();
  requestAnimationFrame(update);
}

function keyHandler(event) {
  //console.log(event.key)
  let key = event.key;
  if(event.type == "keydown") {
    keyDown(key);
  } else if(event.type == "keyup") {
    keyUp(key);
  }
}

function keyDown(key) {
  if(key == "d" || key == "ArrowRight") {
    keys.d = true;
  } else if(key == "a" || key == "ArrowLeft") {
    keys.a = true;
  }
}

function keyUp(key) {
  if(key == "d" || key == "ArrowRight") {
    keys.d = false;
  } else if(key == "a" || key == "ArrowLeft") {
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
  checkBoxCollision();
  
  return false;
}

function checkBoxCollision() {
  
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