// Ml5.js
let handPose;
let video;
let hands = [];

const INDEX_FINGER_TIP = 8;
const THUMB_TIP = 4; // Índice da chave do polegar

let gameStarted = false; // Controle do estado do jogo

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({ maxHands: 1, flipped: true });
}

// Matter.js 
const { Engine, Body, Bodies, Composite, Vector } = Matter;

const gameWord = ["Develop", "Your", "Brain"];
const fakeWords = ["CACHORRO", "GATO", "PASSARO", "PEIXE"];


let collorBank =  [
  "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF", "#33FFF5",
  "#FF8C33", "#8C33FF", "#33FF8C", "#FF3333", "#33A1FF", "#A1FF33",
  "#FFD700", "#FF4500", "#ADFF2F", "#00CED1", "#DC143C", "#7B68EE",
  "#20B2AA", "#FF1493", "#32CD32", "#8B008B", "#6495ED", "#FF6347"
]; 
let boxes, fakeWordsInstance;
let index, thumb;
let pointer, thumbPointer;
let engine;

let restartOverlay  = document.getElementById("restart-overlay");

function setup() {
  let canvasContainer = document.querySelector(".canvas-container"); // Seleciona o espaço do canvas
  let canvas = createCanvas(1280, 960); // Cria o canvas do tamanho correto
  canvas.parent(canvasContainer); // Coloca o canvas dentro do quadrado branco

  

  // Criar a captura de vídeo e ocultá-la
  video = createCapture(VIDEO, { flipped: true });
  video.size(1280, 960);
  video.hide();

  // Iniciar a detecção de mãos da webcam
  handPose.detectStart(video, gotHands);

  engine = Engine.create();

  boxes = new Boxes(gameWord.length, 40);
  fakeWordsInstance = new FakeWords(fakeWords, 40);
  
  // Criar o chão e os ponteiros para o indicador e o polegar
  let ground = Bodies.rectangle(width/2, width * 3/4 - 50, width, 30, { isStatic: true });
  pointer = Bodies.circle(50, 100, 10, { isStatic: true });
  thumbPointer = Bodies.circle(50, 100, 10, { isStatic: true });

  Composite.add(engine.world, [ground, pointer, thumbPointer]);

}

function draw() {
  background(220);
  
  // Exibir o overlay se o jogo ainda não começou
  if (!gameStarted) {
    checkGesture();
    return;
  }

  Engine.update(engine);

  // Imagem da webcam
  image(video, 0, 0, width, height);

  if (hands.length > 0) {
    index = hands[0].keypoints[INDEX_FINGER_TIP];
    thumb = hands[0].keypoints[THUMB_TIP];  // Posição do polegar

    pointer.position.x = index.x;
    pointer.position.y = index.y;

    thumbPointer.position.x = thumb.x;
    thumbPointer.position.y = thumb.y;

    fill("#49E60F");
    ellipse(index.x, index.y, 10);  // Bolinha verde no indicador
    
    fill("#49E60F");
    ellipse(thumb.x, thumb.y, 10);  // Bolinha verde no polegar
  }

  boxes.checkCollision(pointer, thumbPointer);
  boxes.checkPlatforms();
  boxes.display();
  
  fakeWordsInstance.checkCollision(pointer, thumbPointer);
  fakeWordsInstance.display();

  if (boxes.gameCompleted == true) {
    
    restartOverlay.style.display = "flex";
    checkRestartGesture();
    
  }
}

// Verifica se o jogador fez o gesto de pinça para começar o jogo
function checkGesture() {
  if (hands.length > 0) {
    let index = hands[0].keypoints[INDEX_FINGER_TIP];
    let thumb = hands[0].keypoints[THUMB_TIP];

    let distance = dist(index.x, index.y, thumb.x, thumb.y);

    if (distance < 50) { // Aproximou os dedos (sinal de OK)
      gameStarted = true;
      let overlay = document.getElementById("start-overlay");
      overlay.classList.add("hidden"); // Adiciona classe para o fade-out

      setTimeout(() => {
        overlay.style.display = "none"; // Remove completamente após a animação
      }, 1000);
    }
  }
}


// Verifica se todas as pontas dos dedos estão juntas para reiniciar o jogo
function checkRestartGesture() {
  if (hands.length > 0) {
    let index = hands[0].keypoints[INDEX_FINGER_TIP];
    let thumb = hands[0].keypoints[THUMB_TIP];
    let middle = hands[0].keypoints[12];
    let ring = hands[0].keypoints[16];
    let pinky = hands[0].keypoints[20];

    let d1 = dist(index.x, index.y, thumb.x, thumb.y);
    let d2 = dist(middle.x, middle.y, thumb.x, thumb.y);
    let d3 = dist(ring.x, ring.y, thumb.x, thumb.y);
    let d4 = dist(pinky.x, pinky.y, thumb.x, thumb.y);

    if (d1 < 30 && d2 < 30 && d3 < 30 && d4 < 30) {
      restartGame();
    }
  }
}

function restartGame() {
  restartOverlay.style.display = "none";
  boxes.gameCompleted = false;
  boxes.resetBoxes();
  fakeWordsInstance.resetBoxes();
}

// Callback function para atualizar a posição das mãos
function gotHands(results) {
  hands = results;
}
