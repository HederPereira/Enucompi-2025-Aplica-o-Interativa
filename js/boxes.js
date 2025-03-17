class Boxes {
  constructor(num, size) {
    this.bodies = [];
    this.num = num;
    this.size = size;
    this.letters = gameWord;
    this.followingIndex = -1;
    this.platforms = [];
    this.slotsFilled = new Array(num).fill(null);
    this.gameCompleted = false;
    
    this.initialize();
  }

initialize() {
  for (let i = 0; i < this.num; i++) {
    let wordWidth = textWidth(this.letters[i]) + 20;
    let x = random(100, 1100); 
    let y = random(550, 750);  

    let box = Bodies.rectangle(x, y, wordWidth*2, this.size, {
      frictionAir: 0.1,
      restitution: 0.6,
      density: 0.002,   // Para não ficarem muito leves
      angle: random(-0.1, 0.1) // Pequena rotação inicial
    });
    this.bodies.push(box);
    Composite.add(engine.world, [box]);

    let platformX = width / 4 + i * 200;
    let platformY = 220;  // Deslocamos um pouco para baixo

    let platform = Bodies.rectangle(platformX, platformY + 10, this.size * 5, 17, { isStatic: true });
    this.platforms.push(platform);
    Composite.add(engine.world, [platform]);
  }
}

  
  
checkCollision(pointer, thumb) {
  let distance = dist(pointer.position.x, pointer.position.y, thumb.position.x, thumb.position.y);

  if (this.followingIndex === -1) {
    if (distance < 50) {  // Verifica se o gesto de pinça foi feito
      for (let i = 0; i < this.bodies.length; i++) {
        let box = this.bodies[i];
        let boxDistance = dist(box.position.x, box.position.y, pointer.position.x, pointer.position.y);

        if (boxDistance < this.size * 1.5 && !this.slotsFilled.includes(i)) {
          this.followingIndex = i;
          break;
        }
      }
    }
  } else {
    let box = this.bodies[this.followingIndex];

    // Se os dedos se afastarem, parar de seguir
    if (distance > 120) {  // Define um limite para soltar a caixa
      this.followingIndex = -1;
    } else {
      let newPosition = {
        x: lerp(box.position.x, pointer.position.x, 0.2),
        y: lerp(box.position.y, pointer.position.y, 0.2)
      };
      Body.setPosition(box, newPosition);
    }
  }
}



  checkPlatforms() {
    let allPlaced = true;
    for (let i = 0; i < this.bodies.length; i++) {
        let box = this.bodies[i];
        let platform = this.platforms[i];

        let distance = dist(box.position.x, box.position.y, platform.position.x, platform.position.y);

        if (distance < this.size) { // Aumentei a margem para this.size
            Body.setPosition(box, { x: platform.position.x, y: platform.position.y - this.size / 2 });
            Body.setStatic(box, true);
            
            if (!this.slotsFilled[i]) { // Só armazena se ainda não estiver preenchido
                this.slotsFilled[i] = this.letters[i];
            }

            if (this.followingIndex === i) {
                this.followingIndex = -1;
            }
        } else {
            allPlaced = false;
        }
    }

    if (this.slotsFilled.every(slot => slot !== null)) {
        this.checkWin();
    }
  
    console.log(this.slotsFilled);
}


  checkWin() {
    let wordFormed = this.slotsFilled.join("");
    let correctWord = gameWord.join("");
    
    if (wordFormed === correctWord) {
      console.log("Você venceu!");
      this.gameCompleted = true;
      console.log(this.gameCompleted);
    } else {
      console.log("Tente novamente!");
      this.resetBoxes();
    }
  }

  resetBoxes() {
    for (let i = 0; i < this.bodies.length; i++) {
      Body.setStatic(this.bodies[i], false); // Permitir que as palavras se movam novamente
      Body.setPosition(this.bodies[i], { x: width / 4 + i * 100, y: 500 });
      this.slotsFilled[i] = null;
    }
  }
  
display() {
  textAlign(CENTER, CENTER);
  textSize(24);

  // Desenhar os slots um pouco acima da posição real da plataforma
  fill("#d3d3d3");
  for (let i = 0; i < this.platforms.length; i++) {
    let px = this.platforms[i].position.x;
    let py = this.platforms[i].position.y - 20;
    let wordWidth = textWidth(this.letters[i]) + 20; // Ajuste para a moldura ficar maior que a palavra
    
    rectMode(CENTER);
    rect(px, py, wordWidth * 1.5, this.size*1.3); // Ajustando a largura da moldura
    
  }

  // Agora desenhar as caixas por cima
  for (let i = 0; i < this.bodies.length; i++) {
    let x1 = this.bodies[i].position.x;
    let y1 = this.bodies[i].position.y;


    fill(collorBank[i]);
    textSize(40);
    text(this.letters[i], x1, y1);
  }
}

}
