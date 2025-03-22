class Game {
    constructor(app, assets) {
      this.app = app;
      this.assets = assets;
      this.audio = new AudioManager(assets);
      this.gameScene = new PIXI.Container();
      this.resultScene = new PIXI.Container();
      this.resultScene.visible = false;
      this.app.stage.addChild(this.gameScene);
      this.app.stage.addChild(this.resultScene);
  
      this.width = app.screen.width;
      this.height = app.screen.height;
      this.gameCompleted = false;
      this.dragTarget = null;
      this.currentIQ = 60;
      this.tutorialActive = true;
      this.pieces = [];
      this.gridCells = [];
      this.cellSize = 60;
    }
  
    async init() {
      this.createBackground();
      this.createIQDisplay();
      this.createCupcakeShape();
      this.createGrid();
      this.createPuzzlePieces();
      this.createTutorialHand();
      this.createFeedbackText();
      this.createResultScreen();
  
      // start hand animation
      this.startTutorialAnimation();
      this.app.ticker.add(() => this.update());
      this.audio.playBackgroundMusic();
    }
  
    update() {
      if (this.tutorialActive && !this.tutorialTween && this.hand) {
        this.startTutorialAnimation();
      }
    }
  
    createBackground() {
      try {
        this.bg = new PIXI.Sprite(this.assets.bg);
        this.bg.width = this.width;
        this.bg.height = this.height;
        this.bg.zIndex = 1;
      } catch (e) {
        this.bg = new PIXI.Graphics()
          .beginFill(0x1099bb)
          .drawRect(0, 0, this.width, this.height)
          .endFill();
      }
      this.gameScene.addChild(this.bg);
    }
  
    createIQDisplay() {
      this.topBanner = new PIXI.Graphics()
        .beginFill(0x66B2B2, 0.7)
        .drawRoundedRect(0, 0, 600, 70, 35)
        .endFill();
      this.topBanner.position.set(this.width / 2 - 300, 50);
      this.topBanner.zIndex = 10;
      this.gameScene.addChild(this.topBanner);
  
      const bannerStyle = {
        fontFamily: 'Arial',
        fontSize: 28,
        fontWeight: 'bold',
        fill: 'white',
        align: 'center'
      };
      this.bannerText = new PIXI.Text('fill up the cupcake for iq 120+', bannerStyle);
      this.bannerText.anchor.set(0.5);
      this.bannerText.position.set(this.width / 2, 85);
      this.bannerText.zIndex = 11;
      this.gameScene.addChild(this.bannerText);
  
      const iqStyle = {
        fontFamily: 'Arial',
        fontSize: 72,
        fontWeight: 'bold',
        fill: 'white',
        align: 'center'
      };
      this.iqText = new PIXI.Text(`iq = ${this.currentIQ}`, iqStyle);
      this.iqText.anchor.set(0.5);
      this.iqText.position.set(this.width / 2, 180);
      this.iqText.zIndex = 11;
      this.gameScene.addChild(this.iqText);
    }
  
    createCupcakeShape() {
      this.cupcakeContainer = new PIXI.Container();
      this.cupcakeContainer.position.set(this.width / 2, this.height / 2);
      this.cupcakeContainer.zIndex = 5;
      this.gameScene.addChild(this.cupcakeContainer);
  
      this.gridContainer = new PIXI.Container();
      this.gridContainer.zIndex = 8;
      this.cupcakeContainer.addChild(this.gridContainer);
  
      try {
        this.redFill = new PIXI.Sprite(this.assets.cupcakeRedFill);
        this.redFill.anchor.set(0.5);
        this.redFill.visible = false;
        this.redFill.zIndex = 6;
        this.cupcakeContainer.addChild(this.redFill);
      } catch (e) {
        this.redFill = new PIXI.Graphics()
          .beginFill(0xFF0000, 0.5)
          .drawRect(-150, -200, 300, 400)
          .endFill();
        this.redFill.visible = false;
        this.redFill.zIndex = 6;
        this.cupcakeContainer.addChild(this.redFill);
      }
  
      try {
        this.cupcakeBg = new PIXI.Sprite(this.assets.cupcakeBg);
        this.cupcakeBg.anchor.set(0.5);
        this.cupcakeBg.zIndex = 7;
        this.cupcakeContainer.addChild(this.cupcakeBg);
        this.cupcakeWidth = this.cupcakeBg.width;
        this.cupcakeHeight = this.cupcakeBg.height;
      } catch (e) {
        console.error("failed to load cupcake background:", e);
        this.cupcakeBg = new PIXI.Graphics()
          .beginFill(0xDDDDFF)
          .drawRect(-150, -200, 300, 400)
          .endFill();
        this.cupcakeBg.zIndex = 7;
        this.cupcakeContainer.addChild(this.cupcakeBg);
        this.cupcakeWidth = 300;
        this.cupcakeHeight = 400;
      }
    }
  
    createGrid() {
      const gridGraphics = new PIXI.Graphics();
      gridGraphics.lineStyle(3, 0x00FF00, 0);
      gridGraphics.moveTo(0, -this.cupcakeHeight / 2);
      gridGraphics.lineTo(0, this.cupcakeHeight / 2);
      const upperY = -this.cupcakeHeight / 4;
      gridGraphics.moveTo(-this.cupcakeWidth / 2, upperY);
      gridGraphics.lineTo(this.cupcakeWidth / 2, upperY);
      const middleY = 0;
      gridGraphics.moveTo(-this.cupcakeWidth / 2, middleY);
      gridGraphics.lineTo(this.cupcakeWidth / 2, middleY);
      const lowerY = this.cupcakeHeight / 4;
      gridGraphics.moveTo(-this.cupcakeWidth / 2, lowerY);
      gridGraphics.lineTo(this.cupcakeWidth / 2, lowerY);
      this.gridContainer.addChild(gridGraphics);
      console.log(this.cupcakeHeight);
  
      this.gridCells = [
        { id: 1, x: -20, y: -192, filled: false },
        { id: 2, x: 50, y: -47, filled: false },
        { id: 3, x: 106, y: -108, filled: false },
        { id: 4, x: -85, y: -46, filled: false },
        { id: 5, x: -84, y: 138, filled: false },
        { id: 6, x: 82, y: 137, filled: false }
      ];
    }
  
    getGridCellById(id) {
      return this.gridCells.find(cell => cell.id === id);
    }
  
    createPuzzlePieces() {
      const positions = [
        { x: this.width / 6, y: this.height / 5 },
        { x: this.width / 6, y: this.height - this.height / 5 },
        { x: this.width - this.width / 6, y: this.height / 5 },
        { x: this.width / 7, y: this.height / 2 },
        { x: this.width - this.width / 7, y: this.height / 2 },
        { x: this.width - this.width / 6, y: this.height - this.height / 5 }
      ];
      console.log("creating puzzle pieces at positions:", positions);
      for (let i = 0; i < 6; i++) {
        try {
          const figureTexture = this.assets[`figure_${i + 1}`];
          if (!figureTexture) throw new Error(`texture for figure_${i + 1}.png not found`);
          const piece = new PuzzlePiece(this, figureTexture, i + 1, positions[i], 10);
          piece.container.zIndex = 20;
          this.pieces.push(piece);
          this.gameScene.addChild(piece.container);
          piece.attachEvents();
          console.log(`created piece ${i + 1} at position ${positions[i].x}, ${positions[i].y}`);
        } catch (e) {
          console.error(`failed to create puzzle piece ${i + 1}:`, e);
        }
      }
    }
  
    createTutorialHand() {
      try {
        this.hand = new PIXI.Sprite(this.assets.hand);
        this.hand.anchor.set(0.2, 0.2);
        this.hand.scale.set(0.7);
      } catch (e) {
        this.hand = new PIXI.Graphics()
          .beginFill(0xffffff)
          .drawCircle(0, 0, 20)
          .endFill();
      }
      this.hand.zIndex = 999;
      this.hand.visible = true;
      this.gameScene.addChild(this.hand);
      this.app.ticker.addOnce(() => {
        if (this.pieces.length > 0) {
          const f0 = this.pieces[0];
          this.hand.position.set(f0.container.x + 30, f0.container.y + 30);
        }
      });
    }
  
    createFeedbackText() {
      const style = {
        fontFamily: 'Arial',
        fontSize: 60,
        fontWeight: 'bold',
        fill: 'white',
        stroke: 'black',
        strokeThickness: 6,
        align: 'center'
      };
      this.feedbackText = new PIXI.Text('', style);
      this.feedbackText.anchor.set(0.5);
      this.feedbackText.position.set(this.width / 2, this.height / 2 - 150);
      this.feedbackText.visible = false;
      this.feedbackText.zIndex = 1000;
      this.gameScene.addChild(this.feedbackText);
    }
  
    createResultScreen() {
      // background
      try {
        const finalBg = new PIXI.Sprite(this.assets.win_bg);
        finalBg.width = this.width;
        finalBg.height = this.height;
        finalBg.position.set(0, 0);
        this.resultScene.addChild(finalBg);
      } catch (e) {
        const g = new PIXI.Graphics()
          .beginFill(0x0f5566)
          .drawRect(0, 0, this.width, this.height)
          .endFill();
        this.resultScene.addChild(g);
      }
  
      // text-based logo fallback
      this.logoSprite = new PIXI.Text("PLAYDOKU", {
        fontFamily: 'Arial',
        fontSize: 60,
        fontWeight: 'bold',
        fill: '#1abc9c',
        stroke: '#ffffff',
        strokeThickness: 5,
        align: 'center'
      });
      this.logoSprite.anchor.set(0.5);
      this.logoSprite.position.set(this.width / 2, this.height * 0.3);
      this.logoSprite.alpha = 0;
      this.resultScene.addChild(this.logoSprite);
  
      try {
        if (this.assets.logo) {
          const logoImageSprite = new PIXI.Sprite(this.assets.logo);
          logoImageSprite.anchor.set(0.5);
          logoImageSprite.position.set(this.width / 2, this.height * 0.3);
          logoImageSprite.scale.set(0.8);
          logoImageSprite.alpha = 0;
          this.resultScene.addChild(logoImageSprite);
          this.logoSprite = logoImageSprite;
        }
      } catch (e) {
        console.log("using text-based logo instead of image");
      }
  
      // button with text
      this.playButton = new PIXI.Sprite(this.assets.button);
      this.playButton.anchor.set(0.5);
      this.playButton.position.set(this.width / 2, this.height * 0.6);
      this.playButton.scale.set(0.6);
      this.playButton.interactive = true;
      this.playButton.buttonMode = true;
      this.playButton.alpha = 0;
      this.resultScene.addChild(this.playButton);
      const buttonText = new PIXI.Text('PLAY NOW', {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: '#000000'
      });
      buttonText.anchor.set(0.5, 0.7);
      buttonText.position.set(0, 0);
      this.playButton.addChild(buttonText);
      this.playButton.on('pointerdown', () => {
        window.open("https://play.google.com/store/apps/details?id=games.burny.playdoku.block.puzzle&hl=en&gl=US", "_blank");
      });
  
      // corner tiles
      const tileOffset = 50;
      this.cornerTiles = [];
      try {
        const play1 = new PIXI.Sprite(this.assets.play1);
        play1.anchor.set(0.5);
        play1.position.set(tileOffset, tileOffset);
        play1.scale.set(1.1);
        play1.alpha = 0;
        this.resultScene.addChild(play1);
        this.cornerTiles.push(play1);
  
        const play2 = new PIXI.Sprite(this.assets.play2);
        play2.anchor.set(0.5);
        play2.position.set(this.width - tileOffset, tileOffset);
        play2.scale.set(1.1);
        play2.alpha = 0;
        this.resultScene.addChild(play2);
        this.cornerTiles.push(play2);
  
        const play3 = new PIXI.Sprite(this.assets.play3);
        play3.anchor.set(0.5);
        play3.position.set(tileOffset, this.height - tileOffset);
        play3.scale.set(1.1);
        play3.alpha = 0;
        this.resultScene.addChild(play3);
        this.cornerTiles.push(play3);
  
        const play4 = new PIXI.Sprite(this.assets.play4);
        play4.anchor.set(0.5);
        play4.position.set(this.width - tileOffset, this.height - tileOffset);
        play4.scale.set(1.1);
        play4.alpha = 0;
        this.resultScene.addChild(play4);
        this.cornerTiles.push(play4);
      } catch (e) {
        console.error("error loading corner tiles:", e);
      }
  
      // timeline for result animations
      this.resultTimeline = gsap.timeline({ paused: true });
      this.resultTimeline.fromTo(
        this.logoSprite,
        { y: this.logoSprite.y + 80, alpha: 0, scale: 0.4 },
        { duration: 0.7, y: this.logoSprite.y, alpha: 1, scale: 1, ease: 'back.out(1.7)' }
      );
      this.resultTimeline.fromTo(
        this.playButton,
        { y: this.playButton.y - 100, alpha: 0 },
        { duration: 0.6, y: this.playButton.y, alpha: 1, ease: 'back.out(1.7)' },
        "-=0.3"
      );
      if (this.cornerTiles.length > 0) {
        this.cornerTiles.forEach((tile, index) => {
          const rotation = index % 2 === 0 ? -0.6 : 0.6;
          this.resultTimeline.fromTo(
            tile,
            { rotation: 0, alpha: 0 },
            { duration: 0.6, rotation: rotation, alpha: 1, ease: 'back.out(1.7)' },
            "-=0.4"
          );
        });
      }
    }
  
    showResultScreen() {
      console.log("showing result screen...");
      console.log("logo reference before transition:", this.logoSprite);
      gsap.to(this.gameScene, {
        alpha: 0,
        duration: 0.5,
        onComplete: () => {
          this.gameScene.visible = false;
          this.resultScene.visible = true;
          this.resultScene.alpha = 0;
          console.log("before animation - logo present:", Boolean(this.logoSprite));
          if (this.logoSprite) {
            console.log("logo alpha:", this.logoSprite.alpha);
            console.log("logo visible:", this.logoSprite.visible);
          }
          gsap.to(this.resultScene, {
            alpha: 1,
            duration: 0.5,
            onComplete: () => {
              console.log("result scene visible, starting animations");
              console.log("timeline exists:", Boolean(this.resultTimeline));
              if (this.resultTimeline) {
                this.resultTimeline.restart();
              } else {
                console.error("result timeline is missing!");
              }
            }
          });
        }
      });
    }
  
    startTutorialAnimation() {
      if (!this.hand || this.tutorialTween) return;
      this.tutorialActive = true;
      this.app.ticker.addOnce(() => {
        if (this.pieces.length === 0) return;
        const firstPiece = this.pieces[0];
        const startX = firstPiece.container.x + 30;
        const startY = firstPiece.container.y + 30;
        const targetCell = this.getGridCellById(1);
        const targetX = this.cupcakeContainer.x + targetCell.x;
        const targetY = this.cupcakeContainer.y + targetCell.y;
        this.tutorialTween = gsap.timeline({ repeat: -1 })
          .to({}, { duration: 0.5 })
          .to(this.hand.scale, { x: 0.8, y: 0.8, duration: 0.2 })
          .to(this.hand.position, { x: targetX, y: targetY, duration: 1.5, ease: "power2.inOut" })
          .to(this.hand.scale, { x: 0.7, y: 0.7, duration: 0.2 })
          .to({}, { duration: 0.8 })
          .to(this.hand.position, { x: startX, y: startY, duration: 1, ease: "power2.inOut" })
          .to({}, { duration: 0.8 });
      });
    }
  
    stopTutorial() {
      this.tutorialActive = false;
      if (this.hand) this.hand.visible = false;
      if (this.tutorialTween) {
        this.tutorialTween.kill();
        this.tutorialTween = null;
      }
    }
  
    placePieceInCell(piece, cellId) {
      const cell = this.getGridCellById(cellId);
      if (cell) {
        cell.filled = true;
        this.currentIQ += piece.pointValue;
        this.updateIQDisplay();
        this.audio.playPlaceSound();
        this.showCorrectPlacementFeedback(cell);
        this.checkPuzzleCompletion();
      }
    }
  
    updateIQDisplay() {
      this.iqText.text = `iq = ${this.currentIQ}`;
      gsap.fromTo(this.iqText.scale, { x: 1.2, y: 1.2 }, { x: 1.0, y: 1.0, duration: 0.3, ease: "elastic.out(1.2)" });
      if (this.currentIQ >= 120) {
        this.bannerText.text = "great job! iq 120+ reached!";
        gsap.to(this.topBanner, { tint: 0x00AA00, duration: 0.5 });
      }
    }
  
    showCorrectPlacementFeedback(cell) {
      const flash = new PIXI.Graphics()
        .beginFill(0xFFFFFF, 0.7)
        .drawRect(-50, -50, 100, 100)
        .endFill();
      flash.position.set(cell.x, cell.y);
      this.gridContainer.addChild(flash);
      gsap.to(flash, {
        alpha: 0, duration: 0.5,
        onComplete: () => this.gridContainer.removeChild(flash)
      });
      const points = new PIXI.Text("+10", {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 'yellow',
        stroke: 'black',
        strokeThickness: 4
      });
      points.anchor.set(0.5);
      points.position.set(this.cupcakeContainer.x + cell.x, this.cupcakeContainer.y + cell.y - 30);
      points.zIndex = 1000;
      this.gameScene.addChild(points);
      gsap.to(points.position, { y: points.position.y - 50, duration: 1, ease: "power1.out" });
      gsap.to(points, { alpha: 0, duration: 1, onComplete: () => this.gameScene.removeChild(points) });
    }
  
    checkPuzzleCompletion() {
      const filledCount = this.gridCells.filter(c => c.filled).length;
      if (filledCount === this.gridCells.length) {
        this.completeGame();
      }
    }
  
    showFailureFeedback() {
      if (this.gameCompleted) return;
      this.feedbackText.text = "try again";
      this.feedbackText.visible = true;
      this.audio.playFailSound();
      this.redFill.visible = true;
      this.redFill.alpha = 0.7;
      gsap.timeline()
        .to(this.redFill, { alpha: 0, duration: 0.8, ease: "power2.inOut", onComplete: () => {
          this.redFill.visible = false;
        }})
        .to(this.feedbackText.scale, { x: 1.2, y: 1.2, duration: 0.3, yoyo: true, repeat: 1 }, 0)
        .to(this.feedbackText, { 
          alpha: 0, 
          duration: 0.5, 
          delay: 1, 
          onComplete: () => {
            this.feedbackText.visible = false;
            this.feedbackText.alpha = 1;
            this.currentIQ = 60;
            this.updateIQDisplay();
            this.resetPuzzle();
          }
        });
    }
  
    resetPuzzle() {
      this.pieces.forEach(p => {
        if (p.placed) p.reset();
      });
      this.gridCells.forEach(c => c.filled = false);
    }
  
    completeGame() {
      if (this.gameCompleted) return;
      this.gameCompleted = true;
      this.redFill.visible = false;
      this.audio.playSuccessSound();
      this.feedbackText.text = "well done";
      this.feedbackText.visible = true;
      gsap.fromTo(this.feedbackText.scale,
        { x: 0.5, y: 0.5 },
        {
          x: 1, y: 1, duration: 0.5, ease: "back.out(1.5)",
          onComplete: () => {
            setTimeout(() => this.showResultScreen(), 1500);
          }
        }
      );
    }
  }  