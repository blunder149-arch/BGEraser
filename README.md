# 🎨 AI Background Remover

A powerful web application that removes backgrounds from images instantly using AI. Built with Python, Flask, and the rembg library powered by U2NET deep learning model.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![AI](https://img.shields.io/badge/AI-U2NET-purple.svg)

## ✨ Features

- 🧠 **AI Powered** - Uses U2NET deep learning model for accurate background removal
- ⚡ **Lightning Fast** - Process images in seconds
- 🎯 **Pixel Perfect** - Accurate edge detection preserves fine details
- 🔒 **100% Private** - Images processed locally, never stored
- 🆓 **Completely Free** - No limits, no watermarks, no sign-up
- 🖱️ **Drag & Drop** - Easy-to-use interface
- 📱 **Responsive** - Works on all devices
- 💫 **Interactive UI** - Beautiful sparkle particle effects

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/blunder149-arch/Background_remover.git
   cd Background_remover
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   pip install "rembg[cpu]"
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open in browser**
   ```
   http://localhost:5000
   ```

## 📁 Project Structure

```
Background_remover/
├── app.py                    # Flask backend with AI integration
├── requirements.txt          # Python dependencies
├── templates/
│   └── index.html           # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css        # Premium dark theme styling
│   └── js/
│       ├── script.js        # Main app logic
│       └── particles.js     # Interactive particle effects
└── uploads/                  # Temporary upload folder
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Flask (Python) |
| AI Model | rembg (U2NET) |
| Image Processing | Pillow |
| Frontend | HTML5, CSS3, JavaScript |
| Styling | Custom CSS with Glassmorphism |

## 💡 How It Works

1. User uploads an image via drag-and-drop or file selection
2. Image is sent to Flask backend
3. rembg library processes the image using U2NET model
4. Background is removed with high precision
5. Processed image (PNG with transparency) is returned
6. User can preview and download the result

## 🎨 UI Features

- **Dark Theme** - Easy on the eyes with emerald green accents
- **Glassmorphism** - Modern frosted glass effects
- **Sparkle Particles** - Interactive floating particles with glow
- **Click Burst** - Particle explosion effect on click
- **Smooth Animations** - Polished micro-interactions

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main page |
| `/preview` | POST | Process image and return base64 preview |
| `/remove-bg` | POST | Process and download image |

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [rembg](https://github.com/danielgatis/rembg) - AI background removal library
- [U2NET](https://github.com/xuebinqin/U-2-Net) - Deep learning model for salient object detection
- [Flask](https://flask.palletsprojects.com/) - Python web framework

---

Made with ❤️ using Python & AI
