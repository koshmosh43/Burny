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

    // Asset paths - only image assets are loaded here
    // Audio will be loaded directly by Howler in AudioManager
    const imagePaths = {
        bg: './assets/BG.png',
        win_bg: './assets/win-bg.png',
        cupcakeBg: './assets/cupcake-bg.png',
        cupcakeRedFill: './assets/cupcake-red_fill.png',
        hand: './assets/Hand.png',
        logo: './assets/logo.png',
        button: './assets/button.png',
        play1: './assets/play1.png',
        play2: './assets/play2.png',
        play3: './assets/play3.png',
        play4: './assets/play4.png',
        figure_1: './assets/figure_1.png',
        figure_2: './assets/figure_2.png',
        figure_3: './assets/figure_3.png',
        figure_4: './assets/figure_4.png',
        figure_5: './assets/figure_5.png',
        figure_6: './assets/figure_6.png'
    };

    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.textContent = 'Loading assets...';
    }

    try {
        // Initialize PIXI Assets system
        await PIXI.Assets.init();
        
        // Create assets object to hold all resources
        const assets = {};
        
        // Load only image assets through PIXI.Assets
        const loadPromises = [];
        const keys = Object.keys(imagePaths);
        let loadedCount = 0;
        const totalAssets = keys.length;
        
        for (const key of keys) {
            const path = imagePaths[key];
            const prom = PIXI.Assets.load(path)
                .then(asset => {
                    assets[key] = asset;
                    loadedCount++;
                    if (loadingElement) {
                        const percent = Math.round((loadedCount / totalAssets) * 100);
                        loadingElement.textContent = `Loading: ${percent}%`;
                    }
                })
                .catch(err => {
                    console.warn(`Failed to load image: ${key} at ${path}`, err);
                    assets[key] = null;
                    loadedCount++;
                    if (loadingElement) {
                        const percent = Math.round((loadedCount / totalAssets) * 100);
                        loadingElement.textContent = `Loading: ${percent}%`;
                    }
                });
            loadPromises.push(prom);
        }
        
        // Wait for all image assets to load
        await Promise.allSettled(loadPromises);

        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // Create and initialize the game
        // Note: AudioManager will handle audio loading using Howler.js
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