let canvas = document.querySelector(".game_canvas");
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

let ballTrail = [];
let explosionParticles = [];

let ballSpeed = 1;
let paddleSpeed = 15;

let keys = {
  a: false,
  d: false,
}

let ball = {
  x: (canvas.width / 2 ) - ballRadius / 2,
  y: canvas.height - 60,
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
  ctx.fillStyle = "White";
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
  let totalRows = 12;
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
  createBallTrail();
  drawBallTrail();
  clearBallTrail();
  drawExplosions();
  clearExplosions();
}

function updatePaddle() {
  movePaddle();
  drawPaddle();
}

function movePaddle() {
  if(keys.a) {
    paddle.x -= 1 * paddleSpeed;
  }
  
  if(keys.d) {
    paddle.x += 1 * paddleSpeed;
  }
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = "#0066ff";
  ctx.fill();
}

function moveBall() {
  ball.x += ball.velX * ballSpeed;
  ball.y += ball.velY * ballSpeed;
}

function checkCollision() {
  checkBounds();
  checkPaddleCollision();
  checkBoxCollision();
  
  return false;
}

function checkBoxCollision() {
  boxes.forEach((box) => {
    checkBoxAndBallCollision(box);
  });
}

function checkBoxAndBallCollision(box) {
  if (ball.x < box.x + box.width &&
   ball.x + ball.width > box.x &&
   ball.y < box.y + box.height &&
   ball.y + ball.height > box.y) {
    ballHitBox(box);
  }
}

function ballHitBox(box) {
  // display special effects on hit
  hitBlockEffects(box);
  let sideOfBallHit = getDirHit(box);
  console.log('ball hit a box');
  for(let i = 0; i < boxes.length; i++) {
    if(box.x == boxes[i].x && box.y == boxes[i].y) {
      boxes.splice(i, 1);
    }
  }
}

function getDirHit(box) {
  /*
  if(ball.x > box.x) {
    console.log('hit left side of ball')
  } else if(ball.x < box.x) {
    console.log('hit right side of ball')
  }
  */
  
  if(ball.y <= box.y - (boxHeight/2)) {
    //console.log('hit bot')
    ball.velY = -ball.velY;
  }
  //Hit was from below the brick

  if(ball.y >= box.y + (boxHeight/2)) {
    //console.log('hit top')
    ball.velY = -ball.velY;
  }
    //Hit was from above the brick

  if(ball.x < box.x) {
    //console.log('hit left')
    //ball.velX = -ball.velX;
  }
    //Hit was on left

  if(ball.x > box.x) {
    //console.log('hit right')
    //ball.velX = -ball.velX;
  }
    //Hit was on right
  
  
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

function hitBlockEffects(box) {
  // put any special effects that deal with the ball hitting something here
  changeBackground();
  explosion();
}

function changeBackground() {
  let canvas = document.querySelector(".game_canvas");
  canvas.classList.add("canvas_flash_background");
  setTimeout(() => {
    canvas.classList.remove("canvas_flash_background");
  }, 200);
}

function createBallTrail() {
  let newTrail = {
    x: ball.x,
    y: ball.y,
    drawTime: performance.now(),
  }
  ballTrail.push(newTrail);
}

function drawBallTrail() {
  ballTrail.forEach((trail) => {
    ctx.beginPath();
    ctx.arc(trail.x, trail.y , ball.radius, 0, 2*Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
    ctx.fill();
  })
}

function clearBallTrail() {
  if(ballTrail.length > 0) {
    if(ballTrail[0].drawTime + 2000 < performance.now()) {
      ballTrail.splice(0,1);
    }
  }
}

function explosion() {
  let numParticles = 10;
  for(let i = 0; i < numParticles; i++) {
    let randX = Math.floor(Math.random() * 10) + 1;
    let randY = Math.floor(Math.random() * 10) + 1;
    randX *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
    randY *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

    let newParticle = {
      x: ball.x,
      y: ball.y,
      velX: randX,
      velY: randY,
      drawTime: performance.now(),
    }
    explosionParticles.push(newParticle); 
  }
}

function drawExplosions() {
  explosionParticles.forEach((particle) => {
      particle.x += particle.velX;
      particle.y += particle.velY;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y , ball.radius, 0, 2*Math.PI);
      ctx.fillStyle = "rgba(154, 63, 228, 0.49)";
      ctx.fill();
    });
}

function clearExplosions() {
  if(explosionParticles.length > 0) {
    explosionParticles.forEach((particle) => {
        if(ballTrail.length > 0) {
          if(ballTrail[0].drawTime + 2000 < performance.now()) {
            ballTrail.splice(0,1);
          }
        }
    });
  }
}

start();