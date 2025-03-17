class FakeWords {
  constructor(fakeWords, size) {
    this.bodies = [];
    this.size = size;
    this.fakeWords = fakeWords;
    this.followingIndex = -1;
    this.slotsFilled = new Array(fakeWords.length).fill(null);
    
    this.initialize();
  }

  initialize() {
    // Inicializa as palavras falsas (fakeWords)
    for (let i = 0; i < this.fakeWords.length; i++) {
      let wordWidth = textWidth(this.fakeWords[i]) + 20; // Ajusta o tamanho da palavra com um padding
      let x = random(width / 6, (5 * width) / 6); 
      let y = random(350, 400);  

      // Criando o corpo de cada palavra falsa com as dimensões corretas
      let fakeWord = Bodies.rectangle(x, y, wordWidth*2, this.size, {
        frictionAir: 0.1,
        restitution: 0.6,
        density: 0.002,   // Para não ficarem muito leves
        angle: random(-0.1, 0.1) // Pequena rotação inicial
      });

      // Adiciona o corpo da palavra falsa ao array de corpos
      this.bodies.push(fakeWord);
      Composite.add(engine.world, fakeWord);
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

  checkWin() {
    // Você pode verificar as palavras formadas pelas fakeWords aqui, se necessário.
    // Isso dependerá de como você deseja integrar as fakeWords no processo de vitória.
  }

  resetBoxes() {
    for (let i = 0; i < this.bodies.length; i++) {
      Body.setStatic(this.bodies[i], false);
      Body.setPosition(this.bodies[i], { x: width / 4 + i * 100, y: 300 });
      this.slotsFilled[i] = null;
    }
  }

  display() {
    textAlign(CENTER, CENTER);
    textSize(24);

    // Agora desenhar as caixas das fakeWords
    for (let i = 0; i < this.bodies.length; i++) {
      let x1 = this.bodies[i].position.x;
      let y1 = this.bodies[i].position.y;

      fill(collorBank[i]);
      textSize(40);
      text(this.fakeWords[i], x1, y1);  // Desenha cada palavra individualmente
    }
  }
}
