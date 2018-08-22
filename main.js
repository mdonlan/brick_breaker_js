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
let maxBallSpeed = 1;
let paddleSpeed = 10;
let gameOver = false;
let powerups = [];
let colorChangedTime = null;
let backgroundCircles = [];
let countdownFinished = false;

let backgroundCircle = {
  x: null,
  y: null,
  diameter: 0,
  isActive: false,
  color: null,
  opacity: 1,
}

let sounds = {
  boxHit1: [],
  boxHit2: [],
  paddleHit1: [],
  countdownSound: [],
}

let backgroundRect = {
  width: canvas.width,
  height: canvas.height,
  color: '#222222',
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

let paddleHeight = 10;
let paddleWidth = canvas.width / 10;

let paddle = {
  width: paddleWidth,
  height: paddleHeight,
  x: (canvas.width / 2) - (paddleWidth/2),
  y: (canvas.height - 30) - (paddleHeight / 2),
};

function drawBall() {
  
  ctx.beginPath();
  ctx.arc(ball.x + cameraOffset.x, ball.y + cameraOffset.y, ball.diameter, 0, 2*Math.PI);
  ctx.fillStyle = "White";
  ctx.fill();
  //ctx.stroke();
}

function start() {
  // load all assets, create the boxes, and move them into place
  
  
  //drawBall();
  preloadSounds();
  createBoxes();
  
  moveAllBoxes();
  //waitForStart();
}

function waitForStart() {
  // wait to start the update loop until the blocks have moved into their starting positions
  if(boxesInStartingPositions && countdownFinished) {
    // run first update loop
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
    delay: Math.random(),
  }
  boxes.push(newBox)
}

function update() {
  clearCanvas();
  
  drawBackground();
  drawBackgroundCircle();
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
    sound('ballHitBox');
  }
}

function ballHitBox(box) {
  // display special effects on hit
  hitBlockEffects(box);
  getDirHit(box);
  createBallTrail('boxHit');
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

  if(ball.y + (ball.height / 2)>= box.y + (boxHeight/2)) {
    //console.log('hit top')
    //ball.velY = -ball.velY;
  }

  if(ball.x + (ball.width / 2) < box.x + (box.width / 2)) {
    //console.log('hit left')
    //ball.velX = -ball.velX;
  }

  if(ball.x + (ball.width / 2) > box.x + (box.width / 2)) {
    //console.log('hit right')
    //ball.velX = +ball.velX;
  }
   
  /*
  
  //trying to determine if the ball hit the left or right side of the box
  if(ball.y > box.y && ball.y + ball.height < box.y) {
    ball.velX = -box.velX;
  }
  */
}

function checkPaddleCollision() {

  // add the ball velocity into the collision detection to detect if the next move is going to overlap / collide
  if (ball.x + ball.velX < paddle.x + paddle.width &&
   ball.x + ball.velX + ball.width > paddle.x &&
   ball.y + ball.velY < paddle.y + paddle.height &&
   ball.y + ball.velY + ball.height > paddle.y) {
    ballHitPaddle();
    sound('ballHitPaddle');
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
  
  setBackgroundCircle(box);
  //changeBackground();
  explosion();
  cameraShake();
}

function setBackgroundCircle(box) {
  /*
  // only have one background circle, this will cause it to stop and redraw when hitting multiple 
  // blocks in short sucsession
  
  backgroundCircle.x = box.x + (box.width / 2);
  backgroundCircle.y = box.y + (box.height / 2);
  backgroundCircle.color = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
  backgroundCircle.isActive = true;
  backgroundCircle.diameter = 0;
  */
  
  // multiple background circles, add a new one each time
  let newBackgroundCircle = {
    x: box.x + (box.width / 2),
    y: box.y + (box.height / 2),
    diameter: 0,
    isActive: true,
    color: randomRGBAColor(),
    opacity: 1,
    //"#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}),
  }
  backgroundCircles.push(newBackgroundCircle);
}

function randomRGBAColor() {
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);
  let a = 1;
  let rgba = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
  
  return rgba;
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
  /*
  let canvas = document.querySelector(".game_canvas");
  canvas.classList.add("canvas_flash_background");
  setTimeout(() => {
    canvas.classList.remove("canvas_flash_background");
  }, 200);
  */
  
  let color = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
  backgroundRect.color = color;
  
  colorChangedTime = performance.now() + 200;
}

function createBallTrail(type) {
  let newTrail = {
    x: ball.x,
    y: ball.y,
    drawTime: performance.now(),
    type: null,
  }
  
  if(type == 'boxHit') {
    newTrail.type = "boxHit";
  }
  ballTrail.push(newTrail);
}

function drawBallTrail() {
  ballTrail.forEach((trail, index) => {
    /*
    let nextTrail = ballTrail[index + 1];
    if(index + 1 <= ballTrail.length - 1) {
      ctx.beginPath();
      //ctx.arc(trail.x, trail.y , ball.diameter, 0, 2*Math.PI);
      //ctx.fillStyle = "White";
      //ctx.fillRect(trail.x, trail.y, ball.width, ball.height);
      ctx.strokeStyle = "rgba(255, 255, 255, 1)";
      ctx.moveTo(trail.x, trail.y);
      ctx.lineTo(nextTrail.x, nextTrail.y);
      ctx.stroke();
    }
    */
    ctx.beginPath();
    ctx.arc(trail.x, trail.y , ball.diameter, 0, 2*Math.PI);
    
    
    if(trail.type == 'boxHit') {
      // have a special trail if it represents a place where a box was hit
      ctx.fillStyle = "rgba(240, 237, 23, 0.9)";
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
      ctx.stroke();
    }
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
  let numAudio = 1;
  let repeatedAudioFiles = 4;
  totalAudioToLoad = numAudio * repeatedAudioFiles; // this does not count the song b/c that takes a long time to load
  audioLoaded = 0;
  
  //set the start button elem to show loading until all sounds have been loaded
  let startButtonElem = document.querySelector(".start_button");
  startButtonElem.innerHTML = "LOADING"
  
  // create multiple versions to preload of any sound 
  // that might be player more than once at the same time
  boxHit1 = new Audio("./assets/sounds/ballHitBrick1.mp3");
  boxHit1.addEventListener('canplaythrough', soundLoaded, false);
  sounds.boxHit1.push(boxHit1);

  boxHit2 = new Audio("./assets/sounds/ballHitBrick2.mp3");
  boxHit2.addEventListener('canplaythrough', soundLoaded, false);
  sounds.boxHit2.push(boxHit2);

  paddleHit1 = new Audio("./assets/sounds/paddleHit1.mp3");
  paddleHit1.addEventListener('canplaythrough', soundLoaded, false);
  sounds.paddleHit1.push(paddleHit1);

  countdownSound = new Audio("./assets/sounds/paddleHit2.wav");
  countdownSound.addEventListener('canplaythrough', soundLoaded, false);
  sounds.countdownSound.push(countdownSound);
  
  
  for(let i = 0; i < 10; i++) {
    
    // make copies of each sound 
    // do this rather than load each sound from server every time
    
    let newBoxHit1 = boxHit1.cloneNode();
    newBoxHit1.addEventListener('canplaythrough', soundLoaded, false);
    sounds.boxHit1.push(newBoxHit1);

    let newBoxHit2 = boxHit2.cloneNode();
    newBoxHit2.addEventListener('canplaythrough', soundLoaded, false);
    //boxHit2.oncanplay = loadedAudio();
    sounds.boxHit2.push(newBoxHit2);

    let newPaddleHit1 = paddleHit1.cloneNode();
    newPaddleHit1.addEventListener('canplaythrough', soundLoaded, false);
    sounds.paddleHit1.push(newPaddleHit1);

    let newCountdownSound = countdownSound.cloneNode();
    newCountdownSound.addEventListener('canplaythrough', soundLoaded, false);
    //countdownSound.oncanplay = loadedAudio();
    sounds.countdownSound.push(newCountdownSound);
  }
 
  
  song1 = new Audio("./assets/sounds/music1.mp3");
  //song1.addEventListener('canplaythrough', soundLoaded, false);
  //song1.oncanplay = loadedAudio();
}

function soundLoaded() {
  audioLoaded++;
  if(audioLoaded == totalAudioToLoad) {
    console.log('all audio loaded')
    waitForStart();
    allowStartButtonClick();
  }
}

function allowStartButtonClick() {
  let startButtonElem = document.querySelector(".start_button");
  startButtonElem.onclick = clickedStartButton;
  startButtonElem.innerHTML = "START";
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
  } else if(event == 'countdownSound') {
    playSound('countdownSound');
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
  let startTime = performance.now();
  let complete = true;
  boxes.forEach((box) => {
    if(box.delay * 1000 < startTime) {
      if(box.y < box.targetY) {
        if(box.y + boxMoveInSpeed > box.targetY) {
          complete = false;
          let distToTarget = box.targetY - box.y;
          box.y += distToTarget;
        } else {
          box.y += boxMoveInSpeed;
        }
      }
    }
  });

  clearCanvas();
  drawBoxesSlowly();
  drawPaddle();
  requestAnimationFrame(moveAllBoxes);

  if(complete) {
    boxesInStartingPositions = true;
  }
}

function increaseBallSpeed() {
  //console.log("ballSpeed: " + ballSpeed)
  if(ballSpeed < maxBallSpeed) {
    ballSpeed += 0.01; 
  }
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

function drawBackground() {
  if(colorChangedTime != null) {
    if(performance.now() > colorChangedTime) {
      backgroundRect.color = '#222222';
    }
  }
  ctx.beginPath();
  ctx.fillStyle = backgroundRect.color;
  ctx.fillRect(0, 0, backgroundRect.width, backgroundRect.height);
}

function drawBackgroundCircle() {
  backgroundCircles.forEach((circle, index) => {
    if(circle.isActive) {
    ctx.beginPath();
    ctx.arc(circle.x + cameraOffset.x, circle.y + cameraOffset.y, circle.diameter, 0, 2*Math.PI);
    ctx.fillStyle = circle.color;
    ctx.fill();
    
    if(circle.diameter < canvas.width) {
      circle.diameter += 20;
    } else {
      // if the background circle is as large as the screen then fade it out

      circle.opacity -= 0.02;
      // using regex to reduce opacity
      circle.color = circle.color.replace(/[^,]+(?=\))/, circle.opacity)

      if(circle.opacity <= 0) {
        backgroundCircles.splice(index, 1);
      }
      
    }
  }
  });
}

function clickedStartButton() {
  console.log('clicked start');
  
  let startButton = document.querySelector(".start_button");
  startButton.classList.add("hide");
  startBeginningCountdown();
}

function startBeginningCountdown() {
  count = 3;
  countdownElem = document.querySelector(".countdown");
  countdownElem.classList.remove("hide");
  countdownInterval = setInterval(() => {
    updateCountdown();
  }, 1000);
  // run the function first time, b/c setInterval has delay
  updateCountdown();
}

function updateCountdown() {
  if(count === 0) {
      countdownFinished = true;
      clearInterval(countdownInterval);
      countdownElem.classList.add("hide");
    } else {
      countdownElem.innerHTML = count;
      count--;
      sound('countdownSound');
    }
}

start();