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
│
├── dist/
│   └── playable.html      # Consolidated file for AppLovin
│
└── README.md             # Project documentation
```

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
- Sorry no logo because I'm not Burny employee yet

## Development

### Local Testing

For local development and testing:

1. Serve the `/source` directory using a local web server
2. Open `index.html` in your browser

### Building for AppLovin

The `playable.html` file in the `/dist` directory is ready for submission to AppLovin. This file contains all necessary code, styles, and base64-encoded assets.

### Testing with AppLovin Tools

Test your playable using:
- [AppLovin Playable Preview Tool](https://p.applov.in/playablePreview?create=1&qr=1)
- AppLovin Playable Preview App (available for iOS and Android)

## License

Copyright (c) 2023-2025 Vlada Melnyk. All rights reserved 