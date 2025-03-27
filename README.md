# Cupcake Puzzle IQ Game - AppLovin Playable Ad

A fun, interactive playable advertisement for a puzzle game where users complete a cupcake by dragging pieces to the correct positions, with each correct placement increasing their "IQ score".

## Features

- Interactive drag-and-drop puzzle mechanics
- IQ score that increases with correct placements
- Smooth animations using GSAP
- Audio feedback using Howler.js
- Tutorial hand to guide new users
- Responsive design that works on all devices
- Support for both portrait and landscape orientations
- Performance optimizations for low-end devices

## Project Structure

```
├── source/
│   ├── index.html         # Main HTML file
│   ├── js/
│   │   ├── AudioManager.js # Audio handling
│   │   ├── Game.js         # Game logic
│   │   ├── PuzzlePiece.js  # Puzzle piece component
│   │   └── main.js         # Entry point
│   └── assets/            # Game assets (images, audio)
│       ├── *.png          # Image assets
│       └── sound/         # Audio assets
│           └── *.mp3      # Sound files (mp3 format)
│
├── dist/
│   └── playable.html      # Consolidated file for AppLovin
│
├── convert-assets.js      # Script to generate playable.html
├── package.json          # Project dependencies
├── package-lock.json     # Dependency lock file
├── .gitignore            # Git ignore configuration
├── .DS_Store             # macOS folder attributes file
└── README.md             # Project documentation
```

## Setup and Development Instructions

### Prerequisites

1. Install Node.js (14.x or later recommended)
2. Clone the repository:
   ```
   git clone https://github.com/koshmosh43/Burny.git
   cd Burny
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Development Workflow

#### 1. Create or modify game assets

Place your assets in the appropriate directories:
- Images: `source/assets/`
- Audio: `source/assets/sound/`
- JavaScript: `source/js/`

#### 2. Test locally during development

For local development and testing:
1. Serve the `/source` directory using a local HTTP server:
   ```
   npx http-server ./source
   ```
2. Open `http://localhost:8080` in your browser
3. Make changes to the source files and refresh to see updates

### Building for AppLovin

#### Step 1: Convert assets to a single playable HTML file

Run the conversion script:
```
npm run convert
```

This script (`convert-assets.js`):
- Reads all image assets and converts them to base64
- Reads all audio assets and converts them to base64
- Inlines all JavaScript files
- Generates a single `playable.html` file in the `dist` directory
- Displays the file size and warns if it exceeds AppLovin's 5MB limit

#### Step 2: Manual optimization if file size exceeds 5MB

If the playable.html file is larger than 5MB:
1. Optimize images using online tools or image editors
2. Replace images in the source directory with optimized versions
3. Run `npm run convert` again to regenerate the playable.html file

#### Step 3: Advanced troubleshooting for specific issues

If you encounter specific issues like:
- CORS errors
- Audio not playing
- Images not loading
- DOM errors

Make targeted fixes to the playable.html file as needed:
1. Fix image loading issues by implementing robust error handling
2. Fix DOM errors by adding checks before removing elements
3. Fix PIXI.js deprecation warnings by updating to newer properties
4. Fix audio format issues by specifying formats explicitly

### Testing with AppLovin

#### Local testing

1. Open `dist/playable.html` in your browser to verify everything works
2. Test interactions, audio, and ensure proper completion flow

#### AppLovin testing tools

Upload your playable.html to test with AppLovin's tools:
1. Use [AppLovin Playable Preview Tool](https://p.applov.in/playablePreview?create=1&qr=1)
2. Upload your playable.html
3. Scan the generated QR code with the AppLovin Playable Preview App on iOS or Android
4. Test both portrait and landscape orientations

### Command Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npx http-server ./source` | Start a local server for development testing |
| `npm run convert` | Generate playable.html from source files |

### Troubleshooting Common Issues

1. **File size too large**: 
   - Manually reduce image dimensions or quality
   - Reduce MP3 bitrate for smaller audio files
   - Remove console.log statements

2. **Audio not playing**:
   - Ensure audio format is specified in Howler.js initialization
   - Add format parameter: `format: ['mp3']` 

3. **PIXI.js deprecation warnings**:
   - Replace `interactive: true` with `eventMode: 'static'`
   - Replace `buttonMode: true` with `cursor: 'pointer'`

4. **DOM errors**:
   - Add checks before DOM manipulations: `if (document.body.contains(element))`

5. **Images not loading (CORS errors)**:
   - Use robust error handling for texture loading
   - Implement fallback textures for critical game elements

## AppLovin Compatibility

This playable ad complies with AppLovin's requirements:

- Single HTML file with all resources embedded
- MRAID v2.0 support
- Both landscape and portrait orientations supported
- No auto-play audio before user interaction
- File size less than 5MB
- Direct redirect to app store using `mraid.open()`
- No external API calls
- No custom close button (AppLovin renders this)

## License

Copyright (c) 2025 Vlada Melnyk. All rights reserved
