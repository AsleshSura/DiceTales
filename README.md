# 🎲 DiceTales

**An AI-powered fantasy RPG adventure that runs entirely in your browser!**

[![Play Now](https://img.shields.io/badge/🎮-Play%20Now-green?style=for-the-badge)](index.html)
[![Documentation](https://img.shields.io/badge/📚-Documentation-blue?style=for-the-badge)](docs/README.md)
[![Contribute](https://img.shields.io/badge/🤝-Contribute-orange?style=for-the-badge)](docs/CONTRIBUTING.md)

## ✨ What is DiceTales?

DiceTales combines the magic of AI storytelling with classic tabletop RPG mechanics. Create your character, make choices, roll dice, and watch as artificial intelligence crafts a unique adventure just for you.

### 🚀 Key Features

- **🤖 AI-Powered Storytelling**: HuggingFace models generate dynamic narratives
- **🎲 D20 Combat System**: Classic tabletop RPG dice mechanics
- **👤 Character Progression**: Six stats, leveling, inventory, and equipment
- **💾 Save/Load System**: Continue your adventure anytime
- **📱 Fully Responsive**: Play on desktop, tablet, or mobile
- **🆓 Completely Free**: No API keys, no sign-up, no payments required
- **🌐 Zero Installation**: Runs entirely in your web browser

### 🎮 Quick Start

1. **[Play Instantly](index.html)** - No setup required!
2. **Create Your Character** - Distribute stat points and choose your name
3. **Begin Your Adventure** - Let the AI craft your unique story
4. **Make Choices** - Your decisions shape the narrative
5. **Roll Dice** - Test your skills against challenges
6. **Level Up** - Grow stronger through your adventures

## 🏗️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI Services**: HuggingFace Inference API (DialoGPT, GPT-2)
- **Storage**: LocalStorage for game saves
- **Deployment**: Static hosting compatible (GitHub Pages, Netlify, Vercel)
- **Dependencies**: Zero! No npm packages or build tools needed

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| **[📖 Setup Guide](docs/SETUP_GUIDE.md)** | Get started in 5 minutes |
| **[🎮 Game Guide](docs/GAME_GUIDE.md)** | Master the art of adventure |
| **[🏗️ Technical Overview](docs/TECHNICAL_OVERVIEW.md)** | Architecture and development |
| **[📋 API Reference](docs/API_REFERENCE.md)** | Complete code documentation |
| **[🚀 Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** | Host your own instance |
| **[🤝 Contributing Guide](docs/CONTRIBUTING.md)** | Join the development |

## 🎯 Game Mechanics

### Character System
- **Six Core Stats**: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- **Health & Experience**: HP tracking and XP-based leveling
- **Inventory Management**: Weapons, armor, and magical items

### AI Storytelling
- **Multi-Tier System**: HuggingFace → Simple AI → Mock AI fallbacks
- **RPG-Optimized Prompts**: Dungeon Master style narrative generation
- **Context-Aware**: Story adapts to your character and previous choices

### Dice Mechanics
- **D20 System**: Classic tabletop RPG dice rolling
- **Skill Checks**: Roll + Stat vs. Difficulty Class
- **Critical Success/Failure**: Natural 20s and 1s create memorable moments

## 🚀 Deployment Options

### Instant Deployment
- **[GitHub Pages](docs/DEPLOYMENT_GUIDE.md#github-pages)** - Free hosting with Git integration
- **[Netlify](docs/DEPLOYMENT_GUIDE.md#netlify)** - Drag-and-drop deployment
- **[Vercel](docs/DEPLOYMENT_GUIDE.md#vercel)** - Modern edge deployment

### Self-Hosted
- **[Apache/Nginx](docs/DEPLOYMENT_GUIDE.md#self-hosted)** - Full control server deployment
- **[Docker](docs/DEPLOYMENT_GUIDE.md#docker-deployment)** - Containerized deployment

## 🤝 Contributing

We welcome contributions! Whether you're:
- 🐛 **Reporting bugs**
- 💡 **Suggesting features** 
- 📝 **Improving documentation**
- 🔧 **Writing code**
- 🎨 **Creating assets**

Check out our **[Contributing Guide](docs/CONTRIBUTING.md)** to get started.

### Development Setup
```bash
git clone https://github.com/AsleshSura/DiceTales.git
cd DiceTales
python -m http.server 8000  # Or any static file server
# Open http://localhost:8000
```

## 🌟 Community

- **[GitHub Discussions](https://github.com/AsleshSura/DiceTales/discussions)** - Feature requests and community chat
- **[Issues](https://github.com/AsleshSura/DiceTales/issues)** - Bug reports and development tasks
- **[Discord](#)** - Real-time community interaction (coming soon!)

## 📜 License

This project is open source under the **MIT License**. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **HuggingFace** - For providing free AI model inference
- **Tabletop RPG Community** - For decades of amazing game design
- **Open Source Contributors** - Everyone who helps make this project better

---

**Ready for adventure?** 

[![Start Your Quest](https://img.shields.io/badge/🗡️-Start%20Your%20Quest-red?style=for-the-badge&size=large)](index.html)

*In DiceTales, every choice matters, every roll tells a story, and every adventure is uniquely yours.*