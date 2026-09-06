# Mystic Arts AR — Doctor Strange Spellcasting Web Experience

A real-time, browser-based Augmented Reality (AR) spellcasting experience inspired by Doctor Strange and the Mystic Arts. Built with vanilla JavaScript, HTML5 Canvas 2D, and MediaPipe Hands tracking.

---

## ✨ Features

- **Gesture-Driven Spellcasting**: High-precision hand tracking powered by MediaPipe.
- **Eye of Agamotto (Time Stone Ritual)**:
  - **Phase 1 (Forming)**: Bring index fingers and thumbs together in front of the chest to manifest the Eye of Agamotto relic, rotating chrono-dials, and emerald tendrils tethered to your wrists.
  - **Phase 2 (Time Expansion)**: Pull hands apart to unleash a massive expanding green chrono-shockwave with radial time rays and sparks.
  - **Single-Hand Pinch**: Summon the Eye of Agamotto on a single hand.
- **Tao Mandala Shields**: Open palm with sacred geometry, rotating runic rings, and multi-tier sparks.
- **Mirror Dimension Reality Shatter**: Crystalline fractal glass shards and dimension portals (Cyan theme).
- **Eldritch Whip**: Point an index finger forward to lash out an electric mystic energy whip.
- **Power Charge Fist**: Clench a tight fist to charge concentrated eldritch plasma energy around the hand.
- **Sling Ring Portal**: Bring both open palms together to open an interdimensional gateway.
- **Mystic Palm Lines**: Dynamic palm anatomy illumination (Life Line, Head Line, Heart Line) matching active spell themes.
- **Multi-Spell Theme Palette**: Eldritch (Orange), Time Stone (Emerald Green), Dark Dimension (Cosmic Purple), Mirror Dimension (Crystalline Cyan).
- **High Performance**: Offscreen low-resolution inference pipeline ensuring smooth 60 FPS rendering without lag.

---

## 🖐️ Gesture Reference Guide

| Spell | Gesture | Description |
|---|---|---|
| **Eye of Agamotto (Dual)** | 👆 + 🤙 in front of chest | Touch index & thumb tips of both hands at chest level. Pull apart to trigger the expanding time wave. |
| **Eye of Agamotto (Single)** | 👌 Pinch | Touch thumb and index fingertips together on one hand. |
| **Tao Mandala** | ✋ Open Palm | Spread all fingers open facing the camera. |
| **Mirror Dimension** | ✋ Open Palm + *Mirror* selected | Reality-shattering crystalline mandalas (select Cyan from toolbar). |
| **Eldritch Whip** | 👉 Index Pointing | Extend index finger forward with pinky and ring fingers curled. |
| **Energy Fist** | ✊ Tight Fist | Clench all fingers firmly into a fist. |
| **Sling Ring Portal** | ✋ + ✋ Open Palms close | Bring both open palms close together. |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.x installed (or any local static HTTP server).
- A modern web browser with Webcam permissions (Chrome, Edge, Firefox, Brave).

### Running Locally

1. **Clone the repository**:
   `ash
   git clone https://github.com/<your-username>/doctor-strange-ar.git
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

4. Grant webcam permissions when prompted.

---

## 🛠️ Project Structure

`
├── index.html       # Application entry point, UI controls, and main render loop
├── style.css        # Clean developer aesthetic, HUD overlays, and responsive styling
├── handTracker.js   # MediaPipe Hands wrapper, landmark interpolation, and gesture classifier
├── mandala.js       # High-performance Canvas 2D particle engine and spell rendering library
├── audio.js         # Sound effects controller
├── serve.py         # Lightweight Python HTTP server with CORS headers
├── run.bat          # Quick launcher script for Windows
├── .gitignore       # Git ignore rules for clean repo maintenance
└── README.md        # Documentation and gesture guide
`

## 👨‍💻 Author & Credits

- **Developer & Creator**: **[elsemary](https://github.com/elsemary)**
- **Project**: Mystic Arts AR (Doctor Strange Visual Engine)

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE) &copy; 2026 **elsemary**.

