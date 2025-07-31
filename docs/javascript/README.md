# JavaScript Modules Documentation

## Overview
This directory contains detailed documentation for all JavaScript modules in the DiceTales application. Each module is responsible for specific functionality and integrates with other modules through well-defined APIs.

---

## 📁 Module Documentation

### Core Modules

#### [`main.js`](main.md) - Application Controller
- **Purpose**: Central application coordination and lifecycle management
- **Key Classes**: `DiceTalesApp`
- **Dependencies**: All other modules
- **Lines of Code**: ~678
- **Key Features**: Screen management, event coordination, initialization

#### [`utils.js`](utils.md) - Utility Functions and Services
- **Purpose**: Shared utilities, logging, and helper functions
- **Key Classes**: `Logger`, `EventBus`, `PerformanceMonitor`
- **Dependencies**: None (base module)
- **Lines of Code**: ~583
- **Key Features**: Logging system, event system, D&D mechanics, DOM utilities

### Game Systems

#### [`character.js`](character.md) - Character Management
- **Purpose**: Character creation and progression system
- **Key Classes**: `CharacterManager`  
- **Dependencies**: utils.js, gameState.js
- **Lines of Code**: ~1087
- **Key Features**: Point-buy system, 4 campaign settings, class management

#### [`dice.js`](dice.md) - Dice Rolling System
- **Purpose**: 3D dice mechanics and animations
- **Key Classes**: `DiceSystem`
- **Dependencies**: utils.js, gameState.js
- **Lines of Code**: ~204
- **Key Features**: 7 dice types, physics animations, roll history

#### [`ai.js`](ai.md) - AI Integration
- **Purpose**: HackClub AI API integration for storytelling
- **Key Classes**: `AIManager`
- **Dependencies**: utils.js, gameState.js, character.js
- **Lines of Code**: ~512
- **Key Features**: Dynamic narratives, context awareness, fallback system

#### [`gameState.js`](gameState.md) - State Management
- **Purpose**: Centralized state management and persistence
- **Key Classes**: `GameState`
- **Dependencies**: utils.js
- **Lines of Code**: ~630
- **Key Features**: Auto-save, deep state access, version migration

#### [`audio.js`](audio.md) - Audio System
- **Purpose**: Background music and sound effects
- **Key Classes**: `AudioManager`
- **Dependencies**: utils.js, gameState.js
- **Lines of Code**: ~491
- **Key Features**: Web Audio API, synthesized sounds, user interaction compliance

#### [`ui.js`](ui.md) - User Interface Management
- **Purpose**: UI components, animations, and interactions
- **Key Classes**: `UIManager`
- **Dependencies**: utils.js, gameState.js
- **Lines of Code**: ~400+ (estimated)
- **Key Features**: Screen transitions, modal system, responsive design

---

## 🔗 Module Dependencies

### Dependency Graph
```
main.js
├── utils.js (base module)
├── gameState.js
│   └── utils.js
├── character.js
│   ├── utils.js
│   └── gameState.js
├── dice.js
│   ├── utils.js
│   └── gameState.js
├── ai.js
│   ├── utils.js
│   ├── gameState.js
│   └── character.js
├── audio.js
│   ├── utils.js
│   └── gameState.js
└── ui.js
    ├── utils.js
    └── gameState.js
```

### Loading Order
1. **utils.js** - Base utilities and services
2. **gameState.js** - State management system
3. **character.js** - Character system
4. **dice.js** - Dice system
5. **ai.js** - AI integration
6. **audio.js** - Audio system
7. **ui.js** - UI management
8. **main.js** - Application controller

---

## 🎯 Module Interactions

### Event-Driven Architecture
Modules communicate primarily through the global event system:

#### Character Events
```javascript
// character.js emits:
eventBus.emit('character:created', characterData);
eventBus.emit('character:updated', characterData);

// main.js listens:
eventBus.on('character:created', (data) => this.startNewCampaign(data));
```

#### Dice Events
```javascript
// dice.js emits:
eventBus.emit('dice:rolled', rollData);

// ai.js listens:
eventBus.on('dice:rolled', (data) => this.processDiceRoll(data));
```

#### Game State Events
```javascript
// gameState.js emits:
eventBus.emit('gameState:loaded', stateData);

// All modules listen for state changes
```

### Direct Integration Points

#### AI ↔ Character Integration
```javascript
// AI uses character data for context
const character = gameState.getCharacter();
const prompt = this.buildPrompt(character);
```

#### Dice ↔ Audio Integration  
```javascript
// Audio responds to dice events
eventBus.on('dice:rolled', (data) => {
    audioManager.playDiceSound(data.dice);
});
```

#### UI ↔ All Systems
```javascript
// UI coordinates with all systems
uiManager.showScreen('character-creation');
characterManager.showCharacterCreation();
```

---

## 📊 Module Statistics

| Module | Lines | Classes | Methods | Events | Dependencies |
|--------|-------|---------|---------|--------|--------------|
| main.js | 678 | 1 | 25+ | 6 | All modules |
| utils.js | 583 | 4 | 50+ | N/A | None |
| character.js | 1087 | 1 | 30+ | 4 | utils, gameState |
| gameState.js | 630 | 1 | 40+ | 5 | utils |
| ai.js | 512 | 1 | 15+ | 3 | utils, gameState, character |
| dice.js | 204 | 1 | 12+ | 2 | utils, gameState |
| audio.js | 491 | 1 | 20+ | 6 | utils, gameState |
| ui.js | 400+ | 1 | 25+ | 8 | utils, gameState |

**Total**: ~4,585+ lines of code across 8 modules

---

## 🔧 Development Patterns

### Common Patterns Used

#### Singleton Pattern
Each module exports a single global instance:
```javascript
const characterManager = new CharacterManager();
window.characterManager = characterManager;
```

#### Event-Driven Communication
Loose coupling through event system:
```javascript
// Publisher
eventBus.emit('dice:rolled', rollData);

// Subscriber  
eventBus.on('dice:rolled', handleRoll);
```

#### Error Handling
Consistent error handling with logging:
```javascript
try {
    // Operation
} catch (error) {
    logger.error('Operation failed:', error);
    // Graceful fallback
}
```

#### State Management
Centralized state with event notification:
```javascript
gameState.set('character.level', newLevel);
eventBus.emit('character:levelUp', { newLevel });
```

### Code Quality Standards
- **JSDoc Comments**: All public methods documented
- **Error Handling**: Comprehensive try/catch blocks
- **Logging**: All operations logged appropriately
- **Event System**: Decoupled communication
- **Graceful Degradation**: Fallbacks for failed systems

---

## 🎮 Usage Examples

### Basic Integration
```javascript
// Initialize systems
const app = new DiceTalesApp();

// Character creation
eventBus.on('character:created', (character) => {
    gameState.setCharacter(character);
    aiManager.startCampaign();
});

// Dice rolling with audio
eventBus.on('dice:rolled', (rollData) => {
    audioManager.playDiceSound(rollData.dice);
    if (rollData.critical) {
        uiManager.showToast('Critical Hit!', 'success');
    }
});
```

### Custom Event Handling
```javascript
// Listen for multiple events
const events = ['character:created', 'dice:rolled', 'story:updated'];
events.forEach(event => {
    eventBus.on(event, (data) => {
        logger.info(`Event received: ${event}`, data);
    });
});
```

### State Management
```javascript
// Complex state operations
const character = gameState.getCharacter();
character.experience += 500;

if (character.experience >= getExperienceForLevel(character.level + 1)) {
    character.level++;
    eventBus.emit('character:levelUp', { 
        character, 
        newLevel: character.level 
    });
}

gameState.setCharacter(character);
```

---

## 🔍 Debugging and Development

### Debug Mode Features
When `window.DEBUG_MODE` is true:
- Enhanced logging output
- Global variable access for inspection
- Performance monitoring enabled
- Error stack traces displayed

### Module Inspection  
```javascript
// Access module instances
window.characterManager  // Character system
window.diceSystem       // Dice system  
window.aiManager        // AI system
window.audioManager     // Audio system
window.gameState        // State system
window.uiManager        // UI system
```

### Performance Monitoring
```javascript
// Time operations across modules
perf.start('character-creation');
characterManager.showCharacterCreation();
perf.end('character-creation');

// Monitor AI responses
perf.measureAsync('ai-response', () => 
    aiManager.processPlayerAction(action)
);
```

---

*This documentation provides comprehensive coverage of all JavaScript modules in DiceTales, their interactions, and usage patterns. Refer to individual module documentation for detailed API information.*
