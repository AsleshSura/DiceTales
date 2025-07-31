# DiceTales - Project Overview

## 🎲 What is DiceTales?

DiceTales is a web-based, AI-powered Dungeons & Dragons game that combines traditional tabletop RPG mechanics with modern web technologies. Players can create characters, embark on AI-generated adventures, and experience dynamic storytelling in multiple campaign settings.

## 🏗️ Architecture Overview

### Frontend Architecture
```
DiceTales/
├── index.html          # Main application entry point
├── css/               # Styling system
│   ├── main.css       # Core application styles
│   ├── character.css  # Character creation styles
│   ├── dice.css       # Dice rolling interface styles
│   └── responsive.css # Mobile/responsive design
├── js/                # JavaScript application logic
│   ├── main.js        # Application controller
│   ├── ai.js          # AI integration system
│   ├── audio.js       # Sound and music system
│   ├── character.js   # Character management
│   ├── dice.js        # Dice rolling mechanics
│   ├── gameState.js   # Game state persistence
│   ├── ui.js          # User interface management
│   └── utils.js       # Utility functions and logging
└── docs/              # Documentation
```

## 🎯 Core Features

### 1. Character Creation System
- **Multi-class Support**: Fighter, Wizard, Rogue, Cleric
- **Stat Generation**: Traditional D&D ability scores
- **Campaign Integration**: Characters tied to specific campaign settings
- **Persistence**: Save/load character data

### 2. AI-Powered Storytelling
- **Dynamic Narratives**: AI generates unique story content
- **Context Awareness**: Stories adapt to character choices and dice rolls
- **Multiple Settings**: Medieval Fantasy, Space Opera, Modern Mystery, Post-Apocalyptic
- **Interactive Dialogue**: Player choices influence story direction

### 3. Dice Rolling System
- **3D Physics**: Realistic dice rolling animations
- **Multiple Dice Types**: d4, d6, d8, d10, d12, d20, d100
- **Advantage/Disadvantage**: D&D 5e mechanics support
- **Roll History**: Track all dice rolls and results

### 4. Audio Experience
- **Dynamic Music**: Background music that adapts to game state
- **Sound Effects**: Dice rolling, UI interactions, ambient sounds
- **User Control**: Volume controls and audio preferences
- **Web Audio API**: High-quality audio processing

### 5. Game State Management
- **Auto-save**: Continuous game state preservation
- **Session Persistence**: Resume games across browser sessions
- **Multiple Characters**: Support for multiple character profiles
- **Campaign Progress**: Track story progression and choices

## 🔧 Technical Stack

### Frontend Technologies
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox/Grid
- **JavaScript (ES6+)**: Modular application architecture
- **Web Audio API**: Audio processing and playback
- **Canvas API**: 3D dice rendering (potential)
- **LocalStorage API**: Client-side data persistence

### External Integrations
- **HackClub AI API**: AI-powered story generation
- **Web Fonts**: Typography enhancements
- **Progressive Web App**: Offline capability (future)

## 🎮 Game Flow

### 1. Application Initialization
```
Loading Screen → System Initialization → Character Detection
```

### 2. Character Creation Flow
```
Character Creation → Stat Assignment → Campaign Selection → Game Start
```

### 3. Gameplay Loop
```
Story Presentation → Player Choice → Dice Rolling → AI Response → State Update
```

### 4. Session Management
```
Auto-save → State Persistence → Resume on Return
```

## 📦 Module System

### Core Modules

#### `main.js` - Application Controller
- **Purpose**: Central coordination of all game systems
- **Responsibilities**: Initialization, screen management, event coordination
- **Dependencies**: All other modules

#### `ai.js` - AI Integration
- **Purpose**: Interface with AI services for story generation
- **Responsibilities**: API communication, prompt engineering, response processing
- **Dependencies**: utils.js, gameState.js

#### `character.js` - Character Management
- **Purpose**: Character creation, stats, and progression
- **Responsibilities**: Character data, stat calculations, persistence
- **Dependencies**: gameState.js, utils.js

#### `dice.js` - Dice System
- **Purpose**: Dice rolling mechanics and visualization
- **Responsibilities**: Random generation, physics simulation, result processing
- **Dependencies**: utils.js, audio.js

#### `gameState.js` - State Management
- **Purpose**: Game data persistence and state coordination
- **Responsibilities**: Save/load operations, state synchronization
- **Dependencies**: utils.js

#### `audio.js` - Audio System
- **Purpose**: Sound effects and background music
- **Responsibilities**: Audio playback, volume control, context management
- **Dependencies**: utils.js

#### `ui.js` - User Interface
- **Purpose**: UI component management and interactions
- **Responsibilities**: Screen transitions, component updates, user feedback
- **Dependencies**: utils.js

#### `utils.js` - Utilities
- **Purpose**: Shared utilities and logging system
- **Responsibilities**: Logging, DOM manipulation, data validation
- **Dependencies**: None (base module)

## 🎨 Design Principles

### 1. Modular Architecture
- **Separation of Concerns**: Each module has a specific responsibility
- **Loose Coupling**: Modules communicate through well-defined interfaces
- **High Cohesion**: Related functionality grouped together

### 2. Progressive Enhancement
- **Core Functionality First**: Basic game works without advanced features
- **Feature Detection**: Graceful degradation for missing capabilities
- **Accessibility**: Keyboard navigation and screen reader support

### 3. Performance Optimization
- **Lazy Loading**: Load resources only when needed
- **Efficient Rendering**: Minimize DOM manipulation
- **Memory Management**: Proper cleanup and garbage collection

### 4. User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Intuitive Interface**: Clear navigation and feedback
- **Fast Loading**: Optimized assets and minimal dependencies

## 🚀 Development Workflow

### 1. Local Development
```bash
# Start development server
python -m http.server 8000

# Open browser
http://localhost:8000
```

### 2. File Structure Guidelines
- **CSS**: One file per major component
- **JavaScript**: One class per file
- **Documentation**: Mirror source structure

### 3. Code Standards
- **ES6+ Features**: Use modern JavaScript
- **JSDoc Comments**: Document all public methods
- **Error Handling**: Comprehensive try/catch blocks
- **Logging**: Use utils.js logger for all output

## 📈 Future Enhancements

### Planned Features
- **Multiplayer Support**: Multiple players in same campaign
- **Campaign Editor**: Create custom campaign settings
- **Advanced Character Classes**: More D&D classes and subclasses
- **Combat System**: Turn-based tactical combat
- **Inventory Management**: Equipment and item systems

### Technical Improvements
- **WebRTC**: Real-time multiplayer communication
- **Service Worker**: Offline gameplay capability
- **WebGL**: Advanced 3D graphics for dice and environments
- **TypeScript**: Type safety and better developer experience

---

*This overview provides a high-level understanding of DiceTales architecture and design. For detailed API documentation, see the individual module documentation files.*
