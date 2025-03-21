class AudioManager {
    /**
     * @param {Object} assets - loaded asset references
     */
    constructor(assets) {
      this.assets = assets;
      this.sounds = {};
      this.musicPlaying = false;
      this.isMuted = false;
      
      // Initialize sounds with Howler
      this.initSounds();
    }
    
    initSounds() {
      try {
        // Create sound sprites using Howler.js
        // Base paths for sounds
        const basePath = './assets/sound/';
        
        // Background music
        this.sounds.bgMusic = new Howl({
          src: [`${basePath}bg-music.wav`],
          loop: true,
          volume: 0.2,
          autoplay: false,
          preload: true,
          onload: () => console.log('Background music loaded successfully'),
          onloaderror: (id, error) => console.warn('Failed to load background music:', error)
        });
        
        // Success sound
        this.sounds.success = new Howl({
          src: [`${basePath}success.wav`],
          volume: 0.5,
          preload: true,
          onloaderror: (id, error) => console.warn('Failed to load success sound:', error)
        });
        
        // Fail sound
        this.sounds.fail = new Howl({
          src: [`${basePath}fail.wav`],
          volume: 0.5,
          preload: true,
          onloaderror: (id, error) => console.warn('Failed to load fail sound:', error)
        });
        
        // Place sound
        this.sounds.place = new Howl({
          src: [`${basePath}place.wav`],
          volume: 0.3,
          preload: true,
          onloaderror: (id, error) => console.warn('Failed to load place sound:', error)
        });
        
        console.log('Audio initialized with Howler.js');
        
      } catch (e) {
        console.error('Error initializing sounds with Howler:', e);
        
        // Create dummy sounds as fallback
        this.sounds.bgMusic = this.createDummySound();
        this.sounds.success = this.createDummySound();
        this.sounds.fail = this.createDummySound();
        this.sounds.place = this.createDummySound();
      }
    }
    
    createDummySound() {
      // Create a dummy Howl-like object for fallback
      return {
        play: () => { return 0; },
        stop: () => {},
        pause: () => {},
        volume: () => {}
      };
    }
    
    playSuccessSound() {
      if (this.isMuted) return;
      try {
        this.sounds.success.play();
      } catch (e) {
        console.warn('Failed to play success sound:', e);
      }
    }
    
    playFailSound() {
      if (this.isMuted) return;
      try {
        this.sounds.fail.play();
      } catch (e) {
        console.warn('Failed to play fail sound:', e);
      }
    }
    
    playPlaceSound() {
      if (this.isMuted) return;
      try {
        this.sounds.place.play();
      } catch (e) {
        console.warn('Failed to play place sound:', e);
      }
    }
    
    playBackgroundMusic() {
      if (this.isMuted || this.musicPlaying) return;
      try {
        // Howler handles autoplay restrictions better
        const id = this.sounds.bgMusic.play();
        this.musicPlaying = true;
        
        // Add event handling
        this.sounds.bgMusic.once('playerror', (soundId, error) => {
          console.warn('Background music playerror:', error);
          this.musicPlaying = false;
          
          // Try to unlock audio with user interaction
          this.setupUnlockAudio();
        });
        
      } catch (e) {
        console.warn('Failed to play background music:', e);
        this.setupUnlockAudio();
      }
    }
    
    setupUnlockAudio() {
      // Create a transparent overlay to capture user interaction
      const unlockOverlay = document.createElement('div');
      unlockOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
      `;
      
      const message = document.createElement('div');
      message.textContent = 'Click to enable audio';
      message.style.cssText = `
        font-size: 24px;
        margin-bottom: 20px;
      `;
      
      const button = document.createElement('button');
      button.textContent = 'Enable Audio';
      button.style.cssText = `
        background-color: #4CAF50;
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
        border-radius: 4px;
      `;
      
      unlockOverlay.appendChild(message);
      unlockOverlay.appendChild(button);
      document.body.appendChild(unlockOverlay);
      
      // Unlock function to be called on user interaction
      const unlockAudio = () => {
        // Unlock Howler audio
        if (Howler.ctx && Howler.ctx.state !== 'running') {
          Howler.ctx.resume().then(() => {
            console.log('AudioContext resumed successfully');
            // Try playing background music again
            if (!this.isMuted) {
              this.sounds.bgMusic.play();
              this.musicPlaying = true;
            }
          });
        } else {
          // Try playing directly
          if (!this.isMuted) {
            this.sounds.bgMusic.play();
            this.musicPlaying = true;
          }
        }
        
        // Remove the overlay
        document.body.removeChild(unlockOverlay);
      };
      
      // Add click event listener to the button and overlay
      button.addEventListener('click', unlockAudio);
      unlockOverlay.addEventListener('click', unlockAudio);
    }
    
    stopBackgroundMusic() {
      if (!this.musicPlaying) return;
      try {
        this.sounds.bgMusic.stop();
        this.musicPlaying = false;
      } catch (e) {
        console.warn('Failed to stop background music:', e);
      }
    }
    
    toggleMute() {
      this.isMuted = !this.isMuted;
      
      if (this.isMuted) {
        // Mute all sounds
        Howler.volume(0);
        this.stopBackgroundMusic();
      } else {
        // Unmute all sounds
        Howler.volume(1);
        if (!this.musicPlaying) {
          this.playBackgroundMusic();
        }
      }
      
      return this.isMuted;
    }
  }