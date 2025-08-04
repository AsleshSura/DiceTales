# DiceTales Documentation

Welcome to the comprehensive documentation for **DiceTales** - an AI-powered RPG adventure game that runs entirely in your browser with advanced AI storytelling and persistent memory systems.

## 📚 Complete Documentation Index

### 🚀 Getting Started
| Document | Description | Audience |
|----------|-------------|----------|
| **[📖 Setup Guide](https://asleshsura.github.io/DiceTales/docs/SETUP_GUIDE)** | Quick start and system configuration | All Users |
| **[🎮 Game Guide](https://asleshsura.github.io/DiceTales/docs/GAME_GUIDE)** | How to play DiceTales effectively | Players |
| **[🚀 Deployment Guide](https://asleshsura.github.io/DiceTales/docs/DEPLOYMENT_GUIDE)** | How to deploy your own instance | Developers |

### 🏗️ System Documentation
| Document | Description | Audience |
|----------|-------------|----------|
| **[📋 API Reference](https://asleshsura.github.io/DiceTales/docs/API_REFERENCE)** | Complete code documentation and APIs | Developers |
| **[🤖 Enhanced AI System](https://asleshsura.github.io/DiceTales/docs/ENHANCED_AI_SYSTEM)** | AI system architecture and features | Developers |
| **[🧠 AI Memory System](https://asleshsura.github.io/DiceTales/docs/AI_MEMORY_SYSTEM)** | Memory system and persistence | Developers |
| **[👤 Character System](https://asleshsura.github.io/DiceTales/docs/CHARACTER_SYSTEM)** | Character creation and management | Developers |
| **[⚙️ DM Settings Integration](https://asleshsura.github.io/DiceTales/docs/DM_SETTINGS_INTEGRATION)** | Campaign settings and configuration | Developers |
| **[🗺️ Better DM System](https://asleshsura.github.io/DiceTales/better-dm/docs/)** | Advanced campaign management system | Advanced Users |

### 🤖 AI System Documentation
| Document | Description | Audience |
|----------|-------------|----------|
| **[🎯 AI Systems Overview](https://asleshsura.github.io/DiceTales/docs/AI_SYSTEMS_OVERVIEW)** | Complete AI ecosystem architecture | All Users |
| **[🤖 Main AI System](https://asleshsura.github.io/DiceTales/docs/AI_MAIN_SYSTEM)** | Core HuggingFace storytelling AI engine | Developers |
| **[🧠 Memory Manager](https://asleshsura.github.io/DiceTales/docs/AI_MEMORY_MANAGER)** | Persistent memory and context system | Developers |
| **[📊 DM Evaluator](https://asleshsura.github.io/DiceTales/docs/AI_DM_EVALUATOR)** | Response quality assessment system | Developers |
| **[🗺️ Better DM AI](https://asleshsura.github.io/DiceTales/docs/AI_BETTER_DM)** | Advanced campaign management AI | Advanced Users |

### 📚 Additional Resources
| Document | Description | Audience |
|----------|-------------|----------|
| **[📂 Import/Export Guide](https://asleshsura.github.io/DiceTales/docs/IMPORT_EXPORT_GUIDE)** | Character and save data management | Players/Developers |
| **[🎯 AI Setting Implementation](https://asleshsura.github.io/DiceTales/docs/AI_SETTING_IMPLEMENTATION)** | Campaign setting development | Advanced Users |

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

- **[Play Now](https://asleshsura.github.io/DiceTales/)** - Start your adventure immediately
- **[GitHub Repository](https://github.com/AsleshSura/DiceTales)** - Source code and issues
- **[Setup Guide](https://asleshsura.github.io/DiceTales/docs/SETUP_GUIDE)** - Get started in 5 minutes
- **[Game Guide](https://asleshsura.github.io/DiceTales/docs/GAME_GUIDE)** - Master the strategic gameplay mechanics

## 🏗️ Current Architecture (v2.0)

```
DiceTales/
├── index.html          # Main game interface
├── advanced/           # Main application
│   ├── index.html      # Advanced game interface
│   ├── css/            # Responsive styling and themes
│   └── js/             # Core game logic
│       ├── main.js     # Game controller
│       ├── ai.js       # AI coordination layer
│       ├── character.js # Advanced character system
│       ├── dice.js     # Turn-based dice mechanics
│       ├── gameState.js # Save/load with turn tracking
│       └── ui.js       # Enhanced user interface
├── better-dm/          # Advanced campaign management
├── base/               # Simple game version
└── docs/               # Updated documentation
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

We welcome contributions! Please read our [Contributing Guide](https://asleshsura.github.io/DiceTales/docs/CONTRIBUTING) for details on:

- Setting up the HuggingFace development environment
- Understanding the new AI-only architecture
- Code style and standards for v2.0
- Submitting pull requests and feature requests

---

*Built with ❤️ for tabletop RPG enthusiasts and powered by 🤗 HuggingFace AI.*
