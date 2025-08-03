# DiceTales Documentation

Welcome to the comprehensive documentation for **DiceTales** - an AI-powered RPG adventure game that runs entirely in your browser with advanced AI storytelling and persistent memory systems.

## 📚 Complete Documentation Index

### 🚀 Getting Started
| Document | Description | Audience |
|----------|-------------|----------|
| **[📖 Setup Guide](SETUP_GUIDE.md)** | Quick start and system configuration | All Users |
| **[🎮 Game Guide](GAME_GUIDE.md)** | How to play DiceTales effectively | Players |
| **[🚀 Deployment Guide](DEPLOYMENT_GUIDE.md)** | How to deploy your own instance | Developers |

### 🏗️ System Documentation
| Document | Description | Audience |
|----------|-------------|----------|
| **[📋 API Reference](API_REFERENCE.md)** | Complete code documentation and APIs | Developers |
| **[🤖 Enhanced AI System](ENHANCED_AI_SYSTEM.md)** | AI system architecture and features | Developers |
| **[🧠 AI Memory System](AI_MEMORY_SYSTEM.md)** | Memory system and persistence | Developers |
| **[👤 Character System](CHARACTER_SYSTEM.md)** | Character creation and management | Developers |
| **[⚙️ DM Settings Integration](DM_SETTINGS_INTEGRATION.md)** | Campaign settings and configuration | Developers |

### � Additional Resources
| Document | Description | Audience |
|----------|-------------|----------|
| **[� Import/Export Guide](IMPORT_EXPORT_GUIDE.md)** | Character and save data management | Players/Developers |
| **[🎯 AI Setting Implementation](AI_SETTING_IMPLEMENTATION.md)** | Campaign setting development | Advanced Users |

## What is DiceTales?

DiceTales is a web-based tabletop RPG experience that combines:

- **� Advanced AI Storytelling**: Modern language models create immersive narratives with memory
- **🎯 Strategic Dice System**: Turn-based mechanics with meaningful consequences  
- **⚔️ Character Progression**: Manage stats, health, inventory, and relationships
- **🧠 Persistent Memory**: AI remembers all decisions, NPCs, and story elements
- **🎭 Dynamic Relationships**: NPCs remember and react to past interactions
- **🌐 No Installation Required**: Runs entirely in modern web browsers
- **🔧 Advanced Integration**: Seamless AI, memory, and character systems

## 🚀 Quick Links

- **[Play Now](../index.html)** - Start your adventure immediately
- **[GitHub Repository](https://github.com/AsleshSura/DiceTales)** - Source code and issues
- **[Setup Guide](SETUP_GUIDE.md)** - Get started in 5 minutes
- **[Game Guide](GAME_GUIDE.md)** - Master the strategic gameplay mechanics

## 🏗️ Current Architecture (v2.0)

```
DiceTales/
├── index.html          # Main game interface
├── quick-start.html    # Simplified game version
├── css/               # Responsive styling and themes
├── js/                # Core game logic (HuggingFace only)
│   ├── main.js        # Game controller
│   ├── ai.js          # AI coordination layer (HuggingFace only)
│   ├── huggingfaceAI.js # Primary AI service (no fallbacks)
│   ├── character.js   # Advanced character system
│   ├── dice.js        # Turn-based dice mechanics
│   ├── gameState.js   # Save/load with turn tracking
│   └── ui.js          # Enhanced user interface
└── docs/              # Updated documentation
```

## 🔧 Technology Stack (v2.0)

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI**: HuggingFace Inference API (Advanced Language Models)
- **Storage**: LocalStorage with turn-based state tracking
- **Deployment**: Static hosting (GitHub Pages, Netlify, Vercel)
- **Architecture**: Pure client-side, no backend required

## 🎯 Key Features (Updated)

### 🤗 HuggingFace AI Integration
- **Primary AI System**: Advanced HuggingFace language models
- **No Fallbacks**: Pure HuggingFace experience for consistent quality
- **RPG-Optimized Prompts**: Specialized for tabletop gaming scenarios
- **Human-Like Storytelling**: Natural, conversational narrative style

### Advanced Dice System
- **Turn-Based Restrictions**: One dice roll per turn for tactical gameplay
- **Visual Feedback**: Clear UI indicators for turn status
- **Multiple Dice Types**: D4, D6, D8, D10, D12, D20, D100 support
- **Critical Success/Failure**: Enhanced outcomes for extreme rolls

### ⚔️ Enhanced Character System
- **Six Core Stats**: STR, DEX, CON, INT, WIS, CHA with modifiers
- **Setting-Specific Stats**: Medieval Fantasy, Modern, Sci-Fi variations
- **Health & Experience**: Full progression tracking
- **Inventory Management**: Equipment and item systems

### 🎮 Improved Game Mechanics
- **Turn Management**: Sophisticated turn tracking system
- **State Persistence**: Enhanced save/load with turn history
- **Responsive Design**: Optimized for desktop and mobile
- **Error Handling**: Graceful AI failure management

## 🚨 System Requirements

- **Modern Web Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Internet Connection**: Required for HuggingFace API access
- **HuggingFace Configuration**: See Setup Guide for API configuration

## 📝 License

This project is open source under the MIT License. See the main repository for full license details.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the HuggingFace development environment
- Understanding the new AI-only architecture
- Code style and standards for v2.0
- Submitting pull requests and feature requests

---

*Built with ❤️ for tabletop RPG enthusiasts and powered by 🤗 HuggingFace AI.*
