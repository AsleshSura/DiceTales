# DiceTales Documentation

Welcome to the comprehensive documentation for **DiceTales** - an AI-powered fantasy RPG adventure game that runs entirely in your browser.

## 📚 Documentation Overview

| Document | Description | Audience |
|----------|-------------|----------|
| [**Setup Guide**](SETUP_GUIDE.md) | Quick start and installation instructions | All Users |
| [**Game Guide**](GAME_GUIDE.md) | How to play DiceTales effectively | Players |
| [**Technical Overview**](TECHNICAL_OVERVIEW.md) | Architecture and system design | Developers |
| [**API Reference**](API_REFERENCE.md) | Code documentation and APIs | Developers |
| [**Deployment Guide**](DEPLOYMENT_GUIDE.md) | How to deploy your own instance | Developers |
| [**Contributing Guide**](CONTRIBUTING.md) | How to contribute to the project | Contributors |

## 🎲 What is DiceTales?

DiceTales is a web-based tabletop RPG experience that combines:

- **AI-Powered Storytelling**: HuggingFace models generate dynamic narratives
- **Character Progression**: Manage stats, health, and inventory
- **Interactive Choices**: Make decisions that shape your adventure
- **Dice Rolling System**: D20-based mechanics for skill checks and combat
- **No Installation Required**: Runs entirely in modern web browsers
- **No API Keys Needed**: Uses free HuggingFace Inference API

## 🚀 Quick Links

- **[Play Now](../index.html)** - Start your adventure immediately
- **[GitHub Repository](https://github.com/AsleshSura/DiceTales)** - Source code and issues
- **[Setup Guide](SETUP_GUIDE.md)** - Get started in 5 minutes
- **[Game Guide](GAME_GUIDE.md)** - Learn how to play effectively

## 🏗️ Architecture

```
DiceTales/
├── index.html          # Main game interface
├── css/               # Styling and responsive design
├── js/                # Core game logic
│   ├── main.js        # Game controller
│   ├── ai.js          # AI coordination layer
│   ├── huggingfaceAI.js # Primary AI service
│   ├── simpleAI.js    # Template-based fallback
│   ├── character.js   # Character system
│   ├── dice.js        # Dice rolling mechanics
│   ├── gameState.js   # Save/load functionality
│   └── ui.js          # User interface
└── docs/              # This documentation
```

## 🔧 Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI**: HuggingFace Inference API (DialoGPT-large, GPT-2)
- **Storage**: LocalStorage for game saves
- **Deployment**: Static hosting (GitHub Pages, Netlify, Vercel)
- **No Dependencies**: Zero npm packages or build tools required

## 🎯 Key Features

### AI-Powered Narrative
- Multiple AI model fallbacks for reliability
- RPG-optimized prompt engineering
- Dynamic choice generation based on context
- Advanced response processing and filtering

### Character System
- Six core stats (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma)
- Health and experience tracking
- Inventory management
- Character creation and customization

### Game Mechanics
- D20-based skill checks and combat
- Save/load game functionality
- Responsive design for all devices
- Audio feedback and atmospheric sounds

## 📝 License

This project is open source under the MIT License. See the main repository for full license details.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and standards
- Submitting pull requests
- Reporting bugs and feature requests

---

*Built with ❤️ for tabletop RPG enthusiasts and AI technology lovers.*
