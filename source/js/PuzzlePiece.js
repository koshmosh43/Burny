class PuzzlePiece {
    /**
     * @param {Game} game - main game instance
     * @param {PIXI.Texture} texture - texture for the piece
     * @param {number} id - piece id (1-6)
     * @param {Object} position - starting position {x, y}
     * @param {number} pointValue - points value (default 10)
     */
    constructor(game, texture, id, position, pointValue = 10) {
      this.game = game;
      this.texture = texture;
      this.id = id;
      this.pointValue = pointValue;
      this.originalPosition = { x: position.x, y: position.y };
      this.placed = false;
      this.dragOffset = { x: 0, y: 0 };
      this.dragging = false;
  
      // create container
      this.container = new PIXI.Container();
      this.container.position.set(position.x, position.y);
      this.container.zIndex = 10;
      this.container.sortableChildren = true;
  
      // create sprite
      this.sprite = new PIXI.Sprite(this.texture);
      this.sprite.anchor.set(0.5);
      this.sprite.scale.set(1, 1);
      this.container.addChild(this.sprite);
  
      // add points text
      this.pointsText = new PIXI.Text(`${this.pointValue} pts`, {
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 'white',
        stroke: 'black',
        strokeThickness: 3
      });
      this.pointsText.anchor.set(0.5);
      this.pointsText.position.set(0, this.sprite.height / 2 + 20);
      this.container.addChild(this.pointsText);
    }
  
    attachEvents() {
      this.container.eventMode = 'static';
      this.container.cursor = 'pointer';
      this.container.on('pointerdown', this.onDragStart.bind(this));
      this.container.on('pointermove', this.onDragMove.bind(this));
      this.container.on('pointerup', this.onDragEnd.bind(this));
      this.container.on('pointerupoutside', this.onDragEnd.bind(this));
    }
  
    onDragStart(event) {
      if (this.placed || this.game.gameCompleted) return;
      if (this.game.tutorialActive) {
        this.game.stopTutorial();
      }
      this.dragging = true;
      this.game.dragTarget = this;
  
      const globalPos = event.global;
      this.dragOffset.x = this.container.x - globalPos.x;
      this.dragOffset.y = this.container.y - globalPos.y;
  
      gsap.to(this.container.scale, { x: 1.1, y: 1.1, duration: 0.2 });
      this.container.zIndex = 100;
      this.game.audio.playPlaceSound();
    }
  
    onDragMove(event) {
      if (!this.dragging) return;
      const globalPos = event.global;
      this.container.position.set(
        globalPos.x + this.dragOffset.x,
        globalPos.y + this.dragOffset.y
      );
    }
  
    onDragEnd(event) {
      if (!this.dragging) return;
      this.dragging = false;
      this.game.dragTarget = null;
      gsap.to(this.container.scale, { x: 1, y: 1, duration: 0.2 });
      this.container.zIndex = 10;
  
      const globalPos = event.global;
      if (!this.game.gridContainer || !this.game.gridContainer.worldTransform) {
        this.returnToOriginal();
        this.game.showFailureFeedback();
        return;
      }
  
      const localPos = new PIXI.Point();
      this.game.gridContainer.worldTransform.applyInverse(globalPos, localPos);
  
      const targetCell = this.game.getGridCellById(this.id);
      if (!targetCell || targetCell.filled) {
        this.returnToOriginal();
        this.game.audio.playFailSound();
        this.game.showFailureFeedback();
        return;
      }
  
      const threshold = 50;
      const dx = Math.abs(localPos.x - targetCell.x);
      const dy = Math.abs(localPos.y - targetCell.y);
      
      if (dx <= threshold && dy <= threshold) {
        this.placed = true;
        const targetX = this.game.cupcakeContainer.x + targetCell.x;
        const targetY = this.game.cupcakeContainer.y + targetCell.y;
        gsap.to(this.container, {
          x: targetX,
          y: targetY,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            this.pointsText.visible = false;
            this.game.placePieceInCell(this, this.id);
          }
        });
      } else {
        this.returnToOriginal();
        this.game.audio.playFailSound();
      }
    }
    
    returnToOriginal() {
      gsap.to(this.container.position, {
        x: this.originalPosition.x,
        y: this.originalPosition.y,
        duration: 0.3,
        ease: "back.out(1.5)",
        onComplete: () => {
          this.game.showFailureFeedback();
        }
      });
    }
  
    reset() {
      this.placed = false;
      this.pointsText.visible = true;
      gsap.to(this.container.position, {
        x: this.originalPosition.x,
        y: this.originalPosition.y,
        duration: 0.5,
        ease: "back.out(1.5)"
      });
    }
  }  