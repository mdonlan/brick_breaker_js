let canvas = document.querySelector(".game_canvas");
let ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);

let ballRadius = 10;
let ballOffset = ballRadius / 2;
let totalRows = 12;
let boxesPerRow = 15;
let sideSpacing = 2; // the number of boxs worth of space to have, 2 means one on each side
let boxMargin = 2;
let boxSpacingX = boxesPerRow * boxMargin; 
let boxSpacingY = totalRows * boxMargin;
let boxWidthByCanvasSize = (canvas.width - boxSpacingX) / (boxesPerRow);
let boxMoveInSpeed = 10;
let boxesInStartingPositions = false;
let boxHeight = 30;
let boxes = [];
let ballTrail = [];
let explosionParticles = [];
let ballSpeed = 0.5;
let paddleSpeed = 10;
let gameOver = false;
let powerups = [];

let sounds = {
  boxHit1: [],
  boxHit2: [],
  paddleHit1: [],
}

let keys = {
  a: false,
  d: false,
}

let cameraOffset = {
  x: 0,
  y: 0,
}

let ball = {
  x: (canvas.width / 2 ) - ballRadius / 2,
  y: canvas.height - 60,
  velX: 5,
  velY: 5,
  width: 10,
  height: 10,
  diameter: 10,
};

let paddle = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  width: canvas.width / 10,
  height: 10,
};

function drawBall() {
  
  ctx.beginPath();
  ctx.arc(ball.x + cameraOffset.x, ball.y + cameraOffset.y, ball.diameter, 0, 2*Math.PI);
  ctx.fillStyle = "White";
  ctx.fill();
  //ctx.stroke();
}

function start() {
  //drawBall();
  preloadSounds();
  createBoxes();
  
  moveAllBoxes();
  //waitForStart();
}

function waitForStart() {
  // wait to start the update loop until the blocks have moved into their starting positions
  if(boxesInStartingPositions) {
    update();
  } else {
    requestAnimationFrame(waitForStart);
  }
}

function drawBoxes() {
  boxes.forEach((box) => {
    drawBox(box);   
  });
}

function drawBox(box) {
  ctx.beginPath();
  //ctx.rect(x, y, box.width, box.height);
  ctx.fillStyle = box.color;
  ctx.fillRect(box.x + cameraOffset.x, box.y + cameraOffset.y, box.width, box.height);
}

function createBoxes() {
  let totalBoxes = 200;
  let numBoxes = 0;
  let numRows = 0;
  let x = boxWidthByCanvasSize;
  let y = boxHeight * 2;
  while(numRows < totalRows) {
    x = boxWidthByCanvasSize;
    for(let i = 0; i < (boxesPerRow - sideSpacing); i++) {
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
  // draw all the boxes with an offset that pushes them offscreen
  let yNegOffset = -((totalRows * boxHeight) + boxSpacingY + boxHeight * 2);
  let powerupRandChance = Math.random();
  
  let color = '#CA2F0E';
  let isPowerup = false;
  if(powerupRandChance > .95) {
    color = '#DEA823';
    isPowerup = true;
  }
  let newBox = {
    x: x,
    y: y + yNegOffset,
    height: boxHeight,
    width: boxWidthByCanvasSize,
    targetX: x,
    targetY: y,
    color: color,
    isPowerUp: isPowerup,
    
    // rand color == "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);})
  }
  boxes.push(newBox)
}

function update() {
  clearCanvas();
  
  drawBoxes();
  updateBall();
  updatePaddle();
  
  checkSounds();
  checkNumBoxesLeft();
  
  checkCollision();
  
  // run at end of update
  if(!gameOver) {
    requestAnimationFrame(update);
  }
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
  
  moveBall();
  drawBall();
  createBallTrail();
  drawBallTrail();
  clearBallTrail();
  drawPowerups();
  drawExplosions();
  clearExplosions();
}

function updatePaddle() {
  movePaddle();
  drawPaddle();
}

function movePaddle() {
  if(keys.a) {
    if(paddle.x + (1 * paddleSpeed) > 0) {
      paddle.x -= 1 * paddleSpeed;
    }
  }
  
  if(keys.d) {
    if(paddle.x + paddle.width + (1 * paddleSpeed) < canvas.width) {
      paddle.x += 1 * paddleSpeed;
    }
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
  if (ball.x + ball.velX < box.x + box.width &&
   ball.x + ball.velX + ball.width > box.x &&
   ball.y + ball.velY < box.y + box.height &&
   ball.y + ball.velY + ball.height > box.y) {
    ballHitBox(box);
    increaseBallSpeed();
    let newSound = new sound('ballHitBox');
  }
}

function ballHitBox(box) {
  // display special effects on hit
  hitBlockEffects(box);
  getDirHit(box);
  checkIfPowerup(box);
  //console.log('ball hit a box');
  for(let i = 0; i < boxes.length; i++) {
    if(box.x == boxes[i].x && box.y == boxes[i].y) {
      boxes.splice(i, 1);
    }
  }
}

function checkIfPowerup(box) {
  if(box.isPowerUp) {
    let newPowerup = {
      x: box.x + (box.width / 2),
      y: box.y + (box.height /2),
      velX: 0,
      velY: 2,
      effect: null,
      color: 'Green',
      height: 20,
      width: 20,
    }
    powerups.push(newPowerup);
  }
}

function getDirHit(box) {
  
  ball.velY = -ball.velY;
  
  if(ball.y + (ball.height / 2) <= box.y - (boxHeight/2)) {
    //console.log('hit bot')
    //ball.velY = -ball.velY;
  }
  //Hit was from below the brick

  if(ball.y + (ball.height / 2)>= box.y + (boxHeight/2)) {
    //console.log('hit top')
    //ball.velY = -ball.velY;
  }
    //Hit was from above the brick

  if(ball.x + (ball.width / 2) < box.x + (box.width / 2)) {
    //console.log('hit left')
    //ball.velX = -ball.velX;
  }
    //Hit was on left

  if(ball.x + (ball.width / 2) > box.x + (box.width / 2)) {
    //console.log('hit right')
    //ball.velX = +ball.velX;
  }
    //Hit was on right
}

function checkPaddleCollision() {

  // add the ball velocity into the collision detection to detect if the next move is going to overlap / collide
  if (ball.x + ball.velX < paddle.x + paddle.width &&
   ball.x + ball.velX + ball.width > paddle.x &&
   ball.y + ball.velY < paddle.y + paddle.height &&
   ball.y + ball.velY + ball.height > paddle.y) {
    ballHitPaddle();
    let newSound = new sound('ballHitPaddle');
  }
}

function ballHitPaddle() {
  // find out which side the ball hit the paddle
 
  if(ball.x + (ball.width / 2) > paddle.x + ((paddle.width / 3) * 2)) {
    // hit right side
    //console.log('hit right side of paddle')
    ball.velX = Math.abs(ball.velX);
  } else if(ball.x + (ball.width / 2) < paddle.x + ((paddle.width / 3))){
    // hit left side
    ball.velX = -Math.abs(ball.velX);
  }
  // for center hit just do inverse y and keep x same
  
  ball.velY = -ball.velY;
}

function checkBounds() {
  let hitBounds = false;
  
  if(ball.x - ballOffset <= 0 || ball.x + ballOffset >= canvas.width) {
    // hit left or right bounds
    ball.velX = -ball.velX;
  }
  
  if(ball.y - ballOffset < 0 || ball.y + ballOffset > canvas.height) {
    // hit top or bot bounds
    if(ball.y + ballOffset > canvas.height) {
      // if the ball hits the bottom bound
      gameOver = true;
    } else {
      ball.velY = -ball.velY;
    }
    
  }
 
}

function clearCanvas() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
}

function hitBlockEffects(box) {
  // put any special effects that deal with the ball hitting something here
  changeBackground();
  explosion();
  cameraShake();
}

function cameraShake() {
  // after an event shake the camera 
  
  let numShakes = 0;
  let maxShakes = 10;
  let shakeInterval = setInterval(() => {
    //console.log('shake')
    
    let randX = Math.floor(Math.random() * 10) + 1;
    let randY = Math.floor(Math.random() * 10) + 1;
    randX *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
    randY *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
    cameraOffset = {
      x: randX,
      y: randY,
    }
    
    numShakes++;
    if(numShakes >= maxShakes) {
      clearInterval(shakeInterval);
      cameraOffset = {
        x: 0,
        y: 0,
      }
    }
    
  }, 16);
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
    ctx.arc(trail.x, trail.y , ball.diameter, 0, 2*Math.PI);
    //ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
    //ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
    ctx.stroke();
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
      ctx.arc(particle.x + cameraOffset.x, particle.y + cameraOffset.y, (ball.diameter / 3), 0, 2*Math.PI);
      ctx.fillStyle = "rgba(232, 213, 48, 1)";
      ctx.fill();
    });
}

function clearExplosions() {
  if(explosionParticles.length > 0) {
    explosionParticles.forEach((particle) => {
        if(explosionParticles.length > 0) {
          if(explosionParticles[0].drawTime + 2000 < performance.now()) {
            explosionParticles.splice(0,1);
          }
        }
    });
  }
}

function preloadSounds() {
  let numAudio = 10;
  let repeatedAudioFiles = 3;
  totalAudioToLoad = numAudio * repeatedAudioFiles + 1;
  audioLoaded = 0;
  for(let i = 0; i < numAudio; i++) {
    // create multiple versions to preload of any sound 
    // that might be player more than once at the same time
    boxHit1 = new Audio("./assets/sounds/ballHitBrick1.mp3");
    boxHit1.oncanplay = loadedAudio();
    sounds.boxHit1.push(boxHit1);
    boxHit2 = new Audio("./assets/sounds/ballHitBrick2.mp3");
    boxHit2.oncanplay = loadedAudio();
    sounds.boxHit2.push(boxHit2);
    paddleHit1 = new Audio("./assets/sounds/paddleHit1.mp3");
    paddleHit1.oncanplay = loadedAudio();
    sounds.paddleHit1.push(paddleHit1);
  }
  
  song1 = new Audio("./assets/sounds/music1.mp3");
  song1.oncanplay = loadedAudio();
}

function loadedAudio() {
  audioLoaded++;
  if(audioLoaded == totalAudioToLoad) {
    waitForStart();
  }
}

function sound(event) {
  
  if(event == 'ballHitBox') {
    let randSound = Math.random(); // rand 0 to 1
    if(randSound > 0.5) {
      playSound('boxHit1');
    } else {
      playSound('boxHit2');
    }
  } else if(event == 'ballHitPaddle') {
    playSound('paddleHit1');
  }
  
  
}

function playSound(soundToPlay) {
  // loop through copy of the sound and find one that isn't playing
  for(let i = 0; i < sounds[soundToPlay].length; i++) {
    let sound = sounds[soundToPlay][i];
    if(sound.paused) {
      sound.play();
      break;
    }
  }
  /*
  sounds[soundToPlay].forEach((sound) => {
    console.log(sounds)
    if(sound.paused) {
      sound.play();
    }
  })
  */
}

function setSoundSRC(event) {
  if(event == 'ballHitBox') {
    // if ball hit a box
    let randSound = Math.random(); // rand 0 to 1
    if(randSound > 0.5) {
      src = "./assets/sounds/ballHitBrick1.mp3";
    } else {
      src = "./assets/sounds/ballHitBrick2.mp3";  
    }
  } else if(event == 'ballHitPaddle') {
    // if ball hit the paddle
    //src = "./assets/sounds/paddleHit2.wav";
    src = "./assets/sounds/paddleHit1.mp3";
  }
  
  return src;
}

function clearOldSounds() {
  let sounds = document.getElementsByTagName('audio');
  let soundsArray = Array.from(sounds);
  document.body.removeChild(soundsArray[0])
}

function drawBoxesSlowly() {
  boxes.forEach((box) => {
    ctx.beginPath();
    ctx.fillStyle = box.color;
    ctx.fillRect(box.x, box.y, box.width, box.height);
  });
}

function moveAllBoxes() {
  if(boxes[0].y != boxes[0].targetY) {
    // check if one of the boxes is in the current pos if so then stop updating
    boxes.forEach((box) => {
      if(box.y < box.targetY) {
        if(box.y + boxMoveInSpeed > box.targetY) {
          let distToTarget = box.targetY - box.y;
          box.y += distToTarget;
        } else {
          box.y += boxMoveInSpeed;
        }
        
      }
    });
    clearCanvas();
    drawBoxesSlowly();
    requestAnimationFrame(moveAllBoxes);
  } else {
    boxesInStartingPositions = true;
  }
}

function increaseBallSpeed() {
  ballSpeed += 0.01;
}

function drawPowerups() {
  powerups.forEach((powerup) => {
    powerup.x += powerup.velX;
    powerup.y += powerup.velY;
    ctx.beginPath();
    //ctx.rect(x, y, box.width, box.height);
    ctx.fillStyle = powerup.color;
    ctx.fillRect(powerup.x + cameraOffset.x, powerup.y + cameraOffset.y, powerup.width, powerup.height);
  });
}

function checkSounds() {
  // check if the music is playing
  if(song1.paused) {
    //song1.play();
  }
}

function checkNumBoxesLeft() {
  //console.log('num boxes left = ' + boxes.length);
  if(boxes.length === 0) {
    // if there are no boxes left then stop the game and set player win condition to true
    gameOver = true;
  }
}

start();