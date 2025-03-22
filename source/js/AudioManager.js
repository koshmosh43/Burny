class AudioManager {
  /**
   * @param {Object} assets - loaded asset references
   */
  constructor(assets) {
    this.assets = assets;
    this.sounds = {};
    this.musicPlaying = false;
    this.isMuted = false;
    this.isAudioUnlocked = false;
    
    // Initialize sounds with Howler
    this.initSounds();
    
    // Add listener to unlock audio on ANY user interaction
    this.addGlobalInteractionListeners();
  }
  
  initSounds() {
    try {
      // Prevent auto-playing before user interaction
      Howler.autoUnlock = false;
      Howler.volume(1.0);
      
      // Initialize empty sound objects - real sources will be set later
      this.sounds = {
        bgMusic: null,
        success: null,
        fail: null,
        place: null
      };
      
      console.log('Audio initialized with Howler.js');
      
    } catch (e) {
      console.error('Error initializing sounds with Howler:', e);
      this.createDummySounds();
    }
  }
  
  createDummySounds() {
    // Create dummy sounds as fallback
    const dummySound = {
      play: () => { return 0; },
      stop: () => {},
      pause: () => {},
      volume: () => {},
      load: () => {},
      once: () => {}
    };
    
    this.sounds = {
      bgMusic: dummySound,
      success: dummySound,
      fail: dummySound,
      place: dummySound
    };
  }
  
  addGlobalInteractionListeners() {
    // Add listeners to unlock audio on ANY user interaction
    const unlockEvents = ['click', 'touchstart', 'touchend', 'mousedown', 'keydown'];
    
    const unlockAudio = () => {
      // Only do this once
      if (!this.isAudioUnlocked) {
        this.unlockAudio();
        
        // Remove all event listeners once audio is unlocked
        unlockEvents.forEach(eventName => {
          document.removeEventListener(eventName, unlockAudio, true);
        });
      }
    };
    
    // Add multiple event listeners for different types of interactions
    unlockEvents.forEach(eventName => {
      document.addEventListener(eventName, unlockAudio, true);
    });
    
    console.log('Global interaction listeners added to unlock audio');
  }
  
  unlockAudio() {
    if (this.isAudioUnlocked) return;
    
    console.log('Unlocking audio on user interaction...');
    
    try {
      // Unlock Howler audio context
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        Howler.ctx.resume().then(() => {
          console.log('AudioContext resumed successfully');
          this.loadSounds();
        }).catch(err => {
          console.warn('Failed to resume AudioContext:', err);
          this.loadSounds();
        });
      } else {
        // AudioContext already running or not available
        this.loadSounds();
      }
    } catch (e) {
      console.error('Error unlocking audio:', e);
      this.loadSounds();
    }
  }
  
  isDataURI(str) {
    return typeof str === 'string' && str.startsWith('data:');
  }
  
  loadSounds() {
    console.log("Loading sounds...");
    
    if (this.assets) {
      console.log("Using provided audio assets");
      
      // Background music
      if (this.assets.bgMusicUrl) {
        console.log("Creating bgMusic sound with source:", 
          this.isDataURI(this.assets.bgMusicUrl) ? "base64 data" : this.assets.bgMusicUrl);
        
        this.sounds.bgMusic = new Howl({
          src: [this.assets.bgMusicUrl],
          loop: true,
          volume: 0.2,
          format: ['mp3'],
          html5: true
        });
      }
      
      // Success sound
      if (this.assets.successUrl) {
        console.log("Creating success sound with source:", 
          this.isDataURI(this.assets.successUrl) ? "base64 data" : this.assets.successUrl);
        
        this.sounds.success = new Howl({
          src: [this.assets.successUrl],
          volume: 0.5,
          format: ['mp3'],
          html5: true
        });
      }
      
      // Fail sound
      if (this.assets.failUrl) {
        console.log("Creating fail sound with source:", 
          this.isDataURI(this.assets.failUrl) ? "base64 data" : this.assets.failUrl);
        
        this.sounds.fail = new Howl({
          src: [this.assets.failUrl],
          volume: 0.5,
          format: ['mp3'],
          html5: true
        });
      }
      
      // Place sound
      if (this.assets.placeUrl) {
        console.log("Creating place sound with source:", 
          this.isDataURI(this.assets.placeUrl) ? "base64 data" : this.assets.placeUrl);
        
        this.sounds.place = new Howl({
          src: [this.assets.placeUrl],
          volume: 0.3,
          format: ['mp3'],
          html5: true
        });
      }
    } else {
      console.warn("No assets provided for sound loading!");
    }
    
    // Mark audio as unlocked
    this.isAudioUnlocked = true;
    
    // Start background music immediately
    console.log("Starting background music...");
    this.playBackgroundMusic();
  }
  
  playSuccessSound() {
    if (this.isMuted || !this.isAudioUnlocked || !this.sounds.success) return;
    try {
      console.log("Playing success sound");
      this.sounds.success.play();
    } catch (e) {
      console.warn('Failed to play success sound:', e);
    }
  }
  
  playFailSound() {
    if (this.isMuted || !this.isAudioUnlocked || !this.sounds.fail) return;
    try {
      console.log("Playing fail sound");
      this.sounds.fail.play();
    } catch (e) {
      console.warn('Failed to play fail sound:', e);
    }
  }
  
  playPlaceSound() {
    if (this.isMuted || !this.isAudioUnlocked || !this.sounds.place) return;
    try {
      console.log("Playing place sound");
      this.sounds.place.play();
    } catch (e) {
      console.warn('Failed to play place sound:', e);
    }
  }
  
  playBackgroundMusic() {
    if (this.isMuted || this.musicPlaying || !this.isAudioUnlocked || !this.sounds.bgMusic) return;
    try {
      console.log("Attempting to play background music...");
      const id = this.sounds.bgMusic.play();
      this.musicPlaying = true;
      console.log("Background music started successfully!");
      
      // Add error handling
      this.sounds.bgMusic.once('playerror', (soundId, error) => {
        console.warn('Background music playerror:', error);
        this.musicPlaying = false;
        
        // Try again after a short delay
        setTimeout(() => {
          if (!this.musicPlaying && this.isAudioUnlocked && !this.isMuted) {
            console.log("Retrying background music playback...");
            this.sounds.bgMusic.play();
          }
        }, 1000);
      });
      
    } catch (e) {
      console.warn('Failed to play background music:', e);
      
      // Try again after a short delay
      setTimeout(() => {
        if (!this.musicPlaying && this.isAudioUnlocked && !this.isMuted) {
          console.log("Retrying background music playback after error...");
          this.playBackgroundMusic();
        }
      }, 1000);
    }
  }
  
  stopBackgroundMusic() {
    if (!this.musicPlaying || !this.sounds.bgMusic) return;
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
      if (!this.musicPlaying && this.isAudioUnlocked) {
        this.playBackgroundMusic();
      }
    }
    
    return this.isMuted;
  }
}