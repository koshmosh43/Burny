window.addEventListener('load', async function() {
    const app = new PIXI.Application({
        width: 720,
        height: 1280,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        antialias: true
    });

    // insert canvas into container
    document.getElementById('game-container').appendChild(app.view);

    // enable zindex sorting
    app.stage.sortableChildren = true;

    // responsive resize handler
    const resize = () => {
        const scale = Math.min(
            window.innerWidth / app.screen.width,
            window.innerHeight / app.screen.height
        );
        app.view.style.position = 'absolute';
        app.view.style.width = `${Math.ceil(app.screen.width * scale)}px`;
        app.view.style.height = `${Math.ceil(app.screen.height * scale)}px`;
        app.view.style.left = '50%';
        app.view.style.top = '50%';
        app.view.style.transform = 'translate(-50%, -50%)';
    };
    window.addEventListener('resize', resize);
    resize();

    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.textContent = 'Loading assets...';
    }

    try {
        const assets = {};
        
        // hide loading message
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // create and initialize the game
        const game = new Game(app, assets);
        await game.init();
        console.log('Game initialized successfully!');

    } catch (error) {
        console.error('Game initialization error:', error);
        if (loadingElement) {
            loadingElement.textContent = 'Failed to load the game. Please refresh.';
        }
    }
});