# DiceTales File Architecture Guide

This document provides a comprehensive overview of every file in the DiceTales project and how they interact with each other.

## 📁 Project Structure Overview

```
DiceTales/
├── index.html                 # 🌐 Main application entry point
├── PRODUCTION_CHECKLIST.md    # ✅ Production readiness checklist
├── README.md                  # 📖 Project overview and quick start
│
├── css/                       # 🎨 Styling and visual presentation
│   ├── main.css              # Core application styles
│   ├── character.css         # Character creation/sheet styles
│   ├── dice.css              # Dice system and animations
│   ├── evaluation.css        # DM evaluation UI styles
│   └── responsive.css        # Mobile/tablet responsive design
│
├── docs/                     # 📚 Project documentation
│   ├── API_REFERENCE.md      # Code API documentation
│   ├── CONTRIBUTING.md       # Development contribution guide
│   ├── DEPLOYMENT_GUIDE.md   # Hosting and deployment instructions
│   ├── FILE_ARCHITECTURE.md  # This file - complete architecture guide
│   ├── GAME_GUIDE.md         # Player guide and game mechanics
│   ├── README.md             # Documentation overview
│   ├── SETUP_GUIDE.md        # Development setup instructions
│   └── TECHNICAL_OVERVIEW.md # Technical architecture details
│
└── js/                       # 💻 JavaScript application logic
    ├── main.js               # Application controller and initialization
    ├── gameState.js          # Centralized state management
    ├── character.js          # Character creation and management
    ├── ai.js                 # AI system coordination and management
    ├── dice.js               # Dice rolling system and turn management
    ├── ui.js                 # User interface and interaction management
    ├── audio.js              # Audio system for music and sound effects
    ├── dmEvaluator.js        # AI response quality evaluation
    ├── evaluationUI.js       # DM evaluation interface
    ├── huggingfaceAI.js      # HuggingFace AI integration (empty)
    ├── utils.js              # Utility functions and helpers
    └── config.js             # Configuration constants
```

## 🌐 Entry Point: index.html

**Purpose**: Main HTML file that serves as the application entry point
**Dependencies**: All CSS and JavaScript files
**Key Features**:
- Progressive loading screen with animation
- Responsive viewport configuration
- Script loading order management
- Main application container structure

### Script Loading Order
```html
<!-- Configuration first -->
<script src="js/config.js"></script>

<!-- Core utilities -->
<script src="js/utils.js"></script>

<!-- State management -->
<script src="js/gameState.js"></script>

<!-- Game systems -->
<script src="js/character.js"></script>
<script src="js/dice.js"></script>
<script src="js/dmEvaluator.js"></script>
<script src="js/ai.js"></script>
<script src="js/audio.js"></script>

<!-- UI and main controller -->
<script src="js/ui.js"></script>
<script src="js/main.js"></script>
```

### Key HTML Structure
- `#loading-screen`: Animated loading overlay
- `#app`: Main application container
- `.screen`: Different game screens (character creation, game, etc.)
- Modal containers for settings, character sheet, etc.

## 💻 JavaScript Architecture

### 🎮 main.js - Application Controller
**Purpose**: Central application orchestration and initialization
**Class**: `DiceTalesApp`
**Global Instance**: `window.app`

#### Key Responsibilities:
- Application lifecycle management
- Screen transitions and navigation
- System initialization coordination
- Event handling orchestration
- Error recovery and fallback systems

#### Critical Methods:
- `init()`: Main initialization sequence
- `initializeSystems()`: Loads and validates all game systems
- `showScreen(screenName)`: Handles screen transitions
- `checkExistingGame()`: Determines startup flow
- `showCharacterCreation()`: Displays character creation
- `startNewCampaign(character)`: Begins gameplay

#### System Dependencies:
```javascript
// Required systems checked during initialization
const systems = [
    { name: 'gameState', instance: window.gameState, required: true },
    { name: 'characterManager', instance: window.characterManager, required: true },
    { name: 'diceSystem', instance: window.diceSystem, required: true },
    { name: 'uiManager', instance: window.uiManager, required: true },
    { name: 'aiManager', instance: window.aiManager, required: false },
    { name: 'audioManager', instance: window.audioManager, required: false }
];
```

### 💾 gameState.js - State Management
**Purpose**: Centralized state management with persistence
**Class**: `GameState` 
**Global Instance**: `window.gameState`

#### Key Responsibilities:
- Persistent game state storage (localStorage)
- Character data management
- Campaign progress tracking
- Settings management
- Auto-save functionality

#### State Structure:
```javascript
{
    version: '1.0.0',
    character: {
        name: '',
        class: '',
        level: 1,
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        health: { current: 100, maximum: 100 },
        inventory: [],
        equipment: {}
    },
    campaign: {
        setting: '',
        dm_difficulty: 'medium',
        current_location: '',
        story_state: '',
        campaign_log: []
    },
    settings: {
        audio_settings: {},
        display_preferences: {},
        ai_settings: {}
    },
    ui: {
        current_screen: 'character-creation',
        last_roll: null,
        roll_history: []
    },
    meta: {
        created_at: ISO_DATE,
        last_played: ISO_DATE,
        total_playtime: 0,
        saves_count: 0
    }
}
```

#### Critical Methods:
- `get(path)`: Retrieve state data by path
- `set(path, value)`: Update state data
- `save()`: Persist to localStorage
- `load()`: Load from localStorage
- `setCharacter(character)`: Update character data
- `setCampaign(campaign)`: Update campaign data

### 👤 character.js - Character Management
**Purpose**: Character creation, progression, and management
**Class**: `CharacterManager`
**Global Instance**: `window.characterManager`

#### Key Responsibilities:
- Multi-step character creation workflow
- Campaign setting definitions
- Character class and stat management
- Point-buy stat allocation system
- Character validation

#### Campaign Settings:
- **Medieval Fantasy**: Classic D&D-style fantasy
- **Modern Day**: Contemporary urban fantasy
- **Sci-Fi Space**: Space exploration and technology
- **Eldritch Horror**: Lovecraftian cosmic horror
- **Post-Apocalyptic**: Wasteland survival
- **Steampunk**: Victorian-era technology

#### Character Classes (per setting):
Each setting has 6 balanced classes:
- Warrior, Scholar, Scout, Healer, Explorer, Merchant

#### Critical Methods:
- `showCharacterCreation()`: Initiate creation process
- `nextStep()` / `previousStep()`: Navigate creation steps
- `validateCharacter(character)`: Ensure character completeness
- `getCurrentAbilityScores()`: Get setting-specific ability scores

### 🤖 ai.js - AI System Coordination
**Purpose**: Unified AI system management and HuggingFace integration
**Class**: `AIManager`
**Global Instance**: `window.aiManager`

#### Key Responsibilities:
- HuggingFace API integration
- Conversation history management
- AI response generation and processing
- Story and choice generation
- Campaign narrative management
- DM response evaluation integration

#### HuggingFace Models (priority order):
1. `microsoft/DialoGPT-large`
2. `microsoft/DialoGPT-medium`
3. `gpt2-large`
4. `gpt2`
5. `microsoft/DialoGPT-small`
6. `distilgpt2`

#### Critical Methods:
- `initialize()`: Set up AI systems
- `generateResponse(prompt, context)`: Generate AI responses
- `processPlayerAction(action)`: Handle player actions
- `generateCampaignStory(character, setting)`: Create campaign narrative
- `makeHuggingFaceRequest(prompt, options)`: Direct API communication

#### Response Processing Flow:
```
Player Action → AI Processing → DM Evaluation → Response Display
     ↓              ↓               ↓              ↓
   Validation → HuggingFace → Quality Check → UI Update
```

### 🎲 dice.js - Dice System
**Purpose**: Dice rolling mechanics and turn-based gameplay
**Class**: `DiceSystem`
**Global Instance**: `window.diceSystem`

#### Key Responsibilities:
- Dice roll visualization and animation
- Turn-based roll management
- Dice type support (d4, d6, d8, d10, d12, d20, d100)
- Roll history tracking
- AI-requested roll detection

#### Turn Management:
- Each AI response starts a new turn
- Players can only roll once per turn (unless in test mode)
- Turn tracking prevents spam rolling
- Visual feedback for roll status

#### Critical Methods:
- `rollDice(sides, count)`: Execute dice rolls
- `startNewTurn()`: Initialize new turn
- `canRollDice()`: Check roll eligibility
- `detectAndShowDiceRequest(content)`: Parse AI responses for dice requests
- `showDiceDisplay(diceType)`: Display dice interface

### 🖥️ ui.js - User Interface Management
**Purpose**: UI interactions, modals, and display management
**Class**: `UIManager`
**Global Instance**: `window.uiManager`

#### Key Responsibilities:
- Modal system management
- Navigation and menu handling
- Settings interface
- Character sheet display
- Campaign log management
- Screen visibility management
- Toast notifications

#### Modal System:
- Settings modal with audio/display/AI preferences
- Character sheet modal with stats and progression
- Campaign log modal with story history
- DM evaluation modal with quality metrics

#### Critical Methods:
- `openModal(modalId)` / `closeModal(modalId)`: Modal management
- `setupNavigation()`: Bind navigation events
- `saveSettings()`: Persist user preferences
- `updateCharacterDisplay()`: Refresh character information
- `ensureScreenVisibility()`: Fix blank screen issues

### 🔊 audio.js - Audio System
**Purpose**: Background music and sound effects
**Class**: `AudioManager`
**Global Instance**: `window.audioManager`

#### Key Responsibilities:
- Web Audio API management
- Background music playback
- Sound effect triggering
- Volume and preference management
- User interaction-based initialization

#### Audio Features:
- Procedural background music generation
- Dice roll sound effects
- UI interaction sounds
- Campaign-specific ambient music
- Volume controls and muting

#### Critical Methods:
- `init()`: Initialize Web Audio API
- `startBackgroundMusic()`: Begin ambient music
- `playSFX(type)`: Trigger sound effects
- `updateSettings(settings)`: Apply audio preferences
- `generateTone(frequency, duration)`: Create procedural sounds

### 📊 dmEvaluator.js - AI Quality Assessment
**Purpose**: Evaluate and improve AI response quality
**Class**: `DMEvaluator`
**Global Instance**: Created by `AIManager`

#### Key Responsibilities:
- AI response quality scoring
- Feedback generation for improvement
- Response history tracking
- Quality criteria evaluation

#### Evaluation Criteria:
- **Immersion & Atmosphere** (25%): Sensory details and world-building
- **DM Personality** (20%): Human-like warmth and enthusiasm
- **Player Engagement** (20%): Concrete events and story development
- **Narrative Flow** (15%): Pacing and coherence
- **D&D Authenticity** (10%): Rules knowledge and terminology
- **Creative Flair** (10%): Unexpected twists and memorable elements

#### Critical Methods:
- `evaluateResponse(response, context)`: Score AI responses
- `generateFeedback(scores)`: Create improvement suggestions
- `getStats()`: Retrieve evaluation statistics
- `addToHistory(evaluation)`: Track response history

### 🎛️ evaluationUI.js - Evaluation Interface
**Purpose**: Display DM evaluation metrics and controls
**Class**: `EvaluationUI`
**Global Instance**: `window.evaluationUI`

#### Key Responsibilities:
- Evaluation statistics display
- Quality metric visualization
- Evaluation control toggles
- Recent evaluation history

#### UI Components:
- Overall DM score display
- Individual criteria breakdowns
- Toggle switches for evaluation/auto-improvement
- Recent evaluation history list
- Performance trend indicators

### 🔧 utils.js - Utility Functions
**Purpose**: Common helper functions and utilities
**Global Functions**: Available globally

#### Key Utilities:
- `randomInt(min, max)`: Random number generation
- `generateId(prefix)`: Unique ID creation
- `deepClone(obj)`: Object deep cloning
- `debounce(func, wait)`: Function debouncing
- `throttle(func, limit)`: Function throttling
- `getAbilityModifier(score)`: D&D ability modifier calculation

#### Additional Features:
- JSON parsing with fallbacks
- String manipulation helpers
- Performance optimization functions
- D&D-specific calculations
- Event handling utilities

### ⚙️ config.js - Configuration
**Purpose**: Application configuration constants
**Global Object**: `window.AI_CONFIG`

#### Configuration Options:
```javascript
const AI_CONFIG = {
    USE_HUGGINGFACE: true,
    HUGGINGFACE_MODELS: [
        'microsoft/DialoGPT-large',
        'microsoft/DialoGPT-medium',
        'gpt2-large',
        'gpt2',
        'microsoft/DialoGPT-small',
        'distilgpt2'
    ],
    USE_SIMPLE_AI: true,
    USE_MOCK_FALLBACK: true
};
```

### 📄 huggingfaceAI.js
**Status**: Empty file (functionality integrated into ai.js)
**Purpose**: Originally intended for separate HuggingFace integration

## 🎨 CSS Architecture

### 🏠 main.css - Core Styles
**Purpose**: Primary application styling and layout
**Features**:
- Dark theme with purple/cyan accents
- Grid-based layouts
- Animation definitions
- Modal styling
- Loading screen animations

### 👤 character.css - Character Interface
**Purpose**: Character creation and sheet styling
**Features**:
- Multi-step creation wizard
- Stat allocation interfaces
- Character class displays
- Campaign setting cards

### 🎲 dice.css - Dice System Styles
**Purpose**: Dice rolling interface and animations
**Features**:
- Dice animation effects
- Roll result displays
- Turn feedback indicators
- Dice type visualizations

### 📊 evaluation.css - Evaluation Interface
**Purpose**: DM evaluation system styling
**Features**:
- Score displays and progress bars
- Criteria breakdown layouts
- Evaluation history styling
- Toggle switch designs

### 📱 responsive.css - Mobile Support
**Purpose**: Mobile and tablet responsive design
**Features**:
- Responsive breakpoints
- Touch-friendly interfaces
- Mobile-optimized layouts
- Tablet-specific adjustments

## 🔄 System Interactions and Data Flow

### Initialization Sequence
```
1. DOM Ready → main.js loads
2. main.js creates DiceTalesApp instance
3. waitForDOM() ensures DOM is ready
4. initializeSystems() validates all managers
5. setupEventHandlers() binds global events
6. checkExistingGame() determines startup flow
7. Show appropriate screen (character creation or game)
```

### Character Creation Flow
```
1. characterManager.showCharacterCreation()
2. Multi-step wizard: Setting → Class → Stats → Details
3. Character validation and creation
4. Event: 'character:created' → main.js
5. main.js calls startNewCampaign()
6. Transition to game screen
7. aiManager.startCampaign() begins story
```

### Gameplay Loop
```
1. AI generates story/response
2. diceSystem detects dice requests
3. Player takes action (text input or dice roll)
4. uiManager processes input
5. aiManager generates response
6. dmEvaluator scores response quality
7. Display updated story and await next action
```

### State Management Flow
```
User Action → UI Update → gameState.set() → Auto-save → localStorage
     ↑                                                        ↓
Game Load ← gameState.load() ← localStorage ← Page Refresh
```

### Event Bus System
The application uses a global event bus for inter-system communication:

```javascript
// Event emissions
eventBus.emit('character:created', characterData);
eventBus.emit('campaign:start', campaignData);
eventBus.emit('dice:rolled', rollData);
eventBus.emit('ai:response', responseData);

// Event listeners
eventBus.on('character:created', (data) => { /* handle */ });
eventBus.on('gameState:changed', (data) => { /* handle */ });
```

## 🔧 Development Patterns

### Error Handling Strategy
- Graceful degradation for missing systems
- Fallback UIs when managers fail to load
- Recovery mechanisms for critical failures
- Comprehensive logging for debugging

### Performance Optimizations
- Debounced user input handling
- Throttled UI updates
- Efficient state management
- Lazy loading of non-critical systems

### Modularity Design
- Each system is self-contained
- Clear interfaces between systems
- Event-driven communication
- Minimal global dependencies

This architecture provides a robust, maintainable foundation for the DiceTales RPG adventure game while ensuring smooth user experience and developer-friendly code organization.
