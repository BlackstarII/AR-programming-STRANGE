# Mystic Arts AR — Doctor Strange Spellcasting Web Experience

A real-time, browser-based Augmented Reality (AR) spellcasting experience inspired by Doctor Strange and the Mystic Arts. Built with vanilla JavaScript, HTML5 Canvas 2D, and MediaPipe Hands tracking.

---

## Features

- **Gesture-Driven Spellcasting**: High-precision hand tracking powered by MediaPipe Hands.
- **Eye of Agamotto (Time Stone Ritual)**:
  - **Phase 1 (Forming)**: Bring index fingers and thumbs together in front of the chest to manifest the Eye of Agamotto relic, rotating chrono-dials, and emerald tendrils tethered to your wrists.
  - **Phase 2 (Time Expansion)**: Pull hands apart horizontally to unleash a massive expanding green chrono-shockwave with radial time rays and sparks.
  - **Single-Hand Pinch**: Summon the individual Eye of Agamotto on a single hand.
- **Tao Mandala Shields**: Open palm with sacred interlocking triangles, rotating runic rings, and multi-tier sparks.
- **Mirror Dimension Reality Shatter**: Crystalline fractal glass shards and dimension portals (Cyan theme).
- **Eldritch Whip**: Point an index finger forward to lash out an electric mystic energy whip.
- **Power Charge Fist**: Clench a tight fist to charge concentrated eldritch plasma energy around the hand.
- **Sling Ring Portal**: Bring both open palms together to open an interdimensional gateway.
- **Mystic Palm Lines**: Dynamic palm anatomy illumination (Life Line, Head Line, Heart Line) matching active spell themes.
- **Multi-Spell Theme Palette**: Eldritch (Orange), Time Stone (Emerald Green), Dark Dimension (Cosmic Purple), Mirror Dimension (Crystalline Cyan).
- **High Performance**: Offscreen low-resolution inference pipeline ensuring smooth 60 FPS rendering without lag.

---

## Gesture Reference Guide

| Spell | Hand Gesture | Visual Effect Description |
|---|---|---|
| **Eye of Agamotto (Dual)** | Touching index & thumb tips in front of chest | Manifests relic with rotating chrono-dials. Pull apart horizontally to trigger expanding time wave. |
| **Eye of Agamotto (Single)** | Pinch index and thumb tips | Opens an individual emerald Eye of Agamotto on hand with spinning sacred geometry. |
| **Tao Mandala** | Open Palm facing camera | Authentic interlocking sacred triangles, rotating runic rings, and directional spark showers. |
| **Mirror Dimension** | Open Palm + Mirror theme (Cyan) | Crystalline reality shatter with kaleidoscopic glass shards reflecting the environment. |
| **Eldritch Whip** | Index Pointing forward | High-voltage plasma energy whip extending directly from fingertip with electric arcs. |
| **Energy Fist** | Tight Closed Fist | Charges concentrated spherical plasma aura over knuckles and an eldritch wrist bracer. |
| **Sling Ring Portal** | Both open palms close together | Giant rotating interdimensional portal vortex generating dense bursts of swirling fiery sparks. |

---

## Getting Started

### Prerequisites
- Python 3.x installed (or any local static HTTP server).
- A modern web browser with Webcam permissions (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave).

### Running Locally

1. **Clone the repository**:
   `ash
   git clone https://github.com/BlacksrarII/doctor-strange-ar.git
   cd doctor-strange-ar
   `

2. **Start the local server**:
   - On Windows: Double-click un.bat or run:
     `ash
     python serve.py
     `

3. **Open in Browser**:
   Navigate to:
   `
   http://localhost:8080
   `

4. Grant webcam permissions when prompted by your browser.

---

## Project Structure

`	ext
doctor-strange-ar/
├── index.html                  # Application entry point, UI controls, and main render loop
├── style.css                   # Clean developer aesthetic, HUD overlays, and responsive styling
├── handTracker.js              # MediaPipe Hands wrapper, landmark interpolation, and gesture classifier
├── mandala.js                  # High-performance Canvas 2D particle engine and spell rendering library
├── audio.js                    # Sound effects controller
├── serve.py                    # Lightweight Python HTTP server with CORS headers
├── run.bat                     # Quick launcher script for Windows
├── Doctor_Strange_AR_Guide.pdf # Comprehensive user & operational guide PDF
├── .gitignore                  # Git ignore rules for clean repository maintenance
├── LICENSE                     # MIT open-source license
└── README.md                   # Documentation and gesture guide
`

---

## Author and Credits

- **Developer & Creator**: **[elsemary (BlacksrarII)](https://github.com/BlacksrarII)**
- **Project**: Mystic Arts AR (Doctor Strange Visual Engine)

---

## License

This project is open source and available under the [MIT License](LICENSE) (c) 2026 **elsemary**.
